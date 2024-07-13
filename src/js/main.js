const key = import.meta.env.VITE_OPENWEATHER_KEY;
let lat, long;

const button = document.querySelector(".testAPI");

button.addEventListener("click", () => {
    //#1 feature
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      lat = position.coords.latitude;
      long = position.coords.longitude;
      //SEE CONSOLE LOG FOR YOUR LOCATION AS IT WILL BE IMPORTANT IN THE LINKS BELOW
      console.log("Lat: ", lat)
      console.log("Long: ", long)
      //For Mutli-name cities, will need to fix string to remove space and add - instead for API purposes
      let city = "West-Jordan";
      let cityGB = "London"
      //Will need to make optional and determine where what endpoint I need to point to
      let state = "Utah";
      let country = "US";
      let countryGB = "GB"
      //#2 feature
      const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
      //#3 feature
      const currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
      //#4 feature
      const getCoordsInUS = `http://api.openweathermap.org/geo/1.0/direct?q=${city},${state},${country}&appid=${key}&units=imperial`;
      //#5 feature
      const getCoords = `http://api.openweathermap.org/geo/1.0/direct?q=${cityGB},${countryGB}&appid=${key}&units=imperial`;
      //#6 feature
      const currentPollution = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
      //#7 feature
      const forecastPollution = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}`;

    // Killing these logs for key protection as it's required in the URL, but can confirm that these word on the base desire
    //   console.log("Forecast URL:", url);
    //   console.log("Current Weather URL:", currenturl);
    //   console.log("get Coords in US: ", getCoordsInUS);
    //   console.log("get Coords: ", getCoords);
    //   console.log("Current Pollution: ", currentPollution);
    //   console.log("Forecast Pollution: ", forecastPollution);


      //#8 Feature
      try {
        // Fetch the local JSON file
        const response = await fetch("json/city.list.json");
        const cityData = await response.json();

        // Find the city by coordinates
        const cityId = findCityIdByCoordinates(cityData, lat, long);
        if (cityId) {
          console.log("City ID:", cityId);
          //This is what makes this feature #8
          createWeatherWidget(cityId);
        } else {
          console.error("City not found in the JSON file.");
        }
      } catch (error) {
        console.error(
          "Error fetching or processing the city list JSON file:",
          error,
        );
      }
    },
    (error) => {
      console.error("Error getting geolocation:", error);
    },
  );
});

// eslint-disable-next-line no-shadow
function findCityIdByCoordinates(cityData, lat, long) {
  // Consider doing this by finding CityId by City Name
  for (const city of cityData) {
    if (
      Math.abs(city.coord.lat - lat) < 0.1 &&
      Math.abs(city.coord.lon - long) < 0.1
    ) {
      return city.id;
    }
  }
  return null;
}

function createWeatherWidget(cityId) {
  window.myWidgetParam = window.myWidgetParam || [];
  window.myWidgetParam.push({
    id: 11,
    cityid: cityId,
    appid: key,
    units: "imperial",
    containerid: "openweathermap-widget-11",
  });

  const script = document.createElement("script");
  script.async = true;
  script.src =
    "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
  document.body.appendChild(script);
}
