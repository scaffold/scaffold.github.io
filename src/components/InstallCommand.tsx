import { useState } from 'react';

/** Copyable shell command. Styling comes from the parent band. */
export function InstallCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(command).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }

  return (
    <div className="install-row">
      <code className="install-cmd">
        <span className="dollar">$</span>
        {command}
      </code>
      <button type="button" className="copy-btn" onClick={copy}>
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
