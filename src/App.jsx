import React, { useState, useEffect } from 'react';
import './App.css';
import ToDoForm from "./AddTask";
import ToDo from "./Task";
import axios from 'axios';

const TASKS_STORAGE_KEY = 'tasks-list-project-web';

function App() {
  // Состояния приложения
  const [rates, setRates] = useState({});
  const [mapUrl, setMapUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [todos, setTodos] = useState([]);

  // Получение курсов валют от World Bank API
  useEffect(() => {
    async function fetchCurrencyRates() {
      try {
        const response = await axios.get(
          'https://api.worldbank.org/v2/country/all/indicator/PA.NUS.FCRF?format=json&date=2025'
        );

        // Проверка структуры ответа
        if (!response.data || response.data.length < 2) {
          throw new Error('Неверный формат ответа от API');
        }

        const currencyData = response.data[1];
        const usdRate = currencyData.find(item => item.country?.id === 'US')?.value;
        const eurRate = currencyData.find(item => item.country?.id === 'EMU')?.value;

        if (!usdRate || !eurRate) {
          console.log('Полученные данные:', currencyData);
          throw new Error('Не удалось извлечь курсы валют');
        }

        setRates({
          USDrate: (1 / usdRate).toFixed(4),
          EURrate: (1 / eurRate).toFixed(4)
        });
      } catch (err) {
        console.error('Ошибка загрузки курсов:', err);
        // Запасные значения на случай ошибки
        setRates({
          USDrate: '78.600',
          EURrate: '89.791'
        });
        setError('Курсы загружены с запасного источника');
      }
    }

    fetchCurrencyRates();
  }, []);

  // Получение геолокации и создание карты
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Геолокация не поддерживается браузером');
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude: lat, longitude: lon } = position.coords;
        setLocation({ lat, lon });

        // Формируем URL для OpenStreetMap
        const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
          lon-0.01},${lat-0.01},${lon+0.01},${lat+0.01
        }&layer=mapnik&marker=${lat},${lon}`;

        setMapUrl(osmUrl);
        setLoading(false);
      },
      err => {
        console.error('Ошибка геолокации:', err);
        setError('Не удалось определить местоположение');
        setLoading(false);
      }
    );
  }, []);

  // Работа с задачами
  useEffect(() => {
    const storedTasks = localStorage.getItem(TASKS_STORAGE_KEY);
    if (storedTasks) {
      try {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          setTodos(parsedTasks);
        }
      } catch (error) {
        console.error('Ошибка чтения задач:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  // Функции управления задачами
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

  return (
    <div className="App">
      {/* Шапка с курсами и картой */}
      {loading && <div className="loading">Загрузка данных...</div>}

      {!loading && (
        <div className="info-panel">
          <div className="currency-rates">
            <h3>Курсы валют:</h3>
            <div>1 USD = {rates.USDrate} RUB</div>
            <div>1 EUR = {rates.EURrate} RUB</div>
            {error && <div className="error-message">{error}</div>}
          </div>

          {location && (
            <div className="map-container">
              <h3>Ваше местоположение:</h3>
              <iframe
                title="OpenStreetMap"
                width="100%"
                height="300"
                frameBorder="0"
                src={mapUrl}
              />
              <a
                href={`https://www.openstreetmap.org/#map=16/${location.lat}/${location.lon}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Открыть в полном размере
              </a>
            </div>
          )}
        </div>
      )}

      {/* Список задач */}
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
    </div>
  );
}

export default App;