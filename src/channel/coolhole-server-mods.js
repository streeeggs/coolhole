/**
 * This file is additional functions/logic to make coolhole features work.
 * In general, we need to keep coolhole features out of cytube files as much as possible so the future merge conflicts are kept to a minimum.
 */

/**
 * This contains logic for certain coolhole chat features, such as calculating golds, processing debt effects, spending cp, etc.
 * Called in chat modules, just before sending the msgobj out to clients.
 * @param {Object} channel channel
 * @param {Object} user user who sent the chat message
 * @param {Object} data data input from user
 * @param {Object} msgobj message object about to be sent out to clients
 * @returns true = allow the chat message. False = deny the chat message.
 */
function coolholePostUserProcessMessage(channel, user, data, msgobj) {
    //check if all the relevant modules exist. If they don't, just allow the chat message to pass through
    if(channel.modules?.coolholecommon === undefined ||
       channel.modules?.coolholegolds === undefined) {
        return true;
    }

    var allow = true;
    allow = channel.modules.coolholecommon.coolholePostUserProcessMessage(user, data, msgobj);    
    if(allow)
        allow = channel.modules.coolholegolds.coolholePostUserProcessMessage(user, data, msgobj);

    if(allow)
        allow = channel.modules.coolholepoints.coolholePostUserProcessMessage(user, data, msgobj);

    return allow;
}


exports.coolholePostUserProcessMessage = coolholePostUserProcessMessage;