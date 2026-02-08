import { test, describe } from 'node:test';
import assert from 'node:assert';
import {ipV4} from "../dist/utils.js";

describe('IPv4Network - Basic Properties', () => {
  test('should calculate network address', () => {
    const net = ipV4('192.168.1.100/24').network();
    assert.strictEqual(net.address, '192.168.1.0');
    assert.strictEqual(net.prefix, 24);
  });

  test('should calculate network size', () => {
    assert.strictEqual(ipV4('192.168.1.0/24').network().size, 256);
    assert.strictEqual(ipV4('192.168.1.0/25').network().size, 128);
    assert.strictEqual(ipV4('10.0.0.0/8').network().size, 16777216);
  });

  test('should format addressWithCidr', () => {
    const net = ipV4('192.168.1.100/24').network();
    assert.strictEqual(net.addressWithCidr, '192.168.1.0/24');
  });

  test('toString() should return addressWithCidr', () => {
    const net = ipV4('192.168.1.100/24').network();
    assert.strictEqual(net.toString(), '192.168.1.0/24');
  });

  test('toInteger() should return network address as integer', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.toInteger(), 3232235776);
  });
});

describe('IPv4Network - Host Addresses', () => {
  test('firstHost should be network + 1', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.firstHost.address, '192.168.1.1');
  });

  test('lastHost should be broadcast - 1', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.lastHost.address, '192.168.1.254');
  });

  test('broadcast should be last address', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.broadcast.address, '192.168.1.255');
  });

  test('hostCount should exclude network and broadcast', () => {
    assert.strictEqual(ipV4('192.168.1.0/24').network().hostCount, 254);
    assert.strictEqual(ipV4('192.168.1.0/25').network().hostCount, 126);
    assert.strictEqual(ipV4('192.168.1.0/30').network().hostCount, 2);
  });

  test('/31 network should have no usable hosts', () => {
    const net = ipV4('192.168.1.0/31').network();
    assert.strictEqual(net.firstHost, null);
    assert.strictEqual(net.lastHost, null);
    assert.strictEqual(net.hostCount, 0);
  });

  test('/32 network should have no usable hosts', () => {
    const net = ipV4('192.168.1.1/32').network();
    assert.strictEqual(net.firstHost, null);
    assert.strictEqual(net.lastHost, null);
    assert.strictEqual(net.hostCount, 0);
  });
});

describe('IPv4Network - Masks', () => {
  test('netmask for /24', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.netmask.address, '255.255.255.0');
  });

  test('netmask for /16', () => {
    const net = ipV4('192.168.1.0/16').network();
    assert.strictEqual(net.netmask.address, '255.255.0.0');
  });

  test('netmask for /8', () => {
    const net = ipV4('10.0.0.0/8').network();
    assert.strictEqual(net.netmask.address, '255.0.0.0');
  });

  test('hostmask for /24', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.hostmask.address, '0.0.0.255');
  });

  test('hostmask for /16', () => {
    const net = ipV4('192.168.1.0/16').network();
    assert.strictEqual(net.hostmask.address, '0.0.255.255');
  });

  test('hostmask should allow zero octet', () => {
    // This tests that hostmask doesn't trigger zero octet validation
    const net = ipV4('192.168.1.0/24').network();
    const hostmask = net.hostmask;
    assert.strictEqual(hostmask.address, '0.0.0.255');
  });
});

describe('IPv4Network - Contains', () => {
  test('should check if address is in network', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.contains('192.168.1.1'), true);
    assert.strictEqual(net.contains('192.168.1.100'), true);
    assert.strictEqual(net.contains('192.168.1.255'), true);
  });

  test('should return false for addresses outside network', () => {
    const net = ipV4('192.168.1.0/24').network();
    assert.strictEqual(net.contains('192.168.2.1'), false);
    assert.strictEqual(net.contains('192.168.0.255'), false);
  });

  test('should work with IPv4Address objects', () => {
    const net = ipV4('192.168.1.0/24').network();
    const ip = ipV4('192.168.1.100');
    assert.strictEqual(net.contains(ip), true);
  });
});

describe('IPv4Network - Equality', () => {
  test('equals() should compare network address and prefix', () => {
    const net1 = ipV4('192.168.1.0/24').network();
    const net2 = ipV4('192.168.1.100/24').network();
    assert.strictEqual(net1.equals('192.168.1.0/24'), true);
  });

  test('equals() should return false for different networks', () => {
    const net1 = ipV4('192.168.1.0/24').network();
    const net2 = ipV4('192.168.2.0/24').network();
    assert.strictEqual(net1.equals('192.168.2.0/24'), false);
  });

  test('equals() should return false for different prefixes', () => {
    const net1 = ipV4('192.168.1.0/24').network();
    const net2 = ipV4('192.168.1.0/25').network();
    assert.strictEqual(net1.equals('192.168.1.0/25'), false);
  });
});

describe('IPv4Network - hosts() Generator', () => {
  test('should iterate over usable hosts', () => {
    const net = ipV4('192.168.1.0/29').network();
    const hosts = [...net.hosts()];
    
    assert.strictEqual(hosts.length, 6);
    assert.strictEqual(hosts[0].address, '192.168.1.1');
    assert.strictEqual(hosts[5].address, '192.168.1.6');
  });

  test('hosts should have /32 prefix by default', () => {
    const net = ipV4('192.168.1.0/24').network();
    const firstHost = net.hosts().next().value;
    assert.strictEqual(firstHost.prefix, 32);
  });

  test('hosts should preserve network prefix with keepPrefix=true', () => {
    const net = ipV4('192.168.1.0/24').network();
    const firstHost = net.hosts(true).next().value;
    assert.strictEqual(firstHost.prefix, 24);
  });

  test('should work with for...of loop', () => {
    const net = ipV4('192.168.1.0/30').network();
    const addresses = [];
    
    for (const host of net.hosts()) {
      addresses.push(host.address);
    }
    
    assert.deepStrictEqual(addresses, ['192.168.1.1', '192.168.1.2']);
  });

  test('should support early exit', () => {
    const net = ipV4('192.168.1.0/24').network();
    let count = 0;
    
    for (const host of net.hosts()) {
      count++;
      if (count >= 10) break;
    }
    
    assert.strictEqual(count, 10);
  });

  test('should yield nothing for /31 network', () => {
    const net = ipV4('192.168.1.0/31').network();
    const hosts = [...net.hosts()];
    assert.strictEqual(hosts.length, 0);
  });

  test('should yield nothing for /32 network', () => {
    const net = ipV4('192.168.1.1/32').network();
    const hosts = [...net.hosts()];
    assert.strictEqual(hosts.length, 0);
  });

  test('should handle large networks efficiently', () => {
    const net = ipV4('10.0.0.0/16').network();
    let count = 0;
    
    for (const host of net.hosts()) {
      count++;
      if (count >= 100) break;
    }
    
    assert.strictEqual(count, 100);
  });
});

describe('IPv4Network - addresses() Generator', () => {
  test('should iterate over all addresses including network and broadcast', () => {
    const net = ipV4('192.168.1.0/30').network();
    const addresses = [...net.addresses()];
    
    assert.strictEqual(addresses.length, 4);
    assert.strictEqual(addresses[0].address, '192.168.1.0');
    assert.strictEqual(addresses[1].address, '192.168.1.1');
    assert.strictEqual(addresses[2].address, '192.168.1.2');
    assert.strictEqual(addresses[3].address, '192.168.1.3');
  });

  test('addresses should have /32 prefix by default', () => {
    const net = ipV4('192.168.1.0/24').network();
    const firstAddr = net.addresses().next().value;
    assert.strictEqual(firstAddr.prefix, 32);
  });

  test('addresses should preserve network prefix with keepPrefix=true', () => {
    const net = ipV4('192.168.1.0/24').network();
    const firstAddr = net.addresses(true).next().value;
    assert.strictEqual(firstAddr.prefix, 24);
  });

  test('should work for /31 network', () => {
    const net = ipV4('192.168.1.0/31').network();
    const addresses = [...net.addresses()];
    
    assert.strictEqual(addresses.length, 2);
    assert.strictEqual(addresses[0].address, '192.168.1.0');
    assert.strictEqual(addresses[1].address, '192.168.1.1');
  });

  test('should work for /32 network', () => {
    const net = ipV4('192.168.1.1/32').network();
    const addresses = [...net.addresses()];
    
    assert.strictEqual(addresses.length, 1);
    assert.strictEqual(addresses[0].address, '192.168.1.1');
  });

  test('should support early exit', () => {
    const net = ipV4('10.0.0.0/8').network();
    let count = 0;
    
    for (const addr of net.addresses()) {
      count++;
      if (count >= 1000) break;
    }
    
    assert.strictEqual(count, 1000);
  });
});

describe('IPv4Network - Edge Cases', () => {
  test('should handle /0 network (entire IPv4 space)', () => {
    const net = ipV4('0.0.0.0/0').network();
    assert.strictEqual(net.address, '0.0.0.0');
    assert.strictEqual(net.prefix, 0);
    assert.strictEqual(net.size, 4294967296);
  });

  test('should handle /32 single host', () => {
    const net = ipV4('192.168.1.1/32').network();
    assert.strictEqual(net.address, '192.168.1.1');
    assert.strictEqual(net.size, 1);
    assert.strictEqual(net.hostCount, 0);
  });

  test('should normalize host bits to zero', () => {
    const net = ipV4('192.168.1.100/24').network();
    assert.strictEqual(net.address, '192.168.1.0');
  });

  test('should handle various prefix lengths', () => {
    const testCases = [
      { cidr: '10.0.0.0/8', size: 16777216 },
      { cidr: '172.16.0.0/12', size: 1048576 },
      { cidr: '192.168.0.0/16', size: 65536 },
      { cidr: '192.168.1.0/24', size: 256 },
      { cidr: '192.168.1.0/28', size: 16 },
    ];

    testCases.forEach(({ cidr, size }) => {
      const net = ipV4(cidr).network();
      assert.strictEqual(net.size, size);
    });
  });
});
