var http = require('http');
var express = require('express');
var bodyparser = require('body-parser');
var hbs = require('hbs');
var db = require('./db');
var util = require('./util');
var app = express();

//to support POSTs
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/hv/', express.static("static"));
app.set('view engine', 'html');

app.engine('html', hbs.__express);
var server = http.createServer(app);
var SINCE = (365/2) * 24 * 60 * 60;

var hosts = ["10.2.0.6", "10.2.0.5", "10.1.0.6", "10.1.0.5"];

app.get('/hv/test', function(req, res){
  db.fetch_latest_ts_for_hosts(hosts).then(function(result){
      res.send("thanks");
  });
}),

app.get('/hv/urls', function(req,res){

    var fromts = req.query.from;
    var tots = req.query.to;
    db.fetch_urls_for_hosts(hosts, fromts, tots).then(function(urls){
        res.send({
          urls:urls
        });
    });
}),

app.get('/hv/browsing', function(req,res){
  db.fetch_max_ts_for_hosts(hosts).then(function(max){
      return [max.ts, db.fetch_min_ts_for_hosts(hosts, max.ts-SINCE)];
  //db.fetch_latest_ts_for_hosts(hosts).then(function(to){
    //return {from:to.ts - AWEEKAGO, to:to.ts}
  }).spread(function(maxts, min){
    var timerange = {from:min.ts, to:maxts};
    var bin = 60 * 60;
    return [bin,timerange,db.fetch_binned_browsing_for_hosts(hosts, bin, timerange.from, timerange.to)]
  }).spread(function(bin,timerange, binned){
    res.send({
      timerange: timerange,
      bin: bin,
      binned  : binned,
    });
  });
});

server.listen(8080);
