import {describe, test} from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";
import {IPv4Address} from "../dist/IPv4Address.js";

describe('IPv4Address - Copy Constructor Bugs', () => {
  test('prefixOverride must not affect address or integer value', () => {
    const original = ipV4('192.168.1.1/24');
    const copied = new IPv4Address(original, 16);

    assert.strictEqual(copied.address, '192.168.1.1');
    assert.strictEqual(copied.toInteger(), 3232235777);
    assert.strictEqual(copied.prefix, 16);
  });
});
