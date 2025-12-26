# Marketing Site

The public-facing marketing website for A11y Assistant. It explains the product features, pricing, and documentation.

## Technology Stack

- **Framework**: Angular
- **Build System**: Nx
- **Styling**: SCSS

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Development Server

Run `npx nx serve marketing-site` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `npx nx build marketing-site` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Tests

- **Unit Tests**: Run `npx nx test marketing-site` to execute the unit tests via [Jest](https://jestjs.io).
- **Linting**: Run `npx nx lint marketing-site` to run linting tools.

## Key Content

- **Landing Page**: Product overview.
- **Resources**: Documentation and guides.
- **Legal**: Privacy policy and terms of service.

## Project Structure

- `src/app`: Contains the application components and routing.
- `src/assets`: Images, fonts, and other static files.

## Further Help

To get more help on the Nx CLI use `npx nx help`.