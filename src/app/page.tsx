import LandingClient from './LandingClient';

export default function Home() {
  return (
    <div className="bg-black">
      {/* Full screen crystal viewer - sticky so it stays while scrolling */}
      <div className="h-screen w-full sticky top-0">
        <LandingClient />
      </div>
      
      {/* Scrollable content to enable animation scrubbing */}
      <div className="relative z-10 bg-gradient-to-b from-transparent via-black/50 to-black">
        <div className="h-screen"></div>
        {/* Removed Crystal Explosion, 120 Frames, and Interactive 3D sections as requested */}
      </div>
    </div>
  );
}
