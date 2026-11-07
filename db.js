const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const db = new sqlite3.Database(
    path.join(__dirname, "library.db")
);

db.serialize(() => {

    db.run(`
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            status TEXT NOT NULL
        )
    `);

    db.get("SELECT COUNT(*) AS count FROM books", (error, row) => {

        if (error) {
            console.log(error.message);
            return;
        }

        if (row.count === 0) {

            const insert = db.prepare(`
                INSERT INTO books
                (title, author, category, status)
                VALUES (?, ?, ?, ?)
            `);

            insert.run("The Little Prince", "Antoine de Saint-Exupéry", "Fiction", "Available");
            insert.run("Atomic Habits", "James Clear", "Self-help", "Borrowed");
            insert.run("Noli Me Tangere", "Jose Rizal", "Classic", "Available");

            insert.finalize();
        }
    });
});

module.exports = db;