import React from 'react';

// https://highlightjs.org/demo#lang=typescript&v=1&theme=atom-one-dark&code=aW1wb3J0IFNjYWZmb2xkLCB7IGJyb3dzZXJDb25maWcgfSBmcm9tICdodHRwczovL2dpdGh1Yi5jb20vc8c1yglyYXcvbWFpbi9pbmRleC50cyc7Cgpjb25zdCDIJCA9IG5ld8lxKM1uKTsKCsgpLmZldGNoKAogICdkZGE4ZWNmZDIyZWEyYjlmZDY3MGNkNDNjYWRkNTUzZWJmZTM1ZGFjODlhNTU1MmFiMTVmZDFjZjNlY2EyMWJkJywKICBKU09OLnN0cmluZ2lmeSh7IG5hbWU6ICdKb2VsJyB9KcQkKHJlc3BvbnNlKSA9PiDkALlvbGUubG9nKOQAtFRleHREZWNvZGVyKCkuZMUKyjIpLAopOwo%3D

const languageClasses: Record<string, string> = {
  js: 'language-typescript',
  rs: 'language-rust',
  sh: 'language-bash',
};

export default (
  { files, code, style }: {
    files: Record<string, string>;
    code?: string;
    style?: React.CSSProperties;
  },
) => {
  const [selectedFile, setSelectedFile] = React.useState(Object.keys(files)[0]);

  const codeRef = (el: HTMLElement | null) => {
    if (el !== null) {
      el.removeAttribute('data-highlighted');
      (window as any).hljsPromise.then((hljs: any) => hljs.highlightElement(el));
    }
  };

  return (
    <div
      className='rounded-lg'
      style={{
        width: 'max-content',
        height: 'max-content',
        background: '#22272E',
        boxShadow: `#8CB3F244 0 20px 50px -10px`,
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: 45,
          background: `#FFFFFF10`,
          paddingInline: 16,
        }}
      >
        <div
          style={{
            width: 13,
            height: 13,
            marginRight: 8,
            borderRadius: '50%',
            backgroundColor: '#FF5F57',
          }}
        >
        </div>
        <div
          style={{
            width: 13,
            height: 13,
            marginRight: 8,
            borderRadius: '50%',
            backgroundColor: '#FEBC2E',
          }}
        >
        </div>
        <div
          style={{
            width: 13,
            height: 13,
            marginRight: '1em',
            borderRadius: '50%',
            backgroundColor: '#28C840',
          }}
        >
        </div>
        {Object.keys(files).map((filename) => (
          <div
            key={filename}
            style={{
              borderLeft: '1px solid #abb2bf',
              borderRight: '1px solid #abb2bf',
              marginLeft: '-1px',
              padding: '0.5em 1em',
              fontFamily: 'monospace',
              color: '#abb2bf',
              textDecoration: filename === selectedFile ? 'underline' : undefined,
              textUnderlineOffset: '0.5em',
            }}
            onClick={() => setSelectedFile(filename)}
          >
            {filename}
          </div>
        ))}
        <div style={{ flexGrow: '1' }}></div>
      </div>

      <pre><code
        className={languageClasses[selectedFile.split('.').pop()!]}
        style={{
          fontSize: 14,
          fontFamily: 'monospace',
          padding: '1.5em 1em 1em 1em',
        }}
        ref={codeRef}
      >
        {files[selectedFile].trim()}
      </code></pre>
    </div>
  );
};
