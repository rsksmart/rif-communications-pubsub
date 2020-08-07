import sinon from 'sinon'
import chai from 'chai'

import createRoom, { Room } from '../../src'

function sleep<T> (ms: number, ...args: T[]): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(...args), ms))
}

const expect = chai.expect

describe('PubSub messaging', function () {
  const roomName = '0x0'
  const roomName2 = '0x1'
  let provider: Room
  let consumer1: Room
  let consumer2: Room

  before(async () => {
    provider = await createRoom(roomName)
    consumer1 = await createRoom(roomName)
    consumer2 = await createRoom(roomName2)
  })

  it('provider should receive message it broadcasts', async () => {
    const spy = sinon.spy()
    const msg = 'hi'
    provider.on('message', spy)
    provider.broadcast(msg)

    // TODO: figure out way how to do this without sleep
    await sleep(50)

    sinon.assert.calledOnce(spy)
    const [{ from, data }] = spy.lastCall.args

    expect(from).to.equal(provider.peerId)
    expect(data.toString()).to.equal(msg)
  })
})
