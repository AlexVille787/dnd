import Card from "./Card.js";

export default class Column {
  constructor(columnElement) {
    this.element = columnElement;
    this.cards = [];
    this.content = this.element.querySelector(".column-content");
    this.countEl = this.element.querySelector(".column-count");
    this.composer = this.element.querySelector(".card-composer");
    this.addBtn = this.element.querySelector(".add-card-btn");
    this.menuBtn = this.element.querySelector(".column-menu");
    this.titleEl = this.element.querySelector(".column-title");

    this.init();
  }

  // Инициализация колонки
  init() {
    this.updateCount();
    this.initCards();
    this.initComposer();
    this.initMenu();
  }

  // Инициализация существующих карточек
  initCards() {
    const cardElements = this.content.querySelectorAll(".card");
    cardElements.forEach((cardEl) => {
      const textEl = cardEl.querySelector(".card-text");
      if (textEl) {
        const card = new Card(textEl.textContent, this);
        card.element = cardEl;

        // Создаем кнопку удаления для существующей карточки
        this.addDeleteButtonToExistingCard(cardEl, card);

        this.cards.push(card);
      }
    });
  }

  // Добавляет кнопку удаления к существующей карточке
  addDeleteButtonToExistingCard(cardElement, card) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "card-delete-btn";
    deleteBtn.setAttribute("aria-label", "Удалить карточку");
    deleteBtn.title = "Удалить карточку";

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      card.remove();
    });

    cardElement.appendChild(deleteBtn);
    card.deleteBtn = deleteBtn;

    // Переопределяем обработчик клика
    cardElement.addEventListener("click", (e) => {
      if (e.target.closest(".card-delete-btn")) return;
      card.onClick();
    });
  }

  // Добавление новой карточки
  addCard(text) {
    const card = new Card(text, this);
    const cardElement = card.create();
    this.content.appendChild(cardElement);
    this.cards.push(card);
    this.updateCount();

    // Прокручиваем к новой карточке
    cardElement.scrollIntoView({ behavior: "smooth", block: "nearest" });

    return card;
  }

  // Удаление карточки из массива
  removeCard(card) {
    const index = this.cards.indexOf(card);
    if (index !== -1) {
      this.cards.splice(index, 1);
    }
  }

  // Обновление счетчика карточек
  updateCount() {
    if (this.countEl) {
      this.countEl.textContent = this.cards.length;
    }
  }

  // Инициализация композера
  initComposer() {
    const input = this.composer.querySelector(".card-composer-input");
    const addBtn = this.composer.querySelector(".btn-add-card");
    const closeBtn = this.composer.querySelector(".btn-close-composer");

    // Показ композера
    this.addBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.showComposer();
    });

    // Добавление карточки
    const handleAddCard = () => {
      const text = input.value.trim();
      if (!text) {
        input.style.borderColor = "#eb5a46";
        input.placeholder = "Введите название карточки!";
        setTimeout(() => {
          input.style.borderColor = "#026aa7";
          input.placeholder = "Enter a title for this card...";
        }, 2000);
        return;
      }

      this.addCard(text);
      this.hideComposer();
      input.value = "";
    };

    addBtn.addEventListener("click", handleAddCard);

    // Добавление по Enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleAddCard();
      }
      if (e.key === "Escape") {
        this.hideComposer();
      }
    });

    // Закрытие композера
    closeBtn.addEventListener("click", () => {
      this.hideComposer();
    });
  }

  // Показ композера
  showComposer() {
    // Скрываем все другие композеры
    document.querySelectorAll(".card-composer").forEach((c) => {
      if (c !== this.composer) {
        c.style.display = "none";
        const otherBtn = c.closest(".column").querySelector(".add-card-btn");
        if (otherBtn) otherBtn.style.display = "block";
      }
    });

    this.composer.style.display = "block";
    this.addBtn.style.display = "none";
    const input = this.composer.querySelector(".card-composer-input");
    input.value = "";
    input.focus();
  }

  // Скрытие композера
  hideComposer() {
    this.composer.style.display = "none";
    this.addBtn.style.display = "block";
    const input = this.composer.querySelector(".card-composer-input");
    input.value = "";
    input.style.borderColor = "#026aa7";
  }

  // Инициализация меню колонки
  initMenu() {
    this.menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showMenu();
    });
  }

  // Показ меню колонки
  showMenu() {
    const title = this.titleEl.textContent.trim();
    const count = this.cards.length;

    const options = [
      `📊 Колонка: ${title}`,
      `📝 Карточек: ${count}`,
      "─────────────",
      "✏️ Переименовать",
      "🗑️ Очистить колонку",
    ].join("\n");

    const action = prompt(options + "\n\nВведите номер действия (1-4):");

    if (action === "3") {
      this.renameColumn();
    } else if (action === "4") {
      this.clearColumn();
    }
  }

  // Переименование колонки
  renameColumn() {
    const currentTitle = this.titleEl.textContent.replace(/^[^\s]+\s/, "");
    const newTitle = prompt("Введите новое название:", currentTitle);
    if (newTitle && newTitle.trim()) {
      const emoji = this.titleEl.textContent.match(/^.{1,2}/)?.[0] || "📌";
      this.titleEl.textContent = `${emoji} ${newTitle.trim()}`;
    }
  }

  // Очистка колонки
  clearColumn() {
    if (confirm("Удалить все карточки в этой колонке?")) {
      this.cards = [];
      this.content.innerHTML = "";
      this.updateCount();
    }
  }
}
