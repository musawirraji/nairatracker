import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title:       'NairaTracker',
  description: 'Track every naira. Hit your goal.',
  manifest:    '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent' },
};

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  viewportFit:  'cover',
  themeColor:   '#07070F',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body style={{
        margin: 0,
        background: '#07070F',
        color: '#EDEBE4',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        overflowX: 'hidden',
        height: '100%',
      }}>
        {children}
        <style>{`
          *, *::before, *::after { box-sizing: border-box; }
          html { height: 100%; }

          /* Spinner */
          @keyframes nt-spin { to { transform: rotate(360deg); } }

          /* Toast spring animation */
          @keyframes nt-toastup {
            from { opacity:0; transform:translateX(-50%) translateY(16px) scale(0.92); }
            to   { opacity:1; transform:translateX(-50%) translateY(0)    scale(1);    }
          }

          /* Bottom sheet slide up */
          @keyframes nt-slideup {
            from { transform: translateX(-50%) translateY(100%); }
            to   { transform: translateX(-50%) translateY(0); }
          }

          /* Scrollbar */
          ::-webkit-scrollbar { width: 3px; }
          ::-webkit-scrollbar-thumb { background: rgba(255,208,50,0.2); border-radius: 4px; }

          /* Date / number inputs */
          input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
          input[type=date]::-webkit-calendar-picker-indicator  { filter: invert(0.5); }
          input[type=month]::-webkit-calendar-picker-indicator { filter: invert(0.5); }

          /* Tap feedback — overridden per-element where needed */
          a { -webkit-tap-highlight-color: transparent; }
          button { -webkit-tap-highlight-color: transparent; }

          /* Input autofill dark mode */
          input:-webkit-autofill,
          input:-webkit-autofill:hover,
          input:-webkit-autofill:focus {
            -webkit-text-fill-color: #EDEBE4;
            -webkit-box-shadow: 0 0 0px 1000px #0D0D1A inset;
            transition: background-color 9999s ease-in-out 0s;
          }
        `}</style>
      </body>
    </html>
  );
}
