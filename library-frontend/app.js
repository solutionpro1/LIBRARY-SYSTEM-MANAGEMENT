// API Configuration
const API_BASE_URL = 'http://localhost:8000/api/';

// DOM Elements
const booksList = document.getElementById('books-list');
const totalBooksEl = document.getElementById('total-books');
const availableBooksEl = document.getElementById('available-books');
const borrowedBooksEl = document.getElementById('borrowed-books');
const overdueBooksEl = document.getElementById('overdue-books');
const refreshBtn = document.getElementById('refresh-books');
const searchInput = document.getElementById('search-input');
const todayDateEl = document.getElementById('today-date');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', () => {
    setCurrentDate();
    loadLibraryData();
    
    // Set up event listeners
    refreshBtn.addEventListener('click', loadLibraryData);
    searchInput.addEventListener('input', handleSearch);
});

// Set current date
function setCurrentDate() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    todayDateEl.textContent = new Date().toLocaleDateString('en-US', options);
}

// Load all library data
function loadLibraryData() {
    showLoadingState();
    Promise.all([
        fetchStats(),
        fetchBooks()
    ]).catch(error => {
        console.error('Error loading data:', error);
        showErrorState();
    });
}

// Fetch library statistics
function fetchStats() {
    return fetch(`${API_BASE_URL}stats/`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch stats');
            return response.json();
        })
        .then(data => updateStats(data))
        .catch(error => {
            console.error('Error fetching stats:', error);
            throw error;
        });
}

// Fetch books data
function fetchBooks() {
    return fetch(`${API_BASE_URL}books/`)
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch books');
            return response.json();
        })
        .then(data => displayBooks(data))
        .catch(error => {
            console.error('Error fetching books:', error);
            throw error;
        });
}

// Update statistics display
function updateStats(stats) {
    totalBooksEl.textContent = stats.total_books || 0;
    availableBooksEl.textContent = stats.available_books || 0;
    borrowedBooksEl.textContent = stats.borrowed_books || 0;
    overdueBooksEl.textContent = stats.overdue_books || 0;
}

// Display books in the table
function displayBooks(books) {
    if (!books || books.length === 0) {
        booksList.innerHTML = `
            <tr>
                <td colspan="5" class="loading-row">No books found in the library</td>
            </tr>
        `;
        return;
    }

    booksList.innerHTML = books.map(book => `
        <tr>
            <td>${book.title || 'N/A'}</td>
            <td>${book.author || 'Unknown'}</td>
            <td>${book.isbn || 'N/A'}</td>
            <td>
                <span class="status-badge ${book.available ? 'status-available' : 'status-borrowed'}">
                    ${book.available ? 'Available' : 'Borrowed'}
                </span>
            </td>
            <td>
                <button class="btn-action ${book.available ? 'btn-borrow' : 'btn-return'}" 
                    data-id="${book.id}" 
                    onclick="${book.available ? 'borrowBook(this)' : 'returnBook(this)'}">
                    ${book.available ? 'Borrow' : 'Return'}
                </button>
            </td>
        </tr>
    `).join('');
}

// Handle book borrowing
function borrowBook(button) {
    const bookId = button.getAttribute('data-id');
    
    fetch(`${API_BASE_URL}borrow/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: bookId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Borrowing failed');
        return response.json();
    })
    .then(data => {
        alert(`Book borrowed successfully. Due date: ${data.due_date}`);
        loadLibraryData();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to borrow book: ' + error.message);
    });
}

// Handle book returning
function returnBook(button) {
    const bookId = button.getAttribute('data-id');
    
    fetch(`${API_BASE_URL}return/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ book_id: bookId })
    })
    .then(response => {
        if (!response.ok) throw new Error('Return failed');
        return response.json();
    })
    .then(data => {
        alert('Book returned successfully');
        loadLibraryData();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to return book: ' + error.message);
    });
}

// Handle search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = booksList.querySelectorAll('tr');
    
    rows.forEach(row => {
        const title = row.cells[0].textContent.toLowerCase();
        const author = row.cells[1].textContent.toLowerCase();
        const isbn = row.cells[2].textContent.toLowerCase();
        
        if (title.includes(searchTerm) {
            row.style.display = '';
        } else if (author.includes(searchTerm)) {
            row.style.display = '';
        } else if (isbn.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// Show loading state
function showLoadingState() {
    booksList.innerHTML = `
        <tr>
            <td colspan="5" class="loading-row">
                <i class="fas fa-spinner fa-spin"></i> Loading books...
            </td>
        </tr>
    `;
}

// Show error state
function showErrorState() {
    booksList.innerHTML = `
        <tr>
            <td colspan="5" class="loading-row" style="color: var(--danger)">
                <i class="fas fa-exclamation-circle"></i> Failed to load data. Please try again.
            </td>
        </tr>
    `;
}