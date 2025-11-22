Frontend Agent — Payment methods + Stripe Elements/Checkout
Goal: Enable payment method updates and one-off charges with 3DS flows tied to backend/Stripe.
Scope:
- Integrate Stripe Elements or Checkout for adding/updating payment methods and collecting one-off charges; handle 3DS/SCA flows and error states gracefully.
- Use publishable key from backend/config endpoint; never expose secrets; pass backend-generated client secrets/payment_intent ids where required.
- Update payment method screens in account detail to show brand/last4/exp and allow default selection/removal per RBAC.
- Handle failure states (requires_action, requires_payment_method), retries, and confirm success in UI with clear toasts and activity feed entries.
- Accessibility: ensure forms and Elements embeds are keyboard/screen-reader friendly; provide focus management around modals/steps.
Dependencies: Backend Stripe client + endpoints from 02–03; foundation from 05–06.
