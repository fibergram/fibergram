# English catalog (default locale). Fluent syntax — https://projectfluent.org
# Message ids are hyphenated; { $var } are interpolated variables.

help-text =
    🍽️ Restaurant Booking Bot
    /start — register or update your profile
    /menu — browse our menu
    /book — make a table reservation
    /my_bookings — view your reservations
    /language — change language
    /cancel — abort the current conversation
    /help — show this message

cancelled = ✅ Cancelled. Use /book or /start whenever you're ready.
registration-required =
    ❌ You need to register first.
    Use /start to create your profile.
already-registered = ✅ You're already registered. Use /book to reserve a table.
back = ‹ Back
yes = ✅ Yes
no = ❌ No

error-name-short = Name must be at least 2 characters.
error-name-long = Name is too long.
error-invalid-phone = Phone number must be 10–15 digits.
error-invalid-email = Invalid email. Try again or type "skip".
error-invalid-date = Date must be in YYYY-MM-DD format, e.g. 2026-08-15.
error-invalid-time = Please pick one of the offered time slots.
error-invalid-guests = Please tap a number from 1 to 6.

reg-welcome =
    🍽️ Welcome to { $restaurant }!
    Let's set up your profile — it only takes a minute.
reg-ask-name = Please enter your full name:
reg-ask-phone =
    📱 Your phone number
    Format: +1-555-123-4567
reg-ask-email = 📧 Email (optional). Type "skip" to leave it empty:
reg-success =
    🎉 You're all set at { $restaurant }!
    Use /book to reserve a table or /menu to see the menu.

book-welcome = 🍽️ Let's book your table at { $restaurant }!
book-ask-date =
    📅 Which date? Use YYYY-MM-DD.
    Example: 2026-08-15
book-ask-time = 🕐 Pick a time (evening service, 17:00–22:30):
book-ask-guests = 👥 How many guests?
book-ask-zone = 📍 Where would you like to sit?
book-ask-extras = ✨ Any extras?
book-ask-address = 🏠 Add a cake-delivery address?
book-ask-city = 🏙️ Which city?
book-ask-street = 🛣️ { $city } — now the street and house number:
book-address-skip = Skip
book-address-add = 🏠 Add address
book-address-none = —
book-confirm-prompt =
    🎉 Please confirm your reservation:
    📅 { $date } at { $time }
    👥 { $guests } guests
    📍 { $zone }
    ✨ { $extras }
    🏠 { $address }
book-success =
    ✅ Booking confirmed! Code: { $code }
    📅 { $date } at { $time } · 👥 { $guests }
    Thank you for choosing { $restaurant }!
book-no-tables = 😔 No tables available for that slot. Please try another time.

zone-hall = 🏠 Main hall
zone-terrace = 🌿 Terrace
zone-window = 🪟 By the window

extra-none = — No extras
extra-kids-chair = 👶 Kids chair
extra-cake = 🎂 Birthday cake
extra-flowers = 💐 Flowers

bookings-none =
    📋 You have no bookings yet.
    Use /book to make a reservation!
bookings-header = 📋 Your bookings
bookings-at = at
bookings-guests = guests
bookings-table = Table
bookings-capacity = capacity
bookings-confirmation = Confirmation
status-confirmed = confirmed
status-pending = pending
status-cancelled = cancelled

menu-title = 🍽️ { $restaurant } Menu
menu-categories-section = 🍽️ Food categories
menu-reservations-section = 📋 Reservations
menu-make-reservation = 🍽️ Make a reservation
menu-my-bookings = 📋 My bookings
menu-category = 🍽️ { $category }
menu-back = ‹ Categories
menu-use-book = 📋 Use /book to reserve a table!
menu-use-my-bookings = 📋 Use /my_bookings to see your reservations!
menu-item-info =
    🍽️ { $name } — { $price }
    Use /book to reserve a table and enjoy our food!
menu-items = { $count ->
    [one] { $count } item
   *[other] { $count } items
}

settings-choose-language = 🌍 Choose your language:
settings-language-set = ✅ Language updated.

choose-hint = 👇 Tap an option below (or type your answer).
