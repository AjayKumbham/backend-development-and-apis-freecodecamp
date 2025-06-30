# Backend Development and APIs Projects

![FreeCodeCamp Backend Certification](https://img.shields.io/badge/FreeCodeCamp-Backend%20Development%20%26%20APIs-0A0A23?style=for-the-badge&logo=freecodecamp)

This repository contains my solutions to the Backend Development and APIs projects required for the FreeCodeCamp Back End Development and APIs Certification. These projects demonstrate proficiency in building server-side applications, working with databases, and creating RESTful APIs using Node.js, Express, and MongoDB.

## 🏆 Certification

[![FreeCodeCamp Certification](https://img.shields.io/badge/FreeCodeCamp-Certified-success?style=flat-square)](https://www.freecodecamp.org/certification/your-username/back-end-development-and-apis)

## 📋 Table of Contents

- [Projects](#-projects)
- [Technologies Used](#-technologies-used)
- [Getting Started](#-getting-started)
- [Project Details](#-project-details)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

## 🚀 Projects

1. **Timestamp Microservice**
   - Converts between Unix timestamps and natural language dates
   - [View Code](/boilerplate-project-timestamp/)

2. **Request Header Parser Microservice**
   - Returns client's IP address, language, and software information
   - [View Code](/boilerplate-project-headerparser/)

3. **URL Shortener Microservice**
   - Shortens long URLs and redirects to original URLs
   - [View Code](/boilerplate-project-urlshortener/)

4. **Exercise Tracker**
   - Tracks users' exercise routines with a MongoDB database
   - [View Code](/boilerplate-project-exercisetracker/)

5. **File Metadata Microservice**
   - Returns metadata about uploaded files
   - [View Code](/boilerplate-project-filemetadata/)

## 💻 Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose ODM
- **Authentication**: Basic HTTP, JWT
- **Testing**: Chai, Mocha
- **Deployment**: Render, Heroku
- **Version Control**: Git, GitHub
- **Package Manager**: npm
- **Other Tools**: Postman, MongoDB Atlas

## 🛠️ Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- MongoDB Atlas account or local MongoDB instance

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/backend-development-and-apis-freecodecamp.git
   cd backend-development-and-apis-freecodecamp
   ```

2. Navigate to a project directory:
   ```bash
   cd boilerplate-project-exercisetracker  # Example project
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create a `.env` file in the project root and add your environment variables:
   ```env
   PORT=3000
   MONGO_URI=your_mongodb_connection_string
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## 📚 Project Details

### 1. Timestamp Microservice
- **Endpoint**: `GET /api/timestamp/:date?`
- **Features**:
  - Handles both Unix timestamps and natural language dates
  - Returns null for invalid dates
  - Current timestamp if no date parameter provided

### 2. Request Header Parser Microservice
- **Endpoint**: `GET /api/whoami`
- **Returns**:
  ```json
  {
    "ipaddress": "159.20.14.100",
    "language": "en-US,en;q=0.5",
    "software": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:50.0) Gecko/20100101 Firefox/50.0"
  }
  ```

### 3. URL Shortener Microservice
- **Endpoints**:
  - `POST /api/shorturl` - Create short URL
  - `GET /api/shorturl/:short_url` - Redirect to original URL
- **Features**:
  - Validates URLs
  - Persists URLs in MongoDB
  - Handles duplicate URLs

### 4. Exercise Tracker
- **Endpoints**:
  - `POST /api/users` - Create a new user
  - `GET /api/users` - Get all users
  - `POST /api/users/:_id/exercises` - Add exercises
  - `GET /api/users/:_id/logs` - View exercise logs
- **Features**:
  - Tracks exercise duration and dates
  - Supports date range filtering
  - Pagination support

### 5. File Metadata Microservice
- **Endpoint**: `POST /api/fileanalyse`
- **Returns**:
  ```json
  {
    "name": "example.txt",
    "type": "text/plain",
    "size": 1234
  }
  ```
- **Features**:
  - Handles file uploads
  - Returns file metadata
  - Supports drag and drop

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [FreeCodeCamp](https://www.freecodecamp.org/) for the amazing curriculum
- All the open-source contributors who made these projects possible
- The developer community for their support and inspiration

---

<div align="center">
  <p>Developed with ❤️ as part of the FreeCodeCamp Back End Development and APIs Certification</p>
  <p>© 2023 Your Name. All rights reserved.</p>
</div>
