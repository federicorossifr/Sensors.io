const ChartjsNode = require('chartjs-node');
var Promise = require("bluebird");
var mtz = require("moment-timezone");
var chartNode = new ChartjsNode(1920, 1080);
module.exports = {
  normalizeData: function(result,fields,timestampField) {
    var datasets = new Array(fields.length);
    for(var k in fields) {
      var r = (75+40*k)%256;
      var g = (192+40*k)%256;
      var b = (192+40*k)%256;
      datasets[k] = {
              fill: true,
              lineTension: 0.1,
              backgroundColor: "rgba(75,192,192,0.4)",
              borderColor: "rgba("+r+","+g+","+b+",1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba("+r+","+g+","+b+",1)",
              pointBackgroundColor: "rgba("+r+","+g+","+b+",1)",
              pointBorderWidth: 1,
              pointRadius: 3,
              pointHitRadius: 10,
              spanGaps: false,
          };
      datasets[k]['label']=fields[k];
      datasets[k]['data'] = [];
    }
    for(var j in result.data) {
      var ts = result.data[j][timestampField]
      for(var i in fields) {
        datasets[i].data.push({'x':ts,'y':result.data[j][fields[i]]});
      }
    }
    return datasets;
  },
  timedPlot: function(sensorData) {
    return new Promise((resolve,reject) => {
      chartNode.drawChart({
        type: 'line',
        data: {
                datasets: sensorData
        },
        options: {
          scales: {
              xAxes: [{
                  type: 'time',
                  position: 'bottom',
                  time: {
                      unit:"hour",
                      parser: function(time) {
                      	return mtz.tz(time,"Atlantic/Azores");
                      }
                  }
              }]
          }
        }
      })
      .then(() => {return chartNode.getImageStream('image/png');})
      .then(imageStream => {return chartNode.getImageBuffer('image/png');})
      .then(buffer => {resolve(buffer)});
    });
  }
}
