var express = require('express');
var router = express.Router();


router.get("/",function(req,res,next) {
	res.render("index",{sources:req.sources});
});


router.get("/report/:reportName",function(req,res,next) {
	var reportName = (req.params.reportName) ? req.params.reportName:"default";
	req.queryBody = JSON.parse(req.query.q);
	res.render("reports/"+req.params.reportName,{query:req.queryBody});
});
module.exports = router;
