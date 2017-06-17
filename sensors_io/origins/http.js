var fs = require('fs');
var path = require('path');
var request = require('request');
var Promise = require("bluebird");

function deferredResult() {
    var resolve, reject;
    var promise = new Promise(function() {
        resolve = arguments[0];
        reject = arguments[1];
    });
    return {
        resolve: resolve,
        reject: reject,
        promise: promise
    };
}

var statPromise = function(path) {
	return new Promise((resolve,reject)=> {
		fs.stat(path,(error,stats) => {
			if(error) reject(error);
			else resolve(stats);
		});
	});
}


module.exports = {
		fetch: function(httpOptions) {
			var result = deferredResult();
			fs.stat(httpOptions.localPath,(error,stats) => {
				var headReq = request.head(httpOptions.url);
				headReq.on("response",res=> {
					if(error || res.headers["last-modified"] >= stats.mtime) {
						var req = request(httpOptions.url);
						req.on('response',res => {
							if(!(res.statusCode == 200)) return;
							var dest = fs.createWriteStream(httpOptions.localPath);
							dest.on("finish",done=> {
								result.resolve({notUpdated:false,message:'Updated'});
							});
							res.pipe(dest);
						});				
					} else {
						result.resolve({notUpdated:true,message:'Not updated'});
					}
				});

			})
			return result;
		}
}