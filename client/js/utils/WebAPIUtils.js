var request = require('superagent');
var ServerActionCreators = require('../actions/ServerActionCreators');

module.exports ={

  fetch_browsing: function(family) {
    request
      .get('/hv/browsing')
      .set('Accept', 'application/json')
      .query({family:family})
      .end(function(err, res){
        if (err){
          console.log(err);
        }else{
          ServerActionCreators.receiveBrowsingData(res.body);
         }
     });
  },

  fetch_urls: function(timerange) {

    request
      .get('/hv/urls')
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
  }
}
