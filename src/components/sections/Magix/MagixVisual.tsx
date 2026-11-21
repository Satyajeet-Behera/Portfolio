'use client';

import React, { useState } from 'react';
import { magixConfig } from './magix-config';
import styles from './MagixVisual.module.scss';

export const MagixVisual: React.FC = () => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -(y * 12), y: x * 12 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className={styles.visualContainer}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      aria-label="Futuristic device preview of Magix personal AI assistant"
    >
      {/* Ambient Radial Atmosphere */}
      <div className={styles.ambientHalo} aria-hidden="true" />

      {/* Titanium Chassis Frame */}
      <div className={styles.deviceFrame}>
        {/* Dynamic Island / Sensory Bar */}
        <div className={styles.dynamicIsland} aria-hidden="true">
          <span className={styles.cameraLens} />
          <span className={styles.sensorDot} />
        </div>

        {/* Screen Glass Surface */}
        <div className={styles.screen}>
          {/* Top Status Bar */}
          <div className={styles.statusBar} aria-hidden="true">
            <span className={styles.statusTime}>09:41</span>
            <div className={styles.statusPills}>
              <span className={styles.neuralPill}>CORE ONLINE</span>
            </div>
          </div>

          {/* Central AI Orb & Holographic Waveform */}
          <div className={styles.coreStage}>
            <div className={styles.orbGlow} aria-hidden="true" />
            <div className={styles.orbOuterRing} aria-hidden="true" />
            <div className={styles.orbMiddleRing} aria-hidden="true" />
            <div className={styles.orbInnerCore}>
              <div className={styles.corePulse} />
            </div>

            {/* Audio Waveform Bars */}
            <div className={styles.waveformContainer} aria-hidden="true">
              {[...Array(16)].map((_, i) => (
                <span
                  key={i}
                  className={styles.waveBar}
                  style={{ animationDelay: `${(i * 0.08).toFixed(2)}s` }}
                />
              ))}
            </div>
          </div>

          {/* Dialogue Transcript Interface */}
          <div className={styles.dialogueArea}>
            <div className={styles.userBubble}>
              <span className={styles.speakerLabel}>YOU</span>
              <p className={styles.bubbleText}>&ldquo;{magixConfig.wakePhrase}&rdquo;</p>
            </div>

            <div className={styles.assistantBubble}>
              <div className={styles.assistantHeader}>
                <span className={styles.aiBadge}>MAGIX</span>
                <span className={styles.latencyTag}>120ms</span>
              </div>
              <p className={styles.assistantText}>{magixConfig.greeting}</p>
            </div>
          </div>

          {/* Bottom Telemetry Ticker */}
          <div className={styles.bottomTelemetry} aria-hidden="true">
            <span className={styles.telemetryItem}>MODE: VOICE ACTIVE</span>
            <span className={styles.telemetryItem}>ENGINE: GEMINI</span>
          </div>
        </div>

        {/* Chassis Glare Reflection */}
        <div className={styles.screenGlare} aria-hidden="true" />
      </div>
    </div>
  );
};
