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

db.fetch_hosts();
app.get('/test', function(req,res){
  res.send("hello!!");
});

server.listen(8080);
