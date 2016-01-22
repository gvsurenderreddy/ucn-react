var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');

//all requests to /stats will go here...
router.use(function(req, res, next) {
    if (!req.user) {
    	 return res.redirect("/ucn/auth/login");
    }
    next();
});


router.get('/browsing', function(req,res,next){
	var deviceid = req.query.id;
	var hourbin = 60*60;
	pgdb.stats_top_urls_for_device(deviceid, hourbin).then(function(urls){
  		res.send(urls);
  	});
});

module.exports = router;
