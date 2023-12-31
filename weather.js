async function getWeather() {
  const zipCode = document.getElementById('zipCodeInput').value;
  const apiKey = '6000229ba681c93b80335817e159fb87';
  const weatherInfoDiv = document.getElementById('weatherInfo');

  // Clear previous weather information
  weatherInfoDiv.innerHTML = '';

  try {
    // Fetch current weather
    const currentResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?zip=${zipCode}&appid=${apiKey}&units=imperial`);
    const currentWeatherData = await currentResponse.json();

    // Display current weather if available
    if (currentWeatherData.weather && currentWeatherData.weather.length > 0 && currentWeatherData.main) {
      const temperature = Math.round(currentWeatherData.main.temp);
      const unit = '°F';
      const sunriseTime = new Date(currentWeatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/^0/, '');
      const sunsetTime = new Date(currentWeatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(/^0/, '');
      
      const todayCard = document.createElement('div');
      todayCard.classList.add('card', 'text-center', 'aos-init');
      todayCard.setAttribute('data-aos', 'flip-up');

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const cardTitle = document.createElement('h5');
      cardTitle.classList.add('card-title');
      cardTitle.textContent = 'Today\'s Weather Forecast';

      const weatherIcon = document.createElement('img');
      const iconCode = currentWeatherData.weather[0].icon;
      weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}.png`;
      weatherIcon.classList.add('weather-icon');

      const cardText = document.createElement('p');
      cardText.classList.add('card-text');
      
      const weatherDescription = currentWeatherData.weather[0].description;
      const formattedWeather = weatherDescription.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      
      cardText.innerHTML = `<strong>Current Weather:</strong> ${formattedWeather}, ${temperature}${unit}<br><strong>Sunrise:</strong> ${sunriseTime}<br><strong>Sunset:</strong> ${sunsetTime}`;
      

      cardBody.appendChild(cardTitle);
      cardBody.appendChild(weatherIcon);
      cardBody.appendChild(cardText);
      todayCard.appendChild(cardBody);

      weatherInfoDiv.appendChild(todayCard);
    } else {
      throw new Error('Invalid data received from the weather API');
    }

    // Fetch 5-day forecast
    const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?zip=${zipCode}&appid=${apiKey}&units=imperial`);
    const forecastData = await forecastResponse.json();

    // Group forecast data by date
    const dailyForecasts = {};
    forecastData.list.forEach(entry => {
      const date = entry.dt_txt.split(' ')[0]; // Extract date (YYYY-MM-DD)
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }
      dailyForecasts[date].push(entry);
    });

    // Create Bootstrap cards for the next 5 days' forecast
    const cardContainer = document.createElement('div');
    cardContainer.classList.add('card-container', 'w-100');

    const aosDelays = [100, 150, 200, 250, 300]; // AOS transition delays for the 5-day forecast cards

    Object.keys(dailyForecasts).slice(0, 5).forEach((date, index) => {
      const dailyData = dailyForecasts[date];
      const highTemp = Math.round(Math.max(...dailyData.map(entry => entry.main.temp_max)));
      const lowTemp = Math.round(Math.min(...dailyData.map(entry => entry.main.temp_min)));
      const forecastDate = new Date(dailyData[0].dt * 1000);

      const card = document.createElement('div');
      card.classList.add('forecast-card', 'card', 'text-center', 'aos-init');
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', `${aosDelays[index]}`); // Set AOS transition delay

      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');

      const dayOfWeek = document.createElement('h5');
      dayOfWeek.classList.add('card-day');
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      dayOfWeek.textContent = days[forecastDate.getDay()];

      const cardTitle = document.createElement('p');
      cardTitle.classList.add('card-title');
      const formattedDate = `${forecastDate.getMonth() + 1}/${forecastDate.getDate()}`;
      cardTitle.textContent = formattedDate;

      const weatherDescription = dailyData[0].weather[0].description;
      const formattedWeather = weatherDescription.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      const cardText = document.createElement('p');
      cardText.classList.add('card-text');
      cardText.innerHTML = `<strong>${formattedWeather}</strong><br><strong>High:</strong> ${highTemp}°F<br><strong>Low:</strong> ${lowTemp}°F`;

      const weatherIconContainer = document.createElement('div');
      weatherIconContainer.classList.add('d-flex', 'justify-content-center');

      const weatherIcon = document.createElement('img');
      const iconCode = dailyData[0].weather[0].icon;
      weatherIcon.src = `https://openweathermap.org/img/wn/${iconCode}.png`;

      weatherIconContainer.appendChild(weatherIcon);
      cardBody.appendChild(dayOfWeek);
      cardBody.appendChild(cardTitle);
      cardBody.appendChild(weatherIconContainer);
      cardBody.appendChild(cardText);
      card.appendChild(cardBody);
      cardContainer.appendChild(card);
    });

    weatherInfoDiv.appendChild(cardContainer);

    // Initialize AOS
    AOS.init();
    AOS.refresh()

  } catch (error) {
    console.error('Error fetching weather data:', error);
    weatherInfoDiv.textContent = 'Failed to fetch weather data. Please try again.';
  }
}
