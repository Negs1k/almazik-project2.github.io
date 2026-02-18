// Функция для показа всплывающего уведомления
function showSuccessMessage() {
    const blur = document.getElementById("blur-black");
    const block = document.getElementById("center-success");

    if (!blur || !block) {
        console.log('Элементы уведомления не найдены на этой странице');
        return;
    }

    // Показываем элементы
    blur.style.opacity = '1';
    blur.style.visibility = 'visible';
    block.classList.add("show");

    // Автоматическое скрытие через 2.5 секунды
    setTimeout(() => {
        blur.style.opacity = '0';
        blur.style.visibility = 'hidden';
        block.classList.remove("show");
    }, 10000);
}

// Функция для ручного закрытия уведомления
function closeSuccessMessage() {
    const blur = document.getElementById("blur-black");
    const block = document.getElementById("center-success");

    if (!blur || !block) return;

    blur.style.opacity = '0';
    blur.style.visibility = 'hidden';
    block.classList.remove("show");
}

// Инициализация обработчиков кнопок при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Получаем элементы уведомления
    const blur = document.getElementById("blur-black");
    const block = document.getElementById("center-success");
    
    // Если уведомление есть на странице, настраиваем обработчики
    if (blur && block) {
        // Получаем кнопки
        const continueBtn = block.querySelector('.continue-btn');
        const cartBtn = block.querySelector('.cart-btn');
        
        // Обработчик для кнопки "Продолжить покупки"
        if (continueBtn) {
            continueBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeSuccessMessage();
            });
        }
        
        // Обработчик для кнопки "В корзину"
        if (cartBtn) {
            cartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeSuccessMessage();
                window.location.href = "basket.html";
            });
        }
        
        // Обработчик для клика на размытый фон
        blur.addEventListener('click', function(e) {
            if (e.target === blur) {
                closeSuccessMessage();
            }
        });
    }
});