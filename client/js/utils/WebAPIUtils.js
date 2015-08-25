var request = require('superagent');
var ServerActionCreators = require('../actions/ServerActionCreators');

module.exports ={

  fetch_browsing: function(family) {
    request
      .get('/viz-dev/browsing')
      .set('Accept', 'application/json')
      .query({family:family})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receivedBrowsingData(res.body);
         }
     });
  },

  fetch_activity: function(family) {
    request
      .get('/viz-dev/activity')
      .set('Accept', 'application/json')
      .query({family:family})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receivedActivityData(res.body);
         }
     });
  },
  
  fetch_urls: function(timerange) {

    request
      .get('/viz-dev/urls')
      .set('Accept', 'application/json')
      .query(timerange)
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          console.log("great - got some new url data!");
          ServerActionCreators.receivedURLData(res.body);
         }
     });
  },

  fetch_url_history: function(url) {

    request
      .get('/viz-dev/urls/history')
      .set('Accept', 'application/json')
      .query({url:url})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receivedURLHistoryData(res.body);
         }
     });
  },

  fetch_category_data: function(){
    request
      .get('/viz/categories')
      .set('Accept', 'application/json')
      .end(function(err, res){
        if (err){
          console.log("hmm errror");
          console.log(err);
        }else{
          console.log("ok - firing receieved category data");
          ServerActionCreators.receivedCategoryData(res.body);
         }
     });
  },

  match_categories: function(partial){
    request
      .get('/viz/categories/match')
      .set('Accept', 'application/json')
      .query({partial:partial})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receivedCategoryMatches(res.body);
        }
     });
  },

  match_urls: function(partial){
    request
      .get('/viz/urls/match')
      .set('Accept', 'application/json')
      .query({partial:partial})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receivedURLMatches(res.body);
        }
     });

  },
};
