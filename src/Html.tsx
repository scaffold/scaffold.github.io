import React from 'react';

export default (
  { title, canonicalUrl, children }: {
    title: string;
    canonicalUrl: string;
    children?: React.ReactNode;
  },
) => (
  <html lang='en'>
    <head>
      <meta charSet='UTF-8' />
      <meta name='viewport' content='width=device-width, initial-scale=1.0' />

      <title>{title}</title>

      <link rel='canonical' href={canonicalUrl} />

      <link rel='preconnect' href='https://fonts.gstatic.com' />
      <link
        href='https://fonts.googleapis.com/css2?family=Sunflower:wght@300;500;700&display=swap'
        rel='stylesheet'
      />

      <link rel='stylesheet' href='/main.css' />

      <link
        rel='apple-touch-icon'
        sizes='180x180'
        href='/apple-touch-icon.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='32x32'
        href='/favicon-32x32.png'
      />
      <link
        rel='icon'
        type='image/png'
        sizes='16x16'
        href='/favicon-16x16.png'
      />
      <link rel='manifest' href='/site.webmanifest' />

      <link
        rel='stylesheet'
        href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css'
        media='all'
        onLoad={(e) => e.currentTarget.media = 'all'}
      />
      <link
        rel='stylesheet'
        href='https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css'
        media='all'
        onLoad={(e) => e.currentTarget.media = 'all'}
      />

      <script src='/load-highlight-js.js'></script>
    </head>

    <body className='bg-night text-sky font-sunflower font-light flex flex-col items-center'>
      {children}
    </body>
  </html>
);
