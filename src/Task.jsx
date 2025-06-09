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
    <div
      key={todo.id + todo.key}
      className="item-todo"
    >
      {/* Блок с текстом задачи */}
      <div
        onClick={() => toggleTask(todo.id)}
        className={todo.complete ? "item-text strike" : "item-text"}
      >
        {todo.task}
      </div>

      {/* Кнопка удаления задачи */}
      <div
        className="item-delete"
        onClick={() => removeTask(todo.id)}
        aria-label="Удалить задачу"
      >
        ×
      </div>
    </div>
  );
};

export default ToDo;