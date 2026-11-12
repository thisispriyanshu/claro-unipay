"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import ReactMarkdown from "react-markdown";
import ProductRow from "./ProductRow";
import OutfitShowcase from "./OutfitShowcase";
import type { ShopProduct } from "@/lib/shop";
import type { ClientOutfit } from "@/lib/outfit";

const SUGGESTIONS = [
  "Garden wedding guest, warm neutrals, $400",
  "Weekend brunch, effortless, under $150",
  "Office-to-dinner, smart casual, $300",
];

export default function StylistChat() {
  const { messages, input, handleInputChange, handleSubmit, append, reload, status, error } = useChat({
    api: "/api/agent",
  });
  const busy = status === "submitted" || status === "streaming";
  const [timedOut, setTimedOut] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container) return;
    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 180) {
      endRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, busy]);

  useEffect(() => {
    if (!busy) {
      setTimedOut(false);
      return;
    }
    const timer = window.setTimeout(() => setTimedOut(true), 45_000);
    return () => window.clearTimeout(timer);
  }, [busy]);

  return (
    <div className="flex h-full flex-col">
      <div ref={messagesRef} className="min-h-0 flex-1 space-y-5 overflow-y-auto px-1 pb-4">
        {messages.length === 0 && (
          <div className="animate-in pt-6">
            <p className="font-serif text-2xl leading-snug text-ink">
              Hi, I&apos;m Claro. Tell me the occasion —
              <br />
              I&apos;ll pull the whole look together.
            </p>
            <p className="mt-2 text-sm text-muted">
              I shop across every store and check you out in one payment.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => append({ role: "user", content: s })}
                  className="rounded-full border border-line bg-white px-3.5 py-2 text-sm text-cocoa shadow-sm transition hover:border-clay hover:text-clay"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className="animate-in space-y-3">
            {m.role === "user" ? (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-ink px-4 py-2.5 text-sm text-cream">
                  {textOf(m)}
                </div>
              </div>
            ) : (
              <StylistTurn parts={m.parts} content={m.content} />
            )}
          </div>
        ))}

        {busy && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="inline-flex gap-1">
              <Dot /> <Dot style={{ animationDelay: "0.15s" }} /> <Dot style={{ animationDelay: "0.3s" }} />
            </span>
            styling…
          </div>
        )}
        {(error || timedOut) && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <p>{error?.message ?? "Claro is taking longer than expected."}</p>
            <button
              type="button"
              onClick={() => {
                setTimedOut(false);
                reload();
              }}
              className="mt-2 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 flex gap-2 border-t border-line bg-cream/90 pt-3 backdrop-blur"
      >
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Describe the occasion, vibe, and budget…"
          className="flex-1 rounded-full border border-line bg-white px-4 py-3 text-sm text-ink shadow-sm outline-none placeholder:text-muted focus:border-clay"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-clay px-5 py-3 text-sm font-semibold text-cream transition hover:bg-clayDark disabled:opacity-50"
        >
          Style me
        </button>
      </form>
    </div>
  );
}

function StylistTurn({ parts, content }: { parts: any[] | undefined; content: string }) {
  if (!parts) {
    return content ? <MarkdownBubble content={content} /> : null;
  }
  let outfitPresented = false;

  return (
    <>
      {parts.map((part, i) => {
        if (part.type === "text" && part.text.trim()) {
          if (outfitPresented) return null;
          return <MarkdownBubble key={i} content={part.text} />;
        }
        if (part.type === "tool-invocation" && part.toolInvocation?.state === "result") {
          const { toolName, result } = part.toolInvocation;
          if (toolName === "search_products" && result?.products?.length) {
            return <ProductRow key={i} products={result.products as ShopProduct[]} />;
          }
          if (toolName === "present_outfit" && result?.items) {
            outfitPresented = true;
            return <OutfitShowcase key={i} outfit={result as ClientOutfit} />;
          }
        }
        return null;
      })}
    </>
  );
}

function Bubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[90%] rounded-2xl rounded-bl-sm bg-white px-4 py-2.5 text-sm leading-relaxed text-ink shadow-card">
      {children}
    </div>
  );
}

function MarkdownBubble({ content }: { content: string }) {
  return (
    <Bubble>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
          ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
          strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noreferrer" className="text-clay underline underline-offset-2">
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Bubble>
  );
}

function Dot({ style }: { style?: React.CSSProperties }) {
  return (
    <span
      className="inline-block h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
      style={style}
    />
  );
}

function textOf(m: { parts?: any[]; content: string }): string {
  if (m.parts) return m.parts.filter((p) => p.type === "text").map((p) => p.text).join(" ");
  return m.content;
}
