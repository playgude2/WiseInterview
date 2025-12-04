import React from "react";

interface ProgressProps {
  value: number;
  maxValue?: number;
  label?: string;
  color?: string;
}

// 0. Modern Score Gauge (Default)
export function ModernScoreGauge({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }} className="drop-shadow-md">
          {/* Background */}
          <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="6" fill="none" />
          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={barColor}
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: barColor }}>{Math.round(value)}</div>
          {maxValue !== 100 && <div className="text-xs text-gray-600">/{maxValue}</div>}
        </div>
      </div>
      {label && <p className="font-medium text-sm text-center">{label}</p>}
    </div>
  );
}

// 1. Linear Progress Bar
export function LinearProgressBar({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = Math.min(Math.max((value / (maxValue || 1)) * 100, 0), 100);
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <p className="font-medium text-sm">{label}</p>
        <span className="text-sm font-semibold" style={{ color: barColor }}>{Math.round(value)}/{maxValue}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// 2. Animated Progress Pill
export function ProgressPill({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col gap-3 p-4 rounded-full bg-gray-50 border" style={{ borderColor: barColor + "40" }}>
      <div className="flex justify-between items-center px-2">
        <p className="font-semibold" style={{ color: barColor }}>{label}</p>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold" style={{ color: barColor }}>{Math.round(value)}</span>
          <span className="text-sm" style={{ color: barColor }}>/{maxValue}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mx-2">
        <div
          className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${percentage}%`, backgroundColor: barColor }}
        />
      </div>
    </div>
  );
}

// 3. Bullet Graph
export function BulletGraph({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="font-medium text-sm">{label}</p>
        <span className="text-sm font-bold" style={{ color: barColor }}>{value}</span>
      </div>
      <div className="flex h-8 gap-0 rounded-sm overflow-hidden shadow-md">
        <div className="flex-1 bg-red-200" title="Poor" />
        <div className="flex-1 bg-yellow-200" title="Satisfactory" />
        <div className="flex-1 bg-green-200" title="Good" />
        <div className="w-1" style={{ backgroundColor: barColor, left: `${percentage}%` }} title="Current value" />
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span>0</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

// 4. Segmented/Stacked Progress
export function SegmentedProgress({ value, maxValue = 100, label, color }: ProgressProps) {
  const segments = 10;
  const filledSegments = Math.round((value / maxValue) * segments);
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <p className="font-medium text-sm">{label}</p>
        <span className="text-sm font-bold" style={{ color: barColor }}>{value}/{maxValue}</span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, index) => (
          <div
            key={index}
            className="flex-1 h-4 rounded transition-all duration-300"
            style={{ backgroundColor: index < filledSegments ? barColor : "#E5E7EB" }}
          />
        ))}
      </div>
    </div>
  );
}

// 5. Donut Chart Variant
export function DonutProgress({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-32 h-32">
        <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }} className="drop-shadow-md">
          {/* Background */}
          <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="12" fill="none" />
          {/* Progress */}
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke={barColor}
            strokeWidth="12"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold" style={{ color: barColor }}>{Math.round(value)}</div>
          <div className="text-xs text-gray-600">/{maxValue}</div>
        </div>
      </div>
      <p className="font-medium text-sm text-center">{label}</p>
    </div>
  );
}

// 6. Radial Bar (Semi-Circle)
export function RadialBar({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-40 h-24">
        <svg width="160" height="120" viewBox="0 0 160 120" className="drop-shadow-md">
          {/* Background arc */}
          <path
            d="M 20 100 A 60 60 0 0 1 140 100"
            stroke="#E5E7EB"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 100 A 60 60 0 0 1 140 100"
            stroke={barColor}
            strokeWidth="8"
            fill="none"
            strokeDasharray={Math.PI * 120}
            strokeDashoffset={Math.PI * 120 * (1 - percentage / 100)}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute bottom-2 left-0 right-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold" style={{ color: barColor }}>{Math.round(value)}</div>
          <div className="text-xs text-gray-600">/{maxValue}</div>
        </div>
      </div>
      <p className="font-medium text-sm text-center">{label}</p>
    </div>
  );
}

// 7. Wave Progress
export function WaveProgress({ value, maxValue = 100, label, color }: ProgressProps) {
  const percentage = (value / maxValue) * 100;
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col gap-3 items-center">
      <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-50 border-4 shadow-lg" style={{ borderColor: barColor + "40" }}>
        <div
          className="absolute bottom-0 w-full transition-all duration-500"
          style={{ height: `${percentage}%`, backgroundColor: barColor }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold" style={{ color: barColor }}>{Math.round(value)}</div>
            <div className="text-xs text-gray-600">/{maxValue}</div>
          </div>
        </div>
      </div>
      <p className="font-medium text-sm text-center">{label}</p>
    </div>
  );
}

// 8. Minimalist Badge
export function MinimalistBadge({ value, maxValue = 100, label, color }: ProgressProps) {
  const barColor = color || "#4F46E5";

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="flex items-center justify-center w-28 h-28 rounded-2xl shadow-lg"
        style={{ backgroundColor: barColor }}
      >
        <div className="text-center">
          <div className="text-4xl font-bold text-white">{Math.round(value)}</div>
          <div className="text-xs text-white/80">out of {maxValue}</div>
        </div>
      </div>
      <p className="font-medium text-sm text-center" style={{ color: barColor }}>{label}</p>
    </div>
  );
}
