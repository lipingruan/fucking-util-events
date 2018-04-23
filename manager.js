'use strict';

const { Category } = require ( './util' );

const managerCreator = require ( './managerCreator' );

const EventsManager = managerCreator ( Category );

module.exports = EventsManager;