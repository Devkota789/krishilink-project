import React, { useRef } from "react";
import "./NatureButton.css";
import leaf from "../assets/button-leaf.svg";

const NatureButton = ({ children, onClick, ...props }) => {
  const btnRef = useRef(null);

  // Ripple effect
  const handleClick = (e) => {
    const button = btnRef.current;
    const ripple = document.createElement("span");
    ripple.className = "nature-btn-ripple";
    const rect = button.getBoundingClientRect();
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={btnRef}
      className="nature-btn"
      onClick={handleClick}
      {...props}
    >
      <span className="nature-btn-leaf">
        <img src={leaf} alt="" draggable="false" />
      </span>
      <span className="nature-btn-content">{children}</span>
    </button>
  );
};

export default NatureButton; 