var fs = require("fs");
var path = require("path");
var loader = {
  load: function() {
    //Load task that run at intervals
    fs.readdir(path.join(__dirname,"../tasks/interval"),(error,tasks) => {
      for(var i in tasks) {
        var task = require(path.join(__dirname,"../tasks/interval",tasks[i]));
        console.log("[TASK LOADER] Task loaded: "+task.name);
        setInterval(task.execute.bind(task),task.interval);
      }
    });
  }
}

module.exports = loader;
