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