export default class DragAndDrop {
  constructor(board) {
    this.board = board;
    this.draggedCard = null;
    this.draggedElement = null;
    this.dragClone = null;
    this.ghostElement = null;
    this.placeholder = null;
    this.startColumn = null;
    this.startIndex = null;
    this.isDragging = false;
    this.offsetX = 0;
    this.offsetY = 0;
    this.cardHeight = 0;

    this.init();
  }

  init() {
    this.addDragListeners();
    this.addGlobalListeners();
  }

  addDragListeners() {
    document.addEventListener("mousedown", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      if (e.target.closest(".card-delete-btn")) return;
      if (e.target.closest(".add-card-btn")) return;
      if (e.target.closest(".card-composer")) return;

      this.startDrag(e, card);
    });

    document.addEventListener(
      "touchstart",
      (e) => {
        const card = e.target.closest(".card");
        if (!card) return;
        if (e.target.closest(".card-delete-btn")) return;

        const touch = e.touches[0];
        this.startDrag(
          {
            clientX: touch.clientX,
            clientY: touch.clientY,
            preventDefault: () => {},
          },
          card,
        );
      },
      { passive: true },
    );
  }

  addGlobalListeners() {
    document.addEventListener("mousemove", (e) => {
      if (this.isDragging) {
        this.onDrag(e.clientX, e.clientY);
      }
    });

    document.addEventListener("mouseup", () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });

    document.addEventListener(
      "touchmove",
      (e) => {
        if (this.isDragging) {
          const touch = e.touches[0];
          this.onDrag(touch.clientX, touch.clientY);
          e.preventDefault();
        }
      },
      { passive: false },
    );

    document.addEventListener("touchend", () => {
      if (this.isDragging) {
        this.endDrag();
      }
    });
  }

  startDrag(e, card) {
    e.preventDefault();

    const column = card.closest(".column");
    if (!column) return;

    const columnObj = this.board.findColumn(column);
    if (!columnObj) return;

    const cardIndex = columnObj.cards.findIndex((c) => c.element === card);
    if (cardIndex === -1) return;

    // Сохраняем все данные
    this.draggedCard = columnObj.cards[cardIndex];
    this.draggedElement = card;
    this.startColumn = columnObj;
    this.startIndex = cardIndex;
    this.isDragging = true;

    // Сохраняем высоту карточки
    const rect = card.getBoundingClientRect();
    this.cardHeight = rect.height;
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;

    // Создаем клон для перетаскивания
    this.createDragClone(card, e);

    // Создаем призрачную область на месте карточки (всегда размером с карточку)
    this.createGhost(card);

    // Создаем плейсхолдер для вставки
    this.createPlaceholder(card);

    // Делаем оригинальную карточку полупрозрачной и скрываем
    card.style.opacity = "0.3";
    card.style.transform = "scale(0.95)";
    card.style.display = "none";

    // Меняем курсор
    document.body.style.cursor = "grabbing";
    document.body.classList.add("dragging-active");
  }

  createDragClone(card, e) {
    const clone = card.cloneNode(true);
    clone.classList.add("drag-clone");
    clone.style.position = "fixed";
    clone.style.pointerEvents = "none";
    clone.style.zIndex = "1000";
    clone.style.width = card.offsetWidth + "px";
    clone.style.height = this.cardHeight + "px";
    clone.style.opacity = "0.85";
    clone.style.transform = "rotate(2deg) scale(1.02)";
    clone.style.boxShadow = "0 12px 40px rgba(0,0,0,0.25)";
    clone.style.transition = "none";

    // Удаляем кнопку удаления из клона
    const deleteBtn = clone.querySelector(".card-delete-btn");
    if (deleteBtn) deleteBtn.remove();

    // Позиционируем клон
    clone.style.left = e.clientX - this.offsetX + "px";
    clone.style.top = e.clientY - this.offsetY + "px";

    document.body.appendChild(clone);
    this.dragClone = clone;
  }

  createGhost(card) {
    // Удаляем старый призрак если есть
    if (this.ghostElement) {
      this.ghostElement.remove();
    }

    const ghost = document.createElement("div");
    ghost.className = "drag-ghost";
    ghost.style.height = this.cardHeight + "px";
    ghost.style.margin = "8px 0";
    ghost.style.borderRadius = "8px";
    ghost.style.backgroundColor = "#e8f0fe";
    ghost.style.border = "2px dashed #026aa7";
    ghost.style.opacity = "0.5";
    ghost.style.transition = "all 0.2s ease";
    ghost.style.pointerEvents = "none";
    ghost.style.flexShrink = "0";

    // Вставляем призрачную область на место карточки
    card.parentNode.insertBefore(ghost, card);
    this.ghostElement = ghost;
  }

  createPlaceholder(card) {
    // Удаляем старый плейсхолдер если есть
    if (this.placeholder) {
      this.placeholder.remove();
    }

    const placeholder = document.createElement("div");
    placeholder.className = "drag-placeholder";
    placeholder.style.height = this.cardHeight + "px";
    placeholder.style.margin = "8px 0";
    placeholder.style.borderRadius = "8px";
    placeholder.style.backgroundColor = "rgba(2, 106, 167, 0.08)";
    placeholder.style.border = "2px dashed #026aa7";
    placeholder.style.transition = "all 0.2s ease";
    placeholder.style.display = "none";
    placeholder.style.flexShrink = "0";

    // Вставляем плейсхолдер на место карточки (после призрака)
    if (this.ghostElement) {
      this.ghostElement.parentNode.insertBefore(
        placeholder,
        this.ghostElement.nextSibling,
      );
    } else {
      card.parentNode.insertBefore(placeholder, card);
    }

    this.placeholder = placeholder;
  }

  onDrag(clientX, clientY) {
    if (!this.isDragging) return;

    // Обновляем позицию клона
    if (this.dragClone) {
      this.dragClone.style.left = clientX - this.offsetX + "px";
      this.dragClone.style.top = clientY - this.offsetY + "px";
    }

    // Находим элемент под курсором
    const elementBelow = document.elementFromPoint(clientX, clientY);
    if (!elementBelow) {
      this.placeholder.style.display = "none";
      return;
    }

    // Проверяем, находится ли курсор над колонкой
    const columnBelow = elementBelow.closest(".column");
    if (!columnBelow) {
      this.placeholder.style.display = "none";
      return;
    }

    // Получаем все карточки в колонке (кроме перетаскиваемой)
    const cards = columnBelow.querySelectorAll(".card:not(.dragging)");
    const columnContent = columnBelow.querySelector(".column-content");

    if (!columnContent) {
      this.placeholder.style.display = "none";
      return;
    }

    // Проверяем, есть ли карточки в колонке
    if (cards.length === 0) {
      // Пустая колонка - показываем плейсхолдер в начале
      this.placeholder.style.display = "block";
      columnContent.insertBefore(this.placeholder, columnContent.firstChild);
      return;
    }

    // Ищем карточку под курсором
    let targetCard = null;
    let targetIndex = -1;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      const rect = card.getBoundingClientRect();

      // Проверяем, находится ли курсор над этой карточкой
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        targetCard = card;
        targetIndex = i;
        break;
      }
    }

    if (targetCard) {
      // Карточка найдена - определяем позицию вставки
      const rect = targetCard.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      // Показываем плейсхолдер
      this.placeholder.style.display = "block";

      if (clientY < midY) {
        // Вставляем ДО карточки
        if (this.placeholder.nextElementSibling !== targetCard) {
          targetCard.parentNode.insertBefore(this.placeholder, targetCard);
        }
      } else {
        // Вставляем ПОСЛЕ карточки
        const nextSibling = targetCard.nextElementSibling;
        if (
          nextSibling &&
          this.placeholder.nextElementSibling !== nextSibling
        ) {
          targetCard.parentNode.insertBefore(this.placeholder, nextSibling);
        } else if (!nextSibling) {
          targetCard.parentNode.appendChild(this.placeholder);
        }
      }
    } else {
      // Карточка под курсором не найдена, но курсор над колонкой
      // Вставляем в конец колонки
      const lastCard = columnContent.querySelector(".card:last-child");
      if (lastCard && !lastCard.classList.contains("dragging")) {
        this.placeholder.style.display = "block";
        if (this.placeholder.nextElementSibling !== null) {
          columnContent.appendChild(this.placeholder);
        }
      } else {
        // Если нет карточек или только перетаскиваемая
        this.placeholder.style.display = "block";
        columnContent.insertBefore(this.placeholder, columnContent.firstChild);
      }
    }
  }

  endDrag() {
    if (!this.isDragging) return;

    // Получаем целевую позицию
    const targetColumn = this.getTargetColumn();
    const targetIndex = this.getTargetIndex();

    // Удаляем клон
    if (this.dragClone) {
      this.dragClone.remove();
      this.dragClone = null;
    }

    // Удаляем плейсхолдер
    if (this.placeholder) {
      this.placeholder.remove();
      this.placeholder = null;
    }

    // Удаляем призрачную область
    if (this.ghostElement) {
      this.ghostElement.remove();
      this.ghostElement = null;
    }

    // Восстанавливаем карточку
    if (this.draggedElement) {
      this.draggedElement.style.display = "";
      this.draggedElement.style.opacity = "1";
      this.draggedElement.style.transform = "";
      this.draggedElement.classList.remove("dragging");
    }

    // Если есть целевая колонка и она отличается от начальной или позиция изменилась
    if (targetColumn && this.draggedCard) {
      // Удаляем карточку из исходной колонки
      const fromColumn = this.startColumn;
      const fromIndex = this.startIndex;

      // Удаляем из массива исходной колонки
      const [card] = fromColumn.cards.splice(fromIndex, 1);

      // Добавляем в целевую колонку
      if (targetColumn === fromColumn) {
        // Перемещение внутри той же колонки
        const insertIndex =
          targetIndex !== null && targetIndex !== undefined
            ? targetIndex > fromIndex
              ? targetIndex - 1
              : targetIndex
            : fromColumn.cards.length;

        if (insertIndex >= fromColumn.cards.length) {
          fromColumn.cards.push(card);
        } else {
          fromColumn.cards.splice(insertIndex, 0, card);
        }
      } else {
        // Перемещение в другую колонку
        if (
          targetIndex !== null &&
          targetIndex !== undefined &&
          targetIndex < targetColumn.cards.length
        ) {
          targetColumn.cards.splice(targetIndex, 0, card);
        } else {
          targetColumn.cards.push(card);
        }
      }

      // Обновляем DOM обоих колонок
      this.updateColumnDOM(fromColumn);
      if (targetColumn !== fromColumn) {
        this.updateColumnDOM(targetColumn);
        fromColumn.updateCount();
        targetColumn.updateCount();
      } else {
        fromColumn.updateCount();
      }

      // Анимация вставки
      if (card.element) {
        card.element.classList.add("card-inserted");
        setTimeout(() => {
          card.element.classList.remove("card-inserted");
        }, 300);
      }
    }

    // Сбрасываем состояние
    this.isDragging = false;
    this.draggedCard = null;
    this.draggedElement = null;
    this.startColumn = null;
    this.startIndex = null;
    this.cardHeight = 0;

    // Восстанавливаем курсор
    document.body.style.cursor = "";
    document.body.classList.remove("dragging-active");
  }

  getTargetColumn() {
    if (!this.placeholder || !this.placeholder.parentNode) return null;
    const columnElement = this.placeholder.closest(".column");
    if (!columnElement) return null;
    return this.board.findColumn(columnElement);
  }

  getTargetIndex() {
    if (!this.placeholder || !this.placeholder.parentNode) return null;

    const columnElement = this.placeholder.closest(".column");
    if (!columnElement) return null;

    const columnObj = this.board.findColumn(columnElement);
    if (!columnObj) return null;

    // Находим индекс, куда должен вставиться элемент
    const cards = columnObj.cards;

    // Смотрим, есть ли карточка после плейсхолдера
    const nextCard = this.placeholder.nextElementSibling;
    if (nextCard && nextCard.classList.contains("card")) {
      const cardIndex = cards.findIndex((c) => c.element === nextCard);
      return cardIndex !== -1 ? cardIndex : cards.length;
    }

    // Если плейсхолдер после последней карточки
    return cards.length;
  }

  updateColumnDOM(column) {
    const content = column.content;
    // Сохраняем композер и кнопку
    const composer = column.composer;
    const addBtn = column.addBtn;

    // Очищаем содержимое
    content.innerHTML = "";

    // Добавляем все карточки
    column.cards.forEach((card) => {
      content.appendChild(card.element);
    });

    // Восстанавливаем композер и кнопку
    if (composer && composer.parentNode === content) {
      // Уже внутри
    } else if (composer) {
      content.appendChild(composer);
    }

    if (addBtn && addBtn.parentNode !== content) {
      content.parentNode.insertBefore(addBtn, content.nextSibling);
    }
  }
}
