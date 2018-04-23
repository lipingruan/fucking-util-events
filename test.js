'use strict';

const Events = require('./index');

let em1 = Events.Manager.shareInstance();

em1.onMulti(['openFile', 'response'], function(msg) {

  console.log(msg);
});

em1.emit('openFile', 'fileContent');

em1.emit('response', 'success');