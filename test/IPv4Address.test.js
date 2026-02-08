import { test, describe } from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";
import {IPv4Address} from "../dist/IPv4Address.js";

describe('IPv4Address - Basic Parsing', () => {
  test('should parse simple IP address', () => {
    const ip = ipV4('192.168.1.1');
    assert.strictEqual(ip.address, '192.168.1.1');
    assert.strictEqual(ip.prefix, 32);
    assert.strictEqual(ip.toInteger(), 3232235777);
  });

  test('should parse IP with CIDR notation', () => {
    const ip = ipV4('192.168.178.1/24');
    assert.strictEqual(ip.address, '192.168.178.1');
    assert.strictEqual(ip.prefix, 24);
    assert.strictEqual(ip.addressWithCidr, '192.168.178.1/24');
  });

  test('should normalize leading zeros', () => {
    const ip = ipV4('192.168.178.001/24');
    assert.strictEqual(ip.address, '192.168.178.1');
    assert.strictEqual(ip.toString(), '192.168.178.1');
  });

  test('should parse from integer', () => {
    const ip = ipV4(3232281089);
    assert.strictEqual(ip.address, '192.168.178.1');
    assert.strictEqual(ip.prefix, 32);
    assert.strictEqual(ip.addressWithCidr, '192.168.178.1/32');
  });

  test('should copy IPv4Address instance', () => {
    const ip1 = ipV4('192.168.1.1/24');
    const ip2 = new IPv4Address(ip1);
    assert.strictEqual(ip2.address, '192.168.1.1');
    assert.strictEqual(ip2.prefix, 24);
  });

  test('should copy IPv4Address instance with prefix override', () => {
    const ip1 = ipV4('192.168.1.1/24');
    const ip2 = new IPv4Address(ip1, 16);
    assert.strictEqual(ip2.address, '192.168.1.1');
    assert.strictEqual(ip2.prefix, 16);
  });
});

describe('IPv4Address - Validation', () => {
  test('should reject invalid octet value', () => {
    assert.throws(() => ipV4('999.168.1.1'), /out of range/);
  });

  test('should reject negative octet', () => {
    assert.throws(() => ipV4('192.-1.1.1'), /out of range/);
  });

  test('should reject non-integer octet', () => {
    assert.throws(() => ipV4('192.168.1.1.5'), /exactly 4 octets/);
  });

  test('should reject invalid prefix', () => {
    assert.throws(() => ipV4('192.168.1.1/33'), /out of range/);
  });

  test('should reject negative prefix', () => {
    assert.throws(() => ipV4('192.168.1.1/-1'), /out of range/);
  });

  test('should reject too many slashes', () => {
    assert.throws(() => ipV4('192.168.1.1/24/32'), /too many/);
  });

  test('should reject invalid type', () => {
    assert.throws(() => new IPv4Address({}), /Invalid IPv4 address type/);
  });
});

describe('IPv4Address - Zero Octet Validation', () => {
  test('should allow 0.0.0.0/0', () => {
    const ip = ipV4('0.0.0.0/0');
    assert.strictEqual(ip.address, '0.0.0.0');
    assert.strictEqual(ip.prefix, 0);
  });

  test('should allow 0.0.0.0/8', () => {
    const ip = ipV4('0.0.0.0/8');
    assert.strictEqual(ip.address, '0.0.0.0');
    assert.strictEqual(ip.prefix, 8);
  });

  test('should allow 0.0.0.0/32', () => {
    const ip = ipV4('0.0.0.0/32');
    assert.strictEqual(ip.address, '0.0.0.0');
    assert.strictEqual(ip.prefix, 32);
  });

  test('should reject 0.0.0.0/24', () => {
    assert.throws(() => ipV4('0.0.0.0/24'), /First octet cannot be 0/);
  });

  test('should reject 0.1.2.3', () => {
    assert.throws(() => ipV4('0.1.2.3'), /First octet cannot be 0/);
  });

  test('should allow 0.x.x.x from integer (no validation)', () => {
    const ip = new IPv4Address(255); // 0.0.0.255
    assert.strictEqual(ip.address, '0.0.0.255');
  });
});

describe('IPv4Address - Comparison', () => {
  test('equals() should compare address and prefix', () => {
    const ip1 = ipV4('192.168.1.1/24');
    const ip2 = ipV4('192.168.1.1/24');
    assert.strictEqual(ip1.equals(ip2), true);
  });

  test('equals() should return false for different prefix', () => {
    const ip1 = ipV4('192.168.1.1/24');
    const ip2 = ipV4('192.168.1.1/32');
    assert.strictEqual(ip1.equals(ip2), false);
  });

  test('isSameAddress() should ignore prefix', () => {
    const ip1 = ipV4('192.168.1.1/24');
    const ip2 = ipV4('192.168.1.1/32');
    assert.strictEqual(ip1.isSameAddress(ip2), true);
  });

  test('isSameAddress() should work with strings', () => {
    const ip = ipV4('192.168.1.1/24');
    assert.strictEqual(ip.isSameAddress('192.168.1.1'), true);
    assert.strictEqual(ip.isSameAddress('192.168.1.2'), false);
  });
});

describe('IPv4Address - Navigation', () => {
  test('next() should increment address', () => {
    const ip = ipV4('192.168.1.1/24');
    const next = ip.next();
    assert.strictEqual(next.address, '192.168.1.2');
    assert.strictEqual(next.prefix, 24);
  });

  test('prev() should decrement address', () => {
    const ip = ipV4('192.168.1.2/24');
    const prev = ip.prev();
    assert.strictEqual(prev.address, '192.168.1.1');
    assert.strictEqual(prev.prefix, 24);
  });

  test('next() should return null at max address', () => {
    const ip = ipV4('255.255.255.255');
    assert.strictEqual(ip.next(), null);
  });

  test('prev() should return null at min address', () => {
    const ip = ipV4('0.0.0.0/0');
    assert.strictEqual(ip.prev(), null);
  });

  test('chained next/prev operations', () => {
    const ip = ipV4('192.168.1.1');
    const result = ip.next().next().prev();
    assert.strictEqual(result.address, '192.168.1.2');
  });
});

describe('IPv4Address - withPrefix', () => {
  test('should change prefix', () => {
    const ip = ipV4('192.168.1.1/24');
    const changed = ip.withPrefix(16);
    assert.strictEqual(changed.address, '192.168.1.1');
    assert.strictEqual(changed.prefix, 16);
  });

  test('should not modify original', () => {
    const ip = ipV4('192.168.1.1/24');
    ip.withPrefix(16);
    assert.strictEqual(ip.prefix, 24);
  });
});

describe('IPv4Address - Address Type Detection', () => {
  test('isPrivate() should detect 10.x.x.x', () => {
    assert.strictEqual(ipV4('10.0.0.1').isPrivate(), true);
    assert.strictEqual(ipV4('10.255.255.255').isPrivate(), true);
  });

  test('isPrivate() should detect 172.16-31.x.x', () => {
    assert.strictEqual(ipV4('172.16.0.0').isPrivate(), true);
    assert.strictEqual(ipV4('172.31.255.255').isPrivate(), true);
    assert.strictEqual(ipV4('172.15.255.255').isPrivate(), false);
    assert.strictEqual(ipV4('172.32.0.0').isPrivate(), false);
  });

  test('isPrivate() should detect 192.168.x.x', () => {
    assert.strictEqual(ipV4('192.168.0.0').isPrivate(), true);
    assert.strictEqual(ipV4('192.168.255.255').isPrivate(), true);
  });

  test('isPublic() should detect public addresses', () => {
    assert.strictEqual(ipV4('8.8.8.8').isPublic(), true);
    assert.strictEqual(ipV4('1.1.1.1').isPublic(), true);
    assert.strictEqual(ipV4('192.168.1.1').isPublic(), false);
  });

  test('isLoopback() should detect 127.x.x.x', () => {
    assert.strictEqual(ipV4('127.0.0.1').isLoopback(), true);
    assert.strictEqual(ipV4('127.255.255.255').isLoopback(), true);
    assert.strictEqual(ipV4('128.0.0.1').isLoopback(), false);
  });

  test('isLinkLocal() should detect 169.254.x.x', () => {
    assert.strictEqual(ipV4('169.254.0.0').isLinkLocal(), true);
    assert.strictEqual(ipV4('169.254.255.255').isLinkLocal(), true);
    assert.strictEqual(ipV4('169.253.0.0').isLinkLocal(), false);
  });

  test('isMulticast() should detect 224-239.x.x.x', () => {
    assert.strictEqual(ipV4('224.0.0.0').isMulticast(), true);
    assert.strictEqual(ipV4('239.255.255.255').isMulticast(), true);
    assert.strictEqual(ipV4('223.255.255.255').isMulticast(), false);
    assert.strictEqual(ipV4('240.0.0.0').isMulticast(), false);
  });

  test('isReserved() should detect 240-255.x.x.x', () => {
    assert.strictEqual(ipV4('240.0.0.0').isReserved(), true);
    assert.strictEqual(ipV4('255.255.255.255').isReserved(), true);
    assert.strictEqual(ipV4('239.255.255.255').isReserved(), false);
  });
});

describe('IPv4Address - Format Conversions', () => {
  test('reversePointer() should generate PTR record format', () => {
    assert.strictEqual(
      ipV4('192.168.178.1').reversePointer(),
      '1.178.168.192.in-addr.arpa'
    );
    assert.strictEqual(
      ipV4('8.8.8.8').reversePointer(),
      '8.8.8.8.in-addr.arpa'
    );
  });

  test('toBinary() should generate binary without dots', () => {
    assert.strictEqual(
      ipV4('192.168.178.1').toBinary(),
      '11000000101010001011001000000001'
    );
    assert.strictEqual(
      ipV4('255.255.255.255').toBinary(),
      '11111111111111111111111111111111'
    );
  });

  test('toBinaryAddress() should generate binary with dots', () => {
    assert.strictEqual(
      ipV4('192.168.178.1').toBinaryAddress(),
      '11000000.10101000.10110010.00000001'
    );
  });

  test('toHex() should generate hex without 0x prefix', () => {
    assert.strictEqual(ipV4('192.168.178.1').toHex(), 'C0A8B201');
    assert.strictEqual(ipV4('255.255.255.255').toHex(), 'FFFFFFFF');
    assert.strictEqual(ipV4('0.0.0.0').toHex(), '00000000');
  });
});

describe('IPv4Address - Static Methods', () => {
  test('isValid() should return true for valid addresses', () => {
    assert.strictEqual(IPv4Address.isValid('192.168.1.1'), true);
    assert.strictEqual(IPv4Address.isValid('192.168.1.1/24'), true);
  });

  test('isValid() should return false for invalid addresses', () => {
    assert.strictEqual(IPv4Address.isValid('999.999.999.999'), false);
    assert.strictEqual(IPv4Address.isValid('not-an-ip'), false);
    assert.strictEqual(IPv4Address.isValid('0.1.2.3'), false);
  });

  test('private() should return RFC1918 ranges', () => {
    const ranges = IPv4Address.private();
    assert.strictEqual(ranges.length, 3);
    assert.strictEqual(ranges[0].addressWithCidr, '10.0.0.0/8');
    assert.strictEqual(ranges[1].addressWithCidr, '172.16.0.0/12');
    assert.strictEqual(ranges[2].addressWithCidr, '192.168.0.0/16');
  });

  test('rfc1918() should be alias for private()', () => {
    const priv = IPv4Address.private();
    const rfc = IPv4Address.rfc1918();
    assert.deepStrictEqual(priv[0].addressWithCidr, rfc[0].addressWithCidr);
  });

  test('fromInteger() should create address from integer', () => {
    const ip = IPv4Address.fromInteger(3232235777);
    assert.strictEqual(ip.address, '192.168.1.1');
    assert.strictEqual(ip.prefix, 32);
  });

  test('fromInteger() with custom prefix', () => {
    const ip = IPv4Address.fromInteger(3232235777, 24);
    assert.strictEqual(ip.address, '192.168.1.1');
    assert.strictEqual(ip.prefix, 24);
  });

  test('fromString() should create address from string', () => {
    const ip = IPv4Address.fromString('192.168.1.1/24');
    assert.strictEqual(ip.address, '192.168.1.1');
    assert.strictEqual(ip.prefix, 24);
  });
});

describe('IPv4Address - Network Integration', () => {
  test('network() should return IPv4Network instance', () => {
    const ip = ipV4('192.168.1.100/24');
    const net = ip.network();
    assert.strictEqual(net.addressWithCidr, '192.168.1.0/24');
  });

  test('network() should be cached', () => {
    const ip = ipV4('192.168.1.100/24');
    const net1 = ip.network();
    const net2 = ip.network();
    assert.strictEqual(net1, net2);
  });

  test('isInSubnet() should check subnet membership', () => {
    const ip = ipV4('192.168.1.100');
    assert.strictEqual(ip.isInSubnet('192.168.1.0/24'), true);
    assert.strictEqual(ip.isInSubnet('192.168.2.0/24'), false);
  });
});
