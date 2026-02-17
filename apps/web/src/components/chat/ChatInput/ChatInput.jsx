/**
 * ChatInput Component — The "Cockpit"
 *
 * Anchored command center at the bottom of the chat.
 * Features:
 * - Max-width container with border and rounded corners
 * - Dedicated Send button with hover states
 * - Auto-resizing textarea
 */

import { useRef, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import clsx from "clsx";

export default function ChatInput({
  value,
  onChange,
  onSubmit,
  onCancel,
  isLoading,
  disabled,
}) {
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };

  const canSubmit = value.trim() && !isLoading && !disabled;

  return (
    <div className="w-full pb-6 px-4 pt-2 bg-zinc-950">
      <div className="max-w-3xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className={clsx(
            "relative flex flex-col gap-2 rounded-xl border p-3 transition-all duration-200",
            "bg-zinc-900",
            disabled
              ? "border-zinc-800 opacity-60"
              : "border-zinc-800 focus-within:border-zinc-700",
          )}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              disabled ? "Set your API key to start..." : "Ask anything..."
            }
            disabled={isLoading || disabled}
            className="w-full bg-transparent text-zinc-100 placeholder-zinc-500
                       resize-none outline-none text-base min-h-[40px] max-h-[200px]
                       disabled:cursor-not-allowed transition-opacity duration-200"
            rows={1}
          />

          <div className="flex items-center justify-end pt-2">
            {/* Action Button */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline-block">
                {isLoading ? "Generating..." : "Return to send"}
              </span>

              {isLoading && onCancel ? (
                <button
                  type="button"
                  onClick={() => onCancel()}
                  className="p-2 bg-zinc-800 text-zinc-100 hover:bg-zinc-700 rounded-lg
                             transition-all duration-150 active:scale-90"
                  title="Stop generating"
                >
                  <Square size={16} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!canSubmit}
                  className={clsx(
                    "p-2 rounded-lg transition-all duration-150",
                    canSubmit
                      ? "bg-zinc-100 text-zinc-900 hover:bg-white active:scale-90"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
                  )}
                  title="Send message"
                >
                  <ArrowUp size={18} />
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

