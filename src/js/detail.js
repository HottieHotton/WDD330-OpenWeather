import {
  handleSearchEvent,
  getJSON,
  fetchWeatherAPI,
  getLocalStorage,
  setLocalStorage,
  loadHistory,
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
  // eslint-disable-next-line no-constant-condition
  while (true) {
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
}

async function weatherAPI(search) {
  let location = search.split(", ");
  let city = location[0];
  let country = location[1];
  let data = await getJSON(city, country);
  lat = data.coord.lat;
  long = data.coord.lon;
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
  let response = await fetchWeatherAPI(url);
  displayResults(response);
  await loadHistory();
}

button.addEventListener("click", () => {
  navigator.geolocation.getCurrentPosition(async (position) => {
    lat = position.coords.latitude;
    long = position.coords.longitude;
    let url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    const geo = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${long}&appid=${key}`;
    let result = await fetchWeatherAPI(geo);
    let city = result[0].name;
    let country = result[0].country;
    let jsonData = await getJSON(city, country);
    lat = jsonData.coord.lat;
    long = jsonData.coord.lon;
    url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&appid=${key}&units=imperial`;
    let data = await fetchWeatherAPI(url);
    displayResults(data);
  });
});

function displayResults(data) {
  const div = document.querySelector(".detailedForecast");
  div.innerHTML = "";
  const title = document.querySelector(".cityTitle");
  title.innerHTML = `Detailed Weather for ${data.city.name}, ${data.city.country}`;

  const filteredData = data.list.splice(0, 9);
  filteredData.forEach((dayData) => {
    const date = new Date(dayData.dt_txt);
    const dayOfWeek = date.toLocaleString("en-US", { hour12: true });

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
