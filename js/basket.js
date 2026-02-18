class Basket {
    constructor() {
        this.MAX_QUANTITY = 99;
        this.items = this.loadFromStorage();
        this.updateBasketUI();
        this.initEventListeners();
        this.updateProductButtons();

            this.productImages = {
            buttonVip1: 'img/105.png',
            buttonVip2: 'img/326.png',
            buttonVip3: 'img/546.png',
            buttonVip4: 'img/1113.png',
            buttonVip5: 'img/2398.png',
            buttonVip6: 'img/6160.png',
            buttonVipl1: 'img/ScreenVaun1.png',
            buttonVipl2: 'img/ScreenVaun2.png'
        };
    }

    loadFromStorage() {
        const saved = localStorage.getItem('basket');
        return saved ? JSON.parse(saved) : [];
    }

    saveToStorage() {
        localStorage.setItem('basket', JSON.stringify(this.items));
    }

    addItem(productId, productName, price, imageUrl, quantity = 1) {
        const existingItem = this.items.find(item => item.id === productId);
        
        const basePrices = window.currencyManager ? 
            window.currencyManager.getProductBasePrices(productId) : 
            { RUB: price, KGS: price };
        
        const currentCurrency = window.currencyManager ? 
            window.currencyManager.getCurrentCurrency() : 'RUB';
        
        const itemData = {
            id: productId,
            name: productName,
            image: imageUrl || this.productImages[productId] || 'img/default.png',
            priceRUB: basePrices.RUB,
            priceKGS: basePrices.KGS,
            quantity: 0
        };
        
        if (existingItem) {
            const newQuantity = existingItem.quantity + quantity;
            existingItem.quantity = newQuantity > this.MAX_QUANTITY ? this.MAX_QUANTITY : newQuantity;
        } else {
            const actualQuantity = Math.min(quantity, this.MAX_QUANTITY);
            itemData.quantity = actualQuantity;
            this.items.push(itemData);
        }
        
        this.saveToStorage();
        this.updateBasketUI();
        if (typeof showSuccessMessage === 'function') {
            showSuccessMessage();
        }
        
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
        
        const actualQuantity = Math.min(newQuantity, this.MAX_QUANTITY);
        
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = actualQuantity;
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
        const currentCurrency = this.getCurrentCurrency();
        
        return this.items.reduce((total, item) => {
            const itemPrice = currentCurrency === 'RUB' ? item.priceRUB : item.priceKGS;
            return total + (itemPrice * item.quantity);
        }, 0);
    }

    getCurrencySymbol() {
        if (window.currencyManager) {
            return window.currencyManager.getCurrencySymbol();
        }
        return '₽';
    }

    getCurrentCurrency() {
        if (window.currencyManager) {
            return window.currencyManager.getCurrentCurrency();
        }
        return 'RUB';
    }

    getItemPriceInCurrentCurrency(item) {
        const currentCurrency = this.getCurrentCurrency();
        return currentCurrency === 'RUB' ? item.priceRUB : item.priceKGS;
    }

    updateBasketUI() {
        const basketCount = this.getTotalCount();
        const basketToggle = document.querySelector('.olo');
        if (basketToggle) {
            basketToggle.textContent = basketCount > 0 ? '' : '';
            basketToggle.style.display = basketCount > 0 ? 'flex' : 'none';
        }

        const basketCountElements = document.querySelectorAll('.basket-count');
        basketCountElements.forEach(el => {
            if (el) {
                el.textContent = `В корзине: ${basketCount} ${this.getWordForm(basketCount, ['товар', 'товара', 'товаров'])}`;
            }
        });
        
        const basketTotalElements = document.querySelectorAll('.basket-total');
        const totalPrice = this.getTotalPrice();
        const currencySymbol = this.getCurrencySymbol();
        
        basketTotalElements.forEach(el => {
            if (el) {
                el.textContent = `Итого: ${totalPrice}${currencySymbol}`;
            }
        });

        this.updateProductButtons();
        
        if (window.location.pathname.includes('basket.html')) {
            this.updateBasketPage();
        }
    }

    updateProductButtons() {
        const productButtons = [
            'buttonVip1', 'buttonVip2', 'buttonVip3', 'buttonVip4', 
            'buttonVip5', 'buttonVip6', 'buttonVipl1', 'buttonVipl2'
        ];

        productButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                const item = this.items.find(item => item.id === buttonId);
                
                if (item && item.quantity >= this.MAX_QUANTITY) {
                    button.classList.add('disabled');
                    button.style.pointerEvents = 'none';
                    button.style.opacity = '0.5';
                    button.style.cursor = 'not-allowed';
                    
                    button.title = `Достигнут лимит в ${this.MAX_QUANTITY} шт.`;
                } else {
                    button.classList.remove('disabled');
                    button.style.pointerEvents = 'auto';
                    button.style.opacity = '1';
                    button.style.cursor = 'pointer';
                    button.title = '';
                }
            }
        });
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
            const itemsContainer = document.getElementById('basketItemsContainer');
            if (itemsContainer) {
                itemsContainer.remove();
            }
        } else {
            let itemsContainer = document.getElementById('basketItemsContainer');
            if (!itemsContainer) {
                itemsContainer = document.createElement('div');
                itemsContainer.id = 'basketItemsContainer';
                itemsContainer.className = 'basket-items-container';
                
                const emptyPlaceholder = document.querySelector('.reviews-placeholder');
                if (emptyPlaceholder) {
                    basketBlock.insertBefore(itemsContainer, emptyPlaceholder);
                } else {
                    basketBlock.appendChild(itemsContainer);
                }
            }
            
            itemsContainer.innerHTML = this.generateBasketHTML();
            
            this.initBasketPageListeners();
        }
    }

    generateBasketHTML() {
        const totalPrice = this.getTotalPrice();
        const currencySymbol = this.getCurrencySymbol();
        
        let html = `<div class="basket-items-content">`;
        
        this.items.forEach((item, index) => {
            const itemPrice = this.getItemPriceInCurrentCurrency(item);
            const totalPriceItem = itemPrice * item.quantity;
            const isMaxQuantity = item.quantity >= this.MAX_QUANTITY;
            
            html += `
                <div class="basket-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="basket-item-image">
                    <div class="item-info">
                        <h3>${item.name}</h3>
                        <p class="item-price">${itemPrice}${currencySymbol}</p>
                    </div>
                    <div class="item-controls">
                        <button class="quantity-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" ${isMaxQuantity ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                            <i class="fas fa-plus"></i>
                        </button>
                        <span class="item-total">${totalPriceItem}${currencySymbol}</span>
                        <button class="remove-btn" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                    ${isMaxQuantity ? '<div class="max-quantity-warning">Достигнут лимит в 99 шт.</div>' : ''}
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
                    <h2 class="total-price">${totalPrice}${currencySymbol}</h2>
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
            { id: 'buttonVip1', name: '105 алмазов' },
            { id: 'buttonVip2', name: '326 алмазов' },
            { id: 'buttonVip3', name: '546 алмазов' },
            { id: 'buttonVip4', name: '1113 алмазов' },
            { id: 'buttonVip5', name: '2398 алмазов' },
            { id: 'buttonVip6', name: '6160 алмазов' },
            { id: 'buttonVipl2', name: 'Недельный ваучер' },
            { id: 'buttonVipl1', name: 'Месячный ваучер' }
        ];

        productButtons.forEach(product => {
            const button = document.getElementById(product.id);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const price = window.currencyManager ? 
                        window.currencyManager.getProductPrice(product.id) : 0;
                    const imageUrl = this.productImages[product.id];
                    
                    if (price > 0) {
                        this.addItem(product.id, product.name, price, imageUrl);
                    }
                });
            }
        });

        if (window.location.pathname.includes('basket.html')) {
            this.toggleEmptyBasketElements();
            this.updateBasketPage();
        }
    }

    initBasketPageListeners() {
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

        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.removeItem(productId);
            });
        });

        const clearBtn = document.getElementById('clearBasket');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить корзину?')) {
                    this.clear();
                }
            });
        }

        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length > 0) {
                    alert('Оформление заказа в разработке. Товары в корзине сохранены.');
                }
            });
        }
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

let basket;

document.addEventListener('DOMContentLoaded', function() {
    basket = new Basket();
    window.basket = basket;
    
    AOS.init({
        duration: 800,
        once: true
    });
});

const style = document.createElement('style');
style.textContent = `
    .disabled {
        pointer-events: none !important;
        opacity: 0.5 !important;
        cursor: not-allowed !important;
    }
    
    .olo {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 20px;
        height: 20px;
        background-color: #ff4444;
        border-radius: 50%;
        color: transparent;
        font-size: 0;
        position: absolute;
        top: -5px;
        right: -5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    }
    
    .olo:empty {
        display: flex !important;
    }
    
    .olo:before {
        content: '';
        display: block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
    }
`;
document.head.appendChild(style);