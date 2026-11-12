# Claro — an AI shopping agent with a wallet

**PayPal AI Hackathon submission.** Claro is an AI stylist that doesn't just *recommend* an
outfit — it **assembles and pays for one**. Tell it the occasion and your budget; it
discovers real products across stores (Channel3), composes a complete look within budget,
and executes payment through **PayPal** — one unified checkout that splits across each
merchant via a multi-payee order — pausing for your approval before it spends a cent.

> The payment is the product. PayPal is not a checkout button bolted on at the end; the
> agent transacts through PayPal as a first-class tool.

## How it uses PayPal + AI

- **AI agent (OpenAI via the Vercel AI SDK)** runs a budget-constrained loop: search →
  compose → price → settle. The budget is enforced in code, not just the prompt.
- Payment runs on **PayPal Orders v2** as a single **multi-payee order** — one
  `purchase_unit` per merchant, each with its own `payee`, so one checkout splits across
  every seller at capture. The **PayPal Agent Toolkit** is also wired into the agent for
  order tools.
- **Human-in-the-loop:** the agent may build and price the order autonomously, but the
  final capture is gated behind explicit user approval.

## Sponsor tools

| Sponsor | Used for |
| --- | --- |
| **PayPal** | Agent Toolkit · Orders v2 multi-payee split checkout (all sandbox) |
| **Channel3** | Cross-store product discovery |
| **AG Grid** | Outfit review table with sortable pieces, stores, and prices |
| **Render** | Hosting / public demo URL |
| APIMatic *(tier-2)* | Generating typed PayPal/Channel3 API clients |
| Bryntum *(tier-2)* | Multi-merchant delivery timeline |

## Tech stack

Next.js 15 (App Router) · TypeScript · Tailwind · Vercel AI SDK + OpenAI ·
`@paypal/agent-toolkit` · AG Grid React · deployed on Render.

## Getting started

```bash
# 1. Install
npm install

# 2. Configure environment
cp .env.example .env.local
#   fill in the keys (see .env.example). The app runs with mock data if a key is missing,
#   so you can start the UI before every sandbox account is set up.

# 3. Run
npm run dev
# open http://localhost:3000
```

### Required sandbox accounts (all free)
- **PayPal Developer** — create a sandbox app for `CLIENT_ID` / `SECRET`, plus 2–3 sandbox
  business accounts (set `DEMO_MERCHANT_EMAILS`) to act as the merchant payees, and a
  sandbox personal account to approve payments as the buyer.
- **OpenAI** — an API key for the agent model.
- **Channel3** — an API key for product discovery.

## Project layout

```
app/            Next.js routes (UI + /api/agent)
lib/            External clients (channel3, paypal), agent tools, types
components/     UI: chat, outfit grid, budget meter, approval modal, dashboard
docs/DESIGN.md  Architecture, demo flow, milestones, prize strategy
```

## Demo flow

Describe an occasion + budget → agent discovers products → composes an outfit → review the
sortable AG Grid and budget meter → **Approve outfit & pay with PayPal** → PayPal captures
and reports the sandbox receiver split. Product cards can also be added to the cart for a
later checkout. See [`docs/DESIGN.md`](docs/DESIGN.md) for the architecture and demo script.

### Demo notes

The app falls back to a deterministic mock catalog when Channel3 is not configured, but
the AI key is required for the agent route. PayPal checkout requires sandbox credentials,
`NEXT_PUBLIC_PAYPAL_CLIENT_ID`, and comma-separated `DEMO_MERCHANT_EMAILS`. Real Channel3
merchant names are mapped to those configured sandbox receiver accounts for the demo; the
UI does not claim that sandbox money is sent to the original stores.

## License

[MIT](LICENSE).
