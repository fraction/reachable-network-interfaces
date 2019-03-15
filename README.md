# reachable-network-interfaces

> find reachable network interfaces for services that bind to ports

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Maintainers](#maintainers)
- [Contributing](#contributing)
- [License](#license)

## Install

```sh
npm install reachable-network-interfaces
```

## Usage

```js
const services = {
  http: 80,
  foobar: 4242
}

reachableNetworkInterfaces(services, (err, val) => {
  if (err) throw err

  console.log(val) /* => {
    http: [],
    foobar: {
      address: '127.0.0.1',
      netmask: '255.0.0.0',
      family: 'IPv4',
      mac: '00:00:00:00:00:00',
      internal: true,
      cidr: '127.0.0.1/8'
    }
  }
})
```

## Maintainers

[@fraction](https://github.com/fraction)

## Contributing

PRs accepted.

## License

ISC © 2019 Fraction LLC
