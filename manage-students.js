import { supabase } from './supabaseClient.js';

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
    
    // ... (função filterInput para Turma) ...
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

    studentForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const name = document.getElementById('student-name').value.trim();
        const studentClass = studentClassInput.value.trim();
        const ra = document.getElementById('student-ra').value.trim(); // RA será o identificador único

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
        await addStudent(newStudent);
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

    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const ra = document.getElementById('edit-student-ra').value.trim(); // RA é a chave
        const newName = document.getElementById('edit-student-name').value.trim();
        const newClass = editStudentClassInput.value.trim();

        if (!newName || !newClass || !ra) {
            alert('Por favor, preencha todos os campos.');
            return;
        }

        const classPattern = /^[1236789][A-E]$/;
        if (!classPattern.test(newClass)) {
            alert('O campo Turma deve ser composto por um dígito (1, 2, 3, 6, 7, 8 ou 9) e uma letra (A a E).');
            return;
        }

        const updatedStudent = {
            name: toTitleCase(newName),
            class: newClass
        };

        await updateStudent(ra, updatedStudent);
        editModal.style.display = 'none';
    });

    // --- Funções CRUD com Supabase ---

    async function addStudent(newStudent) {
        // 1. Verificar se o aluno já existe (pelo RA)
        const { data: existingStudent, error: fetchError } = await supabase
            .from('students')
            .select('ra')
            .eq('ra', newStudent.ra)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = No rows found
            console.error('Erro ao verificar aluno existente:', fetchError);
            alert('Erro ao verificar aluno existente. Veja o console para detalhes.');
            return;
        }

        if (existingStudent) {
            alert('Erro: Já existe um aluno com este RA.');
            return;
        }

        // 2. Inserir o novo aluno
        const { error: insertError } = await supabase
            .from('students')
            .insert([newStudent]);

        if (insertError) {
            console.error('Erro ao cadastrar aluno:', insertError);
            alert('Erro ao cadastrar aluno. Veja o console para detalhes.');
            return;
        }

        alert('Aluno cadastrado com sucesso!');
        await loadStudents(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    async function loadStudents(searchTerm = '') {
        const { data: students, error } = await supabase
            .from('students')
            .select('*');

        if (error) {
            console.error('Não há registro de alunos:', error);
            studentsTableBody.innerHTML = '<tr><td colspan="5">Não há registro de alunos.</td></tr>';
            return;
        }

        // Filtro no front-end
        const filteredStudents = students.filter(student =>
            student.name.toLowerCase().includes(searchTerm) ||
            student.ra.toLowerCase().includes(searchTerm) ||
            student.class.toLowerCase().includes(searchTerm)
        );

        displayStudents(filteredStudents);
    }

    async function updateStudent(ra, updatedStudent) {
        const { error } = await supabase
            .from('students')
            .update(updatedStudent)
            .eq('ra', ra);

        if (error) {
            console.error('Erro ao atualizar aluno:', error);
            alert('Erro ao atualizar aluno. Veja o console para detalhes.');
            return;
        }

        alert('Aluno atualizado com sucesso!');
        await loadStudents(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }

    async function removeStudent(ra) {
        // 1. Verificar se o aluno tem empréstimo pendente
        const { data: activeLoan, error: loanCheckError } = await supabase
            .from('loans')
            .select('id')
            .eq('student_ra', ra)
            .eq('returned', false);

        if (loanCheckError) {
            console.error('Erro ao verificar empréstimo:', loanCheckError);
            alert('Erro ao verificar empréstimo. Veja o console para detalhes.');
            return;
        }

        if (activeLoan && activeLoan.length > 0) {
            alert('Não é possível remover o aluno pois ele possui um livro pendente.');
            return;
        }

        if (!confirm('Tem certeza que deseja remover este aluno?')) {
            return;
        }

        const { error } = await supabase
            .from('students')
            .delete()
            .eq('ra', ra);

        if (error) {
            console.error('Erro ao remover aluno:', error);
            alert('Erro ao remover aluno. Veja o console para detalhes.');
            return;
        }

        alert('Aluno removido com sucesso!');
        await loadStudents(loanSearchInput.value.toLowerCase()); // Recarrega a lista
    }


    // --- Funções de Exibição e Modal ---

    async function displayStudents(students) {
        studentsTableBody.innerHTML = '';

        if (students.length === 0) {
            studentsTableBody.innerHTML = '<tr><td colspan="5">Nenhum aluno encontrado.</td></tr>';
            return;
        }

        // Busca todos os empréstimos ativos para checar o status de pendência
        const { data: activeLoans, error: loansError } = await supabase
            .from('loans')
            .select('student_ra')
            .eq('returned', false);

        if (loansError) {
            console.error('Não há empréstimos ativos:', loansError);
            // Continua a exibição, mas sem status de pendência
        }

        const activeStudentRAs = new Set(activeLoans ? activeLoans.map(loan => loan.student_ra) : []);

        students.forEach((student) => {
            const hasPendingLoan = activeStudentRAs.has(student.ra);
            const statusText = hasPendingLoan ? 'Com livro pendente' : 'Sem pendências';
            const statusClass = hasPendingLoan ? 'status-pending' : 'status-clear';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${student.name}</td>
                <td>${student.class}</td>
                <td>${student.ra}</td>
                <td class="${statusClass}">${statusText}</td>
                <td>
                    <button class="edit-button" data-ra="${student.ra}">Editar</button>
                    <button class="remove-button" data-ra="${student.ra}">Remover</button>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });

        document.querySelectorAll('#students-table-body .remove-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const ra = event.target.dataset.ra;
                removeStudent(ra);
            });
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', (event) => {
                const ra = event.target.dataset.ra;
                openEditModal(ra, students);
            });
        });
    }

    function openEditModal(ra, students) {
        const studentToEdit = students.find(student => student.ra === ra);

        if (!studentToEdit) {
            alert('Aluno não encontrado para edição.');
            return;
        }

        document.getElementById('edit-student-name').value = studentToEdit.name;
        document.getElementById('edit-student-class').value = studentToEdit.class;
        document.getElementById('edit-student-ra').value = studentToEdit.ra; // O RA não é editável, mas é exibido.

        editModal.style.display = 'block';
    }

});

