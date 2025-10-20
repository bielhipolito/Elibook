document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('.register-form');
    const passwordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const passwordMatchMessage = document.getElementById('password-match-message');
 
    // Função para alternar visibilidade da senha
    function togglePasswordVisibility(inputId, toggleId) {
        const input = document.getElementById(inputId);
        const toggle = document.getElementById(toggleId);
        toggle.addEventListener('click', () => {
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            toggle.textContent = type === 'password' ? '👁️' : '🙈';
        });
    }
 
    togglePasswordVisibility('new-password', 'toggle-password');
    togglePasswordVisibility('confirm-password', 'toggle-confirm-password');
    // Função para validar senhas em tempo real
    function validatePasswords() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
 
        if (password.length > 0 && confirmPassword.length > 0) {
            if (password === confirmPassword) {
                passwordMatchMessage.textContent = 'As senhas coincidem.';
                passwordMatchMessage.className = 'password-validation-message valid';
            } else {
                passwordMatchMessage.textContent = 'As senhas não coincidem.';
                passwordMatchMessage.className = 'password-validation-message invalid';
            }
        } else {
            passwordMatchMessage.textContent = '';
        }
    }
 
    passwordInput.addEventListener('input', validatePasswords);
    confirmPasswordInput.addEventListener('input', validatePasswords);
 
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const newPassword = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        if (newPassword !== confirmPassword) {
            alert('As senhas não coincidem. Por favor, tente novamente.');
            return;
        }
        if (newPassword.length < 6) {
            alert('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
 
        const newUsername = document.getElementById('new-username').value.trim();
        let users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.some(user => user.username === newUsername);
 
        if (userExists) {
            alert('Nome de usuário já existe. Por favor, escolha outro.');
        } else {
            users.push({ username: newUsername, password: newPassword });
            localStorage.setItem('users', JSON.stringify(users));
            alert('Cadastro realizado com sucesso! Agora você pode fazer login.');
            window.location.href = 'login.html';
        }
    });
});