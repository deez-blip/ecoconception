import PropType from 'prop-types';
import React, { useState } from 'react';

const loadedImages = {};

const ImageLoader = ({
  src,
  alt,
  className,
  loading,
  decoding,
  fetchPriority,
  srcSet,
  sizes,
  width,
  height
}) => {
  const [loaded, setLoaded] = useState(loadedImages[src]);

  const onLoad = () => {
    loadedImages[src] = true;
    setLoaded(true);
  };

  return (
    <>
      {!loaded && (
        <span style={{
          width: '18px',
          height: '18px',
          border: '2px solid #d9d9d9',
          borderTopColor: '#111',
          borderRadius: '50%',
          display: 'inline-block',
          position: 'absolute', top: 0, bottom: 0, right: 0, left: 0, margin: 'auto'
        }}
        />
      )}
      <img
        alt={alt || ''}
        className={`${className || ''} ${loaded ? 'is-img-loaded' : 'is-img-loading'}`}
        decoding={decoding}
        fetchPriority={fetchPriority}
        height={height}
        loading={loading}
        onLoad={onLoad}
        sizes={sizes}
        src={src}
        srcSet={srcSet}
        width={width}
      />
    </>
  );
};

ImageLoader.defaultProps = {
  alt: '',
  className: 'image-loader',
  loading: 'lazy',
  decoding: 'async',
  fetchPriority: 'auto',
  srcSet: undefined,
  sizes: undefined,
  width: undefined,
  height: undefined
};

ImageLoader.propTypes = {
  src: PropType.string.isRequired,
  alt: PropType.string,
  className: PropType.string,
  loading: PropType.oneOf(['eager', 'lazy']),
  decoding: PropType.oneOf(['sync', 'async', 'auto']),
  fetchPriority: PropType.oneOf(['high', 'low', 'auto']),
  srcSet: PropType.string,
  sizes: PropType.string,
  width: PropType.number,
  height: PropType.number
};

export default ImageLoader;
