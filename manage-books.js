document.addEventListener('DOMContentLoaded', () => {

    const bookForm = document.querySelector('.book-form');

    const booksTableBody = document.getElementById('books-table-body');

    const editBookModal = document.getElementById('edit-book-modal');

    const closeBookModalButton = document.getElementById('close-book-modal');

    const editBookForm = document.getElementById('edit-book-form');

    const loanSearchInput = document.getElementById('loan-search'); // Referência à barra de pesquisa
 
    if (!bookForm || !booksTableBody || !loanSearchInput) {

        // Alerta para o caso de elementos importantes não serem encontrados

        console.error('Elementos HTML para a gestão de livros não encontrados.');

        return;

    }
 
    // Adiciona o event listener para a barra de pesquisa

    loanSearchInput.addEventListener('input', () => {

        loadBooks(loanSearchInput.value.toLowerCase());

    });
 
    loadBooks();
 
    bookForm.addEventListener('submit', (event) => {

        event.preventDefault();
 
        const title = document.getElementById('book-title').value.trim();

        const author = document.getElementById('book-author').value.trim();

        const publisher = document.getElementById('book-publisher').value.trim();

        const category = document.getElementById('book-category').value.trim();

        const id = document.getElementById('book-id').value.trim();
 
        if (!title || !author || !publisher || !category || !id) {

            alert('Por favor, preencha todos os campos.');

            return;

        }
 
        const newBook = { id, title, author, publisher, category };
 
        addBook(newBook);

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

    editBookForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const index = document.getElementById('edit-book-index').value;

        const newTitle = document.getElementById('edit-book-title').value.trim();

        const newAuthor = document.getElementById('edit-book-author').value.trim();

        const newPublisher = document.getElementById('edit-book-publisher').value.trim();

        const newCategory = document.getElementById('edit-book-category').value.trim();
 
        if (!newTitle || !newAuthor || !newPublisher || !newCategory) {

            alert('Por favor, preencha todos os campos.');

            return;

        }
 
        let books = JSON.parse(localStorage.getItem('books')) || [];

        books[index].title = newTitle;

        books[index].author = newAuthor;

        books[index].publisher = newPublisher;

        books[index].category = newCategory;
 
        localStorage.setItem('books', JSON.stringify(books));

        displayBooks(books, loanSearchInput.value.toLowerCase()); // Mantém o termo de busca após a edição

        editBookModal.style.display = 'none';

    });
 
    function addBook(newBook) {

        let books = JSON.parse(localStorage.getItem('books')) || [];

        const bookExists = books.some(book => book.id === newBook.id);

        if (bookExists) {

            alert('Erro: Já existe um livro com este ID. Por favor, use um ID diferente.');

            return;

        }
 
        books.push(newBook);

        localStorage.setItem('books', JSON.stringify(books));

        displayBooks(books, loanSearchInput.value.toLowerCase()); // Mantém o termo de busca após o cadastro

        alert('Livro cadastrado com sucesso!');

    }
 
    function loadBooks(searchTerm = '') {

        const books = JSON.parse(localStorage.getItem('books')) || [];

        displayBooks(books, searchTerm);

    }
 
    function displayBooks(books, searchTerm) {

        booksTableBody.innerHTML = '';

        const filteredBooks = books.filter(book => 

            book.title.toLowerCase().includes(searchTerm) ||

            book.author.toLowerCase().includes(searchTerm) ||

            book.publisher.toLowerCase().includes(searchTerm) ||

            book.category.toLowerCase().includes(searchTerm) ||

            book.id.toLowerCase().includes(searchTerm)

        );
 
        if (filteredBooks.length === 0) {

            booksTableBody.innerHTML = '<tr><td colspan="6">Nenhum livro encontrado.</td></tr>';

        }
 
        filteredBooks.forEach((book, index) => {

            const row = document.createElement('tr');

            row.innerHTML = `
<td>${book.id}</td>
<td>${book.title}</td>
<td>${book.author}</td>
<td>${book.publisher}</td>
<td>${book.category}</td>
<td>
<button class="edit-book-button" data-index="${index}">Editar</button>
<button class="remove-book-button" data-index="${index}">Remover</button>
</td>

            `;

            booksTableBody.appendChild(row);

        });
 
        document.querySelectorAll('.remove-book-button').forEach(button => {

            button.addEventListener('click', (event) => {

                const index = event.target.dataset.index;

                removeBook(index);

            });

        });
 
        document.querySelectorAll('.edit-book-button').forEach(button => {

            button.addEventListener('click', (event) => {

                const index = event.target.dataset.index;

                openEditBookModal(index);

            });

        });

    }
 
    function removeBook(index) {

        let books = JSON.parse(localStorage.getItem('books')) || [];

        const bookToRemove = books[index];
 
        const loans = JSON.parse(localStorage.getItem('loans')) || [];

        const isBookOnLoan = loans.some(loan => !loan.returned && loan.book === bookToRemove.title);
 
        if (isBookOnLoan) {

            alert('Não é possível remover o livro pois ele está emprestado.');

        } else {

            books.splice(index, 1);

            localStorage.setItem('books', JSON.stringify(books));

            displayBooks(books, loanSearchInput.value.toLowerCase()); // Mantém o termo de busca após a remoção

            alert('Livro removido com sucesso!');

        }

    }
 
    function openEditBookModal(index) {

        let books = JSON.parse(localStorage.getItem('books')) || [];

        const bookToEdit = books[index];
 
        document.getElementById('edit-book-index').value = index;

        document.getElementById('edit-book-title').value = bookToEdit.title;

        document.getElementById('edit-book-author').value = bookToEdit.author;

        document.getElementById('edit-book-publisher').value = bookToEdit.publisher;

        document.getElementById('edit-book-category').value = bookToEdit.category;

        document.getElementById('edit-book-id').value = bookToEdit.id;
 
        editBookModal.style.display = 'block';

    }

});

 