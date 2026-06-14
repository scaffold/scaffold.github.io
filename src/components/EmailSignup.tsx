import { useState, type FormEvent } from 'react';

/**
 * "Follow our development" capture for the hero. No backend yet — submitting
 * just acknowledges locally so the field feels alive. Wire this to a real list
 * (the put() of an email, eventually) when one exists.
 */
export function EmailSignup() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (email.trim()) setDone(true);
  }

  return (
    <div className="follow-dev">
      <div className="label">Follow our development</div>
      {done ? (
        <div className="ok">✓ Thanks — we'll be in touch as the testnet nears.</div>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="you@domain.com"
            aria-label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit">Subscribe →</button>
        </form>
      )}
    </div>
  );
}
