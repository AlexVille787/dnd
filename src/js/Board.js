import Column from "./Column.js";

export default class Board {
  constructor() {
    this.columns = [];
    this.init();
  }

  // Инициализация доски
  init() {
    const columnElements = document.querySelectorAll(".column");
    columnElements.forEach((colEl) => {
      const column = new Column(colEl);
      this.columns.push(column);
    });

    // Обработчик клика вне композера
    document.addEventListener("click", (e) => {
      if (
        e.target.closest(".card-composer") ||
        e.target.closest(".add-card-btn")
      ) {
        return;
      }

      this.columns.forEach((column) => {
        if (column.composer.style.display === "block") {
          column.hideComposer();
        }
      });
    });

    console.log("✅ Trello Board загружен!");
  }

  // Поиск колонки по элементу
  findColumn(element) {
    return this.columns.find((col) => col.element === element);
  }

  // Получение всех карточек
  getAllCards() {
    return this.columns.flatMap((col) => col.cards);
  }

  // Получение колонки с наибольшим количеством карточек
  getMostPopulatedColumn() {
    return this.columns.reduce((max, col) =>
      col.cards.length > max.cards.length ? col : max,
    );
  }
}
