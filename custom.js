"use strict";
var search, celsius, fahrenheit;

//Weather function constructor
function Weather(city, conditions, temperature, humidity, wind, pressure) {
    this.city = city;
    this.conditions = conditions;
    this.temperature = temperature;
    this.humidity = humidity;
    this.wind = wind;
    this.pressure = pressure;
}

// Submit data after button click
search = document.querySelector('.search-btn');
search.addEventListener('click', requestWeatherData);

// Submit data after hitting 'ENTER'
document.addEventListener('keypress', function (event) {
    if (event.code === 'Enter') {
        requestWeatherData();
    }
});

//Assigning event listener to 'C' and 'F' letters to switch between temperature units
fahrenheit = document.querySelector('.fahrenheit');
celsius = document.querySelector('.celsius');

[fahrenheit, celsius].forEach(function (el) {
    return el.addEventListener('click', calcTemp);
})

//Function which calculates give temperature to different units
function calcTemp(event) {
    var fahrenheit, celsius, temp, value;
    fahrenheit = document.querySelector('.fahrenheit');
    celsius = document.querySelector('.celsius');
    temp = document.querySelector('.weather__temp');

    if (event.target.className === 'fahrenheit') {
        celsius.classList.toggle('active');
        fahrenheit.classList.toggle('active');

        value = parseFloat(temp.textContent);
        temp.textContent = (value * 9 / 5 + 32).toFixed(0);
    } else if (event.target.className === 'celsius') {
        celsius.classList.toggle('active');
        fahrenheit.classList.toggle('active');

        value = parseFloat(temp.textContent);
        temp.textContent = ((value - 32) * 5 / 9).toFixed(0);
    }
}

//Function which get HTTP requests and processes. Result of this operation is JSON object downloaded from https://openweathermap.org/api
function requestWeatherData() {
    var http, key, url, method, cityInput, cityInputMedia, content, loader, error;

    content = document.querySelector('.container__display');
    loader = document.getElementById('loader');
    error = document.getElementById('error');

    loader.style.display = 'block';
    content.style.display = 'none';

    cityInput = document.getElementById('city').value;
    cityInputMedia = document.getElementById('city-small').value;
    toggleVisibility('.toggle-display', 'visible');

    function isHidden(el) {
        return (el.offsetParent === null)
    }

    http = new XMLHttpRequest();
    key = 'f7ae93273991702a76175c327cf35188';
    method = 'GET';
    
    var cityValue;
    
    //function which distinguish from which input data must be read
    function generateAPIKey(input) {
        if (input.trim().length === 0) {
            toggleVisibility('.toggle-display', 'hidden');
            loader.style.display = 'none';
            error.style.display = 'block';
            error.textContent = 'Please enter City Name!';
        } else {
            error.style.display = 'none';
            
            url = 'http://api.openweathermap.org/data/2.5/weather?q=' + input + '&units=metric&appid=' + key;
            cityValue = input;
        }
        var data = {url: url, cityValue: cityValue};
        
        return data;
    }
    
    var data;
    if (!isHidden(document.getElementById('city'))) {
        data = generateAPIKey(cityInput);
    } else if (!isHidden(document.getElementById('city-small'))) {
        data = generateAPIKey(cityInputMedia);
    }
    
    var cityValue = data.cityValue;
    
    //Opening connection
    http.open(method, data.url);
    
    //Callback is called from the user interface. Readystatechange is fired every time the readyState property of request changes.
    http.onreadystatechange = function () {
        if (http.readyState === 4 && http.status === 200) {
            var data = JSON.parse(http.responseText);
            var weatherObj = fetchData(data);
            var weatherData = new Weather(
                cityValue,
                weatherObj.desc,
                (weatherObj.temp).toFixed(0),
                weatherObj.humid,
                weatherObj.wind,
                weatherObj.pressure);

            weatherUI(weatherData);
            loader.style.display = 'none';
            content.style.display = 'flex';

            showWeatherIcon();

        } else if (http.readyState === 4) {
            return
        }
    }

    //Sending request to the server
    http.send();

    document.querySelector('#city').value = '';
    document.querySelector('#city').focus();
}

//Function which switches icons according to weather in chosen city
function showWeatherIcon() {
    var weatherConditions, regExp, pattern, result, weatherIcon, icon;
    weatherConditions = document.querySelector('.weather__conditions').textContent;
    weatherIcon = document.getElementById('weather-icon');

    //Function created to verify whether given DOM.textContent has the words of specific pattern
    var checkPattern = function (pattern) {
        return weatherConditions.includes(pattern);
    }

    if (checkPattern('rain') || checkPattern('drizzle')) {
        icon = 'img/rain.svg';
    } else if (checkPattern('cloud') || checkPattern('overcast') || checkPattern('mist') || checkPattern('haze')) {
        icon = 'img/clouds.svg';
    } else if (checkPattern('clear') || checkPattern('sun')) {
        icon = 'img/sunny.svg';
    } else if (checkPattern('snow')) {
        icon = 'img/snowflake.svg';
    } else if (checkPattern('storm')) {
        icon = 'img/lightning.svg';
    }
    weatherIcon.src = icon;
}

//Function which switches between properties 'visible' & 'hidden'. Function is triggered once user hits the button
function toggleVisibility(className, condition) {
    var toggleItems = document.querySelectorAll(className);
    // Transforming node list to array in order to loop through it
    var newtoggleItems = Array.prototype.slice.call(toggleItems);

    newtoggleItems.forEach(function (el) {
        return el.style.visibility = condition;
    });
}

//Function gets data from given object in this case it is JSON object from API
function fetchData(obj) {
    var data = {
        desc: obj.weather[0].description,
        temp: obj.main.temp,
        conditions: obj.weather.main,
        humid: obj.main.humidity,
        wind: obj.wind.speed,
        pressure: obj.main.pressure
    }
    return data
}

//Function is responsible for displaying content in the UI
function weatherUI(weatherData) {
    var temp, humidity, wind, pressure, city, conditions, cityFirstLetter, cityLength;

    temp = document.querySelector('.weather__temp');
    conditions = document.querySelector('.weather__conditions');
    humidity = document.querySelector('.indicators__humid');
    wind = document.querySelector('.indicators__wind');
    pressure = document.querySelector('.indicators__pressure');
    city = document.querySelector('.info__city');

    cityFirstLetter = weatherData.city.substr(0, 1).toUpperCase();
    cityLength = weatherData.city.substr(1, weatherData.city.length).toLowerCase();

    city.textContent = cityFirstLetter + cityLength;
    temp.textContent = weatherData.temperature;
    conditions.textContent = weatherData.conditions;
    humidity.textContent = 'Humidity: ' + weatherData.humidity + ' %';
    wind.textContent = 'Wind: ' + weatherData.wind + ' km/h';
    pressure.textContent = 'Pressure: ' + weatherData.pressure + ' hPa';
}



/*================================
        INITIAL FUNCTION
=================================*/
// Function hides all variable elements such as city, temperature, indicators etc. Only day of the week is displayed and time. Time format is also taken into account.
function init() {
    //Time variables
    var days, now, today, day, hour, minute, ampm, time, indicators;

    // DOM strings
    var todayDOM, timeDOM, DOMs;
    todayDOM = document.querySelector('.info__day');
    timeDOM = document.querySelector('.info__time');

    // Setting indicators panel to 'hidden'
    toggleVisibility('.toggle-display', 'hidden');

    // Setting day of the week and time
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    now = new Date();
    today = now.getDay();
    day = days[today];

    var displayTime = function () {
        hour = now.getHours();
        minute = now.getMinutes();
        ampm = hour >= 12 ? 'PM' : 'AM';
        minute = minute < 10 ? '0' + minute : minute;
        time = hour + ':' + minute + ' ' + ampm;

        return time;
    }

    todayDOM.textContent = day;
    timeDOM.textContent = displayTime();

}

//Seeting initial values
init();