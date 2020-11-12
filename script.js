/*jshint esversion: 6 */

// import { API_KEY } from "./config.js";

const COLOR_MAPPING = {
    dawn: { "start": "#757abf", "middle": "#8583be", "end": "#eab0d1" },
    sunrise: { "start": "#94c5f8", "middle": "#a6e6ff", "end": "#b1b5ea" },
    daytime: { "start": "#9be2fe", "middle": "#90dffe", "end": "#246fa8" },
    sunset: { "start": "#163C52", "middle": "#C5752D", "end": "#2F1107" },
    dusk: { "start": "#010A10", "middle": "#59230B", "end": "#2F1107" },
    night: { "start": "#000000", "middle": "#000000", "end": "#000000" }
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const api = {
    key: API_KEY,
    base: "https://api.openweathermap.org/data/2.5/"
};

function f() {
    let x = 3;

    return x;
}

let getLocation;

const body = document.querySelector('body');
const baseBackground = window.getComputedStyle(body).backgroundColor;

let now = new Date();

let forecastWeather;
let currentWeather;
let time;

const zeroPad = (num, places) => String(num).padStart(places, '0');

const date = document.querySelector('.location .date');
const searchbox = document.getElementsByClassName('search-box')[0];

const loader = document.getElementById('loader');
const dataWrap = document.getElementsByClassName('data-wrap')[0];
const errorWrap = document.getElementById('error');

let currentInterval;

function mixGradient(gradient1, gradient2, mixPercentage = 0.5) {
    return {
        "start": chroma.mix(gradient1.start, gradient2.start, mixPercentage).hex(),
        "middle": chroma.mix(gradient1.middle, gradient2.middle, mixPercentage).hex(),
        "end": chroma.mix(gradient1.end, gradient2.end, mixPercentage).hex()
    };
}

function setHourlyBackground(sunrise, sunset, time) {

    const currentTime = time.getHours() + time.getMinutes() / 60;

    const dawnTime = sunrise.getHours() + sunrise.getMinutes() / 60 - 1;
    const sunriseTime = sunrise.getHours() + sunrise.getMinutes() / 60;
    const sunsetTime = sunset.getHours() + sunset.getMinutes() / 60;
    const duskTime = sunset.getHours() + sunset.getMinutes() / 60 + 1;

    let mixedGradient;

    let percentage = 0.5;

    if (currentWeather.coord !== undefined) {
        const currentMonth = time.getMonth() + 1;
        if (
            (currentWeather.coord.lat > 0 && (currentMonth > 3 || currentMonth < 10) && sunriseTime === sunsetTime) ||
            (currentWeather.coord.lat < 0 && (currentMonth < 3 || currentMonth > 10) && sunriseTime === sunsetTime)
        ) {
            mixedGradient = mixGradient(COLOR_MAPPING.daytime, COLOR_MAPPING.daytime);
        } else if (
            (currentWeather.coord.lat < 0 && (currentMonth > 3 || currentMonth < 10) && sunriseTime === sunsetTime) ||
            (currentWeather.coord.lat > 0 && (currentMonth < 3 || currentMonth > 10) && sunriseTime === sunsetTime)
        ) {
            mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night);
        } else if (currentTime < (dawnTime - 1)) {
            mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night);
        } else if (currentTime < dawnTime) {
            percentage = (currentTime - dawnTime + 1);
            mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.dawn, percentage);
        } else if (currentTime >= dawnTime && currentTime <= sunriseTime) {
            percentage = (currentTime - dawnTime) / (sunriseTime - dawnTime);
            mixedGradient = mixGradient(COLOR_MAPPING.dawn, COLOR_MAPPING.sunrise, percentage);
        } else if (currentTime > sunriseTime && currentTime < sunsetTime) {
            mixedGradient = mixGradient(COLOR_MAPPING.daytime, COLOR_MAPPING.daytime);
        } else if (currentTime >= sunsetTime && currentTime <= duskTime) {
            percentage = (currentTime - sunsetTime) / (duskTime - sunsetTime);
            mixedGradient = mixGradient(COLOR_MAPPING.sunset, COLOR_MAPPING.dusk, percentage);
        } else if (currentTime <= (duskTime + 1)) {
            percentage = (duskTime - currentTime + 1);
            mixedGradient = mixGradient(COLOR_MAPPING.dusk, COLOR_MAPPING.night, percentage);
        } else if (currentTime > (duskTime + 1)) {
            mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night);
        }
    }

    if (mixedGradient !== undefined) {
        document.body.style.background = `linear-gradient(0deg, ${mixedGradient.start} 0%, ${mixedGradient.middle} 50%, ${mixedGradient.end} 100%)`;
    }

}

function displayLoader() {
    loader.style.display = "block";
    dataWrap.classList.add('hidden');
}

function hideLoader() {
    loader.style.display = "none";
    dataWrap.classList.remove('hidden');
}

function showError() {
    dataWrap.classList.add('hidden');
    errorWrap.classList.remove('hidden');
    errorWrap.innerText = 'Location not found';
}

function hideError() {
    errorWrap.innerText = '';
    errorWrap.classList.add('hidden');
    dataWrap.classList.remove('hidden');
}

function setQuery(e) {
    if (e.keyCode != 13) return;

    hideError();
    displayLoader();
    showDetailsTab();
    getResults(searchbox.value);
    getResultsForecast(searchbox.value);
}

function getResults(query) {
    fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
        .then(weather => {
            return weather.json();
        }).then(weather => {
            currentWeather = weather;
            displayLocation(weather);
            displayMainWeather(weather);
        }).catch(error => {
            hideLoader();
            showError();
            document.body.style.background = 'linear-gradient(0deg, rgb(99, 158, 168) 0%, rgb(3, 80, 102) 100%)';
        });
}

function getResultsForecast(query) {
    fetch(`${api.base}forecast?q=${query}&cnt=16&units=metric&APPID=${api.key}`)
        .then(forecast => {
            return forecast.json();
        }).then(displayForecast);
}

function displayLocation(weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;
}

function handleGeolocationError(error) {
    hideLoader();
    const currentLocation = document.querySelector('.location');
    currentLocation.innerText = "Geolocation is not supported by this browser.";
}

function showPosition(position) {
    fetch(`${api.base}weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&APPID=${api.key}`)
        .then(weather => {
            return weather.json();
        }).then(weather => {
            currentWeather = weather;
            displayLocation(weather);
            displayMainWeather(weather);
        });

    fetch(`${api.base}forecast?lat=${position.coords.latitude}&lon=${position.coords.longitude}&units=metric&cnt=16&APPID=${api.key}`)
        .then(weather => {
            return weather.json();
        }).then(weather => {
            displayForecast(weather);
        });
}

function getResultsLocal() {
    getLocation = () =>  navigator.geolocation.getCurrentPosition(showPosition, handleGeolocationError);
    getLocation();
}

function weatherIcon(weather, weatherClass, id = 0) {

    const weatherName = weather.main.toLowerCase();
    const weatherId = weather.id;

    const weatherIcon = document.querySelector(getIconSelector());

    function getIconSelector() {
        if (weatherClass === 'current') {
            let query = '.current .weather-icon';
            return query;
        } else {
            let query = `.weather-icon[data-index="${id}"]`;
            return query;
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
    hideLoader();
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
        setHourlyBackground(sunrise, sunset, time);
    }

    if (currentInterval) {
        window.clearInterval(currentInterval);
    }

    currentInterval = setInterval(backgroundCheck, 1000);
}

function removeActive() {
    const forecastItems = document.getElementsByClassName('active');
    for (const item of forecastItems) {
        item.classList.remove('active');
    }
}

function checkDailyForecast() {
    const forecastItems = document.getElementsByClassName('forecast-item');

    for (const item of forecastItems) {
        item.addEventListener("click", () => {
            if (!item.classList.contains('active')) {
                removeActive();
                item.classList.add('active');
                displayMainWeather(forecastWeather.list[item.dataset.index]);
            } else {
                removeActive();
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

function showDetailsTab() {
    const details = document.getElementsByClassName('details')[0];
    const showDetailsElement = document.getElementsByClassName('show-details')[0];
    showDetailsElement.innerHTML =
        `
                <p>hide details</p>
                <a href=# id="button-show" class="button hidden"><img src="./images/show.png"></a>
                <a href=# id="button-hide" class="button"><img src="./images/hide.png"></a>
            `;
    const buttons = document.getElementsByClassName('button');
    const showButton = document.getElementById('button-show');
    const hideButton = document.getElementById('button-hide');
    const detailsText = document.querySelector('.show-details p');

    let showDetails = true;

    for (const button of buttons) {
        button.addEventListener("click", (e) => {
            e.preventDefault();
            showDetails = !showDetails;
            if (showDetails === true) {
                details.classList.remove('hidden');
                hideButton.classList.remove('hidden');
                showButton.classList.add('hidden');
                detailsText.classList.remove('hidden');
                detailsText.innerText = "hide details";
            } else {
                details.classList.add('hidden');
                hideButton.classList.add('hidden');
                showButton.classList.remove('hidden');
                detailsText.classList.remove('hidden');
                detailsText.innerText = "show details";
            }
        });
    }
}

date.innerText = dateBuilder(now);
searchbox.addEventListener('keypress', setQuery);

displayLoader();
getResultsLocal();
showDetailsTab();