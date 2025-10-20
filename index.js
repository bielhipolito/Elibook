document.addEventListener('DOMContentLoaded', () => {

    const loanForm = document.querySelector('.loan-form');

    const loanTableBody = document.getElementById('loan-table-body');

    const dueDateInput = document.getElementById('due-date');

    const loanSearchInput = document.getElementById('loan-search'); // Esta linha permanece
 
    // ... (resto do código)

});

 
    // Função para calcular e formatar a data

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

        displayLoans(loans);

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
 
        activeLoans.forEach((loan, index) => {

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
 
            const row = document.createElement('tr');

            row.innerHTML = `
<td>${loan.book}</td>
<td>${bookCategory}</td>
<td>${loan.student}</td>
<td>${loan.loanDate}</td>
<td>${loan.dueDate} <span class="${statusClass}">${status}</span></td>
<td><button class="return-button" data-index="${index}">Devolver</button></td>

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

        const activeLoans = loans.filter(loan => !loan.returned);

        const loanToReturn = activeLoans[index];
 
        const originalIndex = loans.findIndex(loan => 

            loan.book === loanToReturn.book && 

            loan.student === loanToReturn.student && 

            loan.loanDate === loanToReturn.loanDate && 

            loan.dueDate === loanToReturn.dueDate

        );
 
        if (originalIndex !== -1) {

            loans[originalIndex].returned = true;

        }
 
        localStorage.setItem('loans', JSON.stringify(loans));

        displayLoans(loans, loanSearchInput.value.toLowerCase());

        alert('Empréstimo devolvido com sucesso!');

    }
