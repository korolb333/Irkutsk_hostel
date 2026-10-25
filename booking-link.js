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
   * Каталог:
   * добавляем выбранную комнату в ссылку на главную.
   */
  Object.entries(roomCards).forEach(([cardId, roomName]) => {
    const card = document.getElementById(cardId);

    if (!card) return;

    const link = card.querySelector('a.btn');

    if (!link) return;

    const destination = new URL('index.html', window.location.href);

    destination.searchParams.set('room', roomName);
    destination.hash = 'booking';

    link.href = destination.href;
  });

  /*
   * Главная:
   * подставляем комнату из адреса в форму.
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
      // Форма продолжает работать без сохранения выбора.
    }
  }

  if (selectedRoom) {
    roomSelect.value = selectedRoom;
  }

  function rememberSelection() {
    if (!allowedRooms.includes(roomSelect.value)) {
      try {
        sessionStorage.removeItem(storageKey);
      } catch (error) {
        // Сохранение не обязательно для работы формы.
      }

      return;
    }

    try {
      sessionStorage.setItem(storageKey, roomSelect.value);
    } catch (error) {
      // Выбор остаётся доступен в самой форме.
    }
  }

  if (selectedRoom) {
    rememberSelection();
  }

  roomSelect.addEventListener('change', rememberSelection);

  /*
   * Кнопки комнат на самой главной
   * также запоминают выбранный формат.
   */
  document.querySelectorAll('.choose-room').forEach(button => {
    button.addEventListener('click', rememberSelection);
  });

  /*
   * После подстановки убираем служебный параметр
   * из адресной строки, сохраняя переход к форме.
   */
  if (requestedRoom !== null) {
    pageUrl.searchParams.delete('room');

    try {
      window.history.replaceState(
        null,
        '',
        pageUrl.pathname + pageUrl.search + pageUrl.hash
      );
    } catch (error) {
      // Если адрес изменить нельзя, выбор всё равно работает.
    }
  }
})();
