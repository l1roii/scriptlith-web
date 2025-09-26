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
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-8">
            <h2 className="text-4xl font-bold mb-6">Crystal Explosion</h2>
            <p className="text-xl text-gray-300">
              Scroll to see the crystal break apart into individual shards
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-8">
            <h2 className="text-4xl font-bold mb-6">120 Frames</h2>
            <p className="text-xl text-gray-300">
              Each scroll position corresponds to a frame in your Blender animation
            </p>
          </div>
        </div>
        <div className="h-screen flex items-center justify-center">
          <div className="text-center text-white max-w-2xl px-8">
            <h2 className="text-4xl font-bold mb-6">Interactive 3D</h2>
            <p className="text-xl text-gray-300">
              Drag to rotate • Zoom with mouse wheel • Animation controlled by scroll
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
