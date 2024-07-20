import {
  loadHeaderFooter,
} from "./utils.mjs";

const key = import.meta.env.VITE_OPENWEATHER_KEY;
let lat, long;

const button = document.querySelector(".testAPI");

// button.addEventListener("click", () => {
//   //#1 feature
//   navigator.geolocation.getCurrentPosition(async (position) => {
//     lat = position.coords.latitude;
//     long = position.coords.longitude;
//     //For Mutli-name cities, will need to fix string to remove space and add - instead for API purposes
//     //#2 feature
//     // const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
//     //#3 feature
//     // const currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
//     //#4 feature
//     // const getCoordsInUS = `http://api.openweathermap.org/geo/1.0/direct?q=${cityLink},${state},${country}&appid=${key}&units=imperial`;
//     //#5 feature
//     // const getCoords = `http://api.openweathermap.org/geo/1.0/direct?q=${cityGB},${countryGB}&appid=${key}&units=imperial`;
//     //#6 feature
//     // const currentPollution = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
//     //#7 feature
//     // const forecastPollution = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}`;
//   });
// });

// // eslint-disable-next-line no-shadow
// function findCityIdByName(cityData, city, country) {
//   // Consider doing this by finding CityId by City Name
//   for (const location of cityData) {
//     if (location.name.toLowerCase() == city.toLowerCase() && location.country.toLowerCase() == country.toLowerCase()) {
//       return location.id;
//     }
//   }
//   return null;
// }

// function createWeatherWidget(cityId) {
//   window.myWidgetParam ? window.myWidgetParam : window.myWidgetParam = [];
//   window.myWidgetParam.push({
//     id: 1,
//     cityid: cityId,
//     appid: key,
//     units: "imperial",
//     containerid: "openweathermap-widget-1",
//   });

//   const script = document.createElement("script");
//   script.async = true;
//   script.charset = "utf-8";
//   script.src =
//     "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
//   var s = document.getElementsByTagName("script")[0];
//   s.parentNode.insertBefore(script, s);
// }

async function init() {
  await loadHeaderFooter();
}

init();
