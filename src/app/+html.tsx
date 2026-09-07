import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

const base = '/poufer';

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#10081f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Poufer" />
        <link rel="manifest" href={`${base}/manifest.webmanifest`} />
        <link rel="icon" href={`${base}/icon.svg`} />
        <link rel="apple-touch-icon" href={`${base}/icons/apple-touch-icon.png`} />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html, body, #root {
                width: 100%;
                height: 100%;
                min-height: 100%;
                margin: 0;
                overflow: hidden;
                background: #10081f;
              }
              body {
                overscroll-behavior: none;
                touch-action: manipulation;
              }
              #root {
                min-height: 100dvh;
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
