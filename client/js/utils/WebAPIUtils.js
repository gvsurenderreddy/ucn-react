var request = require('superagent');
var extend = require('extend');

var ServerActionCreators = require('../actions/ServerActionCreators');

var REDIRECT = "/ucn/auth/login";
var _netaccess = false;

var params = location.search.substring(1).split('&').reduce(function(acc, pair){
    var nv = pair.split("=");
    acc[nv[0]]=nv[1];
    return acc;
},{});

module.exports ={

  accessing_network: function(){
  	return _netaccess;
  },
  
  fetch_browsing: function(family, devices) {
  	
  	var data = {
  		devices: devices,
  		family:  family,
  	}    
	
  	if (_netaccess)
  		return;
  	_netaccess=true;	
    request
      .post('/viz/browsing')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
    	   console.log(res.body);
    	   ServerActionCreators.receivedBrowsingData(res.body);
    	   
        }
     });
  },

  fetch_browsing_range: function(family, devices, range) {
   	
   	var data = {
  		devices: devices,
  		family: family,
  		from: range.from,
  		to: range.to,
  	}    
  	
   	if (_netaccess)
  		return;
  	_netaccess=true;
  	
    request
      .post('/viz/browsing')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res){
      	_netaccess = false;
      	
        if (err){
          console.log(err);
        }else{
			if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
    	  		ServerActionCreators.receivedZoomedInData(res.body);
    	  	}
        }
     });
  
  },
  
  
  fetch_browsing_in_location: function(family, devices, lat, lng){
  	var data = {
  		devices: devices,
  		family: family,
  		lat:lat,
  		lng:lng,
  	}    
  	
  	if (_netaccess)
  		return;
  	_netaccess=true;
   	request
      .post('/viz/browsinginlocation')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res){
      	_netaccess = false;
      	
        if (err){
          console.log(err);
        }else{
			if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
    	  		console.log(res.body);
    	  		//ServerActionCreators.receivedBrowsingData(res.body);
    	  	}
        }
     });
  },
  
 
  fetch_activity: function(family, devices) {
  
  	
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
    request
      .get('/viz/activity')
      .set('Accept', 'application/json')
      .query(params)
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
          		ServerActionCreators.receivedActivityData(res.body);
          	}
         }
     });
  },
  
  fetch_locations: function(devices) {
  
  	if (_netaccess)
  		return;
  	_netaccess=true;
    request
      .post('/viz/location')
      .set('Accept', 'application/json')
      .send({devices:devices})
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
          		ServerActionCreators.receivedLocationData(res.body);
         	}
         }
     });
  },
  
  /*fetch_update: function(timerange){
  	request
      .get('/viz/update')
      .set('Accept', 'application/json')
      .query(extend(timerange,params))
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          console.log("great - got some new update data!");
          //update data is the new urls data and the newly binned browsing data!
          ServerActionCreators.receivedUpdateData(res.body);
         }
     });
  },*/
  
   /*
  fetch_browsing_range: function(range) {
  	console.log("fetching browsing range!!!");
    request
      .get('/viz/browsing')
      .set('Accept', 'application/json')
      .query(extend(range,params))
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
    	  console.log("ok got some data");
    	  console.log(res.body);
    	  ServerActionCreators.receivedZoomedInData(res.body);
        }
     });
  
  },
  
  fetch_urls: function(timerange) {

    request
      .get('/viz/urls')
      .set('Accept', 'application/json')
      .query(extend(timerange,params))
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          console.log("great - got some new url data!");
          ServerActionCreators.receivedURLData(res.body);
         }
     });
  },*/

  fetch_unclassified: function(selected){
  	 if (_netaccess)
  		return;
  	 _netaccess=true;
  	 var data = {
  		devices: selected,
  	 }
  	 
  	 request
      .post('/viz/urls/unclassified')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
         	 	ServerActionCreators.receivedUnclassified(res.body);
         	 }
        }
     });
  },
  
  fetch_category_data: function(selected, classifier){
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
  	var data = {
  		devices: selected,
  	}
  	if (classifier){
  		data.classifier = classifier;
  	}
  	
    request
      .post('/viz/categories')
      .set('Accept', 'application/json')
      .send(data)
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log("hmm errror");
          console.log(err);
        }else{
          
          	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
          		ServerActionCreators.receivedCategoryData(res.body);
          	}
        }
     });
  },

  //this needs to be called with device, family!
  fetch_url_history: function(devices, url) {
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
  	var data = {
  		url:url,
  		devices: devices,
  	}

    request
      .post('/viz/urls/history')
      .set('Accept', 'application/json')
      .send(data)
      //.query(extend({url:url},params))
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
          		ServerActionCreators.receivedURLHistoryData(res.body);
          	}
        }
     });
  },

  
  match_categories: function(partial){
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
    request
      .get('/viz/categories/match')
      .set('Accept', 'application/json')
      .query({partial:partial})
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
         	 	ServerActionCreators.receivedCategoryMatches(res.body);
         	}
        }
     });
  },

  match_urls: function(partial){
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
    request
      .get('/viz/urls/match')
      .set('Accept', 'application/json')
      .query(extend({partial:partial},params))
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
        	if (res.body == null){
				window.location.replace(REDIRECT);
			}else{
          		ServerActionCreators.receivedURLMatches(res.body);
          	}
        }
     });
  },
  
  categorise: function(obj){
  	if (_netaccess)
  		return;
  	_netaccess=true;
  	
    request
      .post('/viz/categories/categorise')
      .send(extend(obj,params))
      .set('Accept', 'application/json')
      .type('json')
      .end(function(err, res){
      	_netaccess = false;
        if (err){
          console.log(err);
        }else{
          console.log(res.body);
          if (res.body == null){
				window.location.replace(REDIRECT);
		  }else{
          	ServerActionCreators.receivedCategoryData(res.body);
          }
        }
     });
  },
};
