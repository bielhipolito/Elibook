import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {

    const loanForm = document.querySelector('.loan-form');
    const loanTableBody = document.getElementById('loan-table-body');
    const dueDateInput = document.getElementById('due-date');
    const loanSearchInput = document.getElementById('loan-search');

    // Função para calcular e formatar a data de devolução padrão
    function getFormattedDueDate() {
        const today = new Date();
        // 15 dias depois
        const fifteenDaysLater = new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000);
        // Formato YYYY-MM-DD para o input type="date"
        return fifteenDaysLater.toISOString().split('T')[0];
    }

    // Define a data de devolução padrão para 15 dias no futuro
    dueDateInput.value = getFormattedDueDate();

    loadLoans();

    loanForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const studentRA = document.getElementById('ra-aluno').value.trim(); // Usaremos RA como identificador
        const bookID = document.getElementById('id-livro').value.trim();     // Usaremos ID do livro como identificador
        const loanDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        const dueDate = dueDateInput.value;

        if (!studentRA || !bookID) {
            alert('Por favor, preencha o RA do Aluno e o ID do Livro.');
            return;
        }

        // 1. Validação de Aluno (usando RA)
        const { data: studentData, error: studentError } = await supabase
            .from('students')
            .select('ra, name')
            .eq('ra', studentRA)
            .single();

        if (studentError || !studentData) {
            alert('Erro: Aluno não encontrado. Por favor, verifique o RA.');
            return;
        }

        // 2. Validação de Livro (usando ID)
        const { data: bookData, error: bookError } = await supabase
            .from('books')
            .select('id, title')
            .eq('id', bookID)
            .single();

        if (bookError || !bookData) {
            alert('Erro: Livro não encontrado. Por favor, verifique o ID do Livro.');
            return;
        }

        // 3. Verificar se o livro já está emprestado
        const { data: activeLoan, error: loanCheckError } = await supabase
            .from('loans')
            .select('id')
            .eq('book_id', bookID)
            .eq('returned', false)
            .single();

        if (activeLoan) {
            alert('Erro: Este livro já está emprestado e ainda não foi devolvido.');
            return;
        }

        const newLoan = {
            book_id: bookID,
            student_ra: studentRA,
            loan_date: loanDate,
            due_date: dueDate,
            returned: false
        };

        await addLoan(newLoan);
        loanForm.reset();
        dueDateInput.value = getFormattedDueDate();
    });

    // Adiciona o event listener para a barra de pesquisa
    loanSearchInput.addEventListener('input', () => {
        const searchTerm = loanSearchInput.value.toLowerCase();
        loadLoans(searchTerm);
    });

    // --- Funções CRUD com Supabase ---

    async function addLoan(newLoan) {
        const { error } = await supabase
            .from('loans')
            .insert([newLoan]);

        if (error) {
            console.error('Erro ao registrar empréstimo:', error);
            alert('Erro ao registrar empréstimo. Veja o console para detalhes.');
            return;
        }

        alert('Empréstimo registrado com sucesso!');
        await loadLoans(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    async function loadLoans(searchTerm = '') {
        // Busca todos os empréstimos ativos, juntando com os dados do livro e do aluno
        let query = supabase
            .from('loans')
            .select(`
                id,
                loan_date,
                due_date,
                returned,
                books (id, title, category),
                students (ra, name)
            `)
            .eq('returned', false);

        const { data: loans, error } = await query;

        if (error) {
            console.error('Erro ao carregar empréstimos:', error);
            loanTableBody.innerHTML = `<tr><td colspan="6">Erro ao carregar empréstimos.</td></tr>`;
            return;
        }

        // Filtra os empréstimos ativos com base no termo de pesquisa (no front-end por enquanto)
        const filteredLoans = loans.filter(loan =>
            loan.books.title.toLowerCase().includes(searchTerm) ||
            loan.students.name.toLowerCase().includes(searchTerm) ||
            loan.students.ra.toLowerCase().includes(searchTerm)
        );

        displayLoans(filteredLoans);
    }

    async function returnLoan(loanId) {
        if (!confirm('Confirmar devolução do livro?')) {
            return;
        }

        const { error } = await supabase
            .from('loans')
            .update({ returned: true })
            .eq('id', loanId);

        if (error) {
            console.error('Erro ao registrar devolução:', error);
            alert('Erro ao registrar devolução. Veja o console para detalhes.');
            return;
        }

        alert('Empréstimo devolvido com sucesso!');
        await loadLoans(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    // --- Funções de Exibição ---

    function displayLoans(loans) {
        loanTableBody.innerHTML = '';
        const today = new Date().toISOString().split('T')[0];

        if (loans.length === 0) {
            loanTableBody.innerHTML = `<tr><td colspan="7">Nenhum empréstimo ativo encontrado.</td></tr>`;
            return;
        }

        loans.forEach((loan) => {
            let status = 'Em dia';
            let statusClass = '';
            const isLate = loan.due_date < today;

            if (isLate) {
                status = 'Atrasado';
                statusClass = 'status-pending-loan';
            }

            const row = document.createElement('tr');
            // Converte a data de devolução para o formato dd/mm/yyyy
            const formattedLoanDate = new Date(loan.loan_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const formattedDueDate = new Date(loan.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            row.innerHTML = `
                <td>${loan.books.title}</td>
                <td>${loan.books.category || 'N/A'}</td>
                <td>${loan.students.name} (${loan.students.ra})</td>
                <td>${formattedLoanDate}</td>
                <td>${formattedDueDate}</td>
                <td class="${statusClass}">${status}</td>
                <td><button class="return-button" data-id="${loan.id}">Devolver</button></td>
            `;

            loanTableBody.appendChild(row);
        });

        document.querySelectorAll('.return-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const loanId = event.target.dataset.id;
                returnLoan(loanId);
            });
        });
    }

});
