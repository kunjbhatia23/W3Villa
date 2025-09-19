const express = require('express');
const router = express.Router();
const {
  getBooks,
  addBook,
  updateBook,
  deleteBook,
  borrowBook,
  returnBook,
  getBorrowedBooks,
  getBookBorrowers
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// --- CORRECTED ROUTE ORDER ---

// GET /api/books/
// Get all books. This is a public route.
router.get('/', getBooks);

// GET /api/books/borrowed
// Get books borrowed by the current user. Must come before '/:id'.
router.get('/borrowed', protect, getBorrowedBooks);

// POST /api/books/
// Add a new book. Admin only.
router.post('/', protect, admin, addBook);

// GET /api/books/:id/borrowers
// Get the list of users who borrowed a specific book. Admin only.
// This is the most specific route and MUST come before the general '/:id' routes.
router.get('/:id/borrowers', protect, admin, getBookBorrowers);

// POST /api/books/:id/borrow
// Borrow a book.
router.post('/:id/borrow', protect, borrowBook);

// POST /api/books/:id/return
// Return a book.
router.post('/:id/return', protect, returnBook);

// PUT /api/books/:id
// Update a book's details. Admin only.
router.put('/:id', protect, admin, updateBook);

// DELETE /api/books/:id
// Delete a book. Admin only.
router.delete('/:id', protect, admin, deleteBook);

module.exports = router;