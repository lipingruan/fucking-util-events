'use strict';

const util = require ( './util' );

const Events = {
  get Manager() { return require('./manager') },
  get managerCreator() { return require('./managerCreator') }
};

util.use ( 'Events', Events );

module.exports = Events;