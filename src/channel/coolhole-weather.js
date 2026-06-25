import ChannelModule from "./module";
const LOGGER = require("@calzoneman/jsli")("weather-module");
const util = require("../utilities");
const Flags = require("../flags");

const randomMinMax = (min, max) => Math.random() * (max - min) + min;
let currentHour = undefined;

//City library for weather API. These are magic, had to google the lat/long for API call, but we can switch these as desired.
function acquireCity() {
  const cities = [
    { name: "St Louis", lat: 38.6273, long: -90.1979 },
    { name: "Jerusalem", lat: 31.769, long: 35.2163 },
    { name: "Toronto", lat: 43.7001, long: -79.4163 },
    { name: "Tokyo", lat: 35.6895, long: 139.6917 },
    { name: "Dhaka", lat: 23.7104, long: 90.4074 },
    { name: "Sydney", lat: -33.8688, long: 151.2093 },
    { name: "Rio de Janeiro", lat: -22.9068, long: -43.1729 },
    { name: "Beijing", lat: 39.9042, long: 116.4074 },
    { name: "Mumbai", lat: 19.076, long: 72.8777 },
    { name: "Cairo", lat: 30.0444, long: 31.2357 },
    { name: "Singapore", lat: 1.3521, long: 103.8198 },
    { name: "Istanbul", lat: 41.0082, long: 28.9784 },
  ];
  let currentMonth = new Date().getMonth(); //doesnt need +1 here cause months are already done 0-11 through Date
  LOGGER.info(`City is ${cities[currentMonth].name}`);
  return cities[currentMonth]; //returns the city for that month. i.e, january = st louis, feb = jerusalem, etc.
}

//function that grabs rain data from the desired city via open-meteo API
async function acquireForecast() {
  const baseUrl = "https://api.open-meteo.com/v1/forecast?";
  const { lat, long } = acquireCity();
  const params = new URLSearchParams({
    latitude: lat,
    longitude: long,
    hourly: "precipitation_probability",
    forecast_days: 1,
  });
  const urlToCall = baseUrl + params.toString();
  const response = await fetch(urlToCall);
  const data = await response.json();
  LOGGER.info(`heres ur data: ${data.hourly.precipitation_probability}`);
  return data.hourly.precipitation_probability;
}

//function that rolls the dice for whether or not it will rain in a given hour.
function decideRain(rain_array) {
  let currentHour = new Date().getHours();
  let rainDecidingNumber = rain_array[currentHour - 1];
  let randomNumber = Math.floor(Math.random() * 100) + 1; //randomNumber between 1 and 100

  LOGGER.info(
    randomNumber,
    rainDecidingNumber,
    randomNumber <= rainDecidingNumber,
  ); //higher precip prob = higher rain chance on ch.

  if (randomNumber <= rainDecidingNumber) {
    createRain(rainDecidingNumber);
    LOGGER.info(
      randomNumber,
      rainDecidingNumber,
      randomNumber <= rainDecidingNumber,
    );
  } else {
    LOGGER.info("roll failed");
  }
}

function createCoin() {
  let coin = $("<div/>"); // Create the element as a jquery object but not drawn to the page yet
  coin.addClass("coin"); // Add the class "coin" to it
  coin.attr("id", self.crypto.randomUUID()); //give coins UUID to make things clean

  const animationDuration = randomMinMax(2000, 3000); // values chosen based on feeling
  coin.css("left", `${randomMinMax(1, 99)}vw`); // "left" says how far from the left and the unit vw is the current screen's "view width" (see first example here: https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Styling_basics/Values_and_units)

  coin.appendTo("#content"); // now actually draw the coin to the page

  // Create some objects for easier reading
  const animationOptions = {
    duration: animationDuration,
    fill: "forwards",
  };
  const keyframes = [
    { transform: "translateY(-10vh)" }, // Start position
    { transform: `translateY(110vh)` }, // End position in "vh" or view height. Confusingly, if you set this to %, it only falls 10% additionally 10px. This is because % takes the value respective of its parent.
  ];
  coin[0].addEventListener("mouseenter", collectCoin); // addEventListener expects a function to call. if you add () to the end of it, it'll actually call the function when this line gets hit instead of when the event fires
  coin[0].animate(keyframes, animationOptions);
  setTimeout(() => coin.remove(), animationDuration + 1000); //cleanup for uncollected coins.
}

function createRain(rainDecidingNumber) {
  let coinsToMake = Math.random() * rainDecidingNumber;
  let coinsMade = 0;
  LOGGER.info("creating rain");
  LOGGER.info(`coins to make: ${coinsToMake}`);
  let coinInterval = setInterval(() => {
    createCoin();
    coinsMade++;
    if (coinsMade >= coinsToMake) clearInterval(coinInterval);
  }, 100);
}

function collectCoin(collectedCoinEvent) {
  const collectedCoin = collectedCoinEvent.target; // the event has a target which tells you what you moused over
  const amount = 1.0;
  LOGGER.info(
    `Hooray! This user collected ${amount} CP on coin ${collectedCoin.id}`,
  );
  collectedCoin.remove();
}

//Consider: users in diff time zones will have non-synced rain, personally okay with this as it will add to coolhole mythos
async function main() {
  //to be called every hour. Day check happens once if the day changes between hourly checks
  try {
    const rainData = await acquireForecast();
    decideRain(rainData);
  } catch (err) {
    LOGGER.info("Failed to grab forecast:", err);
  }
}

class CoolholeWeather extends ChannelModule {
  constructor(_channel) {
    super(_channel);
    ChannelModule.apply(this, arguments);
    main();
  }
}

module.exports = CoolholeWeather;
