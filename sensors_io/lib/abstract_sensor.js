var path = require("path");
var moment = require("moment");
var Promise = require("bluebird");
var chart = require("./chart");
var sensor = {
	sensorSingletons:{},

	acquireFactory: function(source) {
		var parser = require(path.join("../","parsers",source.parser));
	  	var fetcher = require(path.join("../","origins",source.origin));
	  	if(!this.sensorSingletons[source.name])

	 		this.sensorSingletons[source.name] = {
				sensorCache:null,
			    acquireAll: function(callback) {
						return new Promise((resolve,reject) => {
							fetcher.fetch(source.origin_options).promise.then(result => {
									if(source.cachable && result.success && result.notUpdated && this.sensorCache)
										resolve(this.sensorCache);
									else {
										parser.parse(source.parser_options).then(data => {
											data.source_name = source.name;
											data.geopos = source.geopos;
											data.timestamp_field = source.timestamp_field;
											if(source.cachable) {
												this.sensorCache = data;
											}
											resolve(data);
										})
									}
								});
						});
		    	},

			    acquireQuery: function(query) {
						return new Promise((resolve,reject) => {
				    	this.acquireAll().then(result => {
				    		var cloned = JSON.parse(JSON.stringify(result));
				  			var queries = query.split('&');
						  	for(var i in queries) {
							    var op = /(>t)?(<t)?[<,>,=]/g.exec(queries[i])[0];
							    queries[i] = queries[i].split(op);
							    switch(op) {
							      case '>': cloned.data = cloned.data.filter(obj => {return obj[queries[i][0]] > queries[i][1]}); break;
							      case '<': cloned.data = cloned.data.filter(obj => {return obj[queries[i][0]] < queries[i][1]}); break;
							      case '=': cloned.data = cloned.data.filter(obj => {return obj[queries[i][0]] == queries[i][1]}); break;
							      case '<t<': cloned.data = cloned.data.filter(obj => {return moment(obj[queries[i][0]]).isBefore(queries[i][1])}); break;
							      case '>t>': cloned.data = cloned.data.filter(obj => {return moment(obj[queries[i][0]]).isAfter(queries[i][1])}); break;
							      default: break;
							    }
								}
						  	cloned.matchCount = cloned.data.length;
						  	resolve(cloned);
							});
						});
			    },

			    plot: function(query,fields) {
						return new Promise((resolve,reject) => {
				    	this.acquireQuery(query).then(result => {
				    			var datasets = chart.normalizeData(result,fields,source.timestamp_field);
								var plotPromise = chart.timedPlot(datasets);
								plotPromise.then(buffer => resolve(buffer));
				    		});
						});
			    }
			}

		return this.sensorSingletons[source.name];
	},
	aggregateAcquire: function(queryBody,sources) {
		return new Promise((resolve,reject) => {
			acquirePromises = [];
			results = {};
			for(var sensor in queryBody) {
				var acqProm = this.acquireFactory(sources[sensor]).acquireQuery(queryBody[sensor].query)
				.then(result => {
					results[result.source_name] = result;
				});
				acquirePromises.push(acqProm);
			}
			Promise.all(acquirePromises).then(done => resolve(results));
		});
	}
}



module.exports = sensor;