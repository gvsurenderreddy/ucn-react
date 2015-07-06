var http = require('http');
var express = require('express');
var bodyparser = require('body-parser');
var hbs = require('hbs');
var db = require('./db');
var app = express();

//to support POSTs
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());
app.use('/', express.static("static"));
app.set('view engine', 'html');

app.engine('html', hbs.__express);
var server = http.createServer(app);

//db.fetch_hosts();

var hosts = ["10.2.0.6", "10.2.0.5", "10.1.0.6", "10.1.0.5"];

app.get('/hv/test', function(req, res){
  console.log("ok seen hv/test!");
  db.fetch_latest_ts_for_hosts(hosts).then(function(result){
      console.log("am here!!!");
      console.log(result);
      res.send("thanks");
  });
}),

/*app.get('/hv/browsing', function(req,res){

  console.log("ok seen hv browsing!");

  db.fetch_latest_ts_for_hosts(hosts).then(function(timerange){
    return timerange;
  }).then(function(timerange){
    return fetch_browsing_for_hosts(hosts, timerange.from, timerange.to)
  }).then(function(raw){
    var binned = util.binned(bin, raw['results'])
    res.send({
      raw    : raw,
      binned : binned,
    });
  });
});*/

server.listen(8080);
