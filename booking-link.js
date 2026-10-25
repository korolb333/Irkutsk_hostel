(() => {
  'use strict';

  const storageKey = 'kurs-selected-room';

  const allowedRooms = [
    'Место в 4-местной комнате',
    'Место в 2-местной комнате',
    'Двухместная комната'
  ];

  const roomCards = {
    'shared-four': 'Место в 4-местной комнате',
    'shared-two': 'Место в 2-местной комнате',
    'private-two': 'Двухместная комната'
  };

  /*
   * Каталог: передаём выбранную комнату
   * в адрес страницы с формой.
   */
  Object.entries(roomCards).forEach(([cardId, roomName]) => {
    const card = document.getElementById(cardId);

    if (!card) return;

    const link = card.querySelector('a.btn');

    if (!link) return;

    const destination = new URL(
      'index.html',
      window.location.href
    );

    destination.searchParams.set('room', roomName);
    destination.hash = 'booking';

    link.href = destination.href;
  });

  /*
   * Следующая часть нужна только на главной.
   */
  const roomSelect = document.getElementById('room-type');

  if (!roomSelect) return;

  const pageUrl = new URL(window.location.href);
  const requestedRoom = pageUrl.searchParams.get('room');

  let selectedRoom = null;

  if (allowedRooms.includes(requestedRoom)) {
    selectedRoom = requestedRoom;
  } else if (pageUrl.hash === '#booking') {
    try {
      const savedRoom = sessionStorage.getItem(storageKey);

      if (allowedRooms.includes(savedRoom)) {
        selectedRoom = savedRoom;
      }
    } catch (error) {
      // Выбор продолжает работать без хранилища.
    }
  }

  if (selectedRoom) {
    roomSelect.value = selectedRoom;
  }

  function rememberSelection() {
    try {
      if (allowedRooms.includes(roomSelect.value)) {
        sessionStorage.setItem(
          storageKey,
          roomSelect.value
        );
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch (error) {
      // Сохранение не обязательно для работы формы.
    }
  }

  if (selectedRoom) {
    rememberSelection();
  }

  roomSelect.addEventListener('change', rememberSelection);

  document.querySelectorAll('.choose-room').forEach(button => {
    button.addEventListener('click', rememberSelection);
  });

  if (requestedRoom !== null) {
    pageUrl.searchParams.delete('room');

    try {
      window.history.replaceState(
        null,
        '',
        pageUrl.pathname + pageUrl.search + pageUrl.hash
      );
    } catch (error) {
      // Подстановка комнаты уже выполнена.
    }
  }

  /*
   * Telegram: добавляем готовый текст в ссылку.
   * Кнопку копирования оставляем запасным способом.
   */
  const form = document.getElementById('booking-form');
  const messageBox = document.getElementById('message-box');
  const messageField = document.getElementById(
    'booking-message'
  );

  if (!form || !messageBox || !messageField) return;

  const telegramButton = messageBox.querySelector(
    'a[href^="https://t.me/Irkutsk_hostel_bot"]'
  );

  if (!telegramButton) return;

  function updateTelegramLink() {
    const message = messageField.value.trim();

    if (!message) {
      telegramButton.href =
        'https://t.me/Irkutsk_hostel_bot';

      return;
    }

    const telegramUrl = new URL(
      'https://t.me/Irkutsk_hostel_bot'
    );

    telegramUrl.searchParams.set('text', message);

    telegramButton.href = telegramUrl.href;
    telegramButton.target = '_blank';
    telegramButton.rel = 'noopener noreferrer';
  }

  /*
   * Основной скрипт главной уже формирует сообщение.
   * После его выполнения обновляем ссылку.
   */
  form.addEventListener('submit', () => {
    queueMicrotask(updateTelegramLink);
  });

  /*
   * Дополнительно обновляем ссылку перед открытием.
   */
  telegramButton.addEventListener(
    'click',
    updateTelegramLink
  );

  const help = document.createElement('p');

  help.className = 'note';
  help.textContent =
    'Если Telegram открыл пустой чат, вернитесь сюда, ' +
    'нажмите «Скопировать» и вставьте сообщение вручную.';

  messageBox.appendChild(help);
})();
