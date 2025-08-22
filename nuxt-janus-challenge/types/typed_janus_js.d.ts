declare module 'typed_janus_js' {
  export class Janus {
    static init(options: any): Promise<void>
    constructor(options: any)
    attach(options: any): void
    destroy(): void
  }
}
