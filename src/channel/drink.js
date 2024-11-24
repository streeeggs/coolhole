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

// Coolhole Addition: Needed to allow for other commands that start with /d
DrinkModule.prototype.handleDrink = function (user, data, cb) {
  var msg = data.msg;
  var perms = this.channel.modules.permissions;
  if (perms.canCallDrink(user)) {
    msg = msg.substring(2);
    var m = msg.match(/^(-?[0-9]+)/);
    var count;
    if (m) {
      count = parseInt(m[1]);
      if (isNaN(count) || count < -10000 || count > 10000) {
        return;
      }

      msg = msg.replace(m[1], "").trim();
      if (msg || count > 0) {
        msg += " drink! (x" + count + ")";
      } else {
        this.drinks += count;
        this.channel.broadcastAll("drinkCount", this.drinks);
        return cb(null, ChannelModule.DENY);
      }
    } else {
      msg = msg.trim() + " drink!";
      count = 1;
    }

    this.drinks += count;
    this.channel.broadcastAll("drinkCount", this.drinks);
    data.msg = msg;
    data.meta.addClass = "drink";
    data.meta.forceShowName = true;
    this.channel.modules.chat.processChatMsg(user, data);
    //cb(null, ChannelModule.PASSTHROUGH);
  }
};

DrinkModule.prototype.onMediaChange = function () {
  this.drinks = 0;
  this.channel.broadcastAll("drinkCount", 0);
};

module.exports = DrinkModule;
