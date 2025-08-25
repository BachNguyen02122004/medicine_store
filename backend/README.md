# Medicine Store Backend API

A RESTful API for managing a medicine store built with Node.js, Express.js, and PostgreSQL.

## Features

- **Medicine Management**: CRUD operations for medicines
- **Patient Management**: CRUD operations for patients
- **Prescription Management**: Create and manage prescriptions
- **Service Management**: Manage medical services
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Centralized error handling with custom error types
- **Logging**: Winston-based logging system
- **Security**: Helmet.js for security headers
- **Compression**: Response compression for better performance
- **Pagination**: Built-in pagination support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Database Client**: pg (node-postgres)
- **Validation**: express-validator
- **Logging**: Winston
- **Security**: Helmet.js, CORS
- **Compression**: compression

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── config.js         # Application configuration
│   │   └── database.js       # Database connection management
│   ├── controllers/
│   │   ├── benhNhanController.js
│   │   ├── thuocController.js
│   │   ├── prescriptionController.js
│   │   └── serviceController.js
│   ├── middleware/
│   │   ├── errorHandler.js   # Global error handling
│   │   ├── validation.js     # Input validation rules
│   │   └── requestLogger.js  # Request logging
│   ├── models/
│   │   ├── benhNhanModel.js
│   │   ├── thuocModel.js
│   │   └── toathuocModel.js
│   ├── routes/
│   │   ├── benhNhanRoutes.js
│   │   ├── thuocRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   └── serviceRoutes.js
│   └── utils/
│       ├── helpers.js        # Utility functions
│       ├── logger.js         # Logger configuration
│       └── responseHelper.js # Response formatting
├── logs/                     # Log files
├── migrations/              # Database migrations
├── seeders/                 # Database seeders
├── .env.example            # Environment variables template
├── .gitignore
├── index.js               # Application entry point
└── package.json

```

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy environment file:

   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in `.env`:

   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/medicine_store
   PORT=5000
   NODE_ENV=development
   ```

5. Run database migrations:

   ```bash
   npm run migrate
   ```

6. (Optional) Seed the database:
   ```bash
   npm run seed
   ```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start the development server with nodemon
- `npm run migrate` - Run database migrations
- `npm run seed` - Run database seeders
- `npm run setup` - Run migrations and seeders
- `npm run lint` - Lint the code
- `npm run lint:fix` - Fix linting issues
- `npm test` - Run tests

## API Endpoints

### Medicines (Thuốc)

- `GET /api/thuoc` - Get all medicines (with pagination and search)
- `GET /api/thuoc/:id` - Get medicine by ID
- `POST /api/thuoc` - Create new medicine
- `PUT /api/thuoc/:id` - Update medicine
- `DELETE /api/thuoc/:id` - Delete medicine

### Patients (Bệnh nhân)

- `GET /api/benhnhan` - Get all patients (with pagination and search)
- `GET /api/benhnhan/:id` - Get patient by ID
- `POST /api/benhnhan` - Create new patient
- `PUT /api/benhnhan/:id` - Update patient
- `DELETE /api/benhnhan/:id` - Delete patient

### Prescriptions (Toa thuốc)

- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `POST /api/prescriptions` - Create new prescription
- `PUT /api/prescriptions/:id` - Update prescription

### Services (Dịch vụ)

- `GET /api/dichvu` - Get all services
- `POST /api/dichvu` - Create new service
- `PUT /api/dichvu/:id` - Update service
- `DELETE /api/dichvu/:id` - Delete service

### Health Check

- `GET /health` - Health check endpoint

## Request/Response Format

### Standard Success Response

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response

```json
{
  "status": "success",
  "message": "Data retrieved successfully",
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "itemsPerPage": 10
  }
}
```

### Error Response

```json
{
  "status": "error",
  "message": "Error message"
}
```

## Validation

The API includes comprehensive input validation:

- **Medicine validation**: Name (2-100 chars), quantity (positive integer), price (positive number)
- **Patient validation**: Name (2-100 chars), phone (Vietnamese format), email validation
- **ID validation**: Numeric IDs for all entities
- **Pagination validation**: Page and limit parameters

## Error Handling

- Centralized error handling with custom `AppError` class
- Different error responses for development and production
- Proper HTTP status codes
- Database constraint error handling (unique violations, foreign key violations)

## Logging

- Winston-based logging system
- Different log levels (error, warn, info, http, debug)
- Separate log files for errors and general logs
- Request logging middleware

## Security Features

- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- SQL injection prevention through parameterized queries

## Environment Configuration

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGIN` - Allowed CORS origin
- `LOG_LEVEL` - Logging level

## Contributing

1. Follow the established code style
2. Add appropriate validation for new endpoints
3. Include error handling
4. Update documentation
5. Add tests for new features

## License

MIT License
