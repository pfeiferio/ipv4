import {describe, test} from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";

describe('IPv4Network.containsNetwork()', () => {
  test('supernet contains subnet', () => {
    const a = ipV4('10.0.0.0/8').network()
    const b = ipV4('10.1.2.0/24').network()
    assert.strictEqual(a.containsNetwork(b), true)
  })

  test('subnet does not contain supernet', () => {
    const a = ipV4('10.1.2.0/24').network()
    const b = ipV4('10.0.0.0/8').network()
    assert.strictEqual(a.containsNetwork(b), false)
  })

  test('identical networks contain each other', () => {
    const a = ipV4('192.168.1.0/24').network()
    const b = ipV4('192.168.1.0/24').network()
    assert.strictEqual(a.containsNetwork(b), true)
  })

  test('/0 contains everything', () => {
    const all = ipV4('0.0.0.0/0').network()
    const net = ipV4('192.168.1.0/24').network()
    assert.strictEqual(all.containsNetwork(net), true)
  })
})

describe('IPv4Network subnet/supernet helpers', () => {
  test('isSubnetOf()', () => {
    const subnet = ipV4('10.1.2.0/24').network()
    const supernet = ipV4('10.0.0.0/8').network()

    assert.strictEqual(subnet.isSubnetOf(supernet), true)
    assert.strictEqual(supernet.isSubnetOf(subnet), false)
  })

  test('isSupernetOf()', () => {
    const supernet = ipV4('10.0.0.0/8').network()
    const subnet = ipV4('10.1.2.0/24').network()

    assert.strictEqual(supernet.isSupernetOf(subnet), true)
    assert.strictEqual(subnet.isSupernetOf(supernet), false)
  })

  test('identical networks', () => {
    const a = ipV4('192.168.1.0/24').network()
    const b = ipV4('192.168.1.0/24').network()

    assert.strictEqual(a.isSubnetOf(b), true)
    assert.strictEqual(a.isSupernetOf(b), true)
  })
})

