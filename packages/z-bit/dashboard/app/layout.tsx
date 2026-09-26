import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Prism-BTC Mining Telemetry Dashboard',
  description: 'Real-time dark sleek telemetry dashboard for the prism-btc formal verification-gated mining pipeline with Lean 4 PilotGate proof inspection, substrate dispatcher metrics, thermal monitoring, and live WORM audit trail.',
  openGraph: {
    title: 'Prism-BTC Mining Telemetry Dashboard',
    description: 'Real-time dark sleek telemetry dashboard for the prism-btc formal verification-gated mining pipeline with Lean 4 PilotGate proof inspection, substrate dispatcher metrics, thermal monitoring, and live WORM audit trail.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prism-BTC Mining Telemetry Dashboard',
    description: 'Real-time dark sleek telemetry dashboard for the prism-btc formal verification-gated mining pipeline with Lean 4 PilotGate proof inspection, substrate dispatcher metrics, thermal monitoring, and live WORM audit trail.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0A0A] text-zinc-100 antialiased min-h-screen selection:bg-zinc-800 selection:text-zinc-100" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
