"use client";

import { FormEvent, useState } from "react";
import { Bot, Send, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { TranscriptMessage } from "@/lib/realtime/history";

type ConversationPanelProps = {
  messages: TranscriptMessage[];
  canSend: boolean;
  onSend: (message: string) => boolean;
};

export function ConversationPanel({
  messages,
  canSend,
  onSend,
}: ConversationPanelProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const message = draft.trim();
    if (!message || !onSend(message)) {
      return;
    }
    setDraft("");
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col" aria-label="Conversation">
      <div className="border-b px-5 py-4">
        <p className="text-sm font-semibold">Conversation</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Voice and text share one agent session.
        </p>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-5 p-5">
          {messages.map((message) => {
            const isAssistant = message.role === "assistant";
            return (
              <article
                key={message.id}
                className={cn(
                  "flex gap-3",
                  !isAssistant && "flex-row-reverse",
                )}
              >
                <div className="grid size-8 shrink-0 place-items-center rounded-full border bg-muted">
                  {isAssistant ? (
                    <Bot className="size-4" aria-hidden="true" />
                  ) : (
                    <UserRound className="size-4" aria-hidden="true" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-6",
                    isAssistant
                      ? "rounded-tl-sm bg-muted"
                      : "rounded-tr-sm bg-primary text-primary-foreground",
                  )}
                >
                  {message.text}
                </div>
              </article>
            );
          })}
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={
              canSend ? "Type a fallback message…" : "Start voice to enable chat…"
            }
            disabled={!canSend}
            className="min-h-11 resize-none"
            aria-label="Message the YouTube Growth Agent"
          />
          <Button
            type="submit"
            size="icon"
            disabled={!canSend || !draft.trim()}
            aria-label="Send message"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </section>
  );
}
