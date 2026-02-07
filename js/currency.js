class CurrencyManager {
    constructor() {
        this.currentCurrency = this.loadCurrency();
        this.init();
    }
    
    loadCurrency() {
        const saved = localStorage.getItem('selectedCurrency');
        console.log('Загружена валюта из localStorage:', saved);
        return saved || 'RUB';
    }
    
    saveCurrency(currency) {
        console.log('Сохранение валюты:', currency);
        this.currentCurrency = currency;
        localStorage.setItem('selectedCurrency', currency);
        this.updateCurrencyUI();
        this.updateAllPrices();
        
        if (window.basket) {
            window.basket.updateBasketUI();
        }
    }
    
    init() {
        this.updateCurrencyUI();
        this.updateAllPrices();
        this.setupEventListeners();
        console.log('CurrencyManager инициализирован с валютой:', this.currentCurrency);
    }
    
    updateCurrencyUI() {
        const currencyOptions = document.querySelectorAll('.currency-option');
        currencyOptions.forEach(option => {
            if (option.dataset.currency === this.currentCurrency) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
        
        // Обновляем текст в кнопке переключения валюты
        const currencyToggle = document.getElementById('currencyToggle');
        if (currencyToggle) {
            const activeOption = currencyToggle.querySelector('.currency-option.active');
            if (activeOption) {
                const symbol = this.getCurrencySymbol();
                const currencyText = currencyToggle.querySelector('.currency-text');
                if (currencyText) {
                    currencyText.textContent = symbol;
                }
            }
        }
    }
    
    setupEventListeners() {
        const currencyToggle = document.getElementById('currencyToggle');
        if (currencyToggle) {
            currencyToggle.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.toggleCurrencyMenu();
            });
        }
        
        const currencyOptions = document.querySelectorAll('.currency-option');
        currencyOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                const currency = option.dataset.currency;
                this.saveCurrency(currency);
                this.closeCurrencyMenu();
            });
        });
        
        document.addEventListener('click', (e) => {
            const submenu = document.getElementById('currencySubmenu');
            const toggle = document.getElementById('currencyToggle');
            
            if (submenu && toggle && !submenu.contains(e.target) && !toggle.contains(e.target)) {
                this.closeCurrencyMenu();
            }
        });
    }
    
    toggleCurrencyMenu() {
        const submenu = document.getElementById('currencySubmenu');
        const chevron = document.getElementById('currencyChevron');
        
        if (submenu && chevron) {
            submenu.classList.toggle('show');
            chevron.classList.toggle('rotated');
        }
    }
    
    closeCurrencyMenu() {
        const submenu = document.getElementById('currencySubmenu');
        const chevron = document.getElementById('currencyChevron');
        
        if (submenu && chevron) {
            submenu.classList.remove('show');
            chevron.classList.remove('rotated');
        }
    }
    
    getCurrencySymbol() {
        if (this.currentCurrency === 'RUB') {
            return ' ₽';
        } else if (this.currentCurrency === 'KGS') {
            return ' ⃀';
        }
        return ' ₽';
    }
    
    getCurrentCurrency() {
        return this.currentCurrency;
    }
    
    getProductPrice(productId) {
        const priceMap = {
            RUB: {
                'buttonVip1': 70,
                'buttonVip2': 210,
                'buttonVip3': 350,
                'buttonVip4': 700,
                'buttonVip5': 1400,
                'buttonVip6': 3450,
                'buttonVipl1': 120,
                'buttonVipl2': 670
            },
            KGS: {
                'buttonVip1': 75,
                'buttonVip2': 225,
                'buttonVip3': 375,
                'buttonVip4': 750,
                'buttonVip5': 1500,
                'buttonVip6': 3600,
                'buttonVipl1': 130,
                'buttonVipl2': 770
            }
        };
        
        if (priceMap[this.currentCurrency] && priceMap[this.currentCurrency][productId]) {
            return priceMap[this.currentCurrency][productId];
        }
        
        return 0;
    }
    
    getProductBasePrices(productId) {
        return {
            RUB: {
                'buttonVip1': 70,
                'buttonVip2': 210,
                'buttonVip3': 350,
                'buttonVip4': 700,
                'buttonVip5': 1400,
                'buttonVip6': 3450,
                'buttonVipl1': 120,
                'buttonVipl2': 670
            }[productId] || 0,
            KGS: {
                'buttonVip1': 75,
                'buttonVip2': 225,
                'buttonVip3': 375,
                'buttonVip4': 750,
                'buttonVip5': 1500,
                'buttonVip6': 3600,
                'buttonVipl1': 130,
                'buttonVipl2': 770
            }[productId] || 0
        };
    }
    
    updateAllPrices() {
        const symbol = this.getCurrencySymbol();
        const currentCurrency = this.currentCurrency;
        
        const priceMap = {
            RUB: {
                'buttonVip1': 70,
                'buttonVip2': 210,
                'buttonVip3': 350,
                'buttonVip4': 700,
                'buttonVip5': 1400,
                'buttonVip6': 3450,
                'buttonVipl1': 120,
                'buttonVipl2': 670
            },
            KGS: {
                'buttonVip1': 75,
                'buttonVip2': 225,
                'buttonVip3': 375,
                'buttonVip4': 750,
                'buttonVip5': 1500,
                'buttonVip6': 3600,
                'buttonVipl1': 130,
                'buttonVipl2': 770
            }
        };
        
        const priceElements = document.querySelectorAll('h5');
        priceElements.forEach(element => {
            const productDiv = element.closest('div[id^="vip"], div[id^="vipl"]');
            if (productDiv) {
                const button = productDiv.querySelector('[id^="buttonVip"], [id^="buttonVipl"]');
                if (button) {
                    const productId = button.id;
                    if (priceMap[currentCurrency] && priceMap[currentCurrency][productId]) {
                        const price = priceMap[currentCurrency][productId];
                        element.textContent = price + symbol;
                    }
                }
            }
        });
        
        const currencySymbolElements = document.querySelectorAll('.currency-symbol');
        currencySymbolElements.forEach(el => {
            if (el.textContent.includes('₽') || el.textContent.includes('⃀')) {
                el.textContent = symbol;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (!window.currencyManager) {
        window.currencyManager = new CurrencyManager();
    }
    
    if (window.basket) {
        window.basket.updateBasketUI();
    }
    
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true
        });
    }
});

window.addEventListener('storage', function(e) {
    if (e.key === 'selectedCurrency') {
        if (window.currencyManager) {
            window.currencyManager.currentCurrency = e.newValue || 'RUB';
            window.currencyManager.updateCurrencyUI();
            window.currencyManager.updateAllPrices();
            
            if (window.basket) {
                window.basket.updateBasketUI();
            }
        }
    }
});