export const toBuffer = (message: string|Buffer): Buffer => {
  if (Buffer.isBuffer(message)) {
    return message
  }
  return Buffer.from(message)
}
