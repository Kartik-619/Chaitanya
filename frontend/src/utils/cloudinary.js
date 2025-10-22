const cloudName = 'dpe1pmwsv';

export const getOptimizedImageUrl = (publicId, options = {}) => {
  const {
    width = 'auto',
    height = 'auto',
    quality = 'auto',
    format = 'auto',
    crop = 'fill'
  } = options;

  const transformations = [
    `c_${crop}`,
    `w_${width}`,
    `h_${height}`,
    `q_${quality}`,
    `f_${format}`
  ].join(',');

  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
};

export const getLazyImageUrl = (publicId, options = {}) => {
  const baseOptions = {
    quality: 'auto:low',
    format: 'auto',
    ...options
  };
  
  return getOptimizedImageUrl(publicId, baseOptions);
};

export const getHighQualityUrl = (publicId, options = {}) => {
  const baseOptions = {
    quality: 'auto:best',
    format: 'auto',
    ...options
  };
  
  return getOptimizedImageUrl(publicId, baseOptions);
};