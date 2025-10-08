# 🏥 IronHealth - Healthcare Management System

> A full-stack healthcare management system built during Ironhack's 2025 Web Development Bootcamp. This backend API manages patients, healthcare professionals, appointments, and medical records with a focus on security and scalability.

## 🚀 Features

- **🔐 User Authentication** - JWT-based auth with role-based access control (Admin, Professional, Patient)
- **👥 User Management** - Multi-role system with profile references
- **🏥 Patient Management** - Complete CRUD operations with medical history
- **👨‍⚕️ Professional Management** - Healthcare provider profiles with specializations
- **📅 Appointment Scheduling** - Book, manage, and track appointments with email notifications
- **📧 Email Service** - Automated notifications with calendar attachments (ICS files)
- **☁️ File Upload** - Cloudinary integration for profile pictures and documents
- **✅ Input Validation** - express-validator and Zod for robust data validation
- **🧪 Testing** - Jest with MongoDB Memory Server for unit and integration tests

## 🛠️ Tech Stack

**Backend Framework**
- Node.js 18+
- Express.js

**Database**
- MongoDB Atlas (Cloud)
- Mongoose ODM

**Authentication & Security**
- JWT (jsonwebtoken)
- bcryptjs (password hashing)
- sanitize-html (XSS prevention)

**Validation**
- express-validator
- Zod

**External Services**
- Cloudinary (image storage)
- Resend API (transactional emails)

**Development Tools**
- ESLint (linting)
- Prettier (code formatting)
- Husky (git hooks)
- Jest (testing)
- Node --watch (dev server)

## 📊 System Architecture

### 📐 Infrastructure Overview

For a detailed view of the complete system architecture including all layers, middleware, routes, models, and external services:

**[📄 View Full Infrastructure Diagram →](docs/infrastructure.mmd)**

### 🔄 API Request Flow

For a detailed sequence diagram showing the complete request lifecycle from client to database:

**[📄 View Full API Flow Diagram →](docs/api-flow-db.mmd)**

### 🗂️ Project Structure

For a comprehensive view of the project file organization:

**[📄 View Project Structure Diagram →](docs/project-structure.mmd)**

## 📁 Project Structure

```
backend-ironhealth/
├── api/
│   ├── config/         # Cloudinary, MongoDB config
│   ├── controllers/    # Request handlers
│   ├── data/           # Static data (professions.json)
│   ├── middlewares/    # Auth, response handlers
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route definitions
│   ├── seeds/          # Database seeders
│   ├── services/       # Email service (Resend)
│   ├── utils/          # Helper functions (DNI, ICS, etc.)
│   └── validators/     # express-validator rules
├── __tests__/          # Jest test suites
├── docs/               # Mermaid diagrams
├── scripts/            # Utility scripts
├── .env.example        # Environment variables template
├── .eslintrc.json      # ESLint configuration
├── .prettierrc         # Prettier configuration
├── jest.config.cjs     # Jest configuration
├── app.js              # Express app setup
└── package.json        # Dependencies & scripts
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/backend-ironhealth.git
   cd backend-ironhealth
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   RESEND_API_KEY=your_resend_api_key
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Run tests**

   ```bash
   npm test
   ```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/change-password` - Change password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Patients
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Professionals
- `GET /api/professionals` - Get all professionals
- `GET /api/professionals/:id` - Get professional by ID
- `POST /api/professionals` - Create professional
- `PUT /api/professionals/:id` - Update professional
- `DELETE /api/professionals/:id` - Delete professional

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get appointment by ID
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment

### Email
- `POST /api/email/send` - Send email with optional ICS attachment

## 🧪 Testing

The project uses Jest with MongoDB Memory Server for testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 📝 License

This project was created as part of the Ironhack Web Development Bootcamp curriculum.

## 👥 Team

**Developers**
- [alenorgue](https://github.com/alenorgue) - Full Stack Developer
- [ccbaron](https://github.com/ccbaron) - Full Stack Developer
- [ErebosXYZ](https://github.com/ErebosXYZ) - Full Stack Developer
- [Juan Dation](https://github.com/juandation) - Full Stack Developer
- [Maria Jie](https://github.com/shimotachi3) - Full Stack Developer
- [Sergio CaMi](https://github.com/SergioCaMi) - Full Stack Developer

**Lead Instructor**
- [Oscar Miras](https://github.com/omiras) - Ironhack Lead Teacher

---

Built with ❤️ during Ironhack's 2025 Web Development Bootcamp
