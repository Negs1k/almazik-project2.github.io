let currentTheme = localStorage.getItem('theme') || 'light';
let isSidebarOpen = false;

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const body = document.body;
    
    isSidebarOpen = !isSidebarOpen;
    
    if (isSidebarOpen) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        body.classList.add('sidebar-open');
    } else {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        body.classList.remove('sidebar-open');
    }
}

function toggleTheme() {
    const body = document.body;
    const themeStatus = document.getElementById('themeStatus');
    
    if (currentTheme === 'light') {
        body.classList.add('dark-theme');
        currentTheme = 'dark';
        themeStatus.textContent = 'Темная';
    } else {
        body.classList.remove('dark-theme');
        currentTheme = 'light';
        themeStatus.textContent = 'Светлая';
    }
    
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const themeLink = document.querySelector('.theme-toggle i');
    if (currentTheme === 'dark') {
        themeLink.className = 'fas fa-sun';
    } else {
        themeLink.className = 'fas fa-moon';
    }
}

function initTheme() {
    const body = document.body;
    const themeStatus = document.getElementById('themeStatus');
    
    if (currentTheme === 'dark') {
        body.classList.add('dark-theme');
        themeStatus.textContent = 'Темная';
    } else {
        themeStatus.textContent = 'Светлая';
    }
    
    updateThemeIcon();
}

function goToAuth() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                openUserProfile();
            } else {
                window.location.href = '/firebase/reg.html';
            }
        });
    } else {
        window.location.href = '/firebase/reg.html';
    }
}

function openUserProfile() {
    console.log('openUserProfile вызвана');
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {
            if (user) {
                console.log('Переходим на страницу профиля');
                window.location.href = '/firebase/reg.html#profile';
            } else {
                console.log('Пользователь не авторизован');
                showNotification('Пожалуйста, войдите в аккаунт', 'info');
                window.location.href = '/firebase/reg.html';
            }
        });
    } else {
        showNotification('Система авторизации недоступна', 'error');
        window.location.href = '/firebase/reg.html';
    }
}

function logout() {
    if (firebase.auth) {
        firebase.auth().signOut().then(() => {
            updateSidebarProfile(null);
            updateHeaderPosition(false);
            showNotification('Вы вышли из системы', 'info');
        }).catch((error) => {
            console.error('Ошибка выхода:', error);
            showNotification('Ошибка при выходе', 'error');
        });
    } else {
        updateSidebarProfile(null);
        updateHeaderPosition(false);
        alert('Вы вышли из системы');
    }
}

function updateSidebarProfile(user) {
    const usernameElement = document.getElementById('sidebarUsername');
    const emailElement = document.getElementById('sidebarEmail');
    const avatarElement = document.getElementById('sidebarAvatar');
    const loginBtn = document.getElementById('sidebarLoginBtn');
    const logoutBtn = document.getElementById('sidebarLogoutBtn');
    
    if (user) {
        usernameElement.textContent = user.displayName || user.email.split('@')[0];
        emailElement.textContent = user.email;
        
        if (user.photoURL) {
            avatarElement.innerHTML = `<img src="${user.photoURL}" alt="Аватар">`;
        } else {
            avatarElement.innerHTML = `<i class="fas fa-user"></i>`;
        }
        
        avatarElement.style.cursor = 'pointer';
        usernameElement.style.cursor = 'pointer';
        
        avatarElement.onclick = function() {
            openUserProfile();
        };
        
        usernameElement.onclick = function() {
            openUserProfile();
        };
        
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        updateHeaderPosition(true);
        
    } else {
        usernameElement.textContent = 'Гость';
        emailElement.textContent = 'Войдите в аккаунт';
        avatarElement.innerHTML = `<i class="fas fa-user"></i>`;
        
        avatarElement.style.cursor = 'default';
        usernameElement.style.cursor = 'default';
        avatarElement.onclick = null;
        usernameElement.onclick = null;
        
        loginBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        
        updateHeaderPosition(false);
    }
}

function checkAuthStatus() {
    if (typeof firebase === 'undefined') {
        console.log('Firebase не подключен');
        updateHeaderPosition(false);
        return;
    }
    
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            console.log('Пользователь авторизован:', user.email);
            updateSidebarProfile(user);
            updateHeaderPosition(true);
            
            const authButton = document.querySelector('#avtarization h3');
            const authLink = document.querySelector('#avtarization a');
            
            if (authButton && authLink) {
                authButton.textContent = 'Профиль';
                authLink.href = 'javascript:void(0)';
                authLink.onclick = function(e) {
                    e.preventDefault();
                    openUserProfile();
                };
            }
            
        } else {
            console.log('Пользователь не авторизован');
            updateSidebarProfile(null);
            updateHeaderPosition(false);
            
            const authButton = document.querySelector('#avtarization h3');
            const authLink = document.querySelector('#avtarization a');
            
            if (authButton && authLink) {
                authButton.textContent = 'Авторизация';
                authLink.href = '/firebase/reg.html';
                authLink.onclick = null;
            }
        }
    });
}

function updateHeaderPosition(isAuthorized) {
    const headerTitle = document.querySelector('#header h3');
    
    if (headerTitle) {
        headerTitle.classList.remove('unauthorized', 'authorized');
        
        if (isAuthorized) {
            headerTitle.classList.add('authorized');
            console.log('Установлена позиция для авторизованного пользователя: right: 20px');
        } else {
            headerTitle.classList.add('unauthorized');
            console.log('Установлена позиция для неавторизованного пользователя: right: -6px');
        }
    } else {
        console.log('Элемент #header h3 не найден');
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape' && isSidebarOpen) {
        toggleSidebar();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
            
        @keyframes fadeOut {
            from {
                opacity: 1;
            }
            to {
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    initTheme();
    checkAuthStatus();
});


let isFavoritesOpen = false;

function toggleFavoritesSidebar() {
    const favoritesSidebar = document.getElementById('favoritesSidebar');
    const favoritesOverlay = document.getElementById('favoritesOverlay');
    const body = document.body;
    
    isFavoritesOpen = !isFavoritesOpen;
    
    if (isFavoritesOpen) {
        favoritesSidebar.classList.add('active');
        favoritesOverlay.classList.add('active');
        body.classList.add('sidebar-open');
        loadFavorites();
    } else {
        favoritesSidebar.classList.remove('active');
        favoritesOverlay.classList.remove('active');
        body.classList.remove('sidebar-open');
    }
}

function loadFavorites() {
    const favoritesContent = document.getElementById('favoritesContent');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (favorites.length === 0) {
        favoritesContent.innerHTML = `
            <div class="favorites-empty">
                <i class="fas fa-star"></i>
                <p>В избранном пока пусто</p>
                <p>Добавляйте товары, нажимая на звёздочку</p>
            </div>
        `;
    } else {
        let html = '<div class="favorites-list">';
        
        favorites.forEach((item, index) => {
            html += `
                <div class="favorite-item" data-id="${item.id}">
                    <div class="favorite-item-header">
                        <div class="favorite-item-title">${item.name}</div>
                        <button class="remove-favorite" onclick="removeFromFavorites(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="favorite-item-details">${item.description || 'Игровой донат'}</div>
                    <div class="favorite-item-price">${item.price} ₽</div>
                    <button class="buy-favorite-btn" onclick="buyFavoriteItem(${index})">
                        Купить сейчас
                    </button>
                </div>
            `;
        });
        
        html += `</div>
            <div class="favorites-footer">
                <button class="clear-all-favorites" onclick="clearAllFavorites()">
                    Очистить всё избранное
                </button>
            </div>`;
        
        favoritesContent.innerHTML = html;
    }
}

function addToFavorites(item) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (!favorites.some(fav => fav.id === item.id)) {
        favorites.push(item);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        showNotification('Товар добавлен в избранное', 'success');
        
        updateFavoritesCounter();
    } else {
        showNotification('Товар уже в избранном', 'info');
    }
}

function removeFromFavorites(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (index >= 0 && index < favorites.length) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        updateFavoritesCounter();
        showNotification('Товар удалён из избранного', 'info');
    }
}

function clearAllFavorites() {
    if (confirm('Вы уверены, что хотите очистить всё избранное?')) {
        localStorage.removeItem('favorites');
        loadFavorites();
        updateFavoritesCounter();
        showNotification('Избранное очищено', 'info');
    }
}

function buyFavoriteItem(index) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    
    if (index >= 0 && index < favorites.length) {
        const item = favorites[index];
        showNotification(`Покупка товара: ${item.name}`, 'info');
    }
}

function updateFavoritesCounter() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesToggle = document.getElementById('favoritesToggle');
    
    if (favorites.length > 0) {
        let counter = favoritesToggle.querySelector('.favorites-counter');
        
        if (!counter) {
            counter = document.createElement('div');
            counter.className = 'favorites-counter';
            counter.style.cssText = `
                position: absolute;
                top: -5px;
                right: -5px;
                background: #ff4757;
                color: white;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            favoritesToggle.appendChild(counter);
        }
        
        counter.textContent = favorites.length;
    } else {
        const counter = favoritesToggle.querySelector('.favorites-counter');
        if (counter) {
            counter.remove();
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    updateFavoritesCounter();
    
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && isFavoritesOpen) {
            toggleFavoritesSidebar();
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const footer = document.getElementById('footer_basket');
    let lastScrollTop = 0;
    let footerVisible = true;
    const footerHeight = footer.offsetHeight;
    
    footer.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    function handleScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollDirection = scrollTop > lastScrollTop ? 'down' : 'up';
        
        const scrollFromTop = scrollTop;
        
        if (scrollDirection === 'down' && scrollFromTop > 100) {
            const hidePercentage = Math.min(100, (scrollFromTop - 100) / 20);
            const translateY = (hidePercentage / 100) * footerHeight;
            
            footer.style.transform = `translateY(${translateY}px)`;
            footerVisible = translateY < footerHeight * 0.9;
        } 
        else if (scrollDirection === 'up' || scrollFromTop <= 100) {
            const showPercentage = Math.max(0, 100 - scrollFromTop / 2);
            const translateY = ((100 - showPercentage) / 100) * footerHeight;
            
            footer.style.transform = `translateY(${translateY}px)`;
            footerVisible = true;
        }
        
        if (scrollFromTop <= 50) {
            footer.style.transform = 'translateY(0)';
            footerVisible = true;
        }
        
        lastScrollTop = scrollTop;
    }
    
    let ticking = false;
    window.addEventListener('scroll', function() {
        if (!ticking) {
            window.requestAnimationFrame(function() {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    });
});