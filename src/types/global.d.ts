/// <reference types="node" />

declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.scss' {
  const content: Record<string, string>;
  export default content;
}

declare module '*.sass' {
  const content: Record<string, string>;
  export default content;
}

// Specifically for RainbowKit and other CSS imports
declare module '@rainbow-me/rainbowkit/styles.css';

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      GATEWAY: string;
      NEXT_PUBLIC_JWT: string;
      NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID: string;
      NODE_ENV: 'development' | 'production' | 'test';
    }
  }
}

export {};