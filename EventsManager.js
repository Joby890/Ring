class EventsManager {
  constructor(HolderType) {
    this.HolderType = HolderType;
    this.events = {};
    this.next = 0;
  }
  
  registerEvent(holder, name, callback, priority) {
    if( (! (holder instanceof this.HolderType)) && holder !== null ) {
      throw new Error("First arg needs to be a holder or null value");
    }
    if(!this.events[name]) {
      this.events[name] = [];
    }
    if(!priority) {
      priority = 3;
    }
    var event = this.events[name];
    var id = ++this.next;
    event.push({priority: priority, callback: callback.bind(holder), holder: holder, id: id});
    event.sort(function(a,b) {
      return a.priority - b.priority;
    });
    return id;

  }  
  
  fireEvent(name, args, finished) {
    var event = this.events[name];
    var e = new Event(name, args);
    e.Results = Result;
    if(event) {
      var index = -1;
      var length = event.length;
      var done = function() {
        index++;
        if(index !== length) {
          if(event[index].callback.length === 1) {
            event[index].callback(e);
            done();
          } else if (finished) {
            event[index].callback(e, done);
          } else {
            console.log("Caution asyc event listener on sync fire. Event will not wait");
            event[index].callback(e, () => {});
            done();
          }
        } else {
          if(finished) {
            finished(e);
          }
        }
      };
      done();
    }
    finished && finished(e);
    return e;

  }
}


class Event {
  constructor(name, args) {
    this.name = name;
    this.result = Result.default;
    for(var key in args) {
      this[key] = args[key];
    }
  }
}

class Result {

  constructor(name, id) {
    this.name = name;
    this.id = id;
  }

  set(to) {
    if(typeof to === "string") {
      to = to.toUpperCase();
      if(to === "DEFAULT") {
        return Result.states[1];
      } else if(to === "ALLOW") {
        return Result.states[2];
      } else if(to === "DENY") {
        return Result.states[0];
      }
    } else if(typeof to === 'number') {
      var state = Result.states[to];
      return state || this.state;
    }
  }
}

var deny = new Result("DENY",0);
var allow = new Result("ALLOW", 2);
var def = new Result("DEFAULT", 1);

Result.states = {
  "0":  deny,
  "1":  def,
  "2":  allow,
  "default": def,
  "allow": allow,
  "deny": deny,
};

Result.default = def;
Result.deny = deny;
Result.allow = allow;

module.exports = EventsManager;
module.exports.Result = Result;
