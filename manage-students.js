document.addEventListener('DOMContentLoaded', () => {

    const studentForm = document.querySelector('.student-form');

    const studentsTableBody = document.getElementById('students-table-body');

    const editModal = document.getElementById('edit-student-modal');

    const closeModalButton = document.querySelector('.close-button');

    const editForm = document.getElementById('edit-student-form');

    const loanSearchInput = document.getElementById('loan-search'); // Referência à barra de pesquisa
 
    const studentClassInput = document.getElementById('student-class');

    const editStudentClassInput = document.getElementById('edit-student-class');
 
    if (!studentForm || !studentsTableBody || !loanSearchInput) {

        console.error('Elementos HTML para a gestão de alunos não encontrados.');

        return;

    }
 
    // Função para formatar a string com a primeira letra de cada palavra maiúscula

    function toTitleCase(str) {

        return str.toLowerCase().split(' ').map(function(word) {

            return (word.charAt(0).toUpperCase() + word.slice(1));

        }).join(' ');

    }

    // Função para filtrar e formatar a entrada em tempo real

    function filterInput(inputElement) {

        if (inputElement) {

            inputElement.addEventListener('input', () => {

                let value = inputElement.value.toUpperCase();

                let sanitizedValue = '';

                // Primeiro caractere deve ser um número

                if (value.length > 0 && /[1236789]/.test(value.charAt(0))) {

                    sanitizedValue += value.charAt(0);

                }

                // Segundo caractere deve ser uma letra

                if (value.length > 1 && /[A-E]/.test(value.charAt(1))) {

                    sanitizedValue += value.charAt(1);

                }
 
                inputElement.value = sanitizedValue;

            });

        }

    }
 
    // Aplica a funcionalidade aos campos de turma

    filterInput(studentClassInput);

    filterInput(editStudentClassInput);
 
    // Adiciona o event listener para a barra de pesquisa

    loanSearchInput.addEventListener('input', () => {

        loadStudents(loanSearchInput.value.toLowerCase());

    });
 
    loadStudents();
 
    studentForm.addEventListener('submit', (event) => {

        event.preventDefault();
 
        const name = document.getElementById('student-name').value.trim();

        const studentClass = studentClassInput.value.trim();

        const ra = document.getElementById('student-ra').value.trim();
 
        if (!name || !studentClass || !ra) {

            alert('Por favor, preencha todos os campos.');

            return;

        }
 
        if (ra.length !== 14) {

            alert('O RA deve ter exatamente 14 caracteres.');

            return;

        }
 
        const classPattern = /^[A-E]$/;

        if (!classPattern.test(studentClass)) {

            alert('O campo Turma deve ser composto por um dígito (1, 2, 3, 6, 7, 8 ou 9) e uma letra (A a E).');

            return;

        }
 
        const newStudent = { name: toTitleCase(name), class: studentClass, ra };
 
        addStudent(newStudent);

        studentForm.reset();

    });
 
    // Evento para fechar o modal

    closeModalButton.addEventListener('click', () => {

        editModal.style.display = 'none';

    });

    window.addEventListener('click', (event) => {

        if (event.target === editModal) {

            editModal.style.display = 'none';

        }

    });
 
    // Evento para salvar as edições

    editForm.addEventListener('submit', (event) => {

        event.preventDefault();

        const index = document.getElementById('edit-student-index').value;

        const newName = document.getElementById('edit-student-name').value.trim();

        const newClass = editStudentClassInput.value.trim();

        const newRa = document.getElementById('edit-student-ra').value.trim();
 
        if (!newName || !newClass || !newRa) {

            alert('Por favor, preencha todos os campos.');

            return;

        }
 
        if (newRa.length !== 14) {

            alert('O RA deve ter exatamente 14 caracteres.');

            return;

        }
 
        const classPattern = /^[A-E]$/;

        if (!classPattern.test(newClass)) {

            alert('O campo Turma deve ser composto por um dígito (1, 2, 3, 6, 7, 8 ou 9) e uma letra (A a E).');

            return;

        }
 
        let students = JSON.parse(localStorage.getItem('students')) || [];

        students[index].name = toTitleCase(newName);

        students[index].class = newClass;

        students[index].ra = newRa;
 
        localStorage.setItem('students', JSON.stringify(students));

        displayStudents(students, loanSearchInput.value.toLowerCase());

        editModal.style.display = 'none';

    });
 
    function addStudent(newStudent) {

        let students = JSON.parse(localStorage.getItem('students')) || [];

        students.push(newStudent);

        localStorage.setItem('students', JSON.stringify(students));

        displayStudents(students, loanSearchInput.value.toLowerCase());

        alert('Aluno cadastrado com sucesso!');

    }
 
    function loadStudents(searchTerm = '') {

        const students = JSON.parse(localStorage.getItem('students')) || [];

        displayStudents(students, searchTerm);

    }
 
    function displayStudents(students, searchTerm) {

        studentsTableBody.innerHTML = '';

        const loans = JSON.parse(localStorage.getItem('loans')) || [];
 
        const filteredStudents = students.filter(student =>

            student.name.toLowerCase().includes(searchTerm) ||

            student.ra.toLowerCase().includes(searchTerm) ||

            student.class.toLowerCase().includes(searchTerm)

        );
 
        if (filteredStudents.length === 0) {

            studentsTableBody.innerHTML = '<tr><td colspan="5">Nenhum aluno encontrado.</td></tr>';

        }
 
        filteredStudents.forEach((student, index) => {

            const hasPendingLoan = loans.some(loan => !loan.returned && loan.student.toLowerCase() === student.name.toLowerCase());

            const statusText = hasPendingLoan ? 'Com livro pendente' : 'Sem pendências';

            const statusClass = hasPendingLoan ? 'status-pending' : 'status-clear';
 
            const row = document.createElement('tr');

            row.innerHTML = `
<td>${student.name}</td>
<td>${student.class}</td>
<td>${student.ra}</td>
<td class="${statusClass}">${statusText}</td>
<td>
<button class="edit-button" data-index="${index}">Editar</button>
<button class="return-button" data-index="${index}">Remover</button>
</td>

            `;

            studentsTableBody.appendChild(row);

        });
 
        document.querySelectorAll('#students-table-body .return-button').forEach(button => {

            button.addEventListener('click', (event) => {

                const index = event.target.dataset.index;

                removeStudent(index);

            });

        });
 
        document.querySelectorAll('.edit-button').forEach(button => {

            button.addEventListener('click', (event) => {

                const index = event.target.dataset.index;

                openEditModal(index);

            });

        });

    }
 
    function removeStudent(index) {

        let students = JSON.parse(localStorage.getItem('students')) || [];

        const studentToRemove = students[index];
 
        const loans = JSON.parse(localStorage.getItem('loans')) || [];

        const hasPendingLoan = loans.some(loan => !loan.returned && loan.student.toLowerCase() === studentToRemove.name.toLowerCase());
 
        if (hasPendingLoan) {

            alert('Não é possível remover o aluno pois ele possui um livro pendente.');

        } else {

            students.splice(index, 1);

            localStorage.setItem('students', JSON.stringify(students));

            displayStudents(students, loanSearchInput.value.toLowerCase());

            alert('Aluno removido com sucesso!');

        }

    }
 
    function openEditModal(index) {

        let students = JSON.parse(localStorage.getItem('students')) || [];

        const studentToEdit = students[index];
 
        document.getElementById('edit-student-index').value = index;

        document.getElementById('edit-student-name').value = studentToEdit.name;

        document.getElementById('edit-student-class').value = studentToEdit.class;

        document.getElementById('edit-student-ra').value = studentToEdit.ra;
 
        editModal.style.display = 'block';

    }

});

 