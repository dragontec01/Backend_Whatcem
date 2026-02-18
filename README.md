# DtechCX Backend

A TypeScript-based backend API with Express, MongoDB, and Docker support.

## Features

- 🚀 **Express.js** - Fast, minimalist web framework
- 📦 **TypeScript** - Type-safe development
- 🍃 **MongoDB** with Mongoose - Database and ODM
- 🐳 **Docker** - Containerized development and production
- 🔐 **JWT Authentication** - Secure authentication
- 🔒 **Security** - Helmet, CORS configured
- ⚡ **Hot Reload** - Development with ts-node-dev

## Prerequisites

- Node.js 20+
- pnpm
- Docker & Docker Compose

## Quick Start

### Development Mode (Recommended)

**Using Docker (includes MongoDB):**

```bash
# Start all services with hot reload
pnpm docker:dev

# Or run in detached mode
pnpm docker:dev:detach

# View logs
pnpm docker:logs

# Stop services
pnpm docker:down
```

**Without Docker (requires local MongoDB):**

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Production Mode

**Using Docker:**

```bash
# Build and start production containers
pnpm docker:prod

# Or run in detached mode
pnpm docker:prod:detach

# Stop production services
pnpm docker:down:prod
```

**Without Docker:**

```bash
# Build the project
pnpm build

# Start production server
pnpm start:prod
```

## Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongo:27017/dtechcxdb` |
| `MONGODB_USER` | MongoDB username (optional) | - |
| `MONGODB_PASSWORD` | MongoDB password (optional) | - |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_EXPIRES_IN` | JWT expiration time | `7d` |
| `CORS_ORIGIN` | Allowed CORS origins | `*` |

## API Endpoints

### Health Check

- `GET /health` - Server health status

### Test Routes

- `GET /api/test` - Public test route
- `GET /api/test/ping` - Ping endpoint
- `POST /api/test/echo` - Echo request body
- `GET /api/test/protected` - Protected route (requires auth)
- `GET /api/test/error` - Test error handling

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)
- `POST /api/auth/refresh` - Refresh token (requires auth)

## Project Structure

```
src/
├── config/
│   ├── index.ts          # Configuration management
│   └── database.ts       # MongoDB connection
├── middleware/
│   ├── auth.middleware.ts    # JWT authentication
│   └── error.middleware.ts   # Error handling
├── routes/
│   ├── auth.routes.ts    # Authentication routes
│   └── test.routes.ts    # Test routes
├── types/
│   └── index.ts          # TypeScript types
├── utils/
│   └── response.utils.ts # Response helpers
├── app.ts                # Express app configuration
└── index.ts              # Server entry point
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with hot reload |
| `pnpm build` | Build TypeScript to JavaScript |
| `pnpm start` | Start production server |
| `pnpm start:prod` | Start in production mode |
| `pnpm docker:dev` | Start dev environment with Docker |
| `pnpm docker:prod` | Start prod environment with Docker |
| `pnpm docker:down` | Stop Docker containers |
| `pnpm docker:logs` | View Docker logs |
| `pnpm docker:clean` | Remove containers, volumes, and images |
| `pnpm typecheck` | Run TypeScript type checking |

## Adding Mongoose Models

The database connection is pre-configured. To add a new model:

1. Create a new file in `src/models/` (create the folder first)
2. Define your schema and model

Example:

```typescript
// src/models/user.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
```

## License

ISC
