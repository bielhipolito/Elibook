document.addEventListener('DOMContentLoaded', () => {

    const studentForm = document.querySelector('.student-form');
    const studentsTableBody = document.getElementById('students-table-body');
    const editModal = document.getElementById('edit-student-modal');
    const closeModalButton = document.querySelector('#edit-student-modal .close-button');
    const editForm = document.getElementById('edit-student-form');
    const loanSearchInput = document.getElementById('loan-search');
 
    const studentClassInput = document.getElementById('student-class');
    const editStudentClassInput = document.getElementById('edit-student-class');
 
    if (!studentForm || !studentsTableBody || !loanSearchInput) {
        console.error('Elementos HTML para a gestão de alunos não encontrados.');
        return;
    }
 
    function toTitleCase(str) {
        return str.toLowerCase().split(' ').map(function(word) {
            return (word.charAt(0).toUpperCase() + word.slice(1));
        }).join(' ');
    }
 
    function filterInput(inputElement) {
        if (inputElement) {
            inputElement.addEventListener('input', () => {
                let value = inputElement.value.toUpperCase();
                let sanitizedValue = '';
 
                if (value.length > 0 && /[1236789]/.test(value.charAt(0))) {
                    sanitizedValue += value.charAt(0);
                }
 
                if (value.length > 1 && /[A-E]/.test(value.charAt(1))) {
                    sanitizedValue += value.charAt(1);
                }
                inputElement.value = sanitizedValue;
            });
        }
    }
 
    filterInput(studentClassInput);
    filterInput(editStudentClassInput);
 
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
 
        const classPattern = /^[1236789][A-E]$/;
        if (!classPattern.test(studentClass)) {
            alert('O campo Turma deve ser composto por um dígito (1, 2, 3, 6, 7, 8 ou 9) e uma letra (A a E).');
            return;
        }
 
        const newStudent = { name: toTitleCase(name), class: studentClass, ra };
        addStudent(newStudent);
        studentForm.reset();
    });
 
    closeModalButton.addEventListener('click', () => {
        editModal.style.display = 'none';
    });
 
    window.addEventListener('click', (event) => {
        if (event.target === editModal) {
            editModal.style.display = 'none';
        }
    });
 
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
 
        const classPattern = /^[1236789][A-E]$/;
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
 
        filteredStudents.forEach((student) => {
            const hasPendingLoan = loans.some(loan => !loan.returned && loan.student.toLowerCase() === student.name.toLowerCase());
            const statusText = hasPendingLoan ? 'Com livro pendente' : 'Sem pendências';
            const statusClass = hasPendingLoan ? 'status-pending' : 'status-clear';
            
            // CORREÇÃO: Encontra o índice original do aluno para os botões
            const originalIndex = students.findIndex(s => s.ra === student.ra);
 
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.ra}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="edit-button" data-index="${originalIndex}">Editar</button>
                    <button class="remove-button" data-index="${originalIndex}">Remover</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });
 
        document.querySelectorAll('#students-table-body .remove-button').forEach(button => {
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
 
    // CORREÇÃO: Função openEditModal completa
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
