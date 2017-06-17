var express = require('express');
var router = express.Router();
var rp = require("request-promise");
var Promise = require("bluebird");
var chart = require("../sensors_io/lib/chart");
var abstract_sensor = require("../sensors_io/lib/abstract_sensor");

router.use("/",function(req,res,next) {
	req.queryBody = JSON.parse(req.query.q);
	abstract_sensor.aggregateAcquire(req.queryBody,req.sources).then(results => {
		res.aggregate = results;
		next();
	})
});

router.get("/plot",function(req,res,next) {
	var datasets = [];
	for(var i in res.aggregate) {
		var fields = req.queryBody[i].fields.split('&');
		datasets = datasets.concat(chart.normalizeData(res.aggregate[i],fields,req.sources[i].timestamp_field));
	}
	chart.timedPlot(datasets).then(buffer=>{
		res.contentType('png');
  	res.end(buffer,'binary');
	});
});

module.exports = router;
