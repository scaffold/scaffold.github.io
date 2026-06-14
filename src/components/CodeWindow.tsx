import { useState } from 'react';
import { CODE, FILES, LANGS, SOON_LANG, type Lang, type Step } from '../content/heroCode';

const STEPS: { key: Step; label: string }[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'build', label: 'Build' },
  { key: 'run', label: 'Run' },
];

export function CodeWindow() {
  const [step, setStep] = useState<Step>('run');
  const [lang, setLang] = useState<Lang>('rust');

  return (
    <div className="code-window">
      <div className="chrome" role="tablist" aria-label="Build a Scaffold app in three steps">
        {STEPS.map((s) => (
          <button
            key={s.key}
            role="tab"
            className="tab"
            aria-selected={step === s.key}
            onClick={() => setStep(s.key)}
          >
            {s.label}
          </button>
        ))}
        <div className="filler" />
        <div className="meta">greeter · {FILES[step][lang]}</div>
      </div>

      <pre dangerouslySetInnerHTML={{ __html: CODE[step][lang] }} />

      <div className="langbar" role="group" aria-label="Contract language">
        <span className="langbar-label">Contract language</span>
        <div className="langbar-btns">
          {LANGS.map((l) => (
            <button key={l.id} aria-pressed={lang === l.id} onClick={() => setLang(l.id)}>
              {l.label}
            </button>
          ))}
          <button className="soon" disabled title={SOON_LANG.title}>
            {SOON_LANG.label}
            <sup>{SOON_LANG.note}</sup>
          </button>
        </div>
      </div>
    </div>
  );
}
