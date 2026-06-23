import ChannelModule from "./module";
const LOGGER = require("@calzoneman/jsli")("weather-module");
const util = require("../utilities");
const Flags = require("../flags");

class CoolholeWeather extends ChannelModule {
  constructor(_channel) {
    super(_channel);

    ChannelModule.apply(this, arguments);

    LOGGER.info("hello Bitch.");
  }
}

module.exports = CoolholeWeather;
