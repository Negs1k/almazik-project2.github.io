(function() {
    var starCards = document.querySelectorAll('.star-card');
    var tgInput = document.getElementById('tgNickname');
    var buyBtn = document.getElementById('buyStarsBtn');
    var selectedCard = null;

    function getCurrentCurrency() {
        if (window.currencyManager && typeof window.currencyManager.getCurrentCurrency === 'function') {
            return window.currencyManager.getCurrentCurrency();
        }
        var saved = localStorage.getItem('preferredCurrency');
        return saved === 'KGS' ? 'KGS' : 'RUB';
    }

    function getCurrencySymbol() {
        if (window.currencyManager && typeof window.currencyManager.getCurrencySymbol === 'function') {
            return window.currencyManager.getCurrencySymbol();
        }
        return getCurrentCurrency() === 'KGS' ? 'С' : '₽';
    }

    function updatePrices() {
        var currency = getCurrentCurrency();
        var symbol = getCurrencySymbol();
        starCards.forEach(function(card) {
            var priceRub = card.getAttribute('data-price-rub');
            var priceKgs = card.getAttribute('data-price-kgs');
            var price = currency === 'KGS' ? priceKgs : priceRub;
            var priceSpan = card.querySelector('.star-price');
            if (priceSpan) {
                priceSpan.textContent = price + ' ' + symbol;
            }
        });
    }

    starCards.forEach(function(card) {
        card.addEventListener('click', function() {
            starCards.forEach(function(c) { c.classList.remove('active'); });
            this.classList.add('active');
            selectedCard = this;
        });
    });

    buyBtn.addEventListener('click', function() {
        if (!selectedCard) {
            alert('Пожалуйста, выберите количество звёзд.');
            return;
        }
        var nickname = tgInput.value.trim();
        if (!nickname) {
            alert('Введите ваш никнейм в Telegram.');
            return;
        }
        var stars = selectedCard.getAttribute('data-stars');
        var currency = getCurrentCurrency();
        var price = currency === 'KGS' ? selectedCard.getAttribute('data-price-kgs') : selectedCard.getAttribute('data-price-rub');
        var symbol = getCurrencySymbol();

        if (window.basket && typeof window.basket.addItem === 'function') {
            var productName = stars + ' ★';
            var productId = 'telegram_stars_' + stars;
            var imageUrl = 'img/stars.png';
            window.basket.addItem(productId, productName, parseInt(price), imageUrl);
        } else {
            alert('Заказ оформлен!\nЗвёзд: ' + stars + ' ★\nСумма: ' + price + ' ' + symbol + '\nTelegram: @' + nickname);
        }
    });

    updatePrices();

    document.querySelectorAll('.currency-option').forEach(function(opt) {
        opt.addEventListener('click', function() {
            setTimeout(updatePrices, 50);
        });
    });

    window.addEventListener('storage', function(e) {
        if (e.key === 'preferredCurrency') updatePrices();
    });
})();