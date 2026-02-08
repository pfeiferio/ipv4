import {describe, test} from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";

describe('IPv4Network.contains() - /0 edge case', () => {
  test('/0 network should contain all IPv4 addresses', () => {
    const net = ipV4('0.0.0.0/0').network();
    assert.strictEqual(net.contains('0.0.0.0'), true);
    assert.strictEqual(net.contains('1.1.1.1'), true);
    assert.strictEqual(net.contains('192.168.1.1'), true);
    assert.strictEqual(net.contains('255.255.255.255'), true);
  });
});

describe('IPv4Network.contains() - /32 edge case', () => {
  test('/32 network should only contain its own address', () => {
    const net = ipV4('192.168.1.1/32').network();

    assert.strictEqual(net.contains('192.168.1.1'), true);
    assert.strictEqual(net.contains('192.168.1.2'), false);
    assert.strictEqual(net.contains('192.168.1.0'), false);
  });
});

describe('IPv4Network.contains() - consistency checks', () => {
  test('network address and broadcast must be inside the network', () => {
    const net = ipV4('192.168.178.123/24').network();

    assert.strictEqual(net.contains(net.address), true);
    assert.strictEqual(net.contains(net.broadcast), true);
  });
});

test('contains() should work with IPv4Address instances', () => {
  const net = ipV4('10.0.0.0/8').network();
  const ip = ipV4('10.123.45.67');

  assert.strictEqual(net.contains(ip), true);
});
