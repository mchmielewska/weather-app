import { API_KEY } from "./config.js";

const COLOR_MAPPING = {
    dawn: { "start": "#757abf", "middle": "#8583be", "end": "#eab0d1" },
    sunrise: { "start": "#94c5f8", "middle": "#a6e6ff", "end": "#b1b5ea" },
    daytime: { "start": "#9be2fe", "middle": "#90dffe", "end": "#246fa8" },
    sunset: { "start": "#163C52", "middle": "#C5752D", "end": "#2F1107" },
    dusk: { "start": "#010A10", "middle": "#59230B", "end": "#2F1107" },
    night: { "start": "#000000", "middle": "#000000", "end": "#000000" }
}

function mixGradient(gradient1, gradient2, mixPercentage = 0.5) {
    return {
        "start": chroma.mix(gradient1.start, gradient2.start, mixPercentage).hex(),
        "middle": chroma.mix(gradient1.middle, gradient2.middle, mixPercentage).hex(),
        "end": chroma.mix(gradient1.end, gradient2.end, mixPercentage).hex()
    }
}

const api = {
    key: API_KEY,
    base: "https://api.openweathermap.org/data/2.5/"
}

let getLocation;

const body = document.querySelector('body');
const baseBackground = window.getComputedStyle(body).backgroundColor;

let now = new Date();

let forecastWeather;
let currentWeather;
let time;

const zeroPad = (num, places) => String(num).padStart(places, '0');

function setHourlyBackground(sunrise, sunset, time) {
        
    const currentTime = time.getHours() + time.getMinutes()/60;

    const dawnTime = sunrise.getHours() + sunrise.getMinutes()/60 - 1;
    const sunriseTime = sunrise.getHours() + sunrise.getMinutes()/60;
    const sunsetTime = sunset.getHours() + sunset.getMinutes()/60;
    const duskTime = sunset.getHours() + sunset.getMinutes()/60 + 1;

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
        ) 
    { 
        mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night); 
    } else if (currentTime < (dawnTime - 1)) {
        mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night);
    } else if (currentTime < dawnTime) {
        percentage = (currentTime - dawnTime + 1);
        mixedGradient = mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.dawn, percentage);
    } else if (currentTime >= dawnTime && currentTime<= sunriseTime) {
        percentage = (currentTime - dawnTime)/(sunriseTime - dawnTime);
        mixedGradient = mixGradient(COLOR_MAPPING.dawn, COLOR_MAPPING.sunrise, percentage);
    } else if (currentTime > sunriseTime && currentTime < sunsetTime) {
        mixedGradient = mixGradient(COLOR_MAPPING.daytime, COLOR_MAPPING.daytime);
    } else if (currentTime >= sunsetTime && currentTime <= duskTime) {
        percentage = (currentTime - sunsetTime)/(duskTime - sunsetTime);
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

let date = document.querySelector('.location .date');
date.innerText = dateBuilder(now);

displayLoader();
getResultsLocal();

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

function displayLoader() {
    const loader = document.getElementById('loader')
    loader.style.display = "block";
    let dataWrap = document.getElementsByClassName('data-wrap')[0];
    dataWrap.classList.add('hidden');
}

function hideLoader() {
    const loader = document.getElementById('loader')
    loader.style.display = "none";
    let dataWrap = document.getElementsByClassName('data-wrap')[0];
    dataWrap.classList.remove('hidden'); 
}

function showError() {
    const dataWrap = document.querySelector('.data-wrap');
    const errorWrap = document.querySelector('#error');
    dataWrap.classList.add('hidden');
    errorWrap.classList.remove('hidden');
    errorWrap.innerText = 'Location not found';
}

function hideError() {
    const dataWrap = document.querySelector('.data-wrap');
    const errorWrap = document.querySelector('#error');
    errorWrap.innerText = ''
    errorWrap.classList.add('hidden');
    dataWrap.classList.remove('hidden');
}

function setQuery (e) {
    if (e.keyCode == 13) {
        hideError();
        displayLoader();
        getResults(searchbox.value);
        getResultsForecast(searchbox.value);
    }
}

var forecastStore = getResultsForecast()

function getResults (query) {
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
    })
}

function getResultsForecast (query) {
    fetch(`${api.base}forecast?q=${query}&cnt=16&units=metric&APPID=${api.key}`)
    .then(forecast => {
        return forecast.json();
    }).then(displayForecast);
}

function displayLocation (weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;
}


function getResultsLocal () {
    getLocation = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(showPosition);
        } else {
          currentLocation.innerText = "Geolocation is not supported by this browser.";
        }
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
    getLocation();
    
}

function weatherIcon (weather, weatherClass, id=0) {

    const weatherName = weather.main.toLowerCase();
    const weatherId = weather.id;

    const checkClass = function() {
        if (weatherClass === 'current') {
            let query = `.current .weather-icon`
            return query;
        } else {
            let query = `.el${id}`
            return query;
        }   
    }

    const query = checkClass();
    const weatherIcon = document.querySelector(`${query}`);

    switch (weatherName) {
        case "clouds":
            if (weatherId == "801") {
                weatherIcon.innerHTML ='<img src="./images/partcloudy.png"></img>';
                break;
            } else {
            weatherIcon.innerHTML ='<img src="./images/cloudy.png"></img>';
            break; 
            };
        case "clear":
            weatherIcon.innerHTML ='<img src="./images/sunny.png"></img>';
            break;
        case "fog":
            weatherIcon.innerHTML ='<img src="./images/fog.png"></img>';
            break;
        case "mist":
            weatherIcon.innerHTML ='<img src="./images/fog.png"></img>';
            break;
        case "rain":
            weatherIcon.innerHTML ='<img src="./images/rainy.png"></img>';
            break;
        case "sunny":
            weatherIcon.innerHTML ='<img src="./images/sunny.png"></img>';
            break;
        case "snow":
            weatherIcon.innerHTML ='<img src="./images/snowy.png"></img>';
            break;
        case "thunderstorm":
            weatherIcon.innerHTML ='<img src="./images/stormy.png"></img>';
            break;
        case "drizzle":
            weatherIcon.innerHTML ='<img src="./images/drizzle.png"></img>';
            break;            
        default:
            break;
    }
}


function updateDetailsItem (id, content, rawValue) {
    let detailsItem = document.getElementById(id);
    if (rawValue !== undefined) {
        detailsItem.classList.remove('hidden')
        let item = detailsItem.querySelector('.content')
        item.innerText = content;
    } else {
        detailsItem.classList.add('hidden')
    }
}

function getTime() {
    time = new Date();
    time.setSeconds(time.getSeconds() + currentWeather.timezone);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset());

    date.innerHTML = `
    ${dateBuilder(time)}
    <br>
    Time now: ${time.getHours()}:${zeroPad(time.getMinutes(),2)}:${zeroPad(time.getSeconds(),2)}`;
}

let currentInterval;
function displayMainWeather (weather) {
    hideLoader();
    getTime();

    setInterval(getTime, 1000);

    let temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;
  
    let weather_el = document.querySelector('.current .weather');
    weather_el.innerText = weather.weather[0].main;

    weatherIcon(weather.weather[0], 'current');

    let detailsButton = document.getElementsByClassName('show-details')
    detailsButton[0].classList.remove('hidden');
    detailsButton[0].classList.add('mobile-visible');
  
    let detailsElement = document.getElementsByClassName('details');
    detailsElement[0].classList.remove('hidden');

    let hilow = document.querySelector('.hi-low');
    hilow.innerText = `${weather.main.temp_min.toFixed(1)}°c / ${weather.main.temp_max.toFixed(1)}°c`;
        
    const sunrise = new Date(weather.sys.sunrise * 1000);
    sunrise.setSeconds(sunrise.getSeconds() + weather.timezone);
    sunrise.setMinutes(sunrise.getMinutes() + time.getTimezoneOffset())
    const sunriseTime = `${sunrise.getHours()}:${zeroPad(sunrise.getMinutes(),2)}`;

    const sunset = new Date(weather.sys.sunset * 1000);
    sunset.setSeconds(sunset.getSeconds() + weather.timezone);
    sunset.setMinutes(sunset.getMinutes() + time.getTimezoneOffset())
    const sunsetTime = `${sunset.getHours()}:${zeroPad(sunset.getMinutes(),2)}`;

    updateDetailsItem('sunrise', sunriseTime, weather.sys.sunrise);
    updateDetailsItem('sunset', sunsetTime, weather.sys.sunset)

    updateDetailsItem('wind', `${weather.wind.speed} m/s`, weather.wind.speed);
    updateDetailsItem('humid', `${weather.main.humidity} %`, weather.main.humidity);
    updateDetailsItem('cloud', `${weather.clouds.all} %`, weather.clouds.all);
    updateDetailsItem('pressure', `${weather.main.pressure} hPa`, weather.main.pressure);


    function backgroundCheck() {
        getTime();
        setHourlyBackground(sunrise, sunset, time);
    }

    if (currentInterval) {
        window.clearInterval(currentInterval);
    }

    currentInterval = setInterval(backgroundCheck, 1000)
}   

function removeActive () {
    const forecastItems = document.getElementsByClassName('active');
    for (const item of forecastItems) {
            item.classList.remove('active');
    };
}

function checkDailyForecast () {
    const forecastItems = document.getElementsByClassName('forecast-item');

    for (const item of forecastItems) {
        item.addEventListener("click", () => {
            if (!item.classList.contains('active')) {
                removeActive();
                item.classList.add('active');
                displayMainWeather(forecastWeather.list[item.dataset.index])
            } else {
                removeActive();
                displayMainWeather (currentWeather);
            }
            }
        );
    };
}

function displayForecast (weather) {

    forecastWeather = weather;

    let forecastParentElement = document.getElementsByClassName('forecast')[0];
    
    while (forecastParentElement.firstChild) {
        forecastParentElement.removeChild(forecastParentElement.lastChild);
    }

    for (let i in weather.list) {
        const id = i;
        let checkedWeather = weather.list[i];

        let forecastElement = document.createElement("div");
        forecastElement.className = "forecast-item";
        forecastElement.dataset.index = i;
        forecastParentElement.appendChild(forecastElement);

        let time = new Date(checkedWeather.dt*1000);
        time.setSeconds(time.getSeconds() + currentWeather.timezone)

        forecastElement.innerHTML = 
            `<div class="forecast-item-date">
                ${forecastDateBuilder(time)}
                <br>
                ${time.getHours()}:${zeroPad(time.getMinutes(),2)}
            </div>
            <div class="weather-icon el${id}"></div>
            <div class="forecast-weather">
                ${checkedWeather.weather[0].main}
            </div>
            <div class="forecast-temp">
                ${Math.round(checkedWeather.main.temp)}
                <span>°c</span>
            </div>
            `
        weatherIcon(checkedWeather.weather[0], 'forecast-item', id);
    }

    checkDailyForecast();
}
 
function dateBuilder (d) {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
    let day = days[d.getDay()];
    let date = d.getDate();
    let month = months[d.getMonth()];
    let year = d.getFullYear();
  
    return `${day} ${date} ${month} ${year}`;
}

function forecastDateBuilder (d) {
    let days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
    let day = days[d.getDay()];
    let date = d.getDate();
    let month = d.getMonth() + 1;
  
    return `${day} ${date}.${month}`;
}

function showDetailsTab() {
    const details = document.querySelector('.details');
    const showDetailsElement = document.getElementsByClassName('show-details')
    showDetailsElement[0].innerHTML = 
            `
                <p>hide details</p>
                <a href=# id="button-show" class="button hidden"><img src="./images/show.png"></a>
                <a href=# id="button-hide" class="button"><img src="./images/hide.png"></a>
            `
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
    };
}

showDetailsTab();