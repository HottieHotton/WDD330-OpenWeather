import {
  handleSearchEvent,
  getJSON,
  fetchWeatherAPI,
  getLocalStorage,
  setLocalStorage,
  loadHistory
} from "./utils.mjs";
const key = import.meta.env.VITE_OPENWEATHER_KEY;
const button = document.querySelector(".testAPI");
let lat, long;

document.addEventListener("DOMContentLoaded", async () => {
  let recent = (await getLocalStorage("searchList")) || "Seattle, US";
  if (Array.isArray(recent)) {
    recent = recent[recent.length - 1];
  }
  await weatherAPI(recent);
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
  lat = data.coord.lat;
  long = data.coord.lon;
  const url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
  const geo = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
  let response = await fetchWeatherAPI(url, geo);
  const pollute = response[0];
  const name = response[1];
  displayResults(pollute, name);
  await loadHistory();
}

button.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    let url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    const geo = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
    let result = await fetchWeatherAPI(geo);
    let city = result[0].name;
    let country = result[0].country;
    let jsonData = await getJSON(city, country);
    lat = jsonData.coord.lat;
    long = jsonData.coord.lon;
    url = `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let response = await fetchWeatherAPI(url);
    const pollute = response;
    const name = result[0];
    displayResults(pollute, name);
  });
});

function displayResults(data, dataName) {
  const div = document.querySelector(".airPollution");
  div.innerHTML = "";
  const title = document.querySelector(".cityTitle");
  title.innerHTML = `Pollution Forecast for ${dataName[0].name}, ${dataName[0].country}<br><p><strong>NOTE: µg/m³ means micrograms per cubic meter.</strong></p>`;
  const filteredData = data.list.filter((item) => {
    const date = new Date(item.dt * 1000);
    return date.getHours() === 9;
  });
  filteredData.forEach((pollution) => {
    const date = new Date(pollution.dt * 1000);
    const dayOfWeek = date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    div.innerHTML += `
      <div class="card">
        <h4 class="card-header">${dayOfWeek}</h4>
          <section class="card-body">
              <h3>Air Quality Index (AQI): <br>${pollution.main.aqi}</h3>
              <p><strong>CO (Carbon Monoxide):</strong> ${pollution.components.co} µg/m³<br>High levels can reduce oxygen in the bloodstream.</p>
              <p><strong>NO (Nitric Oxide):</strong> ${pollution.components.no} µg/m³<br>Can cause respiratory issues at high concentrations.</p>
              <p><strong>NO2 (Nitrogen Dioxide):</strong> ${pollution.components.no2} µg/m³<br>Long-term exposure can decrease lung function.</p>
              <p><strong>O3 (Ozone):</strong> ${pollution.components.o3} µg/m³<br>High levels can cause respiratory problems and reduce lung function.</p>
              <p><strong>SO2 (Sulfur Dioxide):</strong> ${pollution.components.so2} µg/m³<br>Can cause throat and eye irritation, coughing, and shortness of breath.</p>
              <p><strong>PM2.5 (Particulate Matter <2.5 µm):</strong> ${pollution.components.pm2_5} µg/m³<br>Fine particles can cause cardiovascular and respiratory diseases.</p>
              <p><strong>PM10 (Particulate Matter <10 µm):</strong> ${pollution.components.pm10} µg/m³<br>Inhalable particles can affect the respiratory system.</p>
              <p><strong>NH3 (Ammonia):</strong> ${pollution.components.nh3} µg/m³<br>High levels can irritate the eyes, nose, and throat.</p>
          </section>
      </div>
  `;
  });
}
