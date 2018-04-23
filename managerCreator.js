'use strict';

const { Type, RndStr } = require ( './util' );

function managerCreator ( ParentClass ) {

	class EventsManager extends ParentClass {

		constructor(arg0) {
			super(arg0);

			this.__em__events = {};

			this.__em__listenerStatus = {};
		}

		static newEventID() {

			return [+new Date, RndStr(16)].join('_');
		}
	};


	EventsManager.prototype.initAnEvent = function(eid, args) {

		var _args = args || {};

		var triggerCount = _args.triggerCount || 0;

		var listeners = _args.listeners || {};

		var em = this;

		return em.__em__events[eid] = {
			triggerCount: triggerCount,
			listeners: listeners,
			on: function ( fn, lid, now ) {

				em.on ( eid, fn, lid, now );
			},
			un: function ( lid ) {

				em.un ( lid, eid );
			}
		};
	};

	EventsManager.prototype.multiListen = 
	EventsManager.prototype.addMultiListener = 
	EventsManager.prototype.addMultiEventListener = 
	EventsManager.prototype.onMulti = function(eids, options, fn) {

		var _optionsIsFunction = Type.function(options);

		var _fn = _optionsIsFunction 
		? options 
		: fn || new Function;

		var _options = _optionsIsFunction 
		|| !Type.object(options) ? {
			queue: true,
			latest: false
		} : options;

		if (!Type.array ( eids ) || Type.empty ( eids )) return this.on(eids, _fn);

		var i = 0, l = 0;

		var _this = this;

		var eventName = EventsManager.newEventID();

		var event = this.__em__events[eventName];

		if (!event) event = this.initAnEvent(eventName);

		if (!event.dataQueue) event.dataQueue = {};

		if (!event.latestRes) event.latestRes = {};

		var dataQueue = event.dataQueue;

		var latestRes = event.latestRes;

		var listen = function (eid) {

			if (!event.listeners[eid])
			event.listeners[eid] = {};

			var mountListenerResult = 
			_this.on(eid, function(data) {

				dataQueue[eid].push(data);

				response();
			});

			dataQueue[eid] = [];

			event.listeners[eid][mountListenerResult.listenerID] = true;
		};

		var response = function () {

			var nullKeys = [];

			var latestKeys = Object.keys(latestRes);

			for (i in dataQueue) {

				if (!dataQueue[i].length) {

					nullKeys.push(i);

					if (!_options.latest || latestKeys.indexOf(i) < 0) {

						return false;
					}
				}
			}

			for (i in dataQueue) {

				if (nullKeys.indexOf(i) > -1) {

					continue;
				}

				latestRes[i] = 
				_options.queue 
				? dataQueue[i].shift() 
				: dataQueue[i].pop();
			}

			event.count += 1;

			_fn(latestRes);
		};

		for (l = eids.length; i < l; i++) {

			listen(eids[i]);
		}

		return {eventID: eventName};

	};

	EventsManager.prototype.listen = 
	EventsManager.prototype.addListener = 
	EventsManager.prototype.addEventListener = 
	EventsManager.prototype.on = function(eid, fn, lid, now) {

		if (!eid || !Type.function(fn)) return false;

	  var event = this.__em__events[eid];

		if (!event) event = this.initAnEvent(eid);

		var _lid;

		if (Type.boolean(lid)) {
			now = lid;

			_lid = EventsManager.newEventID();
		} else {

			_lid = lid;
		}

		if (!_lid) {

			_lid = EventsManager.newEventID();
		}

		event.listeners[_lid] = fn;

		this.__em__listenerStatus[_lid] = true;

		if (now && event.triggerCount) Type.function(fn) && fn();

		return {eventID: eid, listenerID: _lid};
	};

	EventsManager.prototype.rndListen = 
	EventsManager.prototype.addRndListener = 
	EventsManager.prototype.addRndEventListener = 
	EventsManager.prototype.onRnd = function(fn) {

		var eventID = EventsManager.newEventID();

		return this.on(eventID, fn);
	};

	EventsManager.prototype.once = 
	EventsManager.prototype.addOnceListener = 
	EventsManager.prototype.addOnceEventListener = 
	EventsManager.prototype.onOnce = function(eid, fn, now) {

		var _eid = eid;
		var _fun = fn;
		let _now = now;

		if (Type.function(eid)) {

			_eid = EventsManager.newEventID();

			_fun = eid;

			_now = fn;
		}

		if (!Type.function(_fun)) return false;

		var lid = EventsManager.newEventID();

		var _this = this;

		var func = function(){

			_this.un(lid, _eid);

			_fun.apply(undefined, arguments);
		};

		return this.on(_eid, func, lid, _now);
	};


	EventsManager.prototype.unAllListenAfterListen = 
	EventsManager.prototype.removeAllListenerAfterAddListener = 
	EventsManager.prototype.removeAllEventListenerAfterAddEventListener = 
	EventsManager.prototype.unAfterOn = function ( eid, fn, lid, now ) {

		if ( now === true ) {

			this.on ( eid, fn, lid, now );
			this.unAfterOn ( eid, fn, lid );
		} else {

			this.ua ( eid );
			this.on ( eid, fn, lid );
		}
	};


	EventsManager.prototype.unListen = 
	EventsManager.prototype.removeListener = 
	EventsManager.prototype.removeEventListener = 
	EventsManager.prototype.un = function(lid, eid) {

		let _lid, _eid;

		if (Type.object(lid) && !eid) {

			_lid = lid.listenerID;
			_eid = lid.eventID;
		} else {

			_lid = lid;
			_eid = eid;
		}

		delete this.__em__listenerStatus[_lid];

		if (_eid) {

			var event = this.__em__events[_eid];

			if (event) {

				var listeners = event.listeners;

				var keys = Object.keys(listeners);

				if (keys.length === 1 || !_lid) {

					//this.ua(_eid);
					delete this.__em__events[_eid];
				} else {

					delete listeners[_lid];
				}
			}
		}
	}

	EventsManager.prototype.unAllListen = 
	EventsManager.prototype.removeAllListener = 
	EventsManager.prototype.removeAllEventListener = 
	EventsManager.prototype.ua = function(eid) {

		if (eid) {

			var event = this.__em__events[eid];

			if (event) {

				var listeners = event.listeners;

				var listener, i, j;

				for (i in listeners) {

					listener = listeners[i];

					if (Type.function(listener)) {

						delete this.__em__listenerStatus[i];
					} else {

						if (Type.object(listener) && Object.keys(listener).length)
						for (j in listener) {

							this.un(j, i);
						}
					}
				}

				delete this.__em__events[eid];
			}
		} else {

			this.__em__listenerStatus = {};

			this.__em__events = {};
		}
	}

	EventsManager.prototype.emit = 
	EventsManager.prototype.trigger = 
	EventsManager.prototype.t = function(eid) {

		var event = this.__em__events[eid];

		if (!event) {

			event = this.initAnEvent(eid, {triggerCount: 1});

			return;
		}

		event.triggerCount += 1;

		var listeners = event.listeners;

		var keys = Object.keys(listeners);

		if (!keys.length) return false;

		var fn, i = 0, _arguments = [], 
				argSize = arguments.length;

		while(++i < argSize) {

			_arguments.push(arguments[i]);
		}

		if (keys.length === 1) {

			fn = listeners[keys[0]];

			if (Type.function(fn)) return fn.apply(this, _arguments);
		}

		for (i in listeners) {

			if (this.__em__listenerStatus[i]) {

				fn = listeners[i];

				Type.function(fn) && fn.apply(this, _arguments);
			} else {

				delete listeners[i];
			}
		}
	}

	EventsManager.prototype.triggerAndRemoveEvent = 
	EventsManager.prototype.emitAndRemoveEvent = 
	EventsManager.prototype.tu = function(eid) {

		if (!eid) return false;

		var result = this.t.apply(this, arguments);

		this.ua(eid);

		return result;
	}

	return EventsManager;
}

module.exports = managerCreator;
