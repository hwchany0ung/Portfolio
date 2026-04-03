/* ========================
   Contact Form (EmailJS)
   - Uses EmailJS free plan (200 emails/month)
   - No backend required
   - Graceful error handling
   ======================== */

(function () {
  'use strict';

  // ── EmailJS Configuration ──────────────────────────────────────
  // These IDs are safe to expose client-side (EmailJS design).
  // Rate limiting is handled by EmailJS dashboard settings.
  const EMAILJS_PUBLIC_KEY = ''; // Set your EmailJS public key
  const EMAILJS_SERVICE_ID = ''; // Set your EmailJS service ID
  const EMAILJS_TEMPLATE_ID = ''; // Set your EmailJS template ID

  // ── Form Validation ────────────────────────────────────────────
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateForm(name, email, message) {
    const errors = [];
    if (!name || name.trim().length < 2) {
      errors.push('Name must be at least 2 characters.');
    }
    if (!validateEmail(email)) {
      errors.push('Please enter a valid email address.');
    }
    if (!message || message.trim().length < 10) {
      errors.push('Message must be at least 10 characters.');
    }
    return errors;
  }

  // ── Status Display ─────────────────────────────────────────────
  function showStatus(formEl, type, message) {
    let statusEl = formEl.querySelector('.form-status');
    if (!statusEl) {
      statusEl = document.createElement('div');
      statusEl.className = 'form-status';
      formEl.appendChild(statusEl);
    }

    statusEl.className = `form-status ${type}`;
    statusEl.textContent = message;
    statusEl.style.display = 'block';

    if (type === 'success') {
      setTimeout(() => {
        statusEl.style.display = 'none';
      }, 5000);
    }
  }

  // ── Send Email via EmailJS ─────────────────────────────────────
  async function sendEmail(name, email, subject, message) {
    // Check if EmailJS is configured
    if (!EMAILJS_PUBLIC_KEY || !EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID) {
      // Fallback: open mailto link
      const mailtoUrl = `mailto:hwchanyung@gmail.com?subject=${encodeURIComponent(
        subject || 'Portfolio Contact'
      )}&body=${encodeURIComponent(
        `From: ${name} (${email})\n\n${message}`
      )}`;
      window.location.href = mailtoUrl;
      return { success: true, fallback: true };
    }

    // EmailJS SDK check
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS SDK not loaded');
      const mailtoUrl = `mailto:hwchanyung@gmail.com?subject=${encodeURIComponent(
        subject || 'Portfolio Contact'
      )}&body=${encodeURIComponent(
        `From: ${name} (${email})\n\n${message}`
      )}`;
      window.location.href = mailtoUrl;
      return { success: true, fallback: true };
    }

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: name,
        from_email: email,
        subject: subject,
        message: message,
      });
      return { success: true };
    } catch (err) {
      console.error('EmailJS error:', err);
      return { success: false, error: err };
    }
  }

  // ── Initialize ─────────────────────────────────────────────────
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nameEl = form.querySelector('[name="name"]');
      const emailEl = form.querySelector('[name="email"]');
      const subjectEl = form.querySelector('[name="subject"]');
      const messageEl = form.querySelector('[name="message"]');
      const submitBtn = form.querySelector('.form-submit');

      const name = nameEl?.value || '';
      const email = emailEl?.value || '';
      const subject = subjectEl?.value || '';
      const message = messageEl?.value || '';

      // Validate
      const errors = validateForm(name, email, message);
      if (errors.length > 0) {
        showStatus(form, 'error', errors[0]);
        return;
      }

      // Disable button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
      }

      // Send
      const result = await sendEmail(name, email, subject, message);

      if (result.success) {
        if (result.fallback) {
          showStatus(
            form,
            'success',
            'Opening your email client... (EmailJS not configured yet)'
          );
        } else {
          showStatus(form, 'success', 'Message sent successfully! Thank you.');
          form.reset();
        }
      } else {
        showStatus(
          form,
          'error',
          'Failed to send message. Please try emailing directly at hwchanyung@gmail.com'
        );
      }

      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
