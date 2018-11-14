var fs = require('fs');
var path = require("path");

module.exports = {
	cache:null,
	get: function(force) {
		return new Promise((resolve,reject) => {
		if(force || !this.cache)
			fs.readFile(path.join(__dirname,'../conf/sources.json'), 'utf8', function (err, data) {
			  if (err) throw err;
			  var sources = JSON.parse(data);
				this.cache = sources;
			  resolve(sources);
			});
			else resolve(this.cache);
		});
	},
	getSourcePublicMembers: function(source) {
		var public_source = {};
		var public_mask = source.public_mask;
		for(var i in public_mask) {
			var member = public_mask[i];
			public_source[member] = source[member];
		}
		return public_source;
	}
}
