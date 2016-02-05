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

router.get('/', function(req, res, next){
	//get and display all devices for this user
	console.log("ok here");
	res.render('stats')
});

router.get('/categories', function(req,res,next){
	var deviceid = req.query.id;
	pgdb.stats_categories_for_device(deviceid).then(function(categories){
		console.log("----- stats, sending ====");
    	console.log(categories);
  		res.send(categories);
  	});
});

router.get('/classify', function(req,res,next){
	var deviceid = req.query.id;
	pgdb.stats_classify(deviceid).then(function(classified){
  		res.send(classified);
  	});
});

router.get('/browsing', function(req,res,next){
	var deviceid = req.query.id;
	var hourbin = 60*60;
	pgdb.stats_top_urls_for_device(deviceid, hourbin).then(function(urls){
  		res.send(urls);
  	});
});


module.exports = router;
