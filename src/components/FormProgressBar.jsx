import React from "react";
const PlantSVG = () => (
  <svg viewBox="0 0 28 28" width="28" height="28" fill="none">
    <ellipse cx="14" cy="22" rx="8" ry="5" fill="#A5D6A7" />
    <path d="M14 22 Q16 10 26 8" stroke="#4CAF50" strokeWidth="2" fill="none" />
    <ellipse cx="20" cy="10" rx="2" ry="3" fill="#81C784" />
    <ellipse cx="10" cy="12" rx="2" ry="3" fill="#81C784" />
  </svg>
);
const FormProgressBar = ({ progress = 0 }) => (
  <div className="form-progress-bar">
    <div className="form-progress-bar-inner" style={{ width: `${progress}%` }} />
    {progress > 0 && (
      <span className="form-progress-plant" style={{ left: `calc(${progress}% - 14px)` }}>
        <PlantSVG />
      </span>
    )}
  </div>
);
export default FormProgressBar; 