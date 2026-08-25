import React from 'react';
import { PieChart } from 'lucide-react';

const PORTION_OPTIONS = [
  { value: 0.5, label: '0.5x', sub: 'Half' },
  { value: 1.0, label: '1.0x', sub: 'Normal' },
  { value: 1.5, label: '1.5x', sub: 'Large' },
  { value: 2.0, label: '2.0x', sub: 'Double' },
];

/**
 * PortionControl component provides interactive serving size multipliers.
 * @param {Object} props
 * @param {number} props.multiplier - Current active multiplier (0.5, 1.0, 1.5, 2.0)
 * @param {(multiplier: number) => void} props.onChange - Callback on multiplier change
 */
export default function PortionControl({ multiplier = 1.0, onChange }) {
  return (
    <div className="portion-control-wrapper">
      <div className="portion-header">
        <div className="portion-title">
          <PieChart size={15} className="portion-icon" />
          <span>Portion Size</span>
        </div>
        <span className="portion-active-indicator">
          {multiplier === 1.0 ? 'Standard Serving' : `${multiplier}x Serving`}
        </span>
      </div>

      <div className="portion-pill-group">
        {PORTION_OPTIONS.map((opt) => {
          const isActive = multiplier === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              className={`portion-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => onChange(opt.value)}
              aria-pressed={isActive}
            >
              <span className="portion-btn-label">{opt.label}</span>
              <span className="portion-btn-sub">{opt.sub}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
