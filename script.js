// script.js - Compact Version

const API_KEY = "5eff324e89ebfe358cf9f753dc70b0a7";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

// Default cities
const defaultCities = ["London", "Tokyo", "New York", "Dubai", "Paris", "Berlin", "Mumbai", "Singapore"];

// Store recent searches
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

// DOM Elements
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const mainWeather = document.getElementById('main-weather');
const weatherDetails = document.getElementById('weather-details');
const recentSearchesContainer = document.getElementById('recent-searches');
const globalCitiesContainer = document.getElementById('global-cities');
const refreshMainBtn = document.getElementById('refresh-main');
const refreshGlobalBtn = document.getElementById('refresh-global');
const clearHistoryBtn = document.getElementById('clear-history');
const currentTime = document.getElementById('current-time');
const currentDate = document.getElementById('current-date');
const suggestions = document.querySelectorAll('.suggestion');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Load initial data
    fetchWeather('Pune', true);
    loadRecentSearches();
    fetchGlobalCities();
    
    // Event Listeners
    searchBtn.addEventListener('click', handleSearch);
    
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    refreshMainBtn.addEventListener('click', () => {
        const city = cityInput.value.trim() || 'Pune';
        fetchWeather(city, true);
    });
    
    refreshGlobalBtn.addEventListener('click', fetchGlobalCities);
    
    clearHistoryBtn.addEventListener('click', clearRecentSearches);
    
    // Quick search suggestions
    suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
            const city = suggestion.dataset.city;
            cityInput.value = city;
            fetchWeather(city, true);
            addToRecentSearches(city);
        });
    });
});

// Update time
function updateDateTime() {
    const now = new Date();
    const timeOptions = { hour: '2-digit', minute: '2-digit', hour12: true };
    const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    
    currentTime.textContent = now.toLocaleTimeString('en-US', timeOptions);
    currentDate.textContent = now.toLocaleDateString('en-US', dateOptions);
}

// Handle search
function handleSearch() {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeather(city, true);
        addToRecentSearches(city);
    }
}

// Fetch weather
async function fetchWeather(city, isMain = false) {
    try {
        if (isMain) {
            showLoading(mainWeather);
        }
        
        const response = await fetch(`${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`);
        const data = await response.json();
        
        if (data.cod === 200) {
            if (isMain) {
                displayMainWeather(data);
                displayWeatherDetails(data);
            }
            return data;
        } else {
            throw new Error('City not found');
        }
    } catch (error) {
        if (isMain) {
            showError(mainWeather, 'City not found');
        }
        return null;
    }
}

// Display main weather
function displayMainWeather(data) {
    const weather = data.weather[0];
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    
    mainWeather.innerHTML = `
        <div class="weather-display-compact">
            <div class="weather-icon-compact">
                <i class="fas ${getWeatherIcon(weather.main)}"></i>
            </div>
            <div class="weather-main-compact">
                <div class="city-name-compact">${data.name}, ${data.sys.country}</div>
                <div class="temp-value-compact">${temp}</div>
                <div class="weather-desc-compact">
                    <i class="fas ${getWeatherIcon(weather.main)}"></i>
                    <span>${weather.description}</span>
                </div>
            </div>
        </div>
        <div class="weather-stats-compact">
            <div class="stat-item-compact">
                <i class="fas fa-temperature-low stat-icon-compact"></i>
                <div class="stat-value-compact">${feelsLike}°C</div>
                <div class="stat-label-compact">Feels</div>
            </div>
            <div class="stat-item-compact">
                <i class="fas fa-tint stat-icon-compact"></i>
                <div class="stat-value-compact">${data.main.humidity}%</div>
                <div class="stat-label-compact">Humidity</div>
            </div>
            <div class="stat-item-compact">
                <i class="fas fa-wind stat-icon-compact"></i>
                <div class="stat-value-compact">${data.wind.speed} m/s</div>
                <div class="stat-label-compact">Wind</div>
            </div>
        </div>
    `;
}

// Display weather details
function displayWeatherDetails(data) {
    const sunrise = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    const sunset = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    weatherDetails.innerHTML = `
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-compress-alt"></i> Pressure</div>
            <div class="detail-value-mini">${data.main.pressure} hPa</div>
        </div>
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-eye"></i> Visibility</div>
            <div class="detail-value-mini">${(data.visibility / 1000).toFixed(1)} km</div>
        </div>
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-cloud"></i> Clouds</div>
            <div class="detail-value-mini">${data.clouds.all}%</div>
        </div>
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-sun"></i> Sunrise</div>
            <div class="detail-value-mini">${sunrise}</div>
        </div>
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-moon"></i> Sunset</div>
            <div class="detail-value-mini">${sunset}</div>
        </div>
        <div class="detail-item-mini">
            <div class="detail-label-mini"><i class="fas fa-thermometer"></i> Min/Max</div>
            <div class="detail-value-mini">${Math.round(data.main.temp_min)}°/${Math.round(data.main.temp_max)}°</div>
        </div>
    `;
}

// Weather icon mapping
function getWeatherIcon(weatherMain) {
    const iconMap = {
        'Clear': 'fa-sun',
        'Clouds': 'fa-cloud',
        'Rain': 'fa-cloud-rain',
        'Drizzle': 'fa-cloud-rain',
        'Thunderstorm': 'fa-bolt',
        'Snow': 'fa-snowflake',
        'Mist': 'fa-smog',
        'Smoke': 'fa-smog',
        'Haze': 'fa-smog',
        'Fog': 'fa-smog'
    };
    return iconMap[weatherMain] || 'fa-cloud';
}

// Add to recent searches
async function addToRecentSearches(city) {
    try {
        const weatherData = await fetchWeather(city, false);
        if (!weatherData) return;
        
        // Remove if exists
        recentSearches = recentSearches.filter(item => item.name.toLowerCase() !== city.toLowerCase());
        
        // Add to beginning
        recentSearches.unshift({
            ...weatherData,
            searchTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        });
        
        // Keep only last 5
        recentSearches = recentSearches.slice(0, 5);
        
        // Save
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        
        // Update UI
        loadRecentSearches();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Load recent searches
function loadRecentSearches() {
    if (recentSearches.length === 0) {
        recentSearchesContainer.innerHTML = `
            <div class="empty-state-small">
                <i class="fas fa-history"></i>
                <span>No recent searches</span>
            </div>
        `;
        return;
    }
    
    recentSearchesContainer.innerHTML = recentSearches.map(city => {
        const temp = Math.round(city.main.temp);
        
        return `
            <div class="recent-item" onclick="selectRecentCity('${city.name}')">
                <div class="recent-city-small">${city.name}</div>
                <div class="recent-temp-small">${temp}</div>
            </div>
        `;
    }).join('');
}

// Select recent city
function selectRecentCity(cityName) {
    cityInput.value = cityName;
    fetchWeather(cityName, true);
}

// Clear history
function clearRecentSearches() {
    recentSearches = [];
    localStorage.removeItem('recentSearches');
    loadRecentSearches();
}

// Fetch global cities
async function fetchGlobalCities() {
    try {
        showLoading(globalCitiesContainer, true);
        
        const weatherPromises = defaultCities.map(city => fetchWeather(city, false));
        const weatherData = await Promise.all(weatherPromises);
        
        const validData = weatherData.filter(data => data !== null);
        displayGlobalCities(validData);
    } catch (error) {
        globalCitiesContainer.innerHTML = '<div class="empty-state-small">Failed to load</div>';
    }
}

// Display global cities
function displayGlobalCities(citiesData) {
    globalCitiesContainer.innerHTML = citiesData.map(city => {
        const weather = city.weather[0];
        const temp = Math.round(city.main.temp);
        
        return `
            <div class="city-card-mini" onclick="selectRecentCity('${city.name}')">
                <div class="city-header-mini">
                    <div class="city-name-mini">${city.name}</div>
                    <div class="country-code">${city.sys.country}</div>
                </div>
                <div class="city-weather-mini">
                    <i class="fas ${getWeatherIcon(weather.main)} city-icon-mini"></i>
                    <div class="city-temp-mini">${temp}</div>
                </div>
                <div class="city-details-mini">
                    <div class="city-detail-mini">
                        <i class="fas fa-tint"></i>
                        <span>${city.main.humidity}%</span>
                    </div>
                    <div class="city-detail-mini">
                        <i class="fas fa-wind"></i>
                        <span>${city.wind.speed} m/s</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Show loading
function showLoading(container, isGlobal = false) {
    if (isGlobal) {
        container.innerHTML = `
            <div class="loading-small">
                <div class="spinner-small"></div>
                <span>Loading...</span>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div class="loading-small">
                <div class="spinner-small"></div>
                <span>Loading weather...</span>
            </div>
        `;
    }
}

// Show error
function showError(container, message) {
    container.innerHTML = `
        <div style="text-align: center; padding: 20px; color: var(--danger);">
            <i class="fas fa-exclamation-circle" style="font-size: 20px; margin-bottom: 8px;"></i>
            <div style="font-size: 11px;">${message}</div>
        </div>
    `;
}