# Library Management System

A full-stack library management system built with modern web technologies and enterprise-oriented database design principles.

The project follows a Monorepo architecture and implements advanced database techniques such as Transactions, Row-level Locking, Stored Procedures, and Triggers to ensure data consistency and reliability across borrowing, returning, and payment workflows.

---

## Features

### Library Operations

* Book inventory management
* Borrow / return workflow
* Reader account management
* Staff management system
* Authentication & role-based authorization

### Database & Business Logic

* Stored Procedures for business operations
* Database Triggers for automated workflows
* Row-level locking using `FOR UPDATE`
* Automatic overdue fine generation
* Automatic reader suspension/reactivation

### System Design

* Monorepo architecture
* RESTful API design
* JWT Authentication
* Modular backend structure
* Responsive frontend dashboard

---

## Tech Stack

### Frontend

* ReactJS
* Vite
* TailwindCSS
* Axios

### Backend

* NestJS
* TypeScript
* MySQL2

### Database

* MySQL 8+
* Stored Procedures
* Triggers
* Views
* Transactions

---

## Project Structure

```text
Library-management/
├── backend/        # NestJS API server
├── frontend/       # React frontend application
├── database/       # SQL initialization scripts
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

Before running the project, make sure the following tools are installed on your machine:

* Git
* Node.js (LTS version recommended)
* MySQL 8+

Recommended database tools:

* DBeaver
* MySQL Workbench

---

## Installation

Clone the repository:

```bash
git clone https://github.com/ThaiDevv/FullStack-Project-library-management.git
```

Move into the project directory:

```bash
cd FullStack-Project-library-management
```

Install root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Return to the root directory:

```bash
cd ..
```

---

## Database Setup

Create a new MySQL database:

```sql
CREATE DATABASE railway
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Import the SQL initialization script located in:

```text
database/init.sql
```

or:

```text
railway.sql
```

The script will automatically create:

* tables
* triggers
* stored procedures
* views
* sample data

---

## Environment Variables

Create a `.env` file inside the `backend/` directory:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=railway

PORT=3000
```

---

## Running the Application

Start both frontend and backend concurrently:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Backend API:

```text
http://localhost:3000
```

---

## Authors

Developed collaboratively by:

* Trần Văn Thái
* Trần Văn Ngọc Thắng
* Nguyễn Lê Huy Tâm
* Phạm Bá Trí Tâm
* Nguyễn Ngọc Gia Bảo

