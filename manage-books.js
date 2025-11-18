import { supabase } from './supabaseClient.js';

document.addEventListener('DOMContentLoaded', () => {

    const bookForm = document.querySelector('.book-form');
    const booksTableBody = document.getElementById('books-table-body');
    const editBookModal = document.getElementById('edit-book-modal');
    const closeBookModalButton = document.getElementById('close-book-modal');
    const editBookForm = document.getElementById('edit-book-form');
    const loanSearchInput = document.getElementById('loan-search'); // Referência à barra de pesquisa

    if (!bookForm || !booksTableBody || !loanSearchInput) {
        console.error('Elementos HTML para a gestão de livros não encontrados.');
        return;
    }

    // Adiciona o event listener para a barra de pesquisa
    loanSearchInput.addEventListener('input', () => {
        loadBooks(loanSearchInput.value.toLowerCase());
    });

    loadBooks();

    bookForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const title = document.getElementById('book-title').value.trim();
        const author = document.getElementById('book-author').value.trim();
        const publisher = document.getElementById('book-publisher').value.trim();
        const category = document.getElementById('book-category').value.trim();
        const id = document.getElementById('book-id').value.trim(); // Assumindo que 'id' é o identificador único

        if (!title || !author || !publisher || !category || !id) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const newBook = { id, title, author, publisher, category };

        await addBook(newBook);

        bookForm.reset();
    });

    // Evento para fechar o modal de edição
    closeBookModalButton.addEventListener('click', () => {
        editBookModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === editBookModal) {
            editBookModal.style.display = 'none';
        }
    });

    // Evento para salvar as edições
    editBookForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const bookId = document.getElementById('edit-book-id').value; // Usamos o ID do livro, não o index
        const newTitle = document.getElementById('edit-book-title').value.trim();
        const newAuthor = document.getElementById('edit-book-author').value.trim();
        const newPublisher = document.getElementById('edit-book-publisher').value.trim();
        const newCategory = document.getElementById('edit-book-category').value.trim();

        if (!newTitle || !newAuthor || !newPublisher || !newCategory) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const updatedBook = {
            title: newTitle,
            author: newAuthor,
            publisher: newPublisher,
            category: newCategory
        };

        await updateBook(bookId, updatedBook);

        editBookModal.style.display = 'none';
    });

    // --- Funções CRUD com Supabase ---

    async function addBook(newBook) {
        // 1. Verificar se o livro já existe
        const { data: existingBook, error: fetchError } = await supabase
            .from('books')
            .select('id')
            .eq('id', newBook.id)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = No rows found
            console.error('Erro ao verificar livro existente:', fetchError);
            alert('Erro ao verificar livro existente. Veja o console para detalhes.');
            return;
        }

        if (existingBook) {
            alert('Erro: Já existe um livro com este ID. Por favor, use um ID diferente.');
            return;
        }

        // 2. Inserir o novo livro
        const { error: insertError } = await supabase
            .from('books')
            .insert([newBook]);

        if (insertError) {
            console.error('Erro ao cadastrar livro:', insertError);
            alert('Erro ao cadastrar livro. Veja o console para detalhes.');
            return;
        }

        alert('Livro cadastrado com sucesso!');
        await loadBooks(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    async function loadBooks(searchTerm = '') {
        let query = supabase
            .from('books')
            .select('*');

        // Para projetos grandes, o filtro deve ser feito no Supabase.
        // Por enquanto, carregamos todos e filtramos no front para manter a compatibilidade com a busca.
        const { data: books, error } = await query;

        if (error) {
            console.error('Não há livros cadastrados:', error);
            booksTableBody.innerHTML = '<tr><td colspan="6">Não há livros cadastrados.</td></tr>';
            return;
        }

        // Filtro no front-end
        const filteredBooks = books.filter(book =>
            book.title.toLowerCase().includes(searchTerm) ||
            book.author.toLowerCase().includes(searchTerm) ||
            book.publisher.toLowerCase().includes(searchTerm) ||
            book.category.toLowerCase().includes(searchTerm) ||
            (book.id && book.id.toLowerCase().includes(searchTerm))
        );

        displayBooks(filteredBooks);
    }

    async function updateBook(bookId, updatedBook) {
        const { error } = await supabase
            .from('books')
            .update(updatedBook)
            .eq('id', bookId);

        if (error) {
            console.error('Erro ao atualizar livro:', error);
            alert('Erro ao atualizar livro. Veja o console para detalhes.');
            return;
        }

        alert('Livro atualizado com sucesso!');
        await loadBooks(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    async function removeBook(bookId) {
        // 1. Verificar se o livro está emprestado
        const { data: activeLoan, error: loanCheckError } = await supabase
            .from('loans')
            .select('id')
            .eq('book_id', bookId)
            .eq('returned', false);

        if (loanCheckError) {
            console.error('Erro ao verificar empréstimo:', loanCheckError);
            alert('Erro ao verificar empréstimo. Veja o console para detalhes.');
            return;
        }

        if (activeLoan && activeLoan.length > 0) {
            alert('Não é possível remover o livro pois ele está emprestado.');
            return;
        }

        if (!confirm('Tem certeza que deseja remover este livro?')) {
            return;
        }

        const { error } = await supabase
            .from('books')
            .delete()
            .eq('id', bookId);

        if (error) {
            console.error('Erro ao remover livro:', error);
            alert('Erro ao remover livro. Veja o console para detalhes.');
            return;
        }

        alert('Livro removido com sucesso!');
        await loadBooks(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    // --- Funções de Exibição e Modal ---

    function displayBooks(books) {
        booksTableBody.innerHTML = '';

        if (books.length === 0) {
            booksTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro cadastrado.</td></tr>';
            return;
        }

        books.forEach((book) => {
            const row = document.createElement('tr');

            // Usamos book.id como identificador único para as ações
            row.innerHTML = `
                <td>${book.id || 'N/A'}</td>
                <td>${book.title || 'N/A'}</td>
                <td>${book.author || 'N/A'}</td>
                <td>${book.publisher || 'N/A'}</td>
                <td>${book.category || 'N/A'}</td>
                <td>
                    <button class="edit-book-button" data-id="${book.id}">Editar</button>
                    <button class="remove-book-button" data-id="${book.id}">Remover</button>
                </td>
            `;

            booksTableBody.appendChild(row);
        });

        // Adiciona listeners para os botões de Ação
        document.querySelectorAll('.remove-book-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookId = event.target.dataset.id;
                removeBook(bookId);
            });
        });

        document.querySelectorAll('.edit-book-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const bookId = event.target.dataset.id;
                // Passamos a lista completa para evitar uma nova busca no Supabase
                openEditBookModal(bookId, books);
            });
        });

    }

    function openEditBookModal(bookId, books) {
        const bookToEdit = books.find(book => book.id === bookId);

        if (!bookToEdit) {
            alert('Livro não encontrado para edição.');
            return;
        }

        // Preenche o modal com os dados do livro
        document.getElementById('edit-book-id').value = bookToEdit.id;
        document.getElementById('edit-book-title').value = bookToEdit.title;
        document.getElementById('edit-book-author').value = bookToEdit.author;
        document.getElementById('edit-book-publisher').value = bookToEdit.publisher;
        document.getElementById('edit-book-category').value = bookToEdit.category;

        editBookModal.style.display = 'block';
    }

});


