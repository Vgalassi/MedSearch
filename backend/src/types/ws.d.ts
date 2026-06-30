declare module "ws" {
  import { EventEmitter } from "node:events";
  import type { IncomingMessage, Server } from "node:http";

  export class WebSocket extends EventEmitter {
    static readonly CONNECTING: number;
    static readonly OPEN: number;
    static readonly CLOSING: number;
    static readonly CLOSED: number;

    readonly readyState: number;

    send(data: string): void;
    close(code?: number, reason?: string): void;
    terminate(): void;
  }

  export class WebSocketServer extends EventEmitter {
    constructor(options: {
      port?: number;
      server?: Server;
      path?: string;
      noServer?: boolean;
    });

    on(
      event: "connection",
      listener: (socket: WebSocket, request: IncomingMessage) => void,
    ): this;
    on(event: "error", listener: (error: Error) => void): this;

    close(callback?: () => void): void;
  }
}
