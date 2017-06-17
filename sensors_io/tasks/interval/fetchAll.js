var loader = require("../../lib/source_loader.js");
var abstractSensor = require("../../lib/abstract_sensor.js");
var task = {
  'name':"Fetch all",
  'interval':60*1000*1,
  execute: function() {
    console.log("[SCHEDULED TASK] Executing task: "+this.name);
    loader.get(sources => {
      for(var i in sources)
        abstractSensor.acquireFactory(sources[i]).acquireAll(results => {
        });
    })
  }

}

module.exports=task;
