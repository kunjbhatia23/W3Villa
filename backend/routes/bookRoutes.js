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
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// Public route to get all books
router.get('/', getBooks);

// Admin-only routes for managing books
router.post('/', protect, admin, addBook);
router.put('/:id', protect, admin, updateBook);
router.delete('/:id', protect, admin, deleteBook);

// User routes for borrowing and returning
router.post('/:id/borrow', protect, borrowBook);
router.post('/:id/return', protect, returnBook);
router.get('/borrowed', protect, getBorrowedBooks);


module.exports = router;