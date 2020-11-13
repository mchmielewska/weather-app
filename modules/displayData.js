/*jshint esversion: 6 */
import { currentWeather } from "./getResults.js";
import * as displayElements from "./displayElements.js";
import * as background from "./background.js";

let forecastWeather;
let currentInterval;
let time;

const date = document.querySelector('.location .date');

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const zeroPad = (num, places) => String(num).padStart(places, '0');


function weatherIcon(weather, weatherClass, id = 0) {

    const weatherName = weather.main.toLowerCase();
    const weatherId = weather.id;

    const weatherIcon = document.querySelector(getIconSelector());

    function getIconSelector() {
        if (weatherClass === 'current') {
            return '.current .weather-icon';
        } else {
            return `.weather-icon[data-index="${id}"]`;
        }
    }

    function setWeatherImage(weatherName) {
        weatherIcon.innerHTML = `<img src="./images/${weatherName}.png"></img>`;
    }

    switch (weatherName) {
        case "clouds":
            if (weatherId == "801") {
                setWeatherImage('clouds801');
            } else {
                setWeatherImage('clouds');
            }
            break;
        case "clear":
            setWeatherImage('sunny');
            break;
        case "fog":
            setWeatherImage('fog');
            break;
        case "mist":
            setWeatherImage('fog');
            break;
        case "rain":
            setWeatherImage('rain');
            break;
        case "sunny":
            setWeatherImage('sunny');
            break;
        case "snow":
            setWeatherImage('snow');
            break;
        case "thunderstorm":
            setWeatherImage('storm');
            break;
        case "drizzle":
            setWeatherImage('drizzle');
            break;
        default:
            break;
    }
}

function updateDetailsItem(id, content, rawValue) {
    const detailsItem = document.getElementById(id);
    if (rawValue !== undefined) {
        detailsItem.classList.remove('hidden');
        const item = detailsItem.getElementsByClassName('content')[0];
        item.innerText = content;
    } else {
        detailsItem.classList.add('hidden');
    }
}

function timeInCurrentTimezone(time) {
    time.setSeconds(time.getSeconds() + currentWeather.timezone);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset());
    return time;
}

function setTime() {
    time = new Date();
    time = timeInCurrentTimezone(time);

    date.innerHTML = `
    ${dateBuilder(time)}
    <br>
    Time now: ${time.getHours()}:${zeroPad(time.getMinutes(), 2)}:${zeroPad(time.getSeconds(), 2)}`;
}

function displayMainWeather(weather) {
    displayElements.hideLoader();
    setTime();

    setInterval(setTime, 1000);

    const temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;

    const weatherElement = document.querySelector('.current .weather');
    weatherElement.innerText = weather.weather[0].main;

    weatherIcon(weather.weather[0], 'current');

    const detailsButton = document.getElementsByClassName('show-details')[0];
    detailsButton.classList.remove('hidden');
    detailsButton.classList.add('mobile-visible');

    const detailsElement = document.getElementsByClassName('details')[0];
    detailsElement.classList.remove('hidden');

    const hiLow = document.getElementsByClassName('hi-low')[0];
    hiLow.innerText = `${weather.main.temp_min.toFixed(1)}°c / ${weather.main.temp_max.toFixed(1)}°c`;

    let sunrise = new Date(weather.sys.sunrise * 1000);
    sunrise = timeInCurrentTimezone(sunrise);
    const sunriseTime = `${sunrise.getHours()}:${zeroPad(sunrise.getMinutes(), 2)}`;

    let sunset = new Date(weather.sys.sunset * 1000);
    sunset = timeInCurrentTimezone(sunset);
    const sunsetTime = `${sunset.getHours()}:${zeroPad(sunset.getMinutes(), 2)}`;

    updateDetailsItem('sunrise', sunriseTime, weather.sys.sunrise);
    updateDetailsItem('sunset', sunsetTime, weather.sys.sunset);

    updateDetailsItem('wind', `${weather.wind.speed} m/s`, weather.wind.speed);
    updateDetailsItem('humid', `${weather.main.humidity} %`, weather.main.humidity);
    updateDetailsItem('cloud', `${weather.clouds.all} %`, weather.clouds.all);
    updateDetailsItem('pressure', `${weather.main.pressure} hPa`, weather.main.pressure);

    function backgroundCheck() {
        setTime();
        background.setHourlyBackground(sunrise, sunset, time);
    }

    if (currentInterval) {
        window.clearInterval(currentInterval);
    }

    currentInterval = setInterval(backgroundCheck, 1000);
}

function checkDailyForecast() {
    const forecastItems = document.getElementsByClassName('forecast-item');

    for (const item of forecastItems) {
        item.addEventListener("click", () => {
            if (!item.classList.contains('active')) {
                displayElements.removeActive();
                item.classList.add('active');
                displayMainWeather(forecastWeather.list[item.dataset.index]);
            } else {
                displayElements.removeActive();
                displayMainWeather(currentWeather);
            }
        }
        );
    }
}

function displayForecast(weather) {

    forecastWeather = weather;

    const forecastParentElement = document.getElementsByClassName('forecast')[0];

    while (forecastParentElement.firstChild) {
        forecastParentElement.removeChild(forecastParentElement.lastChild);
    }

    for (let i in weather.list) {
        let checkedWeather = weather.list[i];

        const forecastElement = document.createElement("div");
        forecastElement.className = "forecast-item";
        forecastElement.dataset.index = i;
        forecastParentElement.appendChild(forecastElement);

        let time = new Date(checkedWeather.dt * 1000);
        time = timeInCurrentTimezone(time);

        forecastElement.innerHTML =
            `<div class="forecast-item-date">
                ${forecastDateBuilder(time)}
                <br>
                ${time.getHours()}:${zeroPad(time.getMinutes(), 2)}
            </div>
            <div class="weather-icon" data-index=${i}></div>
            <div class="forecast-weather">
                ${checkedWeather.weather[0].main}
            </div>
            <div class="forecast-temp">
                ${Math.round(checkedWeather.main.temp)}
                <span>°c</span>
            </div>
            `;
        weatherIcon(checkedWeather.weather[0], 'forecast-item', i);
    }

    checkDailyForecast();
}

function dateBuilder(d) {
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();

    return `${day} ${date} ${month} ${year}`;
}

function forecastDateBuilder(d) {
    const day = days[d.getDay()];
    const date = d.getDate();
    const month = d.getMonth() + 1;

    return `${day} ${date}.${month}`;
}

export { displayMainWeather, displayForecast, time };