import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext'; 
import './Admin.css';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [form, setForm] = useState({ title: '', author: '', genre: '', totalCopies: '' });
    const [isEditing, setIsEditing] = useState(null);
    const [selectedBook, setSelectedBook] = useState(null);
    const [borrowers, setBorrowers] = useState([]);
    const { showNotification } = useNotification(); 

    const fetchBooks = async () => {
        const res = await api.get('/books');
        setBooks(res.data);
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await api.put(`/books/${isEditing}`, form);
                showNotification('Book updated successfully!'); 
            } else {
                await api.post('/books', form);
                showNotification('Book added successfully!'); 
            }
            setForm({ title: '', author: '', genre: '', totalCopies: '' });
            setIsEditing(null);
            fetchBooks();
        } catch (error) {
            showNotification(error.response?.data?.message || 'Operation failed.', 'error'); 
        }
    };

    const handleEdit = (book) => {
        setIsEditing(book._id);
        setForm({ title: book.title, author: book.author, genre: book.genre, totalCopies: book.totalCopies });
    };

    const handleDelete = async (id) => {
        if(window.confirm('Are you sure you want to delete this book?')) {
            try {
                await api.delete(`/books/${id}`);
                showNotification('Book deleted successfully!'); 
                fetchBooks();
            } catch (error) {
                showNotification(error.response?.data?.message || 'Failed to delete book.', 'error'); 
            }
        }
    };
    
    const cancelEdit = () => {
        setIsEditing(null);
        setForm({ title: '', author: '', genre: '', totalCopies: '' });
    };

    const viewBorrowers = async (book) => {
        try {
            const res = await api.get(`/books/${book._id}/borrowers`);
            setBorrowers(res.data);
            setSelectedBook(book);
        } catch (error) {
            showNotification('Could not fetch borrower details.', 'error'); 
        }
    };

    const closeModal = () => {
        setSelectedBook(null);
        setBorrowers([]);
    };

    return (
        <div className="admin-container">
            <h2>{isEditing ? 'Edit Book' : 'Add a New Book'}</h2>
            <form onSubmit={handleSubmit} className="admin-form">
                <input type="text" name="title" value={form.title} onChange={handleChange} placeholder="Title" required />
                <input type="text" name="author" value={form.author} onChange={handleChange} placeholder="Author" required />
                <input type="text" name="genre" value={form.genre} onChange={handleChange} placeholder="Genre" required />
                <input type="number" name="totalCopies" value={form.totalCopies} onChange={handleChange} placeholder="Total Copies" required min="0"/>
                <button type="submit">{isEditing ? 'Update Book' : 'Add Book'}</button>
                {isEditing && <button type="button" onClick={cancelEdit} className="cancel-btn">Cancel</button>}
            </form>

            <h2>Manage Books</h2>
            <table className="books-table">
                <thead>
                    <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Available</th>
                        <th>Borrowed</th>
                        <th>Total</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book._id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.availableCopies}</td>
                            <td>{book.totalCopies - book.availableCopies}</td>
                            <td>{book.totalCopies}</td>
                            <td>
                                <div className="action-buttons">
                                    <button onClick={() => handleEdit(book)} className="edit-btn">Edit</button>
                                    <button onClick={() => handleDelete(book._id)} className="delete-btn">Delete</button>
                                    <button onClick={() => viewBorrowers(book)} className="view-btn">View Borrowers</button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {selectedBook && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={closeModal}>&times;</span>
                        <h2>Borrowers for {selectedBook.title}</h2>
                        {borrowers.length > 0 ? (
                            <ul className="borrowers-list">
                                {borrowers.map((borrow) => (
                                    <li key={borrow._id}>
                                        <strong>{borrow.user.name}</strong> ({borrow.user.email})
                                        <br />
                                        <small>Borrowed on: {new Date(borrow.borrowDate).toLocaleDateString()}</small>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>This book has not been borrowed by anyone yet.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;