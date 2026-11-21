'use client';

import React, { useState, useEffect } from 'react';
import styles from './PostReaderClient.module.scss';

interface PostReaderClientProps {
  postTitle: string;
  postUrl: string;
}

export const PostReaderClient: React.FC<PostReaderClientProps> = ({
  postTitle,
  postUrl,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShareTwitter = () => {
    const text = encodeURIComponent(`"${postTitle}" by @satyajeetbehera`);
    const url = encodeURIComponent(postUrl);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(postUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`${postTitle} - ${postUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Top Reading Progress Bar */}
      <div
        className={styles.progressBarTrack}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Article reading progress"
      >
        <div
          className={styles.progressBarFill}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Share Actions Bar */}
      <div className={styles.shareBar} aria-label="Share this article">
        <span className={styles.shareLabel}>Share article:</span>

        <button
          type="button"
          onClick={handleShareTwitter}
          className={styles.shareBtn}
          title="Share on X / Twitter"
          aria-label="Share on X"
        >
          𝕏 Post
        </button>

        <button
          type="button"
          onClick={handleShareLinkedIn}
          className={styles.shareBtn}
          title="Share on LinkedIn"
          aria-label="Share on LinkedIn"
        >
          LinkedIn
        </button>

        <button
          type="button"
          onClick={handleShareWhatsApp}
          className={styles.shareBtn}
          title="Share on WhatsApp"
          aria-label="Share on WhatsApp"
        >
          WhatsApp
        </button>

        <button
          type="button"
          onClick={handleCopyLink}
          className={`${styles.shareBtn} ${copied ? styles.copiedBtn : ''}`}
          title="Copy link to clipboard"
          aria-label="Copy link to clipboard"
        >
          {copied ? '✓ Copied' : '🔗 Copy Link'}
        </button>
      </div>
    </>
  );
};
