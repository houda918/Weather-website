function updateDateTime() {
    const dateTimeElement = document.getElementById('date-time');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString(undefined, options);
    const time = now.toLocaleTimeString();

    dateTimeElement.textContent = `${date} | ${time}`;
}

setInterval(updateDateTime, 1000);

updateDateTime();


const apiKey = 'b2cf283c7dd421690c6bc1ee72b30c0f'; 

function fetchWeatherWithGraph() {

    const city = document.getElementById('search').value;
    if (!city) {
        alert('Please enter a city name.');
        return;
    }
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.cod !== 200) {
                alert('City not found.');
                return;
            }

            const weatherContainer = document.getElementById('weather');
            weatherContainer.style.display = 'block'; 

            const weatherHTML = `
                <h2>Weather in ${data.name}, ${data.sys.country}</h2>
                <div class="weather-info">
                    <div class="weather-icon">
                        <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                    </div>
                    <div>
                        <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
                        <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                        <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
                    </div>
                    <div>
                        <p><strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
                        <p><strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
                    </div>
                </div>
            `;

            weatherContainer.innerHTML = weatherHTML;

            return fetch(forecastApiUrl);
        })
        .then(response => response.json())
        .then(data => {
            if (data.cod !== "200") {
                alert('Error fetching forecast data.');
                return;
            }

            const labels = [];
            const temperatures = [];
            const windSpeeds = [];
            const dailyForecast = {};

            data.list.forEach(item => {
                const date = new Date(item.dt * 1000).toLocaleDateString();
                if (!dailyForecast[date]) {
                    dailyForecast[date] = { temps: [], icons: [], descriptions: [] };
                }
                dailyForecast[date].temps.push(item.main.temp);
                dailyForecast[date].icons.push(item.weather[0].icon);
                dailyForecast[date].descriptions.push(item.weather[0].description);
            });

            const forecastContainer = document.getElementById('forecast-cards');
            forecastContainer.innerHTML = '';

            Object.keys(dailyForecast).slice(0, 5).forEach(date => {
                const temps = dailyForecast[date].temps;
                const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                const icon = dailyForecast[date].icons[0];
                const description = dailyForecast[date].descriptions[0];

                const cardHTML = `
                    <div class="forecast-card">
                        <p><strong>${date}</strong></p>
                        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                        <p>${avgTemp} °C</p>
                        <p>${description}</p>
                    </div>
                `;
                forecastContainer.innerHTML += cardHTML;
            });

            data.list.slice(0, 8).forEach(item => {
                const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                labels.push(time);
                temperatures.push(item.main.temp);
                windSpeeds.push(item.wind.speed);
            });

            renderWeatherChart(labels, temperatures, windSpeeds);
            const chartContainer = document.getElementById('chart_container');
            chartContainer.style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            alert('An error occurred while fetching weather data.');
        });
}







function fetchWeatherByLocation() {
    const apiKey = 'b2cf283c7dd421690c6bc1ee72b30c0f'; 
    const weatherContainer = document.getElementById('weather');
    const forecastContainer = document.getElementById('forecast-cards');
    const chartContainer = document.getElementById('chart_container'); 

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;

            
            fetch(apiUrl)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    weatherContainer.style.display = 'block';

                    const weatherHTML = `
                        <h2>Weather in ${data.name}, ${data.sys.country}</h2>
                        <div class="weather-info">
                            <div class="weather-icon">
                                <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
                            </div>
                            <div>
                                <p><strong>Temperature:</strong> ${data.main.temp} °C</p>
                                <p><strong>Humidity:</strong> ${data.main.humidity}%</p>
                                <p><strong>Wind Speed:</strong> ${data.wind.speed} m/s</p>
                            </div>
                            <div>
                                <p><strong>Sunrise:</strong> ${new Date(data.sys.sunrise * 1000).toLocaleTimeString()}</p>
                                <p><strong>Sunset:</strong> ${new Date(data.sys.sunset * 1000).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    `;
                    weatherContainer.innerHTML = weatherHTML;

                    
                    return fetch(forecastApiUrl);
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Forecast API error: ${response.status} ${response.statusText}`);
                    }
                    return response.json();
                })
                .then(data => {
                    forecastContainer.innerHTML = '';

                    const dailyForecast = {};
                    const labels = [];
                    const temperatures = [];
                    const windSpeeds = [];

                    data.list.forEach(item => {
                        const date = new Date(item.dt * 1000).toLocaleDateString();
                        if (!dailyForecast[date]) {
                            dailyForecast[date] = { temps: [], icons: [], descriptions: [], windSpeeds: [] };
                        }
                        dailyForecast[date].temps.push(item.main.temp);
                        dailyForecast[date].icons.push(item.weather[0].icon);
                        dailyForecast[date].descriptions.push(item.weather[0].description);
                        dailyForecast[date].windSpeeds.push(item.wind.speed);
                    });

                    Object.keys(dailyForecast).slice(0, 5).forEach(date => {
                        const temps = dailyForecast[date].temps;
                        const avgTemp = (temps.reduce((a, b) => a + b, 0) / temps.length).toFixed(1);
                        const icon = dailyForecast[date].icons[0];
                        const description = dailyForecast[date].descriptions[0];
                        const avgWindSpeed = (dailyForecast[date].windSpeeds.reduce((a, b) => a + b, 0) / dailyForecast[date].windSpeeds.length).toFixed(1);

                        labels.push(date); 
                        temperatures.push(avgTemp);  
                        windSpeeds.push(avgWindSpeed); 

                        const cardHTML = `
                            <div class="forecast-card">
                                <p><strong>${date}</strong></p>
                                <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}">
                                <p>${avgTemp} °C</p>
                                <p>${description}</p>
                            </div>
                        `;
                        forecastContainer.innerHTML += cardHTML;
                    });

                    
                    renderWeatherChart(labels, temperatures, windSpeeds);
                    chartContainer.style.display = 'block';
                })
                .catch(error => {
                    console.error('Error fetching weather data:', error);
                    alert(`An error occurred: ${error.message}`);
                });
        }, error => {
            console.error('Geolocation error:', error);
            alert('Unable to retrieve your location. Please ensure location services are enabled.');
        });
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

function renderWeatherChart(labels, temperatures, windSpeeds) {
    const ctx = document.getElementById('weather-chart').getContext('2d');
    
    if (window.weatherChart) {
        window.weatherChart.destroy();
    }

    window.weatherChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: temperatures,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true,
                    tension: 0.4,
                },
                {
                    label: 'Wind Speed (m/s)',
                    data: windSpeeds,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    fill: true,
                    tension: 0.4,
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    enabled: true,
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Value'
                    }
                }
            }
        }
    });
}
