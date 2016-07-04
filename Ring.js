let instance;

const Ring = (dirname) => {

  const result = {};
  const pluginManager = require("./PluginManager")(result, dirname);

  result.getPluginManager = function() {
    return pluginManager;
  };

  return result;

};

Ring.getRing = Ring.ring = (dirname) => {
  if(instance) {
    return  instance;
  }
  instance = Ring(dirname || "./");
  return instance;
};


module.exports = Ring;
