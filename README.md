# Laravel Todo & MFA Application

<p align="center">
<img src="https://img.shields.io/badge/Laravel-12-red?style=for-the-badge&logo=laravel" alt="Laravel 12">
<img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React 18">
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript">
<img src="https://img.shields.io/badge/Playwright-Testing-green?style=for-the-badge&logo=playwright" alt="Playwright">
<img src="https://img.shields.io/badge/Tailwind-CSS-blue?style=for-the-badge&logo=tailwindcss" alt="Tailwind CSS">
</p>

A modern Laravel application that combines **Todo management** and **Multi-Factor Authentication (MFA)**. Built with Laravel 12, React with TypeScript (via Inertia.js), and comprehensive end-to-end testing with Playwright.

## 🚀 Features

### 🔐 **Authentication & Security**
- **Laravel Breeze** authentication system
- **Multi-Factor Authentication (MFA)** using Google2FA
  - TOTP (Time-based One-Time Password) support
  - QR code generation for authenticator apps
  - Recovery codes for backup access
  - Email-based verification codes
  - Custom MFA middleware protection

### 📝 **Todo Management**
- Full CRUD operations for todos
- User-scoped todos (privacy by design)
- Todo attributes: title, description, completion status
- Real-time updates via Inertia.js

### 🔌 **RESTful API**
- Complete API endpoints for all features
- Laravel Sanctum authentication
- OpenAPI specification
- Comprehensive API documentation

## 🛠 Technical Stack

### **Frontend**
- **React 18** with TypeScript
- **Inertia.js** for seamless SPA experience
- **Tailwind CSS** for modern styling
- **Vite** for lightning-fast builds
- **Headless UI** for accessible components

### **Backend**
- **Laravel 12** (PHP 8.2+)
- **SQLite** database with migrations
- **Laravel Sanctum** for API authentication
- **Google2FA** for MFA implementation
- **Laravel Breeze** for auth scaffolding

### **Testing & Quality**
- **Playwright** for cross-browser E2E testing
- **PHPUnit** for backend unit/feature tests
- **ESLint & Prettier** for code quality
- **TypeScript** for type safety

## 📋 Prerequisites

- **PHP 8.2 or higher**
- **Composer**
- **Node.js 18+ and npm**
- **SQLite** (or your preferred database)

## 🏗 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd starter-laravel-playwright
   ```

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install JavaScript dependencies**
   ```bash
   npm install
   ```

4. **Environment setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

5. **Database setup**
   ```bash
   php artisan migrate
   php artisan db:seed
   ```

6. **Build assets**
   ```bash
   npm run build
   # OR for development
   npm run dev
   ```

## 🚀 Getting Started

### **Start the application**
```bash
php artisan serve
```
The application will be available at `http://localhost:8000`

### **Development mode** (with hot reload)
```bash
# Terminal 1: Laravel server
php artisan serve

# Terminal 2: Vite dev server
npm run dev
```

### **Test accounts**
| Email | Password | Description |
|-------|----------|-------------|
| `user@example.com` | `password` | Regular user with sample todos |
| `admin@example.com` | `password` | Admin user |

## 🧪 Testing

### **Run E2E tests with Playwright**
```bash
npm run test:e2e
```

### **Run PHP tests**
```bash
php artisan test
```

### **View test reports**
- Playwright reports: `./playwright-report/index.html`
- Coverage reports: `./test-results/`

## 📊 Database Schema

### **Users Table**
```sql
- id (primary key)
- name, email (unique), email_verified_at
- password (hashed), remember_token
- timestamps
```

### **Todos Table**
```sql
- id (primary key)
- user_id (foreign key → users.id)
- title, description (nullable)
- completed (boolean), completed_at (nullable)
- timestamps
```

### **MFA Configurations Table**
```sql
- id (primary key)
- user_id (foreign key → users.id)
- enabled (boolean), secret (nullable)
- recovery_codes (JSON), verified_at (nullable)
- timestamps
```

## 🏗 Architecture Overview

### **Backend Structure**
```
app/
├── Http/Controllers/
│   ├── Api/              # RESTful API controllers
│   ├── Auth/             # Authentication controllers
│   ├── TodoController.php
│   └── MfaController.php
├── Models/
│   ├── User.php          # User model with MFA relationships
│   ├── Todo.php, MfaConfiguration.php
├── Services/
│   └── MfaService.php    # MFA business logic
└── Http/Middleware/
    └── EnsureMfaAuthenticated.php
```

### **Frontend Structure**
```
resources/js/
├── Pages/
│   ├── Auth/             # Authentication pages
│   ├── Todos/            # Todo CRUD pages
│   ├── Profile/          # User profile & MFA setup
│   └── Dashboard.tsx
├── Components/           # Reusable UI components
├── Layouts/             # Page layouts
└── Contexts/            # React contexts
```

## 🔒 Security Features

- **Multi-Factor Authentication (MFA)**
  - TOTP-based verification with Google Authenticator
  - Recovery codes for account recovery
  - Email-based backup verification
- **Laravel Sanctum** for secure API authentication
- **CSRF protection** for web routes
- **Input validation** and sanitization
- **Password confirmation** for sensitive operations

## 📖 API Documentation

### **Available endpoints:**
- **Authentication:** `/api/user`, `/api/login`, `/api/logout`
- **Todos:** `/api/todos` (full CRUD)
- **MFA:** `/api/mfa/*` (setup, enable, disable, verify)

### **API Documentation URLs:**
- Interactive docs: `http://localhost:8000/docs`
- OpenAPI spec: `http://localhost:8000/docs.openapi`
- Postman collection: `http://localhost:8000/docs.postman`

### **Authentication:**
```bash
# Generate API token
php artisan api:token

# Use in requests
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/todos
```

## 🔧 Development Commands

```bash
# Code quality
npm run lint              # ESLint checking
composer pint             # PHP code styling

# Database
php artisan migrate:fresh --seed    # Reset database
php artisan migrate:status          # Check migration status

# Cache management
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Testing
npm run test:e2e          # Playwright E2E tests
php artisan test          # PHPUnit tests
php artisan test --coverage # With coverage
```

## 🚀 Deployment

### **Production build**
```bash
npm run build
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

### **Environment variables**
Ensure these are set in production:
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com
DB_CONNECTION=mysql # or your production database
MAIL_* # Configure for MFA emails
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### **Code Standards**
- Follow PSR-12 for PHP code
- Use TypeScript for frontend development
- Write tests for new features
- Follow conventional commit messages

## 📄 License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

## 🆘 Support

- **Documentation:** See `API_DOCUMENTATION.md` for detailed API docs
- **Issues:** Please use the GitHub issue tracker
- **Security:** Report security vulnerabilities via email

---

Built with ❤️ using Laravel, React, and modern web technologies.
