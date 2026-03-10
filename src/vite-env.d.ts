/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_USE_MOCK_STORAGE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module "tailwindcss-animate" {
    const plugin: any;
    export default plugin;
}
