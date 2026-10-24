# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/)

## Contact form

The `/contact` page form submits to [Formspree](https://formspree.io) — no backend and no
other provider. The endpoint is built in `src/data/site.js` as
`https://formspree.io/f/${FORMSPREE_FORM_ID}`, where `FORMSPREE_FORM_ID` comes from
`VITE_FORMSPREE_FORM_ID` and falls back to the built-in public form ID.

**Optional configuration:** create a form at formspree.io, confirm the destination inbox
from the email Formspree sends you, copy the form ID from the Integration tab's form URL
(`https://formspree.io/f/<FORM_ID>`), then copy `.env.example` to `.env.local` and set:

```
VITE_FORMSPREE_FORM_ID=<FORM_ID>
```

For extra spam protection, use Formspree's dashboard: **Restrict to Domain** (checks
`Referer`) and CAPTCHA are the strongest layers and are server-side. The client also
applies a honeypot, a minimum-fill-time check, and field validation.

`VITE_*` values are inlined into the public client bundle. The form ID is a public
endpoint identifier and is already exposed in the no-JS `<form action>` fallback, so that
is fine — but never put a Formspree API key, SMTP credential, or any other secret in a
`VITE_*` variable.

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
