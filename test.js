const test = require('tape');
const rni = require('./')

test('sanity check', function (t) {
  let plannedTests = 1

  t.plan(plannedTests);

  const fixtureServices = {
    http: 80,
    altHttp: 8000
  }

  rni(fixtureServices, (err, results) => {
    if (err) throw err

    t.deepEqual(results.http, [], 'http should be empty')

    Object.values(results).forEach(networkInterfaces => {
      // two tests per interface
      plannedTests += networkInterfaces.length * 2
    })

    t.plan(plannedTests)

    results.altHttp.forEach(interface => {
      t.equal(typeof interface.address === 'string', true)
      t.equal(typeof interface.internal === 'boolean', true)
    })

    t.end()
  })
});



