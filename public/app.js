const addButton = document.getElementById("add-button");
const bookModal = document.getElementById("book-modal");
const bookForm = document.getElementById("book-form");
const cancelButton = document.getElementById("cancel-button");

const bookTitle = document.getElementById("book-title");
const bookAuthor = document.getElementById("book-author");
const bookCategory = document.getElementById("book-category");
const bookStatus = document.getElementById("book-status");

const tableBody = document.getElementById("book-table-body");
const searchInput = document.getElementById("search-input");
const statusFilter = document.getElementById("status-filter");

const totalBooks = document.getElementById("total-books");
const availableBooks = document.getElementById("available-books");
const borrowedBooks = document.getElementById("borrowed-books");
const bookCount = document.getElementById("book-count");

let books = JSON.parse(localStorage.getItem("libraryBooks")) || [
    {
        id: 1,
        title: "Introduction to Programming",
        author: "John Smith",
        category: "Technology",
        status: "Available"
    },
    {
        id: 2,
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Fiction",
        status: "Borrowed"
    },
    {
        id: 3,
        title: "Database Management",
        author: "James Brown",
        category: "Education",
        status: "Available"
    }
];


let editingId = null;

function saveBooks() {
    localStorage.setItem("libraryBooks", JSON.stringify(books));
}

function updateDashboard() {

    totalBooks.textContent = books.length;

    availableBooks.textContent = books.filter(
        book => book.status === "Available"
    ).length;

    borrowedBooks.textContent = books.filter(
        book => book.status === "Borrowed"
    ).length;
}

function displayBooks() {

    tableBody.innerHTML = "";

    const searchValue = searchInput.value.toLowerCase();
    const filterValue = statusFilter.value;

    const filteredBooks = books.filter(book => {

        const matchesSearch =
            book.title.toLowerCase().includes(searchValue) ||
            book.author.toLowerCase().includes(searchValue);

        const matchesStatus =
            filterValue === "" || book.status === filterValue;

        return matchesSearch && matchesStatus;
    });

    if (filteredBooks.length === 0) {

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center; padding:30px;">
                    No books found.
                </td>
            </tr>
        `;

    } else {

        filteredBooks.forEach(book => {

            const row = document.createElement("tr");

            const statusClass =
                book.status === "Available"
                ? "status-available"
                : "status-borrowed";

            row.innerHTML = `
                <td>BK-${String(book.id).padStart(3, "0")}</td>
                <td>${escapeHTML(book.title)}</td>
                <td>${escapeHTML(book.author)}</td>
                <td>${escapeHTML(book.category)}</td>

                <td>
                    <span class="status ${statusClass}">
                        ${book.status}
                    </span>
                </td>

                <td>
                    <button class="edit-button" data-id="${book.id}">
                        Edit
                    </button>

                    <button class="delete-button" data-id="${book.id}">
                        Delete
                    </button>
                </td>
            `;

            tableBody.appendChild(row);

        });

    }

    bookCount.textContent =
        `Showing ${filteredBooks.length} of ${books.length} books`;

    updateDashboard();
}

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);

}

addButton.addEventListener("click", function() {

    editingId = null;

    bookForm.reset();

    document.getElementById("form-title").textContent =
        "Add New Book";

    document.getElementById("save-button").textContent =
        "Save Book";

    bookModal.style.display = "flex";

});


cancelButton.addEventListener("click", function() {

    bookModal.style.display = "none";

    bookForm.reset();

    editingId = null;

});

bookForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = bookTitle.value.trim();
    const author = bookAuthor.value.trim();
    const category = bookCategory.value.trim();
    const status = bookStatus.value;

    if (!title || !author || !category) {
        alert("Please complete all fields.");
        return;
    }

    if (editingId === null) {

        
        const newBook = {
            id: books.length > 0
                ? Math.max(...books.map(book => book.id)) + 1
                : 1,

            title: title,
            author: author,
            category: category,
            status: status
        };

        books.push(newBook);

        alert("Book added successfully!");

    } else {


        const book = books.find(
            book => book.id === editingId
        );

        if (book) {

            book.title = title;
            book.author = author;
            book.category = category;
            book.status = status;

            alert("Book updated successfully!");

        }

    }

    saveBooks();

    displayBooks();

    bookModal.style.display = "none";

    bookForm.reset();

    editingId = null;

});

tableBody.addEventListener("click", function(event) {

    const id = Number(event.target.dataset.id);

   
    if (event.target.classList.contains("edit-button")) {

        const book = books.find(
            book => book.id === id
        );

        if (book) {

            editingId = book.id;

            bookTitle.value = book.title;
            bookAuthor.value = book.author;
            bookCategory.value = book.category;
            bookStatus.value = book.status;

            document.getElementById("form-title").textContent =
                "Edit Book Information";

            document.getElementById("save-button").textContent =
                "Update Book";

            bookModal.style.display = "flex";

        }

    }


    if (event.target.classList.contains("delete-button")) {

        const confirmDelete = confirm(
            "Are you sure you want to delete this book?"
        );

        if (confirmDelete) {

            books = books.filter(
                book => book.id !== id
            );

            saveBooks();

            displayBooks();

            alert("Book deleted successfully!");

        }

    }

});

searchInput.addEventListener("input", function() {

    displayBooks();

});

statusFilter.addEventListener("change", function() {

    displayBooks();

});

bookModal.addEventListener("click", function(event) {

    if (event.target === bookModal) {

        bookModal.style.display = "none";

        bookForm.reset();

        editingId = null;

    }

});

saveBooks();
displayBooks();
