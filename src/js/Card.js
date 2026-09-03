export default class Card {
  constructor(text, column) {
    this.text = text;
    this.column = column;
    this.element = null;
    this.deleteBtn = null;
  }

  // Создает DOM-элемент карточки
  create() {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `<p class="card-text">${this.text}</p>`;

    // Создаем кнопку удаления
    this.createDeleteButton(card);

    // Добавляем анимацию появления
    card.style.animation = "slideIn 0.3s ease";

    // Обработчик клика по карточке (не по кнопке удаления)
    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-delete-btn")) return;
      this.onClick();
    });

    this.element = card;
    return card;
  }

  // Создает кнопку удаления
  createDeleteButton(card) {
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "card-delete-btn";
    deleteBtn.setAttribute("aria-label", "Удалить карточку");
    deleteBtn.title = "Удалить карточку";

    // Обработчик удаления
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.remove();
    });

    card.appendChild(deleteBtn);
    this.deleteBtn = deleteBtn;
  }

  // Обработчик клика по карточке
  onClick() {
    alert(`📋 Содержимое карточки:\n\n${this.text}`);
  }

  // Удаляет карточку с анимацией
  remove() {
    if (!this.element) return;

    // Добавляем класс для анимации удаления
    this.element.classList.add("removing");

    // Удаляем после завершения анимации
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.remove();
        this.column.removeCard(this);
        this.column.updateCount();
      }
    }, 300);
  }

  // Обновляет текст карточки
  updateText(newText) {
    this.text = newText;
    const textEl = this.element.querySelector(".card-text");
    if (textEl) {
      textEl.textContent = newText;
    }
  }
}
