# Weather App

## Demo

Online demo: https://moon-weatherapp.netlify.app/

## General info
A responsive weather website that displays both current weather as well as short term forecast.

## Why

I initially started working on this project **to practice and solidify my HTML, CSS and JS skills**. As time went on I noticed that even with a relatively small project like this one you can go quite deep technically.


There was always "just one more thing" to add, and I was able to implement things like mixing gradient colors, timer loops and learned about topics like refactoring and javascript modules.


By now I'm happy with where this project took me and think it's worthwhile to showcase it as I'm building up my **web development portfolio**.


## Features
- dynamically adjusting gradient background to current time of day in real time
- integration with an external weather API - https://openweathermap.org/api
- timezone calculations to better handle summer time etc.
- integrated browser geolocation

<p align="center">
  <img src = "https://i.imgur.com/j7tCrZj.png">
</p>
<p align="center">
  <img src = "https://i.imgur.com/fitgpBY.png" width=300>
  
  <img src = "https://i.imgur.com/C1hjoZC.png" width=300>
</p>
<p align="center">
  <img src = "https://i.imgur.com/RkOzXRU.png" width=400>
</p>
	
## Technologies
Project is created with:
* JavaScript (ES6)
* CSS3
* HTML
	
## Setup
To run this project locally, inject <script> tag before </head> in index.html file. 


Assign the API key to generated value: https://home.openweathermap.org/api_keys

```
<script>
const API_KEY = "..."
</script>
```
