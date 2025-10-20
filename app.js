document.addEventListener('DOMContentLoaded', () => {
    // Lista das páginas que não precisam de autenticação
    const authPages = ['login.html', 'register.html'];
    const currentPage = window.location.pathname.split('/').pop();
 
    // Redireciona para a página de login se não estiver logado e não estiver em uma página de autenticação
    if (localStorage.getItem('isLoggedIn') !== 'true' && !authPages.includes(currentPage)) {
        window.location.href = 'login.html';
    }
 
    // Funcionalidade do botão "Sair" em todas as páginas
    const logoutLink = document.getElementById('logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', (event) => {
            event.preventDefault();
            localStorage.removeItem('isLoggedIn');
            window.location.href = 'login.html';
        });
    }
 
    // Ouve por mudanças no localStorage em outras abas
    window.addEventListener('storage', (event) => {
        // Recarrega a página se a lista de empréstimos for alterada
        if (event.key === 'loans') {
            window.location.reload();
        }
    });
});