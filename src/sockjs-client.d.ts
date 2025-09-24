declare module 'sockjs-client' {
  interface SockJSOptions {
    server?: string;
    sessionId?: number | (() => string);
    transports?: string | string[];
  }

  interface SockJS {
    close(code?: number, reason?: string): void;
    send(data: any): void;
    onopen: ((event: Event) => void) | null;
    onmessage: ((event: MessageEvent) => void) | null;
    onclose: ((event: CloseEvent) => void) | null;
    onerror: ((event: Event) => void) | null;
    readyState: number;
    url: string;
  }

  interface SockJSClass {
    new (url: string, protocols?: string | string[], options?: SockJSOptions): SockJS;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
  }

  const SockJS: SockJSClass;
  export = SockJS;
}






