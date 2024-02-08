window.hljsPromise = (async () => {
  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
    script.async = true;
    script.onload = resolve;
    document.head.append(script);
  });

  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/javascript.min.js';
    script.async = true;
    script.onload = resolve;
    document.head.append(script);
  });

  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/rust.min.js';
    script.async = true;
    script.onload = resolve;
    document.head.append(script);
  });

  await new Promise((resolve) => {
    const script = document.createElement('script');
    script.src =
      'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/bash.min.js';
    script.async = true;
    script.onload = resolve;
    document.head.append(script);
  });

  return window.hljs;
})();
