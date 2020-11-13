/*jshint esversion: 6 */
import { currentWeather as currentWeather } from "./getResults.js";
import { time } from "./displayData.js";

const COLOR_MAPPING = {
    dawn: { "start": "#757abf", "middle": "#8583be", "end": "#eab0d1" },
    sunrise: { "start": "#94c5f8", "middle": "#a6e6ff", "end": "#b1b5ea" },
    daytime: { "start": "#9be2fe", "middle": "#90dffe", "end": "#246fa8" },
    sunset: { "start": "#163C52", "middle": "#C5752D", "end": "#2F1107" },
    dusk: { "start": "#010A10", "middle": "#59230B", "end": "#2F1107" },
    night: { "start": "#000000", "middle": "#000000", "end": "#000000" }
};

function mixGradient(gradient1, gradient2, mixPercentage = 0.5) {
    return {
        "start": chroma.mix(gradient1.start, gradient2.start, mixPercentage).hex(),
        "middle": chroma.mix(gradient1.middle, gradient2.middle, mixPercentage).hex(),
        "end": chroma.mix(gradient1.end, gradient2.end, mixPercentage).hex()
    };
}

function getTimeAsFloat(time) {
    return time.getHours() + time.getMinutes() / 60;
}

function isSouthernHemisphere(coordinates) {
    return coordinates.lat < 0;
}

function isPolarDay(sunriseTime, sunsetTime, coordinates) {
    const currentMonth = time.getMonth() + 1;
    return (sunriseTime === sunsetTime) && ((!isSouthernHemisphere(coordinates) && (currentMonth > 3 && currentMonth < 10)) ||
        (isSouthernHemisphere(coordinates) && (currentMonth < 3 || currentMonth > 10)));
}

function isPolarNight(sunriseTime, sunsetTime, coordinates) {
    return (sunriseTime === sunsetTime) && !isPolarDay(sunriseTime, sunsetTime, coordinates);
}

function getDayPhase(sunriseTime, sunsetTime, currentTime, coordinates) {
    const dawnTime = sunriseTime - 1;
    const duskTime = sunsetTime + 1;

    let phase;
    let percentage = 0.5;

    if (isPolarDay(sunriseTime, sunsetTime, coordinates)) {
        phase = "daytime";
    } else if (isPolarNight(sunriseTime, sunsetTime, coordinates)) {
        phase = "night";
    } else if (currentTime < (dawnTime - 1)) {
        phase = "night";
    } else if (currentTime < dawnTime) {
        percentage = (currentTime - dawnTime + 1);
        phase = "dawn";
    } else if (currentTime >= dawnTime && currentTime <= sunriseTime) {
        percentage = (currentTime - dawnTime) / (sunriseTime - dawnTime);
        phase = "sunrise";
    } else if (currentTime > sunriseTime && currentTime < sunsetTime) {
        phase = "daytime";
    } else if (currentTime >= sunsetTime && currentTime <= duskTime) {
        percentage = (currentTime - sunsetTime) / (duskTime - sunsetTime);
        phase = "sunset";
    } else if (currentTime <= (duskTime + 1)) {
        percentage = (duskTime - currentTime + 1);
        phase = "dusk";
    } else if (currentTime > (duskTime + 1)) {
        phase = "night";
    }

    return {
        phase: phase,
        progress: percentage
    };
}

function getGradientFromDayPhase(dayPhase) {
    switch (dayPhase.phase) {
        case "daytime":
            return mixGradient(COLOR_MAPPING.daytime, COLOR_MAPPING.daytime);
        case "dawn":
            return mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.dawn, dayPhase.progress);
        case "sunrise":
            return mixGradient(COLOR_MAPPING.dawn, COLOR_MAPPING.sunrise, dayPhase.progress);
        case "sunset":
            return mixGradient(COLOR_MAPPING.sunset, COLOR_MAPPING.dusk, dayPhase.progress);
        case "dusk":
            return mixGradient(COLOR_MAPPING.dusk, COLOR_MAPPING.night, dayPhase.progress);
        case "night":
            return mixGradient(COLOR_MAPPING.night, COLOR_MAPPING.night);
    }
}

export function setHourlyBackground(sunrise, sunset, time) {
    if (currentWeather.coord === undefined || !isFinite(sunset)) return;

    const currentTime = getTimeAsFloat(time);
    const sunriseTime = getTimeAsFloat(sunrise);
    const sunsetTime = getTimeAsFloat(sunset);

    const dayPhase = getDayPhase(sunriseTime, sunsetTime, currentTime, currentWeather.coord);
    const mixedGradient = getGradientFromDayPhase(dayPhase);

    document.body.style.background = `linear-gradient(0deg, ${mixedGradient.start} 0%, ${mixedGradient.middle} 50%, ${mixedGradient.end} 100%)`;
}