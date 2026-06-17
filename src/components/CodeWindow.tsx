import { useEffect, useRef, useState } from 'react';
import type { editor as MonacoEditor } from 'monaco-editor';
import type { RunResult } from '../lib/runCode';
import { FILES, LANGS, MONACO_LANG, SOON_LANG, SOURCE, type Lang, type Step } from '../content/heroCode';

const STEPS: { key: Step; label: string }[] = [
  { key: 'contract', label: 'Contract' },
  { key: 'build', label: 'Build' },
  { key: 'run', label: 'Run' },
];

// Hold a constant editor height = the tallest snippet (most lines across all
// tabs/languages), so switching tabs or languages never resizes the window.
// LINE_HEIGHT / V_PADDING mirror EDITOR_OPTIONS in lib/monaco.ts (lineHeight +
// padding top+bottom); the +12 covers a possible horizontal scrollbar.
const LINE_HEIGHT = 22;
const V_PADDING = 48;
const MAX_LINES = Math.max(
  ...Object.values(SOURCE)
    .flatMap((byLang) => Object.values(byLang))
    .map((src) => src.split('\n').length),
);
const MIN_HEIGHT = MAX_LINES * LINE_HEIGHT + V_PADDING + 12;

export function CodeWindow() {
  const [step, setStep] = useState<Step>('run');
  const [lang, setLang] = useState<Lang>('rust');
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState<RunResult | null>(null);

  const hostRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof import('../lib/monaco').monaco | null>(null);
  const modelsRef = useRef(new Map<string, MonacoEditor.ITextModel>());

  // Mount Monaco once, on the client only (the module is dynamically imported
  // so it never touches the Node prerender). A static <pre> stands in until ready.
  useEffect(() => {
    let disposed = false;
    let observer: MutationObserver | undefined;
    const models = modelsRef.current;

    (async () => {
      const m = await import('../lib/monaco');
      if (disposed || !hostRef.current) return;
      const { monaco } = m;
      monacoRef.current = monaco;
      m.applyScaffoldTheme();

      const editor = monaco.editor.create(hostRef.current, m.EDITOR_OPTIONS);
      editorRef.current = editor;

      const fit = () => {
        if (!hostRef.current) return;
        const h = Math.max(MIN_HEIGHT, editor.getContentHeight());
        hostRef.current.style.height = `${h}px`;
      };
      editor.onDidContentSizeChange(fit);

      editor.setModel(getModel(monaco, step, lang));
      fit();
      setReady(true);

      // Re-theme when the site flips light/dark (Nav toggles <html data-mode>).
      observer = new MutationObserver(() => m.applyScaffoldTheme());
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    })();

    return () => {
      disposed = true;
      observer?.disconnect();
      models.forEach((model) => model.dispose());
      models.clear();
      editorRef.current?.dispose();
      editorRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the model when the active tab / language changes. Each (step, lang)
  // keeps its own model, so edits and undo history survive a tab switch.
  useEffect(() => {
    const monaco = monacoRef.current;
    const editor = editorRef.current;
    if (!ready || !monaco || !editor) return;
    editor.setModel(getModel(monaco, step, lang));
  }, [step, lang, ready]);

  async function runCode() {
    const editor = editorRef.current;
    if (!editor) return;
    setRunning(true);
    setOutput(null);
    try {
      const { runModule } = await import('../lib/runCode');
      setOutput(await runModule(editor.getValue()));
    } finally {
      setRunning(false);
    }
  }

  function getModel(
    monaco: typeof import('../lib/monaco').monaco,
    s: Step,
    l: Lang,
  ): MonacoEditor.ITextModel {
    const key = `${s}:${l}`;
    let model = modelsRef.current.get(key);
    if (!model) {
      model = monaco.editor.createModel(SOURCE[s][l], MONACO_LANG[s][l]);
      modelsRef.current.set(key, model);
    }
    return model;
  }

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

      {/* SOURCE is the single source of truth: the plain text is prerendered
          here, then Monaco mounts over it (tokenizing the same SOURCE) on the
          client. The host reserves height so there's no layout jump. */}
      {!ready && (
        <pre className="code-fallback" style={{ minHeight: MIN_HEIGHT }}>
          {SOURCE[step][lang]}
        </pre>
      )}
      <div
        ref={hostRef}
        className="monaco-host"
        style={{ height: ready ? undefined : 0, display: ready ? 'block' : 'none' }}
      />

      {step === 'run' && output && (
        <div className="run-output" role="log" aria-label="Run output">
          {output.logs.map((l, i) => (
            <div key={i} className={`line ${l.level}`}>
              {l.text}
            </div>
          ))}
          {output.error && <div className="line error">⚠ {output.error}</div>}
          {output.logs.length === 0 && !output.error && <div className="line muted">(no output)</div>}
        </div>
      )}

      <div className="langbar">
        <div className="langbar-langs" role="group" aria-label="Contract language">
          <span className="langbar-label">Contract language</span>
          <div className="langbar-btns">
            {LANGS.map((l) => (
              <button key={l.id} aria-pressed={lang === l.id} onClick={() => {setLang(l.id); setStep('contract');}}>
                {l.label}
              </button>
            ))}
            <button className="soon" disabled title={SOON_LANG.title}>
              {SOON_LANG.label}
              <sup>{SOON_LANG.note}</sup>
            </button>
          </div>
        </div>

        {/* Primary CTA, bottom-right: steps through Contract → Build → Run,
            and executes the code on the Run tab. */}
        {step === 'contract' ? (
          <button className="cta" onClick={() => setStep('build')}>
            Build →
          </button>
        ) : step === 'build' ? (
          <button className="cta" onClick={() => setStep('run')}>
            Run →
          </button>
        ) : (
          <button className="cta" onClick={runCode} disabled={running || !ready}>
            {running ? 'Running…' : '▶ Run'}
          </button>
        )}
      </div>
    </div>
  );
}
