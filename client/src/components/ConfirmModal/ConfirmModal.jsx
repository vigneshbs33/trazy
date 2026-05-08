import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ConfirmModal({ intent, onConfirm, onEdit }) {
  if (!intent) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-trazy-bg/80 backdrop-blur-sm"
          onClick={onEdit}
          aria-hidden="true"
        />

        {/* Modal card */}
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 260 }}
          className="relative w-full max-w-md glass-panel rounded-2xl shadow-2xl p-6"
        >
          <h2
            id="confirm-modal-title"
            className="text-xl font-display font-semibold text-white mb-5"
          >
            Trazy understood this:
          </h2>

          <ul className="space-y-3 mb-6" aria-label="Parsed trip details">
            {(intent.travelers || []).map((t, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span aria-hidden="true" className="text-xl mt-0.5">{t.hasCar ? '🚗' : '👤'}</span>
                <div>
                  <p className="text-xs text-trazy-muted uppercase tracking-wide">
                    {t.hasCar ? 'Driver' : 'Passenger'}
                  </p>
                  <p className="text-sm font-medium text-white">
                    {t.name}{' '}
                    <span className="text-trazy-muted font-normal">({t.location})</span>
                  </p>
                </div>
              </li>
            ))}

            <li className="flex items-start gap-3 pt-4 border-t border-white/10">
              <span aria-hidden="true" className="text-xl mt-0.5">📍</span>
              <div>
                <p className="text-xs text-trazy-muted uppercase tracking-wide">Going to</p>
                <p className="text-sm font-medium text-white">{intent.destination}</p>
                {intent.city && (
                  <p className="text-xs text-trazy-muted">{intent.city}</p>
                )}
              </div>
            </li>
          </ul>

          <div className="flex gap-3">
            <button
              onClick={onEdit}
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-white/5 hover:bg-white/10 text-white transition-colors focus-ring"
            >
              Edit
            </button>
            <button
              onClick={onConfirm}
              data-testid="confirm-button"
              className="flex-1 py-3 rounded-xl text-sm font-medium bg-trazy-accent hover:bg-trazy-accentHover text-trazy-bg font-semibold transition-colors focus-ring"
            >
              Confirm &amp; Optimize →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
