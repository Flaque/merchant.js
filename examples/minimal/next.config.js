module.exports = {
  webpack: config => {
    // Fixes npm packages that depend on `fs` module
    config.node = {
      fs: "empty"
    };

    config.plugins = config.plugins.filter(plugin => {
      if (plugin.constructor.name === "UglifyJsPlugin") {
        return false;
      } else {
        return true;
      }
    });

    return config;
  }
};
