var http = require('http');
var express = require('express');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var bodyparser = require('body-parser');
var hbs = require('hbs');
var db = require('./db');
var pgdb = require('./pgdb');
var User 	= require('./models/User');
var Device = require('./models/Device');
var passport = require('passport');
var app = express();

//set up middleware to support POSTs
app.use(bodyparser.urlencoded({extended:false}));
app.use(bodyparser.json());


//statically served content from the static dir
app.use('/viz/', express.static("static"));

//set the template engine to jade
app.set('view engine', 'jade');

app.engine('html', hbs.__express);
var server = http.createServer(app);

//set up session management
const hour = 3600000;
app.use(session({secret: 'VikyowyogBocHatAckdi', 
		 cookie: { maxAge: hour},
		 store: new RedisStore()
}));

//set up authentication
//passport.use('local', User.localStrategy);
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);
app.use(passport.initialize());
app.use(passport.session());

app.use('/viz/movescallback', require('./routes/moves'));

// main (authenticated) routes
app.use('/viz/admin/', require('./routes/vizadmin'));
app.use('/viz', require('./routes/viz'));

server.listen(8001);
