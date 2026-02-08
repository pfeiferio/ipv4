import {describe, test} from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";

describe('IPv4Network.overlaps()', () => {
  test('should detect overlapping networks', () => {
    const a = ipV4('192.168.1.0/24').network()
    const b = ipV4('192.168.1.128/25').network()
    assert.strictEqual(a.overlaps(b), true)
  })

  test('should detect non-overlapping networks', () => {
    const a = ipV4('192.168.1.0/24').network()
    const b = ipV4('192.168.2.0/24').network()
    assert.strictEqual(a.overlaps(b), false)
  })

  test('/32 host routes overlap only if identical', () => {
    const a = ipV4('1.1.1.1/32').network()
    const b = ipV4('1.1.1.1/32').network()
    const c = ipV4('1.1.1.2/32').network()

    assert.strictEqual(a.overlaps(b), true)
    assert.strictEqual(a.overlaps(c), false)
  })

  test('/0 network overlaps with everything', () => {
    const all = ipV4('0.0.0.0/0').network()

    assert.strictEqual(all.overlaps('1.1.1.1/32'), true)
    assert.strictEqual(all.overlaps('192.168.1.0/24'), true)
  })
  test('subnet and supernet overlap', () => {
    const supernet = ipV4('10.0.0.0/8').network()
    const subnet = ipV4('10.1.2.0/24').network()

    assert.strictEqual(supernet.overlaps(subnet), true)
    assert.strictEqual(subnet.overlaps(supernet), true)
  })
})
