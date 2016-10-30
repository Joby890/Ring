let instance;

const loader = () => {
  const result = {};
  result.load = (pm) => {
    console.log("loader.load", pm);
  };
  return result;
};

const pm = require("./PluginManager");

const Ring = (dirname, newLoader) => {

  const result = {};
  const load = newLoader && newLoader("") || loader("");
  const pluginManager = pm(result, dirname,load);

  result.getPluginManager = function() {
    return pluginManager;
  };
  
  result.Result = pm.Result;
  
  result.registerEvent = pluginManager.registerEvent.bind(pluginManager);
  result.fireEvent = pluginManager.fireEvent.bind(pluginManager);
  
  result.addMethod = function(method, name) {
    result[name || method.name] = method;
  };

  return result;

};

Ring.getDefault = () => {
  if(!instance) {
    throw new Error("Ring not setup");
  }
  return instance;
};

Ring.getRing = Ring.ring = (dirname, loader) => {
  if(!instance) {
    instance = Ring(dirname || "./", loader);
  }
  return instance;
};


module.exports.Ring = Ring;
