    auth.onAuthStateChanged((user) => {
        if (user && window.location.hash !== '#profile') {
            showProfile();

            history.replaceState(null, null, '#profile');
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.hash === '#profile') {
            auth.onAuthStateChanged((user) => {
                if (user) {
                    showProfile();
                } else {
                    showWelcome();
                    window.location.hash = '';
                }
            });
        } else {
            showWelcome();
        }
    });
    
    window.addEventListener('load', function() {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.style.display = 'none';
    }

    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.display = 'none';
    }
    });

    function showWelcome() {
        hideAllScreens();
        document.getElementById('welcomeScreen').style.display = 'block';
    }

    function showAuth(formType) {
        hideAllScreens();
        if (formType === 'login') {
            document.getElementById('loginForm').style.display = 'block';
        } else {
            document.getElementById('registerForm').style.display = 'block';
        }
    }

    function showForgotPassword() {
        hideAllScreens();
        document.getElementById('forgotPasswordForm').style.display = 'block';
    }

    function showProfile() {
    hideAllScreens();
    document.getElementById('profileScreen').style.display = 'block';

    window.scrollTo(0, 0);
    }

    function hideAllScreens() {
        document.getElementById('welcomeScreen').style.display = 'none';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('forgotPasswordForm').style.display = 'none';
        document.getElementById('profileScreen').style.display = 'none';
    }

    function togglePassword(inputId) {
        const input = document.getElementById(inputId);
        const button = input.nextElementSibling;
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }

    function showNotification(message, type = 'info') {
        const notification = document.getElementById('notification');
        const messageEl = document.getElementById('notificationMessage');
        
        messageEl.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'flex';

        setTimeout(() => {
            if (notification.style.display === 'flex') {
                hideNotification();
            }
        }, 5000);
    }

    function hideNotification() {
        document.getElementById('notification').style.display = 'none';
    }

    function showLoader() {
        document.getElementById('loader').style.display = 'flex';
    }

    function hideLoader() {
        document.getElementById('loader').style.display = 'none';
    }

    function showTerms() {
        document.getElementById('termsModal').style.display = 'flex';
    }

    function closeModal() {
        document.getElementById('termsModal').style.display = 'none';
    }

    function validatePassword(password, confirmPassword) {
        if (password.length < 6) {
            showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return false;
        }
        
        if (password !== confirmPassword) {
            showNotification('Пароли не совпадают', 'error');
            return false;
        }
        
        return true;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function updateProfileUI(user) {
        document.getElementById('userDisplayName').textContent = user.displayName || user.email.split('@')[0];
        document.getElementById('userEmail').textContent = user.email;

        const avatar = document.getElementById('userAvatar');
        if (user.photoURL) {
            avatar.innerHTML = `<img src="${user.photoURL}" alt="Аватар" style="width:100%;height:100%;border-radius:50%;">`;
        } else {
            avatar.innerHTML = `<i class="fas fa-user"></i>`;
        }

        const statusEl = document.getElementById('userStatus');
        const accountInfo = document.getElementById('accountInfo');
        
        if (user.emailVerified) {
            statusEl.textContent = 'Подтвержден';
            statusEl.style.color = '#4caf50';
            accountInfo.textContent = '✓ Email подтвержден';
            accountInfo.style.color = '#4caf50';
        } else {
            statusEl.textContent = 'Не подтвержден';
            statusEl.style.color = '#f44336';
            accountInfo.textContent = '⚠ Подтвердите email';
            accountInfo.style.color = '#ff9800';
        }

        const createdAt = new Date(user.metadata.creationTime);
        document.getElementById('userCreatedAt').textContent = createdAt.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

        async function login() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!validateEmail(email)) {
            showNotification('Введите корректный email', 'error');
            return;
        }
        
        try {
            showLoader();
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            showNotification('Вход выполнен успешно!', 'success');

            await updateUserData(userCredential.user);

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } catch (error) {
            let message = 'Ошибка входа';
            switch(error.code) {
                case 'auth/user-not-found':
                    message = 'Пользователь не найден';
                    break;
                case 'auth/wrong-password':
                    message = 'Неверный пароль';
                    break;
                case 'auth/invalid-email':
                    message = 'Неверный формат email';
                    break;
            }
            showNotification(message, 'error');
        } finally {
            hideLoader();
        }
    }

    async function register() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    if (!validateEmail(email)) {
        showNotification('Введите корректный email', 'error');
        return;
    }
    
    if (!validatePassword(password, confirmPassword)) {
        return;
    }
    
    try {
        showLoader();
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);

        await userCredential.user.updateProfile({
            displayName: name
        });

        await saveUserData(userCredential.user, name);

        await userCredential.user.sendEmailVerification();
        
        showNotification('Регистрация успешна! Проверьте email для подтверждения.', 'success');

        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
        
    } catch (error) {
        let message = 'Ошибка регистрации';
        switch(error.code) {
            case 'auth/email-already-in-use':
                message = 'Email уже используется';
                break;
            case 'auth/weak-password':
                message = 'Пароль слишком слабый';
                break;
            case 'auth/operation-not-allowed':
                message = 'Регистрация по email отключена';
                break;
        }
        showNotification(message, 'error');
    } finally {
        hideLoader();
    }
}

        async function signInWithGoogle() {
        try {
            showLoader();
            const provider = new firebase.auth.GoogleAuthProvider();
            const userCredential = await auth.signInWithPopup(provider);

            if (userCredential.additionalUserInfo.isNewUser) {
                await saveUserData(userCredential.user, userCredential.user.displayName);
            } else {
                await updateUserData(userCredential.user);
            }
            
            showNotification('Вход через Google выполнен!', 'success');

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1000);
            
        } catch (error) {
            let message = 'Ошибка входа через Google';
            if (error.code === 'auth/popup-closed-by-user') {
                message = 'Окно входа было закрыто';
            }
            showNotification(message, 'error');
        } finally {
            hideLoader();
        }
    }

    async function resetPassword() {
        const email = document.getElementById('resetEmail').value;
        
        if (!validateEmail(email)) {
            showNotification('Введите корректный email', 'error');
            return;
        }
        
        try {
            showLoader();
            await auth.sendPasswordResetEmail(email);
            showNotification('Ссылка для восстановления отправлена на email', 'success');
            showAuth('login');
        } catch (error) {
            showNotification('Ошибка отправки email', 'error');
        } finally {
            hideLoader();
        }
    }

    async function logout() {
        try {
            showLoader();
            await auth.signOut();
            showNotification('Вы вышли из системы', 'info');
            showWelcome();
        } catch (error) {
            showNotification('Ошибка выхода', 'error');
        } finally {
            hideLoader();
        }
    }

    async function verifyEmail() {
        try {
            showLoader();
            await auth.currentUser.sendEmailVerification();
            showNotification('Письмо для подтверждения отправлено', 'success');
        } catch (error) {
            showNotification('Ошибка отправки письма', 'error');
        } finally {
            hideLoader();
        }
    }

    async function changePassword() {
        const newPassword = prompt('Введите новый пароль (минимум 6 символов):');
        
        if (!newPassword || newPassword.length < 6) {
            showNotification('Пароль должен содержать минимум 6 символов', 'error');
            return;
        }
        
        try {
            showLoader();
            await auth.currentUser.updatePassword(newPassword);
            showNotification('Пароль успешно изменен', 'success');
        } catch (error) {
            showNotification('Ошибка изменения пароля', 'error');
        } finally {
            hideLoader();
        }
    }

    async function deleteAccount() {
        if (!confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            showLoader();

            const user = auth.currentUser;
            await database.ref('users/' + user.uid).remove();

            await user.delete();

            showNotification('Аккаунт успешно удален', 'success');
            showWelcome();
        } catch (error) {
            showNotification('Ошибка удаления аккаунта', 'error');
        } finally {
            hideLoader();
        }
    }

    async function saveUserData(user, name) {
        try {
            await database.ref('users/' + user.uid).set({
                uid: user.uid,
                email: user.email,
                displayName: name,
                photoURL: user.photoURL || '',
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                provider: user.providerData[0].providerId,
                emailVerified: user.emailVerified
            });
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    }

    async function updateUserData(user) {
        try {
            await database.ref('users/' + user.uid).update({
                lastLogin: firebase.database.ServerValue.TIMESTAMP,
                emailVerified: user.emailVerified,
                displayName: user.displayName,
                photoURL: user.photoURL || ''
            });
        } catch (error) {
            console.error('Ошибка обновления данных:', error);
        }
    }

    auth.onAuthStateChanged((user) => {
        if (user) {
            updateProfileUI(user);
            showProfile();
        } else {
            showWelcome();
        }
    });

    document.addEventListener('DOMContentLoaded', () => {
        showWelcome();
    });login()

    function goBack() {
        const referrer = document.referrer;
        
        if (referrer && referrer.includes('index.html')) {
            window.location.href = '../index.html';
        } else if (window.history.length > 1) {
            window.history.back();
        } else {
            showWelcome();
            history.replaceState(null, null, window.location.pathname);
        }
    }