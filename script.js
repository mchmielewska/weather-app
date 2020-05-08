const api = {
    key: "3738a06f3afcdf6f27d13d28f7fe7392",
    base: "https://api.openweathermap.org/data/2.5/"
}

let now = new Date();
let date = document.querySelector('.location .date');
date.innerText = dateBuilder(now);

getResultsLocal();

const searchbox = document.querySelector('.search-box');
searchbox.addEventListener('keypress', setQuery);

function setQuery (e) {
    if (e.keyCode == 13) {
        getResults(searchbox.value);
    }
}

function getResults (query) {
    fetch(`${api.base}weather?q=${query}&units=metric&APPID=${api.key}`)
    .then(weather => {
      return weather.json();
    }).then(displayResults);
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
            displayResults(weather);
        });
    }
    getLocation();
    
}

function weatherIcon (weather) {
    const weatherName = weather.weather[0].main.toLowerCase();
    const weatherId = weather.weather[0].id;
    const weatherIcon = document.querySelector('.current .weather-icon');
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

function displayResults (weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;

    let temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;
  
    let weather_el = document.querySelector('.current .weather');
    weather_el.innerText = weather.weather[0].main;

    weatherIcon(weather);
  
    let hilow = document.querySelector('.hi-low');
    hilow.innerText = `${Math.round(weather.main.temp_min)}°c / ${Math.round(weather.main.temp_max)}°c`;

    let sunriseDiv = document.querySelector('.sunrise');
    const sunrise = new Date(weather.sys.sunrise * 1000);
    const sunriseTime = `${sunrise.getHours()}:${sunrise.getMinutes()}`;
    sunriseDiv.innerText = sunriseTime;

    let sunsetDiv = document.querySelector('.sunset');
    const sunset = new Date(weather.sys.sunset * 1000);
    const sunsetTime = `${sunset.getHours()}:${sunset.getMinutes()}`;
    sunsetDiv.innerText = sunsetTime;

    let wind = document.querySelector('.wind')
    wind.innerText = `${weather.wind.speed} m/s`;

    let humidity = document.querySelector('.humid');
    humidity.innerText = `${weather.main.humidity} %`;

    let cloudiness = document.querySelector('.cloud');
    cloudiness.innerText = `${weather.clouds.all} %`;

    let pressure = document.querySelector('.pressure');
    pressure.innerText = `${weather.main.pressure} hPa`;    
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

const details = document.querySelector('.details');
const buttons = document.getElementsByClassName('button');
const showButton = document.getElementById('button-show');
const hideButton = document.getElementById('button-hide');
const detailsText = document.querySelector('.show-details p');

let showDetails = false;

for (const button of buttons) {
button.addEventListener("click", () => {
    showDetails = !showDetails;
    if (showDetails === true) {
        details.classList.remove('hidden');
        hideButton.classList.remove('hidden');
        showButton.classList.add('hidden');
        detailsText.innerText = "hide details";
    } else {
        details.classList.add('hidden');
        hideButton.classList.add('hidden');
        showButton.classList.remove('hidden');
        detailsText.innerText = "show details";
    }
});
};
