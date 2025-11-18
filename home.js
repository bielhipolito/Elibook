import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {
    const pendingLoansTableBody = document.getElementById('pending-loans-table-body');
    const loanSearchInput = document.getElementById('loan-search');

    if (!pendingLoansTableBody || !loanSearchInput) {
        console.error('Elementos HTML para a gestão de empréstimos pendentes não encontrados.');
        return;
    }

    loanSearchInput.addEventListener('input', () => {
        loadPendingLoans(loanSearchInput.value.toLowerCase());
    });

    loadPendingLoans();

    // --- Funções CRUD com Supabase ---

    async function loadPendingLoans(searchTerm = '') {
        // Busca todos os empréstimos ativos (returned = false), juntando com os dados do livro e do aluno
        let query = supabase
            .from('loans')
            .select(`
                id,
                loan_date,
                due_date,
                books (title),
                students (name, ra)
            `)
            .eq('returned', false);

        const { data: loans, error } = await query;

        if (error) {
            console.error('Não há um empréstimo pendente:', error);
            pendingLoansTableBody.innerHTML = '<tr><td colspan="6">Não há empréstimos.</td></tr>';
            return;
        }

        // Filtra os empréstimos que estão atrasados
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Zera a hora para comparação de datas

        const overdueLoans = [];

        loans.forEach(loan => {
            const dueDate = new Date(loan.due_date);
            dueDate.setHours(0, 0, 0, 0);

            // Calcula a diferença em milissegundos
            const diffTime = today.getTime() - dueDate.getTime();
            // Converte para dias (1000ms * 60s * 60min * 24h)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                overdueLoans.push({
                    ...loan,
                    diffDays
                });
            }
        });

        // Filtra os atrasados com base no termo de pesquisa
        const filteredOverdueLoans = overdueLoans.filter(loan =>
            loan.books.title.toLowerCase().includes(searchTerm) ||
            loan.students.name.toLowerCase().includes(searchTerm) ||
            loan.students.ra.toLowerCase().includes(searchTerm)
        );

        displayPendingLoans(filteredOverdueLoans);
    }

    // --- Funções de Exibição ---

    function displayPendingLoans(overdueLoans) {
        pendingLoansTableBody.innerHTML = '';

        if (overdueLoans.length === 0) {
            pendingLoansTableBody.innerHTML = '<tr><td colspan="6">Não há livro pendente encontrado.</td></tr>';
            return;
        }

        overdueLoans.forEach(loan => {
            // Converte as datas para exibição
            const formattedLoanDate = new Date(loan.loan_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const formattedDueDate = new Date(loan.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.books.title}</td>
                <td>${loan.students.name} (${loan.students.ra})</td>
                <td>${formattedLoanDate}</td>
                <td>${formattedDueDate}</td>
                <td class="status-pending-loan">Atrasado</td>
                <td>${loan.diffDays} dia${loan.diffDays > 1 ? 's' : ''}</td>
            `;
            pendingLoansTableBody.appendChild(row);
        });
    }

});

