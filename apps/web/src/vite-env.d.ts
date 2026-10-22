/// <reference types="vite/client" />

/**
 * Compile-time flag (vite.config.ts `define`): true only for the browser-only GitHub Pages build.
 * Being a literal lets the bundler drop the in-browser API from the normal build entirely.
 */
declare const __STATIC_MODE__: boolean;
