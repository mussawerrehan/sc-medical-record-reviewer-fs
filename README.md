# Claims Analysis Application

A full-stack web application for analyzing professional, institutional, and DRG claims before submission to an adjudication system. The application integrates with free APIs for validating and retrieving descriptions of CPT, ICD-10, and DRG codes.

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ORM
- **Frontend**: Angular with Angular Material
- **Testing**: Jest (Backend), Jasmine/Karma (Frontend), Cypress (E2E)
- **Authentication**: JWT with role-based access control

## Prerequisites

- Node.js (v18 or later)
- MongoDB (v6 or later)
- Angular CLI (latest version)
- npm (latest version)

## Project Structure

```
claims-analysis-app/
├── backend/           # Express.js backend
├── frontend/         # Angular frontend
└── cypress/          # E2E tests
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a .env file based on .env.example:
   ```bash
   cp .env.example .env
   ```

4. Update the .env file with your configuration

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Tests
```bash
cd frontend
ng test
```

### E2E Tests
```bash
npm run cypress:open
```

## API Documentation

### Authentication Endpoints
- POST /api/auth/login - User login
- POST /api/auth/register - User registration

### Claims Endpoints
- GET /api/claims - List claims
- POST /api/claims - Create claim
- GET /api/claims/:id - Get claim details
- PUT /api/claims/:id - Update claim
- DELETE /api/claims/:id - Delete claim

### Code Validation Endpoints
- GET /api/codes/icd10 - Search ICD-10 codes
- GET /api/codes/drg - Search DRG codes
- GET /api/codes/cpt - Search CPT codes

## User Roles

- Super Admin: Full system access
- Provider: Create and manage professional claims
- Hospital Admin: Manage institutional and DRG claims
- Provider (Hospital Associated): Submit claims under specific hospitals

## License

MIT

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 