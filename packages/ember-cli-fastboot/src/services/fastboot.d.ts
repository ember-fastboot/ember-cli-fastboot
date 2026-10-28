import Service from '@ember/service';

export interface FastBootHeaders {
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  append(name: string, value: string): void;
  delete(name: string): void;
  entries(): IterableIterator<[string, string]>;
}

export interface FastBootRequest {
  method: string;
  path: string;
  protocol: string;
  headers: FastBootHeaders;
  queryParams: Record<string, string>;
  cookies: Record<string, string>;
  body: unknown;
  /** The Host header. It throws when the host does not match `allowedHosts`. */
  readonly host: string;
}

export interface FastBootResponse {
  statusCode: number;
  headers: FastBootHeaders;
}

export interface Shoebox {
  put(key: string, value: unknown): void;
  retrieve<T = unknown>(key: string): T | undefined;
}

export default class FastBootService extends Service {
  readonly isFastBoot: boolean;
  readonly request: FastBootRequest | null;
  readonly response: FastBootResponse | undefined;
  readonly metadata: unknown;
  readonly shoebox: Shoebox;
  deferRendering(promise: Promise<unknown>): void;
}

declare module '@ember/service' {
  interface Registry {
    fastboot: FastBootService;
  }
}
