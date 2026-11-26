"use client";

import React, { useRef, useState } from "react";
import { Download } from "lucide-react";

interface BarDatum {
  label: string;
  value: number | null | undefined;
}

export function SimpleBarChart({
  title,
  unit = "",
  data,
  color = "#0284c7",
  height = 200,
}: {
  title: string;
  unit?: string;
  data: BarDatum[];
  color?: string;
  height?: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hovered, setHovered] = useState<{ label: string; value: number } | null>(null);

  const valid = data.filter((d) => typeof d.value === "number" && !Number.isNaN(d.value)) as {
    label: string;
    value: number;
  }[];

  const downloadSvg = () => {
    if (!svgRef.current) return;
    const blob = new Blob([svgRef.current.outerHTML], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (valid.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 bg-white">
        <div className="text-xs font-bold text-slate-800 mb-2">{title}</div>
        <div className="h-32 flex items-center justify-center text-xs text-slate-400 italic">
          Metric unavailable (requires reference transcripts or active model run)
        </div>
      </div>
    );
  }

  const maxVal = Math.max(...valid.map((d) => d.value), 0.0001);
  const w = 440;
  const padL = 42;
  const padB = 46;
  const padT = 16;
  const chartW = w - padL - 16;
  const chartH = height - padT - padB;
  const barW = Math.max(14, Math.min(44, chartW / valid.length - 10));

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-800">
          {title} {unit ? <span className="text-slate-400 font-normal">({unit})</span> : null}
        </span>
        <div className="flex items-center gap-2">
          {hovered && (
            <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-800">
              {hovered.label}: {hovered.value} {unit}
            </span>
          )}
          <button
            type="button"
            onClick={downloadSvg}
            className="p-1 rounded hover:bg-slate-100 text-slate-500 hover:text-slate-800"
            title="Download chart SVG"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <svg ref={svgRef} viewBox={`0 0 ${w} ${height}`} className="w-full h-auto overflow-visible">
        <line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#cbd5e1" strokeWidth="1" />
        <line x1={padL} y1={padT + chartH} x2={w - 10} y2={padT + chartH} stroke="#cbd5e1" strokeWidth="1" />
        <text x={padL - 6} y={padT + 8} textAnchor="end" fontSize="9" fill="#64748b">
          {maxVal.toFixed(maxVal < 1 ? 2 : 1)}
        </text>
        <text x={padL - 6} y={padT + chartH} textAnchor="end" fontSize="9" fill="#64748b">
          0
        </text>

        {valid.map((d, idx) => {
          const step = chartW / valid.length;
          const x = padL + idx * step + (step - barW) / 2;
          const barH = (d.value / maxVal) * chartH;
          const y = padT + chartH - barH;
          const shortLabel = d.label.length > 14 ? d.label.slice(0, 12) + ".." : d.label;
          return (
            <g
              key={idx}
              onMouseEnter={() => setHovered(d)}
              onMouseLeave={() => setHovered(null)}
              className="cursor-pointer"
            >
              <rect x={x} y={y} width={barW} height={Math.max(2, barH)} rx="4" fill={color} opacity={0.9} />
              <text x={x + barW / 2} y={y - 4} textAnchor="middle" fontSize="9" fontWeight="bold" fill="#0f172a">
                {d.value}
              </text>
              <text
                x={x + barW / 2}
                y={padT + chartH + 14}
                textAnchor="middle"
                fontSize="8.5"
                fill="#475569"
              >
                {shortLabel}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function MultiLineTrainingChart({
  history,
}: {
  history: Array<{
    epoch: number;
    train_loss: number;
    val_loss: number;
    train_accuracy?: number;
    val_accuracy?: number;
    learning_rate?: number;
  }>;
}) {
  if (!history || history.length === 0) {
    return (
      <div className="p-4 rounded-xl border border-slate-200 bg-white text-xs text-slate-500 italic">
        Training history unavailable for selected model (cloud API models are inference-only).
      </div>
    );
  }

  const w = 440;
  const h = 190;
  const padL = 38;
  const padB = 30;
  const padT = 16;
  const cw = w - padL - 20;
  const ch = h - padT - padB;
  const maxEpoch = Math.max(...history.map((e) => e.epoch), 1);

  const toPoints = (key: "train_loss" | "val_loss") =>
    history
      .map((e, i) => {
        const x = padL + (history.length === 1 ? cw / 2 : (i / (history.length - 1)) * cw);
        const y = padT + ch - Math.min(1, Math.max(0, e[key])) * ch;
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-slate-800">Training & Validation Loss vs Epoch</span>
        <div className="flex items-center gap-3 text-[10px]">
          <span className="flex items-center gap-1 text-sky-700 font-semibold">
            <span className="w-2.5 h-0.5 bg-sky-600 inline-block" /> Train Loss
          </span>
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2.5 h-0.5 bg-emerald-600 inline-block" /> Val Loss
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
        <line x1={padL} y1={padT} x2={padL} y2={padT + ch} stroke="#cbd5e1" />
        <line x1={padL} y1={padT + ch} x2={w - 15} y2={padT + ch} stroke="#cbd5e1" />
        <text x={padL - 5} y={padT + 8} textAnchor="end" fontSize="9" fill="#64748b">1.0</text>
        <text x={padL - 5} y={padT + ch} textAnchor="end" fontSize="9" fill="#64748b">0.0</text>
        <text x={w / 2} y={h - 6} textAnchor="middle" fontSize="9" fill="#64748b">
          Epoch (1 – {maxEpoch})
        </text>
        <polyline fill="none" stroke="#0284c7" strokeWidth="2" points={toPoints("train_loss")} />
        <polyline fill="none" stroke="#059669" strokeWidth="2" strokeDasharray="4 2" points={toPoints("val_loss")} />
      </svg>
    </div>
  );
}

export function ModelRadarChart({
  models,
}: {
  models: Array<{
    model_name: string;
    wer_accuracy_score: number;
    cer_accuracy_score: number;
    speed_score: number;
    reliability_score: number;
  }>;
}) {
  if (!models || models.length === 0) return null;

  const size = 260;
  const cx = size / 2;
  const cy = size / 2;
  const r = 82;
  const axes = [
    { key: "wer_accuracy_score", label: "WER Acc" },
    { key: "cer_accuracy_score", label: "CER Acc" },
    { key: "speed_score", label: "Speed" },
    { key: "reliability_score", label: "Reliability" },
  ] as const;
  const palette = ["#0284c7", "#059669", "#7c3aed", "#ea580c"];

  return (
    <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs space-y-2">
      <div className="text-xs font-bold text-slate-800">Normalized Model Comparison Radar (0–100)</div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          {[0.25, 0.5, 0.75, 1].map((lvl) => (
            <circle key={lvl} cx={cx} cy={cy} r={r * lvl} fill="none" stroke="#e2e8f0" />
          ))}
          {axes.map((ax, i) => {
            const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
            const x2 = cx + Math.cos(angle) * r;
            const y2 = cy + Math.sin(angle) * r;
            const lx = cx + Math.cos(angle) * (r + 20);
            const ly = cy + Math.sin(angle) * (r + 14);
            return (
              <g key={ax.key}>
                <line x1={cx} y1={cy} x2={x2} y2={y2} stroke="#cbd5e1" />
                <text x={lx} y={ly} textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#334155">
                  {ax.label}
                </text>
              </g>
            );
          })}
          {models.map((m, idx) => {
            const color = palette[idx % palette.length];
            const pts = axes
              .map((ax, i) => {
                const angle = (Math.PI * 2 * i) / axes.length - Math.PI / 2;
                const val = Math.max(0.05, Math.min(1, (m[ax.key] || 0) / 100));
                return `${cx + Math.cos(angle) * r * val},${cy + Math.sin(angle) * r * val}`;
              })
              .join(" ");
            return <polygon key={m.model_name} points={pts} fill={color} fillOpacity={0.18} stroke={color} strokeWidth="2" />;
          })}
        </svg>

        <div className="space-y-1.5 text-xs">
          {models.map((m, idx) => (
            <div key={m.model_name} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: palette[idx % palette.length] }} />
              <span className="font-semibold text-slate-800">{m.model_name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
