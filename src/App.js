import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloud } from '@fortawesome/free-solid-svg-icons';
import Autosuggest from 'react-autosuggest';

const App = () => {
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const [weather, setWeather] = useState(null);
  const [currentTime, setCurrentTime] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [city, setCity] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const fetchCityName = async (latitude, longitude) => {
      const apiKey = 'cde08dcb207440d9a38692d44d5a37e7';

      try {
        const response = await axios.get(`https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`);
        const city = response.data.results[0].components.city || response.data.results[0].components.town;
        return city;
      } catch (error) {
        console.error('Error fetching city name:', error);
        return 'UnknownCity';
      }
    };
    const fetchWeatherData = async (latitude, longitude) => {
      setIsLoading(true);
      const apiKey = '825b502bf7mshd3009c8060ce4acp1d9cf8jsn3d7b176d1f55';
      try {
        const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=afe8699d26e89acfd2702c91649dc12b`;

        const response = await axios.get(weatherApiUrl);
        const weatherCondition = response.data.weather[0].main;
        setWeather(weatherCondition);
        const options = {
          method: 'GET',
          url: 'https://world-time-by-api-ninjas.p.rapidapi.com/v1/worldtime',
          params: { city: city },
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'world-time-by-api-ninjas.p.rapidapi.com',
          },
        };
        const responseTime = await axios.request(options);
        // const timezoneOffset = response.data.timezone;
        // const currentHour = new Date().getUTCHours();
        // const localHour = (currentHour + timezoneOffset / 3600) % 24; 
        // console.log(localHour)
        const formattedCurrentTime = new Date(responseTime.data.datetime).toLocaleString('en-US', {
          timeZone: responseTime.data.timezone,
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: false,
        });
        let localHour = formattedCurrentTime.split(':')[0]
        // console.log(formattedCurrentTime.split(':')[0])
        setIsDarkTheme(
          (localHour < 6 || localHour >= 18) ||
          (weatherCondition === 'Rain' || weatherCondition === 'Thunderstorm')
        );
        setCurrentTime(formattedCurrentTime);
      } catch (error) {
        console.error('Error fetching weather data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        // console.log(latitude, longitude);
        fetchCityName(latitude, longitude).then((city) => { setCity(city) });
        fetchWeatherData(latitude, longitude);

      });
    } else {
      console.error('Geolocation is not supported by this browser.');
      setIsLoading(false);
    }
  }, [city]);

  const handleSearch = async (event, { suggestion }) => {
    event.preventDefault();
    const apiKey = '825b502bf7mshd3009c8060ce4acp1d9cf8jsn3d7b176d1f55';
    const options = {
      method: 'GET',
      url: 'https://world-time-by-api-ninjas.p.rapidapi.com/v1/worldtime',
      params: { city: suggestion ? suggestion.name : city },
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': 'world-time-by-api-ninjas.p.rapidapi.com',
      },
    };

    try {
      const responseTime = await axios.request(options);
      const searchCity = encodeURIComponent(suggestion ? suggestion.name : city);
      const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=afe8699d26e89acfd2702c91649dc12b`;

      const response = await axios.get(weatherApiUrl);
      const weatherCondition = response.data.weather[0].main;
      setWeather(weatherCondition);
      // console.log(responseTime.data)
      const formattedCurrentTime = new Date(responseTime.data.datetime).toLocaleString('en-US', {
        timeZone: responseTime.data.timezone,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: false,
      });
      let localHour = formattedCurrentTime.split(':')[0]
      setIsDarkTheme(
        (localHour < 6 || localHour >= 18) ||
        (weatherCondition === 'Rain' || weatherCondition === 'Thunderstorm')
      );

      setCurrentTime(formattedCurrentTime);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setIsLoading(false);
    }
  };


  //suggestions
  const handleSuggestionsFetchRequested = async ({ value }) => {
    try {
      const suggestionsApiUrl = `https://api.openweathermap.org/data/2.5/find?q=${value}&type=like&sort=population&cnt=5&appid=afe8699d26e89acfd2702c91649dc12b`;
      const response = await axios.get(suggestionsApiUrl);
      setSuggestions(response.data.list);
    } catch (error) {
      console.error('Error fetching city suggestions:', error);
    }
  };

  const handleSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => suggestion.name;

  const renderSuggestion = (suggestion) => (
    <div>
      {suggestion.name}, {suggestion.sys.country}
    </div>
  );

  //getting icons
  const getWeatherIcon = (weatherCondition) => {
    switch (weatherCondition) {
      case 'Clear':
        return <img src="https://img.icons8.com/color/48/000000/sun--v1.png" alt="Clear" className="icon" />;
      case 'Clouds':
        return <img src="https://img.icons8.com/color/48/000000/clouds.png" alt="Clouds" className="icon" />;
      case 'Rain':
        return <img src="https://img.icons8.com/color/48/000000/rain.png" alt="Rain" className="icon" />;
      case 'Thunderstorm':
        return <img src="https://img.icons8.com/color/48/000000/storm.png" alt="ThunderStorm" className="icon" />;
      case 'Snow':
        return <img src="https://img.icons8.com/color/48/000000/snow.png" alt="Snow" className="icon" />;
      case 'Drizzle':
        return <img src="https://img.icons8.com/color/48/000000/drizzle.png" alt="Drizzle" className="icon" />;
      case 'Mist':
        return <img width="48" height="48" src="https://img.icons8.com/fluency/48/foggy-night-1.png" alt="Mist" />
      default:
        return <FontAwesomeIcon icon={faCloud} className="icon" />;
    }
  };

  return (
    <div className={`container ${isDarkTheme ? 'dark-theme' : 'light-theme'}`}>
      <h1 className="text-3xl font-bold mb-4">WeatherApp</h1>
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={handleSuggestionsFetchRequested}
        onSuggestionsClearRequested={handleSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={{
          placeholder: 'Type a city...',
          value: city,
          className: "input",
          onChange: (_, { newValue }) => setCity(newValue),
        }}
        onSuggestionSelected={handleSearch}
      />
      {isLoading && <p>Loading...</p>}
      {weather && (
        <div className={`card ${isDarkTheme ? 'dark-theme' : 'light-theme'} `}>
          <p className="mb-4">
            {getWeatherIcon(weather)} Current Weather: {weather}
          </p>
          {currentTime && (
            <p>
              Current Time: {currentTime}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
