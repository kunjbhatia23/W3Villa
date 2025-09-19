import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
    const [books, setBooks] = useState([]);
    const [borrowedBooks, setBorrowedBooks] = useState(new Set());
    const { user } = useAuth();

    const fetchBooks = async () => {
        try {
            const res = await api.get('/books');
            setBooks(res.data);
        } catch (error) {
            console.error("Failed to fetch books", error);
        }
    };
    
    const fetchBorrowedBooks = async () => {
        if (!user) return;
        try {
            const res = await api.get('/books/borrowed');
            const borrowedBookIds = new Set(res.data.map(b => b.book._id));
            setBorrowedBooks(borrowedBookIds);
        } catch (error) {
            console.error("Failed to fetch borrowed books", error);
        }
    };

    useEffect(() => {
        fetchBooks();
        if (user) {
            fetchBorrowedBooks();
        }
    }, [user]);

    const handleBorrow = async (bookId) => {
        if (!user) {
            alert('Please log in to borrow a book.');
            return;
        }
        try {
            await api.post(`/books/${bookId}/borrow`);
            alert('Book borrowed successfully!');
            // Refresh data
            fetchBooks();
            fetchBorrowedBooks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to borrow book.');
        }
    };

    return (
        <div className="home-container">
            <h1>Available Books</h1>
            <div className="book-list">
                {books.map((book) => (
                    <div key={book._id} className="book-card">
                        <h3>{book.title}</h3>
                        <p>by {book.author}</p>
                        <p><em>Genre: {book.genre}</em></p>
                        <p>Available: {book.availableCopies} / {book.totalCopies}</p>
                        {user && user.role === 'User' && (
                             <button 
                                onClick={() => handleBorrow(book._id)} 
                                disabled={book.availableCopies <= 0 || borrowedBooks.has(book._id)}
                            >
                                {borrowedBooks.has(book._id) ? 'Already Borrowed' : book.availableCopies <= 0 ? 'Out of Stock' : 'Borrow'}
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;