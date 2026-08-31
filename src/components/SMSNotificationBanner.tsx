import React, { useState, useEffect } from 'react';
import { MessageSquare, Smartphone, X } from 'lucide-react';

interface SMSMessage {
  toMobile: string;
  message: string;
  recipientName: string;
  timestamp: string;
}

export const SMSNotificationBanner: React.FC = () => {
  const [activeSMS, setActiveSMS] = useState<SMSMessage | null>(null);

  useEffect(() => {
    const handleSMS = (event: Event) => {
      const customEvt = event as CustomEvent<SMSMessage>;
      if (customEvt.detail) {
        setActiveSMS(customEvt.detail);
        // Auto dismiss after 6 seconds
        setTimeout(() => {
          setActiveSMS(null);
        }, 7000);
      }
    };

    window.addEventListener('trisakay_sms_sent', handleSMS);
    return () => window.removeEventListener('trisakay_sms_sent', handleSMS);
  }, []);

  if (!activeSMS) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '50px',
      right: '20px',
      zIndex: 9999,
      maxWidth: '380px',
      width: '90%',
      background: '#0f172a',
      color: '#ffffff',
      borderRadius: '16px',
      padding: '16px',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
      border: '2px solid #eab308',
      animation: 'bounce-subtle 0.5s ease-out'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ background: '#eab308', color: '#052e16', padding: '6px', borderRadius: '8px' }}>
            <MessageSquare size={16} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#fef08a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              CELLULAR SMS RECEIVED (NO DATA NEEDED)
            </span>
            <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>
              To: {activeSMS.recipientName} ({activeSMS.toMobile})
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveSMS(null)}
          style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '10px 12px',
        borderRadius: '10px',
        fontSize: '0.85rem',
        lineHeight: 1.4,
        color: '#f8fafc',
        fontFamily: 'monospace'
      }}>
        <Smartphone size={14} style={{ display: 'inline', marginRight: '6px', color: '#16a34a' }} />
        {activeSMS.message}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', fontSize: '0.7rem', color: '#94a3b8' }}>
        <span>Network: GSM Cellular Text Message</span>
        <span>{activeSMS.timestamp}</span>
      </div>
    </div>
  );
};
