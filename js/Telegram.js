(function() {
    // Цены за одну звезду в разных валютах
    const PRICE_PER_STAR = { RUB: 1.25, KGS: 1.35 };
    const MIN_STARS = 50;

    // Элементы формы
    const tgLoginInput = document.getElementById('tgLogin');
    const starAmountInput = document.getElementById('starAmount');
    const quickButtons = document.querySelectorAll('.quick-star');
    const promoInput = document.getElementById('promoCode');
    const pricePerStarSpan = document.querySelector('#pricePerStarDisplay strong');
    const totalPriceSpan = document.querySelector('#totalPriceDisplay strong');
    const orderBtn = document.getElementById('orderStarsBtn');

    // Функция для корректировки минимального количества
    function enforceMinStars() {
        let value = parseInt(starAmountInput.value, 10);
        if (isNaN(value) || value < MIN_STARS) {
            starAmountInput.value = MIN_STARS;
        }
    }

    // Функции для работы с валютой
    function getCurrentCurrency() {
        if (window.currencyManager && typeof window.currencyManager.getCurrentCurrency === 'function') {
            return window.currencyManager.getCurrentCurrency();
        }
        const saved = localStorage.getItem('preferredCurrency');
        return saved === 'KGS' ? 'KGS' : 'RUB';
    }

    function getCurrencySymbol() {
        if (window.currencyManager && typeof window.currencyManager.getCurrencySymbol === 'function') {
            return window.currencyManager.getCurrencySymbol();
        }
        return getCurrentCurrency() === 'KGS' ? 'С' : '₽';
    }

    // Обновление отображаемых цен
    function updatePrices() {
        enforceMinStars(); // корректируем перед расчётом
        const currency = getCurrentCurrency();
        const symbol = getCurrencySymbol();
        const price = PRICE_PER_STAR[currency];
        const amount = parseInt(starAmountInput.value, 10) || MIN_STARS;
        const total = price * amount;

        pricePerStarSpan.textContent = price.toFixed(2) + symbol;
        totalPriceSpan.textContent = total.toFixed(2) + ' ' + symbol;
    }

    // Быстрые кнопки
    quickButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const stars = parseInt(this.dataset.stars, 10);
            starAmountInput.value = stars;
            updatePrices();
        });
    });

    // Ручное изменение количества
    starAmountInput.addEventListener('input', updatePrices);
    starAmountInput.addEventListener('blur', enforceMinStars); // дополнительно корректируем при потере фокуса

    // Подписка на изменение валюты
    function subscribeToCurrencyChanges() {
        document.querySelectorAll('.currency-option').forEach(opt => {
            opt.addEventListener('click', function() {
                setTimeout(updatePrices, 50);
            });
        });
        window.addEventListener('storage', function(e) {
            if (e.key === 'preferredCurrency') updatePrices();
        });
    }
    subscribeToCurrencyChanges();

    // Оформление заказа
    orderBtn.addEventListener('click', function() {
        const login = tgLoginInput.value.trim();
        if (!login) {
            alert('Пожалуйста, введите логин Telegram.');
            return;
        }
        const amount = parseInt(starAmountInput.value, 10);
        if (isNaN(amount) || amount < MIN_STARS) {
            alert(`Минимальное количество звёзд для покупки — ${MIN_STARS}.`);
            starAmountInput.value = MIN_STARS;
            updatePrices();
            return;
        }
        const currency = getCurrentCurrency();
        const pricePerStar = PRICE_PER_STAR[currency];
        const total = pricePerStar * amount;
        const symbol = getCurrencySymbol();
        const promo = promoInput.value.trim();

        const productName = amount + ' ★';
        const productId = 'telegram_stars_' + amount;
        const imageUrl = 'img/stars.png'; // замените на реальный путь, если нужно

        if (window.basket && typeof window.basket.addItem === 'function') {
            window.basket.addItem(productId, productName, total, imageUrl);
            alert('Товар добавлен в корзину!');
        } else {
            alert(`Заказ оформлен!\nЛогин: @${login}\nКоличество: ${amount} ★\nСумма: ${total.toFixed(2)} ${symbol}\nПромокод: ${promo || 'не указан'}`);
        }
    });

    // Инициализация при загрузке
    updatePrices();
})();