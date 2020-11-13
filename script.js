/*jshint esversion: 6 */

import * as displayElements from "./modules/displayElements.js";
import { getResultsLocal, getCurrentWeatherByCity, getForecastbyCity } from "./modules/getResults.js";

const searchbox = document.getElementsByClassName('search-box')[0];

function setQuery(e) {
    if (e.keyCode != 13) return;

    displayElements.hideError();
    displayElements.displayLoader();
    displayElements.showDetailsTab();
    getCurrentWeatherByCity(searchbox.value);
    getForecastbyCity(searchbox.value);
}

searchbox.addEventListener('keypress', setQuery);

displayElements.displayLoader();
getResultsLocal();
displayElements.showDetailsTab();