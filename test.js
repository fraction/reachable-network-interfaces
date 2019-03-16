const test = require('tape')
const rni = require('./')

test('sanity check', function (t) {
  let plannedTests = 1

  const services = {
    http: 80,
    altHttp: 8000
  }

  rni(services, (err, results) => {
    if (err) throw err

    t.deepEqual(
      Object.keys(services),
      Object.keys(results),
      'result names should match service names'
    )

    Object.values(results).forEach(networkInterfaces => {
      // two tests per interface
      plannedTests += networkInterfaces.length * 2
    })

    t.plan(plannedTests)

    Object.values(results).forEach(networkInterfaces =>
      networkInterfaces.forEach(networkInterface => {
        t.equal(typeof networkInterface.address, 'string')
        t.equal(typeof networkInterface.internal, 'boolean')
      })
    )

    t.end()
  })
})
