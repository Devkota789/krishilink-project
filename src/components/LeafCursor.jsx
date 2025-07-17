import React, { useEffect, useRef, useState } from "react";
import leaf from "../assets/leaf-cursor.svg";
import "./LeafCursor.css";
// import Lottie from 'lottie-react'; // Uncomment if you add Lottie
// import butterflyAnim from '../assets/butterfly.json'; // Placeholder

const ease = 0.18; // Easing for soft follow
const idleTimeout = 5000; // 5 seconds

const getRandom = (min, max) => Math.random() * (max - min) + min;

const LeafCursor = () => {
  const cursorRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  const [ripple, setRipple] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [tilt, setTilt] = useState(0);
  const [pollen, setPollen] = useState([]);
  const [idle, setIdle] = useState(false);
  const [showSprout, setShowSprout] = useState(false);
  // const [showButterfly, setShowButterfly] = useState(false);

  // Soft follow state
  const mouse = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const pos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const sway = useRef(0);
  const idleTimer = useRef(null);

  // Animate cursor position and swaying
  useEffect(() => {
    let frame;
    const animate = () => {
      // Soft follow
      pos.current.x = 30; // Fixed x position for left side
      pos.current.y += (mouse.current.y - pos.current.y) * ease;
      // Swaying
      sway.current += 0.04;
      const rotate = Math.sin(sway.current) * 2 + tilt;
      if (cursorRef.current) {
        cursorRef.current.style.left = `${pos.current.x}px`;
        cursorRef.current.style.top = `${pos.current.y}px`;
        cursorRef.current.style.transform = `translate(-50%, -50%) scale(${hovering ? 1.1 : 1}) rotate(${rotate}deg)`;
      }
      // Animate pollen
      setPollen((prev) => prev.filter((p) => Date.now() - p.time < 500));
      frame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(frame);
  }, [hovering, tilt]);

  // Mouse move and idle detection
  useEffect(() => {
    const move = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      setIdle(false);
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIdle(true), idleTimeout);
    };
    document.addEventListener("mousemove", move);
    return () => {
      document.removeEventListener("mousemove", move);
      clearTimeout(idleTimer.current);
    };
  }, []);

  // Hover detection
  useEffect(() => {
    const handleMouseOver = (e) => {
      if (
        e.target.tagName === "A" ||
        e.target.tagName === "BUTTON" ||
        e.target.tagName === "INPUT" ||
        e.target.classList.contains("cursor-hover")
      ) {
        setHovering(true);
        setShowSprout(true);
        setTimeout(() => setShowSprout(false), 300);
      }
    };
    const handleMouseOut = () => setHovering(false);
    document.addEventListener("mouseover", handleMouseOver);
    document.addEventListener("mouseout", handleMouseOut);
    return () => {
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  // Click ripple and seed burst
  useEffect(() => {
    const handleClick = () => {
      setRipple(true);
      setTimeout(() => setRipple(false), 600);
      // Optionally: add seed burst effect here
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Drag/scroll tilt and pollen
  useEffect(() => {
    const handleScroll = () => {
      setTilt(10);
      setTimeout(() => setTilt(0), 300);
      // Add pollen particle
      setPollen((prev) => [
        ...prev,
        {
          id: Math.random(),
          x: pos.current.x + getRandom(-8, 8),
          y: pos.current.y + getRandom(-8, 8),
          time: Date.now(),
        },
      ]);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Optionally: Idle butterfly/dew drop
  // useEffect(() => {
  //   if (idle) setShowButterfly(true);
  //   else setShowButterfly(false);
  // }, [idle]);

  return (
    <>
      <div
        ref={cursorRef}
        className={`leaf-cursor${hovering ? " leaf-cursor-hover" : ""}${dragging ? " leaf-cursor-drag" : ""}`}
      >
        <img src={leaf} alt="Leaf Cursor" draggable="false" />
        {showSprout && <div className="leaf-sprout" />}
        {ripple && <div className="leaf-ripple" />}
        {pollen.map((p) => (
          <div
            key={p.id}
            className="leaf-pollen"
            style={{ left: p.x - pos.current.x + 16, top: p.y - pos.current.y + 16 }}
          />
        ))}
        {/* {showButterfly && (
          <div className="leaf-butterfly">
            <Lottie animationData={butterflyAnim} loop={false} />
          </div>
        )} */}
        {idle && <div className="leaf-dewdrop" />}
      </div>
    </>
  );
};

export default LeafCursor; 