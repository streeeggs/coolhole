// TODO: figure out what to do with this module
// it serves a very niche use case and is only a core module because of
// legacy reasons (early channels requested it before I had criteria
// around what to include in core)
var ChannelModule = require("./module");

function DrinkModule(_channel) {
  ChannelModule.apply(this, arguments);
  this.drinks = 0;
}

DrinkModule.prototype = Object.create(ChannelModule.prototype);

DrinkModule.prototype.onUserPostJoin = function (user) {
  user.socket.emit("drinkCount", this.drinks);
  this.channel.modules.chat.registerCommand(
    "/drink",
    this.handleDrink.bind(this)
  );
};

// Coolhole Addition: Needed to allow for other commands that start with /d so made this it's own "command" /drink
DrinkModule.prototype.handleDrink = function (user, msg) {
  const perms = this.channel.modules.permissions;
  if (perms.canCallDrink(user)) {
    let [_, command, count, message] = [
      ...msg.matchAll(/(drink)\s*(\d+)?(.*)/gi),
    ][0];
    count = count ? parseInt(count) : 1;
    if (isNaN(count) || count < -10000 || count > 10000) {
      return;
    }

    message = message.trim();
    if (count > 1) {
      message += " drink! (x" + count + ")";
    } else {
      message = message.trim() + " drink!";
    }

    this.drinks += count;
    this.channel.broadcastAll("drinkCount", this.drinks);
    this.channel.modules.chat.processChatMsg(user, {
      msg: message,
      meta: { addClass: "drink", forceShowName: true },
    });
    //cb(null, ChannelModule.PASSTHROUGH);
  }
};

DrinkModule.prototype.onMediaChange = function () {
  this.drinks = 0;
  this.channel.broadcastAll("drinkCount", 0);
};

module.exports = DrinkModule;
