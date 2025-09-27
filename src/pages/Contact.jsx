import React, { useState } from 'react';
import { submitContact } from '../api/contact.js';
import RevealOnScroll from '../components/RevealOnScroll.jsx';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || !trimmedEmail || !trimmedMessage) {
      setError('Please provide your name, email, and message.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await submitContact({
        name: trimmedName,
        email: trimmedEmail,
        message: trimmedMessage,
      });
      setSent(true);
      setName('');
      setEmail('');
      setMessage('');
      setTimeout(() => setSent(false), 4000);
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to send message. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    
   <>
    <div className="absolute inset-0" aria-hidden="true" />
    <div className="relative z-10 flex-1">
      <div className="max-w-[96rem] mx-auto px-6 h-full flex items-center">
        <div className="w-full flex flex-col-reverse lg:flex-row-reverse items-center gap-8 md:gap-12 lg:gap-16">
          {/* Text and form */}
          <RevealOnScroll direction="right" delay={0.1} className="flex-1 w-full max-w-[40rem] rounded-xl bg-slate-900 p-10 text-center md:text-left">
            <span className="text-sm uppercase tracking-[0.4em] text-white/60">Get in touch</span>
            <h2 className="mt-3 text-4xl font-extrabold xl:text-[56px] lg:text-[48px] md:text-[30px] sm:text-[36px] host-grotesk">We&apos;d love to hear from you</h2>
            <p className="mt-4 host-grotesk max-w-xl xl:text-lg lg:text-md sm:text-lg text-lg text-white/75">
              Share your questions, feedback, or partnership ideas. Our team usually responds within one business day.
            </p>
            <form onSubmit={submit} className="mt-6 flex flex-wrap gap-3">
              <input
                type="text"
                placeholder="Your name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 min-w-[220px] rounded-lg border px-3 py-2 dark:bg-slate-800 dark:border-slate-400 dark:text-white"
              />
              <input
                type="email"
                placeholder="Your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-[220px] rounded-lg border px-3 py-2 dark:bg-slate-800 dark:border-slate-400 dark:text-white"
              />
              <textarea
                placeholder="Message"
                rows="4"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 dark:bg-slate-800 dark:border-slate-400 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-rose-500 text-white font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
              {error && (
                <div className="w-full text-sm text-rose-300" role="alert">
                  {error}
                </div>
              )}
              {sent && (
                <div className="w-full text-sm text-green-300">
                  Message sent! We'll get back to you shortly.
                </div>
              )}
            </form>
          </RevealOnScroll>
          {/* Side image */}
          <RevealOnScroll direction="left" className="flex-1 w-full flex items-start md:items-center justify-center lg:justify-end">
            <img
              src="https://i.ibb.co/21FQHq4s/contact-us-concept-illustration-86047-957.png"
              alt="Contact illustration"
              className="w-[28rem] sm:w-[34rem] md:w-[48rem] lg:w-[64rem] xl:w-[72rem] 2xl:w-[90rem] max-w-full object-contain drop-shadow-2xl"
              loading="lazy"
            />
          </RevealOnScroll>
        </div>
      </div>
    </div>
    </>
  );
}
