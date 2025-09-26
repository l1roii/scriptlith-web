'use client'

interface PerformanceSettingsProps {
  performanceMode: 'high' | 'low';
  onPerformanceModeChange: (mode: 'high' | 'low') => void;
  fps: number;
  modelPath: string;
  onModelChange: (path: string) => void;
}

export default function PerformanceSettings({
  performanceMode,
  onPerformanceModeChange,
  fps,
  modelPath,
  onModelChange
}: PerformanceSettingsProps) {
  const modelOptions = [
    { path: '/crystal_animation.glb', name: 'Full Animation (54KB)', quality: 'High' },
    { path: '/crystals_no_materials.glb', name: 'No Materials (11KB)', quality: 'Medium' },
    { path: '/crystal_simple.glb', name: 'Simple Model (1.9KB)', quality: 'Low' }
  ];

  return (
    <div className="absolute top-8 right-8 text-white z-10 bg-black/50 backdrop-blur-sm rounded-lg p-4">
      <h4 className="text-lg font-semibold mb-3">Performance Settings</h4>
      
      {/* FPS Display */}
      <div className="mb-4">
        <div className="text-sm text-gray-300">FPS: 
          <span className={`ml-2 font-mono ${fps < 30 ? 'text-red-400' : fps < 50 ? 'text-yellow-400' : 'text-green-400'}`}>
            {fps}
          </span>
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