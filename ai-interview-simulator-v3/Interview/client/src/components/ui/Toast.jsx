import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'rgba(13, 20, 36, 0.95)',
          color: '#E2E8F0',
          border: '1px solid rgba(56, 189, 248, 0.15)',
          borderRadius: '12px',
          backdropFilter: 'blur(20px)',
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '14px',
          padding: '12px 16px',
        },
        success: {
          iconTheme: { primary: '#34D399', secondary: '#030409' },
        },
        error: {
          iconTheme: { primary: '#F87171', secondary: '#030409' },
        },
      }}
    />
  );
}
