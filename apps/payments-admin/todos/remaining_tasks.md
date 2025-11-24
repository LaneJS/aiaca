# Remaining Tasks for Payments Admin

Based on the review of existing todos and the current codebase state, here are the remaining tasks to complete the `payments-admin` application.

## 1. Accounts Experience (Ref: 06-frontend-accounts-experience.md)
- [x] **Contacts Management**: Implement UI in `AccountDetailComponent` to add, edit, and delete contacts.
  - Backend endpoints: `GET/POST/PATCH/DELETE /api/v1/billing/accounts/{id}/contacts` (Implemented)
  - UI: Add "Add Contact" button, edit/delete actions in the contacts list.
- [x] **Payment Methods**: Ensure full CRUD capability for payment methods.
  - Backend endpoints: `GET/POST/PATCH/DELETE /api/v1/billing/accounts/{id}/payment-methods` (Implemented)
  - UI: Verify `AccountDetailComponent` correctly handles addition and removal (partially implemented, needs verification).

## 2. Reporting & Export (Ref: 10-frontend-reporting-and-audit-logs.md)
- [x] **Data Export**: Implement export functionality for Payments, Invoices, and Audit Logs.
  - Current state: `exportPlaceholder` method in `ReportingComponent`.
  - Action: Connect to backend export endpoints (if available) or implement client-side CSV generation.

## 3. Plan Management (Ref: 08-frontend-plan-management.md)
- [x] **Scheduled Changes**: Implement UI for scheduling plan changes.
  - Current state: `scheduledChangePlaceholder` in `PlansComponent`.
  - Action: Add dialog/form to schedule a plan change for a future date (e.g., end of billing period).

## 4. Operations Center (Ref: 09-frontend-operations-center.md)
- [x] **Dunning Actions**: Verify manual dunning event recording.
  - Current state: `recordDunningTouch` implemented in `OperationsCenterComponent`.
  - Action: Test with real backend to ensure it works as expected.

## 5. Polish & Verification
- [ ] **Remove Mocks**: Ensure no other mock services or data exist in the codebase.
- [ ] **E2E Testing**: Verify all flows against the running backend.
