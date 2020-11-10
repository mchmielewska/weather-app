const api = {
    key: "3738a06f3afcdf6f27d13d28f7fe7392",
    base: "https://api.openweathermap.org/data/2.5/"
}

let now = new Date();

let forecastWeather;
let currentWeather;

const zeroPad = (num, places) => String(num).padStart(places, '0');

function LightenDarkenColor(col, amt) {
  
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
 
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
 
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
 
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    const hexColor =  (g | (b << 8) | (r << 16)).toString(16)
    return (usePound?"#":"") + zeroPad(hexColor,6);
  
}

function RGBToHex(rgb) {
    // Choose correct separator
    let sep = rgb.indexOf(",") > -1 ? "," : " ";
    // Turn "rgb(r,g,b)" into [r,g,b]
    rgb = rgb.substr(4).split(")")[0].split(sep);
  
    let r = (+rgb[0]).toString(16),
        g = (+rgb[1]).toString(16),
        b = (+rgb[2]).toString(16);
  
    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
  
    const hexColor = r + g + b
    return "#" + zeroPad(hexColor,6);
  }

function setBackground(time) {
    let hoursFromNoon = Math.abs(12 - time.getHours());
    let dayPercent = hoursFromNoon/12;

    let body = document.querySelector('body');
    let backgroundColor = window.getComputedStyle(body).backgroundColor;

    const newColor = LightenDarkenColor(RGBToHex(backgroundColor), -dayPercent*100);

    document.body.style.backgroundColor = newColor;
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

function setQuery (e) {
    if (e.keyCode == 13) {
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
    });
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

function displayMainWeather (weather) {
    let time = new Date(currentWeather.dt*1000);
    time.setSeconds(time.getSeconds() + currentWeather.timezone);
    time.setMinutes(time.getMinutes() + time.getTimezoneOffset())

    date.innerHTML = `
        ${dateBuilder(time)}
        <br>
        Time now: ${time.getHours()}:${zeroPad(time.getMinutes(),2)}`;
    
    setBackground(time);

    hideLoader();

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
    updateDetailsItem('pressure', `${weather.main.pressure} hPa`, weather.main.pressure)
  
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

    for (i in weather.list) {
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

