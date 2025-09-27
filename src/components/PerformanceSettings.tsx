'use client'

interface PerformanceSettingsProps {
  performanceMode: 'high' | 'low';
  onPerformanceModeChange: (mode: 'high' | 'low') => void;
  fps: number;
  modelPath: string;
  onModelChange: (path: string) => void;
  cameraRotation: { yaw: number; pitch: number; roll: number };
  onCameraRotationChange: (r: { yaw: number; pitch: number; roll: number }) => void;
  cameraPosition: { x: number; y: number; z: number };
  onCameraPositionChange: (p: { x: number; y: number; z: number }) => void;
}

export default function PerformanceSettings({
  performanceMode,
  onPerformanceModeChange,
  fps,
  modelPath,
  onModelChange,
  cameraRotation,
  onCameraRotationChange,
  cameraPosition,
  onCameraPositionChange
}: PerformanceSettingsProps) {
  // This array was misplaced inside the function's parameters.
  // It should be inside the function's body.
  const modelOptions = [
    { path: '/crystal_animation.glb', name: 'Full Animation (54KB)', quality: 'High' },
    { path: '/crystals_no_materials.glb', name: 'No Materials (11KB)', quality: 'Medium' },
    { path: '/crystal_simple.glb', name: 'Simple Model (1.9KB)', quality: 'Low' }
  ];

  return (
    <div className="absolute top-8 right-8 text-white z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4 w-72">
      <h4 className="text-lg font-semibold mb-3">Performance Settings</h4>

      {/* FPS Display */}
      <div className="mb-4">
        <div className="text-sm text-gray-300">FPS:
          <span className={`ml-2 font-mono ${fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            {fps}
          </span>
        </div>
      </div>

      {/* Camera Rotation Controls */}
      <div className="mb-4">
        <label className="text-sm text-gray-300 block mb-2">Camera Rotation (degrees)</label>
        <div className="flex gap-2">
          <input
            type="number"
            min={-180}
            max={180}
            value={cameraRotation.yaw}
            onChange={e => onCameraRotationChange({ ...cameraRotation, yaw: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="Yaw"
            title="Yaw (Y axis)"
          />
          <input
            type="number"
            min={-90}
            max={90}
            value={cameraRotation.pitch}
            onChange={e => onCameraRotationChange({ ...cameraRotation, pitch: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="Pitch"
            title="Pitch (X axis)"
          />
          <input
            type="number"
            min={-180}
            max={180}
            value={cameraRotation.roll}
            onChange={e => onCameraRotationChange({ ...cameraRotation, roll: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="Roll"
            title="Roll (Z axis)"
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">Yaw (Y), Pitch (X), Roll (Z)</div>
      </div>

      {/* Camera Position Controls */}
      <div className="mb-4">
        <label className="text-sm text-gray-300 block mb-2">Camera Position</label>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.5"
            value={cameraPosition.x}
            onChange={e => onCameraPositionChange({ ...cameraPosition, x: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="X"
            title="X position (left/right)"
          />
          <input
            type="number"
            step="0.5"
            value={cameraPosition.y}
            onChange={e => onCameraPositionChange({ ...cameraPosition, y: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="Y"
            title="Y position (forward/back)"
          />
          <input
            type="number"
            step="0.5"
            value={cameraPosition.z}
            onChange={e => onCameraPositionChange({ ...cameraPosition, z: Number(e.target.value) })}
            className="w-16 bg-gray-700 text-white text-xs rounded px-2 py-1"
            placeholder="Z"
            title="Z position (up/down)"
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">X (L/R), Y (F/B), Z (U/D)</div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => onCameraPositionChange({ x: 0, y: -20, z: 10 })}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
          >
            Front
          </button>
          <button
            onClick={() => onCameraPositionChange({ x: 20, y: 0, z: 10 })}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
          >
            Side
          </button>
          <button
            onClick={() => onCameraPositionChange({ x: 0, y: 0, z: 25 })}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
          >
            Top
          </button>
          <button
            onClick={() => onCameraPositionChange({ x: 15, y: -15, z: 15 })}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded"
          >
            ISO
          </button>
        </div>
      </div>

      {/* Performance Mode Toggle */}
      <div className="mb-4">
        <label className="text-sm text-gray-300 block mb-2">Performance Mode</label>
        <div className="flex gap-2">
          {(['high', 'low'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => onPerformanceModeChange(mode)}
              className={`px-3 py-1 rounded text-xs transition-colors ${
                performanceMode === mode
                  ? mode === 'high'
                    ? 'bg-green-600 text-white'
                    : 'bg-yellow-600 text-white'
                  : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
              }`}
            >
              {mode.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="mb-4">
        <label className="text-sm text-gray-300 block mb-2">Model Quality</label>
        <select
          value={modelPath}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1"
        >
          {modelOptions.map((option) => (
            <option key={option.path} value={option.path}>
              {option.name} - {option.quality}
            </option>
          ))}
        </select>
      </div>

      {/* Performance Tips */}
      <div className="text-xs text-gray-400">
        <strong>Tips for better performance:</strong>
        <ul className="mt-1 space-y-1 text-xs">
          <li>• Close other GPU-intensive apps</li>
          <li>• Use "Low" mode on older hardware</li>
          <li>• Simple model for mobile devices</li>
        </ul>
      </div>
    </div>
  );
}