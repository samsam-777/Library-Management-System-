const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// DISPLAY BOOKS
app.get("/api/books", (req, res) => {

    const search = req.query.search || "";
    const status = req.query.status || "";

    let sql = "SELECT * FROM books WHERE 1=1";
    const values = [];

    if (search) {
        sql += ` AND (
            title LIKE ? OR
            author LIKE ? OR
            category LIKE ?
        )`;

        values.push(
            `%${search}%`,
            `%${search}%`,
            `%${search}%`
        );
    }

    if (status) {
        sql += " AND status = ?";
        values.push(status);
    }

    db.all(sql, values, (error, rows) => {

        if (error) {
            return res.status(500).json({
                message: "Unable to load books."
            });
        }

        res.json(rows);
    });
});

// DASHBOARD STATISTICS
app.get("/api/statistics", (req, res) => {

    db.get(`
        SELECT
            COUNT(*) AS total,
            SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS available,
            SUM(CASE WHEN status = 'Borrowed' THEN 1 ELSE 0 END) AS borrowed
        FROM books
    `, (error, row) => {

        if (error) {
            return res.status(500).json({
                message: "Unable to load statistics."
            });
        }

        res.json({
            total: row.total || 0,
            available: row.available || 0,
            borrowed: row.borrowed || 0
        });
    });
});

// ADD BOOK
app.post("/api/books", (req, res) => {

    const { title, author, category, status } = req.body;

    if (
        ![title, author, category].every(
            value => typeof value === "string" && value.trim()
        )
    ) {
        return res.status(400).json({
            message: "Please complete all fields."
        });
    }

    if (!["Available", "Borrowed"].includes(status)) {
        return res.status(400).json({
            message: "Invalid book status."
        });
    }

    db.run(`
        INSERT INTO books
        (title, author, category, status)
        VALUES (?, ?, ?, ?)
    `, [
        title.trim(),
        author.trim(),
        category.trim(),
        status
    ], function(error) {

        if (error) {
            return res.status(500).json({
                message: "Unable to add book."
            });
        }

        res.status(201).json({
            id: this.lastID,
            message: "Book added successfully!"
        });
    });
});

// UPDATE BOOK
app.put("/api/books/:id", (req, res) => {

    const { title, author, category, status } = req.body;
    const id = Number(req.params.id);

    if (
        !Number.isInteger(id) || id < 1 ||
        ![title, author, category].every(
            value => typeof value === "string" && value.trim()
        ) ||
        !["Available", "Borrowed"].includes(status)
    ) {
        return res.status(400).json({
            message: "Invalid book information."
        });
    }

    db.run(`
        UPDATE books
        SET title = ?,
            author = ?,
            category = ?,
            status = ?
        WHERE id = ?
    `, [
        title.trim(),
        author.trim(),
        category.trim(),
        status,
        id
    ], function(error) {

        if (error) {
            return res.status(500).json({
                message: "Unable to update book."
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        res.json({
            message: "Book updated successfully!"
        });
    });
});

// DELETE BOOK
app.delete("/api/books/:id", (req, res) => {

    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({
            message: "Invalid book ID."
        });
    }

    db.run(
        "DELETE FROM books WHERE id = ?",
        [id],
        function(error) {

            if (error) {
                return res.status(500).json({
                    message: "Unable to delete book."
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    message: "Book not found."
                });
            }

            res.json({
                message: "Book deleted successfully!"
            });
        }
    );
});

// START SERVER
app.listen(PORT, () => {
    console.log(
        `Library System running at http://localhost:${PORT}`
    );
});