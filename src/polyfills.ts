/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 */

import 'zone.js/dist/zone';  // Included with Angular CLI.

// Polyfills pour WebSocket et crypto
if (typeof global === 'undefined') {
  (window as any).global = window;
}

if (typeof process === 'undefined') {
  (window as any).process = { env: {} };
}

// Polyfill pour Buffer si nécessaire
if (typeof Buffer === 'undefined') {
  (window as any).Buffer = require('buffer').Buffer;
}









