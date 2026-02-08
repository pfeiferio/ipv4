import {describe, test} from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";

describe('IPv4Address.sharedPrefixLength()', () => {
  test('identical addresses have full /32 prefix', () => {
    const a = ipV4('1.1.1.1')
    const b = ipV4('1.1.1.1')

    assert.strictEqual(a.sharedPrefixLength(b), 32)
  })

  test('addresses differing in last bit', () => {
    const a = ipV4('192.168.1.1')
    const b = ipV4('192.168.1.2')

    assert.strictEqual(a.sharedPrefixLength(b), 30)
  })

  test('different subnets', () => {
    const a = ipV4('192.168.1.1')
    const b = ipV4('192.168.2.1')

    assert.strictEqual(a.sharedPrefixLength(b), 22)
  })

  test('completely different addresses', () => {
    const a = ipV4('0.0.0.0')
    const b = ipV4('255.255.255.255')

    assert.strictEqual(a.sharedPrefixLength(b), 0)
  })
})
