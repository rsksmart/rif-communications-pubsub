import chai from 'chai'
import getLibp2p from '../../src/libp2p/nodejs'
import Libp2p from 'libp2p'
import PeerId from 'peer-id'

function sleep<T> (ms: number, ...args: T[]): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(...args), ms))
}

const expect = chai.expect

describe('Libp2p', function () {
  let l1: Libp2p
  const peerId = 'QmZGZ4o7yevkDFgokE8dWJwGd1tixQFYqPQE7vp4t5iyeN'

  before(async () => {
    l1 = await getLibp2p({ peerId: PeerId.createFromB58String(peerId) })
    await sleep(1000)
  })

  it('should have correct peerId', () => {
    const pid = l1?.peerId?.toB58String()
    expect(pid).to.eq(peerId)
  })
})
