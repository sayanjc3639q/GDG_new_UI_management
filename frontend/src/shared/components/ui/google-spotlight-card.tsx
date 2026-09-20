'use client';

import React, { useRef, useState, useCallback } from 'react';

export interface GoogleSpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  spotlightRadius?: number;
  borderWidth?: number;
}

export const GoogleSpotlightCard: React.FC<GoogleSpotlightCardProps> = ({
  children,
  spotlightRadius = 240,
  borderWidth = 2,
  style,
  className = '',
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
      setOpacity(1);
      onMouseMove?.(e);
    },
    [onMouseMove]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setOpacity(1);
      onMouseEnter?.(e);
    },
    [onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      setOpacity(0);
      onMouseLeave?.(e);
    },
    [onMouseLeave]
  );

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        transition: 'transform 0.2s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.2s cubic-bezier(0.2, 0, 0, 1)',
        cursor: 'pointer',
        ...style,
      }}
      className={`google-spotlight-box ${className}`}
      {...props}
    >
      {/* Dynamic Cursor-Tracking Google Quad-Color Border Highlight */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          padding: `${borderWidth}px`,
          background: `radial-gradient(
            ${spotlightRadius}px circle at ${position.x}px ${position.y}px,
            rgba(66, 133, 244, 1) 0%,
            rgba(234, 67, 53, 0.95) 25%,
            rgba(251, 188, 5, 0.95) 50%,
            rgba(52, 168, 83, 0.95) 75%,
            transparent 100%
          )`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          opacity,
          transition: 'opacity 0.25s ease',
          zIndex: 2,
        }}
      />

      {/* Subtle Inner Ambient Glow following Cursor */}
      <div
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          borderRadius: 'inherit',
          background: `radial-gradient(
            ${spotlightRadius * 1.4}px circle at ${position.x}px ${position.y}px,
            rgba(66, 133, 244, 0.08) 0%,
            rgba(234, 67, 53, 0.04) 30%,
            rgba(52, 168, 83, 0.03) 60%,
            transparent 100%
          )`,
          opacity,
          transition: 'opacity 0.25s ease',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 3, height: '100%' }}>
        {children}
      </div>
    </div>
  );
};
