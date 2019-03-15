const net = require('net')
var os = require('os')

// Input should be a `services` object that defineds simple key-value pairs.
//
// Each service **must** contain both a name and a port. For example:
//
// ```js
// const services = {
//   http: 80,
//   foobar: 4242
// }
// ```
//
// The name doesn't actually matter, it's only used for human legibility.
//
// This module works by enumerating all network interfaces and service ports,
// and then for each address + port combination:
//
// 1. Starts a server that listens on the port.
// 2. Attempts to connect to the port.
// 3. If the connection succeeds, the interface is returned.
//
// The `cb` function receives two arguments:
//
// ```js
// reachableNetworkInterfaces(services, (err, reachable) => {
//   if (err) throw err
//
//   console.log(reachable)
// })
// ```
//
// This should output something like:
//
// ```js
// {
//   http: [
//      {
//        address: '127.0.0.1',
//        netmask: '255.0.0.0',
//        family: 'IPv4',
//        mac: '00:00:00:00:00:00',
//        internal: true,
//        cidr: '127.0.0.1/8'
//      }
//   ],
//   foobar: []
// }
// ```
//
// This is *super useful* in a scenario where you need to bind to all ports but
// are in a quirky environment (e.g. Travis CI) which may blacklist IPv6 or
// specific ports that you want to bind to.
//
module.exports = (services, cb) => {
  // This object will eventually be returned
  const reachable = {}

  // Specifically, we want to ensure that we're returning the reachable network
  // interfaces for each **service**. A service should have a port
  Object.keys(services).forEach(service => {
    reachable[service] = []
  })

  // It's important that we keep track of how many interface + port combos are
  // still pending. Once this drops to `0` again we know we're all finished.
  let pending = 0

  // Called at the end of each server test. If pending is `0` this calls `cb`.
  const done = () => {
    pending -= 1

    if (pending === 0) {
      cb(null, reachable)
    }
  }

  // Now for the fun! We enumerate all network interfaces...
  Object.values(os.networkInterfaces()).forEach(netInterface => {
    // And for each of those we get the various addresses...
    netInterface.forEach(addressInfo => {
      const host = addressInfo.address

      // Increment `pending` so we know we have things to wait on.
      const serviceEntries = Object.entries(services)
      pending += serviceEntries.length

      // Now enumerate each service...
      serviceEntries.forEach(entry => {
        const [ service, port ] = entry

        const connection = {
          host,
          port
        }

        // Create a simple server that saves an interface in `reachable` after
        // a successfull connection. Note that it calls `done()` regardless of
        // whether the connection works or fails.
        const server = net.createServer((c) => {
          c.on('end', () => {
            reachable[service].push(addressInfo)
            done()
            server.close()
          })

          c.write('')
          c.pipe(c)
        })

        server.on('error', done)

        // Now bind that server to our preferred host + port combination...
        server.listen(connection, () => {
          // And attempt a connection!
          const client = net.createConnection(connection, () => {
            // XXX: use a token to authenticate this connection
            client.write('hello world\r\n')
          })

          client.on('data', () => client.end())
          client.on('error', () => client.end())
        })
      })
    })
  })
}
