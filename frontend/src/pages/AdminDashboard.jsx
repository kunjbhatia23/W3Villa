import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import './Admin.css';

const AdminDashboard = () => {
    const [books, setBooks] = useState([]);
    const [form, setForm] = useState({ title: '', author: '', genre: '', totalCopies: '' });
    const [isEditing, setIsEditing] = useState(null); // Will hold book ID when editing

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
                // Update book
                await api.put(`/books/${isEditing}`, form);
                alert('Book updated!');
            } else {
                // Add new book
                await api.post('/books', form);
                alert('Book added!');
            }
            setForm({ title: '', author: '', genre: '', totalCopies: '' });
            setIsEditing(null);
            fetchBooks(); // Refresh list
        } catch (error) {
            alert(error.response?.data?.message || 'Operation failed.');
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
                alert('Book deleted!');
                fetchBooks(); // Refresh list
            } catch (error) {
                alert(error.response?.data?.message || 'Failed to delete book.');
            }
        }
    };
    
    const cancelEdit = () => {
        setIsEditing(null);
        setForm({ title: '', author: '', genre: '', totalCopies: '' });
    }

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
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {books.map((book) => (
                        <tr key={book._id}>
                            <td>{book.title}</td>
                            <td>{book.author}</td>
                            <td>{book.availableCopies} / {book.totalCopies}</td>
                            <td>
                                <button onClick={() => handleEdit(book)} className="edit-btn">Edit</button>
                                <button onClick={() => handleDelete(book._id)} className="delete-btn">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;