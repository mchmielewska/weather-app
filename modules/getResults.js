/*jshint esversion: 6 */
// import { API_KEY } from "../config.js";
import * as displayElements from "./displayElements.js";
import { displayForecast, displayMainWeather } from "./displayData.js";

const api = {
    key: API_KEY,
    base: "https://api.openweathermap.org/data/2.5/"
};

let getLocation;
let currentWeather;

function displayLocation(weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;
}

function handleGeolocationError(error) {
    displayElements.hideLoader();
    const currentLocation = document.querySelector('.location');
    currentLocation.innerText = "Geolocation is not supported by this browser.";
}

function getCurrentWeather(query) {
    fetch(`${api.base}weather?${query}`)
    .then(weather => {
        return weather.json();
    }).then(weather => {
        currentWeather = weather;
        displayLocation(weather);
        displayMainWeather(weather);
    }).catch(error => {
        displayElements.hideLoader();
        displayElements.showError("Location not found");
        document.body.style.background = 'linear-gradient(0deg, rgb(99, 158, 168) 0%, rgb(3, 80, 102) 100%)';
    });
}

function getCurrentWeatherByPosition(position) {
    getCurrentWeather(`lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&APPID=${api.key}`);
}

function getForecastbyPosition(position) {
    getForecastWeather(`lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&cnt=16&APPID=${api.key}`);
}

function getCurrentWeatherByCity(city) {
    getCurrentWeather(`q=${city}&units=metric&APPID=${api.key}`);
}

function getForecastbyCity(city) {
    getForecastWeather(`q=${city}&cnt=16&units=metric&APPID=${api.key}`);
}

function getForecastWeather(query) {
    fetch(`${api.base}forecast?${query}`)
    .then(weather => {
        return weather.json();
    }).then(weather => {
        displayForecast(weather);
    }).catch(error => {
        displayElements.hideLoader();
        displayElements.showError("Problem with fetching data, please try again");
        document.body.style.background = 'linear-gradient(0deg, rgb(99, 158, 168) 0%, rgb(3, 80, 102) 100%)';
    });
}

function showPosition(position) {
    getCurrentWeatherByPosition(position);
    getForecastbyPosition(position);
}

function getResultsLocal() {
    getLocation = () => navigator.geolocation.getCurrentPosition(showPosition, handleGeolocationError);
    getLocation();
}

export { getResultsLocal, getForecastbyCity, getCurrentWeatherByCity, currentWeather };