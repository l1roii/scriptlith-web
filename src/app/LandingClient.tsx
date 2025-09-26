"use client";
import dynamic from 'next/dynamic';

const CrystalViewer = dynamic(() => import('@/components/CrystalViewer'), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center"><div className="text-white text-xl">Loading 3D Crystal...</div></div>
});

export default function LandingClient() {
  return <CrystalViewer />;
}
