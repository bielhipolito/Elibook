document.addEventListener('DOMContentLoaded', () => {
    const bookForm = document.querySelector('.book-form');
    const booksTableBody = document.getElementById('books-table-body');
    const loanSearchInput = document.getElementById('loan-search');
  
    let editingIndex = null; // controla se estamos editando um livro existente
  
    if (!bookForm || !booksTableBody) {
        console.error('Elementos principais não encontrados.');
        return;
      }
      
  
    loanSearchInput.addEventListener('input', () => {
      loadBooks(loanSearchInput.value.toUpperCase());
    });
  
    loadBooks();
  
    bookForm.addEventListener('submit', (event) => {
      event.preventDefault();
  
      const newBook = {
        genre: document.getElementById('book-genre').value.trim().toUpperCase(),
        title: document.getElementById('book-title').value.trim().toUpperCase(),
        author: document.getElementById('book-author').value.trim().toUpperCase(),
        publisher: document.getElementById('book-publisher').value.trim().toUpperCase(),
        quantity: document.getElementById('book-quantity').value.trim(),
        shelf: document.getElementById('book-shelf').value.trim().toUpperCase(),
        rack: document.getElementById('book-rack').value.trim().toUpperCase(),
        catalog: document.getElementById('book-catalog').value.trim().toUpperCase()
      };
  
      if (Object.values(newBook).some(v => !v)) {
        alert('POR FAVOR, PREENCHA TODOS OS CAMPOS.');
        return;
      }
  
      let books = JSON.parse(localStorage.getItem('books')) || [];
  
      if (editingIndex !== null) {
        // atualização de um livro existente
        books[editingIndex] = newBook;
        localStorage.setItem('books', JSON.stringify(books));
        editingIndex = null;
        alert('LIVRO ATUALIZADO COM SUCESSO!');
      } else {
        // novo cadastro
        const exists = books.some(book => book.title === newBook.title && book.author === newBook.author);
        if (exists) {
          alert('ESSE LIVRO JÁ ESTÁ CADASTRADO.');
          return;
        }
        books.push(newBook);
        localStorage.setItem('books', JSON.stringify(books));
        alert('LIVRO CADASTRADO COM SUCESSO!');
      }
  
      bookForm.reset();
      displayBooks(books, loanSearchInput.value.toUpperCase());
    });
  
    function loadBooks(searchTerm = '') {
      const books = JSON.parse(localStorage.getItem('books')) || [];
      displayBooks(books, searchTerm);
    }
  
    function displayBooks(books, searchTerm) {
      booksTableBody.innerHTML = '';
  
      const filteredBooks = books.filter(book =>
        Object.values(book).some(value => value.toUpperCase().includes(searchTerm))
      );
  
      if (filteredBooks.length === 0) {
        booksTableBody.innerHTML = '<tr><td colspan="9">NENHUM LIVRO ENCONTRADO.</td></tr>';
        return;
      }
  
      filteredBooks.forEach((book, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${book.genre}</td>
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher}</td>
          <td>${book.quantity}</td>
          <td>${book.shelf}</td>
          <td>${book.rack}</td>
          <td>${book.catalog}</td>
          <td>
            <button class="edit-book-button" data-index="${index}">EDITAR</button>
            <button class="remove-book-button" data-index="${index}">REMOVER</button>
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
          editBook(index);
        });
      });
    }
  
    function removeBook(index) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
      const confirmDelete = confirm('TEM CERTEZA QUE DESEJA REMOVER ESTE LIVRO?');
      if (!confirmDelete) return;
  
      books.splice(index, 1);
      localStorage.setItem('books', JSON.stringify(books));
      displayBooks(books, loanSearchInput.value.toUpperCase());
      alert('LIVRO REMOVIDO COM SUCESSO!');
    }
  
    function editBook(index) {
      let books = JSON.parse(localStorage.getItem('books')) || [];
      const book = books[index];
  
      document.getElementById('book-genre').value = book.genre;
      document.getElementById('book-title').value = book.title;
      document.getElementById('book-author').value = book.author;
      document.getElementById('book-publisher').value = book.publisher;
      document.getElementById('book-quantity').value = book.quantity;
      document.getElementById('book-shelf').value = book.shelf;
      document.getElementById('book-rack').value = book.rack;
      document.getElementById('book-catalog').value = book.catalog;
  
      editingIndex = index;
      alert('EDITE OS CAMPOS DESEJADOS E CLIQUE EM "CADASTRAR LIVRO" PARA SALVAR AS ALTERAÇÕES.');
    }
  }); 
