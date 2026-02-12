# @pfeiferio/ipv4

![npm](https://img.shields.io/npm/v/@pfeiferio/ipv4)
![types](https://img.shields.io/npm/types/@pfeiferio/ipv4)
![license](https://img.shields.io/npm/l/@pfeiferio/ipv4)
![downloads](https://img.shields.io/npm/dm/@pfeiferio/ipv4)
![node](https://img.shields.io/node/v/@pfeiferio/ipv4)
[![codecov](https://codecov.io/gh/pfeiferio/ipv4/branch/main/graph/badge.svg)](https://codecov.io/gh/pfeiferio/ipv4)

Strict and well-tested IPv4 address and network utilities for Node.js.

* ESM only
* Node.js ≥ 18
* TypeScript-first
* No dependencies
* Full test coverage

---

## Installation

```bash
npm install @pfeiferio/ipv4
```

---

## Basic Usage

```js
import { ipV4 } from '@pfeiferio/ipv4'

const ip = ipV4('192.168.1.10/24')

ip.address            // "192.168.1.10"
ip.prefix             // 24
ip.addressWithCidr    // "192.168.1.10/24"
ip.toInteger()        // 3232235786
```

Default prefix is `/32`.

---

## IPv4Address examples

### Create addresses

```js
ipV4('1.1.1.1')
ipV4('1.1.1.1/32')
ipV4(3232235777)
```

### Prefix handling (immutable)

```js
const ip = ipV4('10.0.0.1')
const withPrefix = ip.withPrefix(16)

ip.addressWithCidr        // "10.0.0.1/32"
withPrefix.addressWithCidr // "10.0.0.1/16"
```

### Address comparison

```js
ip.equals(ipV4('10.0.0.1/32'))        // true
ip.isSameAddress(ipV4('10.0.0.1/8'))  // true
```

### Navigation

```js
ipV4('1.1.1.1').next().address   // "1.1.1.2"
ipV4('1.1.1.1').prev().address   // "1.1.1.0"
```

---

## IPv4Network examples

### Create networks

```js
const net = ipV4('192.168.1.10/24').network()

net.addressWithCidr   // "192.168.1.0/24"
net.size              // 256
net.hostCount         // 254
```

### Network helpers

```js
net.firstHost.address   // "192.168.1.1"
net.lastHost.address    // "192.168.1.254"
net.broadcast.address   // "192.168.1.255"
```

### Containment & relations

```js
net.contains('192.168.1.42')                 // true
net.overlaps('192.168.1.128/25')             // true
net.containsNetwork('192.168.1.128/25')      // true
net.isSubnetOf('192.168.0.0/16')              // true
net.isSupernetOf('192.168.1.128/25')          // true
```

---

## Iteration

### Usable hosts

```js
for (const host of net.hosts()) {
  console.log(host.address)
}
```

### All addresses

```js
for (const addr of net.addresses()) {
  console.log(addr.address)
}
```

---

## Utilities

```js
import { ipToInt, intToIp } from '@pfeiferio/ipv4'

ipToInt('192.168.1.1')   // 3232235777
intToIp(3232235777)      // "192.168.1.1"
```

---

## Design notes

* Prefix defaults to `/32`
* Network addresses are always normalized
* No implicit magic
* `/0`, `/31`, `/32` handled correctly

---

## License

MIT
