import chai from 'chai'

import getLibp2p from '../../src/libp2p/nodejs'
import { DirectChat, PROTOCOL } from '../../src/'
import type Libp2p from 'libp2p'
import PeerId from 'peer-id'
import pipe from 'it-pipe'

const expect = chai.expect

const msg =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eget lacus lacus. Nullam vehicula est nunc. Integer a finibus odio, non fermentum felis. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur efficitur sem dolor, et blandit nunc tincidunt vel. Praesent lacinia augue id lorem scelerisque finibus. Ut lobortis dolor ipsum. Integer euismod sollicitudin ligula, ut viverra mauris aliquet id. Etiam faucibus eros nec odio consequat commodo. Duis congue sit amet tortor quis semper. Nulla ac leo sit amet erat tristique pulvinar id quis erat. Morbi venenatis augue vel metus mollis molestie. Donec finibus dapibus purus. Nam volutpat vitae elit nec faucibus. Duis eget bibendum diam. Quisque elementum ac elit et faucibus. Sed sagittis lacus vel scelerisque vestibulum. Proin vehicula lacus luctus, placerat ex et, pulvinar lacus. Nunc ornare commodo lacus, vel molestie mauris dapibus sed. Pellentesque molestie a libero quis facilisis. Ut mi purus, varius in nisi et, interdum eleifend eros. Integer volutpat eros felis, ut euismod nibh tincidunt sit amet. Mauris a est eros. Etiam imperdiet tincidunt ante quis facilisis. Vestibulum id nisl sed diam faucibus placerat. Nullam a interdum erat. Phasellus maximus mauris at dignissim imperdiet. Nunc commodo eu augue ut volutpat. Sed in sagittis nisi. Cras non ante molestie, pharetra dolor sed, interdum ex. Sed cursus ipsum odio, id viverra libero venenatis sed. Suspendisse ipsum dolor, hendrerit a purus sit amet, venenatis vulputate sapien. Pellentesque quis quam non dolor euismod fringilla vel a leo. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nam ornare tincidunt libero, ac dictum nisl pellentesque vel. Sed congue dui sed nisl faucibus, ut vehicula lorem eleifend. Praesent vulputate ultrices commodo. Ut augue massa, gravida nec sapien quis, tempor viverra justo. Donec eros felis, aliquam quis lectus sit amet, laoreet pulvinar orci. Sed ac lacinia massa. Sed aliquet, orci eget eleifend pretium, mauris lectus dapibus enim, quis efficitur magna orci quis est. Curabitur eros elit, consequat a vulputate nec, euismod et velit. Fusce ac iaculis magna. Proin ut tellus eget sem mattis iaculis. Cras dapibus ipsum vel finibus lacinia.Duis porttitor blandit lacus, vitae lacinia justo pharetra a. Integer nec blandit quam. Maecenas et laoreet odio, et consectetur tortor. Fusce ut sapien ut nisl aliquam gravida eu at quam. Donec id felis arcu. Etiam sit amet eros ut ex sodales sagittis. Suspendisse scelerisque, justo ac dapibus rutrum, leo neque fermentum enim, ut varius leo tortor sed felis. Sed nec orci nec libero bibendum pharetra. Nam interdum nibh in magna sodales ultrices. Nulla sollicitudin nunc nunc. Sed urna mi, iaculis in nisl id, condimentum commodo tortor. Nulla auctor ipsum et imperdiet dignissim. Mauris sit amet ipsum auctor, cursus tortor sed, egestas nunc. Nunc fringilla rhoncus enim vitae eleifend.'

const libp2pconfig = {
  addresses: {
    // TODO: remove
    // add a listen address (localhost) to accept TCP connections on a random port
    listen: ['/ip4/127.0.0.1/tcp/0']
  },
  config: { peerDiscovery: { bootstrap: { enabled: false } } }
}

describe('Direct protocol messaging', function () {
  this.timeout(5000)

  let l1: Libp2p
  let l2: Libp2p
  let node1: DirectChat
  let node2a: DirectChat
  let node2b: DirectChat

  before(async () => {
    l1 = await getLibp2p(libp2pconfig)
    l2 = await getLibp2p(libp2pconfig)
    node1 = DirectChat.getDirectChat(l1)
    node2a = DirectChat.getDirectChat(l2)
    node2b = DirectChat.getDirectChat(l2)
  })

  it('node receives direct message', async () => {
    const promise = node1.once('message')
    node2a.sendTo(node1.peerId, msg)
    const message = await promise

    expect(message).to.have.property('from', node2a.peerId)
    expect(message).to.have.property('to', node1.peerId)
    expect(message).to.have.property('data').and.to.eql(msg)
  })

  it('node receives repeated direct message', async () => {
    const promise = node1.once('message')
    node2a.sendTo(node1.peerId, msg)
    const message = await promise

    expect(message).to.have.property('from', node2a.peerId)
    expect(message).to.have.property('to', node1.peerId)
    expect(message).to.have.property('data').and.to.eql(msg)
  })

  it('bidirectional communication', async () => {
    let promise = node1.once('message')
    node2a.sendTo(node1.peerId, msg)
    const message = await promise

    promise = node2a.once('message')
    node1.sendTo(node2a.peerId, msg)
    const message2 = await promise

    expect(message).to.have.property('from', node2a.peerId)
    expect(message).to.have.property('to', node1.peerId)
    expect(message).to.have.property('data').and.to.eql(msg)
    expect(message2).to.have.property('from', node1.peerId)
    expect(message2).to.have.property('to', node2a.peerId)
    expect(message2).to.have.property('data').and.to.eql(msg)
  })

  it('peers with same libp2p instance get direct message', async () => {
    const promise2 = node2a.once('message')
    const promise3 = node2b.once('message')
    node1.sendTo(node2a.peerId, msg)
    const message2 = await promise2
    const message3 = await promise3

    expect(message2).to.have.property('from', node1.peerId)
    expect(message2).to.have.property('to', node2a.peerId)
    expect(message2).to.have.property('data').and.to.eql(msg)
    expect(message3).to.have.property('from', node1.peerId)
    expect(message3).to.have.property('to', node2b.peerId)
    expect(message3).to.have.property('data').and.to.eql(msg)
  })

  it('should throw on non JSON message', async () => {
    const promise = node2a.once('error')

    const p = PeerId.createFromCID(node2a.peerId)
    const peerInfo = l1.peerStore.get(p)
    const { stream } = await l1.dialProtocol(peerInfo!.id, PROTOCOL)

    const msg = {
      from: l1.peerId.toB58String(),
      to: node2a.peerId,
      data: Buffer.from('{hello').toString('hex')
    }

    await pipe(
      JSON.stringify(msg),
      stream
    )

    const err = await promise

    expect(err).to.be.instanceof(Error)
  })
})
