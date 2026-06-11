'use client';

import React from 'react';

// 1. Line Chart Component
export function SVGLineChart({
  data,
  labels,
  title,
  gradientColor = '#3b82f6',
  height = 200
}: {
  data: number[];
  labels: string[];
  title: string;
  gradientColor?: string;
  height?: number;
}) {
  const max = Math.max(...data, 10) * 1.1;
  const min = 0;
  const padding = 40;
  const chartHeight = height - padding * 2;
  
  // Calculate points
  const points = data.map((val, idx) => {
    const x = padding + (idx * (400 - padding * 2)) / (data.length - 1);
    const y = height - padding - ((val - min) * chartHeight) / (max - min);
    return { x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z` 
    : '';

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <h4 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 sm:mb-4">{title}</h4>
      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <div className="relative min-w-[300px]" style={{ height }}>
          <svg viewBox={`0 0 400 ${height}`} className="h-full w-full max-w-none overflow-visible">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={gradientColor} stopOpacity="0.3" />
              <stop offset="100%" stopColor={gradientColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            const val = Math.round(max - ratio * (max - min));
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={padding}
                  y1={y}
                  x2={400 - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area under line */}
          {areaD && (
            <path d={areaD} fill="url(#chartGradient)" />
          )}

          {/* Line path */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={gradientColor}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke={gradientColor}
                strokeWidth="2.5"
                className="transition-all duration-200 hover:r-6"
              />
              {/* Tooltip */}
              <rect
                x={p.x - 20}
                y={p.y - 28}
                width="40"
                height="18"
                rx="4"
                className="fill-slate-800 dark:fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              />
              <text
                x={p.x}
                y={p.y - 16}
                textAnchor="middle"
                fontSize="9"
                className="fill-white font-bold opacity-0 group-hover:opacity-100 font-mono pointer-events-none"
              >
                {data[idx]}
              </text>
            </g>
          ))}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={height - 12}
              textAnchor="middle"
              fontSize="9"
              className="fill-slate-400 dark:fill-slate-500 font-medium"
            >
              {labels[idx]}
            </text>
          ))}
        </svg>
        </div>
      </div>
    </div>
  );
}

// 2. Bar Chart Component
export function SVGBarChart({
  data,
  labels,
  title,
  barColor = '#3b82f6',
  height = 200
}: {
  data: number[];
  labels: string[];
  title: string;
  barColor?: string;
  height?: number;
}) {
  const max = Math.max(...data, 10) * 1.1;
  const min = 0;
  const padding = 40;
  const chartHeight = height - padding * 2;
  
  const barWidth = Math.min(30, (400 - padding * 2) / data.length - 12);
  const step = (400 - padding * 2) / data.length;

  return (
    <div className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <h4 className="mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400 sm:mb-4">{title}</h4>
      <div className="w-full min-w-0 overflow-x-auto overscroll-x-contain">
        <div className="relative min-w-[300px]" style={{ height }}>
        <svg viewBox={`0 0 400 ${height}`} className="h-full w-full max-w-none overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = padding + ratio * chartHeight;
            const val = Math.round(max - ratio * (max - min));
            return (
              <g key={idx} className="opacity-40">
                <line
                  x1={padding}
                  y1={y}
                  x2={400 - padding}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  className="text-slate-200 dark:text-slate-800"
                />
                <text
                  x={padding - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  className="fill-slate-400 dark:fill-slate-500 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((val, idx) => {
            const x = padding + idx * step + (step - barWidth) / 2;
            const barHeight = ((val - min) * chartHeight) / (max - min);
            const y = height - padding - barHeight;

            return (
              <g key={idx} className="group cursor-pointer">
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={Math.max(barHeight, 2)}
                  rx="4"
                  fill={barColor}
                  className="opacity-85 hover:opacity-100 transition-opacity duration-200"
                />
                {/* Value tooltip */}
                <rect
                  x={x + barWidth / 2 - 18}
                  y={y - 24}
                  width="36"
                  height="16"
                  rx="3"
                  className="fill-slate-800 dark:fill-slate-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
                <text
                  x={x + barWidth / 2}
                  y={y - 13}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-white font-bold opacity-0 group-hover:opacity-100 font-mono pointer-events-none"
                >
                  {val}
                </text>
                
                {/* X Axis Label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 12}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-slate-400 dark:fill-slate-500 font-medium"
                >
                  {labels[idx]}
                </text>
              </g>
            );
          })}
        </svg>
        </div>
      </div>
    </div>
  );
}

// 3. Donut Chart Component
export function SVGDonutChart({
  data,
  labels,
  colors,
  title
}: {
  data: number[];
  labels: string[];
  colors: string[];
  title: string;
}) {
  const total = data.reduce((a, b) => a + b, 0);
  
  // Calculate percentage strokes
  let accumulatedPercent = 0;
  const segments = data.map((val, idx) => {
    const percent = total > 0 ? (val / total) * 100 : 0;
    const start = accumulatedPercent;
    accumulatedPercent += percent;
    return {
      label: labels[idx],
      value: val,
      percent,
      start,
      color: colors[idx % colors.length]
    };
  });

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      <h4 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4">{title}</h4>
      <div className="flex flex-col items-center justify-around gap-4 py-2 sm:flex-row">
        {/* SVG Circle */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="18"
              cy="18"
              r="15.915"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              className="text-slate-100 dark:text-slate-800"
            />
            {/* Colored segments */}
            {segments.map((seg, idx) => {
              const strokeDasharray = `${seg.percent} ${100 - seg.percent}`;
              const strokeDashoffset = 100 - seg.start + 25; // 25 to start from 12 o'clock
              
              return (
                <circle
                  key={idx}
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:stroke-[4.5]"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-slate-800 dark:text-white font-mono">{total}</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Total</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2" style={{ maxWidth: '150px' }}>
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <div className="flex flex-col">
                <span className="text-slate-500 dark:text-slate-400 font-medium truncate" title={seg.label} style={{ maxWidth: '100px' }}>
                  {seg.label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  {seg.value} ({Math.round(seg.percent)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
