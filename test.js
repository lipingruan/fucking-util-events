'use strict';

const EM = require('./es5');

let em1 = EM.shareInstance();

em1.onMulti(['openFile', 'response'], function(msg) {

  console.log(msg);
});

em1.emit('openFile', 'fileContent');

em1.emit('response', 'success');