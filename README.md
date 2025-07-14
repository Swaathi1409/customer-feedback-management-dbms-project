# Customer Feedback Management System (CFMS)

A full-stack web application for collecting, managing, and analyzing customer feedback on products and services. The system supports both customer and administrator roles, providing a seamless experience for feedback submission and analytics.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Usage](#usage)
  - [Customer Flow](#customer-flow)
  - [Admin Flow](#admin-flow)
- [API Endpoints](#api-endpoints)
- [Frontend Overview](#frontend-overview)
- [Styling](#styling)
- [Security Notes](#security-notes)
- [License](#license)

---

## Features

- **Customer Feedback:** Submit detailed feedback for products and services, including ratings and comments.
- **Admin Dashboard:** Secure login for administrators to view feedback lists and analytics.
- **Analytics:** Real-time analytics for products and services, including positive/negative feedback counts and average ratings.
- **Responsive UI:** Modern, mobile-friendly interface using Bootstrap.
- **Session Management:** Secure session handling for admin authentication.
- **Error Handling:** Robust backend error handling for all API endpoints.

---

## Tech Stack

- **Backend:** Node.js, Express.js, MySQL (mysql2)
- **Frontend:** HTML, CSS (Bootstrap), JavaScript (vanilla, Chart.js)
- **Session Management:** express-session
- **Other:** body-parser, cors, dotenv

---

## Project Structure

```
customer-feedback-management-dbms-project/
│
├── app.js                  # Main Express backend server
├── mylocaldb_dump.sql      # MySQL database schema and sample data
├── package.json            # Node.js dependencies and scripts
├── public/
│   ├── index.html          # Main frontend HTML
│   ├── script.js           # Frontend logic (form handling, API calls, admin dashboard)
│   └── styles.css          # Custom styles
└── README.md               # Project documentation
```

---

## Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd customer-feedback-management-dbms-project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in the root directory with the following:
     ```
     DB_HOST=localhost
     DB_USER=your_mysql_user
     DB_PASSWORD=your_mysql_password
     DB_NAME=your_db_name
     ```

4. **Set up the database:**
   - Import the provided `mylocaldb_dump.sql` into your MySQL server:
     ```bash
     mysql -u your_mysql_user -p your_db_name < mylocaldb_dump.sql
     ```

5. **Run the server:**
   ```bash
   node app.js
   ```
   The backend will start on [http://localhost:3003](http://localhost:3003).

6. **Open the frontend:**
   - Open `public/index.html` in your browser (or serve the `public/` directory using a static server).

---

## Environment Variables

- `DB_HOST`: MySQL host (e.g., `localhost`)
- `DB_USER`: MySQL username
- `DB_PASSWORD`: MySQL password
- `DB_NAME`: MySQL database name

---

## Database

- The database schema is provided in `mylocaldb_dump.sql`.
- Main tables: `customer`, `product`, `service`, `product_rat`, `service_rat`, `analytics`, etc.
- Feedback and analytics are updated in real-time as users submit feedback.

---

## Usage

### Customer Flow

1. **Select "Customer"** on the home page.
2. **Enter your information:** Name, Email, (optional) Phone.
3. **Choose feedback type:** Product or Service.
4. **Fill out the feedback form:** Provide ratings (star-based) and comments.
5. **Submit feedback:** See a thank you message and option to submit more feedback.

### Admin Flow

1. **Select "Administrator"** on the home page.
2. **Login:** Enter the admin password (`admin123` by default; change in `app.js` for production).
3. **Dashboard:** View tabs for:
   - Product Feedback
   - Service Feedback
   - Product Analytics (table + chart)
   - Service Analytics (table + chart)
4. **Logout:** Securely end the session.

---

## API Endpoints

### Customer APIs

- `POST /api/customer`  
  Register or login a customer.  
  **Body:** `{ name, email, phone }`

- `GET /api/products`  
  Get all products.

- `GET /api/services`  
  Get all services.

- `POST /api/product-feedback`  
  Submit product feedback.  
  **Body:** `{ cu_id, prod_id, perform_rat, price_rat, p_qual_rat, design_rat, comfort_rat, use_again, overall_rating, comments }`

- `POST /api/service-feedback`  
  Submit service feedback.  
  **Body:** `{ cu_id, s_id, s_qual_rat, timeliness, communication, s_delivery, s_provider_knowledge, convenience, overall_rating, comments }`

### Admin APIs (require session)

- `POST /api/admin-login`  
  Login as admin.  
  **Body:** `{ password }`

- `GET /api/admin/product-feedbacks`  
  List all product feedbacks.

- `GET /api/admin/service-feedbacks`  
  List all service feedbacks.

- `GET /api/admin/product-analytics`  
  Product analytics (positive/negative/average).

- `GET /api/admin/service-analytics`  
  Service analytics (positive/negative/average).

---

## Frontend Overview

- **index.html:**  
  - Home page with role selection (Customer/Admin).
  - Customer section: Multi-step form for feedback.
  - Admin section: Login and dashboard with tabs for feedback and analytics.
  - Responsive design using Bootstrap 5.
  - Charts rendered with Chart.js.

- **script.js:**  
  - Handles all DOM interactions, form submissions, and API calls.
  - Manages session state for admin.
  - Dynamically loads feedback and analytics data for admin dashboard.
  - Implements star rating UI and feedback validation.

---

## Styling

- **Bootstrap 5** is used for layout and components.
- **Custom styles** in `styles.css` for:
  - Card and header rounding
  - Star rating widget (hover, selected states)
  - Table and feedback comment formatting
  - Responsive adjustments for mobile

---

## Security Notes

- **Admin password** is hardcoded as `admin123` for demo purposes. Change this in production.
- **Sessions** are managed with `express-session` (in-memory by default; use a persistent store for production).
- **CORS** is enabled for local frontend development.
- **Input validation** is performed on both frontend and backend.

---

**For any issues or contributions, please open an issue or pull request.**
