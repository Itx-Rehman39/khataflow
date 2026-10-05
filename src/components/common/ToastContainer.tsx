import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useKhata } from '../../context/KhataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useKhata();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {isSuccess && <CheckCircle2 size={18} color="var(--personal-primary)" style={{ flexShrink: 0 }} />}
            {isError && <AlertTriangle size={18} color="var(--expense-primary)" style={{ flexShrink: 0 }} />}
            {!isSuccess && !isError && <Info size={18} color="var(--vault-primary)" style={{ flexShrink: 0 }} />}

            <span style={{ flex: 1, fontSize: '0.86rem', lineHeight: 1.4 }}>{toast.message}</span>

            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                padding: '2px',
              }}
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
