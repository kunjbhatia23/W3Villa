# Book Library Management System

A full-stack web application that allows users to manage a book collection. This system provides role-based access for Admins and Students (Users), simulating a basic library management system where book lending and availability are tracked.

---

## Technologies Used

* **Frontend**: React, Vite, Axios, React Router
* **Backend**: Node.js, Express.js
* **Database**: MongoDB with Mongoose
* **Authentication**: JWT (JSON Web Tokens), bcryptjs for password hashing

This stack was chosen for its robust ecosystem and rapid development capabilities. React provides a dynamic and responsive user interface, while the Node.js/Express backend offers a fast and scalable foundation for the REST API. MongoDB was selected for its flexibility in handling document-based data.

---

## Project Setup

To run this project locally, follow these steps:

**1. Clone the repository:**
```bash
git clone <your-repository-url>
cd <project-folder>
```

**2. Backend Setup:**
```bash
cd backend
npm install

# Create a .env file in the backend directory and add the following:
PORT=5000
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>

npm run dev
```

**3. Frontend Setup:**
```bash
cd frontend
npm install
npm run dev
```

The application will be running at http://localhost:5173.

---

## API Endpoints

### Authentication (/api/auth)
| Method | Route     | Purpose                                  |
|--------|-----------|------------------------------------------|
| POST   | /register | Register a new user (Admin or User).     |
| POST   | /login    | Authenticate a user and get a token.     |

### Books (/api/books)
| Method | Route           | Purpose                          | Access |
|--------|-----------------|----------------------------------|--------|
| GET    | /               | Get a list of all books.         | Public |
| POST   | /               | Add a new book.                  | Admin  |
| PUT    | /:id            | Update a book's details.         | Admin  |
| DELETE | /:id            | Delete a book.                   | Admin  |
| GET    | /:id/borrowers  | Get a list of users who borrowed a book. | Admin |
| POST   | /:id/borrow     | Borrow a book.                   | User   |
| POST   | /:id/return     | Return a borrowed book.          | User   |
| GET    | /borrowed       | Get books borrowed by the logged-in user. | User |

---

## Deployed Application & Demo

- Live Application URL: [Link to your deployed application]  
- Demo Video: [Link to your 3-5 minute demo video]
