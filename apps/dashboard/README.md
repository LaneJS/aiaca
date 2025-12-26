# Dashboard

This is the main dashboard application for the A11y Assistant platform. It allows users to manage their account, view accessibility scan reports, and configure settings.

## Technology Stack

- **Framework**: Angular
- **Build System**: Nx
- **Styling**: SCSS

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- npm

### Development Server

Run `npx nx serve dashboard` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Run `npx nx build dashboard` to build the project. The build artifacts will be stored in the `dist/` directory.

### Running Tests

- **Unit Tests**: Run `npx nx test dashboard` to execute the unit tests via [Jest](https://jestjs.io).
- **Linting**: Run `npx nx lint dashboard` to run linting tools.

## Key Features

- **Scan Management**: View and manage accessibility scans.
- **Reports**: detailed accessibility reports.
- **Settings**: Configure user and project settings.

## Project Structure

- `src/app`: Contains the main application source code.
- `src/environments`: Environment configuration files.
- `src/assets`: Static assets.

## Further Help

To get more help on the Nx CLI use `npx nx help`.