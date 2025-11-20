# Prompt: Wire the demo to the real embed script

- Replace `public/embed/autofix-demo.js` with a build artifact from `packages/embed-script` so the live demo shows our production logic.
- Surface live status (loading, API fetch success/failure) in the UI panel when the embed boots.
- Keep the `enable/disable` API stable for the toggle button; wrap the real script if needed.
- Add lightweight telemetry (console logs are fine) showing which fixes ran so stakeholders can verify behavior quickly.
