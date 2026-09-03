export default class Card {
  constructor(text, column) {
    this.text = text;
    this.column = column;
    this.element = null;
  }

  // Создает DOM-элемент карточки
  create() {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<p class="card-text">${this.text}</p>`;

    // Добавляем анимацию появления
    card.style.animation = "slideIn 0.3s ease";

    // Обработчик клика
    card.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;
      this.onClick();
    });

    this.element = card;
    return card;
  }

  // Обработчик клика по карточке
  onClick() {
    alert(`📋 Содержимое карточки:\n\n${this.text}`);
  }

  // Удаляет карточку
  remove() {
    if (this.element && this.element.parentNode) {
      this.element.remove();
      this.column.updateCount();
    }
  }
}
