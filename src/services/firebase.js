import { initializeApp } from 'firebase/app';
import {
  EmailAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged as onAuthStateChangeListener,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateEmail as updateFirebaseEmail,
  updatePassword
} from 'firebase/auth';
import {
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
  updateDoc,
  where,
  deleteDoc
} from 'firebase/firestore';
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from 'firebase/storage';
import firebaseConfig from './config';

class Firebase {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.storage = getStorage(this.app);
    this.db = getFirestore(this.app);
    this.auth = getAuthCompat(this.app);
  }

  // AUTH ACTIONS ------------

  createAccount = (email, password) =>
    createUserWithEmailAndPassword(this.auth.instance, email, password);

  signIn = (email, password) =>
    signInWithEmailAndPassword(this.auth.instance, email, password);

  signInWithGoogle = () =>
    signInWithPopup(this.auth.instance, new GoogleAuthProvider());

  signInWithFacebook = () =>
    signInWithPopup(this.auth.instance, new FacebookAuthProvider());

  signInWithGithub = () =>
    signInWithPopup(this.auth.instance, new GithubAuthProvider());

  signOut = () => signOut(this.auth.instance);

  passwordReset = (email) => sendPasswordResetEmail(this.auth.instance, email);

  addUser = (id, user) => setDoc(doc(this.db, 'users', id), user);

  getUser = (id) => getDoc(doc(this.db, 'users', id));

  passwordUpdate = (password) => updatePassword(this.auth.currentUser, password);

  changePassword = (currentPassword, newPassword) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;
          updatePassword(user, newPassword)
            .then(() => {
              resolve('Password updated successfully!');
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  reauthenticate = (currentPassword) => {
    const user = this.auth.currentUser;

    if (!user || !user.email) {
      return Promise.reject(new Error('No authenticated user found'));
    }

    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    return reauthenticateWithCredential(user, credential);
  };

  updateEmail = (currentPassword, newEmail) =>
    new Promise((resolve, reject) => {
      this.reauthenticate(currentPassword)
        .then(() => {
          const user = this.auth.currentUser;

          updateFirebaseEmail(user, newEmail)
            .then(() => {
              resolve('Email Successfully updated');
            })
            .catch((error) => reject(error));
        })
        .catch((error) => reject(error));
    });

  updateProfile = (id, updates) =>
    updateDoc(doc(this.db, 'users', id), updates);

  onAuthStateChanged = () =>
    new Promise((resolve, reject) => {
      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        unsubscribe();

        if (user) {
          resolve(user);
        } else {
          reject(new Error('Auth State Changed failed'));
        }
      });
    });

  saveBasketItems = (items, userId) =>
    updateDoc(doc(this.db, 'users', userId), { basket: items });

  setAuthPersistence = () =>
    setPersistence(this.auth.instance, browserLocalPersistence);

  // PRODUCT ACTIONS --------------

  getSingleProduct = (id) => getDoc(doc(this.db, 'products', id));

  getProducts = (lastRefKey) => {
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
        if (lastRefKey) {
          try {
            const afterKey = typeof lastRefKey === 'string' ? lastRefKey : lastRefKey.id;
            const productsRef = collection(this.db, 'products');
            const productsQuery = query(
              productsRef,
              orderBy(documentId()),
              startAfter(afterKey),
              limit(12)
            );

            const snapshot = await getDocs(productsQuery);
            const products = [];

            snapshot.forEach((item) => products.push({ id: item.id, ...item.data() }));
            const lastKey = snapshot.docs[snapshot.docs.length - 1] || null;

            resolve({ products, lastKey });
          } catch (e) {
            reject(e?.message || ':( Failed to fetch products.');
          }
        } else {
          const timeout = setTimeout(() => {
            didTimeout = true;
            reject(new Error('Request timeout, please try again'));
          }, 15000);

          try {
            const productsRef = collection(this.db, 'products');
            const totalQuery = await getDocs(productsRef);
            const total = totalQuery.docs.length;
            const productsQuery = query(
              productsRef,
              orderBy(documentId()),
              limit(12)
            );
            const snapshot = await getDocs(productsQuery);

            clearTimeout(timeout);
            if (!didTimeout) {
              const products = [];

              snapshot.forEach((item) => products.push({ id: item.id, ...item.data() }));
              const lastKey = snapshot.docs[snapshot.docs.length - 1] || null;

              resolve({ products, lastKey, total });
            }
          } catch (e) {
            if (didTimeout) return;
            reject(e?.message || ':( Failed to fetch products.');
          }
        }
      })();
    });
  };

  searchProducts = (searchKey) => {
    let didTimeout = false;

    return new Promise((resolve, reject) => {
      (async () => {
        const productsRef = collection(this.db, 'products');

        const timeout = setTimeout(() => {
          didTimeout = true;
          reject(new Error('Request timeout, please try again'));
        }, 15000);

        try {
          const searchedNameRef = query(
            productsRef,
            orderBy('name_lower'),
            where('name_lower', '>=', searchKey),
            where('name_lower', '<=', `${searchKey}\uf8ff`),
            limit(12)
          );
          const searchedKeywordsRef = query(
            productsRef,
            orderBy('dateAdded', 'desc'),
            where('keywords', 'array-contains-any', searchKey.split(' ')),
            limit(12)
          );

          const nameSnaps = await getDocs(searchedNameRef);
          const keywordsSnaps = await getDocs(searchedKeywordsRef);

          clearTimeout(timeout);
          if (!didTimeout) {
            const searchedNameProducts = [];
            const searchedKeywordsProducts = [];
            let lastKey = null;

            if (!nameSnaps.empty) {
              nameSnaps.forEach((item) => {
                searchedNameProducts.push({ id: item.id, ...item.data() });
              });
              lastKey = nameSnaps.docs[nameSnaps.docs.length - 1];
            }

            if (!keywordsSnaps.empty) {
              keywordsSnaps.forEach((item) => {
                searchedKeywordsProducts.push({ id: item.id, ...item.data() });
              });
            }

            const mergedProducts = [
              ...searchedNameProducts,
              ...searchedKeywordsProducts
            ];
            const hash = {};

            mergedProducts.forEach((product) => {
              hash[product.id] = product;
            });

            resolve({ products: Object.values(hash), lastKey });
          }
        } catch (e) {
          if (didTimeout) return;
          reject(e);
        }
      })();
    });
  };

  getFeaturedProducts = (itemsCount = 12) =>
    getDocs(
      query(
        collection(this.db, 'products'),
        where('isFeatured', '==', true),
        limit(itemsCount)
      )
    );

  getRecommendedProducts = (itemsCount = 12) =>
    getDocs(
      query(
        collection(this.db, 'products'),
        where('isRecommended', '==', true),
        limit(itemsCount)
      )
    );

  addProduct = (id, product) => setDoc(doc(this.db, 'products', id), product);

  generateKey = () => doc(collection(this.db, 'products')).id;

  storeImage = async (id, folder, imageFile) => {
    const storageRef = ref(this.storage, `${folder}/${id}`);
    const snapshot = await uploadBytes(storageRef, imageFile);

    return getDownloadURL(snapshot.ref);
  };

  deleteImage = (id) => deleteObject(ref(this.storage, `products/${id}`));

  editProduct = (id, updates) =>
    updateDoc(doc(this.db, 'products', id), updates);

  removeProduct = (id) => deleteDoc(doc(this.db, 'products', id));
}

const getAuthCompat = (app) => {
  const instance = getAuth(app);

  return {
    instance,
    get currentUser() {
      return instance.currentUser;
    },
    onAuthStateChanged(callback, onError, onComplete) {
      return onAuthStateChangeListener(instance, callback, onError, onComplete);
    }
  };
};

const firebaseInstance = new Firebase();

export default firebaseInstance;
