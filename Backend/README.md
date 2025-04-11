# Backend API

A .NET Core 8 Web API project with PostgreSQL integration.

## Prerequisites

- .NET Core 8 SDK
- PostgreSQL
- Visual Studio Code or Visual Studio

## Setup

1. Clone the repository
2. Update the connection string in `appsettings.json` with your PostgreSQL credentials
3. Run the following commands in the project directory:

```bash
dotnet restore
dotnet ef database update
dotnet run
```

## API Endpoints

### Transactions

- GET /api/transaction - Get all transactions
- GET /api/transaction/{id} - Get a specific transaction
- POST /api/transaction - Create a new transaction
- PUT /api/transaction/{id} - Update a transaction
- DELETE /api/transaction/{id} - Delete a transaction

## Features

- Entity Framework Core with PostgreSQL
- Request logging middleware
- Swagger UI for API documentation
- CRUD operations for transactions
- Proper error handling and logging

## Project Structure

- `Controllers/` - API endpoints
- `Data/` - Database context and configurations
- `Models/` - Entity models
- `Middleware/` - Custom middleware components
- `Services/` - Business logic services
- `Repositories/` - Data access layer
- `Interfaces/` - Contract definitions 