import { toast } from 'react-hot-toast';
import React from 'react';

/**
 * Show a centered toast-based confirm dialog.
 * Resolves to true if confirmed, false if cancelled/dismissed.
 */
export function confirmToast({
  message = 'Are you sure?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
}) {
  return new Promise((resolve) => {
    const id = toast.custom(
      () => (
        <div className="fixed inset-0 z-[9999] top-100 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => {
              toast.dismiss(id);
              resolve(false);
            }}
            aria-hidden="true"
          />
          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            className="relative z-10 max-w-sm w-[90vw] sm:w-[24rem] rounded-lg border shadow-lg bg-white text-slate-800 p-4"
          >
            <div className="text-sm mb-3">{message}</div>
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded border border-slate-300 hover:bg-slate-100"
                onClick={() => {
                  toast.dismiss(id);
                  resolve(false);
                }}
              >
                {cancelText}
              </button>
              <button
                className="px-3 py-1.5 rounded bg-rose-500 text-white hover:opacity-90"
                onClick={() => {
                  toast.dismiss(id);
                  resolve(true);
                }}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      ),
      { id: Math.random().toString(36).slice(2), duration: Infinity, position: 'top-center' }
    );
  });
}
