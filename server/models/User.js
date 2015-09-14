var db = require('../mgdb');

/** User JSON schema.
 *  
 *  The 'username' + 'password' are used to login to the portal. 
 *  The same password is also used for each device of this user 
 *  (see Device schema).
 *
 *  If the account is tagged as 'removed', all logins are disabled 
 *  (and passwd reminder will not work). Accounts can be removed 
 *  only by the admin.
 */
var UserSchema = new db.Schema({
    username: {type:String, required: true, unique: true},
    password: {type:String, required: true, unique: false},
    password_clr: {type:String, required: false, unique: false},
    email: {type:String, required: false, unique: true},
    familyname: {type:String, required: false, unique: false},
    isadmin: {type:Boolean, default : false, required: true},
    created: {type:Date, default: Date.now},
    updated: {type:Date, default: Date.now},
    removed: {type:Date, required: false},
    resetpasswdtoken: {type:String, required: false, unique: false}
});




UserSchema.statics.serializeUser = function(user, cb) {
    cb(null, user._id);
};

UserSchema.statics.deserializeUser = function(userid, cb) {
    require('./User').findById(userid, cb);
};

UserSchema.statics.findUserByName = function(username, cb) {
    require('./User').findOne({isadmin : false, username : username}, cb);
};

UserSchema.statics.findAllUsers = function(cb) {
    return require('./User').findAsync({isadmin : false}, cb);
};

UserSchema.statics.findAllUsersOfHouse = function(familyname, cb) {
    var User = require('./User');
    if (!familyname || familyname === 'none') {
    	// no familyname
    	User.find({isadmin : false, familyname : {$exists: false}}, cb);
    } else if (familyname === 'any') {
    	// any familyname
    	User.find({isadmin : false}, cb);
    } else {
    	// match familyname
    	User.find({isadmin : false, familyname : familyname}, cb);
    }
};

UserSchema.statics.findUniqueHouses = function(cb) {
    var User = require('./User');
    User.distinct('familyname', function(err, res) {
	if (res)
	    res = _.map(_.compact(res), function(h) { return { name : h}; });
    	cb(err,res);
    });
};

var model = db.model('User', UserSchema);
exports = module.exports = model;
