"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { openCreateDialog } from "@/components/CreateItemDialog";
import { dispatchArchiveItemCreated } from "@/lib/archive-events";

export default function CaptureBar() {
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const router = useRouter();

  useEffect(() => {
    if (status === "idle") {
      return;
    }

    const timeout = window.setTimeout(() => setStatus("idle"), 2400);
    return () => window.clearTimeout(timeout);
  }, [status]);

  async function handleSave() {
    if (!value.trim() || loading) return;

    setLoading(true);
    try {
      const trimmed = value.trim();
      const type = trimmed.match(/^https?:\/\//) ? "url" : "text";
      const payload = {
        type,
        raw_url: type === "url" ? trimmed : null,
        raw_text: type === "text" ? trimmed : null,
        source: "manual",
      };

      const res = await fetch("/api/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = (await res.json()) as { id?: string };
        setValue("");
        setStatus("saved");
        if (data.id) {
          dispatchArchiveItemCreated(data.id);
        }
        return;
      }

      const error = await res.json();
      if (error.error === "limit_reached") {
        router.push(error.upgrade_url);
        return;
      }

      setStatus("error");
    } catch (err) {
      console.error("Save failed:", err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  const detectedType = value.trim().match(/^https?:\/\//) ? "Link" : "Note";

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void handleSave();
      }}
      className="rounded-modals border border-border bg-surface p-3"
    >
      <div className="group relative flex items-center gap-3 rounded-input border border-border bg-bg px-4 py-3 transition-all focus-within:border-brand focus-within:ring-1 focus-within:ring-brand-glow">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-text-muted transition-colors group-focus-within:bg-brand/10 group-focus-within:text-brand">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-text-muted">
            <span>Quick capture</span>
            {value.trim() ? (
              <span className="rounded-full bg-surface px-2 py-0.5 text-[10px] tracking-[0.12em] text-text-primary">
                {detectedType}
              </span>
            ) : null}
          </div>
          <input
            type="text"
            placeholder="Paste a link or write a note. Press Enter to save."
            className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="inline-flex items-center gap-2 rounded-buttons bg-brand px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-hover disabled:opacity-50"
        >
          Save
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-text-muted">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          {status === "saved"
            ? "Saved. Enrichment is queued in the background."
            : status === "error"
              ? "Save failed. Try again or use advanced capture."
              : "Use advanced capture for folders, reminders, tags, or bulk import."}
        </div>
        <button
          type="button"
          onClick={() => openCreateDialog()}
          className="font-medium text-brand transition hover:text-brand-hover"
        >
          Open advanced capture
        </button>
      </div>
    </form>
  );
}
