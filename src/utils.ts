import Libp2p from 'libp2p'
import PeerId from 'peer-id'

export const toBuffer = (message: string|Buffer): Buffer => {
  if (Buffer.isBuffer(message)) {
    return message
  }
  return Buffer.from(message)
}

export const createLibP2P = async (config: any): Promise<Libp2p> => {
  let libp2p

  if (config?.peerId instanceof PeerId) {
    libp2p = new Libp2p(config)
  } else {
    const peerId = await PeerId.create()
    libp2p = new Libp2p({ ...config, peerId })
  }

  await libp2p.start()
  return libp2p
}
