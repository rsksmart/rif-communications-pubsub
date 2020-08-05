declare module 'm-peer-id' {
    export default class PeerId {
      constructor(id: Buffer, privKey?: string, pubKey?: string)

      static create(opts?: {bits: number, keyType: 'rsa' | 'ed25519' | 'secp256k1'}): PeerId

      toB58String(): string
    }
}
