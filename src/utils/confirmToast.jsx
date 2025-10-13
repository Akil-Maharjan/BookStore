import { toast } from "react-hot-toast";
import React from "react";

/**
 * Show a centered toast-based confirm dialog.
 * Resolves to true if confirmed, false if cancelled/dismissed.
 */
export function confirmToast({
  message = "Are you sure?",
  confirmText = "Yes",
  cancelText = "No",
} = {}) {
  return new Promise((resolve) => {
    const finalize = (result) => {
      toast.dismiss(id);
      setTimeout(() => toast.remove(id), 0);
      resolve(result);
    };

    const id = toast.custom(
      () => (
        <div className="fixed inset-0 z-[9999] top-100 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => finalize(false)}
            aria-hidden="true"
          />
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-w-sm w-[90vw] sm:w-[24rem] rounded-lg border shadow-lg bg-slate-900 text-white p-4"
          >
            <div className="text-sm mb-3">{message}</div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded border cursor-pointer border-slate-300 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => finalize(false)}
              >
                {cancelText}
              </button>
              <button
                className="px-3 py-1.5 rounded bg-rose-500 cursor-pointer text-white hover:opacity-90"
                onClick={() => finalize(true)}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        position: "top-center",
      }
    );
  });
}
