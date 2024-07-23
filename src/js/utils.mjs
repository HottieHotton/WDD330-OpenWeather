// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}

export function renderListWithTemplate(
  templateFn,
  parentElement,
  list,
  position = "afterbegin",
  clear = false,
) {
  const htmlStrings = list.map(templateFn);
  if (clear) {
    parentElement.innerHTML = "";
  }
  parentElement.insertAdjacentHTML(position, htmlStrings.join(""));
}

export function renderWithTemplate(template, parentElement, data, callback) {
  parentElement.insertAdjacentHTML("afterbegin", template);
  if (callback) {
    callback(data);
  }
}

export async function loadHeaderFooter() {
  const header = await loadTemplate("/partials/header.html");
  const footer = await loadTemplate("/partials/footer.html");

  const headerElement = document.querySelector("header");
  const footerElement = document.querySelector("footer");

  renderWithTemplate(header, headerElement);
  renderWithTemplate(footer, footerElement);
}

export async function loadTemplate(path) {
  const res = await fetch(path);
  const template = await res.text();
  return template;
}

// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export async function getJSON(city, country) {
  try {
    const response = await fetch("../json/city-list.json");
    const cityData = await response.json();
    const data = findCityIdByName(cityData, city, country);
    if (data) {
      return data;
    } else {
      window.alert("City not found in the JSON file.");
    }
  } catch (error) {
    console.error(
      "Error fetching or processing the city list JSON file:",
      error,
    );
    window.alert("Error fetching or processing the city list JSON file:",error)
  }
  (error) => {
    console.error("Error getting geolocation:", error);
    window.alert("Error getting geolocation:", error)
  };

  // eslint-disable-next-line no-shadow
  function findCityIdByName(cityData, city, country) {
    for (const location of cityData) {
      if (
        location.name.toLowerCase() == city.toLowerCase() &&
        location.country.toLowerCase() == country.toLowerCase()
      ) {
        return location;
      }
    }
    return null;
  }
}

export async function handleSearchEvent() {
  return new Promise((resolve) => {
    const searchForm = document.getElementById("searchForm");
    searchForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const search = document.getElementById("searchCall");
        let searchList = await getLocalStorage("searchList") || [];
        searchList.push(search.value);
        await setLocalStorage("searchList", searchList);
        resolve(search.value);
    }, { once: true });
});
}

export async function fetchWeatherAPI(...urls) {
  try {
      if (urls.length === 0 || urls.length > 4) {
          throw new Error("Invalid number of arguments. This function accepts between 1 and 4 URLs.");
      }

      const responses = await Promise.all(urls.map(url => fetch(url)));

      if (responses.every(response => response.ok)) {
          const data = await Promise.all(responses.map(response => response.json()));
          if(data.length > 1){
            return data;
          }else{
            let jsonData = data[0]
            return jsonData;
          }
      } else {
          const errorResponse = responses.find(response => !response.ok);
          throw new Error(await errorResponse.text());
      }
  } catch (error) {
      console.log(error);
  }
}


export async function loadHistory() {
  let section = document.querySelector(".history");
  let response = (await getLocalStorage("searchList")) || [];
  if (response.length >= 1) {
    section.innerHTML = "";
    response.splice(-5).forEach((list) => {
      let h4 = document.createElement("h4");
      h4.innerHTML = `${list}`;
      section.append(h4);
    });
  }
}