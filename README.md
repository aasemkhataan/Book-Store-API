# 📚 Book Store API

A fully functional RESTful API for a fictional book store, built using **Node.js**, **Express**, and **MongoDB**. Includes complete user authentication, secure routes, and API features like filtering and pagination.

---

## 🚀 Features

- **User Authentication** with JWT
- **Authorization** for role-based access (admin/user)
- **CRUD operations** for books and users
- **Advanced API queries**: filtering, sorting, field limiting, pagination
- **Custom Error Handling** with global middleware
- **MVC Architecture** with clean folder structure
- **Security Middlewares**: helmet, xss-clean, hpp, rate-limiter, etc.

---

## 📦 Tech Stack

- Node.js
- Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT)
- Postman (for testing)

---

## 🔐 Authentication

This API uses JWT for secure authentication, with support for password recovery and social login via Google and Facebook.

---

## 📬 API Endpoints

---

### 🔐 Auth Routes

| Method | Endpoint                               | Description                    | Access  |
| ------ | -------------------------------------- | ------------------------------ | ------- |
| POST   | /api/v1/auth/signup                    | Create a new user account      | Public  |
| POST   | /api/v1/auth/login                     | Login and receive JWT token    | Public  |
| POST   | /api/v1/auth/forgotPassword            | Send reset token to email      | Public  |
| PATCH  | /api/v1/auth/resetPassword/:resetToken | Reset password using token     | Public  |
| PATCH  | /api/v1/auth/updatePassword            | Update logged-in user password | Private |
| GET    | /api/v1/auth/google                    | Initiate Google OAuth          | Public  |
| GET    | /api/v1/auth/google/callback           | Google OAuth callback          | Public  |
| GET    | /api/v1/auth/facebook                  | Initiate Facebook OAuth        | Public  |
| GET    | /api/v1/auth/facebook/callback         | Facebook OAuth callback        | Public  |

---

### 👤 User Routes

| Method | Endpoint         | Description                   | Access  |
| ------ | ---------------- | ----------------------------- | ------- |
| GET    | /api/v1/users/me | Get logged-in user's profile  | Private |
| PATCH  | /api/v1/users/me | Update logged-in user's data  | Private |
| DELETE | /api/v1/users/me | Delete logged-in user account | Private |

---

### 📚 Book Routes

| Method | Endpoint          | Description         | Access |
| ------ | ----------------- | ------------------- | ------ |
| GET    | /api/v1/books     | Get all books       | Public |
| GET    | /api/v1/books/:id | Get a specific book | Public |

---

### 💬 Review Routes

| Method | Endpoint                          | Description                | Access          |
| ------ | --------------------------------- | -------------------------- | --------------- |
| GET    | /api/v1/books/:bookId/reviews     | Get all reviews for a book | Public          |
| POST   | /api/v1/books/:bookId/reviews     | Create a review            | Private         |
| DELETE | /api/v1/books/:bookId/reviews     | Delete all reviews         | Admin           |
| GET    | /api/v1/books/:bookId/reviews/:id | Get a specific review      | Public          |
| PATCH  | /api/v1/books/:bookId/reviews/:id | Update a review            | Private (Owner) |
| DELETE | /api/v1/books/:bookId/reviews/:id | Delete a review            | Private (Owner) |

---

### 🛒 Cart Routes

| Method | Endpoint                       | Description      | Access  |
| ------ | ------------------------------ | ---------------- | ------- |
| GET    | /api/v1/users/:userId/cart     | Get user's cart  | Private |
| POST   | /api/v1/users/:userId/cart     | Add book to cart | Private |
| DELETE | /api/v1/users/:userId/cart     | Empty the cart   | Private |
| PATCH  | /api/v1/users/:userId/cart/:id | Update cart item | Private |
| DELETE | /api/v1/users/:userId/cart/:id | Delete cart item | Private |

---

### 📦 Order Routes

| Method | Endpoint                                 | Description                    | Access  |
| ------ | ---------------------------------------- | ------------------------------ | ------- |
| GET    | /api/v1/orders/success                   | Confirm payment success        | Public  |
| GET    | /api/v1/orders/checkout-session/:orderId | Create Stripe checkout session | Private |
| POST   | /api/v1/orders/checkout                  | Create a new order             | Private |
| GET    | /api/v1/orders/my-orders                 | Get user's orders              | Private |
| PATCH  | /api/v1/orders/:id/cancel                | Cancel user order              | Private |
| GET    | /api/v1/orders/:id                       | Get specific order             | Private |
| PATCH  | /api/v1/orders/:id                       | Update user order              | Private |

---

### 🛠️ Admin Routes

| Method | Endpoint                                | Description                  | Access |
| ------ | --------------------------------------- | ---------------------------- | ------ |
| GET    | /api/v1/admin/books                     | Get all books                | Admin  |
| POST   | /api/v1/admin/books                     | Create a new book            | Admin  |
| DELETE | /api/v1/admin/books                     | Delete all books             | Admin  |
| GET    | /api/v1/admin/books/:id                 | Get a book                   | Admin  |
| PATCH  | /api/v1/admin/books/:id                 | Update a book                | Admin  |
| DELETE | /api/v1/admin/books/:id                 | Delete a book                | Admin  |
| POST   | /api/v1/admin/fetchBookData             | Fetch external book metadata | Admin  |
| GET    | /api/v1/admin/users                     | Get all users                | Admin  |
| DELETE | /api/v1/admin/users                     | Delete all users             | Admin  |
| GET    | /api/v1/admin/users/:id                 | Get a user                   | Admin  |
| PATCH  | /api/v1/admin/users/:id                 | Update a user                | Admin  |
| DELETE | /api/v1/admin/users/:id                 | Delete a user                | Admin  |
| GET    | /api/v1/admin/cart                      | Get all carts                | Admin  |
| DELETE | /api/v1/admin/cart                      | Delete all carts             | Admin  |
| GET    | /api/v1/admin/cart/:id                  | Get a specific cart          | Admin  |
| DELETE | /api/v1/admin/cart/:id                  | Delete a specific cart       | Admin  |
| GET    | /api/v1/admin/reviews                   | Get all reviews              | Admin  |
| DELETE | /api/v1/admin/reviews                   | Delete all reviews           | Admin  |
| GET    | /api/v1/admin/reviews/:id               | Get a specific review        | Admin  |
| PATCH  | /api/v1/admin/reviews/:id               | Update a review              | Admin  |
| DELETE | /api/v1/admin/reviews/:id               | Delete a review              | Admin  |
| GET    | /api/v1/admin/orders                    | Get all orders               | Admin  |
| DELETE | /api/v1/admin/orders                    | Delete all orders            | Admin  |
| GET    | /api/v1/admin/orders/:id                | Get a specific order         | Admin  |
| PATCH  | /api/v1/admin/orders/:id                | Update order status          | Admin  |
| DELETE | /api/v1/admin/orders/:id                | Delete order                 | Admin  |
| PATCH  | /api/v1/admin/orders/:id/mark-delivered | Mark order as delivered      | Admin  |
| PATCH  | /api/v1/admin/orders/:id/mark-paid      | Mark order as paid           | Admin  |

## 🛠️ Installation

```bash
git clone https://github.com/aasemkhataan/Book-Store-API
cd Book-Store-API
npm install
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory and add the following:

```env
# Server

NODE_ENV=development

# Database
DB=mongodb+srv://user:your_password@cluster.mongodb.net/dbname

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Email
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USERNAME=
EMAIL_PASSWORD=

# Stripe
STRIPE_SECRET_KEY=

# External APIs
GOOGLE_BOOKS_API_KEY=

```

---

## ✅ To Do

- Add Postman documentation
- Add unit/integration tests
- Add Docker support
- Deploy to Render/Heroku

> This project is under active development. More features will be added soon.
