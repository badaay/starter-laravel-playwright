# Laravel Todo and MFA Application Documentation

## Overview

This application is a Laravel-based Todo management system with Multi-Factor Authentication (MFA) features. It provides both web and API interfaces for managing todos and configuring MFA.

## Testing the Application

### Prerequisites

- PHP 8.2 or higher
- Composer
- Node.js and npm
- A modern web browser

### Setting up the environment

1. Clone the repository
2. Run `composer install` to install PHP dependencies
3. Run `npm install` to install JavaScript dependencies
4. Copy `.env.example` to `.env` and configure your environment
5. Run `php artisan key:generate` to generate the application key
6. Run `php artisan migrate` to set up the database
7. Run `php artisan db:seed` to seed the database with test data
8. Run `npm run dev` to compile assets

### Starting the Application

```bash
php artisan serve
```

The application will be available at http://localhost:8000

### Testing User Accounts

| Email               | Password | Description                   |
|---------------------|----------|-------------------------------|
| user@example.com    | password | Regular user with sample todos |
| admin@example.com   | password | Admin user                    |

## Testing Features

### Todo Management

1. Log in with one of the test accounts
2. Navigate to the Todos section from the navigation menu
3. Test CRUD operations:
   - Create new todos
   - View todo details
   - Edit existing todos
   - Mark todos as completed
   - Delete todos

### MFA Setup and Usage

1. Log in with a test account
2. Navigate to your Profile
3. In the Two-Factor Authentication section, click "Setup Two-Factor Authentication"
4. Scan the QR code with an authenticator app (Google Authenticator, Microsoft Authenticator, or Authy)
5. Enter the verification code from your app
6. Store your recovery codes in a safe place
7. Log out and log back in to test the MFA challenge
8. Try using the "Send code to my email" option for email-based verification
9. Test the recovery code option by using one of your saved recovery codes

## API Documentation

The application provides a RESTful API for managing todos and MFA. API documentation is available at:

- http://localhost:8000/docs (API documentation UI)
- http://localhost:8000/docs.openapi (OpenAPI specification)
- http://localhost:8000/docs.postman (Postman collection)

### Authentication

All API endpoints require authentication using a Bearer token. To obtain a token:

1. Use Laravel Sanctum for API token generation
2. Include the token in the Authorization header: `Authorization: Bearer {token}`

### Todo API Endpoints

#### Get all todos

```
GET /api/todos
Authorization: Bearer {token}
```

#### Create a new todo

```
POST /api/todos
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New Todo Item",
  "description": "Description of the todo item",
  "completed": false
}
```

#### Get a specific todo

```
GET /api/todos/{id}
Authorization: Bearer {token}
```

#### Update a todo

```
PUT /api/todos/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Todo Title",
  "description": "Updated description",
  "completed": true
}
```

#### Delete a todo

```
DELETE /api/todos/{id}
Authorization: Bearer {token}
```

### MFA API Endpoints

#### Get MFA status

```
GET /api/mfa/status
Authorization: Bearer {token}
```

#### Setup MFA

```
GET /api/mfa/setup
Authorization: Bearer {token}
```

#### Enable MFA

```
POST /api/mfa/enable
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "123456"
}
```

#### Disable MFA

```
POST /api/mfa/disable
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "your_password"
}
```

#### Verify MFA code

```
POST /api/mfa/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "code": "123456",
  "type": "totp"  // or "recovery" or "email"
}
```

#### Request email verification code

```
POST /api/mfa/email-code
Authorization: Bearer {token}
```

#### Regenerate recovery codes

```
POST /api/mfa/recovery-codes
Authorization: Bearer {token}
```

## API Testing

### Generating API Tokens

To test the API endpoints, you need a valid authentication token. Use the custom Artisan command to generate one:

```bash
php artisan api:token
```

Follow the interactive prompts to:
1. Enter a user's email (or create a new user)
2. Optionally revoke existing tokens
3. Name your token

The command will output:
- The generated token
- How to use it with API requests
- A sample curl command to test the API

### Alternatively, you can generate tokens in code:

```php
// From within your Laravel application
$token = $user->createToken('api-token')->plainTextToken;
```

### Using the Token

Include the token in all API requests as a Bearer token in the Authorization header:

```
Authorization: Bearer YOUR_TOKEN_HERE
```

### Using the API Documentation Interface

1. Visit the API documentation at `/docs`
2. Click the "Authorize" button 
3. Enter your token in the format: `Bearer YOUR_TOKEN_HERE`
4. Now you can test all endpoints directly from the documentation interface

### Testing the API

## Troubleshooting

- **Issue**: Unable to log in after enabling MFA
  **Solution**: Use recovery codes or contact the system administrator

- **Issue**: MFA verification always fails
  **Solution**: Ensure your device's time is properly synchronized

- **Issue**: API returns 401 Unauthorized
  **Solution**: Verify your token is valid and properly included in the request header

## Next Steps and Future Improvements

1. Add more robust error handling
2. Implement rate limiting for MFA attempts
3. Add SMS-based MFA option
4. Implement admin dashboard for user management
5. Add API endpoint for batch operations on todos
6. Improve test coverage

## Support

For assistance, please contact support@example.com or open an issue on the GitHub repository.
