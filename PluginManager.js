var _ = require('lodash');
var Events = require("./EventsManager");
class PluginManager {
  constructor(ring, dirname, loader) {
    this.events = new Events(Plugin);
    this.fireEvent = this.events.fireEvent.bind(this.events);
    this.registerEvent = this.events.registerEvent.bind(this.events);
    var plugins = [];    
    var amount;
    var self = this;
    this.addPlugin = function(module, data) {
      console.log("Loading: " + data.name);
      //Create the plugin instance
      var obj = new module(ring);
      //Build the default plugin
      var createPlugin = new Plugin(data.name, data.author, data.description);
      //combind the two
      _.extend(createPlugin, obj);
      self.enablePlugin(createPlugin);
      plugins.push(createPlugin);
      if(amount === plugins.length) {
        self.fireEvent("PluginsFinishedLoadingEvent", {});
      }
    };

    this.enablePlugin = function(plugin) {
      var event = this.fireEvent("PluginEnableEvent", {plugin: plugin});
      if(event.result === Result.deny) {
        console.log("PluginEnableEvent was denyed");
        return;
      }
      plugin.onEnable(this);
      plugin.setEnabled(true);
    };

    this.getPlugins = function() {
      return plugins;
    };

    this.disablePlugin = function(plugin) {
      var event = this.fireEvent("PluginDisableEvent", {plugin: plugin});
      if(event.result === Result.deny) {
        console.log("PluginDisableEvent was denyed");
        return;
      }
      console.log("Disabling " + plugin.name);
      plugin.onDisable && plugin.onDisable();
      plugin.setEnabled(false);
      this.unRegisterEvents(plugin);

    };

    this.getPlugin = function(name) {
      for(var i = 0; i < plugins.length; i++) {
        if(plugins[i].name === name) {
          return plugins[i];
        }
      }
    };
    loader && loader.load(this);
  }

  unRegisterEvents(plugin) {
    const rejectFunc = function(e) {
      return e.holder.name === plugin.name;
    };
    
    
    for(var key in this.events) {
      var events = this.events[key];
      this.events[key] = _.reject(events, rejectFunc);
    }
  }

  unRegisterEvent(id) {
    const filterFunc = function(e) {
        return e.id !== id;
    };
    for(var key in this.events) {
      var events = this.events[key];
      this.events[key] = _.filter(events, filterFunc);
    }
  }
}


class Plugin {
  constructor(name, author, description) {
    this.name = name;
    this.author = author;
    this.description = description;
    this.enabled = false;
  }

  isEnabled() {
    return this.enabled;
  }

  setEnabled(bool) {
    this.enabled = bool;
  }

}
module.exports = function(ring, dirname, loader) {
  return new PluginManager(ring, dirname, loader);
};
module.exports.Result = Events.Result;
