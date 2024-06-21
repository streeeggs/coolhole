var ChannelModule = require("./module");

function CoolholeCommonModule(_channel) {
    ChannelModule.apply(this, arguments);
    this.supportsDirtyCheck = false;
}

CoolholeCommonModule.prototype = Object.create(ChannelModule.prototype);

/**
 * Native cytube hook called from cytube chat module.
 * Sets up common objects to be used by other coolhole modules.
 * @param {Object} user User object
 * @param {Object} data msg object
 * @param {function} cb callback to return ChannelModule.PASSTHROUGH back
 */ 
CoolholeCommonModule.prototype.onUserPreChat = function(user, data, cb) {
    data.meta.coolholemeta = {
        isGold: false
    }
    cb(null, ChannelModule.PASSTHROUGH);
}

module.exports = CoolholeCommonModule;