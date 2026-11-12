# Claro — Design & Architecture

> AI shopping agent with a wallet. Give it an occasion and a budget; it discovers real
> products, composes a complete outfit, and transacts on your behalf through PayPal —
> enforcing your budget as a hard guardrail and pausing for your approval before it pays.

Built for the **PayPal AI Hackathon** (deadline 2026-11-12). This doc is the source of
truth for scope, architecture, and the demo flow. Keep it tight; keep it flawless.

---

## 1. Why this wins

The #1 rule of the hackathon is that **PayPal must be central**, and the richest special
prizes reward **agentic commerce**. Most "AI shopping assistant" demos bolt a Pay button
onto a chatbot. Claro inverts that: **the agent itself holds a budget and executes the
payment** through PayPal's Agent Toolkit — Orders to collect, Payouts to settle each
merchant. The payment *is* the product.

### Judging-criteria map

| Criterion | How Claro answers it |
| --- | --- |
| Technological Implementation | Agent calls PayPal Orders **and** Payouts as tools via the PayPal Agent Toolkit; Channel3 for discovery; non-trivial budget-constrained agent loop. |
| Design | One coherent flow: describe → discover → compose → review in a grid → approve → pay. |
| Potential Impact | A concrete persona (see §3) with a real, repeated pain: assembling a complete, in-budget outfit across stores and actually paying for it. |
| Innovation | Agent-with-a-wallet + budget guardrail + human-approval-before-pay is novel vs. recommend-only assistants. |
| Presentation | The whole flow completes live in sandbox in under 3 minutes, ending in a real PayPal capture + payout split. |

---

## 2. Prize strategy (tiered — build core first)

**Core (must ship, nothing simulated):**
- PayPal + AI (required) · Best Use of Agentic Commerce · Best Use of PayPal + AI
- Best Use of Channel3 (discovery is the front door)
- Best Use of AG Grid (sortable outfit review table + live budget meter)
- Best Use of Render (deploy target)

**Tier-2 (add only when core is rock-solid):**
- Best Use of Bryntum — multi-merchant delivery timeline
- Best Use of APIMatic — generate typed PayPal/Channel3 clients from their specs

**Earned through polish, not integration:** Overall top-3, Most Creative, Most Impactful,
Best Demo Delivery. These come from the video and the finish, not more code.

**Rule:** no integration ships unless it works end-to-end on camera. A broken sponsor
integration is worse than its absence.

---

## 3. Target user

**"Priya, 29, a wedding guest in three weeks."** She needs a complete, season-appropriate
outfit (top, bottom, shoes, one accessory) for under a fixed budget, from whatever stores
carry the right pieces. She does not want to tab across five sites, maintain five carts,
and do mental math. She wants to say what the event is and approve a finished, paid-for
outfit. Narrow persona on purpose — it makes the Impact and demo concrete.

---

## 4. Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│  Next.js 15 (App Router, TypeScript, Tailwind)                           │
│                                                                          │
│  UI                         API routes (server)          External        │
│  ─────────────────────      ───────────────────────      ──────────────  │
│  Chat / brief input   ─────▶ /api/agent  (AI SDK loop) ─▶ OpenAI            │
│  AG Grid outfit table ◀────  agent tools:                                 │
│  Budget meter               ├─ search_products      ──▶ Channel3 API      │
│  Approve & Pay (Buttons) ──▶ ├─ price_outfit (budget guardrail)           │
│  Order-status dashboard     └─ present_outfit ──▶ UI panel                │
│  (Bryntum timeline, T2)     /api/paypal/order+capture ─▶ PayPal Orders v2 │
│                             multi-payee split; toolkit = @paypal/agent-toolkit│
└────────────────────────────────────────────────────────────────────────┘
                         Deployed on Render.  Secrets server-side only.
```

### Key decisions
- **Agent framework:** Vercel AI SDK (`generateText`/`streamText` with tools). PayPal
  Agent Toolkit plugs in as AI SDK tools. OpenAI is the model.
- **Budget guardrail:** enforced in our own tool wrappers, not left to the prompt. The
  `createOrder` tool refuses to build an order whose total exceeds the stated budget and
  returns a structured "over budget by $X, here are swap candidates" result the agent must
  resolve before it can proceed.
- **Human-in-the-loop:** the agent may assemble and price an order autonomously, but the
  final `captureOrder` is gated behind an explicit user approval in the UI. This is both a
  safety story (PayPal's "good AI citizen" theme) and a clean demo beat.
- **Multi-merchant settlement:** a single PayPal order with one `purchase_unit` per
  merchant, each carrying its own `payee`. At capture, PayPal routes each unit's amount to
  that merchant's account — one unified checkout that really splits across sellers. (We
  chose this over the Payouts API, which PayPal disables for senders in some countries,
  e.g. India; the multi-payee order works everywhere and is the more legitimate primitive.)
  Real stores from Channel3 are mapped to our sandbox business accounts for the demo.
- **Resilience:** every external client has a typed mock fallback so the app runs and demos
  even if a sandbox key is missing. Real keys light up the real path.

### Data model (minimal)
```ts
Product   { id, title, merchant, price, currency, imageUrl, buyUrl, category, tags[] }
OutfitItem{ product, slot }                 // slot: top|bottom|shoes|accessory|outer
Outfit    { items: OutfitItem[], total, budget, currency }
Order     { id, paypalOrderId, status, outfit, payouts: Payout[] }
Payout    { merchant, amount, status, batchId }
```

---

## 5. The killer demo flow (the only flow we polish)

1. User types a brief: *"Wedding guest, outdoor autumn ceremony, earthy tones, budget $150."*
2. Agent calls `searchProducts` (Channel3) per slot, reasons about style + budget.
3. Agent proposes an outfit; UI renders the pieces in **AG Grid** with merchant, price,
  and a running total vs. budget (the **budget meter**).
4. User clicks **Approve outfit & pay with PayPal**. PayPal creates the order, opens sandbox
  approval, and captures it after approval.
5. The receipt reports the per-receiver split. Real Channel3 merchants are mapped to the
  configured sandbox business accounts for this prototype.

If every step above works in sandbox with no fake toasts, we are competitive for top-3.

---

## 6. Milestones (deadline 2026-11-12, ~19 days from kickoff 2026-10-24)

| By | Milestone |
| --- | --- |
| Day 2 | Repo scaffold runs; Channel3 search returns real products; AG Grid renders them. |
| Day 5 | Agent loop composes a budget-valid outfit end-to-end (OpenAI + tools), mock payments. |
| Day 8 | Real PayPal sandbox: createOrder → approve → capture working. |
| Day 11 | Multi-payee split order + capture working; status panel live. Core flow flawless. |
| Day 13 | Deployed on Render with a public URL; hosted demo stable. |
| Day 15 | Tier-2: APIMatic clients and/or Bryntum timeline (only if core untouched). |
| Day 17 | Polish: empty/error states, loading, copy, styling pass. |
| Day 18 | Record <3min demo video; write submission text + README run instructions. |
| Day 19 | Buffer + submit. |

---

## 7. Open items to confirm with sponsors' docs before coding each slice
- Channel3: exact search endpoint, auth header, product field names, rate limits.
- PayPal Agent Toolkit: which tools it exposes out of the box vs. what we wrap by hand
  (Payouts may need a custom tool around the Payouts v1 API).
- AG Grid: Community vs. Enterprise features we rely on (keep to Community where possible).
- Render: Node service config + env var wiring (`render.yaml`).
