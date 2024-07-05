import ChannelModule from './module'

/**
 * @param {Object} _channel 
 */
class CoolholeCommonModule extends ChannelModule{
    constructor(_channel) {
        super(_channel);
    }

    /**
    * This contains logic for certain coolhole chat features, such as calculating golds, processing debt effects, spending cp, etc.
    * Called in chat module, just before sending the msgobj out to clients.
    * @param {Object} channel channel
    * @param {Object} user user who sent the chat message
    * @param {Object} data original data input sent from the client
    * @param {Object} msgobj message object about to be sent out to clients
    * @returns {Object} resMsgObj a clone of msgobj with coolhole additions
    */
    coolholePostProcessChatMessage(channel, user, data, msgobj) {
        // Clone the msgobj. We are going to modify the clone instead of the original.
        let resMsgObj = JSON.parse(JSON.stringify(msgobj));
    
        // Create a coolholeMeta object
        resMsgObj.meta.coolholeMeta = this.createCoolholeMetaObject();
        if(resMsgObj.meta.coolholeMeta === undefined) 
            throw Error("Could not create coolholeMeta object.");
        
        // Calculate gold on chat message
        let isgold = channel.modules?.coolholegolds?.calculateGold(resMsgObj.msg);
        if(isgold) {
            resMsgObj.meta.coolholeMeta.otherClasses.push("text-lottery");
        }
    
        // return cloned object 
        return resMsgObj;
    }

    /**
    * Sets up a common object in chat messages for coolhole modules.
    * @returns {Object} coolholeMeta object
    */ 
    createCoolholeMetaObject() {
        return {
            otherClasses: [],
            deny: false
        }
    }
}

module.exports = CoolholeCommonModule;