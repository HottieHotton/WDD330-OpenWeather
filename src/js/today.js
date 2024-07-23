import {
  getJSON,
  handleSearchEvent,
  fetchWeatherAPI,
  getLocalStorage,
  setLocalStorage,
  loadHistory
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
    let recent = await getLocalStorage("searchList");
    recent.pop();
    await setLocalStorage("searchList", recent);
    let lastValue = recent[recent.length - 1];
    await weatherAPI(lastValue);
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
    const pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
    const currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let response = await fetchWeatherAPI(pollutionUrl, currenturl);
    const pollution = response[0];
    const current = response[1];
    displayResults(current, pollution);
    await loadHistory();
  }
}

function createWeatherWidget(data) {
  const widgetContainer = document.getElementById("openweathermap-widget-5");
  if (widgetContainer) {
    widgetContainer.innerHTML = "";
  }
  const newWidgetParam = [
    {
      id: 5,
      cityid: data.id,
      appid: key,
      units: "imperial",
      containerid: "openweathermap-widget-5",
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
    let pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
    let currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    if (window.innerWidth > 600) {
      const geo = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
      let result = await fetchWeatherAPI(geo);
      let city = result[0].name;
      let country = result[0].country;
      let data = await getJSON(city, country);
      createWeatherWidget(data);
    } else {
      const geo = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
      let result = await fetchWeatherAPI(geo);
      let city = result[0].name;
      let country = result[0].country;
      let jsonData = await getJSON(city, country);
      lat = jsonData.coord.lat;
      long = jsonData.coord.lon;
      pollutionUrl = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
      currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
      let data = await fetchWeatherAPI(pollutionUrl, currenturl);
      const pollution = data[0];
      const current = data[1];
      displayResults(current, pollution);
    }
  });
});

function displayResults(day, pollution) {
  const pollute = document.querySelector(".pollution");
  pollute.innerHTML = "";
  if (day != null) {
    const div = document.querySelector(".forecast");
    div.innerHTML = "";
    const todaydate = new Date(day.dt * 1000);
    const nameofday = todaydate.toLocaleString("en-US", { weekday: "short" });
    let todaytemp = Math.round(day.main.temp);
    const title = document.querySelector(".cityTitle");
    title.innerHTML = `Today's Weather for ${day.name}, ${day.sys.country}`;
    div.innerHTML += `
          <div class="card">
              <h3 class="card-header">${nameofday} (Current)</h3>
              <section class="card-body">
                  <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}.png" alt="${day.weather[0].description}" loading="lazy">
                  <p>${todaytemp}&deg;F with ${day.weather[0].description}.</p>
              </section>
          </div>
      `;
  }
  pollute.innerHTML += `
      <div class="card">
          <section class="card-body">
              <h3>Air Quality Index (AQI): <br>${pollution.list[0].main.aqi}</h3>
              <p><strong>NOTE: µg/m³ means micrograms per cubic meter.</strong></p>
              <p><strong>CO (Carbon Monoxide):</strong> ${pollution.list[0].components.co} µg/m³<br>High levels can reduce oxygen in the bloodstream.</p>
              <p><strong>NO (Nitric Oxide):</strong> ${pollution.list[0].components.no} µg/m³<br>Can cause respiratory issues at high concentrations.</p>
              <p><strong>NO2 (Nitrogen Dioxide):</strong> ${pollution.list[0].components.no2} µg/m³<br>Long-term exposure can decrease lung function.</p>
              <p><strong>O3 (Ozone):</strong> ${pollution.list[0].components.o3} µg/m³<br>High levels can cause respiratory problems and reduce lung function.</p>
              <p><strong>SO2 (Sulfur Dioxide):</strong> ${pollution.list[0].components.so2} µg/m³<br>Can cause throat and eye irritation, coughing, and shortness of breath.</p>
              <p><strong>PM2.5 (Particulate Matter <2.5 µm):</strong> ${pollution.list[0].components.pm2_5} µg/m³<br>Fine particles can cause cardiovascular and respiratory diseases.</p>
              <p><strong>PM10 (Particulate Matter <10 µm):</strong> ${pollution.list[0].components.pm10} µg/m³<br>Inhalable particles can affect the respiratory system.</p>
              <p><strong>NH3 (Ammonia):</strong> ${pollution.list[0].components.nh3} µg/m³<br>High levels can irritate the eyes, nose, and throat.</p>
          </section>
      </div>
  `;
}

async function handleResize() {
  let widget = document.querySelector("#openweathermap-widget-5");
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
    lat = jsonData.coord.lat;
    long = jsonData.coord.lon;
    let url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
    let result = await fetchWeatherAPI(url);
    await displayResults(null, result)
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
    let url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${long}&appid=${key}`;
    let currenturl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let data = await fetchWeatherAPI(url, currenturl);
    const pollution = data[0];
    const current = data[1];
    displayResults(current, pollution);
  }
}

window.addEventListener("resize", async () => await handleResize());

handleResize();
