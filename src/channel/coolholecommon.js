var ChannelModule = require("./module");

/**
 * A coolhole module.
 * This module is for setting up common objects for other coolhole modules.
 * @param {Object} _channel 
 */
function CoolholeCommonModule(_channel) {
    ChannelModule.apply(this, arguments);
    this.supportsDirtyCheck = false;
}

CoolholeCommonModule.prototype = Object.create(ChannelModule.prototype);

/**
 * Sets up common objects in chat messages for other coolhole modules.
 * @param {Object} msgobj message object about to be sent out to clients
 * @returns always return true to let the chat message passthrough
 */ 
CoolholeCommonModule.prototype.setupCoolholeChatMsg = function(msgobj) {
    msgobj.meta.coolholeMeta = {
        otherClasses: []
    }
    return true;
}

module.exports = CoolholeCommonModule;