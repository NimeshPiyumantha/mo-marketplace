# MO Marketplace API

NestJS backend API for the MO Marketplace platform — handles products, variants, and JWT authentication.

## Tech Stack

- **Runtime:** Node.js (>=18)
- **Framework:** NestJS
- **Language:** TypeScript
- **Auth:** JWT (Passport)
- **Deployment:** Railway (Docker)

## Getting Started

```bash
# Install dependencies
npm install

# Run in development mode
npm run start:dev

# Build for production
npm run build

# Run production build
npm run start:prod
```

## Project Structure

```
src/
├── auth/          # JWT authentication module
├── products/      # Products module
├── variants/      # Product variants module
├── common/        # Shared utilities and guards
├── config/        # App configuration
├── app.module.ts  # Root module
└── main.ts        # Entry point
```

## License

MIT
