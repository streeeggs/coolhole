
/**
 * This file is additional functions/logic to make coolhole features work.
 * In general, we need to keep coolhole features out of cytube files as much as possible so the future merge conflicts are kept to a minimum.
 */

/**
 * Additional logic after the chat message div is created, but before its appended to the #messagebuffer, such as additional css classes.
 * @param {Object} data chat message object
 * @param {Object} last LASTCHAT object
 * @param {Jquery div} div jquery div object of the entire message
 * @param {Jquery span} time jquery span timestamp (if user preferences = do not show timestamp, this will be undefined)
 * @param {Jquery span} name jquery span name
 * @param {Jquery span} message jquery span message
 */
function coolholePostFormatMessage(data, last, div, time, name, message) {
    try {
        var timeText = time !== undefined ? time?.text()?.toLowerCase() : "";
        var chatText = message?.text()?.toLowerCase();
        var allText = timeText + name?.text()?.toLowerCase() + chatText;

        // add all text to title. This is so if the message dissappears (debt, shrink, etc), the user can still hover over the message to read it.
        div.prop("title", allText);

        // add only the message text to main div and chat div. This is to make some css classes easier to write (ie, european)
        div.attr("data-text", chatText);
        message.attr("data-text", chatText);

        // add other classes to the chat message
        data.meta.coolholeMeta?.otherClasses?.forEach(c => message.addClass(c));

    }
    catch(ex) {
        console.log(ex);
    }
}