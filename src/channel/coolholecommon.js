var ChannelModule = require("./module");

function CoolholeCommonModule(_channel) {
    ChannelModule.apply(this, arguments);
    this.supportsDirtyCheck = false;
}

CoolholeCommonModule.prototype = Object.create(ChannelModule.prototype);

/**
 * Sets up common objects to be used by other coolhole modules.
 * @param {Object} user user who sent the chat message
 * @param {Object} data data input from user
 * @param {Object} msgobj message object about to be sent out to clients
 */ 
CoolholeCommonModule.prototype.coolholePostUserProcessMessage = function(user, data, msgobj) {
    msgobj.meta.coolholeMeta = {
        otherClasses: []
    }
    return true;
}

module.exports = CoolholeCommonModule;