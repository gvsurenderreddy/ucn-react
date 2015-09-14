var express = require('express');
var router = express.Router();
var pgdb = require('../pgdb');
var User 	= require('../models/User');
var Device = require('../models/Device');

var SINCE = (365/2) * 24 * 60 * 60;

//all requests to /viz will go here...

router.use(function(req, res, next) {
	console.log(req.user);
    if (!req.user) {
    	 return res.redirect("/ucn/auth/login");
       /* var robj =  res.locals.renderobj;
        robj.loggedin = false;
        robj.error = res.__('error_not_authorized');
        return res.render('login', robj);*/
    }
    next();
});

router.get('/test', function(req, res, next) {
  var device = req.query.device;
  
  pgdb.fetch_max_ts_for_device(device).then(function(max){
  	  return max;	
	 
  }).then(function(max){
  	 return [max.ts, pgdb.fetch_min_ts_for_device(device, max.ts-SINCE)];
  }).spread(function(maxts, min){
  	 res.send({success:true, data:{from:maxts, to:min[0].ts}});
  });
});

router.get('/browsing', function(req,res, next){
  var device = req.query.device;
  
  pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  	return deviceid;
  })
  .then(function(deviceid){
  	
  	return [deviceid, pgdb.fetch_max_ts_for_device(deviceid)];
  })
  .spread(function(deviceid, max){
  
    return [deviceid, max.ts, pgdb.fetch_min_ts_for_device(deviceid, max.ts-SINCE)];
  })
  .spread(function(deviceid, maxts, min){
    var timerange = {from:min.ts, to:maxts};
    var bin = 60 * 60;
    return [bin,timerange,pgdb.fetch_binned_browsing_for_device(deviceid, bin, timerange.from, timerange.to)];
  })
  .spread(function(bin,timerange, binned){
    res.send({
      timerange: timerange,
      bin: bin,
      binned  : binned,
    });
  });
});

router.get('/activity', function(req,res, next){
  pgdb.fetch_max_ts_for_device(device).then(function(max){
    return [max.ts, pgdb.fetch_min_ts_for_device(device, max.ts-SINCE)];
  }).spread(function(maxts, min){
    var timerange = {from:min.ts, to:maxts};
  	return pgdb.fetch_activity_for_device(device, timerange.from, timerange.to);  
  }).then(function(data){
  	res.send(data);
  });	
});

router.get('/urls', function(req,res, next){

    var fromts = req.query.from;
    var tots = req.query.to;
    var device = req.query.device;
    
    pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
  		return pgdb.fetch_urls_for_device(deviceid, fromts, tots);
  	}).then(function(urls){
        res.send({
          urls:urls
        });
    });
});


router.get('/urls/history', function(req,res, next){
    var url = req.query.url;
    var device = req.query.device;
    
    pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
  		return pgdb.fetch_ts_for_url(deviceid, url)
  	}).then(function(ts){
        res.send({
          timestamps:ts
        });
    });
});

router.get('/categories', function(req,res, next){
	
	var device = req.query.device;
	
	pgdb.fetch_device_id_for_device(device).then(function(deviceid){
  		return deviceid;
  	}).then(function(deviceid){
    	return pgdb.fetch_categories_for_device(deviceid)
    }).then(function(categories){
        res.send(categories);
    });
});

//router.get('/viz/categories/match', function(req, res){
//   var partial = req.query.partial;
//   db.fetch_matching_categories(partial).then(function(categories){
//      res.send(categories);
//   });
//}),

//need to get hosts here...
//router.get('/viz/urls/match', function(req,res){
//   var partial = req.query.partial;
//   db.fetch_matching_categories_for_url(partial, hosts).then(function(categories){
//      res.send(categories);
//   });
//}),

module.exports = router;
