//Entry point /api/sensors/
var express = require('express');
var router = express.Router();
var path = require("path");
var moment = require("moment");
var xml = require('xml');
var chart = require('../sensors_io/lib/chart');
var sourceManager = require("../sensors_io/lib/source_loader");
var abs_sensor = require("../sensors_io/lib/abstract_sensor");

router.get('/',function(req,res,next) {
  var safeSources = [];
  for(var i in req.sources) {
    safeSources.push(sourceManager.getSourcePublicMembers(req.sources[i]));
  }
  res.json(safeSources);
});

router.use('/:name',function(req,res,next) {
	req.source = req.sources[req.params.name];
  next();
});

router.get('/:name', function(req, res, next) {
    var safeSource = sourceManager.getSourcePublicMembers(req.source);
    res.json(safeSource);
});


router.get('/:name/data',function(req,res,next) {
  abs_sensor.acquireFactory(req.source).acquireAll().then(data => res.json(data));
})

router.get("/:name/data/:query/json",function(req,res,next) {
  abs_sensor.acquireFactory(req.source).acquireQuery(req.params.query).then(data => {
    res.json(data);
  });
});

router.get("/:name/data/:query/plot/:fields",function(req,res,next) {
	var fields = req.params.fields.split("&");
  abs_sensor.acquireFactory(req.source).plot(req.params.query,fields).then(buffer => {
    res.contentType('png');
    res.end(buffer,'binary');
  });
});

module.exports = router;
