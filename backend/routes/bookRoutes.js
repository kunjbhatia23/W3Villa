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
  getBookBorrowers // Import the new controller function
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');

// ... (other routes remain the same)

// Admin-only route to get borrowers of a specific book
router.get('/:id/borrowers', protect, admin, getBookBorrowers);

module.exports = router;