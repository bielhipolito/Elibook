document.addEventListener('DOMContentLoaded', () => {

    const pendingLoansTableBody = document.getElementById('pending-loans-table-body');

    const loanSearchInput = document.getElementById('loan-search'); // Adiciona a referência
 
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

        const today = new Date().toISOString().split('T');
 
        const pendingLoans = loans.filter(loan => !loan.returned && loan.dueDate < today);
 
        displayPendingLoans(pendingLoans, today, searchTerm);

    }
 
    function displayPendingLoans(pendingLoans, today, searchTerm) {

        pendingLoansTableBody.innerHTML = '';
 
        const filteredLoans = pendingLoans.filter(loan =>

            loan.book.toLowerCase().includes(searchTerm) ||

            loan.student.toLowerCase().includes(searchTerm)

        );
 
        if (filteredLoans.length === 0) {

            pendingLoansTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro pendente encontrado.</td></tr>';

            return;

        }
 
        filteredLoans.forEach(loan => {

            const dueDate = new Date(loan.dueDate);

            const todayDate = new Date(today);

            const diffTime = todayDate.getTime() - dueDate.getTime();

            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
 
            const row = document.createElement('tr');

            row.innerHTML = `
<td>${loan.book}</td>
<td>${loan.student}</td>
<td>${loan.loanDate}</td>
<td>${loan.dueDate}</td>
<td class="status-pending-loan">Atrasado</td>
<td>${diffDays} dias</td>

            `;

            pendingLoansTableBody.appendChild(row);

        });

    }

});

const SUPABASE_URL = "https://supabase.com/dashboard/project/kbaltnbemvxsijntsqgf/settings/general";
const SUPABASE_KEY = "kbaltnbemvxsijntsqgf";

async function carregarLivros() {
  const resposta = await fetch(`${SUPABASE_URL}/rest/v1/livros`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    }
  });
  const livros = await resposta.json();

  const lista = document.getElementById("lista-livros");
  lista.innerHTML = "";
  livros.forEach(livro => {
    const item = document.createElement("li");
    item.textContent = `${livro.titulo} - ${livro.autor} (${livro.ano})`;
    lista.appendChild(item);
  });
}

// Chama a função ao carregar a página
window.onload = carregarLivros;

