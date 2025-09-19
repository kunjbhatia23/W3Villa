import React, { useState, useEffect } from 'react';
import api from '../api/axios';

const MyBooks = () => {
    const [borrowedBooks, setBorrowedBooks] = useState([]);

    const fetchMyBooks = async () => {
        try {
            const res = await api.get('/books/borrowed');
            setBorrowedBooks(res.data);
        } catch (error) {
            console.error('Failed to fetch borrowed books:', error);
        }
    };

    useEffect(() => {
        fetchMyBooks();
    }, []);

    const handleReturn = async (bookId) => {
        try {
            await api.post(`/books/${bookId}/return`);
            alert('Book returned successfully!');
            // Refresh the list after returning
            fetchMyBooks();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to return book.');
        }
    };
    
    // Simple date formatting
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    }

    return (
        <div>
            <h2>My Borrowed Books</h2>
            {borrowedBooks.length > 0 ? (
                <div className="book-list">
                    {borrowedBooks.map((record) => (
                        <div key={record._id} className="book-card">
                            <h3>{record.book.title}</h3>
                            <p>by {record.book.author}</p>
                            <p>Borrowed on: {formatDate(record.borrowDate)}</p>
                            <button onClick={() => handleReturn(record.book._id)}>Return Book</button>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You have not borrowed any books yet.</p>
            )}
        </div>
    );
};

export default MyBooks;