document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.querySelector('.login-form');
 
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
 
    togglePasswordVisibility('password', 'toggle-password');
 
    loginForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const username = document.getElementById('username').value.trim();

        const password = document.getElementById('password').value;

        const users = JSON.parse(localStorage.getItem('users')) || [];

        const validUser = users.find(user => user.username === username && user.password === password);
 
        if (validUser) {

            localStorage.setItem('isLoggedIn', 'true');

            window.location.href = 'home.html';

        } else {

            alert('Usuário ou senha incorretos.');

        }

    });

});
