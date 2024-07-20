import { handleSearchEvent } from "./utils.mjs";
const key = import.meta.env.VITE_OPENWEATHER_KEY;
let lat, long;

document.addEventListener("DOMContentLoaded", () => {
    let result = handleSearchEvent();
  });