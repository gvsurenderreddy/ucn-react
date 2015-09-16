var db = require('../mgdb');

/** Device JSON schema.
 * 
 *  The device type should be one of [ipad, iphone, macbook, imac, windows-pc, 
 *  linux-pc, linux-laptop, windows-laptop, android-phone, android-tablet]
 *
 *  Devices can connect to the OpenVPN tunnel using login (which is just 
 *  username.devname) and the password associated to username 
 *  (see User schema). 
 *
 *  Devices with defined 'removed', should not be able to login.
 */
var DeviceSchema = new db.Schema({
    login : {type:String, required: true, unique: true},
    username : {type:String, required: true, unique: false},
    devname : {type:String, required: true, unique: false},
    type : {type:String, required: true, unique: false},
    usage : {type:String, required: true, unique: false},
    created: {type:Date, default: Date.now},
    removed: {type:Date, required: false},

    vpn_udp_ip : {type:String, required: true, unique: true},
    vpn_tcp_ip : {type:String, required: true, unique: true},
    vpn_ipsec_ip : {type:String, required: true, unique: true},
    vpn_mask : {type:String, required: true, unique: false},
    
    // android or win activity logger info
    loggerapp_uuid : {type:String, required: false},
    loggerapp_lastseen: {type:Date, required: false},
    loggerapp_uploads : {type:Number, required: false, default :0},

    // browser addon info
    browseraddon_uuid : {type:String, required: false},
    browseraddon_lastseen: {type:Date, required: false},
    browseraddon_uploads : {type:Number, required: false, default :0},

    // openvpn auth script stats
    vpn_auths : {type:Number, default : 0, required: true},
    vpn_auth_failures : {type:Number, default : 0, required: true},
    vpn_connections : {type:Number, default : 0, required: true},
    vpn_disconnections : {type:Number, default : 0, required: true},
    vpn_bytes_sent : {type:Number, default : 0, required: true},
    vpn_bytes_recv : {type:Number, default : 0, required: true},
    vpn_last_seen: {type:Date, required: false},

    inactivity_notif_sent : {type:Boolean, default : false},
});

/** Device. */
DeviceSchema.statics.findDeviceByLogin = function(login, cb) {
    return require('./Device').findOneAsync({login : login}, cb);
};

/** Device list. */
DeviceSchema.statics.findDevicesForUser = function(username, cb) {
    return require('./Device').findAsync({username : username}, cb);
};

/** All devices list. */
DeviceSchema.statics.findAllDevices = function(cb) {
    require('./Device').find({}, cb);
};

var model = db.model('Device', DeviceSchema);
exports = module.exports = model;