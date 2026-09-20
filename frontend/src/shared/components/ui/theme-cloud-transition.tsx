'use client';

import React from 'react';
import { useTheme } from '@/shared/context/theme-context';

export const ThemeCloudTransition: React.FC = () => {
  const { isTransitioning, targetTheme } = useTheme();

  if (!isTransitioning) return null;

  const isGoingLight = targetTheme === 'light';

  return (
    <div
      className={`theme-cloud-stage ${isGoingLight ? 'transition-to-day' : 'transition-to-night'}`}
      aria-hidden="true"
    >
      {/* Dynamic Sky Atmospheric Background Color Flash */}
      <div className="sky-atmosphere" />

      {/* Sun / Moon Celestial Body Hero */}
      <div className="celestial-hero">
        {isGoingLight ? (
          <div className="sun-hero">
            <div className="sun-glow-outer" />
            <div className="sun-glow-mid" />
            <div className="sun-core-sphere" />
            <div className="sun-beam-burst">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={`sun-beam beam-${i + 1}`} />
              ))}
            </div>
          </div>
        ) : (
          <div className="moon-hero">
            <div className="moon-glow-outer" />
            <div className="moon-core-sphere">
              <div className="moon-crater crater-a" />
              <div className="moon-crater crater-b" />
              <div className="moon-crater crater-c" />
            </div>
            <div className="night-constellations">
              <span className="star-point star-1">★</span>
              <span className="star-point star-2">✦</span>
              <span className="star-point star-3">✧</span>
              <span className="star-point star-4">✦</span>
              <span className="star-point star-5">★</span>
            </div>
          </div>
        )}
      </div>

      {/* Google Colored Energy Sparkles */}
      <div className="google-sparkle-stream">
        <span className="g-sparkle g-blue">✦</span>
        <span className="g-sparkle g-red">✦</span>
        <span className="g-sparkle g-yellow">✦</span>
        <span className="g-sparkle g-green">✦</span>
      </div>

      {/* SVG Volumetric Organic Cloud Waves */}
      <div className="cloud-svg-layer cloud-wave-top">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="cloud-svg-wave">
          <path
            fill="currentColor"
            d="M0,96L48,112C96,128,192,160,288,154.7C384,149,480,107,576,112C672,117,768,171,864,181.3C960,192,1056,160,1152,138.7C1248,117,1344,107,1392,101.3L1440,96L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
          />
        </svg>
      </div>

      {/* Volumetric Layer 1: Left sweep clouds */}
      <div className="cloud-volumetric-pack pack-left">
        <div className="v-puff p1" />
        <div className="v-puff p2" />
        <div className="v-puff p3" />
        <div className="v-puff p4" />
      </div>

      {/* Volumetric Layer 2: Right sweep clouds */}
      <div className="cloud-volumetric-pack pack-right">
        <div className="v-puff p5" />
        <div className="v-puff p6" />
        <div className="v-puff p7" />
        <div className="v-puff p8" />
      </div>

      {/* Volumetric Layer 3: Central Curtain Burst */}
      <div className="cloud-volumetric-pack pack-center">
        <div className="v-puff p9" />
        <div className="v-puff p10" />
        <div className="v-puff p11" />
      </div>

      <div className="cloud-svg-layer cloud-wave-bottom">
        <svg viewBox="0 0 1440 320" preserveAspectRatio="none" className="cloud-svg-wave">
          <path
            fill="currentColor"
            d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,218.7C672,235,768,245,864,229.3C960,213,1056,171,1152,160C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>
      </div>
    </div>
  );
};

