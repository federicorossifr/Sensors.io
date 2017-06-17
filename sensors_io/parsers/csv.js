function typify(value,type) {
	var moment = require('moment');
    if(!type) return value;
	switch(type.toLowerCase()) {
		case 'double':
		case 'float': return parseFloat(value); break;
		case 'int':
		case 'integer': return parseInt(value); break;
		case 'timestamp': return moment(value); break;
		default: return value;
	}
}

module.exports = {
    parse: function(options) {
			return new Promise((resolve,reject) => {
        const fs = require('fs');
        var fastCsv = require("fast-csv");
        var path = require("path");
        var fileStream = fs.createReadStream(options.filename),
            parser = fastCsv();
        var result = {
            data:[],
            parseCount:0,
            headers:options.headers,
            types:options.types
        };
        fastCsv
            .fromStream(fileStream)
            .on("data", function (row) {
                result.parseCount++;
                if(options.hasHeaders && result.parseCount == options.headersLine) { //headers
                    result.headers = row;
                }
                if(result.parseCount>options.skipLines) { //data
                    var rowObj = {};
                    for(var i in result.headers)
                        rowObj[result.headers[i]] = typify(row[i],options.types[i]);
                    result.data.push(rowObj);
                }
            })
        .on("end", function () {
            result.parseCount-=options.skipLines;
            resolve(result);
        });
			});
    }
}
