import React, { useState } from "react";

/**
 * Компонент формы для добавления новой задачи
 * @param {Function} addTask - Функция добавления задачи
 */
const ToDoForm = ({ addTask }) => {
  const [userInput, setUserInput] = useState("");

  /**
   * Обработчик изменения значения в поле ввода
   * @param {Object} e - Событие изменения
   */
  const handleChange = (e) => {
    setUserInput(e.currentTarget.value);
  };

  /**
   * Обработчик отправки формы
   * @param {Object} e - Событие формы
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      addTask(userInput);
      setUserInput("");
    }
  };

  /**
   * Обработчик нажатия клавиш
   * @param {Object} e - Событие клавиатуры
   */
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <input
        value={userInput}
        type="text"
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        placeholder="Введите значение..."
        aria-label="Введите новую задачу"
        className="todo-input"
      />
      <button
        type="submit"
        className="todo-button"
        disabled={!userInput.trim()}
      >
        Сохранить
      </button>
    </form>
  );
};

export default ToDoForm;