# Payments Admin Site

A billing and payments management dashboard for AACA (AI Accessibility Compliance Assistant).

## Overview

This Angular application provides a comprehensive interface for managing:
- **Customer Accounts** - Track buyers, seats, and subscription status
- **Payments & Invoices** - Record payments, monitor collections, and handle refunds
- **Billing Plans** - Manage pricing tiers and subscription packages
- **Dashboard Overview** - View payment health, upcoming renewals, and at-risk accounts

## Architecture

This application follows **Angular's modern standalone component architecture** (as of Angular 15+) and connects to a Spring Boot backend API.

### Standalone Components Best Practices

**✅ ALWAYS follow these practices when working on this application:**

1. **Use `standalone: true` in all components**
   ```typescript
   @Component({
     selector: 'app-my-component',
     standalone: true,
     imports: [CommonModule, FormsModule, RouterModule],
     templateUrl: './my-component.html'
   })
   ```

2. **Use the `inject()` function for dependency injection**
   ```typescript
   import { Component, inject } from '@angular/core';
   import { MyService } from './my.service';

   export class MyComponent {
     private readonly myService = inject(MyService);
   }
   ```

3. **Import all dependencies explicitly**
   - CommonModule - for `*ngIf`, `*ngFor`, `async`, pipes
   - FormsModule - for `[(ngModel)]`, form directives
   - RouterModule - for `routerLink`, `router-outlet`, routing directives

4. **Use `bootstrapApplication()` for app initialization**
   ```typescript
   import { bootstrapApplication } from '@angular/platform-browser';
   import { provideRouter } from '@angular/router';

   bootstrapApplication(AppComponent, {
     providers: [provideRouter(routes)]
   });
   ```

5. **No NgModules** - This application does not use `app.module.ts` or any other NgModule files

### Why Standalone Components?

- **Simpler mental model** - No need to manage NgModule imports/exports
- **Better tree-shaking** - Smaller bundle sizes
- **Easier testing** - Components are self-contained
- **Modern Angular** - Official recommended approach as of Angular 15+

For more information, see the [Angular Standalone Components Migration Guide](https://angular.dev/reference/migrations/standalone).

## Project Structure

```
apps/payments-admin/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── dashboard/       # Billing overview & metrics
│   │   │   ├── accounts/        # Customer account management
│   │   │   ├── payments/        # Payment & invoice tracking
│   │   │   └── plans/           # Billing plan configuration
│   │   ├── core/
│   │   │   ├── api/             # HTTP API clients
│   │   │   └── state/           # Shared state services
│   │   ├── app.ts               # Root component
│   │   └── app.routes.ts        # Application routes
│   └── main.ts                  # Standalone bootstrap entry point
├── Dockerfile                   # Container configuration
└── nginx.conf                   # Production web server config
```

## Key Features

### Dashboard
- Active account metrics and MRR tracking
- Upcoming renewal notifications
- At-risk account identification
- Recent payment activity

### Accounts Management
- Full customer roster with filtering
- Account status management (active, trialing, past_due, paused, cancelled)
- Seat and MRR tracking
- Outstanding balance management

### Payments & Invoices
- Complete payment history
- Multi-status filtering (paid, refunded, failed, past_due, pending)
- Manual payment recording
- Payment method tracking

### Billing Plans
- Plan configuration and pricing
- Active subscriber tracking
- Monthly revenue calculations
- Seat usage monitoring

## Development

### Running Locally

```bash
# From repository root
nx serve payments-admin
```

### Building for Production

```bash
# From repository root
nx build payments-admin
```

### Docker Deployment

```bash
# Build the container
docker build -t payments-admin .

# Run the container
docker run -p 8080:80 payments-admin
```

## Services

### BillingApiService

The central service managing all billing data via HTTP calls to the backend API:

- `listAccounts`, `getAccount`, `createAccount`, `updateAccount`
- `listCharges`, `createCharge`, `refundCharge`
- `listSubscriptions`, `createSubscription`
- `listPlans`, `createPlan`

All data is fetched from the backend and managed using RxJS observables in the components.

## Future Enhancements

- Real-time payment webhooks
- Automated dunning workflows
- Advanced analytics and reporting
- Export functionality (CSV, PDF)

## Contributing

When making changes to this application:

1. ✅ Always use standalone components
2. ✅ Use `inject()` for dependency injection
3. ✅ Import all required Angular modules explicitly
4. ✅ Follow the existing component structure and patterns
5. ✅ Maintain reactive data flow using RxJS observables
6. ✅ Test all changes thoroughly before committing

---

**Remember:** This application serves as a reference implementation for Angular standalone component best practices. Maintain this standard across all AACA Angular applications.
