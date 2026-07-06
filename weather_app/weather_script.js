const btn = document.getElementById('search-btn');
const user_location_btn = document.getElementById('user-location-btn');
const user_input = document.getElementById('user-input-location');
const close_btn = document.getElementById('close-btn');
const location_name = document.getElementById('location-name');
const location_tempC = document.getElementById('location-temp-c');
const max_tempC = document.getElementById('max-temp-c');
const min_tempC = document.getElementById('min-temp-c');
const location_time = document.getElementById('location-time');
const forecast_icon = document.getElementById('forecast-icon');
const condition = document.getElementById('condition');
let timezone_offset;
let intervalId;  //to store interval id to clear it after closing search-btn

async function weatherData(name) {
    const data = await fetch(`http://api.weatherapi.com/v1/forecast.json?key=c4df9b06310d4524ab2175715242012&q=${name}&days=1&aqi=yes&alerts=yes`);
    // Fetching data from weather API
    return await data.json();
}

async function display_data(user_input) {
    try {
        const value = user_input.value;
        const result = await weatherData(value);
        console.log(result);
    
        location_name.innerText = `${result.location.name}, ${result.location.region} - ${result.location.country}`;
        location_tempC.innerText = `Current Temperature: ${result.current.temp_c} °C`;
        max_tempC.innerText = `Max Temperature: ${result.forecast.forecastday[0].day.maxtemp_c} °C`;
        min_tempC.innerText = `Min Temperature: ${result.forecast.forecastday[0].day.mintemp_c} °C`;
    
        forecast_icon.src = `https://${(result.current.condition.icon).slice(2)}`; 
        condition.innerHTML = `<b>${result.current.condition.text}</b>`

        //getting timezone
        const timezone = result.location.tz_id;
        const locationName = result.location.name;
    
        //immediately display the time once data is fetched
        updateTime(timezone, locationName);
        intervalId = setInterval(() => updateTime(timezone, locationName), 1000);
    }

    catch(error) {
        console.log("Couldn't perform requested operation.\nCause of Error:\n\n" + error.message)
    }
}

function updateTime(timezone, locationName) {
        //craeting a date formatter for the specific timezone
        const formatter = new Intl.DateTimeFormat('en-US', { 
        //'en-US' specifies English (US) as the locale for formatting
            timeZone: timezone,
            hour: '2-digit',    //hours range from 01-24
            minute: '2-digit',  //minutes range from 00-59
            second: '2-digit',  //seconds range from 00-59
            hour12: false       //using 24 hour clock 
        });
        //Intl.DateTimeFormat is a built-in JS API for formatting dates and times according to 
        //specific locales and timezones.

        //current time in the specified timezone
        const localTime = formatter.format(new Date());

        //when we call formatter.format(new Date()), new Date() creates a date object for the current time
        //the formatter converts this time to the specified timezone in XX:XX:XX format

        location_time.innerText = `Local Time in ${locationName}: ${localTime}`;
}

function gotLocation(position) {
    console.log(position)
    const user_position = `${position.coords.latitude} ${position.coords.longitude}`;
    console.log(user_position)

    const user_input_location = {
        value: user_position,
    }
    display_data(user_input_location);

    const result_display = document.getElementById('overlay-result');
    result_display.style.display = 'flex';
}

function failedtogetLocation() {
    alert("Couldn't get User Location");
}

btn.addEventListener('click', () => {
    display_data(user_input);               //beginning

    const result_display = document.getElementById('overlay-result');
    result_display.style.display = 'flex'; //display result overlay
});

user_location_btn.addEventListener('click', async ()=> {    //fetching location is asynchronous
    navigator.geolocation.getCurrentPosition(gotLocation, failedtogetLocation)
                                           //(success callback, error callback)
});

close_btn.addEventListener('click', () => {
    const result_display = document.getElementById('overlay-result');
    result_display.style.display = 'none'; //exit and hide the overlay

    // Clear the interval when closing the overlay to stop time updates
    if (intervalId) {
        clearInterval(intervalId);
    }
});
