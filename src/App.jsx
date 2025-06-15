import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';
const YEARS = Array.from({ length: 16 }, (_, i) => 2010 + i); // 2010-2025
const CRYPTO_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 минут в миллисекундах
const MOVIES_COUNT = 4; // Количество отображаемых фильмов

// Emoji для криптовалют
const CRYPTO_EMOJIS = {
  BTC: '₿', // Символ биткоина
  ETH: 'Ξ', // Символ эфира
  SOL: '◎'  // Символ соланы
};

function App() {
  const [cryptoRates, setCryptoRates] = useState({
    BTC: 'Загрузка...',
    ETH: 'Загрузка...',
    SOL: 'Загрузка...'
  });
  const [movies, setMovies] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2025);
  const [loading, setLoading] = useState({
    crypto: true,
    movies: true
  });
  const [error, setError] = useState({
    crypto: '',
    movies: ''
  });
  const [todos, setTodos] = useState(() => {
    try {
      const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
      return storedTasks ? JSON.parse(storedTasks) : [];
    } catch (error) {
      console.error('Ошибка при загрузке задач:', error);
      return [];
    }
  });
  const lastUpdateTime = useRef(0);

  // Получение курсов криптовалют от Binance
  useEffect(() => {
    const fetchCryptoRates = async () => {
      try {
        const now = Date.now();
        if (now - lastUpdateTime.current < CRYPTO_UPDATE_INTERVAL) {
          return;
        }

        const [btcResponse, ethResponse, solResponse] = await Promise.all([
          axios.get('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT'),
          axios.get('https://api.binance.com/api/v3/ticker/price?symbol=ETHUSDT'),
          axios.get('https://api.binance.com/api/v3/ticker/price?symbol=SOLUSDT')
        ]);

        setCryptoRates({
          BTC: parseFloat(btcResponse.data.price).toFixed(2),
          ETH: parseFloat(ethResponse.data.price).toFixed(2),
          SOL: parseFloat(solResponse.data.price).toFixed(2)
        });

        lastUpdateTime.current = now;
        setError(prev => ({ ...prev, crypto: '' }));
      } catch (err) {
        console.error('Ошибка Binance API:', err);
        setError(prev => ({ ...prev, crypto: 'Не удалось загрузить курсы' }));
      } finally {
        setLoading(prev => ({ ...prev, crypto: false }));
      }
    };

    fetchCryptoRates();
    const interval = setInterval(fetchCryptoRates, CRYPTO_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  // Получение топ-4 фильмов за выбранный год
  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(prev => ({ ...prev, movies: true }));
      setError(prev => ({ ...prev, movies: '' }));

      try {
        const response = await axios.get(
          `https://kinopoiskapiunofficial.tech/api/v2.2/films?yearFrom=${selectedYear}&yearTo=${selectedYear}&order=NUM_VOTE&type=FILM`,
          {
            headers: {
              'X-API-KEY': '61c118bd-ce1c-4b0e-8740-841563644f22',
              'Content-Type': 'application/json'
            }
          }
        );

        setMovies(response.data.items.slice(0, MOVIES_COUNT));
      } catch (err) {
        console.error('Ошибка Кинопоиск API:', err);
        setError(prev => ({ ...prev, movies: 'Не удалось загрузить фильмы' }));
        setMovies([]);
      } finally {
        setLoading(prev => ({ ...prev, movies: false }));
      }
    };

    fetchMovies();
  }, [selectedYear]);

  // Сохранение задач в localStorage при изменении
  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const addTask = (userInput) => {
    if (userInput.trim()) {
      const newItem = {
        id: Math.random().toString(36).slice(2, 9),
        task: userInput,
        complete: false
      };
      setTodos([...todos, newItem]);
    }
  };

  const removeTask = (id) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos(todos.map(task =>
      task.id === id ? { ...task, complete: !task.complete } : task
    ));
  };

  // Открытие страницы фильма на Кинопоиске
  const openKinopoisk = (filmId) => {
    window.open(`https://www.kinopoisk.ru/film/${filmId}/`, '_blank');
  };

  // Открытие торгов на Binance
  const openBinanceTrading = (symbol) => {
    window.open(`https://www.binance.com/ru/trade/${symbol}_USDT`, '_blank');
  };

  return (
    <div className="App">
      {/* Блок с задачами - теперь в самом верху */}
      <div className="todo-container">
        <h2>Список задач: {todos.length}</h2>
        <ToDoForm addTask={addTask} />

        <div className="todo-list">
          {todos.map(todo => (
            <ToDo
              key={todo.id}
              todo={todo}
              toggleTask={handleToggle}
              removeTask={removeTask}
            />
          ))}
        </div>
      </div>

      {/* Блок с криптовалютами и фильмами */}
      <div className="info-panel">
        <div className="crypto-rates">
          <h3>Курсы криптовалют:</h3>
          {loading.crypto ? (
            <div>Загрузка...</div>
          ) : (
            <div className="crypto-grid">
              {Object.entries(cryptoRates).map(([symbol, rate]) => (
                <div
                  key={symbol}
                  className="crypto-item"
                  onClick={() => openBinanceTrading(symbol)}
                >
                  <span className="crypto-emoji">{CRYPTO_EMOJIS[symbol]}</span>
                  <div className="crypto-info">
                    <div className="crypto-name">{symbol}</div>
                    <div className="crypto-rate">1 {symbol} = {rate} USDT</div>
                  </div>
                </div>
              ))}
              {error.crypto && <div className="error-message">{error.crypto}</div>}
            </div>
          )}
        </div>

        {/* Блок с фильмами */}
        <div className="movies-widget">
          <div className="movies-header">
            <h3>Топ-{MOVIES_COUNT} фильмов</h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="year-selector"
            >
              {YEARS.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          {loading.movies ? (
            <div className="loading-movies">Загрузка фильмов...</div>
          ) : error.movies ? (
            <div className="error-message">{error.movies}</div>
          ) : movies.length > 0 ? (
            <div className="movies-grid">
              {movies.map(movie => (
                <div
                  key={movie.kinopoiskId || movie.filmId}
                  className="movie-card"
                  onClick={() => openKinopoisk(movie.kinopoiskId || movie.filmId)}
                >
                  <img
                    src={movie.posterUrlPreview || 'https://via.placeholder.com/100x150?text=No+poster'}
                    alt={movie.nameRu || movie.nameEn}
                    className="movie-poster"
                  />
                  <div className="movie-info">
                    <div className="movie-title">{movie.nameRu || movie.nameEn}</div>
                    <div className="movie-year">{movie.year}</div>
                    <div className="movie-rating">
                      Рейтинг: {movie.ratingKinopoisk || movie.ratingImdb || 'Н/Д'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-movies">Нет данных о фильмах за этот год</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;