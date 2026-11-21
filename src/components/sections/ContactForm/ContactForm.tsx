'use client';

import React, { useState } from 'react';
import { Container } from '@/components/layout/Container/Container';
import { SectionLabel } from '@/components/ui/SectionLabel/SectionLabel';
import styles from './ContactForm.module.scss';

interface FormState {
  name: string;
  phone: string;
  email: string;
  message: string;
  botCheck: string; // Honeypot
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  message?: string;
}

type SubmissionStatus = 'idle' | 'submitting' | 'success' | 'error';

export const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormState>({
    name: '',
    phone: '',
    email: '',
    message: '',
    botCheck: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SubmissionStatus>('idle');
  const [serverMessage, setServerMessage] = useState<string>('');

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Please provide your full name (at least 2 characters).';
    }

    const phoneRegex = /^[\d\s+\-()]{7,20}$/;
    if (!formData.phone.trim() || !phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = 'Please provide a valid contact number (7-20 digits).';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.message.trim() || formData.message.trim().length < 10) {
      newErrors.message = 'Please write a message with at least 10 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error on typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Spam honeypot trap
    if (formData.botCheck) {
      setStatus('success');
      return;
    }

    if (!validate()) {
      return;
    }

    setStatus('submitting');
    setServerMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
          botCheck: formData.botCheck,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setFormData({
          name: '',
          phone: '',
          email: '',
          message: '',
          botCheck: '',
        });
      } else {
        setStatus('error');
        setServerMessage(
          data.error ||
            'Something went wrong delivering your message. You can also reach Satyajeet directly at iq218satya@gmail.com.'
        );
      }
    } catch {
      setStatus('error');
      setServerMessage(
        'Network error encountered while sending your message. Please reach Satyajeet directly at iq218satya@gmail.com.'
      );
    }
  };

  const handleReset = () => {
    setStatus('idle');
    setServerMessage('');
  };

  return (
    <section
      id="contact"
      className={styles.section}
      aria-labelledby="contact-form-heading"
    >
      <Container className={styles.container}>
        <div className={styles.grid}>
          {/* Left Column: Context & Transmission Protocol */}
          <div className={styles.infoCol}>
            <div className={styles.eyebrowWrapper}>
              <SectionLabel text="TRANSMISSION // INITIATE COMMS" />
            </div>

            <h2 id="contact-form-heading" className={styles.heading}>
              Let&apos;s Talk About Some Great Ideas<span className={styles.period}>.</span>
            </h2>

            <p className={styles.lead}>
              Whether you have an ambitious software project in mind, an innovative AI architecture to discuss, or want to explore collaboration — I&apos;m always ready to talk engineering and possibilities.
            </p>

            <div className={styles.metaCards}>
              <div className={styles.metaCard}>
                <span className={styles.metaIcon} aria-hidden="true">⚡</span>
                <div>
                  <h3 className={styles.metaTitle}>Fast Turnaround</h3>
                  <p className={styles.metaDesc}>Direct response delivered within 24–48 hours.</p>
                </div>
              </div>

              <div className={styles.metaCard}>
                <span className={styles.metaIcon} aria-hidden="true">🛡️</span>
                <div>
                  <h3 className={styles.metaTitle}>Direct & Confidential</h3>
                  <p className={styles.metaDesc}>Your project scope and contact details remain strictly private.</p>
                </div>
              </div>

              <div className={styles.metaCard}>
                <span className={styles.metaIcon} aria-hidden="true">📍</span>
                <div>
                  <h3 className={styles.metaTitle}>Direct Email</h3>
                  <a href="mailto:iq218satya@gmail.com" className={styles.metaLink}>
                    iq218satya@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Form */}
          <div className={styles.formCol}>
            <div className={styles.formStage}>
              <div className={styles.stageBacklight} aria-hidden="true" />

              {/* HUD Frame */}
              <div className={styles.hudHeader} aria-hidden="true">
                <span className={styles.hudIndicator} />
                <span className={styles.hudStatus}>SECURE CHANNEL // READY</span>
                <span className={styles.hudProtocol}>TLS v1.3</span>
              </div>

              {status === 'success' ? (
                <div className={styles.successState} role="status" aria-live="polite">
                  <div className={styles.successBadge} aria-hidden="true">
                    ✓
                  </div>
                  <h3 className={styles.successTitle}>Transmission Received</h3>
                  <p className={styles.successMessage}>
                    Thank you for reaching out! Your note has been safely logged. I will review your idea and get back to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className={styles.resetButton}
                  >
                    Send Another Transmission
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className={styles.form}
                  aria-label="Direct message form"
                >
                  {/* Honeypot field for bot suppression */}
                  <div className={styles.honeypot} aria-hidden="true">
                    <label htmlFor="botCheck">Leave this empty</label>
                    <input
                      type="text"
                      id="botCheck"
                      name="botCheck"
                      tabIndex={-1}
                      autoComplete="off"
                      value={formData.botCheck}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Name field */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Your Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder="e.g. Tony Stark"
                      value={formData.name}
                      onChange={handleChange}
                      className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      disabled={status === 'submitting'}
                      aria-invalid={!!errors.name}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                    />
                    {errors.name && (
                      <span id="name-error" className={styles.errorText} role="alert">
                        {errors.name}
                      </span>
                    )}
                  </div>

                  {/* Contact Number & Email (2-column on tablet+) */}
                  <div className={styles.row}>
                    <div className={styles.fieldGroup}>
                      <label htmlFor="phone" className={styles.label}>
                        Contact Number <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        placeholder="+91 80747 83962"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                        disabled={status === 'submitting'}
                        aria-invalid={!!errors.phone}
                        aria-describedby={errors.phone ? 'phone-error' : undefined}
                      />
                      {errors.phone && (
                        <span id="phone-error" className={styles.errorText} role="alert">
                          {errors.phone}
                        </span>
                      )}
                    </div>

                    <div className={styles.fieldGroup}>
                      <label htmlFor="email" className={styles.label}>
                        Email Address <span className={styles.required}>*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        placeholder="you@domain.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                        disabled={status === 'submitting'}
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <span id="email-error" className={styles.errorText} role="alert">
                          {errors.email}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Message field */}
                  <div className={styles.fieldGroup}>
                    <label htmlFor="message" className={styles.label}>
                      Message / Project Scope <span className={styles.required}>*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder="Tell me about what you are building, the problem to solve, or what you'd like to collaborate on..."
                      value={formData.message}
                      onChange={handleChange}
                      className={`${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                      disabled={status === 'submitting'}
                      aria-invalid={!!errors.message}
                      aria-describedby={errors.message ? 'message-error' : undefined}
                    />
                    {errors.message && (
                      <span id="message-error" className={styles.errorText} role="alert">
                        {errors.message}
                      </span>
                    )}
                  </div>

                  {/* Error banner if submission fails */}
                  {status === 'error' && (
                    <div className={styles.errorBanner} role="alert">
                      <span className={styles.errorIcon} aria-hidden="true">⚠️</span>
                      <p className={styles.errorMessage}>{serverMessage}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={status === 'submitting'}
                    className={styles.submitButton}
                  >
                    {status === 'submitting' ? (
                      <span className={styles.submittingInner}>
                        <span className={styles.spinner} aria-hidden="true" />
                        Transmitting Message...
                      </span>
                    ) : (
                      <span className={styles.buttonContent}>
                        Send Message
                        <span className={styles.arrow} aria-hidden="true">→</span>
                      </span>
                    )}
                  </button>
                </form>
              )}

              {/* Corner Accents */}
              <div className={`${styles.corner} ${styles.cornerTL}`} aria-hidden="true" />
              <div className={`${styles.corner} ${styles.cornerTR}`} aria-hidden="true" />
              <div className={`${styles.corner} ${styles.cornerBL}`} aria-hidden="true" />
              <div className={`${styles.corner} ${styles.cornerBR}`} aria-hidden="true" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};
