# Русский каталог. Синтаксис Fluent — https://projectfluent.org
# Идентификаторы через дефис; { $var } — интерполируемые переменные.

help-text =
    🍽️ Бот бронирования столиков
    /start — регистрация или обновление профиля
    /menu — посмотреть меню
    /book — забронировать столик
    /my_bookings — мои брони
    /language — сменить язык
    /cancel — отменить текущий диалог
    /help — показать это сообщение

cancelled = ✅ Отменено. Напишите /book или /start, когда будете готовы.
registration-required =
    ❌ Сначала нужно зарегистрироваться.
    Отправьте /start, чтобы создать профиль.
already-registered = ✅ Вы уже зарегистрированы. Отправьте /book, чтобы забронировать столик.
back = ‹ Назад
yes = ✅ Да
no = ❌ Нет

error-name-short = Имя должно быть не короче 2 символов.
error-name-long = Слишком длинное имя.
error-invalid-phone = Номер телефона должен содержать 10–15 цифр.
error-invalid-email = Неверный email. Попробуйте снова или напишите «skip».
error-invalid-date = Дата должна быть в формате ГГГГ-ММ-ДД, например 2026-08-15.
error-invalid-time = Выберите один из предложенных слотов времени.
error-invalid-guests = Нажмите число от 1 до 6.

reg-welcome =
    🍽️ Добро пожаловать в { $restaurant }!
    Давайте создадим профиль — это займёт минуту.
reg-ask-name = Введите ваше полное имя:
reg-ask-phone =
    📱 Ваш номер телефона
    Формат: +7-999-123-45-67
reg-ask-email = 📧 Email (необязательно). Напишите «skip», чтобы пропустить:
reg-success =
    🎉 Готово, добро пожаловать в { $restaurant }!
    Отправьте /book, чтобы забронировать столик, или /menu — посмотреть меню.

book-welcome = 🍽️ Забронируем столик в { $restaurant }!
book-ask-date =
    📅 На какую дату? Формат ГГГГ-ММ-ДД.
    Пример: 2026-08-15
book-ask-time = 🕐 Выберите время (вечернее обслуживание, 17:00–22:30):
book-ask-guests = 👥 Сколько гостей?
book-ask-zone = 📍 Где хотите сидеть?
book-ask-extras = ✨ Дополнения?
book-ask-address = 🏠 Добавить адрес доставки торта?
book-ask-city = 🏙️ Какой город?
book-ask-street = 🛣️ { $city } — теперь улица и дом:
book-address-skip = Пропустить
book-address-add = 🏠 Добавить адрес
book-address-none = —
book-confirm-prompt =
    🎉 Подтвердите бронь:
    📅 { $date } в { $time }
    👥 { $guests } гостей
    📍 { $zone }
    ✨ { $extras }
    🏠 { $address }
book-success =
    ✅ Бронь подтверждена! Код: { $code }
    📅 { $date } в { $time } · 👥 { $guests }
    Спасибо, что выбрали { $restaurant }!
book-no-tables = 😔 На это время нет свободных столиков. Попробуйте другое время.

zone-hall = 🏠 Основной зал
zone-terrace = 🌿 Терраса
zone-window = 🪟 У окна

extra-none = — Без дополнений
extra-kids-chair = 👶 Детский стул
extra-cake = 🎂 Праздничный торт
extra-flowers = 💐 Цветы

bookings-none =
    📋 У вас пока нет броней.
    Отправьте /book, чтобы забронировать!
bookings-header = 📋 Ваши брони
bookings-at = в
bookings-guests = гостей
bookings-table = Столик
bookings-capacity = вместимость
bookings-confirmation = Код подтверждения
status-confirmed = подтверждена
status-pending = ожидает
status-cancelled = отменена

menu-title = 🍽️ Меню { $restaurant }
menu-categories-section = 🍽️ Категории блюд
menu-reservations-section = 📋 Брони
menu-make-reservation = 🍽️ Забронировать столик
menu-my-bookings = 📋 Мои брони
menu-category = 🍽️ { $category }
menu-back = ‹ Категории
menu-use-book = 📋 Отправьте /book, чтобы забронировать столик!
menu-use-my-bookings = 📋 Отправьте /my_bookings, чтобы посмотреть брони!
menu-item-info =
    🍽️ { $name } — { $price }
    Отправьте /book, чтобы забронировать столик!
menu-items = { $count ->
    [one] { $count } блюдо
    [few] { $count } блюда
   *[other] { $count } блюд
}

settings-choose-language = 🌍 Выберите язык:
settings-language-set = ✅ Язык обновлён.

choose-hint = 👇 Нажмите вариант ниже (или введите ответ).
