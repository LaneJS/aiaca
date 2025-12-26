# Payments Admin

An internal administration dashboard for managing payments, subscriptions, and billing for A11y Assistant.

## Technology Stack

- **Framework**: Angular
- **Build System**: Nx
- **Styling**: SCSS

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Development Server

Run `npx nx serve payments-admin` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `npx nx build payments-admin` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Tests

- **Unit Tests**: Run `npx nx test payments-admin` to execute the unit tests via [Jest](https://jestjs.io).
- **Linting**: Run `npx nx lint payments-admin` to run linting tools.

## Project Structure

- `src/app`: Contains the main application source code.
- `src/environments`: Environment configuration.

## Further Help

To get more help on the Nx CLI use `npx nx help`.