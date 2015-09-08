var mongoose = require('mongoose');
var Promise = require("bluebird");

mongoose.connect('mongodb://localhost/ucnexp2', function(err) {
    if (err) throw err;
    console.log("successfully connected to mongo")
});

module.exports = exports = Promise.promisifyAll(mongoose);                                  