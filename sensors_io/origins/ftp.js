var fs = require('fs');
var path = require('path');
var ftp = require("ftp");
var Promise = require("bluebird");
var PromiseFtp = require("promise-ftp");

var existsPromise = function(path) {
	return new Promise((resolve,reject) => {
		fs.exists(path,resolve);
	});
}

var statPromise = function(path) {
	return new Promise((resolve,reject)=> {
		fs.stat(path,(error,stats) => {
			if(error) reject(error);
			else resolve(stats);
		});
	});
}

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

var fileFromStreamPromise = function(stream,path,defRes) {
	return new Promise((resolve,reject) => {
		stream.once("close",end => {
			defRes.resolve({notUpdated:false,message:'Updated'});
			resolve();
		});
		stream.once("error",reject);
		stream.pipe(fs.createWriteStream(path));
	});
}

module.exports = {
	fetch: function(options) {
		var client = new PromiseFtp();
		var remoteDate;
		var result = deferredResult();
		client.connect(options.connection)
			.then(done => {
				return client.lastMod(options.remotePath);
			}).then(rmDate => {
				rmDate = rmDate;
				return existsPromise(options.localPath);
			}).then(exists => {
				if(exists)
					statPromise(options.localPath)
						.then(stats => {
							if(remoteDate <= stats.mtime)
								{
									result.resolve({success:true,notUpdated:true,message:'Not updated'});
									return client.end();
								}
							else
								return client.get(options.remotePath)
									.then(stream => {
										return fileFromStreamPromise(stream,options.localPath,result)
									}).then(done => {client.end()})
					})
				else
					return client.get(options.remotePath)
						.then(stream => {
							return fileFromStreamPromise(stream,options.localPath,result);
						}).then(done => {client.end()})
		});
		return result;
	}
}
