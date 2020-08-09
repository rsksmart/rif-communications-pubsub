import Emittery from 'emittery'
import diff from 'hyperdiff'
import Libp2p from 'libp2p'

import { toBuffer } from '../utils'

export interface Options {
  pollInterval?: number
}

export const DEFAULT_OPTIONS = {
  pollInterval: 1000
}

export default class PubSubRoom extends Emittery {
  protected lp2p: Libp2p
  protected topic: string
  protected connectedPeers: string[]
  protected interval: NodeJS.Timeout

  constructor (libp2p: Libp2p, topic: string, options?: Options) {
    super()

    this.lp2p = libp2p
    this.topic = topic
    this.connectedPeers = []

    this.onMessage = this.onMessage.bind(this)
    this.pollPeers = this.pollPeers.bind(this)

    if (!this.libp2p.pubsub) {
      throw new Error('pubsub has not been configured')
    }

    this.interval = setInterval(
      this.pollPeers,
      options?.pollInterval || DEFAULT_OPTIONS.pollInterval
    )

    this.libp2p.pubsub.subscribe(this.topic, this.onMessage)
  }

  /**
   * Periodically poll connectedPeers for latest messages
   *
   * @emits peer joined  When new peer joins the topic
   * @emits peer left    When peer leaves the topic
   */
  private async pollPeers (): Promise<void> {
    const newPeers = (await this.libp2p.pubsub.getSubscribers(this.topic)).sort()

    const differences = diff(this.connectedPeers, newPeers)

    differences.added.forEach((peer: string) => this.emit('peer joined', peer))
    differences.removed.forEach((peer: string) => this.emit('peer left', peer))

    if (differences.added.length > 0 || differences.removed.length > 0) {
      this.connectedPeers = newPeers
    }
  }

  private onMessage (message: Buffer): void {
    this.emit('message', message)
  }

  public get peerId (): string {
    return this.libp2p.peerId.toB58String()
  }

  public get peers (): string[] {
    return this.connectedPeers.slice(0)
  }

  public get libp2p (): Libp2p {
    return this.lp2p
  }

  public hasPeer (peer: string): boolean {
    return Boolean(this.connectedPeers.find(p => p.toString() === peer.toString()))
  }

  public leave (): void {
    clearInterval(this.interval)
    this.libp2p.pubsub.unsubscribe(this.topic, this.onMessage)
    this.emit('unsubscribed')
  }

  /**
   * Broacast message to the topic
   */
  public async broadcast (message: string | Buffer): Promise<void> {
    const msg = toBuffer(message)

    await this.libp2p.pubsub.publish(this.topic, msg)
  }
}

module.exports = PubSubRoom
