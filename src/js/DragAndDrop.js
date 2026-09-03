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
    this.currentTargetColumn = null;
    this.currentTargetIndex = null;

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
    this.currentTargetColumn = null;
    this.currentTargetIndex = null;

    // Сохраняем высоту карточки
    const rect = card.getBoundingClientRect();
    this.cardHeight = rect.height;
    this.offsetX = e.clientX - rect.left;
    this.offsetY = e.clientY - rect.top;

    // Добавляем класс перетаскивания
    card.classList.add("dragging");

    // Создаем клон для перетаскивания
    this.createDragClone(card, e);

    // Создаем призрачную область на месте карточки
    this.createGhost(card);

    // Создаем плейсхолдер для вставки
    this.createPlaceholder(card);

    // Скрываем оригинальную карточку
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

    card.parentNode.insertBefore(ghost, card);
    this.ghostElement = ghost;
  }

  createPlaceholder(card) {
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
    placeholder.style.pointerEvents = "none";

    // Вставляем плейсхолдер после призрака
    if (this.ghostElement && this.ghostElement.parentNode) {
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

    // Получаем элемент под курсором
    const elementBelow = document.elementFromPoint(clientX, clientY);
    if (!elementBelow) {
      this.hidePlaceholder();
      return;
    }

    // Проверяем, находится ли курсор над колонкой
    const columnBelow = elementBelow.closest(".column");
    if (!columnBelow) {
      this.hidePlaceholder();
      return;
    }

    // Получаем колонку
    const columnObj = this.board.findColumn(columnBelow);
    if (!columnObj) {
      this.hidePlaceholder();
      return;
    }

    // Получаем все видимые карточки в колонке (исключаем перетаскиваемую)
    const allCards = columnBelow.querySelectorAll(".card:not(.dragging)");

    // Если карточек нет, вставляем в начало
    if (allCards.length === 0) {
      this.showPlaceholderAtStart(columnBelow);
      return;
    }

    // Ищем карточку под курсором
    let targetCard = null;
    let targetPosition = null; // 'before' или 'after'

    for (const card of allCards) {
      const rect = card.getBoundingClientRect();

      // Проверяем, находится ли курсор над карточкой
      if (
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom
      ) {
        // Определяем, вставлять до или после
        const midY = rect.top + rect.height / 2;
        targetCard = card;
        targetPosition = clientY < midY ? "before" : "after";
        break;
      }
    }

    if (targetCard) {
      // Нашли карточку под курсором
      this.showPlaceholderAtCard(targetCard, targetPosition);
    } else {
      // Курсор над колонкой, но не над конкретной карточкой
      // Находим ближайшую карточку
      let closestCard = null;
      let closestDistance = Infinity;

      for (const card of allCards) {
        const rect = card.getBoundingClientRect();
        const cardCenterX = rect.left + rect.width / 2;
        const cardCenterY = rect.top + rect.height / 2;

        const distance = Math.sqrt(
          Math.pow(clientX - cardCenterX, 2) +
            Math.pow(clientY - cardCenterY, 2),
        );

        if (distance < closestDistance) {
          closestDistance = distance;
          closestCard = card;
        }
      }

      if (closestCard) {
        const rect = closestCard.getBoundingClientRect();
        const midY = rect.top + rect.height / 2;
        const position = clientY < midY ? "before" : "after";
        this.showPlaceholderAtCard(closestCard, position);
      } else {
        this.showPlaceholderAtStart(columnBelow);
      }
    }
  }

  showPlaceholderAtCard(card, position) {
    if (!this.placeholder) return;

    this.placeholder.style.display = "block";

    if (position === "before") {
      // Вставляем ДО карточки
      if (this.placeholder.nextElementSibling !== card) {
        card.parentNode.insertBefore(this.placeholder, card);
      }
    } else {
      // Вставляем ПОСЛЕ карточки
      const nextSibling = card.nextElementSibling;
      if (nextSibling && this.placeholder.nextElementSibling !== nextSibling) {
        card.parentNode.insertBefore(this.placeholder, nextSibling);
      } else if (!nextSibling) {
        card.parentNode.appendChild(this.placeholder);
      }
    }
  }

  showPlaceholderAtStart(column) {
    if (!this.placeholder) return;

    const content = column.querySelector(".column-content");
    if (!content) return;

    this.placeholder.style.display = "block";

    // Вставляем в начало колонки
    const firstCard = content.querySelector(".card:not(.dragging)");
    if (firstCard) {
      content.insertBefore(this.placeholder, firstCard);
    } else {
      content.insertBefore(this.placeholder, content.firstChild);
    }
  }

  hidePlaceholder() {
    if (this.placeholder) {
      this.placeholder.style.display = "none";
    }
  }

  endDrag() {
    if (!this.isDragging) return;

    // Определяем целевую позицию
    let targetColumn = null;
    let targetIndex = null;

    if (this.placeholder && this.placeholder.style.display !== "none") {
      const columnElement = this.placeholder.closest(".column");
      if (columnElement) {
        targetColumn = this.board.findColumn(columnElement);

        if (targetColumn) {
          // Находим индекс вставки
          const cards = targetColumn.cards;
          const nextCard = this.placeholder.nextElementSibling;

          if (nextCard && nextCard.classList.contains("card")) {
            const cardIndex = cards.findIndex((c) => c.element === nextCard);
            targetIndex = cardIndex !== -1 ? cardIndex : cards.length;
          } else {
            targetIndex = cards.length;
          }
        }
      }
    }

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

    // Если есть целевая колонка и карточка
    if (targetColumn && this.draggedCard && this.startColumn) {
      // Удаляем карточку из исходной колонки
      const fromColumn = this.startColumn;
      const fromIndex = this.startIndex;

      // Проверяем, что карточка все еще в массиве
      if (fromColumn.cards[fromIndex] === this.draggedCard) {
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
            fromColumn.cards.splice(Math.max(0, insertIndex), 0, card);
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

        // Обновляем DOM
        this.updateColumnDOM(fromColumn);
        if (targetColumn !== fromColumn) {
          this.updateColumnDOM(targetColumn);
          fromColumn.updateCount();
          targetColumn.updateCount();
        } else {
          fromColumn.updateCount();
        }

        // Анимация вставки
        if (this.draggedElement) {
          this.draggedElement.classList.add("card-inserted");
          setTimeout(() => {
            if (this.draggedElement) {
              this.draggedElement.classList.remove("card-inserted");
            }
          }, 300);
        }
      }
    }

    // Сбрасываем состояние
    this.isDragging = false;
    this.draggedCard = null;
    this.draggedElement = null;
    this.startColumn = null;
    this.startIndex = null;
    this.cardHeight = 0;
    this.currentTargetColumn = null;
    this.currentTargetIndex = null;

    // Восстанавливаем курсор
    document.body.style.cursor = "";
    document.body.classList.remove("dragging-active");
  }

  updateColumnDOM(column) {
    const content = column.content;
    const composer = column.composer;
    const addBtn = column.addBtn;

    // Очищаем содержимое
    content.innerHTML = "";

    // Добавляем все карточки
    column.cards.forEach((card) => {
      content.appendChild(card.element);
    });

    // Восстанавливаем композер и кнопку
    if (composer && composer.parentNode !== content) {
      content.appendChild(composer);
    }

    if (addBtn && addBtn.parentNode !== content.parentNode) {
      content.parentNode.insertBefore(addBtn, content.nextSibling);
    }
  }
}
