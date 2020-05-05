const api = {
    key: "3738a06f3afcdf6f27d13d28f7fe7392",
    base: "https://api.openweathermap.org/data/2.5/"
}

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
    console.log(weather.weather[0].main);
}

function displayResults (weather) {
    let city = document.querySelector('.location .city');
    city.innerText = `${weather.name}, ${weather.sys.country}`;
  
    let now = new Date();
    let date = document.querySelector('.location .date');
    date.innerText = dateBuilder(now);

    let temp = document.querySelector('.current .temp');
    temp.innerHTML = `${Math.round(weather.main.temp)}<span>°c</span>`;
  
    let weather_el = document.querySelector('.current .weather');
    weather_el.innerText = weather.weather[0].main;

    weatherIcon(weather);
  
    let hilow = document.querySelector('.hi-low');
    hilow.innerText = `${Math.round(weather.main.temp_min)}°c / ${Math.round(weather.main.temp_max)}°c`;
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