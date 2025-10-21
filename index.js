document.addEventListener('DOMContentLoaded', () => {

    const loanForm = document.querySelector('.loan-form');
    const loanTableBody = document.getElementById('loan-table-body');
    const dueDateInput = document.getElementById('due-date');
    const loanSearchInput = document.getElementById('loan-search');
 
    // Função para calcular e formatar a data de devolução padrão
    function getFormattedDueDate() {
        const today = new Date();
        const fifteenDaysLater = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
        return fifteenDaysLater.toISOString().split('T')[0];
    }
 
    // Define a data de devolução padrão para 15 dias no futuro
    dueDateInput.value = getFormattedDueDate();
 
    loadLoans();
 
    loanForm.addEventListener('submit', (event) => {
        event.preventDefault();
 
        const studentName = document.getElementById('nome-aluno').value.trim();
        const bookTitle = document.getElementById('titulo-livro').value.trim();
        const loanDate = new Date().toLocaleDateString('pt-BR');
        const dueDate = dueDateInput.value;
 
        if (!studentName || !bookTitle) {
            alert('Por favor, preencha todos os campos.');
            return;
        }
 
        // Validação de Aluno
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const isStudentRegistered = students.some(student => student.name.trim().toLowerCase() === studentName.toLowerCase());
 
        if (!isStudentRegistered) {
            alert('Erro: O aluno não está registrado. Por favor, cadastre o aluno primeiro.');
            return;
        }
 
        // Validação de Livro
        const books = JSON.parse(localStorage.getItem('books')) || [];
        const isBookRegistered = books.some(book => book.title.trim().toLowerCase() === bookTitle.toLowerCase());
 
        if (!isBookRegistered) {
            alert('Erro: O livro não está cadastrado. Por favor, cadastre o livro primeiro.');
            return;
        }
 
        const newLoan = {
            book: bookTitle,
            student: studentName,
            loanDate: loanDate,
            dueDate: dueDate,
            returned: false
        };
 
        addLoan(newLoan);
        loanForm.reset();
        dueDateInput.value = getFormattedDueDate();
    });
 
    // Adiciona o event listener para a barra de pesquisa
    loanSearchInput.addEventListener('input', () => {
        const searchTerm = loanSearchInput.value.toLowerCase();
        loadLoans(searchTerm);
    });
 
    function addLoan(newLoan) {
        let loans = JSON.parse(localStorage.getItem('loans')) || [];
        loans.push(newLoan);
        localStorage.setItem('loans', JSON.stringify(loans));
        loadLoans(); // CORREÇÃO: Chamada para recarregar a lista filtrada
        alert('Empréstimo registrado com sucesso!');
    }
 
    function loadLoans(searchTerm = '') {
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        displayLoans(loans, searchTerm);
    }
 
    function displayLoans(loans, searchTerm) {
        loanTableBody.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];
        
        let activeLoans = loans.filter(loan => !loan.returned);
        const books = JSON.parse(localStorage.getItem('books')) || [];
 
        // Filtra os empréstimos ativos com base no termo de pesquisa
        if (searchTerm) {
            activeLoans = activeLoans.filter(loan =>
                loan.book.toLowerCase().includes(searchTerm) ||
                loan.student.toLowerCase().includes(searchTerm)
            );
        }
 
        if (activeLoans.length === 0) {
            loanTableBody.innerHTML = `<tr><td colspan="6">Nenhum empréstimo encontrado.</td></tr>`;
            return;
        }
 
        activeLoans.forEach((loan) => {
            let status = '';
            let statusClass = '';
            const isLate = loan.dueDate < today;
            const bookDetails = books.find(book => book.title.trim().toLowerCase() === loan.book.trim().toLowerCase());
            const bookCategory = bookDetails ? bookDetails.category : 'N/A';
 
            if (isLate) {
                status = 'Atrasado';
                statusClass = 'status-pending-loan';
            } else {
                status = 'Em dia';
            }
 
            // CORREÇÃO: Encontra o índice original do empréstimo para o botão de devolução
            const originalIndex = loans.findIndex(l => 
                l.book === loan.book && 
                l.student === loan.student && 
                l.loanDate === loan.loanDate && 
                l.dueDate === loan.dueDate
            );
 
            const row = document.createElement('tr');
            // Converte a data de devolução para o formato dd/mm/yyyy
const formattedDueDate = new Date(loan.dueDate).toLocaleDateString('pt-BR');

row.innerHTML = `
    <td>${loan.book}</td>
    <td>${bookCategory}</td>
    <td>${loan.student}</td>
    <td>${loan.loanDate}</td>
    <td>${formattedDueDate}</td>
    <td class="${statusClass}">${status}</td>
    <td><button class="return-button" data-index="${originalIndex}">Devolver</button></td>
`;


            loanTableBody.appendChild(row);
        });
 
        document.querySelectorAll('.return-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const index = event.target.dataset.index;
                returnLoan(index);
            });
        });
    }
 
    function returnLoan(index) {
        let loans = JSON.parse(localStorage.getItem('loans')) || [];
 
        // CORREÇÃO: Usa o índice original para marcar o empréstimo como devolvido
        loans[index].returned = true;
 
        localStorage.setItem('loans', JSON.stringify(loans));
        loadLoans(loanSearchInput.value.toLowerCase());
        alert('Empréstimo devolvido com sucesso!');
    }
});
