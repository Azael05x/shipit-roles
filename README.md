# shipit-roles
The shipit-roles module lets addresses the requirement outlined in this github
issue:

https://github.com/shipitjs/shipit/issues/122

If you have a fleet of servers and that are configured in a specialized manner
per role, shipit-roles lets you address them as a group during the deploy
process. This allows you to restart the web server on only hosts that actually
have a web server running or clear the cache on servers that actually keep a
cache.


## Installation
Install with [npm](http://npmjs.com) or [yarn](https://yarnpkg.com):

```
npm install --save backframe
```

## Configuration
When you define your servers, use the following format:

```javascript
...
servers: [
  {
    user: 'root',
    host: 'app1.example.com',
    role: 'appserver'
  },{
    user: 'root',
    host: 'app2.example.com',
    role: 'appserver'
  },{
    user: 'root',
    host: 'worker1.example.com',
    role: 'worker'
  },{
    user: 'root',
    host: 'worker2.example.com',
    role: 'worker'
  },{
    user: 'root',
    host: 'db1.example.com',
    role: 'database'
  }
]
...
```

You can have as many roles as you want and they can be identified with whatever
word you choose. `appserver`, `worker`, and `database` are merely provided as
examples.

## Usage
shipit-roles monkey patches the `remote()` and `remoteCopy()` functions to accept a
`role` option. If no `role` is provided, then it defaults to all servers. If
a role is specified, then the command will only address the servers with that
role.

```javascript
const roles = require('shipit-roles')

module.exports = function (shipit) {

  roles(shipit)

  shipit.task('deploy:restart_appservers', () => {
    return shipit.remote('service nginx restart', { role: 'appserver' })
  })

  shipit.task('deploy:restart_workers', () => {
    return shipit.remote('service worker restart', { role: 'worker' })
  })

}
```

## Author & Credits
Shipit-roles was written by [Greg Kops](https://github.com/mochini) and
is based upon his work with [Think Topography](http://thinktopography.com)
and [The Cornell Cooperative Extension of Tompkins County](http://ccetompkins.org)
