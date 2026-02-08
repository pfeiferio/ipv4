import {describe, test} from 'node:test';
import assert from 'node:assert/strict';
import {intToIp, ipToInt, getNetworkAddress, parseStringToIp} from "../dist/utils.js";


describe('IPv4 Utils', () => {

  describe('intToIp() Exceptions', () => {
    test('should throw on non-integers', () => {
      assert.throws(() => intToIp('123'), {message: 'Invalid IPv4 integer'});
    });

    test('should throw on out of range numbers', () => {
      assert.throws(() => intToIp(-1), {message: 'Invalid IPv4 integer'});
      assert.throws(() => intToIp(0xFFFFFFFF + 1), {message: 'Invalid IPv4 integer'});
    });
  });

  describe('ipToInt() Exceptions', () => {
    test('should throw if more than one slash', () => {
      assert.throws(() => ipToInt('1.2.3.4/24/12'), {
        message: 'Invalid IPv4 address format: too many "/" separators'
      });
    });

    test('should throw if not exactly 4 octets', () => {
      assert.throws(() => ipToInt('192.168.1'), {
        message: 'IPv4 address must have exactly 4 octets'
      });
    });

    test('should throw on invalid octet types', () => {
      assert.throws(() => ipToInt('192.168.1.abc'), /is not a valid integer/);
    });

    test('should throw on octets out of range', () => {
      assert.throws(() => ipToInt('192.168.1.256'), /is out of range/);
      assert.throws(() => ipToInt('192.168.1.-1'), /is out of range/);
    });
  });

  describe('parseStringToIp() Exceptions', () => {
    test('should throw on invalid prefix format', () => {
      assert.throws(() => parseStringToIp('192.168.1.1/abc'), /is not a valid integer/);
    });

    test('should throw on prefix out of range', () => {
      assert.throws(() => parseStringToIp('192.168.1.1/33'), /is out of range \(0-32\)/);
      assert.throws(() => parseStringToIp('192.168.1.1/-1'), /is out of range \(0-32\)/);
    });
  });

  describe('getNetworkAddress()', () => {
    test('should throw on invalid prefix', () => {
      assert.throws(() => getNetworkAddress(3232281089, 33), {message: 'Invalid prefix'});
    });

    test('should correctly calculate network address', () => {
      // 192.168.178.1/24 -> 192.168.178.0
      const ip = 3232281089;
      const expected = 3232281088;
      assert.equal(getNetworkAddress(ip, 24), expected);
    });

    test('should handle prefix 0', () => {
      assert.equal(getNetworkAddress(3232281089, 0), 0);
    });
  });

  describe('Success Cases', () => {
    test('intToIp should convert correctly', () => {
      assert.equal(intToIp(3232281089), '192.168.178.1');
    });

    test('ipToInt should convert correctly', () => {
      assert.equal(ipToInt('192.168.178.1'), 3232281089);
    });

    test('parseStringToIp should handle prefixOverride', () => {
      const result = parseStringToIp('192.168.1.1/24', 32);
      assert.equal(result.prefix, 32);
    });
  });

  describe('getNetworkAddress() Exceptions', () => {
    test('should throw on invalid IP integer (out of range/type)', () => {
      // Test: Negative Zahl
      assert.throws(() => getNetworkAddress(-1, 24), {
        message: 'Invalid IPv4 integer'
      });

      // Test: Über dem 32-Bit Limit (0xFFFFFFFF)
      assert.throws(() => getNetworkAddress(4294967296, 24), {
        message: 'Invalid IPv4 integer'
      });

      // Test: Falscher Datentyp (String)
      assert.throws(() => getNetworkAddress('3232281089', 24), {
        message: 'IPv4 address must have exactly 4 octets'
      });

      // Test: Keine Ganzzahl (Float)
      assert.throws(() => getNetworkAddress(3232281089.5, 24), {
        message: 'Invalid IPv4 integer'
      });
    });

    test('should throw on invalid prefix range', () => {
      assert.throws(() => getNetworkAddress(3232281089, -1), {
        message: 'Invalid prefix'
      });
      assert.throws(() => getNetworkAddress(3232281089, 33), {
        message: 'Invalid prefix'
      });
    });
  });

  describe('getNetworkAddress() Edge Cases', () => {
    test('should return 0 for prefix 0 (Anycast/Default Route)', () => {
      // Egal welche IP, bei /0 muss die Netzwerkadresse 0.0.0.0 (0) sein
      assert.equal(getNetworkAddress(3232281089, 0), 0);
      assert.equal(getNetworkAddress(0xFFFFFFFF, 0), 0);
    });
  });

  describe('getNetworkAddress() Exceptions', () => {
    test('should throw on invalid IP integer (out of range/type)', () => {
      // Test Untergrenze
      assert.throws(() => getNetworkAddress(-1, 24), {
        message: 'Invalid IPv4 integer'
      });

      // Test Obergrenze (über 32-bit)
      assert.throws(() => getNetworkAddress(0xFFFFFFFF + 1, 24), {
        message: 'Invalid IPv4 integer'
      });

      // Test Datentyp (kein Integer)
      assert.throws(() => getNetworkAddress('3232281089', 24), {
        message: 'IPv4 address must have exactly 4 octets'
      });

      assert.throws(() => getNetworkAddress(1.5, 24), {
        message: 'Invalid IPv4 integer'
      });
    });

    test('should throw on invalid prefix range', () => {
      assert.throws(() => getNetworkAddress(3232281089, -1), {
        message: 'Invalid prefix'
      });
      assert.throws(() => getNetworkAddress(3232281089, 33), {
        message: 'Invalid prefix'
      });
    });
  });
});
