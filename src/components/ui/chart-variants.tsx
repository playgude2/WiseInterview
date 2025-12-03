"use client";

import React from "react";

// Types for different chart data structures
interface CategoryDataItem {
  id: number;
  label: string;
  value: number;
  color: string;
}

interface NumericChartProps {
  value: number;
  maxValue?: number;
  label: string;
  percentage?: number;
  unit?: string;
}

interface CategoryChartProps {
  data: CategoryDataItem[];
  label: string;
  width?: number;
  height?: number;
}

// ==================== CATEGORICAL CHARTS (for Sentiment & Status) ====================

// 1. Pie Chart Variant
export function PieChartVariant({ data, label }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center justify-center w-24 h-24 rounded-full border-8 border-gray-200" style={{ background: `conic-gradient(${data.map((item) => `${item.color} 0deg ${(item.value / total) * 360}deg`).join(', ')})` }} />
        <div className="flex flex-col gap-1 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 2. Donut Chart Variant
export function DonutChartVariant({ data, label }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex items-center justify-center gap-4">
        <div className="relative w-24 h-24 rounded-full" style={{ background: `conic-gradient(${data.map((item) => `${item.color} 0deg ${(item.value / total) * 360}deg`).join(', ')})` }}>
          <div className="absolute inset-0 rounded-full m-auto w-16 h-16 bg-white" />
        </div>
        <div className="flex flex-col gap-1 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 3. Horizontal Bar Chart Variant
export function BarChartVariant({ data, label }: CategoryChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex flex-col gap-2 w-full">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;

          return (
            <div key={index} className="flex items-center gap-2">
              <span className="text-xs font-medium w-20 truncate">{item.label.split("(")[0].trim()}</span>
              <div className="flex-1 h-6 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
              <span className="text-xs font-semibold w-8 text-right">{item.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 4. Stacked Bar Chart Variant
export function StackedBarChartVariant({ data, label }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex h-8 gap-0 rounded-lg overflow-hidden shadow-md">
          {data.map((item, index) => {
            const percentage = (item.value / total) * 100;

            return (
              <div
                key={index}
                className="flex items-center justify-center text-xs font-bold text-white"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                  minWidth: "30px",
                }}
                title={item.label}
              >
                {item.value > 0 && percentage > 15 && item.value}
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 flex-wrap">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.label.split("(")[0].trim()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 5. Vertical Bar Chart Variant
export function VerticalBarChartVariant({ data, label }: CategoryChartProps) {
  const maxValue = Math.max(...data.map((item) => item.value));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex items-end justify-center gap-2 h-32">
        {data.map((item, index) => {
          const percentage = (item.value / (maxValue || 1)) * 100;

          return (
            <div key={index} className="flex flex-col items-center gap-1">
              <span className="text-xs font-semibold">{item.value}</span>
              <div
                className="w-8 rounded-t-md transition-all duration-500"
                style={{
                  height: `${percentage}%`,
                  backgroundColor: item.color,
                  minHeight: "4px",
                }}
                title={item.label}
              />
              <span className="text-xs font-medium text-center max-w-[50px] truncate">{item.label.split("(")[0].trim()}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 6. Radial Chart Variant
export function RadialChartVariant({ data, label }: CategoryChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const angleSlice = 360 / data.length;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-2 text-[15px] font-bold mx-auto">
        {label}
      </div>
      <div className="flex items-center justify-center gap-4">
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <circle cx="60" cy="60" r="35" fill="none" stroke="#e5e7eb" strokeWidth="1" />
          <circle cx="60" cy="60" r="20" fill="none" stroke="#e5e7eb" strokeWidth="1" />

          {data.map((item, index) => {
            const maxRadius = 50;
            const radius = (item.value / (Math.max(...data.map((d) => d.value)) || 1)) * maxRadius;
            const angle = (index * angleSlice - 90) * (Math.PI / 180);
            const x = 60 + radius * Math.cos(angle);
            const y = 60 + radius * Math.sin(angle);

            return (
              <g key={index}>
                <line x1="60" y1="60" x2={x} y2={y} stroke={item.color} strokeWidth="2" />
                <circle cx={x} cy={y} r="3" fill={item.color} />
              </g>
            );
          })}
        </svg>
        <div className="flex flex-col gap-1 text-sm">
          {data.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==================== NUMERIC CHARTS (for Duration & Completion Rate) ====================

// 7. Gauge Chart for Numeric Values
export function NumericGaugeChart({ value, maxValue = 100, label, percentage, unit }: NumericChartProps) {
  const displayValue = percentage !== undefined ? percentage : value;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - ((displayValue / (maxValue || 1)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-semibold text-sm text-center">{label}</p>
      <div className="relative w-32 h-32">
        <svg width="128" height="128" style={{ transform: "rotate(-90deg)" }} className="drop-shadow-md">
          <defs>
            <linearGradient id="numeric-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#4F46E5" />
            </linearGradient>
          </defs>
          <circle cx="64" cy="64" r="45" stroke="#E5E7EB" strokeWidth="6" fill="none" />
          <circle
            cx="64"
            cy="64"
            r="45"
            stroke="url(#numeric-gradient)"
            strokeWidth="6"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease-in-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-bold text-indigo-600">{displayValue}</div>
          {unit && <div className="text-xs text-gray-600">{unit}</div>}
        </div>
      </div>
    </div>
  );
}

// 8. Linear Progress for Numeric Values
export function NumericLinearChart({ value, maxValue = 100, label, percentage, unit }: NumericChartProps) {
  const displayValue = percentage !== undefined ? percentage : value;
  const displayPercentage = percentage !== undefined ? percentage : (value / (maxValue || 1)) * 100;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex justify-between items-center">
        <p className="font-medium text-sm">{label}</p>
        <span className="text-sm font-semibold text-indigo-600">
          {displayValue}
          {unit && <span> {unit}</span>}
        </span>
      </div>
      <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-500"
          style={{ width: `${Math.min(displayPercentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

// 9. Badge Display for Numeric Values
export function NumericBadgeChart({ value, maxValue = 100, label, percentage, unit }: NumericChartProps) {
  const displayValue = percentage !== undefined ? percentage : value;
  const getColor = () => {
    if (displayValue < 33) {
      return "from-red-400 to-red-600";
    }
    if (displayValue < 66) {
      return "from-yellow-400 to-yellow-600";
    }

    return "from-green-400 to-green-600";
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <p className="font-semibold text-sm text-center">{label}</p>
      <div className={`flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${getColor()} shadow-lg`}>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{displayValue}</div>
          {unit && <div className="text-xs text-white/80">{unit}</div>}
        </div>
      </div>
    </div>
  );
}

// 10. Simple Metric Card
export function NumericMetricCard({ value, maxValue = 100, label, percentage, unit }: NumericChartProps) {
  const displayValue = percentage !== undefined ? percentage : value;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center justify-center gap-1 font-semibold mb-1 text-[15px]">
        {label}
      </div>
      <div className="flex items-center justify-center">
        <p className="text-2xl font-semibold text-indigo-600 w-fit p-2 px-3 bg-indigo-100 rounded-md">
          {displayValue}
          {unit && <span className="ml-1">{unit}</span>}
        </p>
      </div>
    </div>
  );
}
