const path = require('path')
const utils = require('shipit-utils');
const sshPool = require('ssh-pool');
const _ = require('lodash');

module.exports = function(shipit) {

  const servers = shipit.config.servers.reduce((servers, server) => {

    // if using user@host syntax, just add to all role
    if(_.isString(server)) {
      servers.all.push(server)
      return servers
    }

    const fullname = server.user+'@'+server.host

    // if no role, just add to all role
    if(!server.role) {
      servers.all.push(fullname)
      return servers
    }

    // add server to all role
    if(!_.includes(servers.all, fullname)) {
      servers.all.push(fullname)
    }

    server.role = _.castArray(server.role)
    _.forEach(server.role, (role) => {
      // add server to role
      if(!servers[role]) servers[role] = []
      if(!_.includes(servers[role], fullname)) {
        servers[role].push(fullname)
      }
    });

    return servers

  }, { all: []})


  // create ssh pools keyed by role name
  shipit.roles = Object.keys(servers).reduce((roles, role) => {
    roles[role] = new sshPool.ConnectionPool(servers[role], _.extend({}, shipit.options, _.pick(shipit.config, 'key', 'strict')));
    return roles
  }, {})


  // monkey patch remote to accept a role option
  shipit.remote = function(command, options, cb) {

    if (options && options.cwd) {
      command = 'cd "' + options.cwd.replace(/"/g, '\\"') + '" && ' + command;
      delete options.cwd;
    }

    if (options && options.role) {
      return this.roles[options.role].run(command, options, cb);
    }

    return this.roles.all.run(command, options, cb);

  }

  // monkey patch remoteCopy to accept a role option
  shipit.remoteCopy = function(src, dest, options, callback) {

    if (_.isFunction(options)) {
      callback = options;
      options = undefined;
    }

    options = _.defaults(options || {}, {
      ignores: this.config && this.config.ignores ? this.config.ignores : [],
      rsync: this.config && this.config.rsync ? this.config.rsync : [],
      role: 'all'
    });

    return this.roles[options.role].copy(src, dest, options, callback)

  }

}
