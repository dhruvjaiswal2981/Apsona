document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const createNoteButton = document.getElementById('createNote');
    const noteList = document.getElementById('noteList');

    // Function to handle user login
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('token', data.token);
                document.getElementById('auth').style.display = 'none';
                document.getElementById('notes').style.display = 'block';
                loadNotes(); // Example: Load user's notes after successful login
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            alert('Error during login');
        }
    });

    // Function to handle user signup
    signupForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const username = document.getElementById('signupUsername').value;
        const password = document.getElementById('signupPassword').value;
        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Signup successful. Please login.');
                document.getElementById('signupUsername').value = '';
                document.getElementById('signupPassword').value = '';
            } else {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('Error during signup');
        }
    });

    // Function to load user's notes
    async function loadNotes() {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/notes', {
                headers: {
                    'x-access-token': token
                }
            });
            const notes = await response.json();
            if (response.ok) {
                noteList.innerHTML = '';
                notes.forEach(note => {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'note';
                    noteDiv.innerHTML = `
                        <h3>${note.title}</h3>
                        <p>${note.content}</p>
                    `;
                    noteList.appendChild(noteDiv);
                });
            } else {
                throw new Error('Failed to load notes');
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            alert('Error loading notes');
        }
    }

    // Function to create a new note
    createNoteButton.addEventListener('click', async function() {
        const title = prompt('Enter note title');
        const content = prompt('Enter note content');
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('/notes', {
                method: 'POST',
                headers: {
                   'Content-Type': 'application/json',
                    'x-access-token': token
                },
                body: JSON.stringify({ title, content, tags: [], backgroundColor: '#ffffff', reminder: null })
            });
            const data = await response.json();
            if (response.ok) {
                loadNotes(); // Reload notes after creating a new one
            } else {
                throw new Error(data.message || 'Failed to create note');
            }
        } catch (error) {
            console.error('Error creating note:', error);
            alert('Error creating note');
        }
    });
});