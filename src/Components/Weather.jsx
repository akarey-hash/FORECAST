import React, { useState, useEffect } from "react";
import "./Karey.css";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;

const WeatherApp = () => {
  const [city, setCity] = useState("New York");
  const [query, setQuery] = useState("New York"); // Controlled input for search
  const [daily, setDaily] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLightTheme, setIsLightTheme] = useState(false); // Theme toggle state

  const fetchWeatherData = async (searchCity) => {
    setLoading(true);
    setError(null);
    try {
      const currentRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      if (!currentRes.ok) throw new Error("City not found");
      const currentData = await currentRes.json();
      setDaily(currentData);

      const forecastRes = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${searchCity}&appid=${API_KEY}&units=metric`
      );
      if (!forecastRes.ok) throw new Error("Forecast not found");
      const forecastData = await forecastRes.json();

      // Filter to only 12:00:00 time forecasts for 5 days
      const filteredForecast = forecastData.list.filter((reading) =>
        reading.dt_txt.includes("12:00:00")
      );
      setForecast(filteredForecast);
      setCity(searchCity);
    } catch (err) {
      setError(err.message);
      setDaily(null);
      setForecast([]);
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch on mount and whenever city changes
  useEffect(() => {
    fetchWeatherData(city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recommendation logic
  function getRecommendation(weather) {
    if (!weather) return { text: "", icon: "" };

    const condition = weather.weather[0].main.toLowerCase();
    const temp = weather.main.temp;

    if (condition.includes("rain")) {
      return { text: "Stay indoors! It's raining ☔️", icon: "☔️" };
    } else if (condition.includes("snow")) {
      return { text: "Bundle up! Snow is falling ❄️", icon: "❄️" };
    } else if (temp < 10) {
      return { text: "Brrr! Wear something warm 🧣", icon: "🧣" };
    } else if (temp > 30) {
      return { text: "Stay hydrated! It’s super hot 🔥", icon: "🔥" };
    } else if (condition.includes("clear")) {
      return { text: "Enjoy the sunshine! 😎", icon: "😎" };
    } else if (condition.includes("cloud")) {
      return { text: "It’s a bit cloudy ☁️ but fine outside", icon: "☁️" };
    } else {
      return { text: "Have a nice day! 🌈", icon: "🌈" };
    }
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeatherData(query.trim());
    }
  };

  // Theme toggle handler
  const toggleTheme = () => {
    setIsLightTheme((prev) => !prev);
  };

  return (
    <div className={`weather-container ${isLightTheme ? "light-theme" : ""}`}>
      <h1>Weather App</h1>

      {/* Toggle Theme Button */}
      <button id="toggleThemeBtn" onClick={toggleTheme} aria-pressed={isLightTheme}>
        Switch to {isLightTheme ? "Dark" : "Light"} Mode
      </button>

      <form onSubmit={handleSearchSubmit}>
        <input
          type="text"
          placeholder="Enter city"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="City name"
        />
        <button type="submit">Search</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red", fontWeight: "600" }}>{error}</p>
      ) : (
        <>
          {daily && (
            <div className="current-weather-section">
              {/* Daily Weather Card */}
              <div className="current-weather">
                <h2>Today in {daily.name}</h2>
                <img
                  src={`https://openweathermap.org/img/wn/${daily.weather[0].icon}@2x.png`}
                  alt={daily.weather[0].description}
                />
                <p>Temp: {daily.main.temp}°C</p>
                <p>Condition: {daily.weather[0].description}</p>
                <p>Humidity: {daily.main.humidity}%</p>
                <p>Wind: {daily.wind.speed} m/s</p>
              </div>

              {/* Recommendation Card */}
              <div className="recommendation-card">
                {(() => {
                  const rec = getRecommendation(daily);
                  return (
                    <>
                      <p
                        className="rec-icon"
                        aria-label="weather recommendation"
                        title={rec.text}
                      >
                        {rec.icon}
                      </p>
                      <p className="rec-text">{rec.text}</p>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          <h3>5-Day Forecast</h3>
          <div className="forecast">
            {forecast.map((day) => (
              <div key={day.dt} className="forecast-day">
                <p>{new Date(day.dt_txt).toDateString()}</p>
                <img
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                  alt={day.weather[0].description}
                />
                <p>Temp: {day.main.temp}°C</p>
                <p>{day.weather[0].main}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default WeatherApp;
