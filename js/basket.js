class Basket {
    constructor() {
        this.items = this.loadFromStorage();
        this.updateBasketUI();
        this.initEventListeners();
    }

    loadFromStorage() {
        const saved = localStorage.getItem('basket');
        return saved ? JSON.parse(saved) : [];
    }

    saveToStorage() {
        localStorage.setItem('basket', JSON.stringify(this.items));
    }

    addItem(productId, productName, price, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: productId,
                name: productName,
                price: price,
                quantity: quantity
            });
        }
        
        this.saveToStorage();
        this.updateBasketUI();
        this.showNotification(`${productName} добавлен в корзину!`);
        
        this.hideEmptyBasketElements();
    }

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveToStorage();
        this.updateBasketUI();
        
        this.toggleEmptyBasketElements();
    }

    updateQuantity(productId, newQuantity) {
        if (newQuantity < 1) {
            this.removeItem(productId);
            return;
        }
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = newQuantity;
            this.saveToStorage();
            this.updateBasketUI();
        }
    }

    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateBasketUI();
        this.showEmptyBasketElements();
    }

    getTotalCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    getTotalPrice() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    updateBasketUI() {
        // Обновляем счетчик в шапке
        const basketCount = this.getTotalCount();
        const basketToggle = document.querySelector('.olo');
        if (basketToggle) {
            basketToggle.textContent = basketCount > 0 ? basketCount : '';
            basketToggle.style.display = basketCount > 0 ? 'flex' : 'none';
        }

        // Обновляем плавающую панель
        const basketCountEl = document.querySelector('.basket-count');
        const basketTotalEl = document.querySelector('.basket-total');
        
        if (basketCountEl) {
            basketCountEl.textContent = `В корзине: ${basketCount} ${this.getWordForm(basketCount, ['товар', 'товара', 'товаров'])}`;
        }
        
        if (basketTotalEl) {
            basketTotalEl.textContent = `Итого: ${this.getTotalPrice()} ₽`;
        }

        // Обновляем страницу корзины
        this.updateBasketPage();
    }

    hideEmptyBasketElements() {
        if (window.location.pathname.includes('basket.html')) {
            const emptyPlaceholder = document.querySelector('.reviews-placeholder');
            const basketTitle = document.querySelector('#basketblock h1');
            const basketSubtitle = document.querySelector('#basketblock h2');
            
            if (emptyPlaceholder) emptyPlaceholder.style.display = 'none';
            if (basketTitle) basketTitle.style.display = 'none';
            if (basketSubtitle) basketSubtitle.style.display = 'none';
        }
    }

    showEmptyBasketElements() {
        if (window.location.pathname.includes('basket.html')) {
            const emptyPlaceholder = document.querySelector('.reviews-placeholder');
            const basketTitle = document.querySelector('#basketblock h1');
            const basketSubtitle = document.querySelector('#basketblock h2');
            
            if (emptyPlaceholder) emptyPlaceholder.style.display = 'block';
            if (basketTitle) basketTitle.style.display = 'block';
            if (basketSubtitle) basketSubtitle.style.display = 'block';
        }
    }

    toggleEmptyBasketElements() {
        const totalCount = this.getTotalCount();
        
        if (totalCount === 0) {
            this.showEmptyBasketElements();
        } else {
            this.hideEmptyBasketElements();
        }
    }

    updateBasketPage() {
        const basketBlock = document.getElementById('basketblock');
        if (!basketBlock) return;

        const totalCount = this.getTotalCount();
        
        if (totalCount === 0) {
            // Удаляем контейнер если он есть
            const itemsContainer = document.getElementById('basketItemsContainer');
            if (itemsContainer) {
                itemsContainer.remove();
            }
        } else {
            // Создаем или обновляем контейнер
            let itemsContainer = document.getElementById('basketItemsContainer');
            if (!itemsContainer) {
                itemsContainer = document.createElement('div');
                itemsContainer.id = 'basketItemsContainer';
                itemsContainer.className = 'basket-items-container';
                
                // Находим правильное место для вставки
                const emptyPlaceholder = document.querySelector('.reviews-placeholder');
                if (emptyPlaceholder) {
                    basketBlock.insertBefore(itemsContainer, emptyPlaceholder);
                } else {
                    basketBlock.appendChild(itemsContainer);
                }
            }
            
            // Очищаем и заполняем контейнер
            itemsContainer.innerHTML = this.generateBasketHTML();
            
            // Инициализируем обработчики
            this.initBasketPageListeners();
        }
    }

    // НОВЫЙ МЕТОД: Генерация полного HTML контейнера
    generateBasketHTML() {
        const totalPrice = this.getTotalPrice();
        
        let html = `
            <div class="basket-items-content">
        `;
        
        // Добавляем товары
        this.items.forEach((item, index) => {
            const totalPriceItem = item.price * item.quantity;
            html += `
                <div class="basket-item" data-id="${item.id}">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="item-price">${item.price} ₽</p>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                        <span class="item-total">${totalPriceItem} ₽</span>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += `
            </div>
            <div class="basket-footer">
                <div class="placeholder-text2"><p>Все выбранные вами товары находятся ниже</p></div>
                <div class="placeholder-text3"><p>Проверьте список товаров перед оформлением заказа!</p></div>
                <div class="basket-total-summary">
                    <h3>Итого к оплате:</h3>
                    <h2 class="total-price">${totalPrice} ₽</h2>
                </div>
                <div class="basket-actions">
                    <button class="btn-clear" id="clearBasket">
                        <i class="fas fa-trash"></i> Очистить корзину
                    </button>
                    <button class="btn-checkout-main" id="checkoutBtn">
                        <i class="fas fa-credit-card"></i> Перейти к оплате
                    </button>
                </div>
            </div>
        `;
        
        return html;
    }

    initEventListeners() {
        const productButtons = [
            { id: 'buttonVip1', name: '105 алмазов', price: 75 },
            { id: 'buttonVip2', name: '326 алмазов', price: 225 },
            { id: 'buttonVip3', name: '546 алмазов', price: 375 },
            { id: 'buttonVip4', name: '1113 алмазов', price: 750 },
            { id: 'buttonVip5', name: '2398 алмазов', price: 1500 },
            { id: 'buttonVip6', name: '6160 алмазов', price: 3600 },
            { id: 'buttonVipl1', name: 'Недельный ваучер', price: 120 },
            { id: 'buttonVipl2', name: 'Месячный ваучер', price: 670 }
        ];

        productButtons.forEach(product => {
            const button = document.getElementById(product.id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.addItem(product.id, product.name, product.price);
                });
            }
        });

        // Инициализация на странице корзины
        if (window.location.pathname.includes('basket.html')) {
            this.toggleEmptyBasketElements();
            this.updateBasketPage();
        }
    }

    initBasketPageListeners() {
        // Кнопки изменения количества
        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            });
        });

        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            });
        });

        // Кнопки удаления
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.removeItem(productId);
            });
        });

        // Кнопка очистки корзины
        const clearBtn = document.getElementById('clearBasket');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить корзину?')) {
                    this.clear();
                }
            });
        }

        // Кнопка оформления заказа
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    alert('Оформление заказа в разработке. Товары в корзине сохранены.');
                }
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'basket-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    getWordForm(number, words) {
        number = Math.abs(number) % 100;
        let num = number % 10;
        if (number > 10 && number < 20) return words[2];
        if (num > 1 && num < 5) return words[1];
        if (num === 1) return words[0];
        return words[2];
    }
}

// Инициализация корзины
let basket;

document.addEventListener('DOMContentLoaded', function() {
    basket = new Basket();
    window.basket = basket;
});
