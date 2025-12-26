# Demo Site

This application serves as a demonstration platform for the A11y Assistant. It is designed to showcase the capabilities of the accessibility scanner and embed script.

## Technology Stack

- **Framework**: Angular
- **Build System**: Nx
- **Styling**: SCSS

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Development Server

Run `npx nx serve demo-site` for a dev server. Navigate to `http://localhost:4400/`. The application will automatically reload if you change any of the source files.

### Build

Run `npx nx build demo-site` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Tests

- **Unit Tests**: Run `npx nx test demo-site` to execute the unit tests via [Jest](https://jestjs.io).
- **Linting**: Run `npx nx lint demo-site` to run linting tools.

## Project Structure

- `src/app`: Contains the main application source code.
- `src/main.ts`: The entry point of the application.

## Further Help

To get more help on the Nx CLI use `npx nx help`.
