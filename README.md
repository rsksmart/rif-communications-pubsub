# RIF Communications PubSub

[![CircleCI](https://flat.badgen.net/circleci/github/rsksmart/rif-communications-pubsub/master)](https://circleci.com/gh/rsksmart/rif-communications-pubsub/)
[![Dependency Status](https://david-dm.org/rsksmart/rif-communications-pubsub.svg?style=flat-square)](https://david-dm.org/rsksmart/rif-communications-pubsub)
[![](https://img.shields.io/badge/made%20by-IOVLabs-blue.svg?style=flat-square)](http://iovlabs.org)
[![](https://img.shields.io/badge/project-RIF%20Storage-blue.svg?style=flat-square)](https://www.rifos.org/)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-brightgreen.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](https://github.com/feross/standard)
[![Managed by tAsEgir](https://img.shields.io/badge/%20managed%20by-tasegir-brightgreen?style=flat-square)](https://github.com/auhau/tasegir)
![](https://img.shields.io/badge/npm-%3E%3D6.0.0-orange.svg?style=flat-square)
![](https://img.shields.io/badge/Node.js-%3E%3D10.0.0-orange.svg?style=flat-square)

> Library for creating a PubSub room with libp2p

This project extends the [ipfs-pubsub-room](https://github.com/ipfs-shipyard/ipfs-pubsub-room), rewriting it in typescript and adding libp2p node.

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [License](#license)

## Install

### npm

```sh
> npm install @rsksmart/rif-communications-pubsub
```

**WARNING: This package still have not been released!**

## Usage

Example of usage:
```ts
import { Room, DirectChat, createLibP2P, Message, MessageDirect } from '@rsksmart/rif-communications-pubsub'

const libp2p = await createLibP2P()
const room = createRoom(libp2p, 'my_topic')

room.on('peer:joined', (peer: string) => {
  console.log('Peer joined the room ', peer)
})

room.on('peer:left', (peer: string) => {
  console.log('Peer left the room', peer)
})

room.on('message', ({from, data}: Message) => {
  console.log('New message from ', peer, ' content ', data)
})

room.on('unsubscribed', () => {
  console.log('Unsubscribed from the room room')
})

const directChat = DirectChat.getDirectChat(libp2p)

directChat.on('message', ({from, to, data}: MessageDirect) => {
  console.log('New direct message from ', peer, ' to ', to, ' content ', data)
})
```

## API
```ts
const libp2p = await createLibP2P()

const room = createRoom(libp2p, topic) // Creates room with specific topic

// Methods
room.leave() // Leave the room
async room.broadcast(message: string | buffer) // Send message to the room

// Getters
room.peerId
room.peers
room.hasPeer(peerId: string)
room.libp2p

// Listeners
room.on('peer:joined', (peerId: string) => {})
room.on('peer:left', (peerId: string) => {})
room.on('message', (message: Message) => {})
room.on('unsubscribed', () => {})
room.on('error', (error: Error) => {})

const directChat = DirectChat.getDirectChat(libp2p)

// Methods
directChat.sendTo('somePeerId', {level: 'info', msg: 'hello world with custom object'})

// Listeners
directChat.on('message', (message: MessageDirect) => {})
directChat.on('error', (error: Error) => {})
```

## License

[MIT](./LICENSE)
