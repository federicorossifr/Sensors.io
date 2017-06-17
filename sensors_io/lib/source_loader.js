var fs = require('fs');
var path = require("path");

module.exports = {
	cache:null,
	get: function(callback,force) {
		if(force || !this.cache)
			fs.readFile(path.join(__dirname,'../conf/sources.json'), 'utf8', function (err, data) {
			  if (err) throw err;
			  var sources = JSON.parse(data);
				this.cache = sources;
			  callback(sources);
			});
		else callback(this.cache);
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
