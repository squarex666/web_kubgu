import React from "react";

/**
 * Компонент для отображения отдельной задачи
 * @param {Object} props - Свойства компонента
 * @param {Object} props.todo - Объект задачи
 * @param {Function} props.toggleTask - Функция переключения статуса задачи
 * @param {Function} props.removeTask - Функция удаления задачи
 */
const ToDo = ({ todo, toggleTask, removeTask }) => {
  return (
    <div className="item-todo">
      {/* Блок с текстом задачи */}
      <div
        className={`item-text ${todo.complete ? "completed" : ""}`}
        onClick={() => toggleTask(todo.id)}
      >
        {todo.task}
      </div>

      {/* Кнопка удаления задачи - теперь с правильным позиционированием */}
      <button
        className="item-delete"
        onClick={() => removeTask(todo.id)}
        aria-label="Удалить задачу"
      >
        ×
      </button>
    </div>
  );
};

export default ToDo;