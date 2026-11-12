# Claro demo video

Target length: 2:20-2:45. Upload the final video to YouTube as Public.

## Recording setup

- Use a clean browser window at the hosted Render URL or `http://localhost:3000`.
- Record at 1080p if possible. Keep the browser zoom at 100%.
- Use a wired or quiet microphone and record narration separately if the live demo is slow.
- Do not show API keys, `.env.local`, browser bookmarks, personal PayPal data, or unrelated tabs.
- Use the mock catalog only if the real Channel3 path is unreliable; use PayPal sandbox for the payment beat.

## Shot list and narration

### 0:00-0:15 - The problem

Show the Claro landing screen and the chat input.

Say:

> Shopping for an outfit across multiple stores means multiple tabs, multiple carts, and a lot of mental math. Claro is an AI stylist with a wallet: it finds the full look, keeps it inside a hard budget, and checks out across stores in one PayPal payment.

### 0:15-0:30 - Give the agent a brief

Enter this exact prompt, then submit it:

> Garden wedding guest, warm neutrals, under $150. Find a complete look with a top, bottom, shoes, and one accessory.

While the agent is working, say:

> I give Claro the occasion, the style direction, and the budget. The agent searches across merchants through Channel3 instead of making me shop one store at a time.

### 0:30-1:15 - Discovery and composition

Let the product results and the final look appear. Scroll only enough to keep the current result in frame.

Say:

> Claro is now comparing candidates for each part of the outfit. It is not just recommending a single item: it is composing a complete look and checking the total against the budget in code.

Pause on the outfit showcase. Point out the piece count, total, budget meter, and different merchants.

> Here we have four pieces from multiple stores. The total is visible, the budget meter is live, and the review table makes every item, store, and price inspectable before any money moves.

### 1:15-1:35 - Human approval

Click **Approve outfit & pay with PayPal**.

Say:

> This is the safety boundary. The agent can search, compose, and price autonomously, but it cannot capture payment without my explicit approval.

### 1:35-2:15 - PayPal checkout

Click the PayPal button and complete the PayPal sandbox approval with the prepared buyer account. Keep the PayPal approval screen visible long enough to make the handoff clear.

Say:

> Claro creates one PayPal Orders v2 checkout. Under the hood, the server creates one purchase unit per merchant, so the buyer gets one checkout while each sandbox seller receives its own share.

After capture, hold on the success state and the split amounts.

> Payment is now captured, and Claro reports the split by receiver. The point is not a PayPal button added at the end: PayPal is the transaction layer that lets the agent complete the job it started.

### 2:15-2:35 - Close

Show the receipt and, if useful, briefly show the product grid again.

Say:

> Claro turns “help me find something to wear” into a finished, budget-aware purchase. It combines AI styling, cross-store discovery, and agentic PayPal commerce while keeping the final payment under human control.

## Backup plan

If PayPal sandbox approval is slow, do not wait silently. Cut from the PayPal button to a short title card reading “One approval. One checkout. Multiple merchant receivers,” then resume on the captured receipt. The final upload must still show the working capture result somewhere in the video.

If the AI response is slow, pre-record the first run or use a prepared browser tab. Do not narrate a loading spinner for more than 8 seconds.

## Final checklist

- [ ] Runtime is under 3 minutes.
- [ ] The video shows the project functioning on the device used to build it.
- [ ] The AI brief, product discovery, budget guardrail, review table, approval gate, PayPal approval, capture, and receiver split are all shown.
- [ ] PayPal and AI are named verbally, not only visible in the interface.
- [ ] The YouTube visibility is Public and the link is tested in an incognito window.
- [ ] No copyrighted music, private credentials, or personal account information is visible.