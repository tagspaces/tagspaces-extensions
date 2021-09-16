module.exports = {
  // The Webpack config to use when compiling your react app for development or production.
  webpack: function (config, env) {
    config.mode = 'development';
    config.optimization = {
      minimize: false,
    };
    return config;
  },
};
