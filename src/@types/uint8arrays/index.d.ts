declare module 'uint8arrays/from-string' {
  export default function (str: string, encoding?: string): Uint8Array
}
declare module 'uint8arrays/to-string' {
  export default function (array: Uint8Array, encoding?: string): string
}
