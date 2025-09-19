const Book = require('../models/Book');
const Borrow = require('../models/Borrow');

// @desc    Get all books
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Add a new book (Admin only)
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

// @desc    Update a book (Admin only)
exports.updateBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);

        if (book) {
            const oldTotal = book.totalCopies;
            const borrowedCount = oldTotal - book.availableCopies;

            book.title = req.body.title || book.title;
            book.author = req.body.author || book.author;
            book.genre = req.body.genre || book.genre;
            book.totalCopies = req.body.totalCopies || book.totalCopies;
            
            // Recalculate available copies if total copies changed
            if (req.body.totalCopies !== undefined) {
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

// @desc    Delete a book (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      await book.deleteOne();
      // Also remove any active borrow records for this book
      await Borrow.deleteMany({ book: req.params.id, returnDate: null });
      res.json({ message: 'Book removed' });
    } else {
      res.status(404).json({ message: 'Book not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};


// @desc    Borrow a book
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

// @desc    Return a book
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


// @desc    Get user's borrowed books
exports.getBorrowedBooks = async (req, res) => {
    try {
        const borrowed = await Borrow.find({ user: req.user.id, returnDate: null }).populate('book');
        res.json(borrowed);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};