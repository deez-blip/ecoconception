import { Basket } from '@/components/basket';
import { Footer, Navigation, Preloader } from '@/components/common';
import * as ROUTES from '@/constants/routes';
import { createBrowserHistory } from 'history';
import React, { Suspense, lazy } from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import AdminRoute from './AdminRoute';
import ClientRoute from './ClientRoute';
import PublicRoute from './PublicRoute';

const Home = lazy(() => import('@/views/home'));
const Shop = lazy(() => import('@/views/shop'));
const Search = lazy(() => import('@/views/search'));
const FeaturedProducts = lazy(() => import('@/views/featured'));
const RecommendedProducts = lazy(() => import('@/views/recommended'));
const ViewProduct = lazy(() => import('@/views/view_product'));
const SignIn = lazy(() => import('@/views/auth/signin'));
const SignUp = lazy(() => import('@/views/auth/signup'));
const ForgotPassword = lazy(() => import('@/views/auth/forgot_password'));
const UserAccount = lazy(() => import('@/views/account/user_account'));
const EditAccount = lazy(() => import('@/views/account/edit_account'));
const CheckOutStep1 = lazy(() => import('@/views/checkout/step1'));
const CheckOutStep2 = lazy(() => import('@/views/checkout/step2'));
const CheckOutStep3 = lazy(() => import('@/views/checkout/step3'));
const Dashboard = lazy(() => import('@/views/admin/dashboard'));
const Products = lazy(() => import('@/views/admin/products'));
const AddProduct = lazy(() => import('@/views/admin/add_product'));
const EditProduct = lazy(() => import('@/views/admin/edit_product'));
const PageNotFound = lazy(() => import('@/views/error/PageNotFound'));

// Revert back to history v4.10.0 because
// v5.0 breaks navigation
export const history = createBrowserHistory();

const AppRouter = () => (
  <Router history={history}>
    <>
      <Navigation />
      <Basket />
      <Suspense fallback={<Preloader />}>
        <Switch>
          <Route
            component={Search}
            exact
            path={ROUTES.SEARCH}
          />
          <Route
            component={Home}
            exact
            path={ROUTES.HOME}
          />
          <Route
            component={Shop}
            exact
            path={ROUTES.SHOP}
          />
          <Route
            component={FeaturedProducts}
            exact
            path={ROUTES.FEATURED_PRODUCTS}
          />
          <Route
            component={RecommendedProducts}
            exact
            path={ROUTES.RECOMMENDED_PRODUCTS}
          />
          <PublicRoute
            component={SignUp}
            path={ROUTES.SIGNUP}
          />
          <PublicRoute
            component={SignIn}
            exact
            path={ROUTES.SIGNIN}
          />
          <PublicRoute
            component={ForgotPassword}
            path={ROUTES.FORGOT_PASSWORD}
          />
          <Route
            component={ViewProduct}
            path={ROUTES.VIEW_PRODUCT}
          />
          <ClientRoute
            component={UserAccount}
            exact
            path={ROUTES.ACCOUNT}
          />
          <ClientRoute
            component={EditAccount}
            exact
            path={ROUTES.ACCOUNT_EDIT}
          />
          <ClientRoute
            component={CheckOutStep1}
            path={ROUTES.CHECKOUT_STEP_1}
          />
          <ClientRoute
            component={CheckOutStep2}
            path={ROUTES.CHECKOUT_STEP_2}
          />
          <ClientRoute
            component={CheckOutStep3}
            path={ROUTES.CHECKOUT_STEP_3}
          />
          <AdminRoute
            component={Dashboard}
            exact
            path={ROUTES.ADMIN_DASHBOARD}
          />
          <AdminRoute
            component={Products}
            path={ROUTES.ADMIN_PRODUCTS}
          />
          <AdminRoute
            component={AddProduct}
            path={ROUTES.ADD_PRODUCT}
          />
          <AdminRoute
            component={EditProduct}
            path={`${ROUTES.EDIT_PRODUCT}/:id`}
          />
          <PublicRoute component={PageNotFound} />
        </Switch>
      </Suspense>
      <Footer />
    </>
  </Router>
);

export default AppRouter;
