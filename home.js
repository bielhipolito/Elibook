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

    function loadPendingLoans(searchTerm = '') {
        const loans = JSON.parse(localStorage.getItem('loans')) || [];
        displayPendingLoans(loans, searchTerm);
    }

    function parseDate(dateString) {
        // Tenta converter tanto "2025-10-14" quanto "14/10/2025"
        if (!dateString) return null;
        if (dateString.includes('-')) return new Date(dateString + 'T00:00:00');
        if (dateString.includes('/')) {
            const [day, month, year] = dateString.split('/');
            return new Date(`${year}-${month}-${day}T00:00:00`);
        }
        return new Date(dateString);
    }

    function displayPendingLoans(loans, searchTerm) {
        pendingLoansTableBody.innerHTML = '';

        const today = new Date();
        const filteredLoans = loans.filter(loan =>
            !loan.returned &&
            (loan.book.toLowerCase().includes(searchTerm) ||
             loan.student.toLowerCase().includes(searchTerm))
        );

        const overdueLoans = [];

        filteredLoans.forEach(loan => {
            const loanDate = parseDate(loan.loanDate);
            if (!loanDate) return;

            const dueDate = new Date(loanDate.getTime() + 15 * 24 * 60 * 60 * 1000);
            const diffTime = today - dueDate;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                overdueLoans.push({
                    ...loan,
                    dueDate,
                    diffDays
                });
            }
        });

        if (overdueLoans.length === 0) {
            pendingLoansTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro pendente encontrado.</td></tr>';
            return;
        }

        overdueLoans.forEach(loan => {
            const formattedLoanDate = parseDate(loan.loanDate).toLocaleDateString('pt-BR');
            const formattedDueDate = loan.dueDate.toLocaleDateString('pt-BR');

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${loan.book}</td>
                <td>${loan.student}</td>
                <td>${formattedLoanDate}</td>
                <td>${formattedDueDate}</td>
                <td class="status-pending-loan">Atrasado</td>
                <td>${loan.diffDays} dia${loan.diffDays > 1 ? 's' : ''}</td>
            `;
            pendingLoansTableBody.appendChild(row);
        });
    }
});
