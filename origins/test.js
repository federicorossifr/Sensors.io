var request = require("request");


var r = request.head("http://samplecsvs.s3.amazonaws.com/TechCrunchcontinentalUSA.csv");
r.on("response",res=> {
	console.log(res.headers);


})