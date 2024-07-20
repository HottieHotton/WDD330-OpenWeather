import {
  getJSON,
  handleSearchEvent,
  fetchWeatherAPI,
  getLocalStorage,
  setLocalStorage
} from "./utils.mjs";

const key = import.meta.env.VITE_OPENWEATHER_KEY;
const button = document.querySelector(".testAPI");
let lat, long;
let previousWidthState = "";

document.addEventListener("DOMContentLoaded", async () => {
  const defaultValue = "Seattle, US";
  await weatherAPI(defaultValue);
  await newRequests();
});

async function newRequests() {
  let data = await handleSearchEvent();
  try {
    await weatherAPI(data);
  } catch (error) {
    let recent = await getLocalStorage("searchList")
    recent.pop()
    await setLocalStorage("searchList", recent);
    let lastValue = recent[recent.length - 1];
    await weatherAPI(lastValue)
  }
}

async function loadHistory(){
  let section = document.querySelector(".history");
  let response = await getLocalStorage("searchList") || [];
  if(response.length >= 1){
    response.splice(-5).forEach((list) =>{
      let h4 = document.createElement("h4");
      h4.innerHTML = `${list}`;
      section.append(h4);
    });
  }
}

async function weatherAPI(search) {
  let location = search.split(", ");
  let city = location[0];
  let country = location[1];
  let data = await getJSON(city, country);
  if (window.innerWidth > 600) {
    createWeatherWidget(data);
    await loadHistory();
  } else {
    lat = data.coord.lat;
    long = data.coord.lon;
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    const currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let response = await fetchWeatherAPI(url, currenturl);
    const week = response[0];
    const current = response[1];
    displayResults(week, current);
    await loadHistory();
  }
}

function createWeatherWidget(data) {
  const widgetContainer = document.getElementById("openweathermap-widget-1");
  if (widgetContainer) {
    widgetContainer.innerHTML = "";
  }
  const newWidgetParam = [
    {
      id: 1,
      cityid: data.id,
      appid: key,
      units: "imperial",
      containerid: "openweathermap-widget-1",
    },
  ];
  const title = document.querySelector(".cityTitle");
  title.innerHTML = `Weather for ${data.name}, ${data.country}`;

  window.myWidgetParam = newWidgetParam;

  const script = document.createElement("script");
  script.async = true;
  script.charset = "utf-8";
  script.src =
    "//openweathermap.org/themes/openweathermap/assets/vendor/owm/js/weather-widget-generator.js";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(script, s);
}

button.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    if (window.innerWidth > 600) {
      const geo = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
      let result = await fetchWeatherAPI(geo);
      let city = result[0].name;
      let country = result[0].country;
      let data = await getJSON(city, country);
      createWeatherWidget(data);
    } else {
      const geo = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
      let result = await fetchWeatherAPI(geo);
      let city = result[0].name;
      let country = result[0].country;
      let jsonData = await getJSON(city, country);
      lat = jsonData.coord.lat;
      long = jsonData.coord.lon;
      url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
      currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
      let data = await fetchWeatherAPI(url, currenturl);
      const week = data[0];
      const current = data[1];
      displayResults(week, current);
    }

    //For Mutli-name cities, will need to fix string to remove space and add - instead for API purposes
    //#2 feature
    //#3 feature
    //#4 feature
    // const getCoordsInUS = `http://api.openweathermap.org/geo/1.0/direct?q=${cityLink},${state},${country}&appid=${key}&units=imperial`;
    //#5 feature
    // const getCoords = `http://api.openweathermap.org/geo/1.0/direct?q=${cityGB},${countryGB}&appid=${key}&units=imperial`;
    //#6 feature
    // const currentPollution = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
    //#7 feature
    // const forecastPollution = `http://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}`;
  });
});

function displayResults(data, day) {
  const div = document.querySelector(".forecast");
  div.innerHTML = "";
  const todaydate = new Date(day.dt * 1000);
  const nameofday = todaydate.toLocaleString("en-US", { weekday: "short" });
  let todaytemp = Math.round(day.main.temp);
  const title = document.querySelector(".cityTitle");
  title.innerHTML = `Weather for ${data.city.name}, ${data.city.country}`;
  div.innerHTML += `
          <div class="card">
              <h4 class="card-header">${nameofday} (Current)</h4>
              <section class="card-body">
                  <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" loading="lazy">
                  <p>${todaytemp}&deg;F with ${day.weather[0].description}.</p>
              </section>
          </div>
      `;

  const filteredData = data.list
    .filter((item) => item.dt_txt.includes("21:00:00"))
    .slice(0, 4);
  filteredData.forEach((dayData) => {
    const date = new Date(dayData.dt_txt);
    const dayOfWeek = date.toLocaleString("en-US", { weekday: "short" });

    let temp = Math.round(dayData.main.temp);
    div.innerHTML += `
          <div class="card">
              <h4 class="card-header">${dayOfWeek}</h4>
              <section class="card-body">
                  <img src="https://openweathermap.org/img/wn/${dayData.weather[0].icon}.png" alt="${dayData.weather[0].description}" loading="lazy">
                  <p>${temp}&deg;F with ${dayData.weather[0].description}.</p>
              </section>
          </div>
      `;
  });
}

// Set up the resize event listener with debounce
async function handleResize() {
  let widget = document.querySelector("#openweathermap-widget-1");
  let api = document.querySelector(".forecast");

  if (window.innerWidth > 700 && previousWidthState !== "wide") {
    previousWidthState = "wide";
    widget.style.display = "block";
    api.style.display = "none";
    let recent = (await getLocalStorage("searchList")) || "Seattle, US";
    if (Array.isArray(recent)) {
      recent = recent[recent.length - 1];
    }
    let [city, country] = recent.split(", ");
    let jsonData = await getJSON(city, country);
    await createWeatherWidget(jsonData);
  } 
  if (window.innerWidth <= 700 && previousWidthState != "narrow") {
    previousWidthState = "narrow";
    widget.style.display = "none";
    api.style.display = "block";

    let recent = (await getLocalStorage("searchList")) || "Seattle, US";
    if (Array.isArray(recent)) {
      recent = recent[recent.length - 1];
    }
    let [city, country] = recent.split(", ");
    let jsonData = await getJSON(city, country);
    lat = jsonData.coord.lat;
    long = jsonData.coord.lon;
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let data = await fetchWeatherAPI(url, currenturl);
    const week = data[0];
    const current = data[1];
    displayResults(week, current);
  }
}

window.addEventListener("resize", async () => await handleResize());

handleResize();