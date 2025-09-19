const Book = require('../models/Book');
const Borrow = require('../models/Borrow');
const User = require('../models/User'); 

// Get all books
// GET /api/books
// Public
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Add a new book (Admin only)
// POST /api/books
// Private/Admin
exports.addBook = async (req, res) => {
  const { title, author, genre, totalCopies } = req.body;
  
  if (!title || !author || !genre || totalCopies === undefined) {
    return res.status(400).json({ message: 'Please provide all book details.' });
  }

  try {
    const book = new Book({
      title,
      author,
      genre,
      totalCopies,
      availableCopies: totalCopies,
    });
    const createdBook = await book.save();
    res.status(201).json(createdBook);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update a book (Admin only)
// PUT /api/books/:id
// Private/Admin
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (book) {
            const borrowedCount = book.totalCopies - book.availableCopies;

            book.title = req.body.title || book.title;
            book.author = req.body.author || book.author;
            book.genre = req.body.genre || book.genre;
            
            if (req.body.totalCopies !== undefined) {
                book.totalCopies = req.body.totalCopies;
                book.availableCopies = req.body.totalCopies - borrowedCount;
            }

            if (book.availableCopies < 0) {
              return res.status(400).json({ message: 'Total copies cannot be less than borrowed copies.' });
            }

            const updatedBook = await book.save();
            res.json(updatedBook);
        } else {
            res.status(404).json({ message: 'Book not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Delete a book (Admin only)
// DELETE /api/books/:id
// Private/Admin
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      await book.deleteOne();
      // Also remove any active borrow records for this book
      await Borrow.deleteMany({ book: req.params.id });
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// Borrow a book
// POST /api/books/:id/borrow
// Private
exports.borrowBook = async (req, res) => {
    const bookId = req.params.id;
    const userId = req.user.id;

    try {
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        if (book.availableCopies <= 0) {
            return res.status(400).json({ message: 'No copies available to borrow' });
        }
        
        const alreadyBorrowed = await Borrow.findOne({ user: userId, book: bookId, returnDate: null });
        if (alreadyBorrowed) {
            return res.status(400).json({ message: 'You have already borrowed this book' });
        }

        book.availableCopies--;
        await book.save();

        const borrowRecord = new Borrow({
            user: userId,
            book: bookId,
        });
        await borrowRecord.save();
        
        res.status(200).json({ message: 'Book borrowed successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Return a book
// POST /api/books/:id/return
// Private
exports.returnBook = async (req, res) => {
    const bookId = req.params.id;
    const userId = req.user.id;

    try {
        const borrowRecord = await Borrow.findOne({ user: userId, book: bookId, returnDate: null });
        if (!borrowRecord) {
            return res.status(400).json({ message: 'You have not borrowed this book' });
        }

        borrowRecord.returnDate = new Date();
        await borrowRecord.save();

        const book = await Book.findById(bookId);
        if (book) {
            book.availableCopies++;
            await book.save();
        }

        res.status(200).json({ message: 'Book returned successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};


// Get Student's borrowed books
// GET /api/books/borrowed
// Private
exports.getBorrowedBooks = async (req, res) => {
    try {
        const borrowed = await Borrow.find({ user: req.user.id, returnDate: null }).populate('book');
        res.json(borrowed);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// Get all students who have a specific book borrowed
// GET /api/books/:id/borrowers
// Private/Admin
exports.getBookBorrowers = async (req, res) => {
  try {
    const borrows = await Borrow.find({ book: req.params.id, returnDate: null }).populate('user', 'name email');
    res.json(borrows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};