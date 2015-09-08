var app = require('../app');
var mongoose = require('mongoose');

mongoose.connect(app.get('mongouri'), function(err) {
    if (err) throw err;
    debug('Connected to ' + app.get('mongouri'));
});

module.exports = exports = mongoose;                                  