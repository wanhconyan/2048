require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"myApp":[function(require,module,exports){
"use strict";
cc._RFpush(module, '96768kSAVBOmo6jvT8fCKU7', 'myApp');
// script/myApp.js

cc.Class({
    'extends': cc.Component,

    properties: {
        ServerState: {
            'default': null,
            type: cc.Label
        },
        background: {
            'default': null,
            type: cc.Node
        },
        otherHero: {
            'default': null,
            type: cc.Prefab
        },

        radio: 2,

        myID: 0,

        userList: []
    },

    _drawUser: function _drawUser(posX, posY, user) {
        var otherhero = cc.instantiate(this.otherHero);
        this.background.addChild(otherhero, user.userID, user.userID);
        otherhero.setPosition(posX, posY);
    },

    // use this for initialization
    onLoad: function onLoad() {
        var self = this;

        if (cc.sys.isNative) {
            window.io = SocketIO;
        } else {
            require('socket.io');
        }

        socket = io('http://localhost:3000');

        //begin---------------登录处理-----------------------//

        socket.on('connected', function (data) {
            self.myID = data.userID; //存入自己的ID
            self.ServerState.string = 'your ID: ' + data.userID;
            self.userList = data.userList; //获取原有用户列表

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = self.userList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var user = _step.value;
                    //画到背景
                    if (user == undefined) continue;
                    self._drawUser(688, -504, user);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }
        });

        //end-----------------登录处理-----------------------//

        //begin-----------------新增处理-----------------------//

        socket.on('newUser', function (data) {
            self.ServerState.string = 'new user: ' + data.userID;
            self.userList.push(data); //加到列表
            self._drawUser(688, -504, data); //画到背景
        });

        //end-------------------新增处理-----------------------//

        //end-------------------离开处理-----------------------//

        socket.on('userLeave', function (data) {
            self.ServerState.string = 'user leave: ' + data.userID;
            delete self.userList[data.userID]; //从列表删除
            self.background.removeChildByTag(data.userID); //从背景移除
        });

        //end-------------------离开处理-----------------------//

        //begin-------------------移动发出处理-----------------------//

        var myUtil = require('myUtil');
        var util = new myUtil();

        var myGround = this.background.getComponent('myGround');
        var curTileX = myGround.curTileX;
        var curTileY = myGround.curTileY;

        self.node.on('myClick', function (event) {

            //console.log(event);
            socket.emit('move', {
                userID: self.myID,
                curTileX: curTileX,
                curTileY: curTileY,
                newPos: util.convertTo45(event.detail)
            });
        });

        //end---------------------移动发出处理-----------------------//

        //begin-------------------移动收到处理-----------------------//

        socket.on('move', function (data) {
            var target = self.background.getChildByTag(data.userID).getComponent('myOtherHero');
            //var target = self.background.getChildByTag(data.userID).getComponent('myHero');
            var Path = util.convertToPath(data.newPos, data.curTileX, data.curTileY);
            var asc = [];

            console.log(target);
            target.path = Path;

            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
                for (var _iterator2 = Path[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                    var dir = _step2.value;

                    asc.push(cc.callFunc(target.toWalk, target));
                    //asc.push(cc.callFunc(target.toWalk,target));
                    asc.push(cc.moveBy(self.radio * (dir.dx != 0 && dir.dy != 0 ? 1.4 : 1) / 10, (dir.dy + dir.dx) * 32, (dir.dx - dir.dy) * 24));
                }
            } catch (err) {
                _didIteratorError2 = true;
                _iteratorError2 = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion2 && _iterator2['return']) {
                        _iterator2['return']();
                    }
                } finally {
                    if (_didIteratorError2) {
                        throw _iteratorError2;
                    }
                }
            }

            asc.push(cc.callFunc(target.toStand, target));

            target.node.runAction(cc.sequence(asc));
        });

        //end---------------------移动收到处理-----------------------//
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{"myUtil":"myUtil","socket.io":"socket.io"}],"myGround":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'dd8f5RynalJPIwy0vwa29Ee', 'myGround');
// script/myGround.js

cc.Class({
    'extends': cc.Component,

    properties: {

        curTileX: 12,
        curTileY: 42,

        finalList: [],

        radio: 1,

        hero: {
            'default': null,
            type: cc.Node
        },

        curTileXY: {
            'default': null,
            type: cc.Label
        },

        curTileForeName: '当前坐标: '

    },

    toMove: function toMove() {
        if (this.finalList.length == 0) {
            this._standHero();
            //this.hero.getComponent('myHero').toStand();
            return;
        }
        var dir = this.finalList.shift();

        this.curTilePosX = dir.dx;
        this.curTilePosY = dir.dy;
        this.curTileXY.string = this.curTileForeName + this.curTilePosX + ',' + this.curTilePosY;
        //console.log(this.curTilePosX + ' ' + this.curTilePosY);
        //this._moveHero(dir.dx, dir.dy);
        //this.hero.getComponent('myHero').toWalk(dir.dx + '' + dir.dy);

        //Begin-----------------------_moveBackground--------------------------//
        this.node.runAction(cc.sequence(cc.callFunc(this._moveHero(dir.dx, dir.dy), this), cc.moveBy(this.radio * (dir.dx != 0 && dir.dy != 0 ? 1.4 : 1) / 10, -(dir.dx + dir.dy) * 32, (dir.dy - dir.dx) * 24), cc.callFunc(this.toMove, this)));

        //this._moveBackground(dir.x,dir.y);
        //End-----------------------_moveBackground----------------------------//
    },

    // _moveBackground : function(dx,dy){
    //     this.node.runAction(
    //         cc.sequence(

    //             cc.callFunc(this._moveHero(dx, dy),this),
    //             cc.moveBy(
    //                 this.radio * ((dx != 0) && (dy != 0) ? 1.4 : 1),
    //                 -(dx+dy)*32,
    //                  (dy-dx)*24
    //             ),
    //             cc.callFunc(this.toMove,this)
    //         )

    //     );
    // },

    _moveHero: function _moveHero(dx, dy) {
        this.hero.getComponent('myHero').toWalk(dx + '' + dy);
    },

    _standHero: function _standHero() {
        this.hero.getComponent('myHero').toStand();
    },

    // use this for initialization
    onLoad: function onLoad() {

        var self = this;

        var myUtil = self.getComponent('myUtil');

        this.node.on('mouseup', function (event) {

            var myevent = new cc.Event.EventCustom('myClick', true);
            myevent.setUserData(event);

            this.node.dispatchEvent(myevent);

            self.finalList = [];
            self.finalList = myUtil.convertToPath(myUtil.convertTo45(event), self.curTileX, self.curTileY);
            //this.toMoveOnce();
            this.toMove();
        }, this);
    }

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"myHero":[function(require,module,exports){
"use strict";
cc._RFpush(module, '25ca0646MpBKK8r8Ua9mLds', 'myHero');
// script/myHero.js

cc.Class({
    'extends': cc.Component,

    properties: {

        StandAnimName: '',
        WalkAnimName: '',
        curDir: ''

    },

    toStand: function toStand() {
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },

    toWalk: function toWalk(dir) {
        //console.log(dir);
        if (dir == this.curDir) return;
        this.curDir = dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + dir);
    },
    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"myOtherHero":[function(require,module,exports){
"use strict";
cc._RFpush(module, '2ec00qkYdhHRbG8YykoOqLt', 'myOtherHero');
// script/myOtherHero.js

cc.Class({
    'extends': cc.Component,

    properties: {

        StandAnimName: '',
        WalkAnimName: '',
        curDir: '',
        dir: '',

        path: []

    },

    toStand: function toStand() {
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },

    toWalk: function toWalk() {

        var item = this.path.shift();
        if (item == undefined) return;
        this.dir = item.dx + '' + item.dy;

        if (this.dir == this.curDir) return;
        this.curDir = this.dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + this.dir);
    },
    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"myUtil":[function(require,module,exports){
"use strict";
cc._RFpush(module, 'd5774Ct/iVK9oe4tagNz6I/', 'myUtil');
// script/myUtil.js

cc.Class({
    "extends": cc.Component,

    properties: {},

    convertTo45: function convertTo45(clickEvent) {
        var visibleSize = cc.director.getVisibleSize();
        var oldX = (clickEvent.getLocationX() - visibleSize.width / 2) / 64;
        var oldY = (clickEvent.getLocationY() - visibleSize.height / 2) / 48;

        var rawNewX = oldX + oldY;
        var rawNewY = oldX - oldY;

        var newX = Math.floor(rawNewX) + 1;
        var newY = -Math.floor(-rawNewY) - 1;

        return {
            newX: newX,
            newY: newY
        };
    },

    convertToPath: function convertToPath(newPos, curTilePosX, curTilePosY) {

        var newX = newPos.newX;
        var newY = newPos.newY;

        var openList = [];
        var closeList = [];
        var finalList = [];

        var start = {
            x: curTilePosX,
            y: curTilePosY,
            h: (Math.abs(newX) + Math.abs(newY)) * 10,
            g: 0,
            p: null
        };
        start.f = start.h + start.g;

        openList.push(start);

        var desTileX = start.x + newX;
        var desTileY = start.y + newY;

        while (openList.length != 0) {

            var parent = openList.shift();

            closeList.push(parent);

            if (parent.h == 0) {
                break;
            }

            for (var i = -1; i <= 1; i++) {
                for (var j = -1; j <= 1; j++) {
                    var rawx = parent.x + i;
                    var rawy = parent.y + j;
                    if (this._hadInCloseList(rawx, rawy, closeList)) {
                        /*比较G值换P 返回*/continue;
                    }
                    var neibour = {
                        x: rawx,
                        y: rawy,
                        h: Math.max(Math.abs(rawx - desTileX), Math.abs(rawy - desTileY)) * 10,
                        g: parent.g + (i != 0 && j != 0 ? 14 : 10),
                        p: parent
                    };

                    neibour.f = neibour.h + neibour.g;

                    openList.push(neibour);
                }
            }

            openList.sort(this._sortF);
        }

        var des = closeList.pop();

        while (des.p) {
            des.dx = des.x - des.p.x;
            des.dy = des.y - des.p.y;
            finalList.unshift(des);
            des = des.p;
        };

        return finalList;
    },

    _hadInCloseList: function _hadInCloseList(x, y, closeList) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
            for (var _iterator = closeList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var item = _step.value;

                if (item.x == x && item.y == y) return true;
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator["return"]) {
                    _iterator["return"]();
                }
            } finally {
                if (_didIteratorError) {
                    throw _iteratorError;
                }
            }
        }

        return false;
    },

    _sortF: function _sortF(a, b) {
        return a.f - b.f;
    },

    // use this for initialization
    onLoad: function onLoad() {}

});
// called every frame, uncomment this function to activate update callback
// update: function (dt) {

// },

cc._RFpop();
},{}],"socket.io":[function(require,module,exports){
(function (global){
"use strict";
cc._RFpush(module, '336f7QoxnZJPbBVP1twghqA', 'socket.io');
// script/socket.io.js

"use strict";if(!cc.sys.isNative){(function(f){if(typeof exports === "object" && typeof module !== "undefined"){module.exports = f();}else if(typeof define === "function" && define.amd){define([],f);}else {var g;if(typeof window !== "undefined"){g = window;}else if(typeof global !== "undefined"){g = global;}else if(typeof self !== "undefined"){g = self;}else {g = this;}g.io = f();}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require == "function" && require;if(!u && a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '" + o + "'");throw (f.code = "MODULE_NOT_FOUND",f);}var l=n[o] = {exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e);},l,l.exports,e,t,n,r);}return n[o].exports;}var i=typeof require == "function" && require;for(var o=0;o < r.length;o++) s(r[o]);return s;})({1:[function(_dereq_,module,exports){module.exports = _dereq_('./lib/');},{"./lib/":2}],2:[function(_dereq_,module,exports){module.exports = _dereq_('./socket'); /**
 * Exports parser
 *
 * @api public
 *
 */module.exports.parser = _dereq_('engine.io-parser');},{"./socket":3,"engine.io-parser":19}],3:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var transports=_dereq_('./transports');var Emitter=_dereq_('component-emitter');var debug=_dereq_('debug')('engine.io-client:socket');var index=_dereq_('indexof');var parser=_dereq_('engine.io-parser');var parseuri=_dereq_('parseuri');var parsejson=_dereq_('parsejson');var parseqs=_dereq_('parseqs'); /**
 * Module exports.
 */module.exports = Socket; /**
 * Noop function.
 *
 * @api private
 */function noop(){} /**
 * Socket constructor.
 *
 * @param {String|Object} uri or options
 * @param {Object} options
 * @api public
 */function Socket(uri,opts){if(!(this instanceof Socket))return new Socket(uri,opts);opts = opts || {};if(uri && 'object' == typeof uri){opts = uri;uri = null;}if(uri){uri = parseuri(uri);opts.hostname = uri.host;opts.secure = uri.protocol == 'https' || uri.protocol == 'wss';opts.port = uri.port;if(uri.query)opts.query = uri.query;}else if(opts.host){opts.hostname = parseuri(opts.host).host;}this.secure = null != opts.secure?opts.secure:global.location && 'https:' == location.protocol;if(opts.hostname && !opts.port){ // if no port is specified manually, use the protocol default
opts.port = this.secure?'443':'80';}this.agent = opts.agent || false;this.hostname = opts.hostname || (global.location?location.hostname:'localhost');this.port = opts.port || (global.location && location.port?location.port:this.secure?443:80);this.query = opts.query || {};if('string' == typeof this.query)this.query = parseqs.decode(this.query);this.upgrade = false !== opts.upgrade;this.path = (opts.path || '/engine.io').replace(/\/$/,'') + '/';this.forceJSONP = !!opts.forceJSONP;this.jsonp = false !== opts.jsonp;this.forceBase64 = !!opts.forceBase64;this.enablesXDR = !!opts.enablesXDR;this.timestampParam = opts.timestampParam || 't';this.timestampRequests = opts.timestampRequests;this.transports = opts.transports || ['polling','websocket'];this.readyState = '';this.writeBuffer = [];this.policyPort = opts.policyPort || 843;this.rememberUpgrade = opts.rememberUpgrade || false;this.binaryType = null;this.onlyBinaryUpgrades = opts.onlyBinaryUpgrades;this.perMessageDeflate = false !== opts.perMessageDeflate?opts.perMessageDeflate || {}:false;if(true === this.perMessageDeflate)this.perMessageDeflate = {};if(this.perMessageDeflate && null == this.perMessageDeflate.threshold){this.perMessageDeflate.threshold = 1024;} // SSL options for Node.js client
this.pfx = opts.pfx || null;this.key = opts.key || null;this.passphrase = opts.passphrase || null;this.cert = opts.cert || null;this.ca = opts.ca || null;this.ciphers = opts.ciphers || null;this.rejectUnauthorized = opts.rejectUnauthorized === undefined?null:opts.rejectUnauthorized; // other options for Node.js client
var freeGlobal=typeof global == 'object' && global;if(freeGlobal.global === freeGlobal){if(opts.extraHeaders && Object.keys(opts.extraHeaders).length > 0){this.extraHeaders = opts.extraHeaders;}}this.open();}Socket.priorWebsocketSuccess = false; /**
 * Mix in `Emitter`.
 */Emitter(Socket.prototype); /**
 * Protocol version.
 *
 * @api public
 */Socket.protocol = parser.protocol; // this is an int
/**
 * Expose deps for legacy compatibility
 * and standalone browser access.
 */Socket.Socket = Socket;Socket.Transport = _dereq_('./transport');Socket.transports = _dereq_('./transports');Socket.parser = _dereq_('engine.io-parser'); /**
 * Creates transport of the given type.
 *
 * @param {String} transport name
 * @return {Transport}
 * @api private
 */Socket.prototype.createTransport = function(name){debug('creating transport "%s"',name);var query=clone(this.query); // append engine.io protocol identifier
query.EIO = parser.protocol; // transport name
query.transport = name; // session id if we already have one
if(this.id)query.sid = this.id;var transport=new transports[name]({agent:this.agent,hostname:this.hostname,port:this.port,secure:this.secure,path:this.path,query:query,forceJSONP:this.forceJSONP,jsonp:this.jsonp,forceBase64:this.forceBase64,enablesXDR:this.enablesXDR,timestampRequests:this.timestampRequests,timestampParam:this.timestampParam,policyPort:this.policyPort,socket:this,pfx:this.pfx,key:this.key,passphrase:this.passphrase,cert:this.cert,ca:this.ca,ciphers:this.ciphers,rejectUnauthorized:this.rejectUnauthorized,perMessageDeflate:this.perMessageDeflate,extraHeaders:this.extraHeaders});return transport;};function clone(obj){var o={};for(var i in obj) {if(obj.hasOwnProperty(i)){o[i] = obj[i];}}return o;} /**
 * Initializes transport to use and starts probe.
 *
 * @api private
 */Socket.prototype.open = function(){var transport;if(this.rememberUpgrade && Socket.priorWebsocketSuccess && this.transports.indexOf('websocket') != -1){transport = 'websocket';}else if(0 === this.transports.length){ // Emit error on next tick so it can be listened to
var self=this;setTimeout(function(){self.emit('error','No transports available');},0);return;}else {transport = this.transports[0];}this.readyState = 'opening'; // Retry with the next transport if the transport is disabled (jsonp: false)
try{transport = this.createTransport(transport);}catch(e) {this.transports.shift();this.open();return;}transport.open();this.setTransport(transport);}; /**
 * Sets the current transport. Disables the existing one (if any).
 *
 * @api private
 */Socket.prototype.setTransport = function(transport){debug('setting transport %s',transport.name);var self=this;if(this.transport){debug('clearing existing transport %s',this.transport.name);this.transport.removeAllListeners();} // set up transport
this.transport = transport; // set up transport listeners
transport.on('drain',function(){self.onDrain();}).on('packet',function(packet){self.onPacket(packet);}).on('error',function(e){self.onError(e);}).on('close',function(){self.onClose('transport close');});}; /**
 * Probes a transport.
 *
 * @param {String} transport name
 * @api private
 */Socket.prototype.probe = function(name){debug('probing transport "%s"',name);var transport=this.createTransport(name,{probe:1}),failed=false,self=this;Socket.priorWebsocketSuccess = false;function onTransportOpen(){if(self.onlyBinaryUpgrades){var upgradeLosesBinary=!this.supportsBinary && self.transport.supportsBinary;failed = failed || upgradeLosesBinary;}if(failed)return;debug('probe transport "%s" opened',name);transport.send([{type:'ping',data:'probe'}]);transport.once('packet',function(msg){if(failed)return;if('pong' == msg.type && 'probe' == msg.data){debug('probe transport "%s" pong',name);self.upgrading = true;self.emit('upgrading',transport);if(!transport)return;Socket.priorWebsocketSuccess = 'websocket' == transport.name;debug('pausing current transport "%s"',self.transport.name);self.transport.pause(function(){if(failed)return;if('closed' == self.readyState)return;debug('changing transport and sending upgrade packet');cleanup();self.setTransport(transport);transport.send([{type:'upgrade'}]);self.emit('upgrade',transport);transport = null;self.upgrading = false;self.flush();});}else {debug('probe transport "%s" failed',name);var err=new Error('probe error');err.transport = transport.name;self.emit('upgradeError',err);}});}function freezeTransport(){if(failed)return; // Any callback called by transport should be ignored since now
failed = true;cleanup();transport.close();transport = null;} //Handle any error that happens while probing
function onerror(err){var error=new Error('probe error: ' + err);error.transport = transport.name;freezeTransport();debug('probe transport "%s" failed because of error: %s',name,err);self.emit('upgradeError',error);}function onTransportClose(){onerror("transport closed");} //When the socket is closed while we're probing
function onclose(){onerror("socket closed");} //When the socket is upgraded while we're probing
function onupgrade(to){if(transport && to.name != transport.name){debug('"%s" works - aborting "%s"',to.name,transport.name);freezeTransport();}} //Remove all listeners on the transport and on self
function cleanup(){transport.removeListener('open',onTransportOpen);transport.removeListener('error',onerror);transport.removeListener('close',onTransportClose);self.removeListener('close',onclose);self.removeListener('upgrading',onupgrade);}transport.once('open',onTransportOpen);transport.once('error',onerror);transport.once('close',onTransportClose);this.once('close',onclose);this.once('upgrading',onupgrade);transport.open();}; /**
 * Called when connection is deemed open.
 *
 * @api public
 */Socket.prototype.onOpen = function(){debug('socket open');this.readyState = 'open';Socket.priorWebsocketSuccess = 'websocket' == this.transport.name;this.emit('open');this.flush(); // we check for `readyState` in case an `open`
// listener already closed the socket
if('open' == this.readyState && this.upgrade && this.transport.pause){debug('starting upgrade probes');for(var i=0,l=this.upgrades.length;i < l;i++) {this.probe(this.upgrades[i]);}}}; /**
 * Handles a packet.
 *
 * @api private
 */Socket.prototype.onPacket = function(packet){if('opening' == this.readyState || 'open' == this.readyState){debug('socket receive: type "%s", data "%s"',packet.type,packet.data);this.emit('packet',packet); // Socket is live - any packet counts
this.emit('heartbeat');switch(packet.type){case 'open':this.onHandshake(parsejson(packet.data));break;case 'pong':this.setPing();this.emit('pong');break;case 'error':var err=new Error('server error');err.code = packet.data;this.onError(err);break;case 'message':this.emit('data',packet.data);this.emit('message',packet.data);break;}}else {debug('packet received with socket readyState "%s"',this.readyState);}}; /**
 * Called upon handshake completion.
 *
 * @param {Object} handshake obj
 * @api private
 */Socket.prototype.onHandshake = function(data){this.emit('handshake',data);this.id = data.sid;this.transport.query.sid = data.sid;this.upgrades = this.filterUpgrades(data.upgrades);this.pingInterval = data.pingInterval;this.pingTimeout = data.pingTimeout;this.onOpen(); // In case open handler closes socket
if('closed' == this.readyState)return;this.setPing(); // Prolong liveness of socket on heartbeat
this.removeListener('heartbeat',this.onHeartbeat);this.on('heartbeat',this.onHeartbeat);}; /**
 * Resets ping timeout.
 *
 * @api private
 */Socket.prototype.onHeartbeat = function(timeout){clearTimeout(this.pingTimeoutTimer);var self=this;self.pingTimeoutTimer = setTimeout(function(){if('closed' == self.readyState)return;self.onClose('ping timeout');},timeout || self.pingInterval + self.pingTimeout);}; /**
 * Pings server every `this.pingInterval` and expects response
 * within `this.pingTimeout` or closes connection.
 *
 * @api private
 */Socket.prototype.setPing = function(){var self=this;clearTimeout(self.pingIntervalTimer);self.pingIntervalTimer = setTimeout(function(){debug('writing ping packet - expecting pong within %sms',self.pingTimeout);self.ping();self.onHeartbeat(self.pingTimeout);},self.pingInterval);}; /**
* Sends a ping packet.
*
* @api private
*/Socket.prototype.ping = function(){var self=this;this.sendPacket('ping',function(){self.emit('ping');});}; /**
 * Called on `drain` event
 *
 * @api private
 */Socket.prototype.onDrain = function(){this.writeBuffer.splice(0,this.prevBufferLen); // setting prevBufferLen = 0 is very important
// for example, when upgrading, upgrade packet is sent over,
// and a nonzero prevBufferLen could cause problems on `drain`
this.prevBufferLen = 0;if(0 === this.writeBuffer.length){this.emit('drain');}else {this.flush();}}; /**
 * Flush write buffers.
 *
 * @api private
 */Socket.prototype.flush = function(){if('closed' != this.readyState && this.transport.writable && !this.upgrading && this.writeBuffer.length){debug('flushing %d packets in socket',this.writeBuffer.length);this.transport.send(this.writeBuffer); // keep track of current length of writeBuffer
// splice writeBuffer and callbackBuffer on `drain`
this.prevBufferLen = this.writeBuffer.length;this.emit('flush');}}; /**
 * Sends a message.
 *
 * @param {String} message.
 * @param {Function} callback function.
 * @param {Object} options.
 * @return {Socket} for chaining.
 * @api public
 */Socket.prototype.write = Socket.prototype.send = function(msg,options,fn){this.sendPacket('message',msg,options,fn);return this;}; /**
 * Sends a packet.
 *
 * @param {String} packet type.
 * @param {String} data.
 * @param {Object} options.
 * @param {Function} callback function.
 * @api private
 */Socket.prototype.sendPacket = function(type,data,options,fn){if('function' == typeof data){fn = data;data = undefined;}if('function' == typeof options){fn = options;options = null;}if('closing' == this.readyState || 'closed' == this.readyState){return;}options = options || {};options.compress = false !== options.compress;var packet={type:type,data:data,options:options};this.emit('packetCreate',packet);this.writeBuffer.push(packet);if(fn)this.once('flush',fn);this.flush();}; /**
 * Closes the connection.
 *
 * @api private
 */Socket.prototype.close = function(){if('opening' == this.readyState || 'open' == this.readyState){this.readyState = 'closing';var self=this;if(this.writeBuffer.length){this.once('drain',function(){if(this.upgrading){waitForUpgrade();}else {close();}});}else if(this.upgrading){waitForUpgrade();}else {close();}}function close(){self.onClose('forced close');debug('socket closing - telling transport to close');self.transport.close();}function cleanupAndClose(){self.removeListener('upgrade',cleanupAndClose);self.removeListener('upgradeError',cleanupAndClose);close();}function waitForUpgrade(){ // wait for upgrade to finish since we can't send packets while pausing a transport
self.once('upgrade',cleanupAndClose);self.once('upgradeError',cleanupAndClose);}return this;}; /**
 * Called upon transport error
 *
 * @api private
 */Socket.prototype.onError = function(err){debug('socket error %j',err);Socket.priorWebsocketSuccess = false;this.emit('error',err);this.onClose('transport error',err);}; /**
 * Called upon transport close.
 *
 * @api private
 */Socket.prototype.onClose = function(reason,desc){if('opening' == this.readyState || 'open' == this.readyState || 'closing' == this.readyState){debug('socket close with reason: "%s"',reason);var self=this; // clear timers
clearTimeout(this.pingIntervalTimer);clearTimeout(this.pingTimeoutTimer); // stop event from firing again for transport
this.transport.removeAllListeners('close'); // ensure transport won't stay open
this.transport.close(); // ignore further transport communication
this.transport.removeAllListeners(); // set ready state
this.readyState = 'closed'; // clear session id
this.id = null; // emit close event
this.emit('close',reason,desc); // clean buffers after, so users can still
// grab the buffers on `close` event
self.writeBuffer = [];self.prevBufferLen = 0;}}; /**
 * Filters upgrades, returning only those matching client transports.
 *
 * @param {Array} server upgrades
 * @api private
 *
 */Socket.prototype.filterUpgrades = function(upgrades){var filteredUpgrades=[];for(var i=0,j=upgrades.length;i < j;i++) {if(~index(this.transports,upgrades[i]))filteredUpgrades.push(upgrades[i]);}return filteredUpgrades;};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./transport":4,"./transports":5,"component-emitter":15,"debug":17,"engine.io-parser":19,"indexof":23,"parsejson":26,"parseqs":27,"parseuri":28}],4:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var parser=_dereq_('engine.io-parser');var Emitter=_dereq_('component-emitter'); /**
 * Module exports.
 */module.exports = Transport; /**
 * Transport abstract constructor.
 *
 * @param {Object} options.
 * @api private
 */function Transport(opts){this.path = opts.path;this.hostname = opts.hostname;this.port = opts.port;this.secure = opts.secure;this.query = opts.query;this.timestampParam = opts.timestampParam;this.timestampRequests = opts.timestampRequests;this.readyState = '';this.agent = opts.agent || false;this.socket = opts.socket;this.enablesXDR = opts.enablesXDR; // SSL options for Node.js client
this.pfx = opts.pfx;this.key = opts.key;this.passphrase = opts.passphrase;this.cert = opts.cert;this.ca = opts.ca;this.ciphers = opts.ciphers;this.rejectUnauthorized = opts.rejectUnauthorized; // other options for Node.js client
this.extraHeaders = opts.extraHeaders;} /**
 * Mix in `Emitter`.
 */Emitter(Transport.prototype); /**
 * Emits an error.
 *
 * @param {String} str
 * @return {Transport} for chaining
 * @api public
 */Transport.prototype.onError = function(msg,desc){var err=new Error(msg);err.type = 'TransportError';err.description = desc;this.emit('error',err);return this;}; /**
 * Opens the transport.
 *
 * @api public
 */Transport.prototype.open = function(){if('closed' == this.readyState || '' == this.readyState){this.readyState = 'opening';this.doOpen();}return this;}; /**
 * Closes the transport.
 *
 * @api private
 */Transport.prototype.close = function(){if('opening' == this.readyState || 'open' == this.readyState){this.doClose();this.onClose();}return this;}; /**
 * Sends multiple packets.
 *
 * @param {Array} packets
 * @api private
 */Transport.prototype.send = function(packets){if('open' == this.readyState){this.write(packets);}else {throw new Error('Transport not open');}}; /**
 * Called upon open
 *
 * @api private
 */Transport.prototype.onOpen = function(){this.readyState = 'open';this.writable = true;this.emit('open');}; /**
 * Called with data.
 *
 * @param {String} data
 * @api private
 */Transport.prototype.onData = function(data){var packet=parser.decodePacket(data,this.socket.binaryType);this.onPacket(packet);}; /**
 * Called with a decoded packet.
 */Transport.prototype.onPacket = function(packet){this.emit('packet',packet);}; /**
 * Called upon close.
 *
 * @api private
 */Transport.prototype.onClose = function(){this.readyState = 'closed';this.emit('close');};},{"component-emitter":15,"engine.io-parser":19}],5:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies
 */var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var XHR=_dereq_('./polling-xhr');var JSONP=_dereq_('./polling-jsonp');var websocket=_dereq_('./websocket'); /**
 * Export transports.
 */exports.polling = polling;exports.websocket = websocket; /**
 * Polling transport polymorphic constructor.
 * Decides on xhr vs jsonp based on feature detection.
 *
 * @api private
 */function polling(opts){var xhr;var xd=false;var xs=false;var jsonp=false !== opts.jsonp;if(global.location){var isSSL='https:' == location.protocol;var port=location.port; // some user agents have empty `location.port`
if(!port){port = isSSL?443:80;}xd = opts.hostname != location.hostname || port != opts.port;xs = opts.secure != isSSL;}opts.xdomain = xd;opts.xscheme = xs;xhr = new XMLHttpRequest(opts);if('open' in xhr && !opts.forceJSONP){return new XHR(opts);}else {if(!jsonp)throw new Error('JSONP disabled');return new JSONP(opts);}}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling-jsonp":6,"./polling-xhr":7,"./websocket":9,"xmlhttprequest-ssl":10}],6:[function(_dereq_,module,exports){(function(global){ /**
 * Module requirements.
 */var Polling=_dereq_('./polling');var inherit=_dereq_('component-inherit'); /**
 * Module exports.
 */module.exports = JSONPPolling; /**
 * Cached regular expressions.
 */var rNewline=/\n/g;var rEscapedNewline=/\\n/g; /**
 * Global JSONP callbacks.
 */var callbacks; /**
 * Callbacks count.
 */var index=0; /**
 * Noop.
 */function empty(){} /**
 * JSONP Polling constructor.
 *
 * @param {Object} opts.
 * @api public
 */function JSONPPolling(opts){Polling.call(this,opts);this.query = this.query || {}; // define global callbacks array if not present
// we do this here (lazily) to avoid unneeded global pollution
if(!callbacks){ // we need to consider multiple engines in the same page
if(!global.___eio)global.___eio = [];callbacks = global.___eio;} // callback identifier
this.index = callbacks.length; // add callback to jsonp global
var self=this;callbacks.push(function(msg){self.onData(msg);}); // append to query string
this.query.j = this.index; // prevent spurious errors from being emitted when the window is unloaded
if(global.document && global.addEventListener){global.addEventListener('beforeunload',function(){if(self.script)self.script.onerror = empty;},false);}} /**
 * Inherits from Polling.
 */inherit(JSONPPolling,Polling); /*
 * JSONP only supports binary as base64 encoded strings
 */JSONPPolling.prototype.supportsBinary = false; /**
 * Closes the socket.
 *
 * @api private
 */JSONPPolling.prototype.doClose = function(){if(this.script){this.script.parentNode.removeChild(this.script);this.script = null;}if(this.form){this.form.parentNode.removeChild(this.form);this.form = null;this.iframe = null;}Polling.prototype.doClose.call(this);}; /**
 * Starts a poll cycle.
 *
 * @api private
 */JSONPPolling.prototype.doPoll = function(){var self=this;var script=document.createElement('script');if(this.script){this.script.parentNode.removeChild(this.script);this.script = null;}script.async = true;script.src = this.uri();script.onerror = function(e){self.onError('jsonp poll error',e);};var insertAt=document.getElementsByTagName('script')[0];if(insertAt){insertAt.parentNode.insertBefore(script,insertAt);}else {(document.head || document.body).appendChild(script);}this.script = script;var isUAgecko='undefined' != typeof navigator && /gecko/i.test(navigator.userAgent);if(isUAgecko){setTimeout(function(){var iframe=document.createElement('iframe');document.body.appendChild(iframe);document.body.removeChild(iframe);},100);}}; /**
 * Writes with a hidden iframe.
 *
 * @param {String} data to send
 * @param {Function} called upon flush.
 * @api private
 */JSONPPolling.prototype.doWrite = function(data,fn){var self=this;if(!this.form){var form=document.createElement('form');var area=document.createElement('textarea');var id=this.iframeId = 'eio_iframe_' + this.index;var iframe;form.className = 'socketio';form.style.position = 'absolute';form.style.top = '-1000px';form.style.left = '-1000px';form.target = id;form.method = 'POST';form.setAttribute('accept-charset','utf-8');area.name = 'd';form.appendChild(area);document.body.appendChild(form);this.form = form;this.area = area;}this.form.action = this.uri();function complete(){initIframe();fn();}function initIframe(){if(self.iframe){try{self.form.removeChild(self.iframe);}catch(e) {self.onError('jsonp polling iframe removal error',e);}}try{ // ie6 dynamic iframes with target="" support (thanks Chris Lambacher)
var html='<iframe src="javascript:0" name="' + self.iframeId + '">';iframe = document.createElement(html);}catch(e) {iframe = document.createElement('iframe');iframe.name = self.iframeId;iframe.src = 'javascript:0';}iframe.id = self.iframeId;self.form.appendChild(iframe);self.iframe = iframe;}initIframe(); // escape \n to prevent it from being converted into \r\n by some UAs
// double escaping is required for escaped new lines because unescaping of new lines can be done safely on server-side
data = data.replace(rEscapedNewline,'\\\n');this.area.value = data.replace(rNewline,'\\n');try{this.form.submit();}catch(e) {}if(this.iframe.attachEvent){this.iframe.onreadystatechange = function(){if(self.iframe.readyState == 'complete'){complete();}};}else {this.iframe.onload = complete;}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling":8,"component-inherit":16}],7:[function(_dereq_,module,exports){(function(global){ /**
 * Module requirements.
 */var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var Polling=_dereq_('./polling');var Emitter=_dereq_('component-emitter');var inherit=_dereq_('component-inherit');var debug=_dereq_('debug')('engine.io-client:polling-xhr'); /**
 * Module exports.
 */module.exports = XHR;module.exports.Request = Request; /**
 * Empty function
 */function empty(){} /**
 * XHR Polling constructor.
 *
 * @param {Object} opts
 * @api public
 */function XHR(opts){Polling.call(this,opts);if(global.location){var isSSL='https:' == location.protocol;var port=location.port; // some user agents have empty `location.port`
if(!port){port = isSSL?443:80;}this.xd = opts.hostname != global.location.hostname || port != opts.port;this.xs = opts.secure != isSSL;}else {this.extraHeaders = opts.extraHeaders;}} /**
 * Inherits from Polling.
 */inherit(XHR,Polling); /**
 * XHR supports binary
 */XHR.prototype.supportsBinary = true; /**
 * Creates a request.
 *
 * @param {String} method
 * @api private
 */XHR.prototype.request = function(opts){opts = opts || {};opts.uri = this.uri();opts.xd = this.xd;opts.xs = this.xs;opts.agent = this.agent || false;opts.supportsBinary = this.supportsBinary;opts.enablesXDR = this.enablesXDR; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized; // other options for Node.js client
opts.extraHeaders = this.extraHeaders;return new Request(opts);}; /**
 * Sends data.
 *
 * @param {String} data to send.
 * @param {Function} called upon flush.
 * @api private
 */XHR.prototype.doWrite = function(data,fn){var isBinary=typeof data !== 'string' && data !== undefined;var req=this.request({method:'POST',data:data,isBinary:isBinary});var self=this;req.on('success',fn);req.on('error',function(err){self.onError('xhr post error',err);});this.sendXhr = req;}; /**
 * Starts a poll cycle.
 *
 * @api private
 */XHR.prototype.doPoll = function(){debug('xhr poll');var req=this.request();var self=this;req.on('data',function(data){self.onData(data);});req.on('error',function(err){self.onError('xhr poll error',err);});this.pollXhr = req;}; /**
 * Request constructor
 *
 * @param {Object} options
 * @api public
 */function Request(opts){this.method = opts.method || 'GET';this.uri = opts.uri;this.xd = !!opts.xd;this.xs = !!opts.xs;this.async = false !== opts.async;this.data = undefined != opts.data?opts.data:null;this.agent = opts.agent;this.isBinary = opts.isBinary;this.supportsBinary = opts.supportsBinary;this.enablesXDR = opts.enablesXDR; // SSL options for Node.js client
this.pfx = opts.pfx;this.key = opts.key;this.passphrase = opts.passphrase;this.cert = opts.cert;this.ca = opts.ca;this.ciphers = opts.ciphers;this.rejectUnauthorized = opts.rejectUnauthorized; // other options for Node.js client
this.extraHeaders = opts.extraHeaders;this.create();} /**
 * Mix in `Emitter`.
 */Emitter(Request.prototype); /**
 * Creates the XHR object and sends the request.
 *
 * @api private
 */Request.prototype.create = function(){var opts={agent:this.agent,xdomain:this.xd,xscheme:this.xs,enablesXDR:this.enablesXDR}; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized;var xhr=this.xhr = new XMLHttpRequest(opts);var self=this;try{debug('xhr open %s: %s',this.method,this.uri);xhr.open(this.method,this.uri,this.async);try{if(this.extraHeaders){xhr.setDisableHeaderCheck(true);for(var i in this.extraHeaders) {if(this.extraHeaders.hasOwnProperty(i)){xhr.setRequestHeader(i,this.extraHeaders[i]);}}}}catch(e) {}if(this.supportsBinary){ // This has to be done after open because Firefox is stupid
// http://stackoverflow.com/questions/13216903/get-binary-data-with-xmlhttprequest-in-a-firefox-extension
xhr.responseType = 'arraybuffer';}if('POST' == this.method){try{if(this.isBinary){xhr.setRequestHeader('Content-type','application/octet-stream');}else {xhr.setRequestHeader('Content-type','text/plain;charset=UTF-8');}}catch(e) {}} // ie6 check
if('withCredentials' in xhr){xhr.withCredentials = true;}if(this.hasXDR()){xhr.onload = function(){self.onLoad();};xhr.onerror = function(){self.onError(xhr.responseText);};}else {xhr.onreadystatechange = function(){if(4 != xhr.readyState)return;if(200 == xhr.status || 1223 == xhr.status){self.onLoad();}else { // make sure the `error` event handler that's user-set
// does not throw in the same tick and gets caught here
setTimeout(function(){self.onError(xhr.status);},0);}};}debug('xhr data %s',this.data);xhr.send(this.data);}catch(e) { // Need to defer since .create() is called directly fhrom the constructor
// and thus the 'error' event can only be only bound *after* this exception
// occurs.  Therefore, also, we cannot throw here at all.
setTimeout(function(){self.onError(e);},0);return;}if(global.document){this.index = Request.requestsCount++;Request.requests[this.index] = this;}}; /**
 * Called upon successful response.
 *
 * @api private
 */Request.prototype.onSuccess = function(){this.emit('success');this.cleanup();}; /**
 * Called if we have data.
 *
 * @api private
 */Request.prototype.onData = function(data){this.emit('data',data);this.onSuccess();}; /**
 * Called upon error.
 *
 * @api private
 */Request.prototype.onError = function(err){this.emit('error',err);this.cleanup(true);}; /**
 * Cleans up house.
 *
 * @api private
 */Request.prototype.cleanup = function(fromError){if('undefined' == typeof this.xhr || null === this.xhr){return;} // xmlhttprequest
if(this.hasXDR()){this.xhr.onload = this.xhr.onerror = empty;}else {this.xhr.onreadystatechange = empty;}if(fromError){try{this.xhr.abort();}catch(e) {}}if(global.document){delete Request.requests[this.index];}this.xhr = null;}; /**
 * Called upon load.
 *
 * @api private
 */Request.prototype.onLoad = function(){var data;try{var contentType;try{contentType = this.xhr.getResponseHeader('Content-Type').split(';')[0];}catch(e) {}if(contentType === 'application/octet-stream'){data = this.xhr.response;}else {if(!this.supportsBinary){data = this.xhr.responseText;}else {try{data = String.fromCharCode.apply(null,new Uint8Array(this.xhr.response));}catch(e) {var ui8Arr=new Uint8Array(this.xhr.response);var dataArray=[];for(var idx=0,length=ui8Arr.length;idx < length;idx++) {dataArray.push(ui8Arr[idx]);}data = String.fromCharCode.apply(null,dataArray);}}}}catch(e) {this.onError(e);}if(null != data){this.onData(data);}}; /**
 * Check if it has XDomainRequest.
 *
 * @api private
 */Request.prototype.hasXDR = function(){return 'undefined' !== typeof global.XDomainRequest && !this.xs && this.enablesXDR;}; /**
 * Aborts the request.
 *
 * @api public
 */Request.prototype.abort = function(){this.cleanup();}; /**
 * Aborts pending requests when unloading the window. This is needed to prevent
 * memory leaks (e.g. when using IE) and to ensure that no spurious error is
 * emitted.
 */if(global.document){Request.requestsCount = 0;Request.requests = {};if(global.attachEvent){global.attachEvent('onunload',unloadHandler);}else if(global.addEventListener){global.addEventListener('beforeunload',unloadHandler,false);}}function unloadHandler(){for(var i in Request.requests) {if(Request.requests.hasOwnProperty(i)){Request.requests[i].abort();}}}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./polling":8,"component-emitter":15,"component-inherit":16,"debug":17,"xmlhttprequest-ssl":10}],8:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var Transport=_dereq_('../transport');var parseqs=_dereq_('parseqs');var parser=_dereq_('engine.io-parser');var inherit=_dereq_('component-inherit');var yeast=_dereq_('yeast');var debug=_dereq_('debug')('engine.io-client:polling'); /**
 * Module exports.
 */module.exports = Polling; /**
 * Is XHR2 supported?
 */var hasXHR2=(function(){var XMLHttpRequest=_dereq_('xmlhttprequest-ssl');var xhr=new XMLHttpRequest({xdomain:false});return null != xhr.responseType;})(); /**
 * Polling interface.
 *
 * @param {Object} opts
 * @api private
 */function Polling(opts){var forceBase64=opts && opts.forceBase64;if(!hasXHR2 || forceBase64){this.supportsBinary = false;}Transport.call(this,opts);} /**
 * Inherits from Transport.
 */inherit(Polling,Transport); /**
 * Transport name.
 */Polling.prototype.name = 'polling'; /**
 * Opens the socket (triggers polling). We write a PING message to determine
 * when the transport is open.
 *
 * @api private
 */Polling.prototype.doOpen = function(){this.poll();}; /**
 * Pauses polling.
 *
 * @param {Function} callback upon buffers are flushed and transport is paused
 * @api private
 */Polling.prototype.pause = function(onPause){var pending=0;var self=this;this.readyState = 'pausing';function pause(){debug('paused');self.readyState = 'paused';onPause();}if(this.polling || !this.writable){var total=0;if(this.polling){debug('we are currently polling - waiting to pause');total++;this.once('pollComplete',function(){debug('pre-pause polling complete');--total || pause();});}if(!this.writable){debug('we are currently writing - waiting to pause');total++;this.once('drain',function(){debug('pre-pause writing complete');--total || pause();});}}else {pause();}}; /**
 * Starts polling cycle.
 *
 * @api public
 */Polling.prototype.poll = function(){debug('polling');this.polling = true;this.doPoll();this.emit('poll');}; /**
 * Overloads onData to detect payloads.
 *
 * @api private
 */Polling.prototype.onData = function(data){var self=this;debug('polling got data %s',data);var callback=function callback(packet,index,total){ // if its the first message we consider the transport open
if('opening' == self.readyState){self.onOpen();} // if its a close packet, we close the ongoing requests
if('close' == packet.type){self.onClose();return false;} // otherwise bypass onData and handle the message
self.onPacket(packet);}; // decode payload
parser.decodePayload(data,this.socket.binaryType,callback); // if an event did not trigger closing
if('closed' != this.readyState){ // if we got data we're not polling
this.polling = false;this.emit('pollComplete');if('open' == this.readyState){this.poll();}else {debug('ignoring poll - transport state "%s"',this.readyState);}}}; /**
 * For polling, send a close packet.
 *
 * @api private
 */Polling.prototype.doClose = function(){var self=this;function close(){debug('writing close packet');self.write([{type:'close'}]);}if('open' == this.readyState){debug('transport open - closing');close();}else { // in case we're trying to close while
// handshaking is in progress (GH-164)
debug('transport not open - deferring close');this.once('open',close);}}; /**
 * Writes a packets payload.
 *
 * @param {Array} data packets
 * @param {Function} drain callback
 * @api private
 */Polling.prototype.write = function(packets){var self=this;this.writable = false;var callbackfn=function callbackfn(){self.writable = true;self.emit('drain');};var self=this;parser.encodePayload(packets,this.supportsBinary,function(data){self.doWrite(data,callbackfn);});}; /**
 * Generates uri for connection.
 *
 * @api private
 */Polling.prototype.uri = function(){var query=this.query || {};var schema=this.secure?'https':'http';var port=''; // cache busting is forced
if(false !== this.timestampRequests){query[this.timestampParam] = yeast();}if(!this.supportsBinary && !query.sid){query.b64 = 1;}query = parseqs.encode(query); // avoid port if default for schema
if(this.port && ('https' == schema && this.port != 443 || 'http' == schema && this.port != 80)){port = ':' + this.port;} // prepend ? to query
if(query.length){query = '?' + query;}var ipv6=this.hostname.indexOf(':') !== -1;return schema + '://' + (ipv6?'[' + this.hostname + ']':this.hostname) + port + this.path + query;};},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"xmlhttprequest-ssl":10,"yeast":30}],9:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var Transport=_dereq_('../transport');var parser=_dereq_('engine.io-parser');var parseqs=_dereq_('parseqs');var inherit=_dereq_('component-inherit');var yeast=_dereq_('yeast');var debug=_dereq_('debug')('engine.io-client:websocket');var BrowserWebSocket=global.WebSocket || global.MozWebSocket; /**
 * Get either the `WebSocket` or `MozWebSocket` globals
 * in the browser or the WebSocket-compatible interface
 * exposed by `ws` for Node environment.
 */var WebSocket=BrowserWebSocket || (typeof window !== 'undefined'?null:_dereq_('ws')); /**
 * Module exports.
 */module.exports = WS; /**
 * WebSocket transport constructor.
 *
 * @api {Object} connection options
 * @api public
 */function WS(opts){var forceBase64=opts && opts.forceBase64;if(forceBase64){this.supportsBinary = false;}this.perMessageDeflate = opts.perMessageDeflate;Transport.call(this,opts);} /**
 * Inherits from Transport.
 */inherit(WS,Transport); /**
 * Transport name.
 *
 * @api public
 */WS.prototype.name = 'websocket'; /*
 * WebSockets support binary
 */WS.prototype.supportsBinary = true; /**
 * Opens socket.
 *
 * @api private
 */WS.prototype.doOpen = function(){if(!this.check()){ // let probe timeout
return;}var self=this;var uri=this.uri();var protocols=void 0;var opts={agent:this.agent,perMessageDeflate:this.perMessageDeflate}; // SSL options for Node.js client
opts.pfx = this.pfx;opts.key = this.key;opts.passphrase = this.passphrase;opts.cert = this.cert;opts.ca = this.ca;opts.ciphers = this.ciphers;opts.rejectUnauthorized = this.rejectUnauthorized;if(this.extraHeaders){opts.headers = this.extraHeaders;}this.ws = BrowserWebSocket?new WebSocket(uri):new WebSocket(uri,protocols,opts);if(this.ws.binaryType === undefined){this.supportsBinary = false;}if(this.ws.supports && this.ws.supports.binary){this.supportsBinary = true;this.ws.binaryType = 'buffer';}else {this.ws.binaryType = 'arraybuffer';}this.addEventListeners();}; /**
 * Adds event listeners to the socket
 *
 * @api private
 */WS.prototype.addEventListeners = function(){var self=this;this.ws.onopen = function(){self.onOpen();};this.ws.onclose = function(){self.onClose();};this.ws.onmessage = function(ev){self.onData(ev.data);};this.ws.onerror = function(e){self.onError('websocket error',e);};}; /**
 * Override `onData` to use a timer on iOS.
 * See: https://gist.github.com/mloughran/2052006
 *
 * @api private
 */if('undefined' != typeof navigator && /iPad|iPhone|iPod/i.test(navigator.userAgent)){WS.prototype.onData = function(data){var self=this;setTimeout(function(){Transport.prototype.onData.call(self,data);},0);};} /**
 * Writes data to socket.
 *
 * @param {Array} array of packets.
 * @api private
 */WS.prototype.write = function(packets){var self=this;this.writable = false; // encodePacket efficient as it uses WS framing
// no need for encodePayload
var total=packets.length;for(var i=0,l=total;i < l;i++) {(function(packet){parser.encodePacket(packet,self.supportsBinary,function(data){if(!BrowserWebSocket){ // always create a new object (GH-437)
var opts={};if(packet.options){opts.compress = packet.options.compress;}if(self.perMessageDeflate){var len='string' == typeof data?global.Buffer.byteLength(data):data.length;if(len < self.perMessageDeflate.threshold){opts.compress = false;}}} //Sometimes the websocket has already been closed but the browser didn't
//have a chance of informing us about it yet, in that case send will
//throw an error
try{if(BrowserWebSocket){ // TypeError is thrown when passing the second argument on Safari
self.ws.send(data);}else {self.ws.send(data,opts);}}catch(e) {debug('websocket closed before onclose event');}--total || done();});})(packets[i]);}function done(){self.emit('flush'); // fake drain
// defer to next tick to allow Socket to clear writeBuffer
setTimeout(function(){self.writable = true;self.emit('drain');},0);}}; /**
 * Called upon close
 *
 * @api private
 */WS.prototype.onClose = function(){Transport.prototype.onClose.call(this);}; /**
 * Closes socket.
 *
 * @api private
 */WS.prototype.doClose = function(){if(typeof this.ws !== 'undefined'){this.ws.close();}}; /**
 * Generates uri for connection.
 *
 * @api private
 */WS.prototype.uri = function(){var query=this.query || {};var schema=this.secure?'wss':'ws';var port=''; // avoid port if default for schema
if(this.port && ('wss' == schema && this.port != 443 || 'ws' == schema && this.port != 80)){port = ':' + this.port;} // append timestamp to URI
if(this.timestampRequests){query[this.timestampParam] = yeast();} // communicate binary support capabilities
if(!this.supportsBinary){query.b64 = 1;}query = parseqs.encode(query); // prepend ? to query
if(query.length){query = '?' + query;}var ipv6=this.hostname.indexOf(':') !== -1;return schema + '://' + (ipv6?'[' + this.hostname + ']':this.hostname) + port + this.path + query;}; /**
 * Feature detection for WebSocket.
 *
 * @return {Boolean} whether this transport is available.
 * @api public
 */WS.prototype.check = function(){return !!WebSocket && !('__initialize' in WebSocket && this.name === WS.prototype.name);};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"../transport":4,"component-inherit":16,"debug":17,"engine.io-parser":19,"parseqs":27,"ws":undefined,"yeast":30}],10:[function(_dereq_,module,exports){ // browser shim for xmlhttprequest module
var hasCORS=_dereq_('has-cors');module.exports = function(opts){var xdomain=opts.xdomain; // scheme must be same when usign XDomainRequest
// http://blogs.msdn.com/b/ieinternals/archive/2010/05/13/xdomainrequest-restrictions-limitations-and-workarounds.aspx
var xscheme=opts.xscheme; // XDomainRequest has a flow of not sending cookie, therefore it should be disabled as a default.
// https://github.com/Automattic/engine.io-client/pull/217
var enablesXDR=opts.enablesXDR; // XMLHttpRequest can be disabled on IE
try{if('undefined' != typeof XMLHttpRequest && (!xdomain || hasCORS)){return new XMLHttpRequest();}}catch(e) {} // Use XDomainRequest for IE8 if enablesXDR is true
// because loading bar keeps flashing when using jsonp-polling
// https://github.com/yujiosaka/socke.io-ie8-loading-example
try{if('undefined' != typeof XDomainRequest && !xscheme && enablesXDR){return new XDomainRequest();}}catch(e) {}if(!xdomain){try{return new ActiveXObject('Microsoft.XMLHTTP');}catch(e) {}}};},{"has-cors":22}],11:[function(_dereq_,module,exports){module.exports = after;function after(count,callback,err_cb){var bail=false;err_cb = err_cb || noop;proxy.count = count;return count === 0?callback():proxy;function proxy(err,result){if(proxy.count <= 0){throw new Error('after called too many times');}--proxy.count; // after first error, rest are passed to err_cb
if(err){bail = true;callback(err); // future error callbacks will go to error handler
callback = err_cb;}else if(proxy.count === 0 && !bail){callback(null,result);}}}function noop(){}},{}],12:[function(_dereq_,module,exports){ /**
 * An abstraction for slicing an arraybuffer even when
 * ArrayBuffer.prototype.slice is not supported
 *
 * @api public
 */module.exports = function(arraybuffer,start,end){var bytes=arraybuffer.byteLength;start = start || 0;end = end || bytes;if(arraybuffer.slice){return arraybuffer.slice(start,end);}if(start < 0){start += bytes;}if(end < 0){end += bytes;}if(end > bytes){end = bytes;}if(start >= bytes || start >= end || bytes === 0){return new ArrayBuffer(0);}var abv=new Uint8Array(arraybuffer);var result=new Uint8Array(end - start);for(var i=start,ii=0;i < end;i++,ii++) {result[ii] = abv[i];}return result.buffer;};},{}],13:[function(_dereq_,module,exports){ /*
 * base64-arraybuffer
 * https://github.com/niklasvh/base64-arraybuffer
 *
 * Copyright (c) 2012 Niklas von Hertzen
 * Licensed under the MIT license.
 */(function(chars){"use strict";exports.encode = function(arraybuffer){var bytes=new Uint8Array(arraybuffer),i,len=bytes.length,base64="";for(i = 0;i < len;i += 3) {base64 += chars[bytes[i] >> 2];base64 += chars[(bytes[i] & 3) << 4 | bytes[i + 1] >> 4];base64 += chars[(bytes[i + 1] & 15) << 2 | bytes[i + 2] >> 6];base64 += chars[bytes[i + 2] & 63];}if(len % 3 === 2){base64 = base64.substring(0,base64.length - 1) + "=";}else if(len % 3 === 1){base64 = base64.substring(0,base64.length - 2) + "==";}return base64;};exports.decode = function(base64){var bufferLength=base64.length * 0.75,len=base64.length,i,p=0,encoded1,encoded2,encoded3,encoded4;if(base64[base64.length - 1] === "="){bufferLength--;if(base64[base64.length - 2] === "="){bufferLength--;}}var arraybuffer=new ArrayBuffer(bufferLength),bytes=new Uint8Array(arraybuffer);for(i = 0;i < len;i += 4) {encoded1 = chars.indexOf(base64[i]);encoded2 = chars.indexOf(base64[i + 1]);encoded3 = chars.indexOf(base64[i + 2]);encoded4 = chars.indexOf(base64[i + 3]);bytes[p++] = encoded1 << 2 | encoded2 >> 4;bytes[p++] = (encoded2 & 15) << 4 | encoded3 >> 2;bytes[p++] = (encoded3 & 3) << 6 | encoded4 & 63;}return arraybuffer;};})("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");},{}],14:[function(_dereq_,module,exports){(function(global){ /**
 * Create a blob builder even when vendor prefixes exist
 */var BlobBuilder=global.BlobBuilder || global.WebKitBlobBuilder || global.MSBlobBuilder || global.MozBlobBuilder; /**
 * Check if Blob constructor is supported
 */var blobSupported=(function(){try{var a=new Blob(['hi']);return a.size === 2;}catch(e) {return false;}})(); /**
 * Check if Blob constructor supports ArrayBufferViews
 * Fails in Safari 6, so we need to map to ArrayBuffers there.
 */var blobSupportsArrayBufferView=blobSupported && (function(){try{var b=new Blob([new Uint8Array([1,2])]);return b.size === 2;}catch(e) {return false;}})(); /**
 * Check if BlobBuilder is supported
 */var blobBuilderSupported=BlobBuilder && BlobBuilder.prototype.append && BlobBuilder.prototype.getBlob; /**
 * Helper function that maps ArrayBufferViews to ArrayBuffers
 * Used by BlobBuilder constructor and old browsers that didn't
 * support it in the Blob constructor.
 */function mapArrayBufferViews(ary){for(var i=0;i < ary.length;i++) {var chunk=ary[i];if(chunk.buffer instanceof ArrayBuffer){var buf=chunk.buffer; // if this is a subarray, make a copy so we only
// include the subarray region from the underlying buffer
if(chunk.byteLength !== buf.byteLength){var copy=new Uint8Array(chunk.byteLength);copy.set(new Uint8Array(buf,chunk.byteOffset,chunk.byteLength));buf = copy.buffer;}ary[i] = buf;}}}function BlobBuilderConstructor(ary,options){options = options || {};var bb=new BlobBuilder();mapArrayBufferViews(ary);for(var i=0;i < ary.length;i++) {bb.append(ary[i]);}return options.type?bb.getBlob(options.type):bb.getBlob();};function BlobConstructor(ary,options){mapArrayBufferViews(ary);return new Blob(ary,options || {});};module.exports = (function(){if(blobSupported){return blobSupportsArrayBufferView?global.Blob:BlobConstructor;}else if(blobBuilderSupported){return BlobBuilderConstructor;}else {return undefined;}})();}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],15:[function(_dereq_,module,exports){ /**
 * Expose `Emitter`.
 */module.exports = Emitter; /**
 * Initialize a new `Emitter`.
 *
 * @api public
 */function Emitter(obj){if(obj)return mixin(obj);}; /**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */function mixin(obj){for(var key in Emitter.prototype) {obj[key] = Emitter.prototype[key];}return obj;} /**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.on = Emitter.prototype.addEventListener = function(event,fn){this._callbacks = this._callbacks || {};(this._callbacks[event] = this._callbacks[event] || []).push(fn);return this;}; /**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.once = function(event,fn){var self=this;this._callbacks = this._callbacks || {};function on(){self.off(event,on);fn.apply(this,arguments);}on.fn = fn;this.on(event,on);return this;}; /**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event,fn){this._callbacks = this._callbacks || {}; // all
if(0 == arguments.length){this._callbacks = {};return this;} // specific event
var callbacks=this._callbacks[event];if(!callbacks)return this; // remove all handlers
if(1 == arguments.length){delete this._callbacks[event];return this;} // remove specific handler
var cb;for(var i=0;i < callbacks.length;i++) {cb = callbacks[i];if(cb === fn || cb.fn === fn){callbacks.splice(i,1);break;}}return this;}; /**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */Emitter.prototype.emit = function(event){this._callbacks = this._callbacks || {};var args=[].slice.call(arguments,1),callbacks=this._callbacks[event];if(callbacks){callbacks = callbacks.slice(0);for(var i=0,len=callbacks.length;i < len;++i) {callbacks[i].apply(this,args);}}return this;}; /**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */Emitter.prototype.listeners = function(event){this._callbacks = this._callbacks || {};return this._callbacks[event] || [];}; /**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */Emitter.prototype.hasListeners = function(event){return !!this.listeners(event).length;};},{}],16:[function(_dereq_,module,exports){module.exports = function(a,b){var fn=function fn(){};fn.prototype = b.prototype;a.prototype = new fn();a.prototype.constructor = a;};},{}],17:[function(_dereq_,module,exports){ /**
 * This is the web browser implementation of `debug()`.
 *
 * Expose `debug()` as the module.
 */exports = module.exports = _dereq_('./debug');exports.log = log;exports.formatArgs = formatArgs;exports.save = save;exports.load = load;exports.useColors = useColors;exports.storage = 'undefined' != typeof chrome && 'undefined' != typeof chrome.storage?chrome.storage.local:localstorage(); /**
 * Colors.
 */exports.colors = ['lightseagreen','forestgreen','goldenrod','dodgerblue','darkorchid','crimson']; /**
 * Currently only WebKit-based Web Inspectors, Firefox >= v31,
 * and the Firebug extension (any Firefox version) are known
 * to support "%c" CSS customizations.
 *
 * TODO: add a `localStorage` variable to explicitly enable/disable colors
 */function useColors(){ // is webkit? http://stackoverflow.com/a/16459606/376773
return 'WebkitAppearance' in document.documentElement.style ||  // is firebug? http://stackoverflow.com/a/398120/376773
window.console && (console.firebug || console.exception && console.table) ||  // is firefox >= v31?
// https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/) && parseInt(RegExp.$1,10) >= 31;} /**
 * Map %j to `JSON.stringify()`, since no Web Inspectors do that by default.
 */exports.formatters.j = function(v){return JSON.stringify(v);}; /**
 * Colorize log arguments if enabled.
 *
 * @api public
 */function formatArgs(){var args=arguments;var useColors=this.useColors;args[0] = (useColors?'%c':'') + this.namespace + (useColors?' %c':' ') + args[0] + (useColors?'%c ':' ') + '+' + exports.humanize(this.diff);if(!useColors)return args;var c='color: ' + this.color;args = [args[0],c,'color: inherit'].concat(Array.prototype.slice.call(args,1)); // the final "%c" is somewhat tricky, because there could be other
// arguments passed either before or after the %c, so we need to
// figure out the correct index to insert the CSS into
var index=0;var lastC=0;args[0].replace(/%[a-z%]/g,function(match){if('%%' === match)return;index++;if('%c' === match){ // we only are interested in the *last* %c
// (the user may have provided their own)
lastC = index;}});args.splice(lastC,0,c);return args;} /**
 * Invokes `console.log()` when available.
 * No-op when `console.log` is not a "function".
 *
 * @api public
 */function log(){ // this hackery is required for IE8/9, where
// the `console.log` function doesn't have 'apply'
return 'object' === typeof console && console.log && Function.prototype.apply.call(console.log,console,arguments);} /**
 * Save `namespaces`.
 *
 * @param {String} namespaces
 * @api private
 */function save(namespaces){try{if(null == namespaces){exports.storage.removeItem('debug');}else {exports.storage.debug = namespaces;}}catch(e) {}} /**
 * Load `namespaces`.
 *
 * @return {String} returns the previously persisted debug modes
 * @api private
 */function load(){var r;try{r = exports.storage.debug;}catch(e) {}return r;} /**
 * Enable namespaces listed in `localStorage.debug` initially.
 */exports.enable(load()); /**
 * Localstorage attempts to return the localstorage.
 *
 * This is necessary because safari throws
 * when a user disables cookies/localstorage
 * and you attempt to access it.
 *
 * @return {LocalStorage}
 * @api private
 */function localstorage(){try{return window.localStorage;}catch(e) {}}},{"./debug":18}],18:[function(_dereq_,module,exports){ /**
 * This is the common logic for both the Node.js and web browser
 * implementations of `debug()`.
 *
 * Expose `debug()` as the module.
 */exports = module.exports = debug;exports.coerce = coerce;exports.disable = disable;exports.enable = enable;exports.enabled = enabled;exports.humanize = _dereq_('ms'); /**
 * The currently active debug mode names, and names to skip.
 */exports.names = [];exports.skips = []; /**
 * Map of special "%n" handling functions, for the debug "format" argument.
 *
 * Valid key names are a single, lowercased letter, i.e. "n".
 */exports.formatters = {}; /**
 * Previously assigned color.
 */var prevColor=0; /**
 * Previous log timestamp.
 */var prevTime; /**
 * Select a color.
 *
 * @return {Number}
 * @api private
 */function selectColor(){return exports.colors[prevColor++ % exports.colors.length];} /**
 * Create a debugger with the given `namespace`.
 *
 * @param {String} namespace
 * @return {Function}
 * @api public
 */function debug(namespace){ // define the `disabled` version
function disabled(){}disabled.enabled = false; // define the `enabled` version
function enabled(){var self=enabled; // set `diff` timestamp
var curr=+new Date();var ms=curr - (prevTime || curr);self.diff = ms;self.prev = prevTime;self.curr = curr;prevTime = curr; // add the `color` if not set
if(null == self.useColors)self.useColors = exports.useColors();if(null == self.color && self.useColors)self.color = selectColor();var args=Array.prototype.slice.call(arguments);args[0] = exports.coerce(args[0]);if('string' !== typeof args[0]){ // anything else let's inspect with %o
args = ['%o'].concat(args);} // apply any `formatters` transformations
var index=0;args[0] = args[0].replace(/%([a-z%])/g,function(match,format){ // if we encounter an escaped % then don't increase the array index
if(match === '%%')return match;index++;var formatter=exports.formatters[format];if('function' === typeof formatter){var val=args[index];match = formatter.call(self,val); // now we need to remove `args[index]` since it's inlined in the `format`
args.splice(index,1);index--;}return match;});if('function' === typeof exports.formatArgs){args = exports.formatArgs.apply(self,args);}var logFn=enabled.log || exports.log || console.log.bind(console);logFn.apply(self,args);}enabled.enabled = true;var fn=exports.enabled(namespace)?enabled:disabled;fn.namespace = namespace;return fn;} /**
 * Enables a debug mode by namespaces. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} namespaces
 * @api public
 */function enable(namespaces){exports.save(namespaces);var split=(namespaces || '').split(/[\s,]+/);var len=split.length;for(var i=0;i < len;i++) {if(!split[i])continue; // ignore empty strings
namespaces = split[i].replace(/\*/g,'.*?');if(namespaces[0] === '-'){exports.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));}else {exports.names.push(new RegExp('^' + namespaces + '$'));}}} /**
 * Disable debug output.
 *
 * @api public
 */function disable(){exports.enable('');} /**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */function enabled(name){var i,len;for(i = 0,len = exports.skips.length;i < len;i++) {if(exports.skips[i].test(name)){return false;}}for(i = 0,len = exports.names.length;i < len;i++) {if(exports.names[i].test(name)){return true;}}return false;} /**
 * Coerce `val`.
 *
 * @param {Mixed} val
 * @return {Mixed}
 * @api private
 */function coerce(val){if(val instanceof Error)return val.stack || val.message;return val;}},{"ms":25}],19:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var keys=_dereq_('./keys');var hasBinary=_dereq_('has-binary');var sliceBuffer=_dereq_('arraybuffer.slice');var base64encoder=_dereq_('base64-arraybuffer');var after=_dereq_('after');var utf8=_dereq_('utf8'); /**
 * Check if we are running an android browser. That requires us to use
 * ArrayBuffer with polling transports...
 *
 * http://ghinda.net/jpeg-blob-ajax-android/
 */var isAndroid=navigator.userAgent.match(/Android/i); /**
 * Check if we are running in PhantomJS.
 * Uploading a Blob with PhantomJS does not work correctly, as reported here:
 * https://github.com/ariya/phantomjs/issues/11395
 * @type boolean
 */var isPhantomJS=/PhantomJS/i.test(navigator.userAgent); /**
 * When true, avoids using Blobs to encode payloads.
 * @type boolean
 */var dontSendBlobs=isAndroid || isPhantomJS; /**
 * Current protocol version.
 */exports.protocol = 3; /**
 * Packet types.
 */var packets=exports.packets = {open:0, // non-ws
close:1, // non-ws
ping:2,pong:3,message:4,upgrade:5,noop:6};var packetslist=keys(packets); /**
 * Premade error packet.
 */var err={type:'error',data:'parser error'}; /**
 * Create a blob api even for blob builder when vendor prefixes exist
 */var Blob=_dereq_('blob'); /**
 * Encodes a packet.
 *
 *     <packet type id> [ <data> ]
 *
 * Example:
 *
 *     5hello world
 *     3
 *     4
 *
 * Binary is encoded in an identical principle
 *
 * @api private
 */exports.encodePacket = function(packet,supportsBinary,utf8encode,callback){if('function' == typeof supportsBinary){callback = supportsBinary;supportsBinary = false;}if('function' == typeof utf8encode){callback = utf8encode;utf8encode = null;}var data=packet.data === undefined?undefined:packet.data.buffer || packet.data;if(global.ArrayBuffer && data instanceof ArrayBuffer){return encodeArrayBuffer(packet,supportsBinary,callback);}else if(Blob && data instanceof global.Blob){return encodeBlob(packet,supportsBinary,callback);} // might be an object with { base64: true, data: dataAsBase64String }
if(data && data.base64){return encodeBase64Object(packet,callback);} // Sending data as a utf-8 string
var encoded=packets[packet.type]; // data fragment is optional
if(undefined !== packet.data){encoded += utf8encode?utf8.encode(String(packet.data)):String(packet.data);}return callback('' + encoded);};function encodeBase64Object(packet,callback){ // packet data is an object { base64: true, data: dataAsBase64String }
var message='b' + exports.packets[packet.type] + packet.data.data;return callback(message);} /**
 * Encode packet helpers for binary types
 */function encodeArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}var data=packet.data;var contentArray=new Uint8Array(data);var resultBuffer=new Uint8Array(1 + data.byteLength);resultBuffer[0] = packets[packet.type];for(var i=0;i < contentArray.length;i++) {resultBuffer[i + 1] = contentArray[i];}return callback(resultBuffer.buffer);}function encodeBlobAsArrayBuffer(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}var fr=new FileReader();fr.onload = function(){packet.data = fr.result;exports.encodePacket(packet,supportsBinary,true,callback);};return fr.readAsArrayBuffer(packet.data);}function encodeBlob(packet,supportsBinary,callback){if(!supportsBinary){return exports.encodeBase64Packet(packet,callback);}if(dontSendBlobs){return encodeBlobAsArrayBuffer(packet,supportsBinary,callback);}var length=new Uint8Array(1);length[0] = packets[packet.type];var blob=new Blob([length.buffer,packet.data]);return callback(blob);} /**
 * Encodes a packet with binary data in a base64 string
 *
 * @param {Object} packet, has `type` and `data`
 * @return {String} base64 encoded message
 */exports.encodeBase64Packet = function(packet,callback){var message='b' + exports.packets[packet.type];if(Blob && packet.data instanceof global.Blob){var fr=new FileReader();fr.onload = function(){var b64=fr.result.split(',')[1];callback(message + b64);};return fr.readAsDataURL(packet.data);}var b64data;try{b64data = String.fromCharCode.apply(null,new Uint8Array(packet.data));}catch(e) { // iPhone Safari doesn't let you apply with typed arrays
var typed=new Uint8Array(packet.data);var basic=new Array(typed.length);for(var i=0;i < typed.length;i++) {basic[i] = typed[i];}b64data = String.fromCharCode.apply(null,basic);}message += global.btoa(b64data);return callback(message);}; /**
 * Decodes a packet. Changes format to Blob if requested.
 *
 * @return {Object} with `type` and `data` (if any)
 * @api private
 */exports.decodePacket = function(data,binaryType,utf8decode){ // String data
if(typeof data == 'string' || data === undefined){if(data.charAt(0) == 'b'){return exports.decodeBase64Packet(data.substr(1),binaryType);}if(utf8decode){try{data = utf8.decode(data);}catch(e) {return err;}}var type=data.charAt(0);if(Number(type) != type || !packetslist[type]){return err;}if(data.length > 1){return {type:packetslist[type],data:data.substring(1)};}else {return {type:packetslist[type]};}}var asArray=new Uint8Array(data);var type=asArray[0];var rest=sliceBuffer(data,1);if(Blob && binaryType === 'blob'){rest = new Blob([rest]);}return {type:packetslist[type],data:rest};}; /**
 * Decodes a packet encoded in a base64 string
 *
 * @param {String} base64 encoded message
 * @return {Object} with `type` and `data` (if any)
 */exports.decodeBase64Packet = function(msg,binaryType){var type=packetslist[msg.charAt(0)];if(!global.ArrayBuffer){return {type:type,data:{base64:true,data:msg.substr(1)}};}var data=base64encoder.decode(msg.substr(1));if(binaryType === 'blob' && Blob){data = new Blob([data]);}return {type:type,data:data};}; /**
 * Encodes multiple messages (payload).
 *
 *     <length>:data
 *
 * Example:
 *
 *     11:hello world2:hi
 *
 * If any contents are binary, they will be encoded as base64 strings. Base64
 * encoded strings are marked with a b before the length specifier
 *
 * @param {Array} packets
 * @api private
 */exports.encodePayload = function(packets,supportsBinary,callback){if(typeof supportsBinary == 'function'){callback = supportsBinary;supportsBinary = null;}var isBinary=hasBinary(packets);if(supportsBinary && isBinary){if(Blob && !dontSendBlobs){return exports.encodePayloadAsBlob(packets,callback);}return exports.encodePayloadAsArrayBuffer(packets,callback);}if(!packets.length){return callback('0:');}function setLengthHeader(message){return message.length + ':' + message;}function encodeOne(packet,doneCallback){exports.encodePacket(packet,!isBinary?false:supportsBinary,true,function(message){doneCallback(null,setLengthHeader(message));});}map(packets,encodeOne,function(err,results){return callback(results.join(''));});}; /**
 * Async array map using after
 */function map(ary,each,done){var result=new Array(ary.length);var next=after(ary.length,done);var eachWithIndex=function eachWithIndex(i,el,cb){each(el,function(error,msg){result[i] = msg;cb(error,result);});};for(var i=0;i < ary.length;i++) {eachWithIndex(i,ary[i],next);}} /*
 * Decodes data when a payload is maybe expected. Possible binary contents are
 * decoded from their base64 representation
 *
 * @param {String} data, callback method
 * @api public
 */exports.decodePayload = function(data,binaryType,callback){if(typeof data != 'string'){return exports.decodePayloadAsBinary(data,binaryType,callback);}if(typeof binaryType === 'function'){callback = binaryType;binaryType = null;}var packet;if(data == ''){ // parser error - ignoring payload
return callback(err,0,1);}var length='',n,msg;for(var i=0,l=data.length;i < l;i++) {var chr=data.charAt(i);if(':' != chr){length += chr;}else {if('' == length || length != (n = Number(length))){ // parser error - ignoring payload
return callback(err,0,1);}msg = data.substr(i + 1,n);if(length != msg.length){ // parser error - ignoring payload
return callback(err,0,1);}if(msg.length){packet = exports.decodePacket(msg,binaryType,true);if(err.type == packet.type && err.data == packet.data){ // parser error in individual packet - ignoring payload
return callback(err,0,1);}var ret=callback(packet,i + n,l);if(false === ret)return;} // advance cursor
i += n;length = '';}}if(length != ''){ // parser error - ignoring payload
return callback(err,0,1);}}; /**
 * Encodes multiple messages (payload) as binary.
 *
 * <1 = binary, 0 = string><number from 0-9><number from 0-9>[...]<number
 * 255><data>
 *
 * Example:
 * 1 3 255 1 2 3, if the binary contents are interpreted as 8 bit integers
 *
 * @param {Array} packets
 * @return {ArrayBuffer} encoded payload
 * @api private
 */exports.encodePayloadAsArrayBuffer = function(packets,callback){if(!packets.length){return callback(new ArrayBuffer(0));}function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(data){return doneCallback(null,data);});}map(packets,encodeOne,function(err,encodedPackets){var totalLength=encodedPackets.reduce(function(acc,p){var len;if(typeof p === 'string'){len = p.length;}else {len = p.byteLength;}return acc + len.toString().length + len + 2; // string/binary identifier + separator = 2
},0);var resultArray=new Uint8Array(totalLength);var bufferIndex=0;encodedPackets.forEach(function(p){var isString=typeof p === 'string';var ab=p;if(isString){var view=new Uint8Array(p.length);for(var i=0;i < p.length;i++) {view[i] = p.charCodeAt(i);}ab = view.buffer;}if(isString){ // not true binary
resultArray[bufferIndex++] = 0;}else { // true binary
resultArray[bufferIndex++] = 1;}var lenStr=ab.byteLength.toString();for(var i=0;i < lenStr.length;i++) {resultArray[bufferIndex++] = parseInt(lenStr[i]);}resultArray[bufferIndex++] = 255;var view=new Uint8Array(ab);for(var i=0;i < view.length;i++) {resultArray[bufferIndex++] = view[i];}});return callback(resultArray.buffer);});}; /**
 * Encode as Blob
 */exports.encodePayloadAsBlob = function(packets,callback){function encodeOne(packet,doneCallback){exports.encodePacket(packet,true,true,function(encoded){var binaryIdentifier=new Uint8Array(1);binaryIdentifier[0] = 1;if(typeof encoded === 'string'){var view=new Uint8Array(encoded.length);for(var i=0;i < encoded.length;i++) {view[i] = encoded.charCodeAt(i);}encoded = view.buffer;binaryIdentifier[0] = 0;}var len=encoded instanceof ArrayBuffer?encoded.byteLength:encoded.size;var lenStr=len.toString();var lengthAry=new Uint8Array(lenStr.length + 1);for(var i=0;i < lenStr.length;i++) {lengthAry[i] = parseInt(lenStr[i]);}lengthAry[lenStr.length] = 255;if(Blob){var blob=new Blob([binaryIdentifier.buffer,lengthAry.buffer,encoded]);doneCallback(null,blob);}});}map(packets,encodeOne,function(err,results){return callback(new Blob(results));});}; /*
 * Decodes data when a payload is maybe expected. Strings are decoded by
 * interpreting each byte as a key code for entries marked to start with 0. See
 * description of encodePayloadAsBinary
 *
 * @param {ArrayBuffer} data, callback method
 * @api public
 */exports.decodePayloadAsBinary = function(data,binaryType,callback){if(typeof binaryType === 'function'){callback = binaryType;binaryType = null;}var bufferTail=data;var buffers=[];var numberTooLong=false;while(bufferTail.byteLength > 0) {var tailArray=new Uint8Array(bufferTail);var isString=tailArray[0] === 0;var msgLength='';for(var i=1;;i++) {if(tailArray[i] == 255)break;if(msgLength.length > 310){numberTooLong = true;break;}msgLength += tailArray[i];}if(numberTooLong)return callback(err,0,1);bufferTail = sliceBuffer(bufferTail,2 + msgLength.length);msgLength = parseInt(msgLength);var msg=sliceBuffer(bufferTail,0,msgLength);if(isString){try{msg = String.fromCharCode.apply(null,new Uint8Array(msg));}catch(e) { // iPhone Safari doesn't let you apply to typed arrays
var typed=new Uint8Array(msg);msg = '';for(var i=0;i < typed.length;i++) {msg += String.fromCharCode(typed[i]);}}}buffers.push(msg);bufferTail = sliceBuffer(bufferTail,msgLength);}var total=buffers.length;buffers.forEach(function(buffer,i){callback(exports.decodePacket(buffer,binaryType,true),i,total);});};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./keys":20,"after":11,"arraybuffer.slice":12,"base64-arraybuffer":13,"blob":14,"has-binary":21,"utf8":29}],20:[function(_dereq_,module,exports){ /**
 * Gets the keys for an object.
 *
 * @return {Array} keys
 * @api private
 */module.exports = Object.keys || function keys(obj){var arr=[];var has=Object.prototype.hasOwnProperty;for(var i in obj) {if(has.call(obj,i)){arr.push(i);}}return arr;};},{}],21:[function(_dereq_,module,exports){(function(global){ /*
 * Module requirements.
 */var isArray=_dereq_('isarray'); /**
 * Module exports.
 */module.exports = hasBinary; /**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */function hasBinary(data){function _hasBinary(obj){if(!obj)return false;if(global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File){return true;}if(isArray(obj)){for(var i=0;i < obj.length;i++) {if(_hasBinary(obj[i])){return true;}}}else if(obj && 'object' == typeof obj){if(obj.toJSON){obj = obj.toJSON();}for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key) && _hasBinary(obj[key])){return true;}}}return false;}return _hasBinary(data);}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"isarray":24}],22:[function(_dereq_,module,exports){ /**
 * Module exports.
 *
 * Logic borrowed from Modernizr:
 *
 *   - https://github.com/Modernizr/Modernizr/blob/master/feature-detects/cors.js
 */try{module.exports = typeof XMLHttpRequest !== 'undefined' && 'withCredentials' in new XMLHttpRequest();}catch(err) { // if XMLHttp support is disabled in IE then it will throw
// when trying to create
module.exports = false;}},{}],23:[function(_dereq_,module,exports){var indexOf=[].indexOf;module.exports = function(arr,obj){if(indexOf)return arr.indexOf(obj);for(var i=0;i < arr.length;++i) {if(arr[i] === obj)return i;}return -1;};},{}],24:[function(_dereq_,module,exports){module.exports = Array.isArray || function(arr){return Object.prototype.toString.call(arr) == '[object Array]';};},{}],25:[function(_dereq_,module,exports){ /**
 * Helpers.
 */var s=1000;var m=s * 60;var h=m * 60;var d=h * 24;var y=d * 365.25; /**
 * Parse or format the given `val`.
 *
 * Options:
 *
 *  - `long` verbose formatting [false]
 *
 * @param {String|Number} val
 * @param {Object} options
 * @return {String|Number}
 * @api public
 */module.exports = function(val,options){options = options || {};if('string' == typeof val)return parse(val);return options.long?long(val):short(val);}; /**
 * Parse the given `str` and return milliseconds.
 *
 * @param {String} str
 * @return {Number}
 * @api private
 */function parse(str){str = '' + str;if(str.length > 10000)return;var match=/^((?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|years?|yrs?|y)?$/i.exec(str);if(!match)return;var n=parseFloat(match[1]);var type=(match[2] || 'ms').toLowerCase();switch(type){case 'years':case 'year':case 'yrs':case 'yr':case 'y':return n * y;case 'days':case 'day':case 'd':return n * d;case 'hours':case 'hour':case 'hrs':case 'hr':case 'h':return n * h;case 'minutes':case 'minute':case 'mins':case 'min':case 'm':return n * m;case 'seconds':case 'second':case 'secs':case 'sec':case 's':return n * s;case 'milliseconds':case 'millisecond':case 'msecs':case 'msec':case 'ms':return n;}} /**
 * Short format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */function short(ms){if(ms >= d)return Math.round(ms / d) + 'd';if(ms >= h)return Math.round(ms / h) + 'h';if(ms >= m)return Math.round(ms / m) + 'm';if(ms >= s)return Math.round(ms / s) + 's';return ms + 'ms';} /**
 * Long format for `ms`.
 *
 * @param {Number} ms
 * @return {String}
 * @api private
 */function long(ms){return plural(ms,d,'day') || plural(ms,h,'hour') || plural(ms,m,'minute') || plural(ms,s,'second') || ms + ' ms';} /**
 * Pluralization helper.
 */function plural(ms,n,name){if(ms < n)return;if(ms < n * 1.5)return Math.floor(ms / n) + ' ' + name;return Math.ceil(ms / n) + ' ' + name + 's';}},{}],26:[function(_dereq_,module,exports){(function(global){ /**
 * JSON parse.
 *
 * @see Based on jQuery#parseJSON (MIT) and JSON2
 * @api private
 */var rvalidchars=/^[\],:{}\s]*$/;var rvalidescape=/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;var rvalidtokens=/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;var rvalidbraces=/(?:^|:|,)(?:\s*\[)+/g;var rtrimLeft=/^\s+/;var rtrimRight=/\s+$/;module.exports = function parsejson(data){if('string' != typeof data || !data){return null;}data = data.replace(rtrimLeft,'').replace(rtrimRight,''); // Attempt to parse using the native JSON parser first
if(global.JSON && JSON.parse){return JSON.parse(data);}if(rvalidchars.test(data.replace(rvalidescape,'@').replace(rvalidtokens,']').replace(rvalidbraces,''))){return new Function('return ' + data)();}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],27:[function(_dereq_,module,exports){ /**
 * Compiles a querystring
 * Returns string representation of the object
 *
 * @param {Object}
 * @api private
 */exports.encode = function(obj){var str='';for(var i in obj) {if(obj.hasOwnProperty(i)){if(str.length)str += '&';str += encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]);}}return str;}; /**
 * Parses a simple querystring into an object
 *
 * @param {String} qs
 * @api private
 */exports.decode = function(qs){var qry={};var pairs=qs.split('&');for(var i=0,l=pairs.length;i < l;i++) {var pair=pairs[i].split('=');qry[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);}return qry;};},{}],28:[function(_dereq_,module,exports){ /**
 * Parses an URI
 *
 * @author Steven Levithan <stevenlevithan.com> (MIT license)
 * @api private
 */var re=/^(?:(?![^:@]+:[^:@\/]*@)(http|https|ws|wss):\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?((?:[a-f0-9]{0,4}:){2,7}[a-f0-9]{0,4}|[^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/;var parts=['source','protocol','authority','userInfo','user','password','host','port','relative','path','directory','file','query','anchor'];module.exports = function parseuri(str){var src=str,b=str.indexOf('['),e=str.indexOf(']');if(b != -1 && e != -1){str = str.substring(0,b) + str.substring(b,e).replace(/:/g,';') + str.substring(e,str.length);}var m=re.exec(str || ''),uri={},i=14;while(i--) {uri[parts[i]] = m[i] || '';}if(b != -1 && e != -1){uri.source = src;uri.host = uri.host.substring(1,uri.host.length - 1).replace(/;/g,':');uri.authority = uri.authority.replace('[','').replace(']','').replace(/;/g,':');uri.ipv6uri = true;}return uri;};},{}],29:[function(_dereq_,module,exports){(function(global){ /*! https://mths.be/utf8js v2.0.0 by @mathias */;(function(root){ // Detect free variables `exports`
var freeExports=typeof exports == 'object' && exports; // Detect free variable `module`
var freeModule=typeof module == 'object' && module && module.exports == freeExports && module; // Detect free variable `global`, from Node.js or Browserified code,
// and use it as `root`
var freeGlobal=typeof global == 'object' && global;if(freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal){root = freeGlobal;} /*--------------------------------------------------------------------------*/var stringFromCharCode=String.fromCharCode; // Taken from https://mths.be/punycode
function ucs2decode(string){var output=[];var counter=0;var length=string.length;var value;var extra;while(counter < length) {value = string.charCodeAt(counter++);if(value >= 0xD800 && value <= 0xDBFF && counter < length){ // high surrogate, and there is a next character
extra = string.charCodeAt(counter++);if((extra & 0xFC00) == 0xDC00){ // low surrogate
output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);}else { // unmatched surrogate; only append this code unit, in case the next
// code unit is the high surrogate of a surrogate pair
output.push(value);counter--;}}else {output.push(value);}}return output;} // Taken from https://mths.be/punycode
function ucs2encode(array){var length=array.length;var index=-1;var value;var output='';while(++index < length) {value = array[index];if(value > 0xFFFF){value -= 0x10000;output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);value = 0xDC00 | value & 0x3FF;}output += stringFromCharCode(value);}return output;}function checkScalarValue(codePoint){if(codePoint >= 0xD800 && codePoint <= 0xDFFF){throw Error('Lone surrogate U+' + codePoint.toString(16).toUpperCase() + ' is not a scalar value');}} /*--------------------------------------------------------------------------*/function createByte(codePoint,shift){return stringFromCharCode(codePoint >> shift & 0x3F | 0x80);}function encodeCodePoint(codePoint){if((codePoint & 0xFFFFFF80) == 0){ // 1-byte sequence
return stringFromCharCode(codePoint);}var symbol='';if((codePoint & 0xFFFFF800) == 0){ // 2-byte sequence
symbol = stringFromCharCode(codePoint >> 6 & 0x1F | 0xC0);}else if((codePoint & 0xFFFF0000) == 0){ // 3-byte sequence
checkScalarValue(codePoint);symbol = stringFromCharCode(codePoint >> 12 & 0x0F | 0xE0);symbol += createByte(codePoint,6);}else if((codePoint & 0xFFE00000) == 0){ // 4-byte sequence
symbol = stringFromCharCode(codePoint >> 18 & 0x07 | 0xF0);symbol += createByte(codePoint,12);symbol += createByte(codePoint,6);}symbol += stringFromCharCode(codePoint & 0x3F | 0x80);return symbol;}function utf8encode(string){var codePoints=ucs2decode(string);var length=codePoints.length;var index=-1;var codePoint;var byteString='';while(++index < length) {codePoint = codePoints[index];byteString += encodeCodePoint(codePoint);}return byteString;} /*--------------------------------------------------------------------------*/function readContinuationByte(){if(byteIndex >= byteCount){throw Error('Invalid byte index');}var continuationByte=byteArray[byteIndex] & 0xFF;byteIndex++;if((continuationByte & 0xC0) == 0x80){return continuationByte & 0x3F;} // If we end up here, it’s not a continuation byte
throw Error('Invalid continuation byte');}function decodeSymbol(){var byte1;var byte2;var byte3;var byte4;var codePoint;if(byteIndex > byteCount){throw Error('Invalid byte index');}if(byteIndex == byteCount){return false;} // Read first byte
byte1 = byteArray[byteIndex] & 0xFF;byteIndex++; // 1-byte sequence (no continuation bytes)
if((byte1 & 0x80) == 0){return byte1;} // 2-byte sequence
if((byte1 & 0xE0) == 0xC0){var byte2=readContinuationByte();codePoint = (byte1 & 0x1F) << 6 | byte2;if(codePoint >= 0x80){return codePoint;}else {throw Error('Invalid continuation byte');}} // 3-byte sequence (may include unpaired surrogates)
if((byte1 & 0xF0) == 0xE0){byte2 = readContinuationByte();byte3 = readContinuationByte();codePoint = (byte1 & 0x0F) << 12 | byte2 << 6 | byte3;if(codePoint >= 0x0800){checkScalarValue(codePoint);return codePoint;}else {throw Error('Invalid continuation byte');}} // 4-byte sequence
if((byte1 & 0xF8) == 0xF0){byte2 = readContinuationByte();byte3 = readContinuationByte();byte4 = readContinuationByte();codePoint = (byte1 & 0x0F) << 0x12 | byte2 << 0x0C | byte3 << 0x06 | byte4;if(codePoint >= 0x010000 && codePoint <= 0x10FFFF){return codePoint;}}throw Error('Invalid UTF-8 detected');}var byteArray;var byteCount;var byteIndex;function utf8decode(byteString){byteArray = ucs2decode(byteString);byteCount = byteArray.length;byteIndex = 0;var codePoints=[];var tmp;while((tmp = decodeSymbol()) !== false) {codePoints.push(tmp);}return ucs2encode(codePoints);} /*--------------------------------------------------------------------------*/var utf8={'version':'2.0.0','encode':utf8encode,'decode':utf8decode}; // Some AMD build optimizers, like r.js, check for specific condition patterns
// like the following:
if(typeof define == 'function' && typeof define.amd == 'object' && define.amd){define(function(){return utf8;});}else if(freeExports && !freeExports.nodeType){if(freeModule){ // in Node.js or RingoJS v0.8.0+
freeModule.exports = utf8;}else { // in Narwhal or RingoJS v0.7.0-
var object={};var hasOwnProperty=object.hasOwnProperty;for(var key in utf8) {hasOwnProperty.call(utf8,key) && (freeExports[key] = utf8[key]);}}}else { // in Rhino or a web browser
root.utf8 = utf8;}})(this);}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],30:[function(_dereq_,module,exports){'use strict';var alphabet='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_'.split(''),length=64,map={},seed=0,i=0,prev; /**
 * Return a string representing the specified number.
 *
 * @param {Number} num The number to convert.
 * @returns {String} The string representation of the number.
 * @api public
 */function encode(num){var encoded='';do {encoded = alphabet[num % length] + encoded;num = Math.floor(num / length);}while(num > 0);return encoded;} /**
 * Return the integer value specified by the given string.
 *
 * @param {String} str The string to convert.
 * @returns {Number} The integer value represented by the string.
 * @api public
 */function decode(str){var decoded=0;for(i = 0;i < str.length;i++) {decoded = decoded * length + map[str.charAt(i)];}return decoded;} /**
 * Yeast: A tiny growing id generator.
 *
 * @returns {String} A unique id.
 * @api public
 */function yeast(){var now=encode(+new Date());if(now !== prev)return seed = 0,prev = now;return now + '.' + encode(seed++);} //
// Map each character to its index.
//
for(;i < length;i++) map[alphabet[i]] = i; //
// Expose the `yeast`, `encode` and `decode` functions.
//
yeast.encode = encode;yeast.decode = decode;module.exports = yeast;},{}],31:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var url=_dereq_('./url');var parser=_dereq_('socket.io-parser');var Manager=_dereq_('./manager');var debug=_dereq_('debug')('socket.io-client'); /**
 * Module exports.
 */module.exports = exports = lookup; /**
 * Managers cache.
 */var cache=exports.managers = {}; /**
 * Looks up an existing `Manager` for multiplexing.
 * If the user summons:
 *
 *   `io('http://localhost/a');`
 *   `io('http://localhost/b');`
 *
 * We reuse the existing instance based on same scheme/port/host,
 * and we initialize sockets for each namespace.
 *
 * @api public
 */function lookup(uri,opts){if(typeof uri == 'object'){opts = uri;uri = undefined;}opts = opts || {};var parsed=url(uri);var source=parsed.source;var id=parsed.id;var path=parsed.path;var sameNamespace=cache[id] && path in cache[id].nsps;var newConnection=opts.forceNew || opts['force new connection'] || false === opts.multiplex || sameNamespace;var io;if(newConnection){debug('ignoring socket cache for %s',source);io = Manager(source,opts);}else {if(!cache[id]){debug('new io instance for %s',source);cache[id] = Manager(source,opts);}io = cache[id];}return io.socket(parsed.path);} /**
 * Protocol version.
 *
 * @api public
 */exports.protocol = parser.protocol; /**
 * `connect`.
 *
 * @param {String} uri
 * @api public
 */exports.connect = lookup; /**
 * Expose constructors for standalone build.
 *
 * @api public
 */exports.Manager = _dereq_('./manager');exports.Socket = _dereq_('./socket');},{"./manager":32,"./socket":34,"./url":35,"debug":39,"socket.io-parser":47}],32:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var eio=_dereq_('engine.io-client');var Socket=_dereq_('./socket');var Emitter=_dereq_('component-emitter');var parser=_dereq_('socket.io-parser');var on=_dereq_('./on');var bind=_dereq_('component-bind');var debug=_dereq_('debug')('socket.io-client:manager');var indexOf=_dereq_('indexof');var Backoff=_dereq_('backo2'); /**
 * IE6+ hasOwnProperty
 */var has=Object.prototype.hasOwnProperty; /**
 * Module exports
 */module.exports = Manager; /**
 * `Manager` constructor.
 *
 * @param {String} engine instance or engine uri/opts
 * @param {Object} options
 * @api public
 */function Manager(uri,opts){if(!(this instanceof Manager))return new Manager(uri,opts);if(uri && 'object' == typeof uri){opts = uri;uri = undefined;}opts = opts || {};opts.path = opts.path || '/socket.io';this.nsps = {};this.subs = [];this.opts = opts;this.reconnection(opts.reconnection !== false);this.reconnectionAttempts(opts.reconnectionAttempts || Infinity);this.reconnectionDelay(opts.reconnectionDelay || 1000);this.reconnectionDelayMax(opts.reconnectionDelayMax || 5000);this.randomizationFactor(opts.randomizationFactor || 0.5);this.backoff = new Backoff({min:this.reconnectionDelay(),max:this.reconnectionDelayMax(),jitter:this.randomizationFactor()});this.timeout(null == opts.timeout?20000:opts.timeout);this.readyState = 'closed';this.uri = uri;this.connecting = [];this.lastPing = null;this.encoding = false;this.packetBuffer = [];this.encoder = new parser.Encoder();this.decoder = new parser.Decoder();this.autoConnect = opts.autoConnect !== false;if(this.autoConnect)this.open();} /**
 * Propagate given event to sockets and emit on `this`
 *
 * @api private
 */Manager.prototype.emitAll = function(){this.emit.apply(this,arguments);for(var nsp in this.nsps) {if(has.call(this.nsps,nsp)){this.nsps[nsp].emit.apply(this.nsps[nsp],arguments);}}}; /**
 * Update `socket.id` of all sockets
 *
 * @api private
 */Manager.prototype.updateSocketIds = function(){for(var nsp in this.nsps) {if(has.call(this.nsps,nsp)){this.nsps[nsp].id = this.engine.id;}}}; /**
 * Mix in `Emitter`.
 */Emitter(Manager.prototype); /**
 * Sets the `reconnection` config.
 *
 * @param {Boolean} true/false if it should automatically reconnect
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnection = function(v){if(!arguments.length)return this._reconnection;this._reconnection = !!v;return this;}; /**
 * Sets the reconnection attempts config.
 *
 * @param {Number} max reconnection attempts before giving up
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionAttempts = function(v){if(!arguments.length)return this._reconnectionAttempts;this._reconnectionAttempts = v;return this;}; /**
 * Sets the delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionDelay = function(v){if(!arguments.length)return this._reconnectionDelay;this._reconnectionDelay = v;this.backoff && this.backoff.setMin(v);return this;};Manager.prototype.randomizationFactor = function(v){if(!arguments.length)return this._randomizationFactor;this._randomizationFactor = v;this.backoff && this.backoff.setJitter(v);return this;}; /**
 * Sets the maximum delay between reconnections.
 *
 * @param {Number} delay
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.reconnectionDelayMax = function(v){if(!arguments.length)return this._reconnectionDelayMax;this._reconnectionDelayMax = v;this.backoff && this.backoff.setMax(v);return this;}; /**
 * Sets the connection timeout. `false` to disable
 *
 * @return {Manager} self or value
 * @api public
 */Manager.prototype.timeout = function(v){if(!arguments.length)return this._timeout;this._timeout = v;return this;}; /**
 * Starts trying to reconnect if reconnection is enabled and we have not
 * started reconnecting yet
 *
 * @api private
 */Manager.prototype.maybeReconnectOnOpen = function(){ // Only try to reconnect if it's the first time we're connecting
if(!this.reconnecting && this._reconnection && this.backoff.attempts === 0){ // keeps reconnection from firing twice for the same reconnection loop
this.reconnect();}}; /**
 * Sets the current transport `socket`.
 *
 * @param {Function} optional, callback
 * @return {Manager} self
 * @api public
 */Manager.prototype.open = Manager.prototype.connect = function(fn){debug('readyState %s',this.readyState);if(~this.readyState.indexOf('open'))return this;debug('opening %s',this.uri);this.engine = eio(this.uri,this.opts);var socket=this.engine;var self=this;this.readyState = 'opening';this.skipReconnect = false; // emit `open`
var openSub=on(socket,'open',function(){self.onopen();fn && fn();}); // emit `connect_error`
var errorSub=on(socket,'error',function(data){debug('connect_error');self.cleanup();self.readyState = 'closed';self.emitAll('connect_error',data);if(fn){var err=new Error('Connection error');err.data = data;fn(err);}else { // Only do this if there is no fn to handle the error
self.maybeReconnectOnOpen();}}); // emit `connect_timeout`
if(false !== this._timeout){var timeout=this._timeout;debug('connect attempt will timeout after %d',timeout); // set timer
var timer=setTimeout(function(){debug('connect attempt timed out after %d',timeout);openSub.destroy();socket.close();socket.emit('error','timeout');self.emitAll('connect_timeout',timeout);},timeout);this.subs.push({destroy:function destroy(){clearTimeout(timer);}});}this.subs.push(openSub);this.subs.push(errorSub);return this;}; /**
 * Called upon transport open.
 *
 * @api private
 */Manager.prototype.onopen = function(){debug('open'); // clear old subs
this.cleanup(); // mark as open
this.readyState = 'open';this.emit('open'); // add new subs
var socket=this.engine;this.subs.push(on(socket,'data',bind(this,'ondata')));this.subs.push(on(socket,'ping',bind(this,'onping')));this.subs.push(on(socket,'pong',bind(this,'onpong')));this.subs.push(on(socket,'error',bind(this,'onerror')));this.subs.push(on(socket,'close',bind(this,'onclose')));this.subs.push(on(this.decoder,'decoded',bind(this,'ondecoded')));}; /**
 * Called upon a ping.
 *
 * @api private
 */Manager.prototype.onping = function(){this.lastPing = new Date();this.emitAll('ping');}; /**
 * Called upon a packet.
 *
 * @api private
 */Manager.prototype.onpong = function(){this.emitAll('pong',new Date() - this.lastPing);}; /**
 * Called with data.
 *
 * @api private
 */Manager.prototype.ondata = function(data){this.decoder.add(data);}; /**
 * Called when parser fully decodes a packet.
 *
 * @api private
 */Manager.prototype.ondecoded = function(packet){this.emit('packet',packet);}; /**
 * Called upon socket error.
 *
 * @api private
 */Manager.prototype.onerror = function(err){debug('error',err);this.emitAll('error',err);}; /**
 * Creates a new socket for the given `nsp`.
 *
 * @return {Socket}
 * @api public
 */Manager.prototype.socket = function(nsp){var socket=this.nsps[nsp];if(!socket){socket = new Socket(this,nsp);this.nsps[nsp] = socket;var self=this;socket.on('connecting',onConnecting);socket.on('connect',function(){socket.id = self.engine.id;});if(this.autoConnect){ // manually call here since connecting evnet is fired before listening
onConnecting();}}function onConnecting(){if(! ~indexOf(self.connecting,socket)){self.connecting.push(socket);}}return socket;}; /**
 * Called upon a socket close.
 *
 * @param {Socket} socket
 */Manager.prototype.destroy = function(socket){var index=indexOf(this.connecting,socket);if(~index)this.connecting.splice(index,1);if(this.connecting.length)return;this.close();}; /**
 * Writes a packet.
 *
 * @param {Object} packet
 * @api private
 */Manager.prototype.packet = function(packet){debug('writing packet %j',packet);var self=this;if(!self.encoding){ // encode, then write to engine with result
self.encoding = true;this.encoder.encode(packet,function(encodedPackets){for(var i=0;i < encodedPackets.length;i++) {self.engine.write(encodedPackets[i],packet.options);}self.encoding = false;self.processPacketQueue();});}else { // add packet to the queue
self.packetBuffer.push(packet);}}; /**
 * If packet buffer is non-empty, begins encoding the
 * next packet in line.
 *
 * @api private
 */Manager.prototype.processPacketQueue = function(){if(this.packetBuffer.length > 0 && !this.encoding){var pack=this.packetBuffer.shift();this.packet(pack);}}; /**
 * Clean up transport subscriptions and packet buffer.
 *
 * @api private
 */Manager.prototype.cleanup = function(){debug('cleanup');var sub;while(sub = this.subs.shift()) sub.destroy();this.packetBuffer = [];this.encoding = false;this.lastPing = null;this.decoder.destroy();}; /**
 * Close the current socket.
 *
 * @api private
 */Manager.prototype.close = Manager.prototype.disconnect = function(){debug('disconnect');this.skipReconnect = true;this.reconnecting = false;if('opening' == this.readyState){ // `onclose` will not fire because
// an open event never happened
this.cleanup();}this.backoff.reset();this.readyState = 'closed';if(this.engine)this.engine.close();}; /**
 * Called upon engine close.
 *
 * @api private
 */Manager.prototype.onclose = function(reason){debug('onclose');this.cleanup();this.backoff.reset();this.readyState = 'closed';this.emit('close',reason);if(this._reconnection && !this.skipReconnect){this.reconnect();}}; /**
 * Attempt a reconnection.
 *
 * @api private
 */Manager.prototype.reconnect = function(){if(this.reconnecting || this.skipReconnect)return this;var self=this;if(this.backoff.attempts >= this._reconnectionAttempts){debug('reconnect failed');this.backoff.reset();this.emitAll('reconnect_failed');this.reconnecting = false;}else {var delay=this.backoff.duration();debug('will wait %dms before reconnect attempt',delay);this.reconnecting = true;var timer=setTimeout(function(){if(self.skipReconnect)return;debug('attempting reconnect');self.emitAll('reconnect_attempt',self.backoff.attempts);self.emitAll('reconnecting',self.backoff.attempts); // check again for the case socket closed in above events
if(self.skipReconnect)return;self.open(function(err){if(err){debug('reconnect attempt error');self.reconnecting = false;self.reconnect();self.emitAll('reconnect_error',err.data);}else {debug('reconnect success');self.onreconnect();}});},delay);this.subs.push({destroy:function destroy(){clearTimeout(timer);}});}}; /**
 * Called upon successful reconnect.
 *
 * @api private
 */Manager.prototype.onreconnect = function(){var attempt=this.backoff.attempts;this.reconnecting = false;this.backoff.reset();this.updateSocketIds();this.emitAll('reconnect',attempt);};},{"./on":33,"./socket":34,"backo2":36,"component-bind":37,"component-emitter":38,"debug":39,"engine.io-client":1,"indexof":42,"socket.io-parser":47}],33:[function(_dereq_,module,exports){ /**
 * Module exports.
 */module.exports = on; /**
 * Helper for subscriptions.
 *
 * @param {Object|EventEmitter} obj with `Emitter` mixin or `EventEmitter`
 * @param {String} event name
 * @param {Function} callback
 * @api public
 */function on(obj,ev,fn){obj.on(ev,fn);return {destroy:function destroy(){obj.removeListener(ev,fn);}};}},{}],34:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var parser=_dereq_('socket.io-parser');var Emitter=_dereq_('component-emitter');var toArray=_dereq_('to-array');var on=_dereq_('./on');var bind=_dereq_('component-bind');var debug=_dereq_('debug')('socket.io-client:socket');var hasBin=_dereq_('has-binary'); /**
 * Module exports.
 */module.exports = exports = Socket; /**
 * Internal events (blacklisted).
 * These events can't be emitted by the user.
 *
 * @api private
 */var events={connect:1,connect_error:1,connect_timeout:1,connecting:1,disconnect:1,error:1,reconnect:1,reconnect_attempt:1,reconnect_failed:1,reconnect_error:1,reconnecting:1,ping:1,pong:1}; /**
 * Shortcut to `Emitter#emit`.
 */var emit=Emitter.prototype.emit; /**
 * `Socket` constructor.
 *
 * @api public
 */function Socket(io,nsp){this.io = io;this.nsp = nsp;this.json = this; // compat
this.ids = 0;this.acks = {};this.receiveBuffer = [];this.sendBuffer = [];this.connected = false;this.disconnected = true;if(this.io.autoConnect)this.open();} /**
 * Mix in `Emitter`.
 */Emitter(Socket.prototype); /**
 * Subscribe to open, close and packet events
 *
 * @api private
 */Socket.prototype.subEvents = function(){if(this.subs)return;var io=this.io;this.subs = [on(io,'open',bind(this,'onopen')),on(io,'packet',bind(this,'onpacket')),on(io,'close',bind(this,'onclose'))];}; /**
 * "Opens" the socket.
 *
 * @api public
 */Socket.prototype.open = Socket.prototype.connect = function(){if(this.connected)return this;this.subEvents();this.io.open(); // ensure open
if('open' == this.io.readyState)this.onopen();this.emit('connecting');return this;}; /**
 * Sends a `message` event.
 *
 * @return {Socket} self
 * @api public
 */Socket.prototype.send = function(){var args=toArray(arguments);args.unshift('message');this.emit.apply(this,args);return this;}; /**
 * Override `emit`.
 * If the event is in `events`, it's emitted normally.
 *
 * @param {String} event name
 * @return {Socket} self
 * @api public
 */Socket.prototype.emit = function(ev){if(events.hasOwnProperty(ev)){emit.apply(this,arguments);return this;}var args=toArray(arguments);var parserType=parser.EVENT; // default
if(hasBin(args)){parserType = parser.BINARY_EVENT;} // binary
var packet={type:parserType,data:args};packet.options = {};packet.options.compress = !this.flags || false !== this.flags.compress; // event ack callback
if('function' == typeof args[args.length - 1]){debug('emitting packet with ack id %d',this.ids);this.acks[this.ids] = args.pop();packet.id = this.ids++;}if(this.connected){this.packet(packet);}else {this.sendBuffer.push(packet);}delete this.flags;return this;}; /**
 * Sends a packet.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.packet = function(packet){packet.nsp = this.nsp;this.io.packet(packet);}; /**
 * Called upon engine `open`.
 *
 * @api private
 */Socket.prototype.onopen = function(){debug('transport is open - connecting'); // write connect packet if necessary
if('/' != this.nsp){this.packet({type:parser.CONNECT});}}; /**
 * Called upon engine `close`.
 *
 * @param {String} reason
 * @api private
 */Socket.prototype.onclose = function(reason){debug('close (%s)',reason);this.connected = false;this.disconnected = true;delete this.id;this.emit('disconnect',reason);}; /**
 * Called with socket packet.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onpacket = function(packet){if(packet.nsp != this.nsp)return;switch(packet.type){case parser.CONNECT:this.onconnect();break;case parser.EVENT:this.onevent(packet);break;case parser.BINARY_EVENT:this.onevent(packet);break;case parser.ACK:this.onack(packet);break;case parser.BINARY_ACK:this.onack(packet);break;case parser.DISCONNECT:this.ondisconnect();break;case parser.ERROR:this.emit('error',packet.data);break;}}; /**
 * Called upon a server event.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onevent = function(packet){var args=packet.data || [];debug('emitting event %j',args);if(null != packet.id){debug('attaching ack callback to event');args.push(this.ack(packet.id));}if(this.connected){emit.apply(this,args);}else {this.receiveBuffer.push(args);}}; /**
 * Produces an ack callback to emit with an event.
 *
 * @api private
 */Socket.prototype.ack = function(id){var self=this;var sent=false;return function(){ // prevent double callbacks
if(sent)return;sent = true;var args=toArray(arguments);debug('sending ack %j',args);var type=hasBin(args)?parser.BINARY_ACK:parser.ACK;self.packet({type:type,id:id,data:args});};}; /**
 * Called upon a server acknowlegement.
 *
 * @param {Object} packet
 * @api private
 */Socket.prototype.onack = function(packet){var ack=this.acks[packet.id];if('function' == typeof ack){debug('calling ack %s with %j',packet.id,packet.data);ack.apply(this,packet.data);delete this.acks[packet.id];}else {debug('bad ack %s',packet.id);}}; /**
 * Called upon server connect.
 *
 * @api private
 */Socket.prototype.onconnect = function(){this.connected = true;this.disconnected = false;this.emit('connect');this.emitBuffered();}; /**
 * Emit buffered events (received and emitted).
 *
 * @api private
 */Socket.prototype.emitBuffered = function(){var i;for(i = 0;i < this.receiveBuffer.length;i++) {emit.apply(this,this.receiveBuffer[i]);}this.receiveBuffer = [];for(i = 0;i < this.sendBuffer.length;i++) {this.packet(this.sendBuffer[i]);}this.sendBuffer = [];}; /**
 * Called upon server disconnect.
 *
 * @api private
 */Socket.prototype.ondisconnect = function(){debug('server disconnect (%s)',this.nsp);this.destroy();this.onclose('io server disconnect');}; /**
 * Called upon forced client/server side disconnections,
 * this method ensures the manager stops tracking us and
 * that reconnections don't get triggered for this.
 *
 * @api private.
 */Socket.prototype.destroy = function(){if(this.subs){ // clean subscriptions to avoid reconnections
for(var i=0;i < this.subs.length;i++) {this.subs[i].destroy();}this.subs = null;}this.io.destroy(this);}; /**
 * Disconnects the socket manually.
 *
 * @return {Socket} self
 * @api public
 */Socket.prototype.close = Socket.prototype.disconnect = function(){if(this.connected){debug('performing disconnect (%s)',this.nsp);this.packet({type:parser.DISCONNECT});} // remove socket from pool
this.destroy();if(this.connected){ // fire events
this.onclose('io client disconnect');}return this;}; /**
 * Sets the compress flag.
 *
 * @param {Boolean} if `true`, compresses the sending data
 * @return {Socket} self
 * @api public
 */Socket.prototype.compress = function(compress){this.flags = this.flags || {};this.flags.compress = compress;return this;};},{"./on":33,"component-bind":37,"component-emitter":38,"debug":39,"has-binary":41,"socket.io-parser":47,"to-array":51}],35:[function(_dereq_,module,exports){(function(global){ /**
 * Module dependencies.
 */var parseuri=_dereq_('parseuri');var debug=_dereq_('debug')('socket.io-client:url'); /**
 * Module exports.
 */module.exports = url; /**
 * URL parser.
 *
 * @param {String} url
 * @param {Object} An object meant to mimic window.location.
 *                 Defaults to window.location.
 * @api public
 */function url(uri,loc){var obj=uri; // default to window.location
var loc=loc || global.location;if(null == uri)uri = loc.protocol + '//' + loc.host; // relative path support
if('string' == typeof uri){if('/' == uri.charAt(0)){if('/' == uri.charAt(1)){uri = loc.protocol + uri;}else {uri = loc.host + uri;}}if(!/^(https?|wss?):\/\//.test(uri)){debug('protocol-less url %s',uri);if('undefined' != typeof loc){uri = loc.protocol + '//' + uri;}else {uri = 'https://' + uri;}} // parse
debug('parse %s',uri);obj = parseuri(uri);} // make sure we treat `localhost:80` and `localhost` equally
if(!obj.port){if(/^(http|ws)$/.test(obj.protocol)){obj.port = '80';}else if(/^(http|ws)s$/.test(obj.protocol)){obj.port = '443';}}obj.path = obj.path || '/';var ipv6=obj.host.indexOf(':') !== -1;var host=ipv6?'[' + obj.host + ']':obj.host; // define unique id
obj.id = obj.protocol + '://' + host + ':' + obj.port; // define href
obj.href = obj.protocol + '://' + host + (loc && loc.port == obj.port?'':':' + obj.port);return obj;}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"debug":39,"parseuri":45}],36:[function(_dereq_,module,exports){ /**
 * Expose `Backoff`.
 */module.exports = Backoff; /**
 * Initialize backoff timer with `opts`.
 *
 * - `min` initial timeout in milliseconds [100]
 * - `max` max timeout [10000]
 * - `jitter` [0]
 * - `factor` [2]
 *
 * @param {Object} opts
 * @api public
 */function Backoff(opts){opts = opts || {};this.ms = opts.min || 100;this.max = opts.max || 10000;this.factor = opts.factor || 2;this.jitter = opts.jitter > 0 && opts.jitter <= 1?opts.jitter:0;this.attempts = 0;} /**
 * Return the backoff duration.
 *
 * @return {Number}
 * @api public
 */Backoff.prototype.duration = function(){var ms=this.ms * Math.pow(this.factor,this.attempts++);if(this.jitter){var rand=Math.random();var deviation=Math.floor(rand * this.jitter * ms);ms = (Math.floor(rand * 10) & 1) == 0?ms - deviation:ms + deviation;}return Math.min(ms,this.max) | 0;}; /**
 * Reset the number of attempts.
 *
 * @api public
 */Backoff.prototype.reset = function(){this.attempts = 0;}; /**
 * Set the minimum duration
 *
 * @api public
 */Backoff.prototype.setMin = function(min){this.ms = min;}; /**
 * Set the maximum duration
 *
 * @api public
 */Backoff.prototype.setMax = function(max){this.max = max;}; /**
 * Set the jitter
 *
 * @api public
 */Backoff.prototype.setJitter = function(jitter){this.jitter = jitter;};},{}],37:[function(_dereq_,module,exports){ /**
 * Slice reference.
 */var slice=[].slice; /**
 * Bind `obj` to `fn`.
 *
 * @param {Object} obj
 * @param {Function|String} fn or string
 * @return {Function}
 * @api public
 */module.exports = function(obj,fn){if('string' == typeof fn)fn = obj[fn];if('function' != typeof fn)throw new Error('bind() requires a function');var args=slice.call(arguments,2);return function(){return fn.apply(obj,args.concat(slice.call(arguments)));};};},{}],38:[function(_dereq_,module,exports){ /**
 * Expose `Emitter`.
 */module.exports = Emitter; /**
 * Initialize a new `Emitter`.
 *
 * @api public
 */function Emitter(obj){if(obj)return mixin(obj);}; /**
 * Mixin the emitter properties.
 *
 * @param {Object} obj
 * @return {Object}
 * @api private
 */function mixin(obj){for(var key in Emitter.prototype) {obj[key] = Emitter.prototype[key];}return obj;} /**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.on = Emitter.prototype.addEventListener = function(event,fn){this._callbacks = this._callbacks || {};(this._callbacks['$' + event] = this._callbacks['$' + event] || []).push(fn);return this;}; /**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.once = function(event,fn){function on(){this.off(event,on);fn.apply(this,arguments);}on.fn = fn;this.on(event,on);return this;}; /**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @return {Emitter}
 * @api public
 */Emitter.prototype.off = Emitter.prototype.removeListener = Emitter.prototype.removeAllListeners = Emitter.prototype.removeEventListener = function(event,fn){this._callbacks = this._callbacks || {}; // all
if(0 == arguments.length){this._callbacks = {};return this;} // specific event
var callbacks=this._callbacks['$' + event];if(!callbacks)return this; // remove all handlers
if(1 == arguments.length){delete this._callbacks['$' + event];return this;} // remove specific handler
var cb;for(var i=0;i < callbacks.length;i++) {cb = callbacks[i];if(cb === fn || cb.fn === fn){callbacks.splice(i,1);break;}}return this;}; /**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 * @return {Emitter}
 */Emitter.prototype.emit = function(event){this._callbacks = this._callbacks || {};var args=[].slice.call(arguments,1),callbacks=this._callbacks['$' + event];if(callbacks){callbacks = callbacks.slice(0);for(var i=0,len=callbacks.length;i < len;++i) {callbacks[i].apply(this,args);}}return this;}; /**
 * Return array of callbacks for `event`.
 *
 * @param {String} event
 * @return {Array}
 * @api public
 */Emitter.prototype.listeners = function(event){this._callbacks = this._callbacks || {};return this._callbacks['$' + event] || [];}; /**
 * Check if this emitter has `event` handlers.
 *
 * @param {String} event
 * @return {Boolean}
 * @api public
 */Emitter.prototype.hasListeners = function(event){return !!this.listeners(event).length;};},{}],39:[function(_dereq_,module,exports){arguments[4][17][0].apply(exports,arguments);},{"./debug":40,"dup":17}],40:[function(_dereq_,module,exports){arguments[4][18][0].apply(exports,arguments);},{"dup":18,"ms":44}],41:[function(_dereq_,module,exports){(function(global){ /*
 * Module requirements.
 */var isArray=_dereq_('isarray'); /**
 * Module exports.
 */module.exports = hasBinary; /**
 * Checks for binary data.
 *
 * Right now only Buffer and ArrayBuffer are supported..
 *
 * @param {Object} anything
 * @api public
 */function hasBinary(data){function _hasBinary(obj){if(!obj)return false;if(global.Buffer && global.Buffer.isBuffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer || global.Blob && obj instanceof Blob || global.File && obj instanceof File){return true;}if(isArray(obj)){for(var i=0;i < obj.length;i++) {if(_hasBinary(obj[i])){return true;}}}else if(obj && 'object' == typeof obj){ // see: https://github.com/Automattic/has-binary/pull/4
if(obj.toJSON && 'function' == typeof obj.toJSON){obj = obj.toJSON();}for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key) && _hasBinary(obj[key])){return true;}}}return false;}return _hasBinary(data);}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"isarray":43}],42:[function(_dereq_,module,exports){arguments[4][23][0].apply(exports,arguments);},{"dup":23}],43:[function(_dereq_,module,exports){arguments[4][24][0].apply(exports,arguments);},{"dup":24}],44:[function(_dereq_,module,exports){arguments[4][25][0].apply(exports,arguments);},{"dup":25}],45:[function(_dereq_,module,exports){arguments[4][28][0].apply(exports,arguments);},{"dup":28}],46:[function(_dereq_,module,exports){(function(global){ /*global Blob,File*/ /**
 * Module requirements
 */var isArray=_dereq_('isarray');var isBuf=_dereq_('./is-buffer'); /**
 * Replaces every Buffer | ArrayBuffer in packet with a numbered placeholder.
 * Anything with blobs or files should be fed through removeBlobs before coming
 * here.
 *
 * @param {Object} packet - socket.io event packet
 * @return {Object} with deconstructed packet and list of buffers
 * @api public
 */exports.deconstructPacket = function(packet){var buffers=[];var packetData=packet.data;function _deconstructPacket(data){if(!data)return data;if(isBuf(data)){var placeholder={_placeholder:true,num:buffers.length};buffers.push(data);return placeholder;}else if(isArray(data)){var newData=new Array(data.length);for(var i=0;i < data.length;i++) {newData[i] = _deconstructPacket(data[i]);}return newData;}else if('object' == typeof data && !(data instanceof Date)){var newData={};for(var key in data) {newData[key] = _deconstructPacket(data[key]);}return newData;}return data;}var pack=packet;pack.data = _deconstructPacket(packetData);pack.attachments = buffers.length; // number of binary 'attachments'
return {packet:pack,buffers:buffers};}; /**
 * Reconstructs a binary packet from its placeholder packet and buffers
 *
 * @param {Object} packet - event packet with placeholders
 * @param {Array} buffers - binary buffers to put in placeholder positions
 * @return {Object} reconstructed packet
 * @api public
 */exports.reconstructPacket = function(packet,buffers){var curPlaceHolder=0;function _reconstructPacket(data){if(data && data._placeholder){var buf=buffers[data.num]; // appropriate buffer (should be natural order anyway)
return buf;}else if(isArray(data)){for(var i=0;i < data.length;i++) {data[i] = _reconstructPacket(data[i]);}return data;}else if(data && 'object' == typeof data){for(var key in data) {data[key] = _reconstructPacket(data[key]);}return data;}return data;}packet.data = _reconstructPacket(packet.data);packet.attachments = undefined; // no longer useful
return packet;}; /**
 * Asynchronously removes Blobs or Files from data via
 * FileReader's readAsArrayBuffer method. Used before encoding
 * data as msgpack. Calls callback with the blobless data.
 *
 * @param {Object} data
 * @param {Function} callback
 * @api private
 */exports.removeBlobs = function(data,callback){function _removeBlobs(obj,curKey,containingObject){if(!obj)return obj; // convert any blob
if(global.Blob && obj instanceof Blob || global.File && obj instanceof File){pendingBlobs++; // async filereader
var fileReader=new FileReader();fileReader.onload = function(){ // this.result == arraybuffer
if(containingObject){containingObject[curKey] = this.result;}else {bloblessData = this.result;} // if nothing pending its callback time
if(! --pendingBlobs){callback(bloblessData);}};fileReader.readAsArrayBuffer(obj); // blob -> arraybuffer
}else if(isArray(obj)){ // handle array
for(var i=0;i < obj.length;i++) {_removeBlobs(obj[i],i,obj);}}else if(obj && 'object' == typeof obj && !isBuf(obj)){ // and object
for(var key in obj) {_removeBlobs(obj[key],key,obj);}}}var pendingBlobs=0;var bloblessData=data;_removeBlobs(bloblessData);if(!pendingBlobs){callback(bloblessData);}};}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{"./is-buffer":48,"isarray":43}],47:[function(_dereq_,module,exports){ /**
 * Module dependencies.
 */var debug=_dereq_('debug')('socket.io-parser');var json=_dereq_('json3');var isArray=_dereq_('isarray');var Emitter=_dereq_('component-emitter');var binary=_dereq_('./binary');var isBuf=_dereq_('./is-buffer'); /**
 * Protocol version.
 *
 * @api public
 */exports.protocol = 4; /**
 * Packet types.
 *
 * @api public
 */exports.types = ['CONNECT','DISCONNECT','EVENT','BINARY_EVENT','ACK','BINARY_ACK','ERROR']; /**
 * Packet type `connect`.
 *
 * @api public
 */exports.CONNECT = 0; /**
 * Packet type `disconnect`.
 *
 * @api public
 */exports.DISCONNECT = 1; /**
 * Packet type `event`.
 *
 * @api public
 */exports.EVENT = 2; /**
 * Packet type `ack`.
 *
 * @api public
 */exports.ACK = 3; /**
 * Packet type `error`.
 *
 * @api public
 */exports.ERROR = 4; /**
 * Packet type 'binary event'
 *
 * @api public
 */exports.BINARY_EVENT = 5; /**
 * Packet type `binary ack`. For acks with binary arguments.
 *
 * @api public
 */exports.BINARY_ACK = 6; /**
 * Encoder constructor.
 *
 * @api public
 */exports.Encoder = Encoder; /**
 * Decoder constructor.
 *
 * @api public
 */exports.Decoder = Decoder; /**
 * A socket.io Encoder instance
 *
 * @api public
 */function Encoder(){} /**
 * Encode a packet as a single string if non-binary, or as a
 * buffer sequence, depending on packet type.
 *
 * @param {Object} obj - packet object
 * @param {Function} callback - function to handle encodings (likely engine.write)
 * @return Calls callback with Array of encodings
 * @api public
 */Encoder.prototype.encode = function(obj,callback){debug('encoding packet %j',obj);if(exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type){encodeAsBinary(obj,callback);}else {var encoding=encodeAsString(obj);callback([encoding]);}}; /**
 * Encode packet as string.
 *
 * @param {Object} packet
 * @return {String} encoded
 * @api private
 */function encodeAsString(obj){var str='';var nsp=false; // first is type
str += obj.type; // attachments if we have them
if(exports.BINARY_EVENT == obj.type || exports.BINARY_ACK == obj.type){str += obj.attachments;str += '-';} // if we have a namespace other than `/`
// we append it followed by a comma `,`
if(obj.nsp && '/' != obj.nsp){nsp = true;str += obj.nsp;} // immediately followed by the id
if(null != obj.id){if(nsp){str += ',';nsp = false;}str += obj.id;} // json data
if(null != obj.data){if(nsp)str += ',';str += json.stringify(obj.data);}debug('encoded %j as %s',obj,str);return str;} /**
 * Encode packet as 'buffer sequence' by removing blobs, and
 * deconstructing packet into object with placeholders and
 * a list of buffers.
 *
 * @param {Object} packet
 * @return {Buffer} encoded
 * @api private
 */function encodeAsBinary(obj,callback){function writeEncoding(bloblessData){var deconstruction=binary.deconstructPacket(bloblessData);var pack=encodeAsString(deconstruction.packet);var buffers=deconstruction.buffers;buffers.unshift(pack); // add packet info to beginning of data list
callback(buffers); // write all the buffers
}binary.removeBlobs(obj,writeEncoding);} /**
 * A socket.io Decoder instance
 *
 * @return {Object} decoder
 * @api public
 */function Decoder(){this.reconstructor = null;} /**
 * Mix in `Emitter` with Decoder.
 */Emitter(Decoder.prototype); /**
 * Decodes an ecoded packet string into packet JSON.
 *
 * @param {String} obj - encoded packet
 * @return {Object} packet
 * @api public
 */Decoder.prototype.add = function(obj){var packet;if('string' == typeof obj){packet = decodeString(obj);if(exports.BINARY_EVENT == packet.type || exports.BINARY_ACK == packet.type){ // binary packet's json
this.reconstructor = new BinaryReconstructor(packet); // no attachments, labeled binary but no binary data to follow
if(this.reconstructor.reconPack.attachments === 0){this.emit('decoded',packet);}}else { // non-binary full packet
this.emit('decoded',packet);}}else if(isBuf(obj) || obj.base64){ // raw binary data
if(!this.reconstructor){throw new Error('got binary data when not reconstructing a packet');}else {packet = this.reconstructor.takeBinaryData(obj);if(packet){ // received final buffer
this.reconstructor = null;this.emit('decoded',packet);}}}else {throw new Error('Unknown type: ' + obj);}}; /**
 * Decode a packet String (JSON data)
 *
 * @param {String} str
 * @return {Object} packet
 * @api private
 */function decodeString(str){var p={};var i=0; // look up type
p.type = Number(str.charAt(0));if(null == exports.types[p.type])return error(); // look up attachments if type binary
if(exports.BINARY_EVENT == p.type || exports.BINARY_ACK == p.type){var buf='';while(str.charAt(++i) != '-') {buf += str.charAt(i);if(i == str.length)break;}if(buf != Number(buf) || str.charAt(i) != '-'){throw new Error('Illegal attachments');}p.attachments = Number(buf);} // look up namespace (if any)
if('/' == str.charAt(i + 1)){p.nsp = '';while(++i) {var c=str.charAt(i);if(',' == c)break;p.nsp += c;if(i == str.length)break;}}else {p.nsp = '/';} // look up id
var next=str.charAt(i + 1);if('' !== next && Number(next) == next){p.id = '';while(++i) {var c=str.charAt(i);if(null == c || Number(c) != c){--i;break;}p.id += str.charAt(i);if(i == str.length)break;}p.id = Number(p.id);} // look up json data
if(str.charAt(++i)){try{p.data = json.parse(str.substr(i));}catch(e) {return error();}}debug('decoded %s as %j',str,p);return p;} /**
 * Deallocates a parser's resources
 *
 * @api public
 */Decoder.prototype.destroy = function(){if(this.reconstructor){this.reconstructor.finishedReconstruction();}}; /**
 * A manager of a binary event's 'buffer sequence'. Should
 * be constructed whenever a packet of type BINARY_EVENT is
 * decoded.
 *
 * @param {Object} packet
 * @return {BinaryReconstructor} initialized reconstructor
 * @api private
 */function BinaryReconstructor(packet){this.reconPack = packet;this.buffers = [];} /**
 * Method to be called when binary data received from connection
 * after a BINARY_EVENT packet.
 *
 * @param {Buffer | ArrayBuffer} binData - the raw binary data received
 * @return {null | Object} returns null if more binary data is expected or
 *   a reconstructed packet object if all buffers have been received.
 * @api private
 */BinaryReconstructor.prototype.takeBinaryData = function(binData){this.buffers.push(binData);if(this.buffers.length == this.reconPack.attachments){ // done with buffer list
var packet=binary.reconstructPacket(this.reconPack,this.buffers);this.finishedReconstruction();return packet;}return null;}; /**
 * Cleans up binary packet reconstruction variables.
 *
 * @api private
 */BinaryReconstructor.prototype.finishedReconstruction = function(){this.reconPack = null;this.buffers = [];};function error(data){return {type:exports.ERROR,data:'parser error'};}},{"./binary":46,"./is-buffer":48,"component-emitter":49,"debug":39,"isarray":43,"json3":50}],48:[function(_dereq_,module,exports){(function(global){module.exports = isBuf; /**
 * Returns true if obj is a buffer or an arraybuffer.
 *
 * @api private
 */function isBuf(obj){return global.Buffer && global.Buffer.isBuffer(obj) || global.ArrayBuffer && obj instanceof ArrayBuffer;}}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],49:[function(_dereq_,module,exports){arguments[4][15][0].apply(exports,arguments);},{"dup":15}],50:[function(_dereq_,module,exports){(function(global){ /*! JSON v3.3.2 | http://bestiejs.github.io/json3 | Copyright 2012-2014, Kit Cambridge | http://kit.mit-license.org */;(function(){ // Detect the `define` function exposed by asynchronous module loaders. The
// strict `define` check is necessary for compatibility with `r.js`.
var isLoader=typeof define === "function" && define.amd; // A set of types used to distinguish objects from primitives.
var objectTypes={"function":true,"object":true}; // Detect the `exports` object exposed by CommonJS implementations.
var freeExports=objectTypes[typeof exports] && exports && !exports.nodeType && exports; // Use the `global` object exposed by Node (including Browserify via
// `insert-module-globals`), Narwhal, and Ringo as the default context,
// and the `window` object in browsers. Rhino exports a `global` function
// instead.
var root=objectTypes[typeof window] && window || this,freeGlobal=freeExports && objectTypes[typeof module] && module && !module.nodeType && typeof global == "object" && global;if(freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)){root = freeGlobal;} // Public: Initializes JSON 3 using the given `context` object, attaching the
// `stringify` and `parse` functions to the specified `exports` object.
function runInContext(context,exports){context || (context = root["Object"]());exports || (exports = root["Object"]()); // Native constructor aliases.
var Number=context["Number"] || root["Number"],String=context["String"] || root["String"],Object=context["Object"] || root["Object"],Date=context["Date"] || root["Date"],SyntaxError=context["SyntaxError"] || root["SyntaxError"],TypeError=context["TypeError"] || root["TypeError"],Math=context["Math"] || root["Math"],nativeJSON=context["JSON"] || root["JSON"]; // Delegate to the native `stringify` and `parse` implementations.
if(typeof nativeJSON == "object" && nativeJSON){exports.stringify = nativeJSON.stringify;exports.parse = nativeJSON.parse;} // Convenience aliases.
var objectProto=Object.prototype,getClass=objectProto.toString,isProperty,forEach,undef; // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
var isExtended=new Date(-3509827334573292);try{ // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
// results for certain dates in Opera >= 10.53.
isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&  // Safari < 2.0.2 stores the internal millisecond time value correctly,
// but clips the values returned by the date methods to the range of
// signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;}catch(exception) {} // Internal: Determines whether the native `JSON.stringify` and `parse`
// implementations are spec-compliant. Based on work by Ken Snyder.
function has(name){if(has[name] !== undef){ // Return cached feature test result.
return has[name];}var isSupported;if(name == "bug-string-char-index"){ // IE <= 7 doesn't support accessing string characters using square
// bracket notation. IE 8 only supports this for primitives.
isSupported = "a"[0] != "a";}else if(name == "json"){ // Indicates whether both `JSON.stringify` and `JSON.parse` are
// supported.
isSupported = has("json-stringify") && has("json-parse");}else {var value,serialized="{\"a\":[1,true,false,null,\"\\u0000\\b\\n\\f\\r\\t\"]}"; // Test `JSON.stringify`.
if(name == "json-stringify"){var stringify=exports.stringify,stringifySupported=typeof stringify == "function" && isExtended;if(stringifySupported){ // A test function object with a custom `toJSON` method.
(value = function(){return 1;}).toJSON = value;try{stringifySupported =  // Firefox 3.1b1 and b2 serialize string, number, and boolean
// primitives as object literals.
stringify(0) === "0" &&  // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
// literals.
stringify(new Number()) === "0" && stringify(new String()) == '""' &&  // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
// does not define a canonical JSON representation (this applies to
// objects with `toJSON` properties as well, *unless* they are nested
// within an object or array).
stringify(getClass) === undef &&  // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
// FF 3.1b3 pass this test.
stringify(undef) === undef &&  // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
// respectively, if the value is omitted entirely.
stringify() === undef &&  // FF 3.1b1, 2 throw an error if the given value is not a number,
// string, array, object, Boolean, or `null` literal. This applies to
// objects with custom `toJSON` methods as well, unless they are nested
// inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
// methods entirely.
stringify(value) === "1" && stringify([value]) == "[1]" &&  // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
// `"[null]"`.
stringify([undef]) == "[null]" &&  // YUI 3.0.0b1 fails to serialize `null` literals.
stringify(null) == "null" &&  // FF 3.1b1, 2 halts serialization if an array contains a function:
// `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
// elides non-JSON values from objects and arrays, unless they
// define custom `toJSON` methods.
stringify([undef,getClass,null]) == "[null,null,null]" &&  // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
// where character escape codes are expected (e.g., `\b` => `\u0008`).
stringify({"a":[value,true,false,null,"\x00\b\n\f\r\t"]}) == serialized &&  // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
stringify(null,value) === "1" && stringify([1,2],null,1) == "[\n 1,\n 2\n]" &&  // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
// serialize extended years.
stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&  // The milliseconds are optional in ES 5, but required in 5.1.
stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&  // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
// four-digit years instead of six-digit years. Credits: @Yaffle.
stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&  // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
// values less than 1000. Credits: @Yaffle.
stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';}catch(exception) {stringifySupported = false;}}isSupported = stringifySupported;} // Test `JSON.parse`.
if(name == "json-parse"){var parse=exports.parse;if(typeof parse == "function"){try{ // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
// Conforming implementations should also coerce the initial argument to
// a string prior to parsing.
if(parse("0") === 0 && !parse(false)){ // Simple parsing test.
value = parse(serialized);var parseSupported=value["a"].length == 5 && value["a"][0] === 1;if(parseSupported){try{ // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
parseSupported = !parse('"\t"');}catch(exception) {}if(parseSupported){try{ // FF 4.0 and 4.0.1 allow leading `+` signs and leading
// decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
// certain octal literals.
parseSupported = parse("01") !== 1;}catch(exception) {}}if(parseSupported){try{ // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
// points. These environments, along with FF 3.1b1 and 2,
// also allow trailing commas in JSON objects and arrays.
parseSupported = parse("1.") !== 1;}catch(exception) {}}}}}catch(exception) {parseSupported = false;}}isSupported = parseSupported;}}return has[name] = !!isSupported;}if(!has("json")){ // Common `[[Class]]` name aliases.
var functionClass="[object Function]",dateClass="[object Date]",numberClass="[object Number]",stringClass="[object String]",arrayClass="[object Array]",booleanClass="[object Boolean]"; // Detect incomplete support for accessing string characters by index.
var charIndexBuggy=has("bug-string-char-index"); // Define additional utility methods if the `Date` methods are buggy.
if(!isExtended){var floor=Math.floor; // A mapping between the months of the year and the number of days between
// January 1st and the first of the respective month.
var Months=[0,31,59,90,120,151,181,212,243,273,304,334]; // Internal: Calculates the number of days between the Unix epoch and the
// first day of the given month.
var getDay=function getDay(year,month){return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);};} // Internal: Determines if a property is a direct property of the given
// object. Delegates to the native `Object#hasOwnProperty` method.
if(!(isProperty = objectProto.hasOwnProperty)){isProperty = function(property){var members={},constructor;if((members.__proto__ = null,members.__proto__ = { // The *proto* property cannot be set multiple times in recent
// versions of Firefox and SeaMonkey.
"toString":1},members).toString != getClass){ // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
// supports the mutable *proto* property.
isProperty = function(property){ // Capture and break the object's prototype chain (see section 8.6.2
// of the ES 5.1 spec). The parenthesized expression prevents an
// unsafe transformation by the Closure Compiler.
var original=this.__proto__,result=(property in (this.__proto__ = null,this)); // Restore the original prototype chain.
this.__proto__ = original;return result;};}else { // Capture a reference to the top-level `Object` constructor.
constructor = members.constructor; // Use the `constructor` property to simulate `Object#hasOwnProperty` in
// other environments.
isProperty = function(property){var parent=(this.constructor || constructor).prototype;return property in this && !(property in parent && this[property] === parent[property]);};}members = null;return isProperty.call(this,property);};} // Internal: Normalizes the `for...in` iteration algorithm across
// environments. Each enumerated key is yielded to a `callback` function.
forEach = function(object,callback){var size=0,Properties,members,property; // Tests for bugs in the current environment's `for...in` algorithm. The
// `valueOf` property inherits the non-enumerable flag from
// `Object.prototype` in older versions of IE, Netscape, and Mozilla.
(Properties = function(){this.valueOf = 0;}).prototype.valueOf = 0; // Iterate over a new instance of the `Properties` class.
members = new Properties();for(property in members) { // Ignore all properties inherited from `Object.prototype`.
if(isProperty.call(members,property)){size++;}}Properties = members = null; // Normalize the iteration algorithm.
if(!size){ // A list of non-enumerable properties inherited from `Object.prototype`.
members = ["valueOf","toString","toLocaleString","propertyIsEnumerable","isPrototypeOf","hasOwnProperty","constructor"]; // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
// properties.
forEach = function(object,callback){var isFunction=getClass.call(object) == functionClass,property,length;var hasProperty=!isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;for(property in object) { // Gecko <= 1.0 enumerates the `prototype` property of functions under
// certain conditions; IE does not.
if(!(isFunction && property == "prototype") && hasProperty.call(object,property)){callback(property);}} // Manually invoke the callback for each non-enumerable property.
for(length = members.length;property = members[--length];hasProperty.call(object,property) && callback(property));};}else if(size == 2){ // Safari <= 2.0.4 enumerates shadowed properties twice.
forEach = function(object,callback){ // Create a set of iterated properties.
var members={},isFunction=getClass.call(object) == functionClass,property;for(property in object) { // Store each property name to prevent double enumeration. The
// `prototype` property of functions is not enumerated due to cross-
// environment inconsistencies.
if(!(isFunction && property == "prototype") && !isProperty.call(members,property) && (members[property] = 1) && isProperty.call(object,property)){callback(property);}}};}else { // No bugs detected; use the standard `for...in` algorithm.
forEach = function(object,callback){var isFunction=getClass.call(object) == functionClass,property,isConstructor;for(property in object) {if(!(isFunction && property == "prototype") && isProperty.call(object,property) && !(isConstructor = property === "constructor")){callback(property);}} // Manually invoke the callback for the `constructor` property due to
// cross-environment inconsistencies.
if(isConstructor || isProperty.call(object,property = "constructor")){callback(property);}};}return forEach(object,callback);}; // Public: Serializes a JavaScript `value` as a JSON string. The optional
// `filter` argument may specify either a function that alters how object and
// array members are serialized, or an array of strings and numbers that
// indicates which properties should be serialized. The optional `width`
// argument may be either a string or number that specifies the indentation
// level of the output.
if(!has("json-stringify")){ // Internal: A map of control characters and their escaped equivalents.
var Escapes={92:"\\\\",34:'\\"',8:"\\b",12:"\\f",10:"\\n",13:"\\r",9:"\\t"}; // Internal: Converts `value` into a zero-padded string such that its
// length is at least equal to `width`. The `width` must be <= 6.
var leadingZeroes="000000";var toPaddedString=function toPaddedString(width,value){ // The `|| 0` expression is necessary to work around a bug in
// Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
return (leadingZeroes + (value || 0)).slice(-width);}; // Internal: Double-quotes a string `value`, replacing all ASCII control
// characters (characters with code unit values between 0 and 31) with
// their escaped equivalents. This is an implementation of the
// `Quote(value)` operation defined in ES 5.1 section 15.12.3.
var unicodePrefix="\\u00";var quote=function quote(value){var result='"',index=0,length=value.length,useCharIndex=!charIndexBuggy || length > 10;var symbols=useCharIndex && (charIndexBuggy?value.split(""):value);for(;index < length;index++) {var charCode=value.charCodeAt(index); // If the character is a control character, append its Unicode or
// shorthand escape sequence; otherwise, append the character as-is.
switch(charCode){case 8:case 9:case 10:case 12:case 13:case 34:case 92:result += Escapes[charCode];break;default:if(charCode < 32){result += unicodePrefix + toPaddedString(2,charCode.toString(16));break;}result += useCharIndex?symbols[index]:value.charAt(index);}}return result + '"';}; // Internal: Recursively serializes an object. Implements the
// `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
var serialize=function serialize(property,object,callback,properties,whitespace,indentation,stack){var value,className,year,month,date,time,hours,minutes,seconds,milliseconds,results,element,index,length,prefix,result;try{ // Necessary for host object support.
value = object[property];}catch(exception) {}if(typeof value == "object" && value){className = getClass.call(value);if(className == dateClass && !isProperty.call(value,"toJSON")){if(value > -1 / 0 && value < 1 / 0){ // Dates are serialized according to the `Date#toJSON` method
// specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
// for the ISO 8601 date time string format.
if(getDay){ // Manually compute the year, month, date, hours, minutes,
// seconds, and milliseconds if the `getUTC*` methods are
// buggy. Adapted from @Yaffle's `date-shim` project.
date = floor(value / 864e5);for(year = floor(date / 365.2425) + 1970 - 1;getDay(year + 1,0) <= date;year++);for(month = floor((date - getDay(year,0)) / 30.42);getDay(year,month + 1) <= date;month++);date = 1 + date - getDay(year,month); // The `time` value specifies the time within the day (see ES
// 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
// to compute `A modulo B`, as the `%` operator does not
// correspond to the `modulo` operation for negative numbers.
time = (value % 864e5 + 864e5) % 864e5; // The hours, minutes, seconds, and milliseconds are obtained by
// decomposing the time within the day. See section 15.9.1.10.
hours = floor(time / 36e5) % 24;minutes = floor(time / 6e4) % 60;seconds = floor(time / 1e3) % 60;milliseconds = time % 1e3;}else {year = value.getUTCFullYear();month = value.getUTCMonth();date = value.getUTCDate();hours = value.getUTCHours();minutes = value.getUTCMinutes();seconds = value.getUTCSeconds();milliseconds = value.getUTCMilliseconds();} // Serialize extended years correctly.
value = (year <= 0 || year >= 1e4?(year < 0?"-":"+") + toPaddedString(6,year < 0?-year:year):toPaddedString(4,year)) + "-" + toPaddedString(2,month + 1) + "-" + toPaddedString(2,date) +  // Months, dates, hours, minutes, and seconds should have two
// digits; milliseconds should have three.
"T" + toPaddedString(2,hours) + ":" + toPaddedString(2,minutes) + ":" + toPaddedString(2,seconds) +  // Milliseconds are optional in ES 5.0, but required in 5.1.
"." + toPaddedString(3,milliseconds) + "Z";}else {value = null;}}else if(typeof value.toJSON == "function" && (className != numberClass && className != stringClass && className != arrayClass || isProperty.call(value,"toJSON"))){ // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
// `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
// ignores all `toJSON` methods on these objects unless they are
// defined directly on an instance.
value = value.toJSON(property);}}if(callback){ // If a replacement function was provided, call it to obtain the value
// for serialization.
value = callback.call(object,property,value);}if(value === null){return "null";}className = getClass.call(value);if(className == booleanClass){ // Booleans are represented literally.
return "" + value;}else if(className == numberClass){ // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
// `"null"`.
return value > -1 / 0 && value < 1 / 0?"" + value:"null";}else if(className == stringClass){ // Strings are double-quoted and escaped.
return quote("" + value);} // Recursively serialize objects and arrays.
if(typeof value == "object"){ // Check for cyclic structures. This is a linear search; performance
// is inversely proportional to the number of unique nested objects.
for(length = stack.length;length--;) {if(stack[length] === value){ // Cyclic structures cannot be serialized by `JSON.stringify`.
throw TypeError();}} // Add the object to the stack of traversed objects.
stack.push(value);results = []; // Save the current indentation level and indent one additional level.
prefix = indentation;indentation += whitespace;if(className == arrayClass){ // Recursively serialize array elements.
for(index = 0,length = value.length;index < length;index++) {element = serialize(index,value,callback,properties,whitespace,indentation,stack);results.push(element === undef?"null":element);}result = results.length?whitespace?"[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]":"[" + results.join(",") + "]":"[]";}else { // Recursively serialize object members. Members are selected from
// either a user-specified list of property names, or the object
// itself.
forEach(properties || value,function(property){var element=serialize(property,value,callback,properties,whitespace,indentation,stack);if(element !== undef){ // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
// is not the empty string, let `member` {quote(property) + ":"}
// be the concatenation of `member` and the `space` character."
// The "`space` character" refers to the literal space
// character, not the `space` {width} argument provided to
// `JSON.stringify`.
results.push(quote(property) + ":" + (whitespace?" ":"") + element);}});result = results.length?whitespace?"{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}":"{" + results.join(",") + "}":"{}";} // Remove the object from the traversed object stack.
stack.pop();return result;}}; // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
exports.stringify = function(source,filter,width){var whitespace,callback,properties,className;if(objectTypes[typeof filter] && filter){if((className = getClass.call(filter)) == functionClass){callback = filter;}else if(className == arrayClass){ // Convert the property names array into a makeshift set.
properties = {};for(var index=0,length=filter.length,value;index < length;value = filter[index++],(className = getClass.call(value),className == stringClass || className == numberClass) && (properties[value] = 1));}}if(width){if((className = getClass.call(width)) == numberClass){ // Convert the `width` to an integer and create a string containing
// `width` number of space characters.
if((width -= width % 1) > 0){for(whitespace = "",width > 10 && (width = 10);whitespace.length < width;whitespace += " ");}}else if(className == stringClass){whitespace = width.length <= 10?width:width.slice(0,10);}} // Opera <= 7.54u2 discards the values associated with empty string keys
// (`""`) only if they are used directly within an object member list
// (e.g., `!("" in { "": 1})`).
return serialize("",(value = {},value[""] = source,value),callback,properties,whitespace,"",[]);};} // Public: Parses a JSON source string.
if(!has("json-parse")){var fromCharCode=String.fromCharCode; // Internal: A map of escaped control characters and their unescaped
// equivalents.
var Unescapes={92:"\\",34:'"',47:"/",98:"\b",116:"\t",110:"\n",102:"\f",114:"\r"}; // Internal: Stores the parser state.
var Index,Source; // Internal: Resets the parser state and throws a `SyntaxError`.
var abort=function abort(){Index = Source = null;throw SyntaxError();}; // Internal: Returns the next token, or `"$"` if the parser has reached
// the end of the source string. A token may be a string, number, `null`
// literal, or Boolean literal.
var lex=function lex(){var source=Source,length=source.length,value,begin,position,isSigned,charCode;while(Index < length) {charCode = source.charCodeAt(Index);switch(charCode){case 9:case 10:case 13:case 32: // Skip whitespace tokens, including tabs, carriage returns, line
// feeds, and space characters.
Index++;break;case 123:case 125:case 91:case 93:case 58:case 44: // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
// the current position.
value = charIndexBuggy?source.charAt(Index):source[Index];Index++;return value;case 34: // `"` delimits a JSON string; advance to the next character and
// begin parsing the string. String tokens are prefixed with the
// sentinel `@` character to distinguish them from punctuators and
// end-of-string tokens.
for(value = "@",Index++;Index < length;) {charCode = source.charCodeAt(Index);if(charCode < 32){ // Unescaped ASCII control characters (those with a code unit
// less than the space character) are not permitted.
abort();}else if(charCode == 92){ // A reverse solidus (`\`) marks the beginning of an escaped
// control character (including `"`, `\`, and `/`) or Unicode
// escape sequence.
charCode = source.charCodeAt(++Index);switch(charCode){case 92:case 34:case 47:case 98:case 116:case 110:case 102:case 114: // Revive escaped control characters.
value += Unescapes[charCode];Index++;break;case 117: // `\u` marks the beginning of a Unicode escape sequence.
// Advance to the first character and validate the
// four-digit code point.
begin = ++Index;for(position = Index + 4;Index < position;Index++) {charCode = source.charCodeAt(Index); // A valid sequence comprises four hexdigits (case-
// insensitive) that form a single hexadecimal value.
if(!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)){ // Invalid Unicode escape sequence.
abort();}} // Revive the escaped character.
value += fromCharCode("0x" + source.slice(begin,Index));break;default: // Invalid escape sequence.
abort();}}else {if(charCode == 34){ // An unescaped double-quote character marks the end of the
// string.
break;}charCode = source.charCodeAt(Index);begin = Index; // Optimize for the common case where a string is valid.
while(charCode >= 32 && charCode != 92 && charCode != 34) {charCode = source.charCodeAt(++Index);} // Append the string as-is.
value += source.slice(begin,Index);}}if(source.charCodeAt(Index) == 34){ // Advance to the next character and return the revived string.
Index++;return value;} // Unterminated string.
abort();default: // Parse numbers and literals.
begin = Index; // Advance past the negative sign, if one is specified.
if(charCode == 45){isSigned = true;charCode = source.charCodeAt(++Index);} // Parse an integer or floating-point value.
if(charCode >= 48 && charCode <= 57){ // Leading zeroes are interpreted as octal literals.
if(charCode == 48 && (charCode = source.charCodeAt(Index + 1),charCode >= 48 && charCode <= 57)){ // Illegal octal literal.
abort();}isSigned = false; // Parse the integer component.
for(;Index < length && (charCode = source.charCodeAt(Index),charCode >= 48 && charCode <= 57);Index++); // Floats cannot contain a leading decimal point; however, this
// case is already accounted for by the parser.
if(source.charCodeAt(Index) == 46){position = ++Index; // Parse the decimal component.
for(;position < length && (charCode = source.charCodeAt(position),charCode >= 48 && charCode <= 57);position++);if(position == Index){ // Illegal trailing decimal.
abort();}Index = position;} // Parse exponents. The `e` denoting the exponent is
// case-insensitive.
charCode = source.charCodeAt(Index);if(charCode == 101 || charCode == 69){charCode = source.charCodeAt(++Index); // Skip past the sign following the exponent, if one is
// specified.
if(charCode == 43 || charCode == 45){Index++;} // Parse the exponential component.
for(position = Index;position < length && (charCode = source.charCodeAt(position),charCode >= 48 && charCode <= 57);position++);if(position == Index){ // Illegal empty exponent.
abort();}Index = position;} // Coerce the parsed value to a JavaScript number.
return +source.slice(begin,Index);} // A negative sign may only precede numbers.
if(isSigned){abort();} // `true`, `false`, and `null` literals.
if(source.slice(Index,Index + 4) == "true"){Index += 4;return true;}else if(source.slice(Index,Index + 5) == "false"){Index += 5;return false;}else if(source.slice(Index,Index + 4) == "null"){Index += 4;return null;} // Unrecognized token.
abort();}} // Return the sentinel `$` character if the parser has reached the end
// of the source string.
return "$";}; // Internal: Parses a JSON `value` token.
var get=function get(value){var results,hasMembers;if(value == "$"){ // Unexpected end of input.
abort();}if(typeof value == "string"){if((charIndexBuggy?value.charAt(0):value[0]) == "@"){ // Remove the sentinel `@` character.
return value.slice(1);} // Parse object and array literals.
if(value == "["){ // Parses a JSON array, returning a new JavaScript array.
results = [];for(;;hasMembers || (hasMembers = true)) {value = lex(); // A closing square bracket marks the end of the array literal.
if(value == "]"){break;} // If the array literal contains elements, the current token
// should be a comma separating the previous element from the
// next.
if(hasMembers){if(value == ","){value = lex();if(value == "]"){ // Unexpected trailing `,` in array literal.
abort();}}else { // A `,` must separate each array element.
abort();}} // Elisions and leading commas are not permitted.
if(value == ","){abort();}results.push(get(value));}return results;}else if(value == "{"){ // Parses a JSON object, returning a new JavaScript object.
results = {};for(;;hasMembers || (hasMembers = true)) {value = lex(); // A closing curly brace marks the end of the object literal.
if(value == "}"){break;} // If the object literal contains members, the current token
// should be a comma separator.
if(hasMembers){if(value == ","){value = lex();if(value == "}"){ // Unexpected trailing `,` in object literal.
abort();}}else { // A `,` must separate each object member.
abort();}} // Leading commas are not permitted, object property names must be
// double-quoted strings, and a `:` must separate each property
// name and value.
if(value == "," || typeof value != "string" || (charIndexBuggy?value.charAt(0):value[0]) != "@" || lex() != ":"){abort();}results[value.slice(1)] = get(lex());}return results;} // Unexpected token encountered.
abort();}return value;}; // Internal: Updates a traversed object member.
var update=function update(source,property,callback){var element=walk(source,property,callback);if(element === undef){delete source[property];}else {source[property] = element;}}; // Internal: Recursively traverses a parsed JSON object, invoking the
// `callback` function for each value. This is an implementation of the
// `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
var walk=function walk(source,property,callback){var value=source[property],length;if(typeof value == "object" && value){ // `forEach` can't be used to traverse an array in Opera <= 8.54
// because its `Object#hasOwnProperty` implementation returns `false`
// for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
if(getClass.call(value) == arrayClass){for(length = value.length;length--;) {update(value,length,callback);}}else {forEach(value,function(property){update(value,property,callback);});}}return callback.call(source,property,value);}; // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
exports.parse = function(source,callback){var result,value;Index = 0;Source = "" + source;result = get(lex()); // If a JSON string contains multiple tokens, it is invalid.
if(lex() != "$"){abort();} // Reset the parser state.
Index = Source = null;return callback && getClass.call(callback) == functionClass?walk((value = {},value[""] = result,value),"",callback):result;};}}exports["runInContext"] = runInContext;return exports;}if(freeExports && !isLoader){ // Export for CommonJS environments.
runInContext(root,freeExports);}else { // Export for web browsers and JavaScript engines.
var nativeJSON=root.JSON,previousJSON=root["JSON3"],isRestored=false;var JSON3=runInContext(root,root["JSON3"] = { // Public: Restores the original value of the global `JSON` object and
// returns a reference to the `JSON3` object.
"noConflict":function noConflict(){if(!isRestored){isRestored = true;root.JSON = nativeJSON;root["JSON3"] = previousJSON;nativeJSON = previousJSON = null;}return JSON3;}});root.JSON = {"parse":JSON3.parse,"stringify":JSON3.stringify};} // Export for asynchronous module loaders.
if(isLoader){define(function(){return JSON3;});}}).call(this);}).call(this,typeof self !== "undefined"?self:typeof window !== "undefined"?window:typeof global !== "undefined"?global:{});},{}],51:[function(_dereq_,module,exports){module.exports = toArray;function toArray(list,index){var array=[];index = index || 0;for(var i=index || 0;i < list.length;i++) {array[i - index] = list[i];}return array;}},{}]},{},[31])(31);});}

cc._RFpop();
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}]},{},["myHero","myOtherHero","socket.io","myApp","myUtil","myGround"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL0FwcGxpY2F0aW9ucy9Db2Nvc0NyZWF0b3IuYXBwL0NvbnRlbnRzL1Jlc291cmNlcy9hcHAuYXNhci9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwiYXNzZXRzL3NjcmlwdC9teUFwcC5qcyIsImFzc2V0cy9zY3JpcHQvbXlHcm91bmQuanMiLCJhc3NldHMvc2NyaXB0L215SGVyby5qcyIsImFzc2V0cy9zY3JpcHQvbXlPdGhlckhlcm8uanMiLCJhc3NldHMvc2NyaXB0L215VXRpbC5qcyIsImFzc2V0cy9zY3JpcHQvc29ja2V0LmlvLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzk2NzY4a1NBVkJPbW82anZUOGZDS1U3JywgJ215QXBwJyk7XG4vLyBzY3JpcHQvbXlBcHAuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuICAgICAgICBTZXJ2ZXJTdGF0ZToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcbiAgICAgICAgYmFja2dyb3VuZDoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuICAgICAgICBvdGhlckhlcm86IHtcbiAgICAgICAgICAgICdkZWZhdWx0JzogbnVsbCxcbiAgICAgICAgICAgIHR5cGU6IGNjLlByZWZhYlxuICAgICAgICB9LFxuXG4gICAgICAgIHJhZGlvOiAyLFxuXG4gICAgICAgIG15SUQ6IDAsXG5cbiAgICAgICAgdXNlckxpc3Q6IFtdXG4gICAgfSxcblxuICAgIF9kcmF3VXNlcjogZnVuY3Rpb24gX2RyYXdVc2VyKHBvc1gsIHBvc1ksIHVzZXIpIHtcbiAgICAgICAgdmFyIG90aGVyaGVybyA9IGNjLmluc3RhbnRpYXRlKHRoaXMub3RoZXJIZXJvKTtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kLmFkZENoaWxkKG90aGVyaGVybywgdXNlci51c2VySUQsIHVzZXIudXNlcklEKTtcbiAgICAgICAgb3RoZXJoZXJvLnNldFBvc2l0aW9uKHBvc1gsIHBvc1kpO1xuICAgIH0sXG5cbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIGlmIChjYy5zeXMuaXNOYXRpdmUpIHtcbiAgICAgICAgICAgIHdpbmRvdy5pbyA9IFNvY2tldElPO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVxdWlyZSgnc29ja2V0LmlvJyk7XG4gICAgICAgIH1cblxuICAgICAgICBzb2NrZXQgPSBpbygnaHR0cDovL2xvY2FsaG9zdDozMDAwJyk7XG5cbiAgICAgICAgLy9iZWdpbi0tLS0tLS0tLS0tLS0tLeeZu+W9leWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICBzb2NrZXQub24oJ2Nvbm5lY3RlZCcsIGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICBzZWxmLm15SUQgPSBkYXRhLnVzZXJJRDsgLy/lrZjlhaXoh6rlt7HnmoRJRFxuICAgICAgICAgICAgc2VsZi5TZXJ2ZXJTdGF0ZS5zdHJpbmcgPSAneW91ciBJRDogJyArIGRhdGEudXNlcklEO1xuICAgICAgICAgICAgc2VsZi51c2VyTGlzdCA9IGRhdGEudXNlckxpc3Q7IC8v6I635Y+W5Y6f5pyJ55So5oi35YiX6KGoXG5cbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIF9pdGVyYXRvckVycm9yID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IHNlbGYudXNlckxpc3RbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDsgIShfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uID0gKF9zdGVwID0gX2l0ZXJhdG9yLm5leHQoKSkuZG9uZSk7IF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB1c2VyID0gX3N0ZXAudmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIC8v55S75Yiw6IOM5pmvXG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyID09IHVuZGVmaW5lZCkgY29udGludWU7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2RyYXdVc2VyKDY4OCwgLTUwNCwgdXNlcik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICAgICAgX2RpZEl0ZXJhdG9yRXJyb3IgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yID0gZXJyO1xuICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gJiYgX2l0ZXJhdG9yWydyZXR1cm4nXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yWydyZXR1cm4nXSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF9kaWRJdGVyYXRvckVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9lbmQtLS0tLS0tLS0tLS0tLS0tLeeZu+W9leWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICAvL2JlZ2luLS0tLS0tLS0tLS0tLS0tLS3mlrDlop7lpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgc29ja2V0Lm9uKCduZXdVc2VyJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuU2VydmVyU3RhdGUuc3RyaW5nID0gJ25ldyB1c2VyOiAnICsgZGF0YS51c2VySUQ7XG4gICAgICAgICAgICBzZWxmLnVzZXJMaXN0LnB1c2goZGF0YSk7IC8v5Yqg5Yiw5YiX6KGoXG4gICAgICAgICAgICBzZWxmLl9kcmF3VXNlcig2ODgsIC01MDQsIGRhdGEpOyAvL+eUu+WIsOiDjOaZr1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2VuZC0tLS0tLS0tLS0tLS0tLS0tLS3mlrDlop7lpITnkIYtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS8vXG5cbiAgICAgICAgLy9lbmQtLS0tLS0tLS0tLS0tLS0tLS0t56a75byA5aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIHNvY2tldC5vbigndXNlckxlYXZlJywgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIHNlbGYuU2VydmVyU3RhdGUuc3RyaW5nID0gJ3VzZXIgbGVhdmU6ICcgKyBkYXRhLnVzZXJJRDtcbiAgICAgICAgICAgIGRlbGV0ZSBzZWxmLnVzZXJMaXN0W2RhdGEudXNlcklEXTsgLy/ku47liJfooajliKDpmaRcbiAgICAgICAgICAgIHNlbGYuYmFja2dyb3VuZC5yZW1vdmVDaGlsZEJ5VGFnKGRhdGEudXNlcklEKTsgLy/ku47og4zmma/np7vpmaRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy9lbmQtLS0tLS0tLS0tLS0tLS0tLS0t56a75byA5aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIC8vYmVnaW4tLS0tLS0tLS0tLS0tLS0tLS0t56e75Yqo5Y+R5Ye65aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuXG4gICAgICAgIHZhciBteVV0aWwgPSByZXF1aXJlKCdteVV0aWwnKTtcbiAgICAgICAgdmFyIHV0aWwgPSBuZXcgbXlVdGlsKCk7XG5cbiAgICAgICAgdmFyIG15R3JvdW5kID0gdGhpcy5iYWNrZ3JvdW5kLmdldENvbXBvbmVudCgnbXlHcm91bmQnKTtcbiAgICAgICAgdmFyIGN1clRpbGVYID0gbXlHcm91bmQuY3VyVGlsZVg7XG4gICAgICAgIHZhciBjdXJUaWxlWSA9IG15R3JvdW5kLmN1clRpbGVZO1xuXG4gICAgICAgIHNlbGYubm9kZS5vbignbXlDbGljaycsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICAvL2NvbnNvbGUubG9nKGV2ZW50KTtcbiAgICAgICAgICAgIHNvY2tldC5lbWl0KCdtb3ZlJywge1xuICAgICAgICAgICAgICAgIHVzZXJJRDogc2VsZi5teUlELFxuICAgICAgICAgICAgICAgIGN1clRpbGVYOiBjdXJUaWxlWCxcbiAgICAgICAgICAgICAgICBjdXJUaWxlWTogY3VyVGlsZVksXG4gICAgICAgICAgICAgICAgbmV3UG9zOiB1dGlsLmNvbnZlcnRUbzQ1KGV2ZW50LmRldGFpbClcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvL2VuZC0tLS0tLS0tLS0tLS0tLS0tLS0tLeenu+WKqOWPkeWHuuWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICAvL2JlZ2luLS0tLS0tLS0tLS0tLS0tLS0tLeenu+WKqOaUtuWIsOWkhOeQhi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cblxuICAgICAgICBzb2NrZXQub24oJ21vdmUnLCBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHRhcmdldCA9IHNlbGYuYmFja2dyb3VuZC5nZXRDaGlsZEJ5VGFnKGRhdGEudXNlcklEKS5nZXRDb21wb25lbnQoJ215T3RoZXJIZXJvJyk7XG4gICAgICAgICAgICAvL3ZhciB0YXJnZXQgPSBzZWxmLmJhY2tncm91bmQuZ2V0Q2hpbGRCeVRhZyhkYXRhLnVzZXJJRCkuZ2V0Q29tcG9uZW50KCdteUhlcm8nKTtcbiAgICAgICAgICAgIHZhciBQYXRoID0gdXRpbC5jb252ZXJ0VG9QYXRoKGRhdGEubmV3UG9zLCBkYXRhLmN1clRpbGVYLCBkYXRhLmN1clRpbGVZKTtcbiAgICAgICAgICAgIHZhciBhc2MgPSBbXTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2codGFyZ2V0KTtcbiAgICAgICAgICAgIHRhcmdldC5wYXRoID0gUGF0aDtcblxuICAgICAgICAgICAgdmFyIF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24yID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvcjIgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBfaXRlcmF0b3JFcnJvcjIgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgX2l0ZXJhdG9yMiA9IFBhdGhbU3ltYm9sLml0ZXJhdG9yXSgpLCBfc3RlcDI7ICEoX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbjIgPSAoX3N0ZXAyID0gX2l0ZXJhdG9yMi5uZXh0KCkpLmRvbmUpOyBfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGRpciA9IF9zdGVwMi52YWx1ZTtcblxuICAgICAgICAgICAgICAgICAgICBhc2MucHVzaChjYy5jYWxsRnVuYyh0YXJnZXQudG9XYWxrLCB0YXJnZXQpKTtcbiAgICAgICAgICAgICAgICAgICAgLy9hc2MucHVzaChjYy5jYWxsRnVuYyh0YXJnZXQudG9XYWxrLHRhcmdldCkpO1xuICAgICAgICAgICAgICAgICAgICBhc2MucHVzaChjYy5tb3ZlQnkoc2VsZi5yYWRpbyAqIChkaXIuZHggIT0gMCAmJiBkaXIuZHkgIT0gMCA/IDEuNCA6IDEpIC8gMTAsIChkaXIuZHkgKyBkaXIuZHgpICogMzIsIChkaXIuZHggLSBkaXIuZHkpICogMjQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvcjIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIF9pdGVyYXRvckVycm9yMiA9IGVycjtcbiAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uMiAmJiBfaXRlcmF0b3IyWydyZXR1cm4nXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2l0ZXJhdG9yMlsncmV0dXJuJ10oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcjIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IF9pdGVyYXRvckVycm9yMjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXNjLnB1c2goY2MuY2FsbEZ1bmModGFyZ2V0LnRvU3RhbmQsIHRhcmdldCkpO1xuXG4gICAgICAgICAgICB0YXJnZXQubm9kZS5ydW5BY3Rpb24oY2Muc2VxdWVuY2UoYXNjKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vZW5kLS0tLS0tLS0tLS0tLS0tLS0tLS0t56e75Yqo5pS25Yiw5aSE55CGLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0vL1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJ2RkOGY1UnluYWxKUEl3eTB2d2EyOUVlJywgJ215R3JvdW5kJyk7XG4vLyBzY3JpcHQvbXlHcm91bmQuanNcblxuY2MuQ2xhc3Moe1xuICAgICdleHRlbmRzJzogY2MuQ29tcG9uZW50LFxuXG4gICAgcHJvcGVydGllczoge1xuXG4gICAgICAgIGN1clRpbGVYOiAxMixcbiAgICAgICAgY3VyVGlsZVk6IDQyLFxuXG4gICAgICAgIGZpbmFsTGlzdDogW10sXG5cbiAgICAgICAgcmFkaW86IDEsXG5cbiAgICAgICAgaGVybzoge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTm9kZVxuICAgICAgICB9LFxuXG4gICAgICAgIGN1clRpbGVYWToge1xuICAgICAgICAgICAgJ2RlZmF1bHQnOiBudWxsLFxuICAgICAgICAgICAgdHlwZTogY2MuTGFiZWxcbiAgICAgICAgfSxcblxuICAgICAgICBjdXJUaWxlRm9yZU5hbWU6ICflvZPliY3lnZDmoIc6ICdcblxuICAgIH0sXG5cbiAgICB0b01vdmU6IGZ1bmN0aW9uIHRvTW92ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZmluYWxMaXN0Lmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFuZEhlcm8oKTtcbiAgICAgICAgICAgIC8vdGhpcy5oZXJvLmdldENvbXBvbmVudCgnbXlIZXJvJykudG9TdGFuZCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHZhciBkaXIgPSB0aGlzLmZpbmFsTGlzdC5zaGlmdCgpO1xuXG4gICAgICAgIHRoaXMuY3VyVGlsZVBvc1ggPSBkaXIuZHg7XG4gICAgICAgIHRoaXMuY3VyVGlsZVBvc1kgPSBkaXIuZHk7XG4gICAgICAgIHRoaXMuY3VyVGlsZVhZLnN0cmluZyA9IHRoaXMuY3VyVGlsZUZvcmVOYW1lICsgdGhpcy5jdXJUaWxlUG9zWCArICcsJyArIHRoaXMuY3VyVGlsZVBvc1k7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5jdXJUaWxlUG9zWCArICcgJyArIHRoaXMuY3VyVGlsZVBvc1kpO1xuICAgICAgICAvL3RoaXMuX21vdmVIZXJvKGRpci5keCwgZGlyLmR5KTtcbiAgICAgICAgLy90aGlzLmhlcm8uZ2V0Q29tcG9uZW50KCdteUhlcm8nKS50b1dhbGsoZGlyLmR4ICsgJycgKyBkaXIuZHkpO1xuXG4gICAgICAgIC8vQmVnaW4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLV9tb3ZlQmFja2dyb3VuZC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICAgICAgdGhpcy5ub2RlLnJ1bkFjdGlvbihjYy5zZXF1ZW5jZShjYy5jYWxsRnVuYyh0aGlzLl9tb3ZlSGVybyhkaXIuZHgsIGRpci5keSksIHRoaXMpLCBjYy5tb3ZlQnkodGhpcy5yYWRpbyAqIChkaXIuZHggIT0gMCAmJiBkaXIuZHkgIT0gMCA/IDEuNCA6IDEpIC8gMTAsIC0oZGlyLmR4ICsgZGlyLmR5KSAqIDMyLCAoZGlyLmR5IC0gZGlyLmR4KSAqIDI0KSwgY2MuY2FsbEZ1bmModGhpcy50b01vdmUsIHRoaXMpKSk7XG5cbiAgICAgICAgLy90aGlzLl9tb3ZlQmFja2dyb3VuZChkaXIueCxkaXIueSk7XG4gICAgICAgIC8vRW5kLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1fbW92ZUJhY2tncm91bmQtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLy9cbiAgICB9LFxuXG4gICAgLy8gX21vdmVCYWNrZ3JvdW5kIDogZnVuY3Rpb24oZHgsZHkpe1xuICAgIC8vICAgICB0aGlzLm5vZGUucnVuQWN0aW9uKFxuICAgIC8vICAgICAgICAgY2Muc2VxdWVuY2UoXG5cbiAgICAvLyAgICAgICAgICAgICBjYy5jYWxsRnVuYyh0aGlzLl9tb3ZlSGVybyhkeCwgZHkpLHRoaXMpLFxuICAgIC8vICAgICAgICAgICAgIGNjLm1vdmVCeShcbiAgICAvLyAgICAgICAgICAgICAgICAgdGhpcy5yYWRpbyAqICgoZHggIT0gMCkgJiYgKGR5ICE9IDApID8gMS40IDogMSksXG4gICAgLy8gICAgICAgICAgICAgICAgIC0oZHgrZHkpKjMyLFxuICAgIC8vICAgICAgICAgICAgICAgICAgKGR5LWR4KSoyNFxuICAgIC8vICAgICAgICAgICAgICksXG4gICAgLy8gICAgICAgICAgICAgY2MuY2FsbEZ1bmModGhpcy50b01vdmUsdGhpcylcbiAgICAvLyAgICAgICAgIClcblxuICAgIC8vICAgICApO1xuICAgIC8vIH0sXG5cbiAgICBfbW92ZUhlcm86IGZ1bmN0aW9uIF9tb3ZlSGVybyhkeCwgZHkpIHtcbiAgICAgICAgdGhpcy5oZXJvLmdldENvbXBvbmVudCgnbXlIZXJvJykudG9XYWxrKGR4ICsgJycgKyBkeSk7XG4gICAgfSxcblxuICAgIF9zdGFuZEhlcm86IGZ1bmN0aW9uIF9zdGFuZEhlcm8oKSB7XG4gICAgICAgIHRoaXMuaGVyby5nZXRDb21wb25lbnQoJ215SGVybycpLnRvU3RhbmQoKTtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgIHZhciBteVV0aWwgPSBzZWxmLmdldENvbXBvbmVudCgnbXlVdGlsJyk7XG5cbiAgICAgICAgdGhpcy5ub2RlLm9uKCdtb3VzZXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG5cbiAgICAgICAgICAgIHZhciBteWV2ZW50ID0gbmV3IGNjLkV2ZW50LkV2ZW50Q3VzdG9tKCdteUNsaWNrJywgdHJ1ZSk7XG4gICAgICAgICAgICBteWV2ZW50LnNldFVzZXJEYXRhKGV2ZW50KTtcblxuICAgICAgICAgICAgdGhpcy5ub2RlLmRpc3BhdGNoRXZlbnQobXlldmVudCk7XG5cbiAgICAgICAgICAgIHNlbGYuZmluYWxMaXN0ID0gW107XG4gICAgICAgICAgICBzZWxmLmZpbmFsTGlzdCA9IG15VXRpbC5jb252ZXJ0VG9QYXRoKG15VXRpbC5jb252ZXJ0VG80NShldmVudCksIHNlbGYuY3VyVGlsZVgsIHNlbGYuY3VyVGlsZVkpO1xuICAgICAgICAgICAgLy90aGlzLnRvTW92ZU9uY2UoKTtcbiAgICAgICAgICAgIHRoaXMudG9Nb3ZlKCk7XG4gICAgICAgIH0sIHRoaXMpO1xuICAgIH1cblxufSk7XG4vLyBjYWxsZWQgZXZlcnkgZnJhbWUsIHVuY29tbWVudCB0aGlzIGZ1bmN0aW9uIHRvIGFjdGl2YXRlIHVwZGF0ZSBjYWxsYmFja1xuLy8gdXBkYXRlOiBmdW5jdGlvbiAoZHQpIHtcblxuLy8gfSxcblxuY2MuX1JGcG9wKCk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5jYy5fUkZwdXNoKG1vZHVsZSwgJzI1Y2EwNjQ2TXBCS0s4cjhVYTltTGRzJywgJ215SGVybycpO1xuLy8gc2NyaXB0L215SGVyby5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgU3RhbmRBbmltTmFtZTogJycsXG4gICAgICAgIFdhbGtBbmltTmFtZTogJycsXG4gICAgICAgIGN1ckRpcjogJydcblxuICAgIH0sXG5cbiAgICB0b1N0YW5kOiBmdW5jdGlvbiB0b1N0YW5kKCkge1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5TdGFuZEFuaW1OYW1lICsgdGhpcy5jdXJEaXIpO1xuICAgIH0sXG5cbiAgICB0b1dhbGs6IGZ1bmN0aW9uIHRvV2FsayhkaXIpIHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhkaXIpO1xuICAgICAgICBpZiAoZGlyID09IHRoaXMuY3VyRGlyKSByZXR1cm47XG4gICAgICAgIHRoaXMuY3VyRGlyID0gZGlyO1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5XYWxrQW5pbU5hbWUgKyBkaXIpO1xuICAgIH0sXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fVxuXG59KTtcbi8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4vLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4vLyB9LFxuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMmVjMDBxa1lkaEhSYkc4WXlrb09xTHQnLCAnbXlPdGhlckhlcm8nKTtcbi8vIHNjcmlwdC9teU90aGVySGVyby5qc1xuXG5jYy5DbGFzcyh7XG4gICAgJ2V4dGVuZHMnOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7XG5cbiAgICAgICAgU3RhbmRBbmltTmFtZTogJycsXG4gICAgICAgIFdhbGtBbmltTmFtZTogJycsXG4gICAgICAgIGN1ckRpcjogJycsXG4gICAgICAgIGRpcjogJycsXG5cbiAgICAgICAgcGF0aDogW11cblxuICAgIH0sXG5cbiAgICB0b1N0YW5kOiBmdW5jdGlvbiB0b1N0YW5kKCkge1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5TdGFuZEFuaW1OYW1lICsgdGhpcy5jdXJEaXIpO1xuICAgIH0sXG5cbiAgICB0b1dhbGs6IGZ1bmN0aW9uIHRvV2FsaygpIHtcblxuICAgICAgICB2YXIgaXRlbSA9IHRoaXMucGF0aC5zaGlmdCgpO1xuICAgICAgICBpZiAoaXRlbSA9PSB1bmRlZmluZWQpIHJldHVybjtcbiAgICAgICAgdGhpcy5kaXIgPSBpdGVtLmR4ICsgJycgKyBpdGVtLmR5O1xuXG4gICAgICAgIGlmICh0aGlzLmRpciA9PSB0aGlzLmN1ckRpcikgcmV0dXJuO1xuICAgICAgICB0aGlzLmN1ckRpciA9IHRoaXMuZGlyO1xuICAgICAgICB0aGlzLmdldENvbXBvbmVudChjYy5BbmltYXRpb24pLnBsYXkodGhpcy5XYWxrQW5pbU5hbWUgKyB0aGlzLmRpcik7XG4gICAgfSxcbiAgICAvLyB1c2UgdGhpcyBmb3IgaW5pdGlhbGl6YXRpb25cbiAgICBvbkxvYWQ6IGZ1bmN0aW9uIG9uTG9hZCgpIHt9XG5cbn0pO1xuLy8gY2FsbGVkIGV2ZXJ5IGZyYW1lLCB1bmNvbW1lbnQgdGhpcyBmdW5jdGlvbiB0byBhY3RpdmF0ZSB1cGRhdGUgY2FsbGJhY2tcbi8vIHVwZGF0ZTogZnVuY3Rpb24gKGR0KSB7XG5cbi8vIH0sXG5cbmNjLl9SRnBvcCgpOyIsIlwidXNlIHN0cmljdFwiO1xuY2MuX1JGcHVzaChtb2R1bGUsICdkNTc3NEN0L2lWSzlvZTR0YWdOejZJLycsICdteVV0aWwnKTtcbi8vIHNjcmlwdC9teVV0aWwuanNcblxuY2MuQ2xhc3Moe1xuICAgIFwiZXh0ZW5kc1wiOiBjYy5Db21wb25lbnQsXG5cbiAgICBwcm9wZXJ0aWVzOiB7fSxcblxuICAgIGNvbnZlcnRUbzQ1OiBmdW5jdGlvbiBjb252ZXJ0VG80NShjbGlja0V2ZW50KSB7XG4gICAgICAgIHZhciB2aXNpYmxlU2l6ZSA9IGNjLmRpcmVjdG9yLmdldFZpc2libGVTaXplKCk7XG4gICAgICAgIHZhciBvbGRYID0gKGNsaWNrRXZlbnQuZ2V0TG9jYXRpb25YKCkgLSB2aXNpYmxlU2l6ZS53aWR0aCAvIDIpIC8gNjQ7XG4gICAgICAgIHZhciBvbGRZID0gKGNsaWNrRXZlbnQuZ2V0TG9jYXRpb25ZKCkgLSB2aXNpYmxlU2l6ZS5oZWlnaHQgLyAyKSAvIDQ4O1xuXG4gICAgICAgIHZhciByYXdOZXdYID0gb2xkWCArIG9sZFk7XG4gICAgICAgIHZhciByYXdOZXdZID0gb2xkWCAtIG9sZFk7XG5cbiAgICAgICAgdmFyIG5ld1ggPSBNYXRoLmZsb29yKHJhd05ld1gpICsgMTtcbiAgICAgICAgdmFyIG5ld1kgPSAtTWF0aC5mbG9vcigtcmF3TmV3WSkgLSAxO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBuZXdYOiBuZXdYLFxuICAgICAgICAgICAgbmV3WTogbmV3WVxuICAgICAgICB9O1xuICAgIH0sXG5cbiAgICBjb252ZXJ0VG9QYXRoOiBmdW5jdGlvbiBjb252ZXJ0VG9QYXRoKG5ld1BvcywgY3VyVGlsZVBvc1gsIGN1clRpbGVQb3NZKSB7XG5cbiAgICAgICAgdmFyIG5ld1ggPSBuZXdQb3MubmV3WDtcbiAgICAgICAgdmFyIG5ld1kgPSBuZXdQb3MubmV3WTtcblxuICAgICAgICB2YXIgb3Blbkxpc3QgPSBbXTtcbiAgICAgICAgdmFyIGNsb3NlTGlzdCA9IFtdO1xuICAgICAgICB2YXIgZmluYWxMaXN0ID0gW107XG5cbiAgICAgICAgdmFyIHN0YXJ0ID0ge1xuICAgICAgICAgICAgeDogY3VyVGlsZVBvc1gsXG4gICAgICAgICAgICB5OiBjdXJUaWxlUG9zWSxcbiAgICAgICAgICAgIGg6IChNYXRoLmFicyhuZXdYKSArIE1hdGguYWJzKG5ld1kpKSAqIDEwLFxuICAgICAgICAgICAgZzogMCxcbiAgICAgICAgICAgIHA6IG51bGxcbiAgICAgICAgfTtcbiAgICAgICAgc3RhcnQuZiA9IHN0YXJ0LmggKyBzdGFydC5nO1xuXG4gICAgICAgIG9wZW5MaXN0LnB1c2goc3RhcnQpO1xuXG4gICAgICAgIHZhciBkZXNUaWxlWCA9IHN0YXJ0LnggKyBuZXdYO1xuICAgICAgICB2YXIgZGVzVGlsZVkgPSBzdGFydC55ICsgbmV3WTtcblxuICAgICAgICB3aGlsZSAob3Blbkxpc3QubGVuZ3RoICE9IDApIHtcblxuICAgICAgICAgICAgdmFyIHBhcmVudCA9IG9wZW5MaXN0LnNoaWZ0KCk7XG5cbiAgICAgICAgICAgIGNsb3NlTGlzdC5wdXNoKHBhcmVudCk7XG5cbiAgICAgICAgICAgIGlmIChwYXJlbnQuaCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAtMTsgaSA8PSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBqID0gLTE7IGogPD0gMTsgaisrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByYXd4ID0gcGFyZW50LnggKyBpO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmF3eSA9IHBhcmVudC55ICsgajtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuX2hhZEluQ2xvc2VMaXN0KHJhd3gsIHJhd3ksIGNsb3NlTGlzdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8q5q+U6L6DR+WAvOaNolAg6L+U5ZueKi9jb250aW51ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB2YXIgbmVpYm91ciA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHJhd3gsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiByYXd5LFxuICAgICAgICAgICAgICAgICAgICAgICAgaDogTWF0aC5tYXgoTWF0aC5hYnMocmF3eCAtIGRlc1RpbGVYKSwgTWF0aC5hYnMocmF3eSAtIGRlc1RpbGVZKSkgKiAxMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGc6IHBhcmVudC5nICsgKGkgIT0gMCAmJiBqICE9IDAgPyAxNCA6IDEwKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHA6IHBhcmVudFxuICAgICAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgICAgIG5laWJvdXIuZiA9IG5laWJvdXIuaCArIG5laWJvdXIuZztcblxuICAgICAgICAgICAgICAgICAgICBvcGVuTGlzdC5wdXNoKG5laWJvdXIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3Blbkxpc3Quc29ydCh0aGlzLl9zb3J0Rik7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZGVzID0gY2xvc2VMaXN0LnBvcCgpO1xuXG4gICAgICAgIHdoaWxlIChkZXMucCkge1xuICAgICAgICAgICAgZGVzLmR4ID0gZGVzLnggLSBkZXMucC54O1xuICAgICAgICAgICAgZGVzLmR5ID0gZGVzLnkgLSBkZXMucC55O1xuICAgICAgICAgICAgZmluYWxMaXN0LnVuc2hpZnQoZGVzKTtcbiAgICAgICAgICAgIGRlcyA9IGRlcy5wO1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiBmaW5hbExpc3Q7XG4gICAgfSxcblxuICAgIF9oYWRJbkNsb3NlTGlzdDogZnVuY3Rpb24gX2hhZEluQ2xvc2VMaXN0KHgsIHksIGNsb3NlTGlzdCkge1xuICAgICAgICB2YXIgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWU7XG4gICAgICAgIHZhciBfZGlkSXRlcmF0b3JFcnJvciA9IGZhbHNlO1xuICAgICAgICB2YXIgX2l0ZXJhdG9yRXJyb3IgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGZvciAodmFyIF9pdGVyYXRvciA9IGNsb3NlTGlzdFtTeW1ib2wuaXRlcmF0b3JdKCksIF9zdGVwOyAhKF9pdGVyYXRvck5vcm1hbENvbXBsZXRpb24gPSAoX3N0ZXAgPSBfaXRlcmF0b3IubmV4dCgpKS5kb25lKTsgX2l0ZXJhdG9yTm9ybWFsQ29tcGxldGlvbiA9IHRydWUpIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IF9zdGVwLnZhbHVlO1xuXG4gICAgICAgICAgICAgICAgaWYgKGl0ZW0ueCA9PSB4ICYmIGl0ZW0ueSA9PSB5KSByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBfZGlkSXRlcmF0b3JFcnJvciA9IHRydWU7XG4gICAgICAgICAgICBfaXRlcmF0b3JFcnJvciA9IGVycjtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgaWYgKCFfaXRlcmF0b3JOb3JtYWxDb21wbGV0aW9uICYmIF9pdGVyYXRvcltcInJldHVyblwiXSkge1xuICAgICAgICAgICAgICAgICAgICBfaXRlcmF0b3JbXCJyZXR1cm5cIl0oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgICAgICAgIGlmIChfZGlkSXRlcmF0b3JFcnJvcikge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBfaXRlcmF0b3JFcnJvcjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIF9zb3J0RjogZnVuY3Rpb24gX3NvcnRGKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZiAtIGIuZjtcbiAgICB9LFxuXG4gICAgLy8gdXNlIHRoaXMgZm9yIGluaXRpYWxpemF0aW9uXG4gICAgb25Mb2FkOiBmdW5jdGlvbiBvbkxvYWQoKSB7fVxuXG59KTtcbi8vIGNhbGxlZCBldmVyeSBmcmFtZSwgdW5jb21tZW50IHRoaXMgZnVuY3Rpb24gdG8gYWN0aXZhdGUgdXBkYXRlIGNhbGxiYWNrXG4vLyB1cGRhdGU6IGZ1bmN0aW9uIChkdCkge1xuXG4vLyB9LFxuXG5jYy5fUkZwb3AoKTsiLCJcInVzZSBzdHJpY3RcIjtcbmNjLl9SRnB1c2gobW9kdWxlLCAnMzM2ZjdRb3huWkpQYkJWUDF0d2docUEnLCAnc29ja2V0LmlvJyk7XG4vLyBzY3JpcHQvc29ja2V0LmlvLmpzXG5cblwidXNlIHN0cmljdFwiO2lmKCFjYy5zeXMuaXNOYXRpdmUpeyhmdW5jdGlvbihmKXtpZih0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlICE9PSBcInVuZGVmaW5lZFwiKXttb2R1bGUuZXhwb3J0cyA9IGYoKTt9ZWxzZSBpZih0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCl7ZGVmaW5lKFtdLGYpO31lbHNlIHt2YXIgZztpZih0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKXtnID0gd2luZG93O31lbHNlIGlmKHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIpe2cgPSBnbG9iYWw7fWVsc2UgaWYodHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIpe2cgPSBzZWxmO31lbHNlIHtnID0gdGhpczt9Zy5pbyA9IGYoKTt9fSkoZnVuY3Rpb24oKXt2YXIgZGVmaW5lLG1vZHVsZSxleHBvcnRzO3JldHVybiAoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmUgPT0gXCJmdW5jdGlvblwiICYmIHJlcXVpcmU7aWYoIXUgJiYgYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIgKyBvICsgXCInXCIpO3Rocm93IChmLmNvZGUgPSBcIk1PRFVMRV9OT1RfRk9VTkRcIixmKTt9dmFyIGw9bltvXSA9IHtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpO30sbCxsLmV4cG9ydHMsZSx0LG4scik7fXJldHVybiBuW29dLmV4cG9ydHM7fXZhciBpPXR5cGVvZiByZXF1aXJlID09IFwiZnVuY3Rpb25cIiAmJiByZXF1aXJlO2Zvcih2YXIgbz0wO28gPCByLmxlbmd0aDtvKyspIHMocltvXSk7cmV0dXJuIHM7fSkoezE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzID0gX2RlcmVxXygnLi9saWIvJyk7fSx7XCIuL2xpYi9cIjoyfV0sMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7bW9kdWxlLmV4cG9ydHMgPSBfZGVyZXFfKCcuL3NvY2tldCcpOyAvKipcbiAqIEV4cG9ydHMgcGFyc2VyXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqXG4gKi9tb2R1bGUuZXhwb3J0cy5wYXJzZXIgPSBfZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7fSx7XCIuL3NvY2tldFwiOjMsXCJlbmdpbmUuaW8tcGFyc2VyXCI6MTl9XSwzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIHRyYW5zcG9ydHM9X2RlcmVxXygnLi90cmFuc3BvcnRzJyk7dmFyIEVtaXR0ZXI9X2RlcmVxXygnY29tcG9uZW50LWVtaXR0ZXInKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnZW5naW5lLmlvLWNsaWVudDpzb2NrZXQnKTt2YXIgaW5kZXg9X2RlcmVxXygnaW5kZXhvZicpO3ZhciBwYXJzZXI9X2RlcmVxXygnZW5naW5lLmlvLXBhcnNlcicpO3ZhciBwYXJzZXVyaT1fZGVyZXFfKCdwYXJzZXVyaScpO3ZhciBwYXJzZWpzb249X2RlcmVxXygncGFyc2Vqc29uJyk7dmFyIHBhcnNlcXM9X2RlcmVxXygncGFyc2VxcycpOyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBTb2NrZXQ7IC8qKlxuICogTm9vcCBmdW5jdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIG5vb3AoKXt9IC8qKlxuICogU29ja2V0IGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfE9iamVjdH0gdXJpIG9yIG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gU29ja2V0KHVyaSxvcHRzKXtpZighKHRoaXMgaW5zdGFuY2VvZiBTb2NrZXQpKXJldHVybiBuZXcgU29ja2V0KHVyaSxvcHRzKTtvcHRzID0gb3B0cyB8fCB7fTtpZih1cmkgJiYgJ29iamVjdCcgPT0gdHlwZW9mIHVyaSl7b3B0cyA9IHVyaTt1cmkgPSBudWxsO31pZih1cmkpe3VyaSA9IHBhcnNldXJpKHVyaSk7b3B0cy5ob3N0bmFtZSA9IHVyaS5ob3N0O29wdHMuc2VjdXJlID0gdXJpLnByb3RvY29sID09ICdodHRwcycgfHwgdXJpLnByb3RvY29sID09ICd3c3MnO29wdHMucG9ydCA9IHVyaS5wb3J0O2lmKHVyaS5xdWVyeSlvcHRzLnF1ZXJ5ID0gdXJpLnF1ZXJ5O31lbHNlIGlmKG9wdHMuaG9zdCl7b3B0cy5ob3N0bmFtZSA9IHBhcnNldXJpKG9wdHMuaG9zdCkuaG9zdDt9dGhpcy5zZWN1cmUgPSBudWxsICE9IG9wdHMuc2VjdXJlP29wdHMuc2VjdXJlOmdsb2JhbC5sb2NhdGlvbiAmJiAnaHR0cHM6JyA9PSBsb2NhdGlvbi5wcm90b2NvbDtpZihvcHRzLmhvc3RuYW1lICYmICFvcHRzLnBvcnQpeyAvLyBpZiBubyBwb3J0IGlzIHNwZWNpZmllZCBtYW51YWxseSwgdXNlIHRoZSBwcm90b2NvbCBkZWZhdWx0XG5vcHRzLnBvcnQgPSB0aGlzLnNlY3VyZT8nNDQzJzonODAnO310aGlzLmFnZW50ID0gb3B0cy5hZ2VudCB8fCBmYWxzZTt0aGlzLmhvc3RuYW1lID0gb3B0cy5ob3N0bmFtZSB8fCAoZ2xvYmFsLmxvY2F0aW9uP2xvY2F0aW9uLmhvc3RuYW1lOidsb2NhbGhvc3QnKTt0aGlzLnBvcnQgPSBvcHRzLnBvcnQgfHwgKGdsb2JhbC5sb2NhdGlvbiAmJiBsb2NhdGlvbi5wb3J0P2xvY2F0aW9uLnBvcnQ6dGhpcy5zZWN1cmU/NDQzOjgwKTt0aGlzLnF1ZXJ5ID0gb3B0cy5xdWVyeSB8fCB7fTtpZignc3RyaW5nJyA9PSB0eXBlb2YgdGhpcy5xdWVyeSl0aGlzLnF1ZXJ5ID0gcGFyc2Vxcy5kZWNvZGUodGhpcy5xdWVyeSk7dGhpcy51cGdyYWRlID0gZmFsc2UgIT09IG9wdHMudXBncmFkZTt0aGlzLnBhdGggPSAob3B0cy5wYXRoIHx8ICcvZW5naW5lLmlvJykucmVwbGFjZSgvXFwvJC8sJycpICsgJy8nO3RoaXMuZm9yY2VKU09OUCA9ICEhb3B0cy5mb3JjZUpTT05QO3RoaXMuanNvbnAgPSBmYWxzZSAhPT0gb3B0cy5qc29ucDt0aGlzLmZvcmNlQmFzZTY0ID0gISFvcHRzLmZvcmNlQmFzZTY0O3RoaXMuZW5hYmxlc1hEUiA9ICEhb3B0cy5lbmFibGVzWERSO3RoaXMudGltZXN0YW1wUGFyYW0gPSBvcHRzLnRpbWVzdGFtcFBhcmFtIHx8ICd0Jzt0aGlzLnRpbWVzdGFtcFJlcXVlc3RzID0gb3B0cy50aW1lc3RhbXBSZXF1ZXN0czt0aGlzLnRyYW5zcG9ydHMgPSBvcHRzLnRyYW5zcG9ydHMgfHwgWydwb2xsaW5nJywnd2Vic29ja2V0J107dGhpcy5yZWFkeVN0YXRlID0gJyc7dGhpcy53cml0ZUJ1ZmZlciA9IFtdO3RoaXMucG9saWN5UG9ydCA9IG9wdHMucG9saWN5UG9ydCB8fCA4NDM7dGhpcy5yZW1lbWJlclVwZ3JhZGUgPSBvcHRzLnJlbWVtYmVyVXBncmFkZSB8fCBmYWxzZTt0aGlzLmJpbmFyeVR5cGUgPSBudWxsO3RoaXMub25seUJpbmFyeVVwZ3JhZGVzID0gb3B0cy5vbmx5QmluYXJ5VXBncmFkZXM7dGhpcy5wZXJNZXNzYWdlRGVmbGF0ZSA9IGZhbHNlICE9PSBvcHRzLnBlck1lc3NhZ2VEZWZsYXRlP29wdHMucGVyTWVzc2FnZURlZmxhdGUgfHwge306ZmFsc2U7aWYodHJ1ZSA9PT0gdGhpcy5wZXJNZXNzYWdlRGVmbGF0ZSl0aGlzLnBlck1lc3NhZ2VEZWZsYXRlID0ge307aWYodGhpcy5wZXJNZXNzYWdlRGVmbGF0ZSAmJiBudWxsID09IHRoaXMucGVyTWVzc2FnZURlZmxhdGUudGhyZXNob2xkKXt0aGlzLnBlck1lc3NhZ2VEZWZsYXRlLnRocmVzaG9sZCA9IDEwMjQ7fSAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbnRoaXMucGZ4ID0gb3B0cy5wZnggfHwgbnVsbDt0aGlzLmtleSA9IG9wdHMua2V5IHx8IG51bGw7dGhpcy5wYXNzcGhyYXNlID0gb3B0cy5wYXNzcGhyYXNlIHx8IG51bGw7dGhpcy5jZXJ0ID0gb3B0cy5jZXJ0IHx8IG51bGw7dGhpcy5jYSA9IG9wdHMuY2EgfHwgbnVsbDt0aGlzLmNpcGhlcnMgPSBvcHRzLmNpcGhlcnMgfHwgbnVsbDt0aGlzLnJlamVjdFVuYXV0aG9yaXplZCA9IG9wdHMucmVqZWN0VW5hdXRob3JpemVkID09PSB1bmRlZmluZWQ/bnVsbDpvcHRzLnJlamVjdFVuYXV0aG9yaXplZDsgLy8gb3RoZXIgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbnZhciBmcmVlR2xvYmFsPXR5cGVvZiBnbG9iYWwgPT0gJ29iamVjdCcgJiYgZ2xvYmFsO2lmKGZyZWVHbG9iYWwuZ2xvYmFsID09PSBmcmVlR2xvYmFsKXtpZihvcHRzLmV4dHJhSGVhZGVycyAmJiBPYmplY3Qua2V5cyhvcHRzLmV4dHJhSGVhZGVycykubGVuZ3RoID4gMCl7dGhpcy5leHRyYUhlYWRlcnMgPSBvcHRzLmV4dHJhSGVhZGVyczt9fXRoaXMub3BlbigpO31Tb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gZmFsc2U7IC8qKlxuICogTWl4IGluIGBFbWl0dGVyYC5cbiAqL0VtaXR0ZXIoU29ja2V0LnByb3RvdHlwZSk7IC8qKlxuICogUHJvdG9jb2wgdmVyc2lvbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovU29ja2V0LnByb3RvY29sID0gcGFyc2VyLnByb3RvY29sOyAvLyB0aGlzIGlzIGFuIGludFxuLyoqXG4gKiBFeHBvc2UgZGVwcyBmb3IgbGVnYWN5IGNvbXBhdGliaWxpdHlcbiAqIGFuZCBzdGFuZGFsb25lIGJyb3dzZXIgYWNjZXNzLlxuICovU29ja2V0LlNvY2tldCA9IFNvY2tldDtTb2NrZXQuVHJhbnNwb3J0ID0gX2RlcmVxXygnLi90cmFuc3BvcnQnKTtTb2NrZXQudHJhbnNwb3J0cyA9IF9kZXJlcV8oJy4vdHJhbnNwb3J0cycpO1NvY2tldC5wYXJzZXIgPSBfZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7IC8qKlxuICogQ3JlYXRlcyB0cmFuc3BvcnQgb2YgdGhlIGdpdmVuIHR5cGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRyYW5zcG9ydCBuYW1lXG4gKiBAcmV0dXJuIHtUcmFuc3BvcnR9XG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUuY3JlYXRlVHJhbnNwb3J0ID0gZnVuY3Rpb24obmFtZSl7ZGVidWcoJ2NyZWF0aW5nIHRyYW5zcG9ydCBcIiVzXCInLG5hbWUpO3ZhciBxdWVyeT1jbG9uZSh0aGlzLnF1ZXJ5KTsgLy8gYXBwZW5kIGVuZ2luZS5pbyBwcm90b2NvbCBpZGVudGlmaWVyXG5xdWVyeS5FSU8gPSBwYXJzZXIucHJvdG9jb2w7IC8vIHRyYW5zcG9ydCBuYW1lXG5xdWVyeS50cmFuc3BvcnQgPSBuYW1lOyAvLyBzZXNzaW9uIGlkIGlmIHdlIGFscmVhZHkgaGF2ZSBvbmVcbmlmKHRoaXMuaWQpcXVlcnkuc2lkID0gdGhpcy5pZDt2YXIgdHJhbnNwb3J0PW5ldyB0cmFuc3BvcnRzW25hbWVdKHthZ2VudDp0aGlzLmFnZW50LGhvc3RuYW1lOnRoaXMuaG9zdG5hbWUscG9ydDp0aGlzLnBvcnQsc2VjdXJlOnRoaXMuc2VjdXJlLHBhdGg6dGhpcy5wYXRoLHF1ZXJ5OnF1ZXJ5LGZvcmNlSlNPTlA6dGhpcy5mb3JjZUpTT05QLGpzb25wOnRoaXMuanNvbnAsZm9yY2VCYXNlNjQ6dGhpcy5mb3JjZUJhc2U2NCxlbmFibGVzWERSOnRoaXMuZW5hYmxlc1hEUix0aW1lc3RhbXBSZXF1ZXN0czp0aGlzLnRpbWVzdGFtcFJlcXVlc3RzLHRpbWVzdGFtcFBhcmFtOnRoaXMudGltZXN0YW1wUGFyYW0scG9saWN5UG9ydDp0aGlzLnBvbGljeVBvcnQsc29ja2V0OnRoaXMscGZ4OnRoaXMucGZ4LGtleTp0aGlzLmtleSxwYXNzcGhyYXNlOnRoaXMucGFzc3BocmFzZSxjZXJ0OnRoaXMuY2VydCxjYTp0aGlzLmNhLGNpcGhlcnM6dGhpcy5jaXBoZXJzLHJlamVjdFVuYXV0aG9yaXplZDp0aGlzLnJlamVjdFVuYXV0aG9yaXplZCxwZXJNZXNzYWdlRGVmbGF0ZTp0aGlzLnBlck1lc3NhZ2VEZWZsYXRlLGV4dHJhSGVhZGVyczp0aGlzLmV4dHJhSGVhZGVyc30pO3JldHVybiB0cmFuc3BvcnQ7fTtmdW5jdGlvbiBjbG9uZShvYmope3ZhciBvPXt9O2Zvcih2YXIgaSBpbiBvYmopIHtpZihvYmouaGFzT3duUHJvcGVydHkoaSkpe29baV0gPSBvYmpbaV07fX1yZXR1cm4gbzt9IC8qKlxuICogSW5pdGlhbGl6ZXMgdHJhbnNwb3J0IHRvIHVzZSBhbmQgc3RhcnRzIHByb2JlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vcGVuID0gZnVuY3Rpb24oKXt2YXIgdHJhbnNwb3J0O2lmKHRoaXMucmVtZW1iZXJVcGdyYWRlICYmIFNvY2tldC5wcmlvcldlYnNvY2tldFN1Y2Nlc3MgJiYgdGhpcy50cmFuc3BvcnRzLmluZGV4T2YoJ3dlYnNvY2tldCcpICE9IC0xKXt0cmFuc3BvcnQgPSAnd2Vic29ja2V0Jzt9ZWxzZSBpZigwID09PSB0aGlzLnRyYW5zcG9ydHMubGVuZ3RoKXsgLy8gRW1pdCBlcnJvciBvbiBuZXh0IHRpY2sgc28gaXQgY2FuIGJlIGxpc3RlbmVkIHRvXG52YXIgc2VsZj10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtzZWxmLmVtaXQoJ2Vycm9yJywnTm8gdHJhbnNwb3J0cyBhdmFpbGFibGUnKTt9LDApO3JldHVybjt9ZWxzZSB7dHJhbnNwb3J0ID0gdGhpcy50cmFuc3BvcnRzWzBdO310aGlzLnJlYWR5U3RhdGUgPSAnb3BlbmluZyc7IC8vIFJldHJ5IHdpdGggdGhlIG5leHQgdHJhbnNwb3J0IGlmIHRoZSB0cmFuc3BvcnQgaXMgZGlzYWJsZWQgKGpzb25wOiBmYWxzZSlcbnRyeXt0cmFuc3BvcnQgPSB0aGlzLmNyZWF0ZVRyYW5zcG9ydCh0cmFuc3BvcnQpO31jYXRjaChlKSB7dGhpcy50cmFuc3BvcnRzLnNoaWZ0KCk7dGhpcy5vcGVuKCk7cmV0dXJuO310cmFuc3BvcnQub3BlbigpO3RoaXMuc2V0VHJhbnNwb3J0KHRyYW5zcG9ydCk7fTsgLyoqXG4gKiBTZXRzIHRoZSBjdXJyZW50IHRyYW5zcG9ydC4gRGlzYWJsZXMgdGhlIGV4aXN0aW5nIG9uZSAoaWYgYW55KS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUuc2V0VHJhbnNwb3J0ID0gZnVuY3Rpb24odHJhbnNwb3J0KXtkZWJ1Zygnc2V0dGluZyB0cmFuc3BvcnQgJXMnLHRyYW5zcG9ydC5uYW1lKTt2YXIgc2VsZj10aGlzO2lmKHRoaXMudHJhbnNwb3J0KXtkZWJ1ZygnY2xlYXJpbmcgZXhpc3RpbmcgdHJhbnNwb3J0ICVzJyx0aGlzLnRyYW5zcG9ydC5uYW1lKTt0aGlzLnRyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoKTt9IC8vIHNldCB1cCB0cmFuc3BvcnRcbnRoaXMudHJhbnNwb3J0ID0gdHJhbnNwb3J0OyAvLyBzZXQgdXAgdHJhbnNwb3J0IGxpc3RlbmVyc1xudHJhbnNwb3J0Lm9uKCdkcmFpbicsZnVuY3Rpb24oKXtzZWxmLm9uRHJhaW4oKTt9KS5vbigncGFja2V0JyxmdW5jdGlvbihwYWNrZXQpe3NlbGYub25QYWNrZXQocGFja2V0KTt9KS5vbignZXJyb3InLGZ1bmN0aW9uKGUpe3NlbGYub25FcnJvcihlKTt9KS5vbignY2xvc2UnLGZ1bmN0aW9uKCl7c2VsZi5vbkNsb3NlKCd0cmFuc3BvcnQgY2xvc2UnKTt9KTt9OyAvKipcbiAqIFByb2JlcyBhIHRyYW5zcG9ydC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdHJhbnNwb3J0IG5hbWVcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5wcm9iZSA9IGZ1bmN0aW9uKG5hbWUpe2RlYnVnKCdwcm9iaW5nIHRyYW5zcG9ydCBcIiVzXCInLG5hbWUpO3ZhciB0cmFuc3BvcnQ9dGhpcy5jcmVhdGVUcmFuc3BvcnQobmFtZSx7cHJvYmU6MX0pLGZhaWxlZD1mYWxzZSxzZWxmPXRoaXM7U29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyA9IGZhbHNlO2Z1bmN0aW9uIG9uVHJhbnNwb3J0T3Blbigpe2lmKHNlbGYub25seUJpbmFyeVVwZ3JhZGVzKXt2YXIgdXBncmFkZUxvc2VzQmluYXJ5PSF0aGlzLnN1cHBvcnRzQmluYXJ5ICYmIHNlbGYudHJhbnNwb3J0LnN1cHBvcnRzQmluYXJ5O2ZhaWxlZCA9IGZhaWxlZCB8fCB1cGdyYWRlTG9zZXNCaW5hcnk7fWlmKGZhaWxlZClyZXR1cm47ZGVidWcoJ3Byb2JlIHRyYW5zcG9ydCBcIiVzXCIgb3BlbmVkJyxuYW1lKTt0cmFuc3BvcnQuc2VuZChbe3R5cGU6J3BpbmcnLGRhdGE6J3Byb2JlJ31dKTt0cmFuc3BvcnQub25jZSgncGFja2V0JyxmdW5jdGlvbihtc2cpe2lmKGZhaWxlZClyZXR1cm47aWYoJ3BvbmcnID09IG1zZy50eXBlICYmICdwcm9iZScgPT0gbXNnLmRhdGEpe2RlYnVnKCdwcm9iZSB0cmFuc3BvcnQgXCIlc1wiIHBvbmcnLG5hbWUpO3NlbGYudXBncmFkaW5nID0gdHJ1ZTtzZWxmLmVtaXQoJ3VwZ3JhZGluZycsdHJhbnNwb3J0KTtpZighdHJhbnNwb3J0KXJldHVybjtTb2NrZXQucHJpb3JXZWJzb2NrZXRTdWNjZXNzID0gJ3dlYnNvY2tldCcgPT0gdHJhbnNwb3J0Lm5hbWU7ZGVidWcoJ3BhdXNpbmcgY3VycmVudCB0cmFuc3BvcnQgXCIlc1wiJyxzZWxmLnRyYW5zcG9ydC5uYW1lKTtzZWxmLnRyYW5zcG9ydC5wYXVzZShmdW5jdGlvbigpe2lmKGZhaWxlZClyZXR1cm47aWYoJ2Nsb3NlZCcgPT0gc2VsZi5yZWFkeVN0YXRlKXJldHVybjtkZWJ1ZygnY2hhbmdpbmcgdHJhbnNwb3J0IGFuZCBzZW5kaW5nIHVwZ3JhZGUgcGFja2V0Jyk7Y2xlYW51cCgpO3NlbGYuc2V0VHJhbnNwb3J0KHRyYW5zcG9ydCk7dHJhbnNwb3J0LnNlbmQoW3t0eXBlOid1cGdyYWRlJ31dKTtzZWxmLmVtaXQoJ3VwZ3JhZGUnLHRyYW5zcG9ydCk7dHJhbnNwb3J0ID0gbnVsbDtzZWxmLnVwZ3JhZGluZyA9IGZhbHNlO3NlbGYuZmx1c2goKTt9KTt9ZWxzZSB7ZGVidWcoJ3Byb2JlIHRyYW5zcG9ydCBcIiVzXCIgZmFpbGVkJyxuYW1lKTt2YXIgZXJyPW5ldyBFcnJvcigncHJvYmUgZXJyb3InKTtlcnIudHJhbnNwb3J0ID0gdHJhbnNwb3J0Lm5hbWU7c2VsZi5lbWl0KCd1cGdyYWRlRXJyb3InLGVycik7fX0pO31mdW5jdGlvbiBmcmVlemVUcmFuc3BvcnQoKXtpZihmYWlsZWQpcmV0dXJuOyAvLyBBbnkgY2FsbGJhY2sgY2FsbGVkIGJ5IHRyYW5zcG9ydCBzaG91bGQgYmUgaWdub3JlZCBzaW5jZSBub3dcbmZhaWxlZCA9IHRydWU7Y2xlYW51cCgpO3RyYW5zcG9ydC5jbG9zZSgpO3RyYW5zcG9ydCA9IG51bGw7fSAvL0hhbmRsZSBhbnkgZXJyb3IgdGhhdCBoYXBwZW5zIHdoaWxlIHByb2JpbmdcbmZ1bmN0aW9uIG9uZXJyb3IoZXJyKXt2YXIgZXJyb3I9bmV3IEVycm9yKCdwcm9iZSBlcnJvcjogJyArIGVycik7ZXJyb3IudHJhbnNwb3J0ID0gdHJhbnNwb3J0Lm5hbWU7ZnJlZXplVHJhbnNwb3J0KCk7ZGVidWcoJ3Byb2JlIHRyYW5zcG9ydCBcIiVzXCIgZmFpbGVkIGJlY2F1c2Ugb2YgZXJyb3I6ICVzJyxuYW1lLGVycik7c2VsZi5lbWl0KCd1cGdyYWRlRXJyb3InLGVycm9yKTt9ZnVuY3Rpb24gb25UcmFuc3BvcnRDbG9zZSgpe29uZXJyb3IoXCJ0cmFuc3BvcnQgY2xvc2VkXCIpO30gLy9XaGVuIHRoZSBzb2NrZXQgaXMgY2xvc2VkIHdoaWxlIHdlJ3JlIHByb2JpbmdcbmZ1bmN0aW9uIG9uY2xvc2UoKXtvbmVycm9yKFwic29ja2V0IGNsb3NlZFwiKTt9IC8vV2hlbiB0aGUgc29ja2V0IGlzIHVwZ3JhZGVkIHdoaWxlIHdlJ3JlIHByb2JpbmdcbmZ1bmN0aW9uIG9udXBncmFkZSh0byl7aWYodHJhbnNwb3J0ICYmIHRvLm5hbWUgIT0gdHJhbnNwb3J0Lm5hbWUpe2RlYnVnKCdcIiVzXCIgd29ya3MgLSBhYm9ydGluZyBcIiVzXCInLHRvLm5hbWUsdHJhbnNwb3J0Lm5hbWUpO2ZyZWV6ZVRyYW5zcG9ydCgpO319IC8vUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgb24gdGhlIHRyYW5zcG9ydCBhbmQgb24gc2VsZlxuZnVuY3Rpb24gY2xlYW51cCgpe3RyYW5zcG9ydC5yZW1vdmVMaXN0ZW5lcignb3Blbicsb25UcmFuc3BvcnRPcGVuKTt0cmFuc3BvcnQucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJyxvbmVycm9yKTt0cmFuc3BvcnQucmVtb3ZlTGlzdGVuZXIoJ2Nsb3NlJyxvblRyYW5zcG9ydENsb3NlKTtzZWxmLnJlbW92ZUxpc3RlbmVyKCdjbG9zZScsb25jbG9zZSk7c2VsZi5yZW1vdmVMaXN0ZW5lcigndXBncmFkaW5nJyxvbnVwZ3JhZGUpO310cmFuc3BvcnQub25jZSgnb3Blbicsb25UcmFuc3BvcnRPcGVuKTt0cmFuc3BvcnQub25jZSgnZXJyb3InLG9uZXJyb3IpO3RyYW5zcG9ydC5vbmNlKCdjbG9zZScsb25UcmFuc3BvcnRDbG9zZSk7dGhpcy5vbmNlKCdjbG9zZScsb25jbG9zZSk7dGhpcy5vbmNlKCd1cGdyYWRpbmcnLG9udXBncmFkZSk7dHJhbnNwb3J0Lm9wZW4oKTt9OyAvKipcbiAqIENhbGxlZCB3aGVuIGNvbm5lY3Rpb24gaXMgZGVlbWVkIG9wZW4uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUub25PcGVuID0gZnVuY3Rpb24oKXtkZWJ1Zygnc29ja2V0IG9wZW4nKTt0aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7U29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyA9ICd3ZWJzb2NrZXQnID09IHRoaXMudHJhbnNwb3J0Lm5hbWU7dGhpcy5lbWl0KCdvcGVuJyk7dGhpcy5mbHVzaCgpOyAvLyB3ZSBjaGVjayBmb3IgYHJlYWR5U3RhdGVgIGluIGNhc2UgYW4gYG9wZW5gXG4vLyBsaXN0ZW5lciBhbHJlYWR5IGNsb3NlZCB0aGUgc29ja2V0XG5pZignb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlICYmIHRoaXMudXBncmFkZSAmJiB0aGlzLnRyYW5zcG9ydC5wYXVzZSl7ZGVidWcoJ3N0YXJ0aW5nIHVwZ3JhZGUgcHJvYmVzJyk7Zm9yKHZhciBpPTAsbD10aGlzLnVwZ3JhZGVzLmxlbmd0aDtpIDwgbDtpKyspIHt0aGlzLnByb2JlKHRoaXMudXBncmFkZXNbaV0pO319fTsgLyoqXG4gKiBIYW5kbGVzIGEgcGFja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vblBhY2tldCA9IGZ1bmN0aW9uKHBhY2tldCl7aWYoJ29wZW5pbmcnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKXtkZWJ1Zygnc29ja2V0IHJlY2VpdmU6IHR5cGUgXCIlc1wiLCBkYXRhIFwiJXNcIicscGFja2V0LnR5cGUscGFja2V0LmRhdGEpO3RoaXMuZW1pdCgncGFja2V0JyxwYWNrZXQpOyAvLyBTb2NrZXQgaXMgbGl2ZSAtIGFueSBwYWNrZXQgY291bnRzXG50aGlzLmVtaXQoJ2hlYXJ0YmVhdCcpO3N3aXRjaChwYWNrZXQudHlwZSl7Y2FzZSAnb3Blbic6dGhpcy5vbkhhbmRzaGFrZShwYXJzZWpzb24ocGFja2V0LmRhdGEpKTticmVhaztjYXNlICdwb25nJzp0aGlzLnNldFBpbmcoKTt0aGlzLmVtaXQoJ3BvbmcnKTticmVhaztjYXNlICdlcnJvcic6dmFyIGVycj1uZXcgRXJyb3IoJ3NlcnZlciBlcnJvcicpO2Vyci5jb2RlID0gcGFja2V0LmRhdGE7dGhpcy5vbkVycm9yKGVycik7YnJlYWs7Y2FzZSAnbWVzc2FnZSc6dGhpcy5lbWl0KCdkYXRhJyxwYWNrZXQuZGF0YSk7dGhpcy5lbWl0KCdtZXNzYWdlJyxwYWNrZXQuZGF0YSk7YnJlYWs7fX1lbHNlIHtkZWJ1ZygncGFja2V0IHJlY2VpdmVkIHdpdGggc29ja2V0IHJlYWR5U3RhdGUgXCIlc1wiJyx0aGlzLnJlYWR5U3RhdGUpO319OyAvKipcbiAqIENhbGxlZCB1cG9uIGhhbmRzaGFrZSBjb21wbGV0aW9uLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBoYW5kc2hha2Ugb2JqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25IYW5kc2hha2UgPSBmdW5jdGlvbihkYXRhKXt0aGlzLmVtaXQoJ2hhbmRzaGFrZScsZGF0YSk7dGhpcy5pZCA9IGRhdGEuc2lkO3RoaXMudHJhbnNwb3J0LnF1ZXJ5LnNpZCA9IGRhdGEuc2lkO3RoaXMudXBncmFkZXMgPSB0aGlzLmZpbHRlclVwZ3JhZGVzKGRhdGEudXBncmFkZXMpO3RoaXMucGluZ0ludGVydmFsID0gZGF0YS5waW5nSW50ZXJ2YWw7dGhpcy5waW5nVGltZW91dCA9IGRhdGEucGluZ1RpbWVvdXQ7dGhpcy5vbk9wZW4oKTsgLy8gSW4gY2FzZSBvcGVuIGhhbmRsZXIgY2xvc2VzIHNvY2tldFxuaWYoJ2Nsb3NlZCcgPT0gdGhpcy5yZWFkeVN0YXRlKXJldHVybjt0aGlzLnNldFBpbmcoKTsgLy8gUHJvbG9uZyBsaXZlbmVzcyBvZiBzb2NrZXQgb24gaGVhcnRiZWF0XG50aGlzLnJlbW92ZUxpc3RlbmVyKCdoZWFydGJlYXQnLHRoaXMub25IZWFydGJlYXQpO3RoaXMub24oJ2hlYXJ0YmVhdCcsdGhpcy5vbkhlYXJ0YmVhdCk7fTsgLyoqXG4gKiBSZXNldHMgcGluZyB0aW1lb3V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbkhlYXJ0YmVhdCA9IGZ1bmN0aW9uKHRpbWVvdXQpe2NsZWFyVGltZW91dCh0aGlzLnBpbmdUaW1lb3V0VGltZXIpO3ZhciBzZWxmPXRoaXM7c2VsZi5waW5nVGltZW91dFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe2lmKCdjbG9zZWQnID09IHNlbGYucmVhZHlTdGF0ZSlyZXR1cm47c2VsZi5vbkNsb3NlKCdwaW5nIHRpbWVvdXQnKTt9LHRpbWVvdXQgfHwgc2VsZi5waW5nSW50ZXJ2YWwgKyBzZWxmLnBpbmdUaW1lb3V0KTt9OyAvKipcbiAqIFBpbmdzIHNlcnZlciBldmVyeSBgdGhpcy5waW5nSW50ZXJ2YWxgIGFuZCBleHBlY3RzIHJlc3BvbnNlXG4gKiB3aXRoaW4gYHRoaXMucGluZ1RpbWVvdXRgIG9yIGNsb3NlcyBjb25uZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5zZXRQaW5nID0gZnVuY3Rpb24oKXt2YXIgc2VsZj10aGlzO2NsZWFyVGltZW91dChzZWxmLnBpbmdJbnRlcnZhbFRpbWVyKTtzZWxmLnBpbmdJbnRlcnZhbFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpe2RlYnVnKCd3cml0aW5nIHBpbmcgcGFja2V0IC0gZXhwZWN0aW5nIHBvbmcgd2l0aGluICVzbXMnLHNlbGYucGluZ1RpbWVvdXQpO3NlbGYucGluZygpO3NlbGYub25IZWFydGJlYXQoc2VsZi5waW5nVGltZW91dCk7fSxzZWxmLnBpbmdJbnRlcnZhbCk7fTsgLyoqXG4qIFNlbmRzIGEgcGluZyBwYWNrZXQuXG4qXG4qIEBhcGkgcHJpdmF0ZVxuKi9Tb2NrZXQucHJvdG90eXBlLnBpbmcgPSBmdW5jdGlvbigpe3ZhciBzZWxmPXRoaXM7dGhpcy5zZW5kUGFja2V0KCdwaW5nJyxmdW5jdGlvbigpe3NlbGYuZW1pdCgncGluZycpO30pO307IC8qKlxuICogQ2FsbGVkIG9uIGBkcmFpbmAgZXZlbnRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25EcmFpbiA9IGZ1bmN0aW9uKCl7dGhpcy53cml0ZUJ1ZmZlci5zcGxpY2UoMCx0aGlzLnByZXZCdWZmZXJMZW4pOyAvLyBzZXR0aW5nIHByZXZCdWZmZXJMZW4gPSAwIGlzIHZlcnkgaW1wb3J0YW50XG4vLyBmb3IgZXhhbXBsZSwgd2hlbiB1cGdyYWRpbmcsIHVwZ3JhZGUgcGFja2V0IGlzIHNlbnQgb3Zlcixcbi8vIGFuZCBhIG5vbnplcm8gcHJldkJ1ZmZlckxlbiBjb3VsZCBjYXVzZSBwcm9ibGVtcyBvbiBgZHJhaW5gXG50aGlzLnByZXZCdWZmZXJMZW4gPSAwO2lmKDAgPT09IHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKXt0aGlzLmVtaXQoJ2RyYWluJyk7fWVsc2Uge3RoaXMuZmx1c2goKTt9fTsgLyoqXG4gKiBGbHVzaCB3cml0ZSBidWZmZXJzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5mbHVzaCA9IGZ1bmN0aW9uKCl7aWYoJ2Nsb3NlZCcgIT0gdGhpcy5yZWFkeVN0YXRlICYmIHRoaXMudHJhbnNwb3J0LndyaXRhYmxlICYmICF0aGlzLnVwZ3JhZGluZyAmJiB0aGlzLndyaXRlQnVmZmVyLmxlbmd0aCl7ZGVidWcoJ2ZsdXNoaW5nICVkIHBhY2tldHMgaW4gc29ja2V0Jyx0aGlzLndyaXRlQnVmZmVyLmxlbmd0aCk7dGhpcy50cmFuc3BvcnQuc2VuZCh0aGlzLndyaXRlQnVmZmVyKTsgLy8ga2VlcCB0cmFjayBvZiBjdXJyZW50IGxlbmd0aCBvZiB3cml0ZUJ1ZmZlclxuLy8gc3BsaWNlIHdyaXRlQnVmZmVyIGFuZCBjYWxsYmFja0J1ZmZlciBvbiBgZHJhaW5gXG50aGlzLnByZXZCdWZmZXJMZW4gPSB0aGlzLndyaXRlQnVmZmVyLmxlbmd0aDt0aGlzLmVtaXQoJ2ZsdXNoJyk7fX07IC8qKlxuICogU2VuZHMgYSBtZXNzYWdlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5cbiAqIEByZXR1cm4ge1NvY2tldH0gZm9yIGNoYWluaW5nLlxuICogQGFwaSBwdWJsaWNcbiAqL1NvY2tldC5wcm90b3R5cGUud3JpdGUgPSBTb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihtc2csb3B0aW9ucyxmbil7dGhpcy5zZW5kUGFja2V0KCdtZXNzYWdlJyxtc2csb3B0aW9ucyxmbik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZW5kcyBhIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGFja2V0IHR5cGUuXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YS5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zLlxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgZnVuY3Rpb24uXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUuc2VuZFBhY2tldCA9IGZ1bmN0aW9uKHR5cGUsZGF0YSxvcHRpb25zLGZuKXtpZignZnVuY3Rpb24nID09IHR5cGVvZiBkYXRhKXtmbiA9IGRhdGE7ZGF0YSA9IHVuZGVmaW5lZDt9aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygb3B0aW9ucyl7Zm4gPSBvcHRpb25zO29wdGlvbnMgPSBudWxsO31pZignY2xvc2luZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdjbG9zZWQnID09IHRoaXMucmVhZHlTdGF0ZSl7cmV0dXJuO31vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtvcHRpb25zLmNvbXByZXNzID0gZmFsc2UgIT09IG9wdGlvbnMuY29tcHJlc3M7dmFyIHBhY2tldD17dHlwZTp0eXBlLGRhdGE6ZGF0YSxvcHRpb25zOm9wdGlvbnN9O3RoaXMuZW1pdCgncGFja2V0Q3JlYXRlJyxwYWNrZXQpO3RoaXMud3JpdGVCdWZmZXIucHVzaChwYWNrZXQpO2lmKGZuKXRoaXMub25jZSgnZmx1c2gnLGZuKTt0aGlzLmZsdXNoKCk7fTsgLyoqXG4gKiBDbG9zZXMgdGhlIGNvbm5lY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtpZignb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe3RoaXMucmVhZHlTdGF0ZSA9ICdjbG9zaW5nJzt2YXIgc2VsZj10aGlzO2lmKHRoaXMud3JpdGVCdWZmZXIubGVuZ3RoKXt0aGlzLm9uY2UoJ2RyYWluJyxmdW5jdGlvbigpe2lmKHRoaXMudXBncmFkaW5nKXt3YWl0Rm9yVXBncmFkZSgpO31lbHNlIHtjbG9zZSgpO319KTt9ZWxzZSBpZih0aGlzLnVwZ3JhZGluZyl7d2FpdEZvclVwZ3JhZGUoKTt9ZWxzZSB7Y2xvc2UoKTt9fWZ1bmN0aW9uIGNsb3NlKCl7c2VsZi5vbkNsb3NlKCdmb3JjZWQgY2xvc2UnKTtkZWJ1Zygnc29ja2V0IGNsb3NpbmcgLSB0ZWxsaW5nIHRyYW5zcG9ydCB0byBjbG9zZScpO3NlbGYudHJhbnNwb3J0LmNsb3NlKCk7fWZ1bmN0aW9uIGNsZWFudXBBbmRDbG9zZSgpe3NlbGYucmVtb3ZlTGlzdGVuZXIoJ3VwZ3JhZGUnLGNsZWFudXBBbmRDbG9zZSk7c2VsZi5yZW1vdmVMaXN0ZW5lcigndXBncmFkZUVycm9yJyxjbGVhbnVwQW5kQ2xvc2UpO2Nsb3NlKCk7fWZ1bmN0aW9uIHdhaXRGb3JVcGdyYWRlKCl7IC8vIHdhaXQgZm9yIHVwZ3JhZGUgdG8gZmluaXNoIHNpbmNlIHdlIGNhbid0IHNlbmQgcGFja2V0cyB3aGlsZSBwYXVzaW5nIGEgdHJhbnNwb3J0XG5zZWxmLm9uY2UoJ3VwZ3JhZGUnLGNsZWFudXBBbmRDbG9zZSk7c2VsZi5vbmNlKCd1cGdyYWRlRXJyb3InLGNsZWFudXBBbmRDbG9zZSk7fXJldHVybiB0aGlzO307IC8qKlxuICogQ2FsbGVkIHVwb24gdHJhbnNwb3J0IGVycm9yXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uRXJyb3IgPSBmdW5jdGlvbihlcnIpe2RlYnVnKCdzb2NrZXQgZXJyb3IgJWonLGVycik7U29ja2V0LnByaW9yV2Vic29ja2V0U3VjY2VzcyA9IGZhbHNlO3RoaXMuZW1pdCgnZXJyb3InLGVycik7dGhpcy5vbkNsb3NlKCd0cmFuc3BvcnQgZXJyb3InLGVycik7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiB0cmFuc3BvcnQgY2xvc2UuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbihyZWFzb24sZGVzYyl7aWYoJ29wZW5pbmcnID09IHRoaXMucmVhZHlTdGF0ZSB8fCAnb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdjbG9zaW5nJyA9PSB0aGlzLnJlYWR5U3RhdGUpe2RlYnVnKCdzb2NrZXQgY2xvc2Ugd2l0aCByZWFzb246IFwiJXNcIicscmVhc29uKTt2YXIgc2VsZj10aGlzOyAvLyBjbGVhciB0aW1lcnNcbmNsZWFyVGltZW91dCh0aGlzLnBpbmdJbnRlcnZhbFRpbWVyKTtjbGVhclRpbWVvdXQodGhpcy5waW5nVGltZW91dFRpbWVyKTsgLy8gc3RvcCBldmVudCBmcm9tIGZpcmluZyBhZ2FpbiBmb3IgdHJhbnNwb3J0XG50aGlzLnRyYW5zcG9ydC5yZW1vdmVBbGxMaXN0ZW5lcnMoJ2Nsb3NlJyk7IC8vIGVuc3VyZSB0cmFuc3BvcnQgd29uJ3Qgc3RheSBvcGVuXG50aGlzLnRyYW5zcG9ydC5jbG9zZSgpOyAvLyBpZ25vcmUgZnVydGhlciB0cmFuc3BvcnQgY29tbXVuaWNhdGlvblxudGhpcy50cmFuc3BvcnQucmVtb3ZlQWxsTGlzdGVuZXJzKCk7IC8vIHNldCByZWFkeSBzdGF0ZVxudGhpcy5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7IC8vIGNsZWFyIHNlc3Npb24gaWRcbnRoaXMuaWQgPSBudWxsOyAvLyBlbWl0IGNsb3NlIGV2ZW50XG50aGlzLmVtaXQoJ2Nsb3NlJyxyZWFzb24sZGVzYyk7IC8vIGNsZWFuIGJ1ZmZlcnMgYWZ0ZXIsIHNvIHVzZXJzIGNhbiBzdGlsbFxuLy8gZ3JhYiB0aGUgYnVmZmVycyBvbiBgY2xvc2VgIGV2ZW50XG5zZWxmLndyaXRlQnVmZmVyID0gW107c2VsZi5wcmV2QnVmZmVyTGVuID0gMDt9fTsgLyoqXG4gKiBGaWx0ZXJzIHVwZ3JhZGVzLCByZXR1cm5pbmcgb25seSB0aG9zZSBtYXRjaGluZyBjbGllbnQgdHJhbnNwb3J0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBzZXJ2ZXIgdXBncmFkZXNcbiAqIEBhcGkgcHJpdmF0ZVxuICpcbiAqL1NvY2tldC5wcm90b3R5cGUuZmlsdGVyVXBncmFkZXMgPSBmdW5jdGlvbih1cGdyYWRlcyl7dmFyIGZpbHRlcmVkVXBncmFkZXM9W107Zm9yKHZhciBpPTAsaj11cGdyYWRlcy5sZW5ndGg7aSA8IGo7aSsrKSB7aWYofmluZGV4KHRoaXMudHJhbnNwb3J0cyx1cGdyYWRlc1tpXSkpZmlsdGVyZWRVcGdyYWRlcy5wdXNoKHVwZ3JhZGVzW2ldKTt9cmV0dXJuIGZpbHRlcmVkVXBncmFkZXM7fTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCIuL3RyYW5zcG9ydFwiOjQsXCIuL3RyYW5zcG9ydHNcIjo1LFwiY29tcG9uZW50LWVtaXR0ZXJcIjoxNSxcImRlYnVnXCI6MTcsXCJlbmdpbmUuaW8tcGFyc2VyXCI6MTksXCJpbmRleG9mXCI6MjMsXCJwYXJzZWpzb25cIjoyNixcInBhcnNlcXNcIjoyNyxcInBhcnNldXJpXCI6Mjh9XSw0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIHBhcnNlcj1fZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7dmFyIEVtaXR0ZXI9X2RlcmVxXygnY29tcG9uZW50LWVtaXR0ZXInKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gVHJhbnNwb3J0OyAvKipcbiAqIFRyYW5zcG9ydCBhYnN0cmFjdCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9ucy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gVHJhbnNwb3J0KG9wdHMpe3RoaXMucGF0aCA9IG9wdHMucGF0aDt0aGlzLmhvc3RuYW1lID0gb3B0cy5ob3N0bmFtZTt0aGlzLnBvcnQgPSBvcHRzLnBvcnQ7dGhpcy5zZWN1cmUgPSBvcHRzLnNlY3VyZTt0aGlzLnF1ZXJ5ID0gb3B0cy5xdWVyeTt0aGlzLnRpbWVzdGFtcFBhcmFtID0gb3B0cy50aW1lc3RhbXBQYXJhbTt0aGlzLnRpbWVzdGFtcFJlcXVlc3RzID0gb3B0cy50aW1lc3RhbXBSZXF1ZXN0czt0aGlzLnJlYWR5U3RhdGUgPSAnJzt0aGlzLmFnZW50ID0gb3B0cy5hZ2VudCB8fCBmYWxzZTt0aGlzLnNvY2tldCA9IG9wdHMuc29ja2V0O3RoaXMuZW5hYmxlc1hEUiA9IG9wdHMuZW5hYmxlc1hEUjsgLy8gU1NMIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG50aGlzLnBmeCA9IG9wdHMucGZ4O3RoaXMua2V5ID0gb3B0cy5rZXk7dGhpcy5wYXNzcGhyYXNlID0gb3B0cy5wYXNzcGhyYXNlO3RoaXMuY2VydCA9IG9wdHMuY2VydDt0aGlzLmNhID0gb3B0cy5jYTt0aGlzLmNpcGhlcnMgPSBvcHRzLmNpcGhlcnM7dGhpcy5yZWplY3RVbmF1dGhvcml6ZWQgPSBvcHRzLnJlamVjdFVuYXV0aG9yaXplZDsgLy8gb3RoZXIgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbnRoaXMuZXh0cmFIZWFkZXJzID0gb3B0cy5leHRyYUhlYWRlcnM7fSAvKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9FbWl0dGVyKFRyYW5zcG9ydC5wcm90b3R5cGUpOyAvKipcbiAqIEVtaXRzIGFuIGVycm9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1RyYW5zcG9ydH0gZm9yIGNoYWluaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovVHJhbnNwb3J0LnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24obXNnLGRlc2Mpe3ZhciBlcnI9bmV3IEVycm9yKG1zZyk7ZXJyLnR5cGUgPSAnVHJhbnNwb3J0RXJyb3InO2Vyci5kZXNjcmlwdGlvbiA9IGRlc2M7dGhpcy5lbWl0KCdlcnJvcicsZXJyKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIE9wZW5zIHRoZSB0cmFuc3BvcnQuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUub3BlbiA9IGZ1bmN0aW9uKCl7aWYoJ2Nsb3NlZCcgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICcnID09IHRoaXMucmVhZHlTdGF0ZSl7dGhpcy5yZWFkeVN0YXRlID0gJ29wZW5pbmcnO3RoaXMuZG9PcGVuKCk7fXJldHVybiB0aGlzO307IC8qKlxuICogQ2xvc2VzIHRoZSB0cmFuc3BvcnQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9UcmFuc3BvcnQucHJvdG90eXBlLmNsb3NlID0gZnVuY3Rpb24oKXtpZignb3BlbmluZycgPT0gdGhpcy5yZWFkeVN0YXRlIHx8ICdvcGVuJyA9PSB0aGlzLnJlYWR5U3RhdGUpe3RoaXMuZG9DbG9zZSgpO3RoaXMub25DbG9zZSgpO31yZXR1cm4gdGhpczt9OyAvKipcbiAqIFNlbmRzIG11bHRpcGxlIHBhY2tldHMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFja2V0c1xuICogQGFwaSBwcml2YXRlXG4gKi9UcmFuc3BvcnQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbihwYWNrZXRzKXtpZignb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKXt0aGlzLndyaXRlKHBhY2tldHMpO31lbHNlIHt0aHJvdyBuZXcgRXJyb3IoJ1RyYW5zcG9ydCBub3Qgb3BlbicpO319OyAvKipcbiAqIENhbGxlZCB1cG9uIG9wZW5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUub25PcGVuID0gZnVuY3Rpb24oKXt0aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7dGhpcy53cml0YWJsZSA9IHRydWU7dGhpcy5lbWl0KCdvcGVuJyk7fTsgLyoqXG4gKiBDYWxsZWQgd2l0aCBkYXRhLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhXG4gKiBAYXBpIHByaXZhdGVcbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24oZGF0YSl7dmFyIHBhY2tldD1wYXJzZXIuZGVjb2RlUGFja2V0KGRhdGEsdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSk7dGhpcy5vblBhY2tldChwYWNrZXQpO307IC8qKlxuICogQ2FsbGVkIHdpdGggYSBkZWNvZGVkIHBhY2tldC5cbiAqL1RyYW5zcG9ydC5wcm90b3R5cGUub25QYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe3RoaXMuZW1pdCgncGFja2V0JyxwYWNrZXQpO307IC8qKlxuICogQ2FsbGVkIHVwb24gY2xvc2UuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9UcmFuc3BvcnQucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbigpe3RoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnO3RoaXMuZW1pdCgnY2xvc2UnKTt9O30se1wiY29tcG9uZW50LWVtaXR0ZXJcIjoxNSxcImVuZ2luZS5pby1wYXJzZXJcIjoxOX1dLDU6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXNcbiAqL3ZhciBYTUxIdHRwUmVxdWVzdD1fZGVyZXFfKCd4bWxodHRwcmVxdWVzdC1zc2wnKTt2YXIgWEhSPV9kZXJlcV8oJy4vcG9sbGluZy14aHInKTt2YXIgSlNPTlA9X2RlcmVxXygnLi9wb2xsaW5nLWpzb25wJyk7dmFyIHdlYnNvY2tldD1fZGVyZXFfKCcuL3dlYnNvY2tldCcpOyAvKipcbiAqIEV4cG9ydCB0cmFuc3BvcnRzLlxuICovZXhwb3J0cy5wb2xsaW5nID0gcG9sbGluZztleHBvcnRzLndlYnNvY2tldCA9IHdlYnNvY2tldDsgLyoqXG4gKiBQb2xsaW5nIHRyYW5zcG9ydCBwb2x5bW9ycGhpYyBjb25zdHJ1Y3Rvci5cbiAqIERlY2lkZXMgb24geGhyIHZzIGpzb25wIGJhc2VkIG9uIGZlYXR1cmUgZGV0ZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gcG9sbGluZyhvcHRzKXt2YXIgeGhyO3ZhciB4ZD1mYWxzZTt2YXIgeHM9ZmFsc2U7dmFyIGpzb25wPWZhbHNlICE9PSBvcHRzLmpzb25wO2lmKGdsb2JhbC5sb2NhdGlvbil7dmFyIGlzU1NMPSdodHRwczonID09IGxvY2F0aW9uLnByb3RvY29sO3ZhciBwb3J0PWxvY2F0aW9uLnBvcnQ7IC8vIHNvbWUgdXNlciBhZ2VudHMgaGF2ZSBlbXB0eSBgbG9jYXRpb24ucG9ydGBcbmlmKCFwb3J0KXtwb3J0ID0gaXNTU0w/NDQzOjgwO314ZCA9IG9wdHMuaG9zdG5hbWUgIT0gbG9jYXRpb24uaG9zdG5hbWUgfHwgcG9ydCAhPSBvcHRzLnBvcnQ7eHMgPSBvcHRzLnNlY3VyZSAhPSBpc1NTTDt9b3B0cy54ZG9tYWluID0geGQ7b3B0cy54c2NoZW1lID0geHM7eGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KG9wdHMpO2lmKCdvcGVuJyBpbiB4aHIgJiYgIW9wdHMuZm9yY2VKU09OUCl7cmV0dXJuIG5ldyBYSFIob3B0cyk7fWVsc2Uge2lmKCFqc29ucCl0aHJvdyBuZXcgRXJyb3IoJ0pTT05QIGRpc2FibGVkJyk7cmV0dXJuIG5ldyBKU09OUChvcHRzKTt9fX0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcIi4vcG9sbGluZy1qc29ucFwiOjYsXCIuL3BvbGxpbmcteGhyXCI6NyxcIi4vd2Vic29ja2V0XCI6OSxcInhtbGh0dHByZXF1ZXN0LXNzbFwiOjEwfV0sNjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogTW9kdWxlIHJlcXVpcmVtZW50cy5cbiAqL3ZhciBQb2xsaW5nPV9kZXJlcV8oJy4vcG9sbGluZycpO3ZhciBpbmhlcml0PV9kZXJlcV8oJ2NvbXBvbmVudC1pbmhlcml0Jyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IEpTT05QUG9sbGluZzsgLyoqXG4gKiBDYWNoZWQgcmVndWxhciBleHByZXNzaW9ucy5cbiAqL3ZhciByTmV3bGluZT0vXFxuL2c7dmFyIHJFc2NhcGVkTmV3bGluZT0vXFxcXG4vZzsgLyoqXG4gKiBHbG9iYWwgSlNPTlAgY2FsbGJhY2tzLlxuICovdmFyIGNhbGxiYWNrczsgLyoqXG4gKiBDYWxsYmFja3MgY291bnQuXG4gKi92YXIgaW5kZXg9MDsgLyoqXG4gKiBOb29wLlxuICovZnVuY3Rpb24gZW1wdHkoKXt9IC8qKlxuICogSlNPTlAgUG9sbGluZyBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0cy5cbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBKU09OUFBvbGxpbmcob3B0cyl7UG9sbGluZy5jYWxsKHRoaXMsb3B0cyk7dGhpcy5xdWVyeSA9IHRoaXMucXVlcnkgfHwge307IC8vIGRlZmluZSBnbG9iYWwgY2FsbGJhY2tzIGFycmF5IGlmIG5vdCBwcmVzZW50XG4vLyB3ZSBkbyB0aGlzIGhlcmUgKGxhemlseSkgdG8gYXZvaWQgdW5uZWVkZWQgZ2xvYmFsIHBvbGx1dGlvblxuaWYoIWNhbGxiYWNrcyl7IC8vIHdlIG5lZWQgdG8gY29uc2lkZXIgbXVsdGlwbGUgZW5naW5lcyBpbiB0aGUgc2FtZSBwYWdlXG5pZighZ2xvYmFsLl9fX2VpbylnbG9iYWwuX19fZWlvID0gW107Y2FsbGJhY2tzID0gZ2xvYmFsLl9fX2Vpbzt9IC8vIGNhbGxiYWNrIGlkZW50aWZpZXJcbnRoaXMuaW5kZXggPSBjYWxsYmFja3MubGVuZ3RoOyAvLyBhZGQgY2FsbGJhY2sgdG8ganNvbnAgZ2xvYmFsXG52YXIgc2VsZj10aGlzO2NhbGxiYWNrcy5wdXNoKGZ1bmN0aW9uKG1zZyl7c2VsZi5vbkRhdGEobXNnKTt9KTsgLy8gYXBwZW5kIHRvIHF1ZXJ5IHN0cmluZ1xudGhpcy5xdWVyeS5qID0gdGhpcy5pbmRleDsgLy8gcHJldmVudCBzcHVyaW91cyBlcnJvcnMgZnJvbSBiZWluZyBlbWl0dGVkIHdoZW4gdGhlIHdpbmRvdyBpcyB1bmxvYWRlZFxuaWYoZ2xvYmFsLmRvY3VtZW50ICYmIGdsb2JhbC5hZGRFdmVudExpc3RlbmVyKXtnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJyxmdW5jdGlvbigpe2lmKHNlbGYuc2NyaXB0KXNlbGYuc2NyaXB0Lm9uZXJyb3IgPSBlbXB0eTt9LGZhbHNlKTt9fSAvKipcbiAqIEluaGVyaXRzIGZyb20gUG9sbGluZy5cbiAqL2luaGVyaXQoSlNPTlBQb2xsaW5nLFBvbGxpbmcpOyAvKlxuICogSlNPTlAgb25seSBzdXBwb3J0cyBiaW5hcnkgYXMgYmFzZTY0IGVuY29kZWQgc3RyaW5nc1xuICovSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlOyAvKipcbiAqIENsb3NlcyB0aGUgc29ja2V0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovSlNPTlBQb2xsaW5nLnByb3RvdHlwZS5kb0Nsb3NlID0gZnVuY3Rpb24oKXtpZih0aGlzLnNjcmlwdCl7dGhpcy5zY3JpcHQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCh0aGlzLnNjcmlwdCk7dGhpcy5zY3JpcHQgPSBudWxsO31pZih0aGlzLmZvcm0pe3RoaXMuZm9ybS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZm9ybSk7dGhpcy5mb3JtID0gbnVsbDt0aGlzLmlmcmFtZSA9IG51bGw7fVBvbGxpbmcucHJvdG90eXBlLmRvQ2xvc2UuY2FsbCh0aGlzKTt9OyAvKipcbiAqIFN0YXJ0cyBhIHBvbGwgY3ljbGUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9KU09OUFBvbGxpbmcucHJvdG90eXBlLmRvUG9sbCA9IGZ1bmN0aW9uKCl7dmFyIHNlbGY9dGhpczt2YXIgc2NyaXB0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO2lmKHRoaXMuc2NyaXB0KXt0aGlzLnNjcmlwdC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuc2NyaXB0KTt0aGlzLnNjcmlwdCA9IG51bGw7fXNjcmlwdC5hc3luYyA9IHRydWU7c2NyaXB0LnNyYyA9IHRoaXMudXJpKCk7c2NyaXB0Lm9uZXJyb3IgPSBmdW5jdGlvbihlKXtzZWxmLm9uRXJyb3IoJ2pzb25wIHBvbGwgZXJyb3InLGUpO307dmFyIGluc2VydEF0PWRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKVswXTtpZihpbnNlcnRBdCl7aW5zZXJ0QXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoc2NyaXB0LGluc2VydEF0KTt9ZWxzZSB7KGRvY3VtZW50LmhlYWQgfHwgZG9jdW1lbnQuYm9keSkuYXBwZW5kQ2hpbGQoc2NyaXB0KTt9dGhpcy5zY3JpcHQgPSBzY3JpcHQ7dmFyIGlzVUFnZWNrbz0ndW5kZWZpbmVkJyAhPSB0eXBlb2YgbmF2aWdhdG9yICYmIC9nZWNrby9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7aWYoaXNVQWdlY2tvKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIGlmcmFtZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdpZnJhbWUnKTtkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGlmcmFtZSk7ZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChpZnJhbWUpO30sMTAwKTt9fTsgLyoqXG4gKiBXcml0ZXMgd2l0aCBhIGhpZGRlbiBpZnJhbWUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgdG8gc2VuZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGVkIHVwb24gZmx1c2guXG4gKiBAYXBpIHByaXZhdGVcbiAqL0pTT05QUG9sbGluZy5wcm90b3R5cGUuZG9Xcml0ZSA9IGZ1bmN0aW9uKGRhdGEsZm4pe3ZhciBzZWxmPXRoaXM7aWYoIXRoaXMuZm9ybSl7dmFyIGZvcm09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZm9ybScpO3ZhciBhcmVhPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7dmFyIGlkPXRoaXMuaWZyYW1lSWQgPSAnZWlvX2lmcmFtZV8nICsgdGhpcy5pbmRleDt2YXIgaWZyYW1lO2Zvcm0uY2xhc3NOYW1lID0gJ3NvY2tldGlvJztmb3JtLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztmb3JtLnN0eWxlLnRvcCA9ICctMTAwMHB4Jztmb3JtLnN0eWxlLmxlZnQgPSAnLTEwMDBweCc7Zm9ybS50YXJnZXQgPSBpZDtmb3JtLm1ldGhvZCA9ICdQT1NUJztmb3JtLnNldEF0dHJpYnV0ZSgnYWNjZXB0LWNoYXJzZXQnLCd1dGYtOCcpO2FyZWEubmFtZSA9ICdkJztmb3JtLmFwcGVuZENoaWxkKGFyZWEpO2RvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZm9ybSk7dGhpcy5mb3JtID0gZm9ybTt0aGlzLmFyZWEgPSBhcmVhO310aGlzLmZvcm0uYWN0aW9uID0gdGhpcy51cmkoKTtmdW5jdGlvbiBjb21wbGV0ZSgpe2luaXRJZnJhbWUoKTtmbigpO31mdW5jdGlvbiBpbml0SWZyYW1lKCl7aWYoc2VsZi5pZnJhbWUpe3RyeXtzZWxmLmZvcm0ucmVtb3ZlQ2hpbGQoc2VsZi5pZnJhbWUpO31jYXRjaChlKSB7c2VsZi5vbkVycm9yKCdqc29ucCBwb2xsaW5nIGlmcmFtZSByZW1vdmFsIGVycm9yJyxlKTt9fXRyeXsgLy8gaWU2IGR5bmFtaWMgaWZyYW1lcyB3aXRoIHRhcmdldD1cIlwiIHN1cHBvcnQgKHRoYW5rcyBDaHJpcyBMYW1iYWNoZXIpXG52YXIgaHRtbD0nPGlmcmFtZSBzcmM9XCJqYXZhc2NyaXB0OjBcIiBuYW1lPVwiJyArIHNlbGYuaWZyYW1lSWQgKyAnXCI+JztpZnJhbWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KGh0bWwpO31jYXRjaChlKSB7aWZyYW1lID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaWZyYW1lJyk7aWZyYW1lLm5hbWUgPSBzZWxmLmlmcmFtZUlkO2lmcmFtZS5zcmMgPSAnamF2YXNjcmlwdDowJzt9aWZyYW1lLmlkID0gc2VsZi5pZnJhbWVJZDtzZWxmLmZvcm0uYXBwZW5kQ2hpbGQoaWZyYW1lKTtzZWxmLmlmcmFtZSA9IGlmcmFtZTt9aW5pdElmcmFtZSgpOyAvLyBlc2NhcGUgXFxuIHRvIHByZXZlbnQgaXQgZnJvbSBiZWluZyBjb252ZXJ0ZWQgaW50byBcXHJcXG4gYnkgc29tZSBVQXNcbi8vIGRvdWJsZSBlc2NhcGluZyBpcyByZXF1aXJlZCBmb3IgZXNjYXBlZCBuZXcgbGluZXMgYmVjYXVzZSB1bmVzY2FwaW5nIG9mIG5ldyBsaW5lcyBjYW4gYmUgZG9uZSBzYWZlbHkgb24gc2VydmVyLXNpZGVcbmRhdGEgPSBkYXRhLnJlcGxhY2UockVzY2FwZWROZXdsaW5lLCdcXFxcXFxuJyk7dGhpcy5hcmVhLnZhbHVlID0gZGF0YS5yZXBsYWNlKHJOZXdsaW5lLCdcXFxcbicpO3RyeXt0aGlzLmZvcm0uc3VibWl0KCk7fWNhdGNoKGUpIHt9aWYodGhpcy5pZnJhbWUuYXR0YWNoRXZlbnQpe3RoaXMuaWZyYW1lLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCl7aWYoc2VsZi5pZnJhbWUucmVhZHlTdGF0ZSA9PSAnY29tcGxldGUnKXtjb21wbGV0ZSgpO319O31lbHNlIHt0aGlzLmlmcmFtZS5vbmxvYWQgPSBjb21wbGV0ZTt9fTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCIuL3BvbGxpbmdcIjo4LFwiY29tcG9uZW50LWluaGVyaXRcIjoxNn1dLDc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIE1vZHVsZSByZXF1aXJlbWVudHMuXG4gKi92YXIgWE1MSHR0cFJlcXVlc3Q9X2RlcmVxXygneG1saHR0cHJlcXVlc3Qtc3NsJyk7dmFyIFBvbGxpbmc9X2RlcmVxXygnLi9wb2xsaW5nJyk7dmFyIEVtaXR0ZXI9X2RlcmVxXygnY29tcG9uZW50LWVtaXR0ZXInKTt2YXIgaW5oZXJpdD1fZGVyZXFfKCdjb21wb25lbnQtaW5oZXJpdCcpO3ZhciBkZWJ1Zz1fZGVyZXFfKCdkZWJ1ZycpKCdlbmdpbmUuaW8tY2xpZW50OnBvbGxpbmcteGhyJyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IFhIUjttb2R1bGUuZXhwb3J0cy5SZXF1ZXN0ID0gUmVxdWVzdDsgLyoqXG4gKiBFbXB0eSBmdW5jdGlvblxuICovZnVuY3Rpb24gZW1wdHkoKXt9IC8qKlxuICogWEhSIFBvbGxpbmcgY29uc3RydWN0b3IuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBYSFIob3B0cyl7UG9sbGluZy5jYWxsKHRoaXMsb3B0cyk7aWYoZ2xvYmFsLmxvY2F0aW9uKXt2YXIgaXNTU0w9J2h0dHBzOicgPT0gbG9jYXRpb24ucHJvdG9jb2w7dmFyIHBvcnQ9bG9jYXRpb24ucG9ydDsgLy8gc29tZSB1c2VyIGFnZW50cyBoYXZlIGVtcHR5IGBsb2NhdGlvbi5wb3J0YFxuaWYoIXBvcnQpe3BvcnQgPSBpc1NTTD80NDM6ODA7fXRoaXMueGQgPSBvcHRzLmhvc3RuYW1lICE9IGdsb2JhbC5sb2NhdGlvbi5ob3N0bmFtZSB8fCBwb3J0ICE9IG9wdHMucG9ydDt0aGlzLnhzID0gb3B0cy5zZWN1cmUgIT0gaXNTU0w7fWVsc2Uge3RoaXMuZXh0cmFIZWFkZXJzID0gb3B0cy5leHRyYUhlYWRlcnM7fX0gLyoqXG4gKiBJbmhlcml0cyBmcm9tIFBvbGxpbmcuXG4gKi9pbmhlcml0KFhIUixQb2xsaW5nKTsgLyoqXG4gKiBYSFIgc3VwcG9ydHMgYmluYXJ5XG4gKi9YSFIucHJvdG90eXBlLnN1cHBvcnRzQmluYXJ5ID0gdHJ1ZTsgLyoqXG4gKiBDcmVhdGVzIGEgcmVxdWVzdC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAYXBpIHByaXZhdGVcbiAqL1hIUi5wcm90b3R5cGUucmVxdWVzdCA9IGZ1bmN0aW9uKG9wdHMpe29wdHMgPSBvcHRzIHx8IHt9O29wdHMudXJpID0gdGhpcy51cmkoKTtvcHRzLnhkID0gdGhpcy54ZDtvcHRzLnhzID0gdGhpcy54cztvcHRzLmFnZW50ID0gdGhpcy5hZ2VudCB8fCBmYWxzZTtvcHRzLnN1cHBvcnRzQmluYXJ5ID0gdGhpcy5zdXBwb3J0c0JpbmFyeTtvcHRzLmVuYWJsZXNYRFIgPSB0aGlzLmVuYWJsZXNYRFI7IC8vIFNTTCBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxub3B0cy5wZnggPSB0aGlzLnBmeDtvcHRzLmtleSA9IHRoaXMua2V5O29wdHMucGFzc3BocmFzZSA9IHRoaXMucGFzc3BocmFzZTtvcHRzLmNlcnQgPSB0aGlzLmNlcnQ7b3B0cy5jYSA9IHRoaXMuY2E7b3B0cy5jaXBoZXJzID0gdGhpcy5jaXBoZXJzO29wdHMucmVqZWN0VW5hdXRob3JpemVkID0gdGhpcy5yZWplY3RVbmF1dGhvcml6ZWQ7IC8vIG90aGVyIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG5vcHRzLmV4dHJhSGVhZGVycyA9IHRoaXMuZXh0cmFIZWFkZXJzO3JldHVybiBuZXcgUmVxdWVzdChvcHRzKTt9OyAvKipcbiAqIFNlbmRzIGRhdGEuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGRhdGEgdG8gc2VuZC5cbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxlZCB1cG9uIGZsdXNoLlxuICogQGFwaSBwcml2YXRlXG4gKi9YSFIucHJvdG90eXBlLmRvV3JpdGUgPSBmdW5jdGlvbihkYXRhLGZuKXt2YXIgaXNCaW5hcnk9dHlwZW9mIGRhdGEgIT09ICdzdHJpbmcnICYmIGRhdGEgIT09IHVuZGVmaW5lZDt2YXIgcmVxPXRoaXMucmVxdWVzdCh7bWV0aG9kOidQT1NUJyxkYXRhOmRhdGEsaXNCaW5hcnk6aXNCaW5hcnl9KTt2YXIgc2VsZj10aGlzO3JlcS5vbignc3VjY2VzcycsZm4pO3JlcS5vbignZXJyb3InLGZ1bmN0aW9uKGVycil7c2VsZi5vbkVycm9yKCd4aHIgcG9zdCBlcnJvcicsZXJyKTt9KTt0aGlzLnNlbmRYaHIgPSByZXE7fTsgLyoqXG4gKiBTdGFydHMgYSBwb2xsIGN5Y2xlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovWEhSLnByb3RvdHlwZS5kb1BvbGwgPSBmdW5jdGlvbigpe2RlYnVnKCd4aHIgcG9sbCcpO3ZhciByZXE9dGhpcy5yZXF1ZXN0KCk7dmFyIHNlbGY9dGhpcztyZXEub24oJ2RhdGEnLGZ1bmN0aW9uKGRhdGEpe3NlbGYub25EYXRhKGRhdGEpO30pO3JlcS5vbignZXJyb3InLGZ1bmN0aW9uKGVycil7c2VsZi5vbkVycm9yKCd4aHIgcG9sbCBlcnJvcicsZXJyKTt9KTt0aGlzLnBvbGxYaHIgPSByZXE7fTsgLyoqXG4gKiBSZXF1ZXN0IGNvbnN0cnVjdG9yXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBSZXF1ZXN0KG9wdHMpe3RoaXMubWV0aG9kID0gb3B0cy5tZXRob2QgfHwgJ0dFVCc7dGhpcy51cmkgPSBvcHRzLnVyaTt0aGlzLnhkID0gISFvcHRzLnhkO3RoaXMueHMgPSAhIW9wdHMueHM7dGhpcy5hc3luYyA9IGZhbHNlICE9PSBvcHRzLmFzeW5jO3RoaXMuZGF0YSA9IHVuZGVmaW5lZCAhPSBvcHRzLmRhdGE/b3B0cy5kYXRhOm51bGw7dGhpcy5hZ2VudCA9IG9wdHMuYWdlbnQ7dGhpcy5pc0JpbmFyeSA9IG9wdHMuaXNCaW5hcnk7dGhpcy5zdXBwb3J0c0JpbmFyeSA9IG9wdHMuc3VwcG9ydHNCaW5hcnk7dGhpcy5lbmFibGVzWERSID0gb3B0cy5lbmFibGVzWERSOyAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbnRoaXMucGZ4ID0gb3B0cy5wZng7dGhpcy5rZXkgPSBvcHRzLmtleTt0aGlzLnBhc3NwaHJhc2UgPSBvcHRzLnBhc3NwaHJhc2U7dGhpcy5jZXJ0ID0gb3B0cy5jZXJ0O3RoaXMuY2EgPSBvcHRzLmNhO3RoaXMuY2lwaGVycyA9IG9wdHMuY2lwaGVyczt0aGlzLnJlamVjdFVuYXV0aG9yaXplZCA9IG9wdHMucmVqZWN0VW5hdXRob3JpemVkOyAvLyBvdGhlciBvcHRpb25zIGZvciBOb2RlLmpzIGNsaWVudFxudGhpcy5leHRyYUhlYWRlcnMgPSBvcHRzLmV4dHJhSGVhZGVyczt0aGlzLmNyZWF0ZSgpO30gLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgLlxuICovRW1pdHRlcihSZXF1ZXN0LnByb3RvdHlwZSk7IC8qKlxuICogQ3JlYXRlcyB0aGUgWEhSIG9iamVjdCBhbmQgc2VuZHMgdGhlIHJlcXVlc3QuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9SZXF1ZXN0LnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbigpe3ZhciBvcHRzPXthZ2VudDp0aGlzLmFnZW50LHhkb21haW46dGhpcy54ZCx4c2NoZW1lOnRoaXMueHMsZW5hYmxlc1hEUjp0aGlzLmVuYWJsZXNYRFJ9OyAvLyBTU0wgb3B0aW9ucyBmb3IgTm9kZS5qcyBjbGllbnRcbm9wdHMucGZ4ID0gdGhpcy5wZng7b3B0cy5rZXkgPSB0aGlzLmtleTtvcHRzLnBhc3NwaHJhc2UgPSB0aGlzLnBhc3NwaHJhc2U7b3B0cy5jZXJ0ID0gdGhpcy5jZXJ0O29wdHMuY2EgPSB0aGlzLmNhO29wdHMuY2lwaGVycyA9IHRoaXMuY2lwaGVycztvcHRzLnJlamVjdFVuYXV0aG9yaXplZCA9IHRoaXMucmVqZWN0VW5hdXRob3JpemVkO3ZhciB4aHI9dGhpcy54aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3Qob3B0cyk7dmFyIHNlbGY9dGhpczt0cnl7ZGVidWcoJ3hociBvcGVuICVzOiAlcycsdGhpcy5tZXRob2QsdGhpcy51cmkpO3hoci5vcGVuKHRoaXMubWV0aG9kLHRoaXMudXJpLHRoaXMuYXN5bmMpO3RyeXtpZih0aGlzLmV4dHJhSGVhZGVycyl7eGhyLnNldERpc2FibGVIZWFkZXJDaGVjayh0cnVlKTtmb3IodmFyIGkgaW4gdGhpcy5leHRyYUhlYWRlcnMpIHtpZih0aGlzLmV4dHJhSGVhZGVycy5oYXNPd25Qcm9wZXJ0eShpKSl7eGhyLnNldFJlcXVlc3RIZWFkZXIoaSx0aGlzLmV4dHJhSGVhZGVyc1tpXSk7fX19fWNhdGNoKGUpIHt9aWYodGhpcy5zdXBwb3J0c0JpbmFyeSl7IC8vIFRoaXMgaGFzIHRvIGJlIGRvbmUgYWZ0ZXIgb3BlbiBiZWNhdXNlIEZpcmVmb3ggaXMgc3R1cGlkXG4vLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzEzMjE2OTAzL2dldC1iaW5hcnktZGF0YS13aXRoLXhtbGh0dHByZXF1ZXN0LWluLWEtZmlyZWZveC1leHRlbnNpb25cbnhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO31pZignUE9TVCcgPT0gdGhpcy5tZXRob2Qpe3RyeXtpZih0aGlzLmlzQmluYXJ5KXt4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJyk7fWVsc2Uge3hoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LXR5cGUnLCd0ZXh0L3BsYWluO2NoYXJzZXQ9VVRGLTgnKTt9fWNhdGNoKGUpIHt9fSAvLyBpZTYgY2hlY2tcbmlmKCd3aXRoQ3JlZGVudGlhbHMnIGluIHhocil7eGhyLndpdGhDcmVkZW50aWFscyA9IHRydWU7fWlmKHRoaXMuaGFzWERSKCkpe3hoci5vbmxvYWQgPSBmdW5jdGlvbigpe3NlbGYub25Mb2FkKCk7fTt4aHIub25lcnJvciA9IGZ1bmN0aW9uKCl7c2VsZi5vbkVycm9yKHhoci5yZXNwb25zZVRleHQpO307fWVsc2Uge3hoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpe2lmKDQgIT0geGhyLnJlYWR5U3RhdGUpcmV0dXJuO2lmKDIwMCA9PSB4aHIuc3RhdHVzIHx8IDEyMjMgPT0geGhyLnN0YXR1cyl7c2VsZi5vbkxvYWQoKTt9ZWxzZSB7IC8vIG1ha2Ugc3VyZSB0aGUgYGVycm9yYCBldmVudCBoYW5kbGVyIHRoYXQncyB1c2VyLXNldFxuLy8gZG9lcyBub3QgdGhyb3cgaW4gdGhlIHNhbWUgdGljayBhbmQgZ2V0cyBjYXVnaHQgaGVyZVxuc2V0VGltZW91dChmdW5jdGlvbigpe3NlbGYub25FcnJvcih4aHIuc3RhdHVzKTt9LDApO319O31kZWJ1ZygneGhyIGRhdGEgJXMnLHRoaXMuZGF0YSk7eGhyLnNlbmQodGhpcy5kYXRhKTt9Y2F0Y2goZSkgeyAvLyBOZWVkIHRvIGRlZmVyIHNpbmNlIC5jcmVhdGUoKSBpcyBjYWxsZWQgZGlyZWN0bHkgZmhyb20gdGhlIGNvbnN0cnVjdG9yXG4vLyBhbmQgdGh1cyB0aGUgJ2Vycm9yJyBldmVudCBjYW4gb25seSBiZSBvbmx5IGJvdW5kICphZnRlciogdGhpcyBleGNlcHRpb25cbi8vIG9jY3Vycy4gIFRoZXJlZm9yZSwgYWxzbywgd2UgY2Fubm90IHRocm93IGhlcmUgYXQgYWxsLlxuc2V0VGltZW91dChmdW5jdGlvbigpe3NlbGYub25FcnJvcihlKTt9LDApO3JldHVybjt9aWYoZ2xvYmFsLmRvY3VtZW50KXt0aGlzLmluZGV4ID0gUmVxdWVzdC5yZXF1ZXN0c0NvdW50Kys7UmVxdWVzdC5yZXF1ZXN0c1t0aGlzLmluZGV4XSA9IHRoaXM7fX07IC8qKlxuICogQ2FsbGVkIHVwb24gc3VjY2Vzc2Z1bCByZXNwb25zZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLm9uU3VjY2VzcyA9IGZ1bmN0aW9uKCl7dGhpcy5lbWl0KCdzdWNjZXNzJyk7dGhpcy5jbGVhbnVwKCk7fTsgLyoqXG4gKiBDYWxsZWQgaWYgd2UgaGF2ZSBkYXRhLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUmVxdWVzdC5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24oZGF0YSl7dGhpcy5lbWl0KCdkYXRhJyxkYXRhKTt0aGlzLm9uU3VjY2VzcygpO307IC8qKlxuICogQ2FsbGVkIHVwb24gZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9SZXF1ZXN0LnByb3RvdHlwZS5vbkVycm9yID0gZnVuY3Rpb24oZXJyKXt0aGlzLmVtaXQoJ2Vycm9yJyxlcnIpO3RoaXMuY2xlYW51cCh0cnVlKTt9OyAvKipcbiAqIENsZWFucyB1cCBob3VzZS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLmNsZWFudXAgPSBmdW5jdGlvbihmcm9tRXJyb3Ipe2lmKCd1bmRlZmluZWQnID09IHR5cGVvZiB0aGlzLnhociB8fCBudWxsID09PSB0aGlzLnhocil7cmV0dXJuO30gLy8geG1saHR0cHJlcXVlc3RcbmlmKHRoaXMuaGFzWERSKCkpe3RoaXMueGhyLm9ubG9hZCA9IHRoaXMueGhyLm9uZXJyb3IgPSBlbXB0eTt9ZWxzZSB7dGhpcy54aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZW1wdHk7fWlmKGZyb21FcnJvcil7dHJ5e3RoaXMueGhyLmFib3J0KCk7fWNhdGNoKGUpIHt9fWlmKGdsb2JhbC5kb2N1bWVudCl7ZGVsZXRlIFJlcXVlc3QucmVxdWVzdHNbdGhpcy5pbmRleF07fXRoaXMueGhyID0gbnVsbDt9OyAvKipcbiAqIENhbGxlZCB1cG9uIGxvYWQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9SZXF1ZXN0LnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbigpe3ZhciBkYXRhO3RyeXt2YXIgY29udGVudFR5cGU7dHJ5e2NvbnRlbnRUeXBlID0gdGhpcy54aHIuZ2V0UmVzcG9uc2VIZWFkZXIoJ0NvbnRlbnQtVHlwZScpLnNwbGl0KCc7JylbMF07fWNhdGNoKGUpIHt9aWYoY29udGVudFR5cGUgPT09ICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nKXtkYXRhID0gdGhpcy54aHIucmVzcG9uc2U7fWVsc2Uge2lmKCF0aGlzLnN1cHBvcnRzQmluYXJ5KXtkYXRhID0gdGhpcy54aHIucmVzcG9uc2VUZXh0O31lbHNlIHt0cnl7ZGF0YSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxuZXcgVWludDhBcnJheSh0aGlzLnhoci5yZXNwb25zZSkpO31jYXRjaChlKSB7dmFyIHVpOEFycj1uZXcgVWludDhBcnJheSh0aGlzLnhoci5yZXNwb25zZSk7dmFyIGRhdGFBcnJheT1bXTtmb3IodmFyIGlkeD0wLGxlbmd0aD11aThBcnIubGVuZ3RoO2lkeCA8IGxlbmd0aDtpZHgrKykge2RhdGFBcnJheS5wdXNoKHVpOEFycltpZHhdKTt9ZGF0YSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxkYXRhQXJyYXkpO319fX1jYXRjaChlKSB7dGhpcy5vbkVycm9yKGUpO31pZihudWxsICE9IGRhdGEpe3RoaXMub25EYXRhKGRhdGEpO319OyAvKipcbiAqIENoZWNrIGlmIGl0IGhhcyBYRG9tYWluUmVxdWVzdC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1JlcXVlc3QucHJvdG90eXBlLmhhc1hEUiA9IGZ1bmN0aW9uKCl7cmV0dXJuICd1bmRlZmluZWQnICE9PSB0eXBlb2YgZ2xvYmFsLlhEb21haW5SZXF1ZXN0ICYmICF0aGlzLnhzICYmIHRoaXMuZW5hYmxlc1hEUjt9OyAvKipcbiAqIEFib3J0cyB0aGUgcmVxdWVzdC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovUmVxdWVzdC5wcm90b3R5cGUuYWJvcnQgPSBmdW5jdGlvbigpe3RoaXMuY2xlYW51cCgpO307IC8qKlxuICogQWJvcnRzIHBlbmRpbmcgcmVxdWVzdHMgd2hlbiB1bmxvYWRpbmcgdGhlIHdpbmRvdy4gVGhpcyBpcyBuZWVkZWQgdG8gcHJldmVudFxuICogbWVtb3J5IGxlYWtzIChlLmcuIHdoZW4gdXNpbmcgSUUpIGFuZCB0byBlbnN1cmUgdGhhdCBubyBzcHVyaW91cyBlcnJvciBpc1xuICogZW1pdHRlZC5cbiAqL2lmKGdsb2JhbC5kb2N1bWVudCl7UmVxdWVzdC5yZXF1ZXN0c0NvdW50ID0gMDtSZXF1ZXN0LnJlcXVlc3RzID0ge307aWYoZ2xvYmFsLmF0dGFjaEV2ZW50KXtnbG9iYWwuYXR0YWNoRXZlbnQoJ29udW5sb2FkJyx1bmxvYWRIYW5kbGVyKTt9ZWxzZSBpZihnbG9iYWwuYWRkRXZlbnRMaXN0ZW5lcil7Z2xvYmFsLmFkZEV2ZW50TGlzdGVuZXIoJ2JlZm9yZXVubG9hZCcsdW5sb2FkSGFuZGxlcixmYWxzZSk7fX1mdW5jdGlvbiB1bmxvYWRIYW5kbGVyKCl7Zm9yKHZhciBpIGluIFJlcXVlc3QucmVxdWVzdHMpIHtpZihSZXF1ZXN0LnJlcXVlc3RzLmhhc093blByb3BlcnR5KGkpKXtSZXF1ZXN0LnJlcXVlc3RzW2ldLmFib3J0KCk7fX19fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiLi9wb2xsaW5nXCI6OCxcImNvbXBvbmVudC1lbWl0dGVyXCI6MTUsXCJjb21wb25lbnQtaW5oZXJpdFwiOjE2LFwiZGVidWdcIjoxNyxcInhtbGh0dHByZXF1ZXN0LXNzbFwiOjEwfV0sODpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBUcmFuc3BvcnQ9X2RlcmVxXygnLi4vdHJhbnNwb3J0Jyk7dmFyIHBhcnNlcXM9X2RlcmVxXygncGFyc2VxcycpO3ZhciBwYXJzZXI9X2RlcmVxXygnZW5naW5lLmlvLXBhcnNlcicpO3ZhciBpbmhlcml0PV9kZXJlcV8oJ2NvbXBvbmVudC1pbmhlcml0Jyk7dmFyIHllYXN0PV9kZXJlcV8oJ3llYXN0Jyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ2VuZ2luZS5pby1jbGllbnQ6cG9sbGluZycpOyAvKipcbiAqIE1vZHVsZSBleHBvcnRzLlxuICovbW9kdWxlLmV4cG9ydHMgPSBQb2xsaW5nOyAvKipcbiAqIElzIFhIUjIgc3VwcG9ydGVkP1xuICovdmFyIGhhc1hIUjI9KGZ1bmN0aW9uKCl7dmFyIFhNTEh0dHBSZXF1ZXN0PV9kZXJlcV8oJ3htbGh0dHByZXF1ZXN0LXNzbCcpO3ZhciB4aHI9bmV3IFhNTEh0dHBSZXF1ZXN0KHt4ZG9tYWluOmZhbHNlfSk7cmV0dXJuIG51bGwgIT0geGhyLnJlc3BvbnNlVHlwZTt9KSgpOyAvKipcbiAqIFBvbGxpbmcgaW50ZXJmYWNlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIFBvbGxpbmcob3B0cyl7dmFyIGZvcmNlQmFzZTY0PW9wdHMgJiYgb3B0cy5mb3JjZUJhc2U2NDtpZighaGFzWEhSMiB8fCBmb3JjZUJhc2U2NCl7dGhpcy5zdXBwb3J0c0JpbmFyeSA9IGZhbHNlO31UcmFuc3BvcnQuY2FsbCh0aGlzLG9wdHMpO30gLyoqXG4gKiBJbmhlcml0cyBmcm9tIFRyYW5zcG9ydC5cbiAqL2luaGVyaXQoUG9sbGluZyxUcmFuc3BvcnQpOyAvKipcbiAqIFRyYW5zcG9ydCBuYW1lLlxuICovUG9sbGluZy5wcm90b3R5cGUubmFtZSA9ICdwb2xsaW5nJzsgLyoqXG4gKiBPcGVucyB0aGUgc29ja2V0ICh0cmlnZ2VycyBwb2xsaW5nKS4gV2Ugd3JpdGUgYSBQSU5HIG1lc3NhZ2UgdG8gZGV0ZXJtaW5lXG4gKiB3aGVuIHRoZSB0cmFuc3BvcnQgaXMgb3Blbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1BvbGxpbmcucHJvdG90eXBlLmRvT3BlbiA9IGZ1bmN0aW9uKCl7dGhpcy5wb2xsKCk7fTsgLyoqXG4gKiBQYXVzZXMgcG9sbGluZy5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayB1cG9uIGJ1ZmZlcnMgYXJlIGZsdXNoZWQgYW5kIHRyYW5zcG9ydCBpcyBwYXVzZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbihvblBhdXNlKXt2YXIgcGVuZGluZz0wO3ZhciBzZWxmPXRoaXM7dGhpcy5yZWFkeVN0YXRlID0gJ3BhdXNpbmcnO2Z1bmN0aW9uIHBhdXNlKCl7ZGVidWcoJ3BhdXNlZCcpO3NlbGYucmVhZHlTdGF0ZSA9ICdwYXVzZWQnO29uUGF1c2UoKTt9aWYodGhpcy5wb2xsaW5nIHx8ICF0aGlzLndyaXRhYmxlKXt2YXIgdG90YWw9MDtpZih0aGlzLnBvbGxpbmcpe2RlYnVnKCd3ZSBhcmUgY3VycmVudGx5IHBvbGxpbmcgLSB3YWl0aW5nIHRvIHBhdXNlJyk7dG90YWwrKzt0aGlzLm9uY2UoJ3BvbGxDb21wbGV0ZScsZnVuY3Rpb24oKXtkZWJ1ZygncHJlLXBhdXNlIHBvbGxpbmcgY29tcGxldGUnKTstLXRvdGFsIHx8IHBhdXNlKCk7fSk7fWlmKCF0aGlzLndyaXRhYmxlKXtkZWJ1Zygnd2UgYXJlIGN1cnJlbnRseSB3cml0aW5nIC0gd2FpdGluZyB0byBwYXVzZScpO3RvdGFsKys7dGhpcy5vbmNlKCdkcmFpbicsZnVuY3Rpb24oKXtkZWJ1ZygncHJlLXBhdXNlIHdyaXRpbmcgY29tcGxldGUnKTstLXRvdGFsIHx8IHBhdXNlKCk7fSk7fX1lbHNlIHtwYXVzZSgpO319OyAvKipcbiAqIFN0YXJ0cyBwb2xsaW5nIGN5Y2xlLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9Qb2xsaW5nLnByb3RvdHlwZS5wb2xsID0gZnVuY3Rpb24oKXtkZWJ1ZygncG9sbGluZycpO3RoaXMucG9sbGluZyA9IHRydWU7dGhpcy5kb1BvbGwoKTt0aGlzLmVtaXQoJ3BvbGwnKTt9OyAvKipcbiAqIE92ZXJsb2FkcyBvbkRhdGEgdG8gZGV0ZWN0IHBheWxvYWRzLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovUG9sbGluZy5wcm90b3R5cGUub25EYXRhID0gZnVuY3Rpb24oZGF0YSl7dmFyIHNlbGY9dGhpcztkZWJ1ZygncG9sbGluZyBnb3QgZGF0YSAlcycsZGF0YSk7dmFyIGNhbGxiYWNrPWZ1bmN0aW9uIGNhbGxiYWNrKHBhY2tldCxpbmRleCx0b3RhbCl7IC8vIGlmIGl0cyB0aGUgZmlyc3QgbWVzc2FnZSB3ZSBjb25zaWRlciB0aGUgdHJhbnNwb3J0IG9wZW5cbmlmKCdvcGVuaW5nJyA9PSBzZWxmLnJlYWR5U3RhdGUpe3NlbGYub25PcGVuKCk7fSAvLyBpZiBpdHMgYSBjbG9zZSBwYWNrZXQsIHdlIGNsb3NlIHRoZSBvbmdvaW5nIHJlcXVlc3RzXG5pZignY2xvc2UnID09IHBhY2tldC50eXBlKXtzZWxmLm9uQ2xvc2UoKTtyZXR1cm4gZmFsc2U7fSAvLyBvdGhlcndpc2UgYnlwYXNzIG9uRGF0YSBhbmQgaGFuZGxlIHRoZSBtZXNzYWdlXG5zZWxmLm9uUGFja2V0KHBhY2tldCk7fTsgLy8gZGVjb2RlIHBheWxvYWRcbnBhcnNlci5kZWNvZGVQYXlsb2FkKGRhdGEsdGhpcy5zb2NrZXQuYmluYXJ5VHlwZSxjYWxsYmFjayk7IC8vIGlmIGFuIGV2ZW50IGRpZCBub3QgdHJpZ2dlciBjbG9zaW5nXG5pZignY2xvc2VkJyAhPSB0aGlzLnJlYWR5U3RhdGUpeyAvLyBpZiB3ZSBnb3QgZGF0YSB3ZSdyZSBub3QgcG9sbGluZ1xudGhpcy5wb2xsaW5nID0gZmFsc2U7dGhpcy5lbWl0KCdwb2xsQ29tcGxldGUnKTtpZignb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKXt0aGlzLnBvbGwoKTt9ZWxzZSB7ZGVidWcoJ2lnbm9yaW5nIHBvbGwgLSB0cmFuc3BvcnQgc3RhdGUgXCIlc1wiJyx0aGlzLnJlYWR5U3RhdGUpO319fTsgLyoqXG4gKiBGb3IgcG9sbGluZywgc2VuZCBhIGNsb3NlIHBhY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1BvbGxpbmcucHJvdG90eXBlLmRvQ2xvc2UgPSBmdW5jdGlvbigpe3ZhciBzZWxmPXRoaXM7ZnVuY3Rpb24gY2xvc2UoKXtkZWJ1Zygnd3JpdGluZyBjbG9zZSBwYWNrZXQnKTtzZWxmLndyaXRlKFt7dHlwZTonY2xvc2UnfV0pO31pZignb3BlbicgPT0gdGhpcy5yZWFkeVN0YXRlKXtkZWJ1ZygndHJhbnNwb3J0IG9wZW4gLSBjbG9zaW5nJyk7Y2xvc2UoKTt9ZWxzZSB7IC8vIGluIGNhc2Ugd2UncmUgdHJ5aW5nIHRvIGNsb3NlIHdoaWxlXG4vLyBoYW5kc2hha2luZyBpcyBpbiBwcm9ncmVzcyAoR0gtMTY0KVxuZGVidWcoJ3RyYW5zcG9ydCBub3Qgb3BlbiAtIGRlZmVycmluZyBjbG9zZScpO3RoaXMub25jZSgnb3BlbicsY2xvc2UpO319OyAvKipcbiAqIFdyaXRlcyBhIHBhY2tldHMgcGF5bG9hZC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBkYXRhIHBhY2tldHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGRyYWluIGNhbGxiYWNrXG4gKiBAYXBpIHByaXZhdGVcbiAqL1BvbGxpbmcucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24ocGFja2V0cyl7dmFyIHNlbGY9dGhpczt0aGlzLndyaXRhYmxlID0gZmFsc2U7dmFyIGNhbGxiYWNrZm49ZnVuY3Rpb24gY2FsbGJhY2tmbigpe3NlbGYud3JpdGFibGUgPSB0cnVlO3NlbGYuZW1pdCgnZHJhaW4nKTt9O3ZhciBzZWxmPXRoaXM7cGFyc2VyLmVuY29kZVBheWxvYWQocGFja2V0cyx0aGlzLnN1cHBvcnRzQmluYXJ5LGZ1bmN0aW9uKGRhdGEpe3NlbGYuZG9Xcml0ZShkYXRhLGNhbGxiYWNrZm4pO30pO307IC8qKlxuICogR2VuZXJhdGVzIHVyaSBmb3IgY29ubmVjdGlvbi5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1BvbGxpbmcucHJvdG90eXBlLnVyaSA9IGZ1bmN0aW9uKCl7dmFyIHF1ZXJ5PXRoaXMucXVlcnkgfHwge307dmFyIHNjaGVtYT10aGlzLnNlY3VyZT8naHR0cHMnOidodHRwJzt2YXIgcG9ydD0nJzsgLy8gY2FjaGUgYnVzdGluZyBpcyBmb3JjZWRcbmlmKGZhbHNlICE9PSB0aGlzLnRpbWVzdGFtcFJlcXVlc3RzKXtxdWVyeVt0aGlzLnRpbWVzdGFtcFBhcmFtXSA9IHllYXN0KCk7fWlmKCF0aGlzLnN1cHBvcnRzQmluYXJ5ICYmICFxdWVyeS5zaWQpe3F1ZXJ5LmI2NCA9IDE7fXF1ZXJ5ID0gcGFyc2Vxcy5lbmNvZGUocXVlcnkpOyAvLyBhdm9pZCBwb3J0IGlmIGRlZmF1bHQgZm9yIHNjaGVtYVxuaWYodGhpcy5wb3J0ICYmICgnaHR0cHMnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gNDQzIHx8ICdodHRwJyA9PSBzY2hlbWEgJiYgdGhpcy5wb3J0ICE9IDgwKSl7cG9ydCA9ICc6JyArIHRoaXMucG9ydDt9IC8vIHByZXBlbmQgPyB0byBxdWVyeVxuaWYocXVlcnkubGVuZ3RoKXtxdWVyeSA9ICc/JyArIHF1ZXJ5O312YXIgaXB2Nj10aGlzLmhvc3RuYW1lLmluZGV4T2YoJzonKSAhPT0gLTE7cmV0dXJuIHNjaGVtYSArICc6Ly8nICsgKGlwdjY/J1snICsgdGhpcy5ob3N0bmFtZSArICddJzp0aGlzLmhvc3RuYW1lKSArIHBvcnQgKyB0aGlzLnBhdGggKyBxdWVyeTt9O30se1wiLi4vdHJhbnNwb3J0XCI6NCxcImNvbXBvbmVudC1pbmhlcml0XCI6MTYsXCJkZWJ1Z1wiOjE3LFwiZW5naW5lLmlvLXBhcnNlclwiOjE5LFwicGFyc2Vxc1wiOjI3LFwieG1saHR0cHJlcXVlc3Qtc3NsXCI6MTAsXCJ5ZWFzdFwiOjMwfV0sOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBUcmFuc3BvcnQ9X2RlcmVxXygnLi4vdHJhbnNwb3J0Jyk7dmFyIHBhcnNlcj1fZGVyZXFfKCdlbmdpbmUuaW8tcGFyc2VyJyk7dmFyIHBhcnNlcXM9X2RlcmVxXygncGFyc2VxcycpO3ZhciBpbmhlcml0PV9kZXJlcV8oJ2NvbXBvbmVudC1pbmhlcml0Jyk7dmFyIHllYXN0PV9kZXJlcV8oJ3llYXN0Jyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ2VuZ2luZS5pby1jbGllbnQ6d2Vic29ja2V0Jyk7dmFyIEJyb3dzZXJXZWJTb2NrZXQ9Z2xvYmFsLldlYlNvY2tldCB8fCBnbG9iYWwuTW96V2ViU29ja2V0OyAvKipcbiAqIEdldCBlaXRoZXIgdGhlIGBXZWJTb2NrZXRgIG9yIGBNb3pXZWJTb2NrZXRgIGdsb2JhbHNcbiAqIGluIHRoZSBicm93c2VyIG9yIHRoZSBXZWJTb2NrZXQtY29tcGF0aWJsZSBpbnRlcmZhY2VcbiAqIGV4cG9zZWQgYnkgYHdzYCBmb3IgTm9kZSBlbnZpcm9ubWVudC5cbiAqL3ZhciBXZWJTb2NrZXQ9QnJvd3NlcldlYlNvY2tldCB8fCAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCc/bnVsbDpfZGVyZXFfKCd3cycpKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gV1M7IC8qKlxuICogV2ViU29ja2V0IHRyYW5zcG9ydCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAYXBpIHtPYmplY3R9IGNvbm5lY3Rpb24gb3B0aW9uc1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIFdTKG9wdHMpe3ZhciBmb3JjZUJhc2U2ND1vcHRzICYmIG9wdHMuZm9yY2VCYXNlNjQ7aWYoZm9yY2VCYXNlNjQpe3RoaXMuc3VwcG9ydHNCaW5hcnkgPSBmYWxzZTt9dGhpcy5wZXJNZXNzYWdlRGVmbGF0ZSA9IG9wdHMucGVyTWVzc2FnZURlZmxhdGU7VHJhbnNwb3J0LmNhbGwodGhpcyxvcHRzKTt9IC8qKlxuICogSW5oZXJpdHMgZnJvbSBUcmFuc3BvcnQuXG4gKi9pbmhlcml0KFdTLFRyYW5zcG9ydCk7IC8qKlxuICogVHJhbnNwb3J0IG5hbWUuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL1dTLnByb3RvdHlwZS5uYW1lID0gJ3dlYnNvY2tldCc7IC8qXG4gKiBXZWJTb2NrZXRzIHN1cHBvcnQgYmluYXJ5XG4gKi9XUy5wcm90b3R5cGUuc3VwcG9ydHNCaW5hcnkgPSB0cnVlOyAvKipcbiAqIE9wZW5zIHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1dTLnByb3RvdHlwZS5kb09wZW4gPSBmdW5jdGlvbigpe2lmKCF0aGlzLmNoZWNrKCkpeyAvLyBsZXQgcHJvYmUgdGltZW91dFxucmV0dXJuO312YXIgc2VsZj10aGlzO3ZhciB1cmk9dGhpcy51cmkoKTt2YXIgcHJvdG9jb2xzPXZvaWQgMDt2YXIgb3B0cz17YWdlbnQ6dGhpcy5hZ2VudCxwZXJNZXNzYWdlRGVmbGF0ZTp0aGlzLnBlck1lc3NhZ2VEZWZsYXRlfTsgLy8gU1NMIG9wdGlvbnMgZm9yIE5vZGUuanMgY2xpZW50XG5vcHRzLnBmeCA9IHRoaXMucGZ4O29wdHMua2V5ID0gdGhpcy5rZXk7b3B0cy5wYXNzcGhyYXNlID0gdGhpcy5wYXNzcGhyYXNlO29wdHMuY2VydCA9IHRoaXMuY2VydDtvcHRzLmNhID0gdGhpcy5jYTtvcHRzLmNpcGhlcnMgPSB0aGlzLmNpcGhlcnM7b3B0cy5yZWplY3RVbmF1dGhvcml6ZWQgPSB0aGlzLnJlamVjdFVuYXV0aG9yaXplZDtpZih0aGlzLmV4dHJhSGVhZGVycyl7b3B0cy5oZWFkZXJzID0gdGhpcy5leHRyYUhlYWRlcnM7fXRoaXMud3MgPSBCcm93c2VyV2ViU29ja2V0P25ldyBXZWJTb2NrZXQodXJpKTpuZXcgV2ViU29ja2V0KHVyaSxwcm90b2NvbHMsb3B0cyk7aWYodGhpcy53cy5iaW5hcnlUeXBlID09PSB1bmRlZmluZWQpe3RoaXMuc3VwcG9ydHNCaW5hcnkgPSBmYWxzZTt9aWYodGhpcy53cy5zdXBwb3J0cyAmJiB0aGlzLndzLnN1cHBvcnRzLmJpbmFyeSl7dGhpcy5zdXBwb3J0c0JpbmFyeSA9IHRydWU7dGhpcy53cy5iaW5hcnlUeXBlID0gJ2J1ZmZlcic7fWVsc2Uge3RoaXMud3MuYmluYXJ5VHlwZSA9ICdhcnJheWJ1ZmZlcic7fXRoaXMuYWRkRXZlbnRMaXN0ZW5lcnMoKTt9OyAvKipcbiAqIEFkZHMgZXZlbnQgbGlzdGVuZXJzIHRvIHRoZSBzb2NrZXRcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1dTLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVycyA9IGZ1bmN0aW9uKCl7dmFyIHNlbGY9dGhpczt0aGlzLndzLm9ub3BlbiA9IGZ1bmN0aW9uKCl7c2VsZi5vbk9wZW4oKTt9O3RoaXMud3Mub25jbG9zZSA9IGZ1bmN0aW9uKCl7c2VsZi5vbkNsb3NlKCk7fTt0aGlzLndzLm9ubWVzc2FnZSA9IGZ1bmN0aW9uKGV2KXtzZWxmLm9uRGF0YShldi5kYXRhKTt9O3RoaXMud3Mub25lcnJvciA9IGZ1bmN0aW9uKGUpe3NlbGYub25FcnJvcignd2Vic29ja2V0IGVycm9yJyxlKTt9O307IC8qKlxuICogT3ZlcnJpZGUgYG9uRGF0YWAgdG8gdXNlIGEgdGltZXIgb24gaU9TLlxuICogU2VlOiBodHRwczovL2dpc3QuZ2l0aHViLmNvbS9tbG91Z2hyYW4vMjA1MjAwNlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovaWYoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIG5hdmlnYXRvciAmJiAvaVBhZHxpUGhvbmV8aVBvZC9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCkpe1dTLnByb3RvdHlwZS5vbkRhdGEgPSBmdW5jdGlvbihkYXRhKXt2YXIgc2VsZj10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtUcmFuc3BvcnQucHJvdG90eXBlLm9uRGF0YS5jYWxsKHNlbGYsZGF0YSk7fSwwKTt9O30gLyoqXG4gKiBXcml0ZXMgZGF0YSB0byBzb2NrZXQuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyYXkgb2YgcGFja2V0cy5cbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24ocGFja2V0cyl7dmFyIHNlbGY9dGhpczt0aGlzLndyaXRhYmxlID0gZmFsc2U7IC8vIGVuY29kZVBhY2tldCBlZmZpY2llbnQgYXMgaXQgdXNlcyBXUyBmcmFtaW5nXG4vLyBubyBuZWVkIGZvciBlbmNvZGVQYXlsb2FkXG52YXIgdG90YWw9cGFja2V0cy5sZW5ndGg7Zm9yKHZhciBpPTAsbD10b3RhbDtpIDwgbDtpKyspIHsoZnVuY3Rpb24ocGFja2V0KXtwYXJzZXIuZW5jb2RlUGFja2V0KHBhY2tldCxzZWxmLnN1cHBvcnRzQmluYXJ5LGZ1bmN0aW9uKGRhdGEpe2lmKCFCcm93c2VyV2ViU29ja2V0KXsgLy8gYWx3YXlzIGNyZWF0ZSBhIG5ldyBvYmplY3QgKEdILTQzNylcbnZhciBvcHRzPXt9O2lmKHBhY2tldC5vcHRpb25zKXtvcHRzLmNvbXByZXNzID0gcGFja2V0Lm9wdGlvbnMuY29tcHJlc3M7fWlmKHNlbGYucGVyTWVzc2FnZURlZmxhdGUpe3ZhciBsZW49J3N0cmluZycgPT0gdHlwZW9mIGRhdGE/Z2xvYmFsLkJ1ZmZlci5ieXRlTGVuZ3RoKGRhdGEpOmRhdGEubGVuZ3RoO2lmKGxlbiA8IHNlbGYucGVyTWVzc2FnZURlZmxhdGUudGhyZXNob2xkKXtvcHRzLmNvbXByZXNzID0gZmFsc2U7fX19IC8vU29tZXRpbWVzIHRoZSB3ZWJzb2NrZXQgaGFzIGFscmVhZHkgYmVlbiBjbG9zZWQgYnV0IHRoZSBicm93c2VyIGRpZG4ndFxuLy9oYXZlIGEgY2hhbmNlIG9mIGluZm9ybWluZyB1cyBhYm91dCBpdCB5ZXQsIGluIHRoYXQgY2FzZSBzZW5kIHdpbGxcbi8vdGhyb3cgYW4gZXJyb3JcbnRyeXtpZihCcm93c2VyV2ViU29ja2V0KXsgLy8gVHlwZUVycm9yIGlzIHRocm93biB3aGVuIHBhc3NpbmcgdGhlIHNlY29uZCBhcmd1bWVudCBvbiBTYWZhcmlcbnNlbGYud3Muc2VuZChkYXRhKTt9ZWxzZSB7c2VsZi53cy5zZW5kKGRhdGEsb3B0cyk7fX1jYXRjaChlKSB7ZGVidWcoJ3dlYnNvY2tldCBjbG9zZWQgYmVmb3JlIG9uY2xvc2UgZXZlbnQnKTt9LS10b3RhbCB8fCBkb25lKCk7fSk7fSkocGFja2V0c1tpXSk7fWZ1bmN0aW9uIGRvbmUoKXtzZWxmLmVtaXQoJ2ZsdXNoJyk7IC8vIGZha2UgZHJhaW5cbi8vIGRlZmVyIHRvIG5leHQgdGljayB0byBhbGxvdyBTb2NrZXQgdG8gY2xlYXIgd3JpdGVCdWZmZXJcbnNldFRpbWVvdXQoZnVuY3Rpb24oKXtzZWxmLndyaXRhYmxlID0gdHJ1ZTtzZWxmLmVtaXQoJ2RyYWluJyk7fSwwKTt9fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBjbG9zZVxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLm9uQ2xvc2UgPSBmdW5jdGlvbigpe1RyYW5zcG9ydC5wcm90b3R5cGUub25DbG9zZS5jYWxsKHRoaXMpO307IC8qKlxuICogQ2xvc2VzIHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1dTLnByb3RvdHlwZS5kb0Nsb3NlID0gZnVuY3Rpb24oKXtpZih0eXBlb2YgdGhpcy53cyAhPT0gJ3VuZGVmaW5lZCcpe3RoaXMud3MuY2xvc2UoKTt9fTsgLyoqXG4gKiBHZW5lcmF0ZXMgdXJpIGZvciBjb25uZWN0aW9uLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovV1MucHJvdG90eXBlLnVyaSA9IGZ1bmN0aW9uKCl7dmFyIHF1ZXJ5PXRoaXMucXVlcnkgfHwge307dmFyIHNjaGVtYT10aGlzLnNlY3VyZT8nd3NzJzond3MnO3ZhciBwb3J0PScnOyAvLyBhdm9pZCBwb3J0IGlmIGRlZmF1bHQgZm9yIHNjaGVtYVxuaWYodGhpcy5wb3J0ICYmICgnd3NzJyA9PSBzY2hlbWEgJiYgdGhpcy5wb3J0ICE9IDQ0MyB8fCAnd3MnID09IHNjaGVtYSAmJiB0aGlzLnBvcnQgIT0gODApKXtwb3J0ID0gJzonICsgdGhpcy5wb3J0O30gLy8gYXBwZW5kIHRpbWVzdGFtcCB0byBVUklcbmlmKHRoaXMudGltZXN0YW1wUmVxdWVzdHMpe3F1ZXJ5W3RoaXMudGltZXN0YW1wUGFyYW1dID0geWVhc3QoKTt9IC8vIGNvbW11bmljYXRlIGJpbmFyeSBzdXBwb3J0IGNhcGFiaWxpdGllc1xuaWYoIXRoaXMuc3VwcG9ydHNCaW5hcnkpe3F1ZXJ5LmI2NCA9IDE7fXF1ZXJ5ID0gcGFyc2Vxcy5lbmNvZGUocXVlcnkpOyAvLyBwcmVwZW5kID8gdG8gcXVlcnlcbmlmKHF1ZXJ5Lmxlbmd0aCl7cXVlcnkgPSAnPycgKyBxdWVyeTt9dmFyIGlwdjY9dGhpcy5ob3N0bmFtZS5pbmRleE9mKCc6JykgIT09IC0xO3JldHVybiBzY2hlbWEgKyAnOi8vJyArIChpcHY2PydbJyArIHRoaXMuaG9zdG5hbWUgKyAnXSc6dGhpcy5ob3N0bmFtZSkgKyBwb3J0ICsgdGhpcy5wYXRoICsgcXVlcnk7fTsgLyoqXG4gKiBGZWF0dXJlIGRldGVjdGlvbiBmb3IgV2ViU29ja2V0LlxuICpcbiAqIEByZXR1cm4ge0Jvb2xlYW59IHdoZXRoZXIgdGhpcyB0cmFuc3BvcnQgaXMgYXZhaWxhYmxlLlxuICogQGFwaSBwdWJsaWNcbiAqL1dTLnByb3RvdHlwZS5jaGVjayA9IGZ1bmN0aW9uKCl7cmV0dXJuICEhV2ViU29ja2V0ICYmICEoJ19faW5pdGlhbGl6ZScgaW4gV2ViU29ja2V0ICYmIHRoaXMubmFtZSA9PT0gV1MucHJvdG90eXBlLm5hbWUpO307fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se1wiLi4vdHJhbnNwb3J0XCI6NCxcImNvbXBvbmVudC1pbmhlcml0XCI6MTYsXCJkZWJ1Z1wiOjE3LFwiZW5naW5lLmlvLXBhcnNlclwiOjE5LFwicGFyc2Vxc1wiOjI3LFwid3NcIjp1bmRlZmluZWQsXCJ5ZWFzdFwiOjMwfV0sMTA6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvLyBicm93c2VyIHNoaW0gZm9yIHhtbGh0dHByZXF1ZXN0IG1vZHVsZVxudmFyIGhhc0NPUlM9X2RlcmVxXygnaGFzLWNvcnMnKTttb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKG9wdHMpe3ZhciB4ZG9tYWluPW9wdHMueGRvbWFpbjsgLy8gc2NoZW1lIG11c3QgYmUgc2FtZSB3aGVuIHVzaWduIFhEb21haW5SZXF1ZXN0XG4vLyBodHRwOi8vYmxvZ3MubXNkbi5jb20vYi9pZWludGVybmFscy9hcmNoaXZlLzIwMTAvMDUvMTMveGRvbWFpbnJlcXVlc3QtcmVzdHJpY3Rpb25zLWxpbWl0YXRpb25zLWFuZC13b3JrYXJvdW5kcy5hc3B4XG52YXIgeHNjaGVtZT1vcHRzLnhzY2hlbWU7IC8vIFhEb21haW5SZXF1ZXN0IGhhcyBhIGZsb3cgb2Ygbm90IHNlbmRpbmcgY29va2llLCB0aGVyZWZvcmUgaXQgc2hvdWxkIGJlIGRpc2FibGVkIGFzIGEgZGVmYXVsdC5cbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9BdXRvbWF0dGljL2VuZ2luZS5pby1jbGllbnQvcHVsbC8yMTdcbnZhciBlbmFibGVzWERSPW9wdHMuZW5hYmxlc1hEUjsgLy8gWE1MSHR0cFJlcXVlc3QgY2FuIGJlIGRpc2FibGVkIG9uIElFXG50cnl7aWYoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhNTEh0dHBSZXF1ZXN0ICYmICgheGRvbWFpbiB8fCBoYXNDT1JTKSl7cmV0dXJuIG5ldyBYTUxIdHRwUmVxdWVzdCgpO319Y2F0Y2goZSkge30gLy8gVXNlIFhEb21haW5SZXF1ZXN0IGZvciBJRTggaWYgZW5hYmxlc1hEUiBpcyB0cnVlXG4vLyBiZWNhdXNlIGxvYWRpbmcgYmFyIGtlZXBzIGZsYXNoaW5nIHdoZW4gdXNpbmcganNvbnAtcG9sbGluZ1xuLy8gaHR0cHM6Ly9naXRodWIuY29tL3l1amlvc2FrYS9zb2NrZS5pby1pZTgtbG9hZGluZy1leGFtcGxlXG50cnl7aWYoJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIFhEb21haW5SZXF1ZXN0ICYmICF4c2NoZW1lICYmIGVuYWJsZXNYRFIpe3JldHVybiBuZXcgWERvbWFpblJlcXVlc3QoKTt9fWNhdGNoKGUpIHt9aWYoIXhkb21haW4pe3RyeXtyZXR1cm4gbmV3IEFjdGl2ZVhPYmplY3QoJ01pY3Jvc29mdC5YTUxIVFRQJyk7fWNhdGNoKGUpIHt9fX07fSx7XCJoYXMtY29yc1wiOjIyfV0sMTE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe21vZHVsZS5leHBvcnRzID0gYWZ0ZXI7ZnVuY3Rpb24gYWZ0ZXIoY291bnQsY2FsbGJhY2ssZXJyX2NiKXt2YXIgYmFpbD1mYWxzZTtlcnJfY2IgPSBlcnJfY2IgfHwgbm9vcDtwcm94eS5jb3VudCA9IGNvdW50O3JldHVybiBjb3VudCA9PT0gMD9jYWxsYmFjaygpOnByb3h5O2Z1bmN0aW9uIHByb3h5KGVycixyZXN1bHQpe2lmKHByb3h5LmNvdW50IDw9IDApe3Rocm93IG5ldyBFcnJvcignYWZ0ZXIgY2FsbGVkIHRvbyBtYW55IHRpbWVzJyk7fS0tcHJveHkuY291bnQ7IC8vIGFmdGVyIGZpcnN0IGVycm9yLCByZXN0IGFyZSBwYXNzZWQgdG8gZXJyX2NiXG5pZihlcnIpe2JhaWwgPSB0cnVlO2NhbGxiYWNrKGVycik7IC8vIGZ1dHVyZSBlcnJvciBjYWxsYmFja3Mgd2lsbCBnbyB0byBlcnJvciBoYW5kbGVyXG5jYWxsYmFjayA9IGVycl9jYjt9ZWxzZSBpZihwcm94eS5jb3VudCA9PT0gMCAmJiAhYmFpbCl7Y2FsbGJhY2sobnVsbCxyZXN1bHQpO319fWZ1bmN0aW9uIG5vb3AoKXt9fSx7fV0sMTI6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIEFuIGFic3RyYWN0aW9uIGZvciBzbGljaW5nIGFuIGFycmF5YnVmZmVyIGV2ZW4gd2hlblxuICogQXJyYXlCdWZmZXIucHJvdG90eXBlLnNsaWNlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihhcnJheWJ1ZmZlcixzdGFydCxlbmQpe3ZhciBieXRlcz1hcnJheWJ1ZmZlci5ieXRlTGVuZ3RoO3N0YXJ0ID0gc3RhcnQgfHwgMDtlbmQgPSBlbmQgfHwgYnl0ZXM7aWYoYXJyYXlidWZmZXIuc2xpY2Upe3JldHVybiBhcnJheWJ1ZmZlci5zbGljZShzdGFydCxlbmQpO31pZihzdGFydCA8IDApe3N0YXJ0ICs9IGJ5dGVzO31pZihlbmQgPCAwKXtlbmQgKz0gYnl0ZXM7fWlmKGVuZCA+IGJ5dGVzKXtlbmQgPSBieXRlczt9aWYoc3RhcnQgPj0gYnl0ZXMgfHwgc3RhcnQgPj0gZW5kIHx8IGJ5dGVzID09PSAwKXtyZXR1cm4gbmV3IEFycmF5QnVmZmVyKDApO312YXIgYWJ2PW5ldyBVaW50OEFycmF5KGFycmF5YnVmZmVyKTt2YXIgcmVzdWx0PW5ldyBVaW50OEFycmF5KGVuZCAtIHN0YXJ0KTtmb3IodmFyIGk9c3RhcnQsaWk9MDtpIDwgZW5kO2krKyxpaSsrKSB7cmVzdWx0W2lpXSA9IGFidltpXTt9cmV0dXJuIHJlc3VsdC5idWZmZXI7fTt9LHt9XSwxMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qXG4gKiBiYXNlNjQtYXJyYXlidWZmZXJcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9uaWtsYXN2aC9iYXNlNjQtYXJyYXlidWZmZXJcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTIgTmlrbGFzIHZvbiBIZXJ0emVuXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG4gKi8oZnVuY3Rpb24oY2hhcnMpe1widXNlIHN0cmljdFwiO2V4cG9ydHMuZW5jb2RlID0gZnVuY3Rpb24oYXJyYXlidWZmZXIpe3ZhciBieXRlcz1uZXcgVWludDhBcnJheShhcnJheWJ1ZmZlciksaSxsZW49Ynl0ZXMubGVuZ3RoLGJhc2U2ND1cIlwiO2ZvcihpID0gMDtpIDwgbGVuO2kgKz0gMykge2Jhc2U2NCArPSBjaGFyc1tieXRlc1tpXSA+PiAyXTtiYXNlNjQgKz0gY2hhcnNbKGJ5dGVzW2ldICYgMykgPDwgNCB8IGJ5dGVzW2kgKyAxXSA+PiA0XTtiYXNlNjQgKz0gY2hhcnNbKGJ5dGVzW2kgKyAxXSAmIDE1KSA8PCAyIHwgYnl0ZXNbaSArIDJdID4+IDZdO2Jhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107fWlmKGxlbiAlIDMgPT09IDIpe2Jhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCxiYXNlNjQubGVuZ3RoIC0gMSkgKyBcIj1cIjt9ZWxzZSBpZihsZW4gJSAzID09PSAxKXtiYXNlNjQgPSBiYXNlNjQuc3Vic3RyaW5nKDAsYmFzZTY0Lmxlbmd0aCAtIDIpICsgXCI9PVwiO31yZXR1cm4gYmFzZTY0O307ZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbihiYXNlNjQpe3ZhciBidWZmZXJMZW5ndGg9YmFzZTY0Lmxlbmd0aCAqIDAuNzUsbGVuPWJhc2U2NC5sZW5ndGgsaSxwPTAsZW5jb2RlZDEsZW5jb2RlZDIsZW5jb2RlZDMsZW5jb2RlZDQ7aWYoYmFzZTY0W2Jhc2U2NC5sZW5ndGggLSAxXSA9PT0gXCI9XCIpe2J1ZmZlckxlbmd0aC0tO2lmKGJhc2U2NFtiYXNlNjQubGVuZ3RoIC0gMl0gPT09IFwiPVwiKXtidWZmZXJMZW5ndGgtLTt9fXZhciBhcnJheWJ1ZmZlcj1uZXcgQXJyYXlCdWZmZXIoYnVmZmVyTGVuZ3RoKSxieXRlcz1uZXcgVWludDhBcnJheShhcnJheWJ1ZmZlcik7Zm9yKGkgPSAwO2kgPCBsZW47aSArPSA0KSB7ZW5jb2RlZDEgPSBjaGFycy5pbmRleE9mKGJhc2U2NFtpXSk7ZW5jb2RlZDIgPSBjaGFycy5pbmRleE9mKGJhc2U2NFtpICsgMV0pO2VuY29kZWQzID0gY2hhcnMuaW5kZXhPZihiYXNlNjRbaSArIDJdKTtlbmNvZGVkNCA9IGNoYXJzLmluZGV4T2YoYmFzZTY0W2kgKyAzXSk7Ynl0ZXNbcCsrXSA9IGVuY29kZWQxIDw8IDIgfCBlbmNvZGVkMiA+PiA0O2J5dGVzW3ArK10gPSAoZW5jb2RlZDIgJiAxNSkgPDwgNCB8IGVuY29kZWQzID4+IDI7Ynl0ZXNbcCsrXSA9IChlbmNvZGVkMyAmIDMpIDw8IDYgfCBlbmNvZGVkNCAmIDYzO31yZXR1cm4gYXJyYXlidWZmZXI7fTt9KShcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky9cIik7fSx7fV0sMTQ6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKipcbiAqIENyZWF0ZSBhIGJsb2IgYnVpbGRlciBldmVuIHdoZW4gdmVuZG9yIHByZWZpeGVzIGV4aXN0XG4gKi92YXIgQmxvYkJ1aWxkZXI9Z2xvYmFsLkJsb2JCdWlsZGVyIHx8IGdsb2JhbC5XZWJLaXRCbG9iQnVpbGRlciB8fCBnbG9iYWwuTVNCbG9iQnVpbGRlciB8fCBnbG9iYWwuTW96QmxvYkJ1aWxkZXI7IC8qKlxuICogQ2hlY2sgaWYgQmxvYiBjb25zdHJ1Y3RvciBpcyBzdXBwb3J0ZWRcbiAqL3ZhciBibG9iU3VwcG9ydGVkPShmdW5jdGlvbigpe3RyeXt2YXIgYT1uZXcgQmxvYihbJ2hpJ10pO3JldHVybiBhLnNpemUgPT09IDI7fWNhdGNoKGUpIHtyZXR1cm4gZmFsc2U7fX0pKCk7IC8qKlxuICogQ2hlY2sgaWYgQmxvYiBjb25zdHJ1Y3RvciBzdXBwb3J0cyBBcnJheUJ1ZmZlclZpZXdzXG4gKiBGYWlscyBpbiBTYWZhcmkgNiwgc28gd2UgbmVlZCB0byBtYXAgdG8gQXJyYXlCdWZmZXJzIHRoZXJlLlxuICovdmFyIGJsb2JTdXBwb3J0c0FycmF5QnVmZmVyVmlldz1ibG9iU3VwcG9ydGVkICYmIChmdW5jdGlvbigpe3RyeXt2YXIgYj1uZXcgQmxvYihbbmV3IFVpbnQ4QXJyYXkoWzEsMl0pXSk7cmV0dXJuIGIuc2l6ZSA9PT0gMjt9Y2F0Y2goZSkge3JldHVybiBmYWxzZTt9fSkoKTsgLyoqXG4gKiBDaGVjayBpZiBCbG9iQnVpbGRlciBpcyBzdXBwb3J0ZWRcbiAqL3ZhciBibG9iQnVpbGRlclN1cHBvcnRlZD1CbG9iQnVpbGRlciAmJiBCbG9iQnVpbGRlci5wcm90b3R5cGUuYXBwZW5kICYmIEJsb2JCdWlsZGVyLnByb3RvdHlwZS5nZXRCbG9iOyAvKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IG1hcHMgQXJyYXlCdWZmZXJWaWV3cyB0byBBcnJheUJ1ZmZlcnNcbiAqIFVzZWQgYnkgQmxvYkJ1aWxkZXIgY29uc3RydWN0b3IgYW5kIG9sZCBicm93c2VycyB0aGF0IGRpZG4ndFxuICogc3VwcG9ydCBpdCBpbiB0aGUgQmxvYiBjb25zdHJ1Y3Rvci5cbiAqL2Z1bmN0aW9uIG1hcEFycmF5QnVmZmVyVmlld3MoYXJ5KXtmb3IodmFyIGk9MDtpIDwgYXJ5Lmxlbmd0aDtpKyspIHt2YXIgY2h1bms9YXJ5W2ldO2lmKGNodW5rLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKXt2YXIgYnVmPWNodW5rLmJ1ZmZlcjsgLy8gaWYgdGhpcyBpcyBhIHN1YmFycmF5LCBtYWtlIGEgY29weSBzbyB3ZSBvbmx5XG4vLyBpbmNsdWRlIHRoZSBzdWJhcnJheSByZWdpb24gZnJvbSB0aGUgdW5kZXJseWluZyBidWZmZXJcbmlmKGNodW5rLmJ5dGVMZW5ndGggIT09IGJ1Zi5ieXRlTGVuZ3RoKXt2YXIgY29weT1uZXcgVWludDhBcnJheShjaHVuay5ieXRlTGVuZ3RoKTtjb3B5LnNldChuZXcgVWludDhBcnJheShidWYsY2h1bmsuYnl0ZU9mZnNldCxjaHVuay5ieXRlTGVuZ3RoKSk7YnVmID0gY29weS5idWZmZXI7fWFyeVtpXSA9IGJ1Zjt9fX1mdW5jdGlvbiBCbG9iQnVpbGRlckNvbnN0cnVjdG9yKGFyeSxvcHRpb25zKXtvcHRpb25zID0gb3B0aW9ucyB8fCB7fTt2YXIgYmI9bmV3IEJsb2JCdWlsZGVyKCk7bWFwQXJyYXlCdWZmZXJWaWV3cyhhcnkpO2Zvcih2YXIgaT0wO2kgPCBhcnkubGVuZ3RoO2krKykge2JiLmFwcGVuZChhcnlbaV0pO31yZXR1cm4gb3B0aW9ucy50eXBlP2JiLmdldEJsb2Iob3B0aW9ucy50eXBlKTpiYi5nZXRCbG9iKCk7fTtmdW5jdGlvbiBCbG9iQ29uc3RydWN0b3IoYXJ5LG9wdGlvbnMpe21hcEFycmF5QnVmZmVyVmlld3MoYXJ5KTtyZXR1cm4gbmV3IEJsb2IoYXJ5LG9wdGlvbnMgfHwge30pO307bW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtpZihibG9iU3VwcG9ydGVkKXtyZXR1cm4gYmxvYlN1cHBvcnRzQXJyYXlCdWZmZXJWaWV3P2dsb2JhbC5CbG9iOkJsb2JDb25zdHJ1Y3Rvcjt9ZWxzZSBpZihibG9iQnVpbGRlclN1cHBvcnRlZCl7cmV0dXJuIEJsb2JCdWlsZGVyQ29uc3RydWN0b3I7fWVsc2Uge3JldHVybiB1bmRlZmluZWQ7fX0pKCk7fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se31dLDE1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBFeHBvc2UgYEVtaXR0ZXJgLlxuICovbW9kdWxlLmV4cG9ydHMgPSBFbWl0dGVyOyAvKipcbiAqIEluaXRpYWxpemUgYSBuZXcgYEVtaXR0ZXJgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBFbWl0dGVyKG9iail7aWYob2JqKXJldHVybiBtaXhpbihvYmopO307IC8qKlxuICogTWl4aW4gdGhlIGVtaXR0ZXIgcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIG1peGluKG9iail7Zm9yKHZhciBrZXkgaW4gRW1pdHRlci5wcm90b3R5cGUpIHtvYmpba2V5XSA9IEVtaXR0ZXIucHJvdG90eXBlW2tleV07fXJldHVybiBvYmo7fSAvKipcbiAqIExpc3RlbiBvbiB0aGUgZ2l2ZW4gYGV2ZW50YCB3aXRoIGBmbmAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5vbiA9IEVtaXR0ZXIucHJvdG90eXBlLmFkZEV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCxmbil7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9Oyh0aGlzLl9jYWxsYmFja3NbZXZlbnRdID0gdGhpcy5fY2FsbGJhY2tzW2V2ZW50XSB8fCBbXSkucHVzaChmbik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBBZGRzIGFuIGBldmVudGAgbGlzdGVuZXIgdGhhdCB3aWxsIGJlIGludm9rZWQgYSBzaW5nbGVcbiAqIHRpbWUgdGhlbiBhdXRvbWF0aWNhbGx5IHJlbW92ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24oZXZlbnQsZm4pe3ZhciBzZWxmPXRoaXM7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O2Z1bmN0aW9uIG9uKCl7c2VsZi5vZmYoZXZlbnQsb24pO2ZuLmFwcGx5KHRoaXMsYXJndW1lbnRzKTt9b24uZm4gPSBmbjt0aGlzLm9uKGV2ZW50LG9uKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFJlbW92ZSB0aGUgZ2l2ZW4gY2FsbGJhY2sgZm9yIGBldmVudGAgb3IgYWxsXG4gKiByZWdpc3RlcmVkIGNhbGxiYWNrcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcmV0dXJuIHtFbWl0dGVyfVxuICogQGFwaSBwdWJsaWNcbiAqL0VtaXR0ZXIucHJvdG90eXBlLm9mZiA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gRW1pdHRlci5wcm90b3R5cGUucmVtb3ZlRXZlbnRMaXN0ZW5lciA9IGZ1bmN0aW9uKGV2ZW50LGZuKXt0aGlzLl9jYWxsYmFja3MgPSB0aGlzLl9jYWxsYmFja3MgfHwge307IC8vIGFsbFxuaWYoMCA9PSBhcmd1bWVudHMubGVuZ3RoKXt0aGlzLl9jYWxsYmFja3MgPSB7fTtyZXR1cm4gdGhpczt9IC8vIHNwZWNpZmljIGV2ZW50XG52YXIgY2FsbGJhY2tzPXRoaXMuX2NhbGxiYWNrc1tldmVudF07aWYoIWNhbGxiYWNrcylyZXR1cm4gdGhpczsgLy8gcmVtb3ZlIGFsbCBoYW5kbGVyc1xuaWYoMSA9PSBhcmd1bWVudHMubGVuZ3RoKXtkZWxldGUgdGhpcy5fY2FsbGJhY2tzW2V2ZW50XTtyZXR1cm4gdGhpczt9IC8vIHJlbW92ZSBzcGVjaWZpYyBoYW5kbGVyXG52YXIgY2I7Zm9yKHZhciBpPTA7aSA8IGNhbGxiYWNrcy5sZW5ndGg7aSsrKSB7Y2IgPSBjYWxsYmFja3NbaV07aWYoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbil7Y2FsbGJhY2tzLnNwbGljZShpLDEpO2JyZWFrO319cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBFbWl0IGBldmVudGAgd2l0aCB0aGUgZ2l2ZW4gYXJncy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TWl4ZWR9IC4uLlxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqL0VtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldmVudCl7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O3ZhciBhcmdzPVtdLnNsaWNlLmNhbGwoYXJndW1lbnRzLDEpLGNhbGxiYWNrcz10aGlzLl9jYWxsYmFja3NbZXZlbnRdO2lmKGNhbGxiYWNrcyl7Y2FsbGJhY2tzID0gY2FsbGJhY2tzLnNsaWNlKDApO2Zvcih2YXIgaT0wLGxlbj1jYWxsYmFja3MubGVuZ3RoO2kgPCBsZW47KytpKSB7Y2FsbGJhY2tzW2ldLmFwcGx5KHRoaXMsYXJncyk7fX1yZXR1cm4gdGhpczt9OyAvKipcbiAqIFJldHVybiBhcnJheSBvZiBjYWxsYmFja3MgZm9yIGBldmVudGAuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9O3JldHVybiB0aGlzLl9jYWxsYmFja3NbZXZlbnRdIHx8IFtdO307IC8qKlxuICogQ2hlY2sgaWYgdGhpcyBlbWl0dGVyIGhhcyBgZXZlbnRgIGhhbmRsZXJzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5oYXNMaXN0ZW5lcnMgPSBmdW5jdGlvbihldmVudCl7cmV0dXJuICEhdGhpcy5saXN0ZW5lcnMoZXZlbnQpLmxlbmd0aDt9O30se31dLDE2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGEsYil7dmFyIGZuPWZ1bmN0aW9uIGZuKCl7fTtmbi5wcm90b3R5cGUgPSBiLnByb3RvdHlwZTthLnByb3RvdHlwZSA9IG5ldyBmbigpO2EucHJvdG90eXBlLmNvbnN0cnVjdG9yID0gYTt9O30se31dLDE3OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBUaGlzIGlzIHRoZSB3ZWIgYnJvd3NlciBpbXBsZW1lbnRhdGlvbiBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gX2RlcmVxXygnLi9kZWJ1ZycpO2V4cG9ydHMubG9nID0gbG9nO2V4cG9ydHMuZm9ybWF0QXJncyA9IGZvcm1hdEFyZ3M7ZXhwb3J0cy5zYXZlID0gc2F2ZTtleHBvcnRzLmxvYWQgPSBsb2FkO2V4cG9ydHMudXNlQ29sb3JzID0gdXNlQ29sb3JzO2V4cG9ydHMuc3RvcmFnZSA9ICd1bmRlZmluZWQnICE9IHR5cGVvZiBjaHJvbWUgJiYgJ3VuZGVmaW5lZCcgIT0gdHlwZW9mIGNocm9tZS5zdG9yYWdlP2Nocm9tZS5zdG9yYWdlLmxvY2FsOmxvY2Fsc3RvcmFnZSgpOyAvKipcbiAqIENvbG9ycy5cbiAqL2V4cG9ydHMuY29sb3JzID0gWydsaWdodHNlYWdyZWVuJywnZm9yZXN0Z3JlZW4nLCdnb2xkZW5yb2QnLCdkb2RnZXJibHVlJywnZGFya29yY2hpZCcsJ2NyaW1zb24nXTsgLyoqXG4gKiBDdXJyZW50bHkgb25seSBXZWJLaXQtYmFzZWQgV2ViIEluc3BlY3RvcnMsIEZpcmVmb3ggPj0gdjMxLFxuICogYW5kIHRoZSBGaXJlYnVnIGV4dGVuc2lvbiAoYW55IEZpcmVmb3ggdmVyc2lvbikgYXJlIGtub3duXG4gKiB0byBzdXBwb3J0IFwiJWNcIiBDU1MgY3VzdG9taXphdGlvbnMuXG4gKlxuICogVE9ETzogYWRkIGEgYGxvY2FsU3RvcmFnZWAgdmFyaWFibGUgdG8gZXhwbGljaXRseSBlbmFibGUvZGlzYWJsZSBjb2xvcnNcbiAqL2Z1bmN0aW9uIHVzZUNvbG9ycygpeyAvLyBpcyB3ZWJraXQ/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzE2NDU5NjA2LzM3Njc3M1xucmV0dXJuICdXZWJraXRBcHBlYXJhbmNlJyBpbiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGUgfHwgIC8vIGlzIGZpcmVidWc/IGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzM5ODEyMC8zNzY3NzNcbndpbmRvdy5jb25zb2xlICYmIChjb25zb2xlLmZpcmVidWcgfHwgY29uc29sZS5leGNlcHRpb24gJiYgY29uc29sZS50YWJsZSkgfHwgIC8vIGlzIGZpcmVmb3ggPj0gdjMxP1xuLy8gaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9Ub29scy9XZWJfQ29uc29sZSNTdHlsaW5nX21lc3NhZ2VzXG5uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkubWF0Y2goL2ZpcmVmb3hcXC8oXFxkKykvKSAmJiBwYXJzZUludChSZWdFeHAuJDEsMTApID49IDMxO30gLyoqXG4gKiBNYXAgJWogdG8gYEpTT04uc3RyaW5naWZ5KClgLCBzaW5jZSBubyBXZWIgSW5zcGVjdG9ycyBkbyB0aGF0IGJ5IGRlZmF1bHQuXG4gKi9leHBvcnRzLmZvcm1hdHRlcnMuaiA9IGZ1bmN0aW9uKHYpe3JldHVybiBKU09OLnN0cmluZ2lmeSh2KTt9OyAvKipcbiAqIENvbG9yaXplIGxvZyBhcmd1bWVudHMgaWYgZW5hYmxlZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gZm9ybWF0QXJncygpe3ZhciBhcmdzPWFyZ3VtZW50czt2YXIgdXNlQ29sb3JzPXRoaXMudXNlQ29sb3JzO2FyZ3NbMF0gPSAodXNlQ29sb3JzPyclYyc6JycpICsgdGhpcy5uYW1lc3BhY2UgKyAodXNlQ29sb3JzPycgJWMnOicgJykgKyBhcmdzWzBdICsgKHVzZUNvbG9ycz8nJWMgJzonICcpICsgJysnICsgZXhwb3J0cy5odW1hbml6ZSh0aGlzLmRpZmYpO2lmKCF1c2VDb2xvcnMpcmV0dXJuIGFyZ3M7dmFyIGM9J2NvbG9yOiAnICsgdGhpcy5jb2xvcjthcmdzID0gW2FyZ3NbMF0sYywnY29sb3I6IGluaGVyaXQnXS5jb25jYXQoQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywxKSk7IC8vIHRoZSBmaW5hbCBcIiVjXCIgaXMgc29tZXdoYXQgdHJpY2t5LCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG90aGVyXG4vLyBhcmd1bWVudHMgcGFzc2VkIGVpdGhlciBiZWZvcmUgb3IgYWZ0ZXIgdGhlICVjLCBzbyB3ZSBuZWVkIHRvXG4vLyBmaWd1cmUgb3V0IHRoZSBjb3JyZWN0IGluZGV4IHRvIGluc2VydCB0aGUgQ1NTIGludG9cbnZhciBpbmRleD0wO3ZhciBsYXN0Qz0wO2FyZ3NbMF0ucmVwbGFjZSgvJVthLXolXS9nLGZ1bmN0aW9uKG1hdGNoKXtpZignJSUnID09PSBtYXRjaClyZXR1cm47aW5kZXgrKztpZignJWMnID09PSBtYXRjaCl7IC8vIHdlIG9ubHkgYXJlIGludGVyZXN0ZWQgaW4gdGhlICpsYXN0KiAlY1xuLy8gKHRoZSB1c2VyIG1heSBoYXZlIHByb3ZpZGVkIHRoZWlyIG93bilcbmxhc3RDID0gaW5kZXg7fX0pO2FyZ3Muc3BsaWNlKGxhc3RDLDAsYyk7cmV0dXJuIGFyZ3M7fSAvKipcbiAqIEludm9rZXMgYGNvbnNvbGUubG9nKClgIHdoZW4gYXZhaWxhYmxlLlxuICogTm8tb3Agd2hlbiBgY29uc29sZS5sb2dgIGlzIG5vdCBhIFwiZnVuY3Rpb25cIi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gbG9nKCl7IC8vIHRoaXMgaGFja2VyeSBpcyByZXF1aXJlZCBmb3IgSUU4LzksIHdoZXJlXG4vLyB0aGUgYGNvbnNvbGUubG9nYCBmdW5jdGlvbiBkb2Vzbid0IGhhdmUgJ2FwcGx5J1xucmV0dXJuICdvYmplY3QnID09PSB0eXBlb2YgY29uc29sZSAmJiBjb25zb2xlLmxvZyAmJiBGdW5jdGlvbi5wcm90b3R5cGUuYXBwbHkuY2FsbChjb25zb2xlLmxvZyxjb25zb2xlLGFyZ3VtZW50cyk7fSAvKipcbiAqIFNhdmUgYG5hbWVzcGFjZXNgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIHNhdmUobmFtZXNwYWNlcyl7dHJ5e2lmKG51bGwgPT0gbmFtZXNwYWNlcyl7ZXhwb3J0cy5zdG9yYWdlLnJlbW92ZUl0ZW0oJ2RlYnVnJyk7fWVsc2Uge2V4cG9ydHMuc3RvcmFnZS5kZWJ1ZyA9IG5hbWVzcGFjZXM7fX1jYXRjaChlKSB7fX0gLyoqXG4gKiBMb2FkIGBuYW1lc3BhY2VzYC5cbiAqXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHJldHVybnMgdGhlIHByZXZpb3VzbHkgcGVyc2lzdGVkIGRlYnVnIG1vZGVzXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGxvYWQoKXt2YXIgcjt0cnl7ciA9IGV4cG9ydHMuc3RvcmFnZS5kZWJ1Zzt9Y2F0Y2goZSkge31yZXR1cm4gcjt9IC8qKlxuICogRW5hYmxlIG5hbWVzcGFjZXMgbGlzdGVkIGluIGBsb2NhbFN0b3JhZ2UuZGVidWdgIGluaXRpYWxseS5cbiAqL2V4cG9ydHMuZW5hYmxlKGxvYWQoKSk7IC8qKlxuICogTG9jYWxzdG9yYWdlIGF0dGVtcHRzIHRvIHJldHVybiB0aGUgbG9jYWxzdG9yYWdlLlxuICpcbiAqIFRoaXMgaXMgbmVjZXNzYXJ5IGJlY2F1c2Ugc2FmYXJpIHRocm93c1xuICogd2hlbiBhIHVzZXIgZGlzYWJsZXMgY29va2llcy9sb2NhbHN0b3JhZ2VcbiAqIGFuZCB5b3UgYXR0ZW1wdCB0byBhY2Nlc3MgaXQuXG4gKlxuICogQHJldHVybiB7TG9jYWxTdG9yYWdlfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBsb2NhbHN0b3JhZ2UoKXt0cnl7cmV0dXJuIHdpbmRvdy5sb2NhbFN0b3JhZ2U7fWNhdGNoKGUpIHt9fX0se1wiLi9kZWJ1Z1wiOjE4fV0sMTg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIFRoaXMgaXMgdGhlIGNvbW1vbiBsb2dpYyBmb3IgYm90aCB0aGUgTm9kZS5qcyBhbmQgd2ViIGJyb3dzZXJcbiAqIGltcGxlbWVudGF0aW9ucyBvZiBgZGVidWcoKWAuXG4gKlxuICogRXhwb3NlIGBkZWJ1ZygpYCBhcyB0aGUgbW9kdWxlLlxuICovZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gZGVidWc7ZXhwb3J0cy5jb2VyY2UgPSBjb2VyY2U7ZXhwb3J0cy5kaXNhYmxlID0gZGlzYWJsZTtleHBvcnRzLmVuYWJsZSA9IGVuYWJsZTtleHBvcnRzLmVuYWJsZWQgPSBlbmFibGVkO2V4cG9ydHMuaHVtYW5pemUgPSBfZGVyZXFfKCdtcycpOyAvKipcbiAqIFRoZSBjdXJyZW50bHkgYWN0aXZlIGRlYnVnIG1vZGUgbmFtZXMsIGFuZCBuYW1lcyB0byBza2lwLlxuICovZXhwb3J0cy5uYW1lcyA9IFtdO2V4cG9ydHMuc2tpcHMgPSBbXTsgLyoqXG4gKiBNYXAgb2Ygc3BlY2lhbCBcIiVuXCIgaGFuZGxpbmcgZnVuY3Rpb25zLCBmb3IgdGhlIGRlYnVnIFwiZm9ybWF0XCIgYXJndW1lbnQuXG4gKlxuICogVmFsaWQga2V5IG5hbWVzIGFyZSBhIHNpbmdsZSwgbG93ZXJjYXNlZCBsZXR0ZXIsIGkuZS4gXCJuXCIuXG4gKi9leHBvcnRzLmZvcm1hdHRlcnMgPSB7fTsgLyoqXG4gKiBQcmV2aW91c2x5IGFzc2lnbmVkIGNvbG9yLlxuICovdmFyIHByZXZDb2xvcj0wOyAvKipcbiAqIFByZXZpb3VzIGxvZyB0aW1lc3RhbXAuXG4gKi92YXIgcHJldlRpbWU7IC8qKlxuICogU2VsZWN0IGEgY29sb3IuXG4gKlxuICogQHJldHVybiB7TnVtYmVyfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBzZWxlY3RDb2xvcigpe3JldHVybiBleHBvcnRzLmNvbG9yc1twcmV2Q29sb3IrKyAlIGV4cG9ydHMuY29sb3JzLmxlbmd0aF07fSAvKipcbiAqIENyZWF0ZSBhIGRlYnVnZ2VyIHdpdGggdGhlIGdpdmVuIGBuYW1lc3BhY2VgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIGRlYnVnKG5hbWVzcGFjZSl7IC8vIGRlZmluZSB0aGUgYGRpc2FibGVkYCB2ZXJzaW9uXG5mdW5jdGlvbiBkaXNhYmxlZCgpe31kaXNhYmxlZC5lbmFibGVkID0gZmFsc2U7IC8vIGRlZmluZSB0aGUgYGVuYWJsZWRgIHZlcnNpb25cbmZ1bmN0aW9uIGVuYWJsZWQoKXt2YXIgc2VsZj1lbmFibGVkOyAvLyBzZXQgYGRpZmZgIHRpbWVzdGFtcFxudmFyIGN1cnI9K25ldyBEYXRlKCk7dmFyIG1zPWN1cnIgLSAocHJldlRpbWUgfHwgY3Vycik7c2VsZi5kaWZmID0gbXM7c2VsZi5wcmV2ID0gcHJldlRpbWU7c2VsZi5jdXJyID0gY3VycjtwcmV2VGltZSA9IGN1cnI7IC8vIGFkZCB0aGUgYGNvbG9yYCBpZiBub3Qgc2V0XG5pZihudWxsID09IHNlbGYudXNlQ29sb3JzKXNlbGYudXNlQ29sb3JzID0gZXhwb3J0cy51c2VDb2xvcnMoKTtpZihudWxsID09IHNlbGYuY29sb3IgJiYgc2VsZi51c2VDb2xvcnMpc2VsZi5jb2xvciA9IHNlbGVjdENvbG9yKCk7dmFyIGFyZ3M9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTthcmdzWzBdID0gZXhwb3J0cy5jb2VyY2UoYXJnc1swXSk7aWYoJ3N0cmluZycgIT09IHR5cGVvZiBhcmdzWzBdKXsgLy8gYW55dGhpbmcgZWxzZSBsZXQncyBpbnNwZWN0IHdpdGggJW9cbmFyZ3MgPSBbJyVvJ10uY29uY2F0KGFyZ3MpO30gLy8gYXBwbHkgYW55IGBmb3JtYXR0ZXJzYCB0cmFuc2Zvcm1hdGlvbnNcbnZhciBpbmRleD0wO2FyZ3NbMF0gPSBhcmdzWzBdLnJlcGxhY2UoLyUoW2EteiVdKS9nLGZ1bmN0aW9uKG1hdGNoLGZvcm1hdCl7IC8vIGlmIHdlIGVuY291bnRlciBhbiBlc2NhcGVkICUgdGhlbiBkb24ndCBpbmNyZWFzZSB0aGUgYXJyYXkgaW5kZXhcbmlmKG1hdGNoID09PSAnJSUnKXJldHVybiBtYXRjaDtpbmRleCsrO3ZhciBmb3JtYXR0ZXI9ZXhwb3J0cy5mb3JtYXR0ZXJzW2Zvcm1hdF07aWYoJ2Z1bmN0aW9uJyA9PT0gdHlwZW9mIGZvcm1hdHRlcil7dmFyIHZhbD1hcmdzW2luZGV4XTttYXRjaCA9IGZvcm1hdHRlci5jYWxsKHNlbGYsdmFsKTsgLy8gbm93IHdlIG5lZWQgdG8gcmVtb3ZlIGBhcmdzW2luZGV4XWAgc2luY2UgaXQncyBpbmxpbmVkIGluIHRoZSBgZm9ybWF0YFxuYXJncy5zcGxpY2UoaW5kZXgsMSk7aW5kZXgtLTt9cmV0dXJuIG1hdGNoO30pO2lmKCdmdW5jdGlvbicgPT09IHR5cGVvZiBleHBvcnRzLmZvcm1hdEFyZ3Mpe2FyZ3MgPSBleHBvcnRzLmZvcm1hdEFyZ3MuYXBwbHkoc2VsZixhcmdzKTt9dmFyIGxvZ0ZuPWVuYWJsZWQubG9nIHx8IGV4cG9ydHMubG9nIHx8IGNvbnNvbGUubG9nLmJpbmQoY29uc29sZSk7bG9nRm4uYXBwbHkoc2VsZixhcmdzKTt9ZW5hYmxlZC5lbmFibGVkID0gdHJ1ZTt2YXIgZm49ZXhwb3J0cy5lbmFibGVkKG5hbWVzcGFjZSk/ZW5hYmxlZDpkaXNhYmxlZDtmbi5uYW1lc3BhY2UgPSBuYW1lc3BhY2U7cmV0dXJuIGZuO30gLyoqXG4gKiBFbmFibGVzIGEgZGVidWcgbW9kZSBieSBuYW1lc3BhY2VzLiBUaGlzIGNhbiBpbmNsdWRlIG1vZGVzXG4gKiBzZXBhcmF0ZWQgYnkgYSBjb2xvbiBhbmQgd2lsZGNhcmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lc3BhY2VzXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gZW5hYmxlKG5hbWVzcGFjZXMpe2V4cG9ydHMuc2F2ZShuYW1lc3BhY2VzKTt2YXIgc3BsaXQ9KG5hbWVzcGFjZXMgfHwgJycpLnNwbGl0KC9bXFxzLF0rLyk7dmFyIGxlbj1zcGxpdC5sZW5ndGg7Zm9yKHZhciBpPTA7aSA8IGxlbjtpKyspIHtpZighc3BsaXRbaV0pY29udGludWU7IC8vIGlnbm9yZSBlbXB0eSBzdHJpbmdzXG5uYW1lc3BhY2VzID0gc3BsaXRbaV0ucmVwbGFjZSgvXFwqL2csJy4qPycpO2lmKG5hbWVzcGFjZXNbMF0gPT09ICctJyl7ZXhwb3J0cy5za2lwcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcy5zdWJzdHIoMSkgKyAnJCcpKTt9ZWxzZSB7ZXhwb3J0cy5uYW1lcy5wdXNoKG5ldyBSZWdFeHAoJ14nICsgbmFtZXNwYWNlcyArICckJykpO319fSAvKipcbiAqIERpc2FibGUgZGVidWcgb3V0cHV0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBkaXNhYmxlKCl7ZXhwb3J0cy5lbmFibGUoJycpO30gLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG1vZGUgbmFtZSBpcyBlbmFibGVkLCBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gZW5hYmxlZChuYW1lKXt2YXIgaSxsZW47Zm9yKGkgPSAwLGxlbiA9IGV4cG9ydHMuc2tpcHMubGVuZ3RoO2kgPCBsZW47aSsrKSB7aWYoZXhwb3J0cy5za2lwc1tpXS50ZXN0KG5hbWUpKXtyZXR1cm4gZmFsc2U7fX1mb3IoaSA9IDAsbGVuID0gZXhwb3J0cy5uYW1lcy5sZW5ndGg7aSA8IGxlbjtpKyspIHtpZihleHBvcnRzLm5hbWVzW2ldLnRlc3QobmFtZSkpe3JldHVybiB0cnVlO319cmV0dXJuIGZhbHNlO30gLyoqXG4gKiBDb2VyY2UgYHZhbGAuXG4gKlxuICogQHBhcmFtIHtNaXhlZH0gdmFsXG4gKiBAcmV0dXJuIHtNaXhlZH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gY29lcmNlKHZhbCl7aWYodmFsIGluc3RhbmNlb2YgRXJyb3IpcmV0dXJuIHZhbC5zdGFjayB8fCB2YWwubWVzc2FnZTtyZXR1cm4gdmFsO319LHtcIm1zXCI6MjV9XSwxOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7KGZ1bmN0aW9uKGdsb2JhbCl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBrZXlzPV9kZXJlcV8oJy4va2V5cycpO3ZhciBoYXNCaW5hcnk9X2RlcmVxXygnaGFzLWJpbmFyeScpO3ZhciBzbGljZUJ1ZmZlcj1fZGVyZXFfKCdhcnJheWJ1ZmZlci5zbGljZScpO3ZhciBiYXNlNjRlbmNvZGVyPV9kZXJlcV8oJ2Jhc2U2NC1hcnJheWJ1ZmZlcicpO3ZhciBhZnRlcj1fZGVyZXFfKCdhZnRlcicpO3ZhciB1dGY4PV9kZXJlcV8oJ3V0ZjgnKTsgLyoqXG4gKiBDaGVjayBpZiB3ZSBhcmUgcnVubmluZyBhbiBhbmRyb2lkIGJyb3dzZXIuIFRoYXQgcmVxdWlyZXMgdXMgdG8gdXNlXG4gKiBBcnJheUJ1ZmZlciB3aXRoIHBvbGxpbmcgdHJhbnNwb3J0cy4uLlxuICpcbiAqIGh0dHA6Ly9naGluZGEubmV0L2pwZWctYmxvYi1hamF4LWFuZHJvaWQvXG4gKi92YXIgaXNBbmRyb2lkPW5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL0FuZHJvaWQvaSk7IC8qKlxuICogQ2hlY2sgaWYgd2UgYXJlIHJ1bm5pbmcgaW4gUGhhbnRvbUpTLlxuICogVXBsb2FkaW5nIGEgQmxvYiB3aXRoIFBoYW50b21KUyBkb2VzIG5vdCB3b3JrIGNvcnJlY3RseSwgYXMgcmVwb3J0ZWQgaGVyZTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hcml5YS9waGFudG9tanMvaXNzdWVzLzExMzk1XG4gKiBAdHlwZSBib29sZWFuXG4gKi92YXIgaXNQaGFudG9tSlM9L1BoYW50b21KUy9pLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7IC8qKlxuICogV2hlbiB0cnVlLCBhdm9pZHMgdXNpbmcgQmxvYnMgdG8gZW5jb2RlIHBheWxvYWRzLlxuICogQHR5cGUgYm9vbGVhblxuICovdmFyIGRvbnRTZW5kQmxvYnM9aXNBbmRyb2lkIHx8IGlzUGhhbnRvbUpTOyAvKipcbiAqIEN1cnJlbnQgcHJvdG9jb2wgdmVyc2lvbi5cbiAqL2V4cG9ydHMucHJvdG9jb2wgPSAzOyAvKipcbiAqIFBhY2tldCB0eXBlcy5cbiAqL3ZhciBwYWNrZXRzPWV4cG9ydHMucGFja2V0cyA9IHtvcGVuOjAsIC8vIG5vbi13c1xuY2xvc2U6MSwgLy8gbm9uLXdzXG5waW5nOjIscG9uZzozLG1lc3NhZ2U6NCx1cGdyYWRlOjUsbm9vcDo2fTt2YXIgcGFja2V0c2xpc3Q9a2V5cyhwYWNrZXRzKTsgLyoqXG4gKiBQcmVtYWRlIGVycm9yIHBhY2tldC5cbiAqL3ZhciBlcnI9e3R5cGU6J2Vycm9yJyxkYXRhOidwYXJzZXIgZXJyb3InfTsgLyoqXG4gKiBDcmVhdGUgYSBibG9iIGFwaSBldmVuIGZvciBibG9iIGJ1aWxkZXIgd2hlbiB2ZW5kb3IgcHJlZml4ZXMgZXhpc3RcbiAqL3ZhciBCbG9iPV9kZXJlcV8oJ2Jsb2InKTsgLyoqXG4gKiBFbmNvZGVzIGEgcGFja2V0LlxuICpcbiAqICAgICA8cGFja2V0IHR5cGUgaWQ+IFsgPGRhdGE+IF1cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqICAgICA1aGVsbG8gd29ybGRcbiAqICAgICAzXG4gKiAgICAgNFxuICpcbiAqIEJpbmFyeSBpcyBlbmNvZGVkIGluIGFuIGlkZW50aWNhbCBwcmluY2lwbGVcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL2V4cG9ydHMuZW5jb2RlUGFja2V0ID0gZnVuY3Rpb24ocGFja2V0LHN1cHBvcnRzQmluYXJ5LHV0ZjhlbmNvZGUsY2FsbGJhY2spe2lmKCdmdW5jdGlvbicgPT0gdHlwZW9mIHN1cHBvcnRzQmluYXJ5KXtjYWxsYmFjayA9IHN1cHBvcnRzQmluYXJ5O3N1cHBvcnRzQmluYXJ5ID0gZmFsc2U7fWlmKCdmdW5jdGlvbicgPT0gdHlwZW9mIHV0ZjhlbmNvZGUpe2NhbGxiYWNrID0gdXRmOGVuY29kZTt1dGY4ZW5jb2RlID0gbnVsbDt9dmFyIGRhdGE9cGFja2V0LmRhdGEgPT09IHVuZGVmaW5lZD91bmRlZmluZWQ6cGFja2V0LmRhdGEuYnVmZmVyIHx8IHBhY2tldC5kYXRhO2lmKGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBkYXRhIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpe3JldHVybiBlbmNvZGVBcnJheUJ1ZmZlcihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spO31lbHNlIGlmKEJsb2IgJiYgZGF0YSBpbnN0YW5jZW9mIGdsb2JhbC5CbG9iKXtyZXR1cm4gZW5jb2RlQmxvYihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spO30gLy8gbWlnaHQgYmUgYW4gb2JqZWN0IHdpdGggeyBiYXNlNjQ6IHRydWUsIGRhdGE6IGRhdGFBc0Jhc2U2NFN0cmluZyB9XG5pZihkYXRhICYmIGRhdGEuYmFzZTY0KXtyZXR1cm4gZW5jb2RlQmFzZTY0T2JqZWN0KHBhY2tldCxjYWxsYmFjayk7fSAvLyBTZW5kaW5nIGRhdGEgYXMgYSB1dGYtOCBzdHJpbmdcbnZhciBlbmNvZGVkPXBhY2tldHNbcGFja2V0LnR5cGVdOyAvLyBkYXRhIGZyYWdtZW50IGlzIG9wdGlvbmFsXG5pZih1bmRlZmluZWQgIT09IHBhY2tldC5kYXRhKXtlbmNvZGVkICs9IHV0ZjhlbmNvZGU/dXRmOC5lbmNvZGUoU3RyaW5nKHBhY2tldC5kYXRhKSk6U3RyaW5nKHBhY2tldC5kYXRhKTt9cmV0dXJuIGNhbGxiYWNrKCcnICsgZW5jb2RlZCk7fTtmdW5jdGlvbiBlbmNvZGVCYXNlNjRPYmplY3QocGFja2V0LGNhbGxiYWNrKXsgLy8gcGFja2V0IGRhdGEgaXMgYW4gb2JqZWN0IHsgYmFzZTY0OiB0cnVlLCBkYXRhOiBkYXRhQXNCYXNlNjRTdHJpbmcgfVxudmFyIG1lc3NhZ2U9J2InICsgZXhwb3J0cy5wYWNrZXRzW3BhY2tldC50eXBlXSArIHBhY2tldC5kYXRhLmRhdGE7cmV0dXJuIGNhbGxiYWNrKG1lc3NhZ2UpO30gLyoqXG4gKiBFbmNvZGUgcGFja2V0IGhlbHBlcnMgZm9yIGJpbmFyeSB0eXBlc1xuICovZnVuY3Rpb24gZW5jb2RlQXJyYXlCdWZmZXIocGFja2V0LHN1cHBvcnRzQmluYXJ5LGNhbGxiYWNrKXtpZighc3VwcG9ydHNCaW5hcnkpe3JldHVybiBleHBvcnRzLmVuY29kZUJhc2U2NFBhY2tldChwYWNrZXQsY2FsbGJhY2spO312YXIgZGF0YT1wYWNrZXQuZGF0YTt2YXIgY29udGVudEFycmF5PW5ldyBVaW50OEFycmF5KGRhdGEpO3ZhciByZXN1bHRCdWZmZXI9bmV3IFVpbnQ4QXJyYXkoMSArIGRhdGEuYnl0ZUxlbmd0aCk7cmVzdWx0QnVmZmVyWzBdID0gcGFja2V0c1twYWNrZXQudHlwZV07Zm9yKHZhciBpPTA7aSA8IGNvbnRlbnRBcnJheS5sZW5ndGg7aSsrKSB7cmVzdWx0QnVmZmVyW2kgKyAxXSA9IGNvbnRlbnRBcnJheVtpXTt9cmV0dXJuIGNhbGxiYWNrKHJlc3VsdEJ1ZmZlci5idWZmZXIpO31mdW5jdGlvbiBlbmNvZGVCbG9iQXNBcnJheUJ1ZmZlcihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spe2lmKCFzdXBwb3J0c0JpbmFyeSl7cmV0dXJuIGV4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0KHBhY2tldCxjYWxsYmFjayk7fXZhciBmcj1uZXcgRmlsZVJlYWRlcigpO2ZyLm9ubG9hZCA9IGZ1bmN0aW9uKCl7cGFja2V0LmRhdGEgPSBmci5yZXN1bHQ7ZXhwb3J0cy5lbmNvZGVQYWNrZXQocGFja2V0LHN1cHBvcnRzQmluYXJ5LHRydWUsY2FsbGJhY2spO307cmV0dXJuIGZyLnJlYWRBc0FycmF5QnVmZmVyKHBhY2tldC5kYXRhKTt9ZnVuY3Rpb24gZW5jb2RlQmxvYihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spe2lmKCFzdXBwb3J0c0JpbmFyeSl7cmV0dXJuIGV4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0KHBhY2tldCxjYWxsYmFjayk7fWlmKGRvbnRTZW5kQmxvYnMpe3JldHVybiBlbmNvZGVCbG9iQXNBcnJheUJ1ZmZlcihwYWNrZXQsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spO312YXIgbGVuZ3RoPW5ldyBVaW50OEFycmF5KDEpO2xlbmd0aFswXSA9IHBhY2tldHNbcGFja2V0LnR5cGVdO3ZhciBibG9iPW5ldyBCbG9iKFtsZW5ndGguYnVmZmVyLHBhY2tldC5kYXRhXSk7cmV0dXJuIGNhbGxiYWNrKGJsb2IpO30gLyoqXG4gKiBFbmNvZGVzIGEgcGFja2V0IHdpdGggYmluYXJ5IGRhdGEgaW4gYSBiYXNlNjQgc3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldCwgaGFzIGB0eXBlYCBhbmQgYGRhdGFgXG4gKiBAcmV0dXJuIHtTdHJpbmd9IGJhc2U2NCBlbmNvZGVkIG1lc3NhZ2VcbiAqL2V4cG9ydHMuZW5jb2RlQmFzZTY0UGFja2V0ID0gZnVuY3Rpb24ocGFja2V0LGNhbGxiYWNrKXt2YXIgbWVzc2FnZT0nYicgKyBleHBvcnRzLnBhY2tldHNbcGFja2V0LnR5cGVdO2lmKEJsb2IgJiYgcGFja2V0LmRhdGEgaW5zdGFuY2VvZiBnbG9iYWwuQmxvYil7dmFyIGZyPW5ldyBGaWxlUmVhZGVyKCk7ZnIub25sb2FkID0gZnVuY3Rpb24oKXt2YXIgYjY0PWZyLnJlc3VsdC5zcGxpdCgnLCcpWzFdO2NhbGxiYWNrKG1lc3NhZ2UgKyBiNjQpO307cmV0dXJuIGZyLnJlYWRBc0RhdGFVUkwocGFja2V0LmRhdGEpO312YXIgYjY0ZGF0YTt0cnl7YjY0ZGF0YSA9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxuZXcgVWludDhBcnJheShwYWNrZXQuZGF0YSkpO31jYXRjaChlKSB7IC8vIGlQaG9uZSBTYWZhcmkgZG9lc24ndCBsZXQgeW91IGFwcGx5IHdpdGggdHlwZWQgYXJyYXlzXG52YXIgdHlwZWQ9bmV3IFVpbnQ4QXJyYXkocGFja2V0LmRhdGEpO3ZhciBiYXNpYz1uZXcgQXJyYXkodHlwZWQubGVuZ3RoKTtmb3IodmFyIGk9MDtpIDwgdHlwZWQubGVuZ3RoO2krKykge2Jhc2ljW2ldID0gdHlwZWRbaV07fWI2NGRhdGEgPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KG51bGwsYmFzaWMpO31tZXNzYWdlICs9IGdsb2JhbC5idG9hKGI2NGRhdGEpO3JldHVybiBjYWxsYmFjayhtZXNzYWdlKTt9OyAvKipcbiAqIERlY29kZXMgYSBwYWNrZXQuIENoYW5nZXMgZm9ybWF0IHRvIEJsb2IgaWYgcmVxdWVzdGVkLlxuICpcbiAqIEByZXR1cm4ge09iamVjdH0gd2l0aCBgdHlwZWAgYW5kIGBkYXRhYCAoaWYgYW55KVxuICogQGFwaSBwcml2YXRlXG4gKi9leHBvcnRzLmRlY29kZVBhY2tldCA9IGZ1bmN0aW9uKGRhdGEsYmluYXJ5VHlwZSx1dGY4ZGVjb2RlKXsgLy8gU3RyaW5nIGRhdGFcbmlmKHR5cGVvZiBkYXRhID09ICdzdHJpbmcnIHx8IGRhdGEgPT09IHVuZGVmaW5lZCl7aWYoZGF0YS5jaGFyQXQoMCkgPT0gJ2InKXtyZXR1cm4gZXhwb3J0cy5kZWNvZGVCYXNlNjRQYWNrZXQoZGF0YS5zdWJzdHIoMSksYmluYXJ5VHlwZSk7fWlmKHV0ZjhkZWNvZGUpe3RyeXtkYXRhID0gdXRmOC5kZWNvZGUoZGF0YSk7fWNhdGNoKGUpIHtyZXR1cm4gZXJyO319dmFyIHR5cGU9ZGF0YS5jaGFyQXQoMCk7aWYoTnVtYmVyKHR5cGUpICE9IHR5cGUgfHwgIXBhY2tldHNsaXN0W3R5cGVdKXtyZXR1cm4gZXJyO31pZihkYXRhLmxlbmd0aCA+IDEpe3JldHVybiB7dHlwZTpwYWNrZXRzbGlzdFt0eXBlXSxkYXRhOmRhdGEuc3Vic3RyaW5nKDEpfTt9ZWxzZSB7cmV0dXJuIHt0eXBlOnBhY2tldHNsaXN0W3R5cGVdfTt9fXZhciBhc0FycmF5PW5ldyBVaW50OEFycmF5KGRhdGEpO3ZhciB0eXBlPWFzQXJyYXlbMF07dmFyIHJlc3Q9c2xpY2VCdWZmZXIoZGF0YSwxKTtpZihCbG9iICYmIGJpbmFyeVR5cGUgPT09ICdibG9iJyl7cmVzdCA9IG5ldyBCbG9iKFtyZXN0XSk7fXJldHVybiB7dHlwZTpwYWNrZXRzbGlzdFt0eXBlXSxkYXRhOnJlc3R9O307IC8qKlxuICogRGVjb2RlcyBhIHBhY2tldCBlbmNvZGVkIGluIGEgYmFzZTY0IHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlNjQgZW5jb2RlZCBtZXNzYWdlXG4gKiBAcmV0dXJuIHtPYmplY3R9IHdpdGggYHR5cGVgIGFuZCBgZGF0YWAgKGlmIGFueSlcbiAqL2V4cG9ydHMuZGVjb2RlQmFzZTY0UGFja2V0ID0gZnVuY3Rpb24obXNnLGJpbmFyeVR5cGUpe3ZhciB0eXBlPXBhY2tldHNsaXN0W21zZy5jaGFyQXQoMCldO2lmKCFnbG9iYWwuQXJyYXlCdWZmZXIpe3JldHVybiB7dHlwZTp0eXBlLGRhdGE6e2Jhc2U2NDp0cnVlLGRhdGE6bXNnLnN1YnN0cigxKX19O312YXIgZGF0YT1iYXNlNjRlbmNvZGVyLmRlY29kZShtc2cuc3Vic3RyKDEpKTtpZihiaW5hcnlUeXBlID09PSAnYmxvYicgJiYgQmxvYil7ZGF0YSA9IG5ldyBCbG9iKFtkYXRhXSk7fXJldHVybiB7dHlwZTp0eXBlLGRhdGE6ZGF0YX07fTsgLyoqXG4gKiBFbmNvZGVzIG11bHRpcGxlIG1lc3NhZ2VzIChwYXlsb2FkKS5cbiAqXG4gKiAgICAgPGxlbmd0aD46ZGF0YVxuICpcbiAqIEV4YW1wbGU6XG4gKlxuICogICAgIDExOmhlbGxvIHdvcmxkMjpoaVxuICpcbiAqIElmIGFueSBjb250ZW50cyBhcmUgYmluYXJ5LCB0aGV5IHdpbGwgYmUgZW5jb2RlZCBhcyBiYXNlNjQgc3RyaW5ncy4gQmFzZTY0XG4gKiBlbmNvZGVkIHN0cmluZ3MgYXJlIG1hcmtlZCB3aXRoIGEgYiBiZWZvcmUgdGhlIGxlbmd0aCBzcGVjaWZpZXJcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWNrZXRzXG4gKiBAYXBpIHByaXZhdGVcbiAqL2V4cG9ydHMuZW5jb2RlUGF5bG9hZCA9IGZ1bmN0aW9uKHBhY2tldHMsc3VwcG9ydHNCaW5hcnksY2FsbGJhY2spe2lmKHR5cGVvZiBzdXBwb3J0c0JpbmFyeSA9PSAnZnVuY3Rpb24nKXtjYWxsYmFjayA9IHN1cHBvcnRzQmluYXJ5O3N1cHBvcnRzQmluYXJ5ID0gbnVsbDt9dmFyIGlzQmluYXJ5PWhhc0JpbmFyeShwYWNrZXRzKTtpZihzdXBwb3J0c0JpbmFyeSAmJiBpc0JpbmFyeSl7aWYoQmxvYiAmJiAhZG9udFNlbmRCbG9icyl7cmV0dXJuIGV4cG9ydHMuZW5jb2RlUGF5bG9hZEFzQmxvYihwYWNrZXRzLGNhbGxiYWNrKTt9cmV0dXJuIGV4cG9ydHMuZW5jb2RlUGF5bG9hZEFzQXJyYXlCdWZmZXIocGFja2V0cyxjYWxsYmFjayk7fWlmKCFwYWNrZXRzLmxlbmd0aCl7cmV0dXJuIGNhbGxiYWNrKCcwOicpO31mdW5jdGlvbiBzZXRMZW5ndGhIZWFkZXIobWVzc2FnZSl7cmV0dXJuIG1lc3NhZ2UubGVuZ3RoICsgJzonICsgbWVzc2FnZTt9ZnVuY3Rpb24gZW5jb2RlT25lKHBhY2tldCxkb25lQ2FsbGJhY2spe2V4cG9ydHMuZW5jb2RlUGFja2V0KHBhY2tldCwhaXNCaW5hcnk/ZmFsc2U6c3VwcG9ydHNCaW5hcnksdHJ1ZSxmdW5jdGlvbihtZXNzYWdlKXtkb25lQ2FsbGJhY2sobnVsbCxzZXRMZW5ndGhIZWFkZXIobWVzc2FnZSkpO30pO31tYXAocGFja2V0cyxlbmNvZGVPbmUsZnVuY3Rpb24oZXJyLHJlc3VsdHMpe3JldHVybiBjYWxsYmFjayhyZXN1bHRzLmpvaW4oJycpKTt9KTt9OyAvKipcbiAqIEFzeW5jIGFycmF5IG1hcCB1c2luZyBhZnRlclxuICovZnVuY3Rpb24gbWFwKGFyeSxlYWNoLGRvbmUpe3ZhciByZXN1bHQ9bmV3IEFycmF5KGFyeS5sZW5ndGgpO3ZhciBuZXh0PWFmdGVyKGFyeS5sZW5ndGgsZG9uZSk7dmFyIGVhY2hXaXRoSW5kZXg9ZnVuY3Rpb24gZWFjaFdpdGhJbmRleChpLGVsLGNiKXtlYWNoKGVsLGZ1bmN0aW9uKGVycm9yLG1zZyl7cmVzdWx0W2ldID0gbXNnO2NiKGVycm9yLHJlc3VsdCk7fSk7fTtmb3IodmFyIGk9MDtpIDwgYXJ5Lmxlbmd0aDtpKyspIHtlYWNoV2l0aEluZGV4KGksYXJ5W2ldLG5leHQpO319IC8qXG4gKiBEZWNvZGVzIGRhdGEgd2hlbiBhIHBheWxvYWQgaXMgbWF5YmUgZXhwZWN0ZWQuIFBvc3NpYmxlIGJpbmFyeSBjb250ZW50cyBhcmVcbiAqIGRlY29kZWQgZnJvbSB0aGVpciBiYXNlNjQgcmVwcmVzZW50YXRpb25cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZGF0YSwgY2FsbGJhY2sgbWV0aG9kXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5kZWNvZGVQYXlsb2FkID0gZnVuY3Rpb24oZGF0YSxiaW5hcnlUeXBlLGNhbGxiYWNrKXtpZih0eXBlb2YgZGF0YSAhPSAnc3RyaW5nJyl7cmV0dXJuIGV4cG9ydHMuZGVjb2RlUGF5bG9hZEFzQmluYXJ5KGRhdGEsYmluYXJ5VHlwZSxjYWxsYmFjayk7fWlmKHR5cGVvZiBiaW5hcnlUeXBlID09PSAnZnVuY3Rpb24nKXtjYWxsYmFjayA9IGJpbmFyeVR5cGU7YmluYXJ5VHlwZSA9IG51bGw7fXZhciBwYWNrZXQ7aWYoZGF0YSA9PSAnJyl7IC8vIHBhcnNlciBlcnJvciAtIGlnbm9yaW5nIHBheWxvYWRcbnJldHVybiBjYWxsYmFjayhlcnIsMCwxKTt9dmFyIGxlbmd0aD0nJyxuLG1zZztmb3IodmFyIGk9MCxsPWRhdGEubGVuZ3RoO2kgPCBsO2krKykge3ZhciBjaHI9ZGF0YS5jaGFyQXQoaSk7aWYoJzonICE9IGNocil7bGVuZ3RoICs9IGNocjt9ZWxzZSB7aWYoJycgPT0gbGVuZ3RoIHx8IGxlbmd0aCAhPSAobiA9IE51bWJlcihsZW5ndGgpKSl7IC8vIHBhcnNlciBlcnJvciAtIGlnbm9yaW5nIHBheWxvYWRcbnJldHVybiBjYWxsYmFjayhlcnIsMCwxKTt9bXNnID0gZGF0YS5zdWJzdHIoaSArIDEsbik7aWYobGVuZ3RoICE9IG1zZy5sZW5ndGgpeyAvLyBwYXJzZXIgZXJyb3IgLSBpZ25vcmluZyBwYXlsb2FkXG5yZXR1cm4gY2FsbGJhY2soZXJyLDAsMSk7fWlmKG1zZy5sZW5ndGgpe3BhY2tldCA9IGV4cG9ydHMuZGVjb2RlUGFja2V0KG1zZyxiaW5hcnlUeXBlLHRydWUpO2lmKGVyci50eXBlID09IHBhY2tldC50eXBlICYmIGVyci5kYXRhID09IHBhY2tldC5kYXRhKXsgLy8gcGFyc2VyIGVycm9yIGluIGluZGl2aWR1YWwgcGFja2V0IC0gaWdub3JpbmcgcGF5bG9hZFxucmV0dXJuIGNhbGxiYWNrKGVyciwwLDEpO312YXIgcmV0PWNhbGxiYWNrKHBhY2tldCxpICsgbixsKTtpZihmYWxzZSA9PT0gcmV0KXJldHVybjt9IC8vIGFkdmFuY2UgY3Vyc29yXG5pICs9IG47bGVuZ3RoID0gJyc7fX1pZihsZW5ndGggIT0gJycpeyAvLyBwYXJzZXIgZXJyb3IgLSBpZ25vcmluZyBwYXlsb2FkXG5yZXR1cm4gY2FsbGJhY2soZXJyLDAsMSk7fX07IC8qKlxuICogRW5jb2RlcyBtdWx0aXBsZSBtZXNzYWdlcyAocGF5bG9hZCkgYXMgYmluYXJ5LlxuICpcbiAqIDwxID0gYmluYXJ5LCAwID0gc3RyaW5nPjxudW1iZXIgZnJvbSAwLTk+PG51bWJlciBmcm9tIDAtOT5bLi4uXTxudW1iZXJcbiAqIDI1NT48ZGF0YT5cbiAqXG4gKiBFeGFtcGxlOlxuICogMSAzIDI1NSAxIDIgMywgaWYgdGhlIGJpbmFyeSBjb250ZW50cyBhcmUgaW50ZXJwcmV0ZWQgYXMgOCBiaXQgaW50ZWdlcnNcbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYWNrZXRzXG4gKiBAcmV0dXJuIHtBcnJheUJ1ZmZlcn0gZW5jb2RlZCBwYXlsb2FkXG4gKiBAYXBpIHByaXZhdGVcbiAqL2V4cG9ydHMuZW5jb2RlUGF5bG9hZEFzQXJyYXlCdWZmZXIgPSBmdW5jdGlvbihwYWNrZXRzLGNhbGxiYWNrKXtpZighcGFja2V0cy5sZW5ndGgpe3JldHVybiBjYWxsYmFjayhuZXcgQXJyYXlCdWZmZXIoMCkpO31mdW5jdGlvbiBlbmNvZGVPbmUocGFja2V0LGRvbmVDYWxsYmFjayl7ZXhwb3J0cy5lbmNvZGVQYWNrZXQocGFja2V0LHRydWUsdHJ1ZSxmdW5jdGlvbihkYXRhKXtyZXR1cm4gZG9uZUNhbGxiYWNrKG51bGwsZGF0YSk7fSk7fW1hcChwYWNrZXRzLGVuY29kZU9uZSxmdW5jdGlvbihlcnIsZW5jb2RlZFBhY2tldHMpe3ZhciB0b3RhbExlbmd0aD1lbmNvZGVkUGFja2V0cy5yZWR1Y2UoZnVuY3Rpb24oYWNjLHApe3ZhciBsZW47aWYodHlwZW9mIHAgPT09ICdzdHJpbmcnKXtsZW4gPSBwLmxlbmd0aDt9ZWxzZSB7bGVuID0gcC5ieXRlTGVuZ3RoO31yZXR1cm4gYWNjICsgbGVuLnRvU3RyaW5nKCkubGVuZ3RoICsgbGVuICsgMjsgLy8gc3RyaW5nL2JpbmFyeSBpZGVudGlmaWVyICsgc2VwYXJhdG9yID0gMlxufSwwKTt2YXIgcmVzdWx0QXJyYXk9bmV3IFVpbnQ4QXJyYXkodG90YWxMZW5ndGgpO3ZhciBidWZmZXJJbmRleD0wO2VuY29kZWRQYWNrZXRzLmZvckVhY2goZnVuY3Rpb24ocCl7dmFyIGlzU3RyaW5nPXR5cGVvZiBwID09PSAnc3RyaW5nJzt2YXIgYWI9cDtpZihpc1N0cmluZyl7dmFyIHZpZXc9bmV3IFVpbnQ4QXJyYXkocC5sZW5ndGgpO2Zvcih2YXIgaT0wO2kgPCBwLmxlbmd0aDtpKyspIHt2aWV3W2ldID0gcC5jaGFyQ29kZUF0KGkpO31hYiA9IHZpZXcuYnVmZmVyO31pZihpc1N0cmluZyl7IC8vIG5vdCB0cnVlIGJpbmFyeVxucmVzdWx0QXJyYXlbYnVmZmVySW5kZXgrK10gPSAwO31lbHNlIHsgLy8gdHJ1ZSBiaW5hcnlcbnJlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gMTt9dmFyIGxlblN0cj1hYi5ieXRlTGVuZ3RoLnRvU3RyaW5nKCk7Zm9yKHZhciBpPTA7aSA8IGxlblN0ci5sZW5ndGg7aSsrKSB7cmVzdWx0QXJyYXlbYnVmZmVySW5kZXgrK10gPSBwYXJzZUludChsZW5TdHJbaV0pO31yZXN1bHRBcnJheVtidWZmZXJJbmRleCsrXSA9IDI1NTt2YXIgdmlldz1uZXcgVWludDhBcnJheShhYik7Zm9yKHZhciBpPTA7aSA8IHZpZXcubGVuZ3RoO2krKykge3Jlc3VsdEFycmF5W2J1ZmZlckluZGV4KytdID0gdmlld1tpXTt9fSk7cmV0dXJuIGNhbGxiYWNrKHJlc3VsdEFycmF5LmJ1ZmZlcik7fSk7fTsgLyoqXG4gKiBFbmNvZGUgYXMgQmxvYlxuICovZXhwb3J0cy5lbmNvZGVQYXlsb2FkQXNCbG9iID0gZnVuY3Rpb24ocGFja2V0cyxjYWxsYmFjayl7ZnVuY3Rpb24gZW5jb2RlT25lKHBhY2tldCxkb25lQ2FsbGJhY2spe2V4cG9ydHMuZW5jb2RlUGFja2V0KHBhY2tldCx0cnVlLHRydWUsZnVuY3Rpb24oZW5jb2RlZCl7dmFyIGJpbmFyeUlkZW50aWZpZXI9bmV3IFVpbnQ4QXJyYXkoMSk7YmluYXJ5SWRlbnRpZmllclswXSA9IDE7aWYodHlwZW9mIGVuY29kZWQgPT09ICdzdHJpbmcnKXt2YXIgdmlldz1uZXcgVWludDhBcnJheShlbmNvZGVkLmxlbmd0aCk7Zm9yKHZhciBpPTA7aSA8IGVuY29kZWQubGVuZ3RoO2krKykge3ZpZXdbaV0gPSBlbmNvZGVkLmNoYXJDb2RlQXQoaSk7fWVuY29kZWQgPSB2aWV3LmJ1ZmZlcjtiaW5hcnlJZGVudGlmaWVyWzBdID0gMDt9dmFyIGxlbj1lbmNvZGVkIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI/ZW5jb2RlZC5ieXRlTGVuZ3RoOmVuY29kZWQuc2l6ZTt2YXIgbGVuU3RyPWxlbi50b1N0cmluZygpO3ZhciBsZW5ndGhBcnk9bmV3IFVpbnQ4QXJyYXkobGVuU3RyLmxlbmd0aCArIDEpO2Zvcih2YXIgaT0wO2kgPCBsZW5TdHIubGVuZ3RoO2krKykge2xlbmd0aEFyeVtpXSA9IHBhcnNlSW50KGxlblN0cltpXSk7fWxlbmd0aEFyeVtsZW5TdHIubGVuZ3RoXSA9IDI1NTtpZihCbG9iKXt2YXIgYmxvYj1uZXcgQmxvYihbYmluYXJ5SWRlbnRpZmllci5idWZmZXIsbGVuZ3RoQXJ5LmJ1ZmZlcixlbmNvZGVkXSk7ZG9uZUNhbGxiYWNrKG51bGwsYmxvYik7fX0pO31tYXAocGFja2V0cyxlbmNvZGVPbmUsZnVuY3Rpb24oZXJyLHJlc3VsdHMpe3JldHVybiBjYWxsYmFjayhuZXcgQmxvYihyZXN1bHRzKSk7fSk7fTsgLypcbiAqIERlY29kZXMgZGF0YSB3aGVuIGEgcGF5bG9hZCBpcyBtYXliZSBleHBlY3RlZC4gU3RyaW5ncyBhcmUgZGVjb2RlZCBieVxuICogaW50ZXJwcmV0aW5nIGVhY2ggYnl0ZSBhcyBhIGtleSBjb2RlIGZvciBlbnRyaWVzIG1hcmtlZCB0byBzdGFydCB3aXRoIDAuIFNlZVxuICogZGVzY3JpcHRpb24gb2YgZW5jb2RlUGF5bG9hZEFzQmluYXJ5XG4gKlxuICogQHBhcmFtIHtBcnJheUJ1ZmZlcn0gZGF0YSwgY2FsbGJhY2sgbWV0aG9kXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5kZWNvZGVQYXlsb2FkQXNCaW5hcnkgPSBmdW5jdGlvbihkYXRhLGJpbmFyeVR5cGUsY2FsbGJhY2spe2lmKHR5cGVvZiBiaW5hcnlUeXBlID09PSAnZnVuY3Rpb24nKXtjYWxsYmFjayA9IGJpbmFyeVR5cGU7YmluYXJ5VHlwZSA9IG51bGw7fXZhciBidWZmZXJUYWlsPWRhdGE7dmFyIGJ1ZmZlcnM9W107dmFyIG51bWJlclRvb0xvbmc9ZmFsc2U7d2hpbGUoYnVmZmVyVGFpbC5ieXRlTGVuZ3RoID4gMCkge3ZhciB0YWlsQXJyYXk9bmV3IFVpbnQ4QXJyYXkoYnVmZmVyVGFpbCk7dmFyIGlzU3RyaW5nPXRhaWxBcnJheVswXSA9PT0gMDt2YXIgbXNnTGVuZ3RoPScnO2Zvcih2YXIgaT0xOztpKyspIHtpZih0YWlsQXJyYXlbaV0gPT0gMjU1KWJyZWFrO2lmKG1zZ0xlbmd0aC5sZW5ndGggPiAzMTApe251bWJlclRvb0xvbmcgPSB0cnVlO2JyZWFrO31tc2dMZW5ndGggKz0gdGFpbEFycmF5W2ldO31pZihudW1iZXJUb29Mb25nKXJldHVybiBjYWxsYmFjayhlcnIsMCwxKTtidWZmZXJUYWlsID0gc2xpY2VCdWZmZXIoYnVmZmVyVGFpbCwyICsgbXNnTGVuZ3RoLmxlbmd0aCk7bXNnTGVuZ3RoID0gcGFyc2VJbnQobXNnTGVuZ3RoKTt2YXIgbXNnPXNsaWNlQnVmZmVyKGJ1ZmZlclRhaWwsMCxtc2dMZW5ndGgpO2lmKGlzU3RyaW5nKXt0cnl7bXNnID0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLG5ldyBVaW50OEFycmF5KG1zZykpO31jYXRjaChlKSB7IC8vIGlQaG9uZSBTYWZhcmkgZG9lc24ndCBsZXQgeW91IGFwcGx5IHRvIHR5cGVkIGFycmF5c1xudmFyIHR5cGVkPW5ldyBVaW50OEFycmF5KG1zZyk7bXNnID0gJyc7Zm9yKHZhciBpPTA7aSA8IHR5cGVkLmxlbmd0aDtpKyspIHttc2cgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh0eXBlZFtpXSk7fX19YnVmZmVycy5wdXNoKG1zZyk7YnVmZmVyVGFpbCA9IHNsaWNlQnVmZmVyKGJ1ZmZlclRhaWwsbXNnTGVuZ3RoKTt9dmFyIHRvdGFsPWJ1ZmZlcnMubGVuZ3RoO2J1ZmZlcnMuZm9yRWFjaChmdW5jdGlvbihidWZmZXIsaSl7Y2FsbGJhY2soZXhwb3J0cy5kZWNvZGVQYWNrZXQoYnVmZmVyLGJpbmFyeVR5cGUsdHJ1ZSksaSx0b3RhbCk7fSk7fTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCIuL2tleXNcIjoyMCxcImFmdGVyXCI6MTEsXCJhcnJheWJ1ZmZlci5zbGljZVwiOjEyLFwiYmFzZTY0LWFycmF5YnVmZmVyXCI6MTMsXCJibG9iXCI6MTQsXCJoYXMtYmluYXJ5XCI6MjEsXCJ1dGY4XCI6Mjl9XSwyMDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogR2V0cyB0aGUga2V5cyBmb3IgYW4gb2JqZWN0LlxuICpcbiAqIEByZXR1cm4ge0FycmF5fSBrZXlzXG4gKiBAYXBpIHByaXZhdGVcbiAqL21vZHVsZS5leHBvcnRzID0gT2JqZWN0LmtleXMgfHwgZnVuY3Rpb24ga2V5cyhvYmope3ZhciBhcnI9W107dmFyIGhhcz1PYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O2Zvcih2YXIgaSBpbiBvYmopIHtpZihoYXMuY2FsbChvYmosaSkpe2Fyci5wdXNoKGkpO319cmV0dXJuIGFycjt9O30se31dLDIxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLypcbiAqIE1vZHVsZSByZXF1aXJlbWVudHMuXG4gKi92YXIgaXNBcnJheT1fZGVyZXFfKCdpc2FycmF5Jyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IGhhc0JpbmFyeTsgLyoqXG4gKiBDaGVja3MgZm9yIGJpbmFyeSBkYXRhLlxuICpcbiAqIFJpZ2h0IG5vdyBvbmx5IEJ1ZmZlciBhbmQgQXJyYXlCdWZmZXIgYXJlIHN1cHBvcnRlZC4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFueXRoaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gaGFzQmluYXJ5KGRhdGEpe2Z1bmN0aW9uIF9oYXNCaW5hcnkob2JqKXtpZighb2JqKXJldHVybiBmYWxzZTtpZihnbG9iYWwuQnVmZmVyICYmIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIob2JqKSB8fCBnbG9iYWwuQXJyYXlCdWZmZXIgJiYgb2JqIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHwgZ2xvYmFsLkJsb2IgJiYgb2JqIGluc3RhbmNlb2YgQmxvYiB8fCBnbG9iYWwuRmlsZSAmJiBvYmogaW5zdGFuY2VvZiBGaWxlKXtyZXR1cm4gdHJ1ZTt9aWYoaXNBcnJheShvYmopKXtmb3IodmFyIGk9MDtpIDwgb2JqLmxlbmd0aDtpKyspIHtpZihfaGFzQmluYXJ5KG9ialtpXSkpe3JldHVybiB0cnVlO319fWVsc2UgaWYob2JqICYmICdvYmplY3QnID09IHR5cGVvZiBvYmope2lmKG9iai50b0pTT04pe29iaiA9IG9iai50b0pTT04oKTt9Zm9yKHZhciBrZXkgaW4gb2JqKSB7aWYoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaixrZXkpICYmIF9oYXNCaW5hcnkob2JqW2tleV0pKXtyZXR1cm4gdHJ1ZTt9fX1yZXR1cm4gZmFsc2U7fXJldHVybiBfaGFzQmluYXJ5KGRhdGEpO319KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7XCJpc2FycmF5XCI6MjR9XSwyMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKlxuICogTG9naWMgYm9ycm93ZWQgZnJvbSBNb2Rlcm5penI6XG4gKlxuICogICAtIGh0dHBzOi8vZ2l0aHViLmNvbS9Nb2Rlcm5penIvTW9kZXJuaXpyL2Jsb2IvbWFzdGVyL2ZlYXR1cmUtZGV0ZWN0cy9jb3JzLmpzXG4gKi90cnl7bW9kdWxlLmV4cG9ydHMgPSB0eXBlb2YgWE1MSHR0cFJlcXVlc3QgIT09ICd1bmRlZmluZWQnICYmICd3aXRoQ3JlZGVudGlhbHMnIGluIG5ldyBYTUxIdHRwUmVxdWVzdCgpO31jYXRjaChlcnIpIHsgLy8gaWYgWE1MSHR0cCBzdXBwb3J0IGlzIGRpc2FibGVkIGluIElFIHRoZW4gaXQgd2lsbCB0aHJvd1xuLy8gd2hlbiB0cnlpbmcgdG8gY3JlYXRlXG5tb2R1bGUuZXhwb3J0cyA9IGZhbHNlO319LHt9XSwyMzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7dmFyIGluZGV4T2Y9W10uaW5kZXhPZjttb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGFycixvYmope2lmKGluZGV4T2YpcmV0dXJuIGFyci5pbmRleE9mKG9iaik7Zm9yKHZhciBpPTA7aSA8IGFyci5sZW5ndGg7KytpKSB7aWYoYXJyW2ldID09PSBvYmopcmV0dXJuIGk7fXJldHVybiAtMTt9O30se31dLDI0OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cyA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24oYXJyKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT0gJ1tvYmplY3QgQXJyYXldJzt9O30se31dLDI1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBIZWxwZXJzLlxuICovdmFyIHM9MTAwMDt2YXIgbT1zICogNjA7dmFyIGg9bSAqIDYwO3ZhciBkPWggKiAyNDt2YXIgeT1kICogMzY1LjI1OyAvKipcbiAqIFBhcnNlIG9yIGZvcm1hdCB0aGUgZ2l2ZW4gYHZhbGAuXG4gKlxuICogT3B0aW9uczpcbiAqXG4gKiAgLSBgbG9uZ2AgdmVyYm9zZSBmb3JtYXR0aW5nIFtmYWxzZV1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ3xOdW1iZXJ9IHZhbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge1N0cmluZ3xOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovbW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih2YWwsb3B0aW9ucyl7b3B0aW9ucyA9IG9wdGlvbnMgfHwge307aWYoJ3N0cmluZycgPT0gdHlwZW9mIHZhbClyZXR1cm4gcGFyc2UodmFsKTtyZXR1cm4gb3B0aW9ucy5sb25nP2xvbmcodmFsKTpzaG9ydCh2YWwpO307IC8qKlxuICogUGFyc2UgdGhlIGdpdmVuIGBzdHJgIGFuZCByZXR1cm4gbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gcGFyc2Uoc3RyKXtzdHIgPSAnJyArIHN0cjtpZihzdHIubGVuZ3RoID4gMTAwMDApcmV0dXJuO3ZhciBtYXRjaD0vXigoPzpcXGQrKT9cXC4/XFxkKykgKihtaWxsaXNlY29uZHM/fG1zZWNzP3xtc3xzZWNvbmRzP3xzZWNzP3xzfG1pbnV0ZXM/fG1pbnM/fG18aG91cnM/fGhycz98aHxkYXlzP3xkfHllYXJzP3x5cnM/fHkpPyQvaS5leGVjKHN0cik7aWYoIW1hdGNoKXJldHVybjt2YXIgbj1wYXJzZUZsb2F0KG1hdGNoWzFdKTt2YXIgdHlwZT0obWF0Y2hbMl0gfHwgJ21zJykudG9Mb3dlckNhc2UoKTtzd2l0Y2godHlwZSl7Y2FzZSAneWVhcnMnOmNhc2UgJ3llYXInOmNhc2UgJ3lycyc6Y2FzZSAneXInOmNhc2UgJ3knOnJldHVybiBuICogeTtjYXNlICdkYXlzJzpjYXNlICdkYXknOmNhc2UgJ2QnOnJldHVybiBuICogZDtjYXNlICdob3Vycyc6Y2FzZSAnaG91cic6Y2FzZSAnaHJzJzpjYXNlICdocic6Y2FzZSAnaCc6cmV0dXJuIG4gKiBoO2Nhc2UgJ21pbnV0ZXMnOmNhc2UgJ21pbnV0ZSc6Y2FzZSAnbWlucyc6Y2FzZSAnbWluJzpjYXNlICdtJzpyZXR1cm4gbiAqIG07Y2FzZSAnc2Vjb25kcyc6Y2FzZSAnc2Vjb25kJzpjYXNlICdzZWNzJzpjYXNlICdzZWMnOmNhc2UgJ3MnOnJldHVybiBuICogcztjYXNlICdtaWxsaXNlY29uZHMnOmNhc2UgJ21pbGxpc2Vjb25kJzpjYXNlICdtc2Vjcyc6Y2FzZSAnbXNlYyc6Y2FzZSAnbXMnOnJldHVybiBuO319IC8qKlxuICogU2hvcnQgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBzaG9ydChtcyl7aWYobXMgPj0gZClyZXR1cm4gTWF0aC5yb3VuZChtcyAvIGQpICsgJ2QnO2lmKG1zID49IGgpcmV0dXJuIE1hdGgucm91bmQobXMgLyBoKSArICdoJztpZihtcyA+PSBtKXJldHVybiBNYXRoLnJvdW5kKG1zIC8gbSkgKyAnbSc7aWYobXMgPj0gcylyZXR1cm4gTWF0aC5yb3VuZChtcyAvIHMpICsgJ3MnO3JldHVybiBtcyArICdtcyc7fSAvKipcbiAqIExvbmcgZm9ybWF0IGZvciBgbXNgLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtc1xuICogQHJldHVybiB7U3RyaW5nfVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBsb25nKG1zKXtyZXR1cm4gcGx1cmFsKG1zLGQsJ2RheScpIHx8IHBsdXJhbChtcyxoLCdob3VyJykgfHwgcGx1cmFsKG1zLG0sJ21pbnV0ZScpIHx8IHBsdXJhbChtcyxzLCdzZWNvbmQnKSB8fCBtcyArICcgbXMnO30gLyoqXG4gKiBQbHVyYWxpemF0aW9uIGhlbHBlci5cbiAqL2Z1bmN0aW9uIHBsdXJhbChtcyxuLG5hbWUpe2lmKG1zIDwgbilyZXR1cm47aWYobXMgPCBuICogMS41KXJldHVybiBNYXRoLmZsb29yKG1zIC8gbikgKyAnICcgKyBuYW1lO3JldHVybiBNYXRoLmNlaWwobXMgLyBuKSArICcgJyArIG5hbWUgKyAncyc7fX0se31dLDI2OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBKU09OIHBhcnNlLlxuICpcbiAqIEBzZWUgQmFzZWQgb24galF1ZXJ5I3BhcnNlSlNPTiAoTUlUKSBhbmQgSlNPTjJcbiAqIEBhcGkgcHJpdmF0ZVxuICovdmFyIHJ2YWxpZGNoYXJzPS9eW1xcXSw6e31cXHNdKiQvO3ZhciBydmFsaWRlc2NhcGU9L1xcXFwoPzpbXCJcXFxcXFwvYmZucnRdfHVbMC05YS1mQS1GXXs0fSkvZzt2YXIgcnZhbGlkdG9rZW5zPS9cIlteXCJcXFxcXFxuXFxyXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZzt2YXIgcnZhbGlkYnJhY2VzPS8oPzpefDp8LCkoPzpcXHMqXFxbKSsvZzt2YXIgcnRyaW1MZWZ0PS9eXFxzKy87dmFyIHJ0cmltUmlnaHQ9L1xccyskLzttb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNlanNvbihkYXRhKXtpZignc3RyaW5nJyAhPSB0eXBlb2YgZGF0YSB8fCAhZGF0YSl7cmV0dXJuIG51bGw7fWRhdGEgPSBkYXRhLnJlcGxhY2UocnRyaW1MZWZ0LCcnKS5yZXBsYWNlKHJ0cmltUmlnaHQsJycpOyAvLyBBdHRlbXB0IHRvIHBhcnNlIHVzaW5nIHRoZSBuYXRpdmUgSlNPTiBwYXJzZXIgZmlyc3RcbmlmKGdsb2JhbC5KU09OICYmIEpTT04ucGFyc2Upe3JldHVybiBKU09OLnBhcnNlKGRhdGEpO31pZihydmFsaWRjaGFycy50ZXN0KGRhdGEucmVwbGFjZShydmFsaWRlc2NhcGUsJ0AnKS5yZXBsYWNlKHJ2YWxpZHRva2VucywnXScpLnJlcGxhY2UocnZhbGlkYnJhY2VzLCcnKSkpe3JldHVybiBuZXcgRnVuY3Rpb24oJ3JldHVybiAnICsgZGF0YSkoKTt9fTt9KS5jYWxsKHRoaXMsdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCI/c2VsZjp0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiP3dpbmRvdzp0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiP2dsb2JhbDp7fSk7fSx7fV0sMjc6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIENvbXBpbGVzIGEgcXVlcnlzdHJpbmdcbiAqIFJldHVybnMgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge09iamVjdH1cbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5lbmNvZGUgPSBmdW5jdGlvbihvYmope3ZhciBzdHI9Jyc7Zm9yKHZhciBpIGluIG9iaikge2lmKG9iai5oYXNPd25Qcm9wZXJ0eShpKSl7aWYoc3RyLmxlbmd0aClzdHIgKz0gJyYnO3N0ciArPSBlbmNvZGVVUklDb21wb25lbnQoaSkgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2ldKTt9fXJldHVybiBzdHI7fTsgLyoqXG4gKiBQYXJzZXMgYSBzaW1wbGUgcXVlcnlzdHJpbmcgaW50byBhbiBvYmplY3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcXNcbiAqIEBhcGkgcHJpdmF0ZVxuICovZXhwb3J0cy5kZWNvZGUgPSBmdW5jdGlvbihxcyl7dmFyIHFyeT17fTt2YXIgcGFpcnM9cXMuc3BsaXQoJyYnKTtmb3IodmFyIGk9MCxsPXBhaXJzLmxlbmd0aDtpIDwgbDtpKyspIHt2YXIgcGFpcj1wYWlyc1tpXS5zcGxpdCgnPScpO3FyeVtkZWNvZGVVUklDb21wb25lbnQocGFpclswXSldID0gZGVjb2RlVVJJQ29tcG9uZW50KHBhaXJbMV0pO31yZXR1cm4gcXJ5O307fSx7fV0sMjg6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIFBhcnNlcyBhbiBVUklcbiAqXG4gKiBAYXV0aG9yIFN0ZXZlbiBMZXZpdGhhbiA8c3RldmVubGV2aXRoYW4uY29tPiAoTUlUIGxpY2Vuc2UpXG4gKiBAYXBpIHByaXZhdGVcbiAqL3ZhciByZT0vXig/Oig/IVteOkBdKzpbXjpAXFwvXSpAKShodHRwfGh0dHBzfHdzfHdzcyk6XFwvXFwvKT8oKD86KChbXjpAXSopKD86OihbXjpAXSopKT8pP0ApPygoPzpbYS1mMC05XXswLDR9Oil7Miw3fVthLWYwLTldezAsNH18W146XFwvPyNdKikoPzo6KFxcZCopKT8pKCgoXFwvKD86W14/I10oPyFbXj8jXFwvXSpcXC5bXj8jXFwvLl0rKD86Wz8jXXwkKSkpKlxcLz8pPyhbXj8jXFwvXSopKSg/OlxcPyhbXiNdKikpPyg/OiMoLiopKT8pLzt2YXIgcGFydHM9Wydzb3VyY2UnLCdwcm90b2NvbCcsJ2F1dGhvcml0eScsJ3VzZXJJbmZvJywndXNlcicsJ3Bhc3N3b3JkJywnaG9zdCcsJ3BvcnQnLCdyZWxhdGl2ZScsJ3BhdGgnLCdkaXJlY3RvcnknLCdmaWxlJywncXVlcnknLCdhbmNob3InXTttb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIHBhcnNldXJpKHN0cil7dmFyIHNyYz1zdHIsYj1zdHIuaW5kZXhPZignWycpLGU9c3RyLmluZGV4T2YoJ10nKTtpZihiICE9IC0xICYmIGUgIT0gLTEpe3N0ciA9IHN0ci5zdWJzdHJpbmcoMCxiKSArIHN0ci5zdWJzdHJpbmcoYixlKS5yZXBsYWNlKC86L2csJzsnKSArIHN0ci5zdWJzdHJpbmcoZSxzdHIubGVuZ3RoKTt9dmFyIG09cmUuZXhlYyhzdHIgfHwgJycpLHVyaT17fSxpPTE0O3doaWxlKGktLSkge3VyaVtwYXJ0c1tpXV0gPSBtW2ldIHx8ICcnO31pZihiICE9IC0xICYmIGUgIT0gLTEpe3VyaS5zb3VyY2UgPSBzcmM7dXJpLmhvc3QgPSB1cmkuaG9zdC5zdWJzdHJpbmcoMSx1cmkuaG9zdC5sZW5ndGggLSAxKS5yZXBsYWNlKC87L2csJzonKTt1cmkuYXV0aG9yaXR5ID0gdXJpLmF1dGhvcml0eS5yZXBsYWNlKCdbJywnJykucmVwbGFjZSgnXScsJycpLnJlcGxhY2UoLzsvZywnOicpO3VyaS5pcHY2dXJpID0gdHJ1ZTt9cmV0dXJuIHVyaTt9O30se31dLDI5OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyohIGh0dHBzOi8vbXRocy5iZS91dGY4anMgdjIuMC4wIGJ5IEBtYXRoaWFzICovOyhmdW5jdGlvbihyb290KXsgLy8gRGV0ZWN0IGZyZWUgdmFyaWFibGVzIGBleHBvcnRzYFxudmFyIGZyZWVFeHBvcnRzPXR5cGVvZiBleHBvcnRzID09ICdvYmplY3QnICYmIGV4cG9ydHM7IC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBtb2R1bGVgXG52YXIgZnJlZU1vZHVsZT10eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA9PSBmcmVlRXhwb3J0cyAmJiBtb2R1bGU7IC8vIERldGVjdCBmcmVlIHZhcmlhYmxlIGBnbG9iYWxgLCBmcm9tIE5vZGUuanMgb3IgQnJvd3NlcmlmaWVkIGNvZGUsXG4vLyBhbmQgdXNlIGl0IGFzIGByb290YFxudmFyIGZyZWVHbG9iYWw9dHlwZW9mIGdsb2JhbCA9PSAnb2JqZWN0JyAmJiBnbG9iYWw7aWYoZnJlZUdsb2JhbC5nbG9iYWwgPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbC53aW5kb3cgPT09IGZyZWVHbG9iYWwpe3Jvb3QgPSBmcmVlR2xvYmFsO30gLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovdmFyIHN0cmluZ0Zyb21DaGFyQ29kZT1TdHJpbmcuZnJvbUNoYXJDb2RlOyAvLyBUYWtlbiBmcm9tIGh0dHBzOi8vbXRocy5iZS9wdW55Y29kZVxuZnVuY3Rpb24gdWNzMmRlY29kZShzdHJpbmcpe3ZhciBvdXRwdXQ9W107dmFyIGNvdW50ZXI9MDt2YXIgbGVuZ3RoPXN0cmluZy5sZW5ndGg7dmFyIHZhbHVlO3ZhciBleHRyYTt3aGlsZShjb3VudGVyIDwgbGVuZ3RoKSB7dmFsdWUgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO2lmKHZhbHVlID49IDB4RDgwMCAmJiB2YWx1ZSA8PSAweERCRkYgJiYgY291bnRlciA8IGxlbmd0aCl7IC8vIGhpZ2ggc3Vycm9nYXRlLCBhbmQgdGhlcmUgaXMgYSBuZXh0IGNoYXJhY3RlclxuZXh0cmEgPSBzdHJpbmcuY2hhckNvZGVBdChjb3VudGVyKyspO2lmKChleHRyYSAmIDB4RkMwMCkgPT0gMHhEQzAwKXsgLy8gbG93IHN1cnJvZ2F0ZVxub3V0cHV0LnB1c2goKCh2YWx1ZSAmIDB4M0ZGKSA8PCAxMCkgKyAoZXh0cmEgJiAweDNGRikgKyAweDEwMDAwKTt9ZWxzZSB7IC8vIHVubWF0Y2hlZCBzdXJyb2dhdGU7IG9ubHkgYXBwZW5kIHRoaXMgY29kZSB1bml0LCBpbiBjYXNlIHRoZSBuZXh0XG4vLyBjb2RlIHVuaXQgaXMgdGhlIGhpZ2ggc3Vycm9nYXRlIG9mIGEgc3Vycm9nYXRlIHBhaXJcbm91dHB1dC5wdXNoKHZhbHVlKTtjb3VudGVyLS07fX1lbHNlIHtvdXRwdXQucHVzaCh2YWx1ZSk7fX1yZXR1cm4gb3V0cHV0O30gLy8gVGFrZW4gZnJvbSBodHRwczovL210aHMuYmUvcHVueWNvZGVcbmZ1bmN0aW9uIHVjczJlbmNvZGUoYXJyYXkpe3ZhciBsZW5ndGg9YXJyYXkubGVuZ3RoO3ZhciBpbmRleD0tMTt2YXIgdmFsdWU7dmFyIG91dHB1dD0nJzt3aGlsZSgrK2luZGV4IDwgbGVuZ3RoKSB7dmFsdWUgPSBhcnJheVtpbmRleF07aWYodmFsdWUgPiAweEZGRkYpe3ZhbHVlIC09IDB4MTAwMDA7b3V0cHV0ICs9IHN0cmluZ0Zyb21DaGFyQ29kZSh2YWx1ZSA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMCk7dmFsdWUgPSAweERDMDAgfCB2YWx1ZSAmIDB4M0ZGO31vdXRwdXQgKz0gc3RyaW5nRnJvbUNoYXJDb2RlKHZhbHVlKTt9cmV0dXJuIG91dHB1dDt9ZnVuY3Rpb24gY2hlY2tTY2FsYXJWYWx1ZShjb2RlUG9pbnQpe2lmKGNvZGVQb2ludCA+PSAweEQ4MDAgJiYgY29kZVBvaW50IDw9IDB4REZGRil7dGhyb3cgRXJyb3IoJ0xvbmUgc3Vycm9nYXRlIFUrJyArIGNvZGVQb2ludC50b1N0cmluZygxNikudG9VcHBlckNhc2UoKSArICcgaXMgbm90IGEgc2NhbGFyIHZhbHVlJyk7fX0gLyotLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSovZnVuY3Rpb24gY3JlYXRlQnl0ZShjb2RlUG9pbnQsc2hpZnQpe3JldHVybiBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+IHNoaWZ0ICYgMHgzRiB8IDB4ODApO31mdW5jdGlvbiBlbmNvZGVDb2RlUG9pbnQoY29kZVBvaW50KXtpZigoY29kZVBvaW50ICYgMHhGRkZGRkY4MCkgPT0gMCl7IC8vIDEtYnl0ZSBzZXF1ZW5jZVxucmV0dXJuIHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQpO312YXIgc3ltYm9sPScnO2lmKChjb2RlUG9pbnQgJiAweEZGRkZGODAwKSA9PSAwKXsgLy8gMi1ieXRlIHNlcXVlbmNlXG5zeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+IDYgJiAweDFGIHwgMHhDMCk7fWVsc2UgaWYoKGNvZGVQb2ludCAmIDB4RkZGRjAwMDApID09IDApeyAvLyAzLWJ5dGUgc2VxdWVuY2VcbmNoZWNrU2NhbGFyVmFsdWUoY29kZVBvaW50KTtzeW1ib2wgPSBzdHJpbmdGcm9tQ2hhckNvZGUoY29kZVBvaW50ID4+IDEyICYgMHgwRiB8IDB4RTApO3N5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCw2KTt9ZWxzZSBpZigoY29kZVBvaW50ICYgMHhGRkUwMDAwMCkgPT0gMCl7IC8vIDQtYnl0ZSBzZXF1ZW5jZVxuc3ltYm9sID0gc3RyaW5nRnJvbUNoYXJDb2RlKGNvZGVQb2ludCA+PiAxOCAmIDB4MDcgfCAweEYwKTtzeW1ib2wgKz0gY3JlYXRlQnl0ZShjb2RlUG9pbnQsMTIpO3N5bWJvbCArPSBjcmVhdGVCeXRlKGNvZGVQb2ludCw2KTt9c3ltYm9sICs9IHN0cmluZ0Zyb21DaGFyQ29kZShjb2RlUG9pbnQgJiAweDNGIHwgMHg4MCk7cmV0dXJuIHN5bWJvbDt9ZnVuY3Rpb24gdXRmOGVuY29kZShzdHJpbmcpe3ZhciBjb2RlUG9pbnRzPXVjczJkZWNvZGUoc3RyaW5nKTt2YXIgbGVuZ3RoPWNvZGVQb2ludHMubGVuZ3RoO3ZhciBpbmRleD0tMTt2YXIgY29kZVBvaW50O3ZhciBieXRlU3RyaW5nPScnO3doaWxlKCsraW5kZXggPCBsZW5ndGgpIHtjb2RlUG9pbnQgPSBjb2RlUG9pbnRzW2luZGV4XTtieXRlU3RyaW5nICs9IGVuY29kZUNvZGVQb2ludChjb2RlUG9pbnQpO31yZXR1cm4gYnl0ZVN0cmluZzt9IC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL2Z1bmN0aW9uIHJlYWRDb250aW51YXRpb25CeXRlKCl7aWYoYnl0ZUluZGV4ID49IGJ5dGVDb3VudCl7dGhyb3cgRXJyb3IoJ0ludmFsaWQgYnl0ZSBpbmRleCcpO312YXIgY29udGludWF0aW9uQnl0ZT1ieXRlQXJyYXlbYnl0ZUluZGV4XSAmIDB4RkY7Ynl0ZUluZGV4Kys7aWYoKGNvbnRpbnVhdGlvbkJ5dGUgJiAweEMwKSA9PSAweDgwKXtyZXR1cm4gY29udGludWF0aW9uQnl0ZSAmIDB4M0Y7fSAvLyBJZiB3ZSBlbmQgdXAgaGVyZSwgaXTigJlzIG5vdCBhIGNvbnRpbnVhdGlvbiBieXRlXG50aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO31mdW5jdGlvbiBkZWNvZGVTeW1ib2woKXt2YXIgYnl0ZTE7dmFyIGJ5dGUyO3ZhciBieXRlMzt2YXIgYnl0ZTQ7dmFyIGNvZGVQb2ludDtpZihieXRlSW5kZXggPiBieXRlQ291bnQpe3Rocm93IEVycm9yKCdJbnZhbGlkIGJ5dGUgaW5kZXgnKTt9aWYoYnl0ZUluZGV4ID09IGJ5dGVDb3VudCl7cmV0dXJuIGZhbHNlO30gLy8gUmVhZCBmaXJzdCBieXRlXG5ieXRlMSA9IGJ5dGVBcnJheVtieXRlSW5kZXhdICYgMHhGRjtieXRlSW5kZXgrKzsgLy8gMS1ieXRlIHNlcXVlbmNlIChubyBjb250aW51YXRpb24gYnl0ZXMpXG5pZigoYnl0ZTEgJiAweDgwKSA9PSAwKXtyZXR1cm4gYnl0ZTE7fSAvLyAyLWJ5dGUgc2VxdWVuY2VcbmlmKChieXRlMSAmIDB4RTApID09IDB4QzApe3ZhciBieXRlMj1yZWFkQ29udGludWF0aW9uQnl0ZSgpO2NvZGVQb2ludCA9IChieXRlMSAmIDB4MUYpIDw8IDYgfCBieXRlMjtpZihjb2RlUG9pbnQgPj0gMHg4MCl7cmV0dXJuIGNvZGVQb2ludDt9ZWxzZSB7dGhyb3cgRXJyb3IoJ0ludmFsaWQgY29udGludWF0aW9uIGJ5dGUnKTt9fSAvLyAzLWJ5dGUgc2VxdWVuY2UgKG1heSBpbmNsdWRlIHVucGFpcmVkIHN1cnJvZ2F0ZXMpXG5pZigoYnl0ZTEgJiAweEYwKSA9PSAweEUwKXtieXRlMiA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7Ynl0ZTMgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO2NvZGVQb2ludCA9IChieXRlMSAmIDB4MEYpIDw8IDEyIHwgYnl0ZTIgPDwgNiB8IGJ5dGUzO2lmKGNvZGVQb2ludCA+PSAweDA4MDApe2NoZWNrU2NhbGFyVmFsdWUoY29kZVBvaW50KTtyZXR1cm4gY29kZVBvaW50O31lbHNlIHt0aHJvdyBFcnJvcignSW52YWxpZCBjb250aW51YXRpb24gYnl0ZScpO319IC8vIDQtYnl0ZSBzZXF1ZW5jZVxuaWYoKGJ5dGUxICYgMHhGOCkgPT0gMHhGMCl7Ynl0ZTIgPSByZWFkQ29udGludWF0aW9uQnl0ZSgpO2J5dGUzID0gcmVhZENvbnRpbnVhdGlvbkJ5dGUoKTtieXRlNCA9IHJlYWRDb250aW51YXRpb25CeXRlKCk7Y29kZVBvaW50ID0gKGJ5dGUxICYgMHgwRikgPDwgMHgxMiB8IGJ5dGUyIDw8IDB4MEMgfCBieXRlMyA8PCAweDA2IHwgYnl0ZTQ7aWYoY29kZVBvaW50ID49IDB4MDEwMDAwICYmIGNvZGVQb2ludCA8PSAweDEwRkZGRil7cmV0dXJuIGNvZGVQb2ludDt9fXRocm93IEVycm9yKCdJbnZhbGlkIFVURi04IGRldGVjdGVkJyk7fXZhciBieXRlQXJyYXk7dmFyIGJ5dGVDb3VudDt2YXIgYnl0ZUluZGV4O2Z1bmN0aW9uIHV0ZjhkZWNvZGUoYnl0ZVN0cmluZyl7Ynl0ZUFycmF5ID0gdWNzMmRlY29kZShieXRlU3RyaW5nKTtieXRlQ291bnQgPSBieXRlQXJyYXkubGVuZ3RoO2J5dGVJbmRleCA9IDA7dmFyIGNvZGVQb2ludHM9W107dmFyIHRtcDt3aGlsZSgodG1wID0gZGVjb2RlU3ltYm9sKCkpICE9PSBmYWxzZSkge2NvZGVQb2ludHMucHVzaCh0bXApO31yZXR1cm4gdWNzMmVuY29kZShjb2RlUG9pbnRzKTt9IC8qLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0qL3ZhciB1dGY4PXsndmVyc2lvbic6JzIuMC4wJywnZW5jb2RlJzp1dGY4ZW5jb2RlLCdkZWNvZGUnOnV0ZjhkZWNvZGV9OyAvLyBTb21lIEFNRCBidWlsZCBvcHRpbWl6ZXJzLCBsaWtlIHIuanMsIGNoZWNrIGZvciBzcGVjaWZpYyBjb25kaXRpb24gcGF0dGVybnNcbi8vIGxpa2UgdGhlIGZvbGxvd2luZzpcbmlmKHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgZGVmaW5lLmFtZCA9PSAnb2JqZWN0JyAmJiBkZWZpbmUuYW1kKXtkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdXRmODt9KTt9ZWxzZSBpZihmcmVlRXhwb3J0cyAmJiAhZnJlZUV4cG9ydHMubm9kZVR5cGUpe2lmKGZyZWVNb2R1bGUpeyAvLyBpbiBOb2RlLmpzIG9yIFJpbmdvSlMgdjAuOC4wK1xuZnJlZU1vZHVsZS5leHBvcnRzID0gdXRmODt9ZWxzZSB7IC8vIGluIE5hcndoYWwgb3IgUmluZ29KUyB2MC43LjAtXG52YXIgb2JqZWN0PXt9O3ZhciBoYXNPd25Qcm9wZXJ0eT1vYmplY3QuaGFzT3duUHJvcGVydHk7Zm9yKHZhciBrZXkgaW4gdXRmOCkge2hhc093blByb3BlcnR5LmNhbGwodXRmOCxrZXkpICYmIChmcmVlRXhwb3J0c1trZXldID0gdXRmOFtrZXldKTt9fX1lbHNlIHsgLy8gaW4gUmhpbm8gb3IgYSB3ZWIgYnJvd3Nlclxucm9vdC51dGY4ID0gdXRmODt9fSkodGhpcyk7fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se31dLDMwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsndXNlIHN0cmljdCc7dmFyIGFscGhhYmV0PScwMTIzNDU2Nzg5QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ei1fJy5zcGxpdCgnJyksbGVuZ3RoPTY0LG1hcD17fSxzZWVkPTAsaT0wLHByZXY7IC8qKlxuICogUmV0dXJuIGEgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc3BlY2lmaWVkIG51bWJlci5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbnVtIFRoZSBudW1iZXIgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtTdHJpbmd9IFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG51bWJlci5cbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBlbmNvZGUobnVtKXt2YXIgZW5jb2RlZD0nJztkbyB7ZW5jb2RlZCA9IGFscGhhYmV0W251bSAlIGxlbmd0aF0gKyBlbmNvZGVkO251bSA9IE1hdGguZmxvb3IobnVtIC8gbGVuZ3RoKTt9d2hpbGUobnVtID4gMCk7cmV0dXJuIGVuY29kZWQ7fSAvKipcbiAqIFJldHVybiB0aGUgaW50ZWdlciB2YWx1ZSBzcGVjaWZpZWQgYnkgdGhlIGdpdmVuIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyIFRoZSBzdHJpbmcgdG8gY29udmVydC5cbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBpbnRlZ2VyIHZhbHVlIHJlcHJlc2VudGVkIGJ5IHRoZSBzdHJpbmcuXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gZGVjb2RlKHN0cil7dmFyIGRlY29kZWQ9MDtmb3IoaSA9IDA7aSA8IHN0ci5sZW5ndGg7aSsrKSB7ZGVjb2RlZCA9IGRlY29kZWQgKiBsZW5ndGggKyBtYXBbc3RyLmNoYXJBdChpKV07fXJldHVybiBkZWNvZGVkO30gLyoqXG4gKiBZZWFzdDogQSB0aW55IGdyb3dpbmcgaWQgZ2VuZXJhdG9yLlxuICpcbiAqIEByZXR1cm5zIHtTdHJpbmd9IEEgdW5pcXVlIGlkLlxuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIHllYXN0KCl7dmFyIG5vdz1lbmNvZGUoK25ldyBEYXRlKCkpO2lmKG5vdyAhPT0gcHJldilyZXR1cm4gc2VlZCA9IDAscHJldiA9IG5vdztyZXR1cm4gbm93ICsgJy4nICsgZW5jb2RlKHNlZWQrKyk7fSAvL1xuLy8gTWFwIGVhY2ggY2hhcmFjdGVyIHRvIGl0cyBpbmRleC5cbi8vXG5mb3IoO2kgPCBsZW5ndGg7aSsrKSBtYXBbYWxwaGFiZXRbaV1dID0gaTsgLy9cbi8vIEV4cG9zZSB0aGUgYHllYXN0YCwgYGVuY29kZWAgYW5kIGBkZWNvZGVgIGZ1bmN0aW9ucy5cbi8vXG55ZWFzdC5lbmNvZGUgPSBlbmNvZGU7eWVhc3QuZGVjb2RlID0gZGVjb2RlO21vZHVsZS5leHBvcnRzID0geWVhc3Q7fSx7fV0sMzE6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIE1vZHVsZSBkZXBlbmRlbmNpZXMuXG4gKi92YXIgdXJsPV9kZXJlcV8oJy4vdXJsJyk7dmFyIHBhcnNlcj1fZGVyZXFfKCdzb2NrZXQuaW8tcGFyc2VyJyk7dmFyIE1hbmFnZXI9X2RlcmVxXygnLi9tYW5hZ2VyJyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ3NvY2tldC5pby1jbGllbnQnKTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gZXhwb3J0cyA9IGxvb2t1cDsgLyoqXG4gKiBNYW5hZ2VycyBjYWNoZS5cbiAqL3ZhciBjYWNoZT1leHBvcnRzLm1hbmFnZXJzID0ge307IC8qKlxuICogTG9va3MgdXAgYW4gZXhpc3RpbmcgYE1hbmFnZXJgIGZvciBtdWx0aXBsZXhpbmcuXG4gKiBJZiB0aGUgdXNlciBzdW1tb25zOlxuICpcbiAqICAgYGlvKCdodHRwOi8vbG9jYWxob3N0L2EnKTtgXG4gKiAgIGBpbygnaHR0cDovL2xvY2FsaG9zdC9iJyk7YFxuICpcbiAqIFdlIHJldXNlIHRoZSBleGlzdGluZyBpbnN0YW5jZSBiYXNlZCBvbiBzYW1lIHNjaGVtZS9wb3J0L2hvc3QsXG4gKiBhbmQgd2UgaW5pdGlhbGl6ZSBzb2NrZXRzIGZvciBlYWNoIG5hbWVzcGFjZS5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gbG9va3VwKHVyaSxvcHRzKXtpZih0eXBlb2YgdXJpID09ICdvYmplY3QnKXtvcHRzID0gdXJpO3VyaSA9IHVuZGVmaW5lZDt9b3B0cyA9IG9wdHMgfHwge307dmFyIHBhcnNlZD11cmwodXJpKTt2YXIgc291cmNlPXBhcnNlZC5zb3VyY2U7dmFyIGlkPXBhcnNlZC5pZDt2YXIgcGF0aD1wYXJzZWQucGF0aDt2YXIgc2FtZU5hbWVzcGFjZT1jYWNoZVtpZF0gJiYgcGF0aCBpbiBjYWNoZVtpZF0ubnNwczt2YXIgbmV3Q29ubmVjdGlvbj1vcHRzLmZvcmNlTmV3IHx8IG9wdHNbJ2ZvcmNlIG5ldyBjb25uZWN0aW9uJ10gfHwgZmFsc2UgPT09IG9wdHMubXVsdGlwbGV4IHx8IHNhbWVOYW1lc3BhY2U7dmFyIGlvO2lmKG5ld0Nvbm5lY3Rpb24pe2RlYnVnKCdpZ25vcmluZyBzb2NrZXQgY2FjaGUgZm9yICVzJyxzb3VyY2UpO2lvID0gTWFuYWdlcihzb3VyY2Usb3B0cyk7fWVsc2Uge2lmKCFjYWNoZVtpZF0pe2RlYnVnKCduZXcgaW8gaW5zdGFuY2UgZm9yICVzJyxzb3VyY2UpO2NhY2hlW2lkXSA9IE1hbmFnZXIoc291cmNlLG9wdHMpO31pbyA9IGNhY2hlW2lkXTt9cmV0dXJuIGlvLnNvY2tldChwYXJzZWQucGF0aCk7fSAvKipcbiAqIFByb3RvY29sIHZlcnNpb24uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMucHJvdG9jb2wgPSBwYXJzZXIucHJvdG9jb2w7IC8qKlxuICogYGNvbm5lY3RgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmlcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLmNvbm5lY3QgPSBsb29rdXA7IC8qKlxuICogRXhwb3NlIGNvbnN0cnVjdG9ycyBmb3Igc3RhbmRhbG9uZSBidWlsZC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5NYW5hZ2VyID0gX2RlcmVxXygnLi9tYW5hZ2VyJyk7ZXhwb3J0cy5Tb2NrZXQgPSBfZGVyZXFfKCcuL3NvY2tldCcpO30se1wiLi9tYW5hZ2VyXCI6MzIsXCIuL3NvY2tldFwiOjM0LFwiLi91cmxcIjozNSxcImRlYnVnXCI6MzksXCJzb2NrZXQuaW8tcGFyc2VyXCI6NDd9XSwzMjpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBlaW89X2RlcmVxXygnZW5naW5lLmlvLWNsaWVudCcpO3ZhciBTb2NrZXQ9X2RlcmVxXygnLi9zb2NrZXQnKTt2YXIgRW1pdHRlcj1fZGVyZXFfKCdjb21wb25lbnQtZW1pdHRlcicpO3ZhciBwYXJzZXI9X2RlcmVxXygnc29ja2V0LmlvLXBhcnNlcicpO3ZhciBvbj1fZGVyZXFfKCcuL29uJyk7dmFyIGJpbmQ9X2RlcmVxXygnY29tcG9uZW50LWJpbmQnKTt2YXIgZGVidWc9X2RlcmVxXygnZGVidWcnKSgnc29ja2V0LmlvLWNsaWVudDptYW5hZ2VyJyk7dmFyIGluZGV4T2Y9X2RlcmVxXygnaW5kZXhvZicpO3ZhciBCYWNrb2ZmPV9kZXJlcV8oJ2JhY2tvMicpOyAvKipcbiAqIElFNisgaGFzT3duUHJvcGVydHlcbiAqL3ZhciBoYXM9T2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0c1xuICovbW9kdWxlLmV4cG9ydHMgPSBNYW5hZ2VyOyAvKipcbiAqIGBNYW5hZ2VyYCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZW5naW5lIGluc3RhbmNlIG9yIGVuZ2luZSB1cmkvb3B0c1xuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBNYW5hZ2VyKHVyaSxvcHRzKXtpZighKHRoaXMgaW5zdGFuY2VvZiBNYW5hZ2VyKSlyZXR1cm4gbmV3IE1hbmFnZXIodXJpLG9wdHMpO2lmKHVyaSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgdXJpKXtvcHRzID0gdXJpO3VyaSA9IHVuZGVmaW5lZDt9b3B0cyA9IG9wdHMgfHwge307b3B0cy5wYXRoID0gb3B0cy5wYXRoIHx8ICcvc29ja2V0LmlvJzt0aGlzLm5zcHMgPSB7fTt0aGlzLnN1YnMgPSBbXTt0aGlzLm9wdHMgPSBvcHRzO3RoaXMucmVjb25uZWN0aW9uKG9wdHMucmVjb25uZWN0aW9uICE9PSBmYWxzZSk7dGhpcy5yZWNvbm5lY3Rpb25BdHRlbXB0cyhvcHRzLnJlY29ubmVjdGlvbkF0dGVtcHRzIHx8IEluZmluaXR5KTt0aGlzLnJlY29ubmVjdGlvbkRlbGF5KG9wdHMucmVjb25uZWN0aW9uRGVsYXkgfHwgMTAwMCk7dGhpcy5yZWNvbm5lY3Rpb25EZWxheU1heChvcHRzLnJlY29ubmVjdGlvbkRlbGF5TWF4IHx8IDUwMDApO3RoaXMucmFuZG9taXphdGlvbkZhY3RvcihvcHRzLnJhbmRvbWl6YXRpb25GYWN0b3IgfHwgMC41KTt0aGlzLmJhY2tvZmYgPSBuZXcgQmFja29mZih7bWluOnRoaXMucmVjb25uZWN0aW9uRGVsYXkoKSxtYXg6dGhpcy5yZWNvbm5lY3Rpb25EZWxheU1heCgpLGppdHRlcjp0aGlzLnJhbmRvbWl6YXRpb25GYWN0b3IoKX0pO3RoaXMudGltZW91dChudWxsID09IG9wdHMudGltZW91dD8yMDAwMDpvcHRzLnRpbWVvdXQpO3RoaXMucmVhZHlTdGF0ZSA9ICdjbG9zZWQnO3RoaXMudXJpID0gdXJpO3RoaXMuY29ubmVjdGluZyA9IFtdO3RoaXMubGFzdFBpbmcgPSBudWxsO3RoaXMuZW5jb2RpbmcgPSBmYWxzZTt0aGlzLnBhY2tldEJ1ZmZlciA9IFtdO3RoaXMuZW5jb2RlciA9IG5ldyBwYXJzZXIuRW5jb2RlcigpO3RoaXMuZGVjb2RlciA9IG5ldyBwYXJzZXIuRGVjb2RlcigpO3RoaXMuYXV0b0Nvbm5lY3QgPSBvcHRzLmF1dG9Db25uZWN0ICE9PSBmYWxzZTtpZih0aGlzLmF1dG9Db25uZWN0KXRoaXMub3BlbigpO30gLyoqXG4gKiBQcm9wYWdhdGUgZ2l2ZW4gZXZlbnQgdG8gc29ja2V0cyBhbmQgZW1pdCBvbiBgdGhpc2BcbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLmVtaXRBbGwgPSBmdW5jdGlvbigpe3RoaXMuZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7Zm9yKHZhciBuc3AgaW4gdGhpcy5uc3BzKSB7aWYoaGFzLmNhbGwodGhpcy5uc3BzLG5zcCkpe3RoaXMubnNwc1tuc3BdLmVtaXQuYXBwbHkodGhpcy5uc3BzW25zcF0sYXJndW1lbnRzKTt9fX07IC8qKlxuICogVXBkYXRlIGBzb2NrZXQuaWRgIG9mIGFsbCBzb2NrZXRzXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS51cGRhdGVTb2NrZXRJZHMgPSBmdW5jdGlvbigpe2Zvcih2YXIgbnNwIGluIHRoaXMubnNwcykge2lmKGhhcy5jYWxsKHRoaXMubnNwcyxuc3ApKXt0aGlzLm5zcHNbbnNwXS5pZCA9IHRoaXMuZW5naW5lLmlkO319fTsgLyoqXG4gKiBNaXggaW4gYEVtaXR0ZXJgLlxuICovRW1pdHRlcihNYW5hZ2VyLnByb3RvdHlwZSk7IC8qKlxuICogU2V0cyB0aGUgYHJlY29ubmVjdGlvbmAgY29uZmlnLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gdHJ1ZS9mYWxzZSBpZiBpdCBzaG91bGQgYXV0b21hdGljYWxseSByZWNvbm5lY3RcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGYgb3IgdmFsdWVcbiAqIEBhcGkgcHVibGljXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5yZWNvbm5lY3Rpb24gPSBmdW5jdGlvbih2KXtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5fcmVjb25uZWN0aW9uO3RoaXMuX3JlY29ubmVjdGlvbiA9ICEhdjtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNldHMgdGhlIHJlY29ubmVjdGlvbiBhdHRlbXB0cyBjb25maWcuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IG1heCByZWNvbm5lY3Rpb24gYXR0ZW1wdHMgYmVmb3JlIGdpdmluZyB1cFxuICogQHJldHVybiB7TWFuYWdlcn0gc2VsZiBvciB2YWx1ZVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnJlY29ubmVjdGlvbkF0dGVtcHRzID0gZnVuY3Rpb24odil7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3JlY29ubmVjdGlvbkF0dGVtcHRzO3RoaXMuX3JlY29ubmVjdGlvbkF0dGVtcHRzID0gdjtyZXR1cm4gdGhpczt9OyAvKipcbiAqIFNldHMgdGhlIGRlbGF5IGJldHdlZW4gcmVjb25uZWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGVsYXlcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGYgb3IgdmFsdWVcbiAqIEBhcGkgcHVibGljXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5yZWNvbm5lY3Rpb25EZWxheSA9IGZ1bmN0aW9uKHYpe2lmKCFhcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9yZWNvbm5lY3Rpb25EZWxheTt0aGlzLl9yZWNvbm5lY3Rpb25EZWxheSA9IHY7dGhpcy5iYWNrb2ZmICYmIHRoaXMuYmFja29mZi5zZXRNaW4odik7cmV0dXJuIHRoaXM7fTtNYW5hZ2VyLnByb3RvdHlwZS5yYW5kb21pemF0aW9uRmFjdG9yID0gZnVuY3Rpb24odil7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3JhbmRvbWl6YXRpb25GYWN0b3I7dGhpcy5fcmFuZG9taXphdGlvbkZhY3RvciA9IHY7dGhpcy5iYWNrb2ZmICYmIHRoaXMuYmFja29mZi5zZXRKaXR0ZXIodik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZXRzIHRoZSBtYXhpbXVtIGRlbGF5IGJldHdlZW4gcmVjb25uZWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gZGVsYXlcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGYgb3IgdmFsdWVcbiAqIEBhcGkgcHVibGljXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5yZWNvbm5lY3Rpb25EZWxheU1heCA9IGZ1bmN0aW9uKHYpe2lmKCFhcmd1bWVudHMubGVuZ3RoKXJldHVybiB0aGlzLl9yZWNvbm5lY3Rpb25EZWxheU1heDt0aGlzLl9yZWNvbm5lY3Rpb25EZWxheU1heCA9IHY7dGhpcy5iYWNrb2ZmICYmIHRoaXMuYmFja29mZi5zZXRNYXgodik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZXRzIHRoZSBjb25uZWN0aW9uIHRpbWVvdXQuIGBmYWxzZWAgdG8gZGlzYWJsZVxuICpcbiAqIEByZXR1cm4ge01hbmFnZXJ9IHNlbGYgb3IgdmFsdWVcbiAqIEBhcGkgcHVibGljXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS50aW1lb3V0ID0gZnVuY3Rpb24odil7aWYoIWFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHRoaXMuX3RpbWVvdXQ7dGhpcy5fdGltZW91dCA9IHY7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTdGFydHMgdHJ5aW5nIHRvIHJlY29ubmVjdCBpZiByZWNvbm5lY3Rpb24gaXMgZW5hYmxlZCBhbmQgd2UgaGF2ZSBub3RcbiAqIHN0YXJ0ZWQgcmVjb25uZWN0aW5nIHlldFxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUubWF5YmVSZWNvbm5lY3RPbk9wZW4gPSBmdW5jdGlvbigpeyAvLyBPbmx5IHRyeSB0byByZWNvbm5lY3QgaWYgaXQncyB0aGUgZmlyc3QgdGltZSB3ZSdyZSBjb25uZWN0aW5nXG5pZighdGhpcy5yZWNvbm5lY3RpbmcgJiYgdGhpcy5fcmVjb25uZWN0aW9uICYmIHRoaXMuYmFja29mZi5hdHRlbXB0cyA9PT0gMCl7IC8vIGtlZXBzIHJlY29ubmVjdGlvbiBmcm9tIGZpcmluZyB0d2ljZSBmb3IgdGhlIHNhbWUgcmVjb25uZWN0aW9uIGxvb3BcbnRoaXMucmVjb25uZWN0KCk7fX07IC8qKlxuICogU2V0cyB0aGUgY3VycmVudCB0cmFuc3BvcnQgYHNvY2tldGAuXG4gKlxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3B0aW9uYWwsIGNhbGxiYWNrXG4gKiBAcmV0dXJuIHtNYW5hZ2VyfSBzZWxmXG4gKiBAYXBpIHB1YmxpY1xuICovTWFuYWdlci5wcm90b3R5cGUub3BlbiA9IE1hbmFnZXIucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbihmbil7ZGVidWcoJ3JlYWR5U3RhdGUgJXMnLHRoaXMucmVhZHlTdGF0ZSk7aWYofnRoaXMucmVhZHlTdGF0ZS5pbmRleE9mKCdvcGVuJykpcmV0dXJuIHRoaXM7ZGVidWcoJ29wZW5pbmcgJXMnLHRoaXMudXJpKTt0aGlzLmVuZ2luZSA9IGVpbyh0aGlzLnVyaSx0aGlzLm9wdHMpO3ZhciBzb2NrZXQ9dGhpcy5lbmdpbmU7dmFyIHNlbGY9dGhpczt0aGlzLnJlYWR5U3RhdGUgPSAnb3BlbmluZyc7dGhpcy5za2lwUmVjb25uZWN0ID0gZmFsc2U7IC8vIGVtaXQgYG9wZW5gXG52YXIgb3BlblN1Yj1vbihzb2NrZXQsJ29wZW4nLGZ1bmN0aW9uKCl7c2VsZi5vbm9wZW4oKTtmbiAmJiBmbigpO30pOyAvLyBlbWl0IGBjb25uZWN0X2Vycm9yYFxudmFyIGVycm9yU3ViPW9uKHNvY2tldCwnZXJyb3InLGZ1bmN0aW9uKGRhdGEpe2RlYnVnKCdjb25uZWN0X2Vycm9yJyk7c2VsZi5jbGVhbnVwKCk7c2VsZi5yZWFkeVN0YXRlID0gJ2Nsb3NlZCc7c2VsZi5lbWl0QWxsKCdjb25uZWN0X2Vycm9yJyxkYXRhKTtpZihmbil7dmFyIGVycj1uZXcgRXJyb3IoJ0Nvbm5lY3Rpb24gZXJyb3InKTtlcnIuZGF0YSA9IGRhdGE7Zm4oZXJyKTt9ZWxzZSB7IC8vIE9ubHkgZG8gdGhpcyBpZiB0aGVyZSBpcyBubyBmbiB0byBoYW5kbGUgdGhlIGVycm9yXG5zZWxmLm1heWJlUmVjb25uZWN0T25PcGVuKCk7fX0pOyAvLyBlbWl0IGBjb25uZWN0X3RpbWVvdXRgXG5pZihmYWxzZSAhPT0gdGhpcy5fdGltZW91dCl7dmFyIHRpbWVvdXQ9dGhpcy5fdGltZW91dDtkZWJ1ZygnY29ubmVjdCBhdHRlbXB0IHdpbGwgdGltZW91dCBhZnRlciAlZCcsdGltZW91dCk7IC8vIHNldCB0aW1lclxudmFyIHRpbWVyPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWJ1ZygnY29ubmVjdCBhdHRlbXB0IHRpbWVkIG91dCBhZnRlciAlZCcsdGltZW91dCk7b3BlblN1Yi5kZXN0cm95KCk7c29ja2V0LmNsb3NlKCk7c29ja2V0LmVtaXQoJ2Vycm9yJywndGltZW91dCcpO3NlbGYuZW1pdEFsbCgnY29ubmVjdF90aW1lb3V0Jyx0aW1lb3V0KTt9LHRpbWVvdXQpO3RoaXMuc3Vicy5wdXNoKHtkZXN0cm95OmZ1bmN0aW9uIGRlc3Ryb3koKXtjbGVhclRpbWVvdXQodGltZXIpO319KTt9dGhpcy5zdWJzLnB1c2gob3BlblN1Yik7dGhpcy5zdWJzLnB1c2goZXJyb3JTdWIpO3JldHVybiB0aGlzO307IC8qKlxuICogQ2FsbGVkIHVwb24gdHJhbnNwb3J0IG9wZW4uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbm9wZW4gPSBmdW5jdGlvbigpe2RlYnVnKCdvcGVuJyk7IC8vIGNsZWFyIG9sZCBzdWJzXG50aGlzLmNsZWFudXAoKTsgLy8gbWFyayBhcyBvcGVuXG50aGlzLnJlYWR5U3RhdGUgPSAnb3Blbic7dGhpcy5lbWl0KCdvcGVuJyk7IC8vIGFkZCBuZXcgc3Vic1xudmFyIHNvY2tldD10aGlzLmVuZ2luZTt0aGlzLnN1YnMucHVzaChvbihzb2NrZXQsJ2RhdGEnLGJpbmQodGhpcywnb25kYXRhJykpKTt0aGlzLnN1YnMucHVzaChvbihzb2NrZXQsJ3BpbmcnLGJpbmQodGhpcywnb25waW5nJykpKTt0aGlzLnN1YnMucHVzaChvbihzb2NrZXQsJ3BvbmcnLGJpbmQodGhpcywnb25wb25nJykpKTt0aGlzLnN1YnMucHVzaChvbihzb2NrZXQsJ2Vycm9yJyxiaW5kKHRoaXMsJ29uZXJyb3InKSkpO3RoaXMuc3Vicy5wdXNoKG9uKHNvY2tldCwnY2xvc2UnLGJpbmQodGhpcywnb25jbG9zZScpKSk7dGhpcy5zdWJzLnB1c2gob24odGhpcy5kZWNvZGVyLCdkZWNvZGVkJyxiaW5kKHRoaXMsJ29uZGVjb2RlZCcpKSk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHBpbmcuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbnBpbmcgPSBmdW5jdGlvbigpe3RoaXMubGFzdFBpbmcgPSBuZXcgRGF0ZSgpO3RoaXMuZW1pdEFsbCgncGluZycpO307IC8qKlxuICogQ2FsbGVkIHVwb24gYSBwYWNrZXQuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbnBvbmcgPSBmdW5jdGlvbigpe3RoaXMuZW1pdEFsbCgncG9uZycsbmV3IERhdGUoKSAtIHRoaXMubGFzdFBpbmcpO307IC8qKlxuICogQ2FsbGVkIHdpdGggZGF0YS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9uZGF0YSA9IGZ1bmN0aW9uKGRhdGEpe3RoaXMuZGVjb2Rlci5hZGQoZGF0YSk7fTsgLyoqXG4gKiBDYWxsZWQgd2hlbiBwYXJzZXIgZnVsbHkgZGVjb2RlcyBhIHBhY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLm9uZGVjb2RlZCA9IGZ1bmN0aW9uKHBhY2tldCl7dGhpcy5lbWl0KCdwYWNrZXQnLHBhY2tldCk7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBzb2NrZXQgZXJyb3IuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5vbmVycm9yID0gZnVuY3Rpb24oZXJyKXtkZWJ1ZygnZXJyb3InLGVycik7dGhpcy5lbWl0QWxsKCdlcnJvcicsZXJyKTt9OyAvKipcbiAqIENyZWF0ZXMgYSBuZXcgc29ja2V0IGZvciB0aGUgZ2l2ZW4gYG5zcGAuXG4gKlxuICogQHJldHVybiB7U29ja2V0fVxuICogQGFwaSBwdWJsaWNcbiAqL01hbmFnZXIucHJvdG90eXBlLnNvY2tldCA9IGZ1bmN0aW9uKG5zcCl7dmFyIHNvY2tldD10aGlzLm5zcHNbbnNwXTtpZighc29ja2V0KXtzb2NrZXQgPSBuZXcgU29ja2V0KHRoaXMsbnNwKTt0aGlzLm5zcHNbbnNwXSA9IHNvY2tldDt2YXIgc2VsZj10aGlzO3NvY2tldC5vbignY29ubmVjdGluZycsb25Db25uZWN0aW5nKTtzb2NrZXQub24oJ2Nvbm5lY3QnLGZ1bmN0aW9uKCl7c29ja2V0LmlkID0gc2VsZi5lbmdpbmUuaWQ7fSk7aWYodGhpcy5hdXRvQ29ubmVjdCl7IC8vIG1hbnVhbGx5IGNhbGwgaGVyZSBzaW5jZSBjb25uZWN0aW5nIGV2bmV0IGlzIGZpcmVkIGJlZm9yZSBsaXN0ZW5pbmdcbm9uQ29ubmVjdGluZygpO319ZnVuY3Rpb24gb25Db25uZWN0aW5nKCl7aWYoISB+aW5kZXhPZihzZWxmLmNvbm5lY3Rpbmcsc29ja2V0KSl7c2VsZi5jb25uZWN0aW5nLnB1c2goc29ja2V0KTt9fXJldHVybiBzb2NrZXQ7fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHNvY2tldCBjbG9zZS5cbiAqXG4gKiBAcGFyYW0ge1NvY2tldH0gc29ja2V0XG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oc29ja2V0KXt2YXIgaW5kZXg9aW5kZXhPZih0aGlzLmNvbm5lY3Rpbmcsc29ja2V0KTtpZih+aW5kZXgpdGhpcy5jb25uZWN0aW5nLnNwbGljZShpbmRleCwxKTtpZih0aGlzLmNvbm5lY3RpbmcubGVuZ3RoKXJldHVybjt0aGlzLmNsb3NlKCk7fTsgLyoqXG4gKiBXcml0ZXMgYSBwYWNrZXQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5wYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe2RlYnVnKCd3cml0aW5nIHBhY2tldCAlaicscGFja2V0KTt2YXIgc2VsZj10aGlzO2lmKCFzZWxmLmVuY29kaW5nKXsgLy8gZW5jb2RlLCB0aGVuIHdyaXRlIHRvIGVuZ2luZSB3aXRoIHJlc3VsdFxuc2VsZi5lbmNvZGluZyA9IHRydWU7dGhpcy5lbmNvZGVyLmVuY29kZShwYWNrZXQsZnVuY3Rpb24oZW5jb2RlZFBhY2tldHMpe2Zvcih2YXIgaT0wO2kgPCBlbmNvZGVkUGFja2V0cy5sZW5ndGg7aSsrKSB7c2VsZi5lbmdpbmUud3JpdGUoZW5jb2RlZFBhY2tldHNbaV0scGFja2V0Lm9wdGlvbnMpO31zZWxmLmVuY29kaW5nID0gZmFsc2U7c2VsZi5wcm9jZXNzUGFja2V0UXVldWUoKTt9KTt9ZWxzZSB7IC8vIGFkZCBwYWNrZXQgdG8gdGhlIHF1ZXVlXG5zZWxmLnBhY2tldEJ1ZmZlci5wdXNoKHBhY2tldCk7fX07IC8qKlxuICogSWYgcGFja2V0IGJ1ZmZlciBpcyBub24tZW1wdHksIGJlZ2lucyBlbmNvZGluZyB0aGVcbiAqIG5leHQgcGFja2V0IGluIGxpbmUuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5wcm9jZXNzUGFja2V0UXVldWUgPSBmdW5jdGlvbigpe2lmKHRoaXMucGFja2V0QnVmZmVyLmxlbmd0aCA+IDAgJiYgIXRoaXMuZW5jb2Rpbmcpe3ZhciBwYWNrPXRoaXMucGFja2V0QnVmZmVyLnNoaWZ0KCk7dGhpcy5wYWNrZXQocGFjayk7fX07IC8qKlxuICogQ2xlYW4gdXAgdHJhbnNwb3J0IHN1YnNjcmlwdGlvbnMgYW5kIHBhY2tldCBidWZmZXIuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5jbGVhbnVwID0gZnVuY3Rpb24oKXtkZWJ1ZygnY2xlYW51cCcpO3ZhciBzdWI7d2hpbGUoc3ViID0gdGhpcy5zdWJzLnNoaWZ0KCkpIHN1Yi5kZXN0cm95KCk7dGhpcy5wYWNrZXRCdWZmZXIgPSBbXTt0aGlzLmVuY29kaW5nID0gZmFsc2U7dGhpcy5sYXN0UGluZyA9IG51bGw7dGhpcy5kZWNvZGVyLmRlc3Ryb3koKTt9OyAvKipcbiAqIENsb3NlIHRoZSBjdXJyZW50IHNvY2tldC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL01hbmFnZXIucHJvdG90eXBlLmNsb3NlID0gTWFuYWdlci5wcm90b3R5cGUuZGlzY29ubmVjdCA9IGZ1bmN0aW9uKCl7ZGVidWcoJ2Rpc2Nvbm5lY3QnKTt0aGlzLnNraXBSZWNvbm5lY3QgPSB0cnVlO3RoaXMucmVjb25uZWN0aW5nID0gZmFsc2U7aWYoJ29wZW5pbmcnID09IHRoaXMucmVhZHlTdGF0ZSl7IC8vIGBvbmNsb3NlYCB3aWxsIG5vdCBmaXJlIGJlY2F1c2Vcbi8vIGFuIG9wZW4gZXZlbnQgbmV2ZXIgaGFwcGVuZWRcbnRoaXMuY2xlYW51cCgpO310aGlzLmJhY2tvZmYucmVzZXQoKTt0aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJztpZih0aGlzLmVuZ2luZSl0aGlzLmVuZ2luZS5jbG9zZSgpO307IC8qKlxuICogQ2FsbGVkIHVwb24gZW5naW5lIGNsb3NlLlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUub25jbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbil7ZGVidWcoJ29uY2xvc2UnKTt0aGlzLmNsZWFudXAoKTt0aGlzLmJhY2tvZmYucmVzZXQoKTt0aGlzLnJlYWR5U3RhdGUgPSAnY2xvc2VkJzt0aGlzLmVtaXQoJ2Nsb3NlJyxyZWFzb24pO2lmKHRoaXMuX3JlY29ubmVjdGlvbiAmJiAhdGhpcy5za2lwUmVjb25uZWN0KXt0aGlzLnJlY29ubmVjdCgpO319OyAvKipcbiAqIEF0dGVtcHQgYSByZWNvbm5lY3Rpb24uXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9NYW5hZ2VyLnByb3RvdHlwZS5yZWNvbm5lY3QgPSBmdW5jdGlvbigpe2lmKHRoaXMucmVjb25uZWN0aW5nIHx8IHRoaXMuc2tpcFJlY29ubmVjdClyZXR1cm4gdGhpczt2YXIgc2VsZj10aGlzO2lmKHRoaXMuYmFja29mZi5hdHRlbXB0cyA+PSB0aGlzLl9yZWNvbm5lY3Rpb25BdHRlbXB0cyl7ZGVidWcoJ3JlY29ubmVjdCBmYWlsZWQnKTt0aGlzLmJhY2tvZmYucmVzZXQoKTt0aGlzLmVtaXRBbGwoJ3JlY29ubmVjdF9mYWlsZWQnKTt0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlO31lbHNlIHt2YXIgZGVsYXk9dGhpcy5iYWNrb2ZmLmR1cmF0aW9uKCk7ZGVidWcoJ3dpbGwgd2FpdCAlZG1zIGJlZm9yZSByZWNvbm5lY3QgYXR0ZW1wdCcsZGVsYXkpO3RoaXMucmVjb25uZWN0aW5nID0gdHJ1ZTt2YXIgdGltZXI9c2V0VGltZW91dChmdW5jdGlvbigpe2lmKHNlbGYuc2tpcFJlY29ubmVjdClyZXR1cm47ZGVidWcoJ2F0dGVtcHRpbmcgcmVjb25uZWN0Jyk7c2VsZi5lbWl0QWxsKCdyZWNvbm5lY3RfYXR0ZW1wdCcsc2VsZi5iYWNrb2ZmLmF0dGVtcHRzKTtzZWxmLmVtaXRBbGwoJ3JlY29ubmVjdGluZycsc2VsZi5iYWNrb2ZmLmF0dGVtcHRzKTsgLy8gY2hlY2sgYWdhaW4gZm9yIHRoZSBjYXNlIHNvY2tldCBjbG9zZWQgaW4gYWJvdmUgZXZlbnRzXG5pZihzZWxmLnNraXBSZWNvbm5lY3QpcmV0dXJuO3NlbGYub3BlbihmdW5jdGlvbihlcnIpe2lmKGVycil7ZGVidWcoJ3JlY29ubmVjdCBhdHRlbXB0IGVycm9yJyk7c2VsZi5yZWNvbm5lY3RpbmcgPSBmYWxzZTtzZWxmLnJlY29ubmVjdCgpO3NlbGYuZW1pdEFsbCgncmVjb25uZWN0X2Vycm9yJyxlcnIuZGF0YSk7fWVsc2Uge2RlYnVnKCdyZWNvbm5lY3Qgc3VjY2VzcycpO3NlbGYub25yZWNvbm5lY3QoKTt9fSk7fSxkZWxheSk7dGhpcy5zdWJzLnB1c2goe2Rlc3Ryb3k6ZnVuY3Rpb24gZGVzdHJveSgpe2NsZWFyVGltZW91dCh0aW1lcik7fX0pO319OyAvKipcbiAqIENhbGxlZCB1cG9uIHN1Y2Nlc3NmdWwgcmVjb25uZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovTWFuYWdlci5wcm90b3R5cGUub25yZWNvbm5lY3QgPSBmdW5jdGlvbigpe3ZhciBhdHRlbXB0PXRoaXMuYmFja29mZi5hdHRlbXB0czt0aGlzLnJlY29ubmVjdGluZyA9IGZhbHNlO3RoaXMuYmFja29mZi5yZXNldCgpO3RoaXMudXBkYXRlU29ja2V0SWRzKCk7dGhpcy5lbWl0QWxsKCdyZWNvbm5lY3QnLGF0dGVtcHQpO307fSx7XCIuL29uXCI6MzMsXCIuL3NvY2tldFwiOjM0LFwiYmFja28yXCI6MzYsXCJjb21wb25lbnQtYmluZFwiOjM3LFwiY29tcG9uZW50LWVtaXR0ZXJcIjozOCxcImRlYnVnXCI6MzksXCJlbmdpbmUuaW8tY2xpZW50XCI6MSxcImluZGV4b2ZcIjo0MixcInNvY2tldC5pby1wYXJzZXJcIjo0N31dLDMzOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBNb2R1bGUgZXhwb3J0cy5cbiAqL21vZHVsZS5leHBvcnRzID0gb247IC8qKlxuICogSGVscGVyIGZvciBzdWJzY3JpcHRpb25zLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fEV2ZW50RW1pdHRlcn0gb2JqIHdpdGggYEVtaXR0ZXJgIG1peGluIG9yIGBFdmVudEVtaXR0ZXJgXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnQgbmFtZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBvbihvYmosZXYsZm4pe29iai5vbihldixmbik7cmV0dXJuIHtkZXN0cm95OmZ1bmN0aW9uIGRlc3Ryb3koKXtvYmoucmVtb3ZlTGlzdGVuZXIoZXYsZm4pO319O319LHt9XSwzNDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBwYXJzZXI9X2RlcmVxXygnc29ja2V0LmlvLXBhcnNlcicpO3ZhciBFbWl0dGVyPV9kZXJlcV8oJ2NvbXBvbmVudC1lbWl0dGVyJyk7dmFyIHRvQXJyYXk9X2RlcmVxXygndG8tYXJyYXknKTt2YXIgb249X2RlcmVxXygnLi9vbicpO3ZhciBiaW5kPV9kZXJlcV8oJ2NvbXBvbmVudC1iaW5kJyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ3NvY2tldC5pby1jbGllbnQ6c29ja2V0Jyk7dmFyIGhhc0Jpbj1fZGVyZXFfKCdoYXMtYmluYXJ5Jyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBTb2NrZXQ7IC8qKlxuICogSW50ZXJuYWwgZXZlbnRzIChibGFja2xpc3RlZCkuXG4gKiBUaGVzZSBldmVudHMgY2FuJ3QgYmUgZW1pdHRlZCBieSB0aGUgdXNlci5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL3ZhciBldmVudHM9e2Nvbm5lY3Q6MSxjb25uZWN0X2Vycm9yOjEsY29ubmVjdF90aW1lb3V0OjEsY29ubmVjdGluZzoxLGRpc2Nvbm5lY3Q6MSxlcnJvcjoxLHJlY29ubmVjdDoxLHJlY29ubmVjdF9hdHRlbXB0OjEscmVjb25uZWN0X2ZhaWxlZDoxLHJlY29ubmVjdF9lcnJvcjoxLHJlY29ubmVjdGluZzoxLHBpbmc6MSxwb25nOjF9OyAvKipcbiAqIFNob3J0Y3V0IHRvIGBFbWl0dGVyI2VtaXRgLlxuICovdmFyIGVtaXQ9RW1pdHRlci5wcm90b3R5cGUuZW1pdDsgLyoqXG4gKiBgU29ja2V0YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gU29ja2V0KGlvLG5zcCl7dGhpcy5pbyA9IGlvO3RoaXMubnNwID0gbnNwO3RoaXMuanNvbiA9IHRoaXM7IC8vIGNvbXBhdFxudGhpcy5pZHMgPSAwO3RoaXMuYWNrcyA9IHt9O3RoaXMucmVjZWl2ZUJ1ZmZlciA9IFtdO3RoaXMuc2VuZEJ1ZmZlciA9IFtdO3RoaXMuY29ubmVjdGVkID0gZmFsc2U7dGhpcy5kaXNjb25uZWN0ZWQgPSB0cnVlO2lmKHRoaXMuaW8uYXV0b0Nvbm5lY3QpdGhpcy5vcGVuKCk7fSAvKipcbiAqIE1peCBpbiBgRW1pdHRlcmAuXG4gKi9FbWl0dGVyKFNvY2tldC5wcm90b3R5cGUpOyAvKipcbiAqIFN1YnNjcmliZSB0byBvcGVuLCBjbG9zZSBhbmQgcGFja2V0IGV2ZW50c1xuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5zdWJFdmVudHMgPSBmdW5jdGlvbigpe2lmKHRoaXMuc3VicylyZXR1cm47dmFyIGlvPXRoaXMuaW87dGhpcy5zdWJzID0gW29uKGlvLCdvcGVuJyxiaW5kKHRoaXMsJ29ub3BlbicpKSxvbihpbywncGFja2V0JyxiaW5kKHRoaXMsJ29ucGFja2V0JykpLG9uKGlvLCdjbG9zZScsYmluZCh0aGlzLCdvbmNsb3NlJykpXTt9OyAvKipcbiAqIFwiT3BlbnNcIiB0aGUgc29ja2V0LlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9wZW4gPSBTb2NrZXQucHJvdG90eXBlLmNvbm5lY3QgPSBmdW5jdGlvbigpe2lmKHRoaXMuY29ubmVjdGVkKXJldHVybiB0aGlzO3RoaXMuc3ViRXZlbnRzKCk7dGhpcy5pby5vcGVuKCk7IC8vIGVuc3VyZSBvcGVuXG5pZignb3BlbicgPT0gdGhpcy5pby5yZWFkeVN0YXRlKXRoaXMub25vcGVuKCk7dGhpcy5lbWl0KCdjb25uZWN0aW5nJyk7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZW5kcyBhIGBtZXNzYWdlYCBldmVudC5cbiAqXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG90eXBlLnNlbmQgPSBmdW5jdGlvbigpe3ZhciBhcmdzPXRvQXJyYXkoYXJndW1lbnRzKTthcmdzLnVuc2hpZnQoJ21lc3NhZ2UnKTt0aGlzLmVtaXQuYXBwbHkodGhpcyxhcmdzKTtyZXR1cm4gdGhpczt9OyAvKipcbiAqIE92ZXJyaWRlIGBlbWl0YC5cbiAqIElmIHRoZSBldmVudCBpcyBpbiBgZXZlbnRzYCwgaXQncyBlbWl0dGVkIG5vcm1hbGx5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudCBuYW1lXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbihldil7aWYoZXZlbnRzLmhhc093blByb3BlcnR5KGV2KSl7ZW1pdC5hcHBseSh0aGlzLGFyZ3VtZW50cyk7cmV0dXJuIHRoaXM7fXZhciBhcmdzPXRvQXJyYXkoYXJndW1lbnRzKTt2YXIgcGFyc2VyVHlwZT1wYXJzZXIuRVZFTlQ7IC8vIGRlZmF1bHRcbmlmKGhhc0JpbihhcmdzKSl7cGFyc2VyVHlwZSA9IHBhcnNlci5CSU5BUllfRVZFTlQ7fSAvLyBiaW5hcnlcbnZhciBwYWNrZXQ9e3R5cGU6cGFyc2VyVHlwZSxkYXRhOmFyZ3N9O3BhY2tldC5vcHRpb25zID0ge307cGFja2V0Lm9wdGlvbnMuY29tcHJlc3MgPSAhdGhpcy5mbGFncyB8fCBmYWxzZSAhPT0gdGhpcy5mbGFncy5jb21wcmVzczsgLy8gZXZlbnQgYWNrIGNhbGxiYWNrXG5pZignZnVuY3Rpb24nID09IHR5cGVvZiBhcmdzW2FyZ3MubGVuZ3RoIC0gMV0pe2RlYnVnKCdlbWl0dGluZyBwYWNrZXQgd2l0aCBhY2sgaWQgJWQnLHRoaXMuaWRzKTt0aGlzLmFja3NbdGhpcy5pZHNdID0gYXJncy5wb3AoKTtwYWNrZXQuaWQgPSB0aGlzLmlkcysrO31pZih0aGlzLmNvbm5lY3RlZCl7dGhpcy5wYWNrZXQocGFja2V0KTt9ZWxzZSB7dGhpcy5zZW5kQnVmZmVyLnB1c2gocGFja2V0KTt9ZGVsZXRlIHRoaXMuZmxhZ3M7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBTZW5kcyBhIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUucGFja2V0ID0gZnVuY3Rpb24ocGFja2V0KXtwYWNrZXQubnNwID0gdGhpcy5uc3A7dGhpcy5pby5wYWNrZXQocGFja2V0KTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIGVuZ2luZSBgb3BlbmAuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9ub3BlbiA9IGZ1bmN0aW9uKCl7ZGVidWcoJ3RyYW5zcG9ydCBpcyBvcGVuIC0gY29ubmVjdGluZycpOyAvLyB3cml0ZSBjb25uZWN0IHBhY2tldCBpZiBuZWNlc3NhcnlcbmlmKCcvJyAhPSB0aGlzLm5zcCl7dGhpcy5wYWNrZXQoe3R5cGU6cGFyc2VyLkNPTk5FQ1R9KTt9fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBlbmdpbmUgYGNsb3NlYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcmVhc29uXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25jbG9zZSA9IGZ1bmN0aW9uKHJlYXNvbil7ZGVidWcoJ2Nsb3NlICglcyknLHJlYXNvbik7dGhpcy5jb25uZWN0ZWQgPSBmYWxzZTt0aGlzLmRpc2Nvbm5lY3RlZCA9IHRydWU7ZGVsZXRlIHRoaXMuaWQ7dGhpcy5lbWl0KCdkaXNjb25uZWN0JyxyZWFzb24pO307IC8qKlxuICogQ2FsbGVkIHdpdGggc29ja2V0IHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25wYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQpe2lmKHBhY2tldC5uc3AgIT0gdGhpcy5uc3ApcmV0dXJuO3N3aXRjaChwYWNrZXQudHlwZSl7Y2FzZSBwYXJzZXIuQ09OTkVDVDp0aGlzLm9uY29ubmVjdCgpO2JyZWFrO2Nhc2UgcGFyc2VyLkVWRU5UOnRoaXMub25ldmVudChwYWNrZXQpO2JyZWFrO2Nhc2UgcGFyc2VyLkJJTkFSWV9FVkVOVDp0aGlzLm9uZXZlbnQocGFja2V0KTticmVhaztjYXNlIHBhcnNlci5BQ0s6dGhpcy5vbmFjayhwYWNrZXQpO2JyZWFrO2Nhc2UgcGFyc2VyLkJJTkFSWV9BQ0s6dGhpcy5vbmFjayhwYWNrZXQpO2JyZWFrO2Nhc2UgcGFyc2VyLkRJU0NPTk5FQ1Q6dGhpcy5vbmRpc2Nvbm5lY3QoKTticmVhaztjYXNlIHBhcnNlci5FUlJPUjp0aGlzLmVtaXQoJ2Vycm9yJyxwYWNrZXQuZGF0YSk7YnJlYWs7fX07IC8qKlxuICogQ2FsbGVkIHVwb24gYSBzZXJ2ZXIgZXZlbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQGFwaSBwcml2YXRlXG4gKi9Tb2NrZXQucHJvdG90eXBlLm9uZXZlbnQgPSBmdW5jdGlvbihwYWNrZXQpe3ZhciBhcmdzPXBhY2tldC5kYXRhIHx8IFtdO2RlYnVnKCdlbWl0dGluZyBldmVudCAlaicsYXJncyk7aWYobnVsbCAhPSBwYWNrZXQuaWQpe2RlYnVnKCdhdHRhY2hpbmcgYWNrIGNhbGxiYWNrIHRvIGV2ZW50Jyk7YXJncy5wdXNoKHRoaXMuYWNrKHBhY2tldC5pZCkpO31pZih0aGlzLmNvbm5lY3RlZCl7ZW1pdC5hcHBseSh0aGlzLGFyZ3MpO31lbHNlIHt0aGlzLnJlY2VpdmVCdWZmZXIucHVzaChhcmdzKTt9fTsgLyoqXG4gKiBQcm9kdWNlcyBhbiBhY2sgY2FsbGJhY2sgdG8gZW1pdCB3aXRoIGFuIGV2ZW50LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5hY2sgPSBmdW5jdGlvbihpZCl7dmFyIHNlbGY9dGhpczt2YXIgc2VudD1mYWxzZTtyZXR1cm4gZnVuY3Rpb24oKXsgLy8gcHJldmVudCBkb3VibGUgY2FsbGJhY2tzXG5pZihzZW50KXJldHVybjtzZW50ID0gdHJ1ZTt2YXIgYXJncz10b0FycmF5KGFyZ3VtZW50cyk7ZGVidWcoJ3NlbmRpbmcgYWNrICVqJyxhcmdzKTt2YXIgdHlwZT1oYXNCaW4oYXJncyk/cGFyc2VyLkJJTkFSWV9BQ0s6cGFyc2VyLkFDSztzZWxmLnBhY2tldCh7dHlwZTp0eXBlLGlkOmlkLGRhdGE6YXJnc30pO307fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBhIHNlcnZlciBhY2tub3dsZWdlbWVudC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25hY2sgPSBmdW5jdGlvbihwYWNrZXQpe3ZhciBhY2s9dGhpcy5hY2tzW3BhY2tldC5pZF07aWYoJ2Z1bmN0aW9uJyA9PSB0eXBlb2YgYWNrKXtkZWJ1ZygnY2FsbGluZyBhY2sgJXMgd2l0aCAlaicscGFja2V0LmlkLHBhY2tldC5kYXRhKTthY2suYXBwbHkodGhpcyxwYWNrZXQuZGF0YSk7ZGVsZXRlIHRoaXMuYWNrc1twYWNrZXQuaWRdO31lbHNlIHtkZWJ1ZygnYmFkIGFjayAlcycscGFja2V0LmlkKTt9fTsgLyoqXG4gKiBDYWxsZWQgdXBvbiBzZXJ2ZXIgY29ubmVjdC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUub25jb25uZWN0ID0gZnVuY3Rpb24oKXt0aGlzLmNvbm5lY3RlZCA9IHRydWU7dGhpcy5kaXNjb25uZWN0ZWQgPSBmYWxzZTt0aGlzLmVtaXQoJ2Nvbm5lY3QnKTt0aGlzLmVtaXRCdWZmZXJlZCgpO307IC8qKlxuICogRW1pdCBidWZmZXJlZCBldmVudHMgKHJlY2VpdmVkIGFuZCBlbWl0dGVkKS5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1NvY2tldC5wcm90b3R5cGUuZW1pdEJ1ZmZlcmVkID0gZnVuY3Rpb24oKXt2YXIgaTtmb3IoaSA9IDA7aSA8IHRoaXMucmVjZWl2ZUJ1ZmZlci5sZW5ndGg7aSsrKSB7ZW1pdC5hcHBseSh0aGlzLHRoaXMucmVjZWl2ZUJ1ZmZlcltpXSk7fXRoaXMucmVjZWl2ZUJ1ZmZlciA9IFtdO2ZvcihpID0gMDtpIDwgdGhpcy5zZW5kQnVmZmVyLmxlbmd0aDtpKyspIHt0aGlzLnBhY2tldCh0aGlzLnNlbmRCdWZmZXJbaV0pO310aGlzLnNlbmRCdWZmZXIgPSBbXTt9OyAvKipcbiAqIENhbGxlZCB1cG9uIHNlcnZlciBkaXNjb25uZWN0LlxuICpcbiAqIEBhcGkgcHJpdmF0ZVxuICovU29ja2V0LnByb3RvdHlwZS5vbmRpc2Nvbm5lY3QgPSBmdW5jdGlvbigpe2RlYnVnKCdzZXJ2ZXIgZGlzY29ubmVjdCAoJXMpJyx0aGlzLm5zcCk7dGhpcy5kZXN0cm95KCk7dGhpcy5vbmNsb3NlKCdpbyBzZXJ2ZXIgZGlzY29ubmVjdCcpO307IC8qKlxuICogQ2FsbGVkIHVwb24gZm9yY2VkIGNsaWVudC9zZXJ2ZXIgc2lkZSBkaXNjb25uZWN0aW9ucyxcbiAqIHRoaXMgbWV0aG9kIGVuc3VyZXMgdGhlIG1hbmFnZXIgc3RvcHMgdHJhY2tpbmcgdXMgYW5kXG4gKiB0aGF0IHJlY29ubmVjdGlvbnMgZG9uJ3QgZ2V0IHRyaWdnZXJlZCBmb3IgdGhpcy5cbiAqXG4gKiBAYXBpIHByaXZhdGUuXG4gKi9Tb2NrZXQucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbigpe2lmKHRoaXMuc3Vicyl7IC8vIGNsZWFuIHN1YnNjcmlwdGlvbnMgdG8gYXZvaWQgcmVjb25uZWN0aW9uc1xuZm9yKHZhciBpPTA7aSA8IHRoaXMuc3Vicy5sZW5ndGg7aSsrKSB7dGhpcy5zdWJzW2ldLmRlc3Ryb3koKTt9dGhpcy5zdWJzID0gbnVsbDt9dGhpcy5pby5kZXN0cm95KHRoaXMpO307IC8qKlxuICogRGlzY29ubmVjdHMgdGhlIHNvY2tldCBtYW51YWxseS5cbiAqXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG90eXBlLmNsb3NlID0gU29ja2V0LnByb3RvdHlwZS5kaXNjb25uZWN0ID0gZnVuY3Rpb24oKXtpZih0aGlzLmNvbm5lY3RlZCl7ZGVidWcoJ3BlcmZvcm1pbmcgZGlzY29ubmVjdCAoJXMpJyx0aGlzLm5zcCk7dGhpcy5wYWNrZXQoe3R5cGU6cGFyc2VyLkRJU0NPTk5FQ1R9KTt9IC8vIHJlbW92ZSBzb2NrZXQgZnJvbSBwb29sXG50aGlzLmRlc3Ryb3koKTtpZih0aGlzLmNvbm5lY3RlZCl7IC8vIGZpcmUgZXZlbnRzXG50aGlzLm9uY2xvc2UoJ2lvIGNsaWVudCBkaXNjb25uZWN0Jyk7fXJldHVybiB0aGlzO307IC8qKlxuICogU2V0cyB0aGUgY29tcHJlc3MgZmxhZy5cbiAqXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlmIGB0cnVlYCwgY29tcHJlc3NlcyB0aGUgc2VuZGluZyBkYXRhXG4gKiBAcmV0dXJuIHtTb2NrZXR9IHNlbGZcbiAqIEBhcGkgcHVibGljXG4gKi9Tb2NrZXQucHJvdG90eXBlLmNvbXByZXNzID0gZnVuY3Rpb24oY29tcHJlc3Mpe3RoaXMuZmxhZ3MgPSB0aGlzLmZsYWdzIHx8IHt9O3RoaXMuZmxhZ3MuY29tcHJlc3MgPSBjb21wcmVzcztyZXR1cm4gdGhpczt9O30se1wiLi9vblwiOjMzLFwiY29tcG9uZW50LWJpbmRcIjozNyxcImNvbXBvbmVudC1lbWl0dGVyXCI6MzgsXCJkZWJ1Z1wiOjM5LFwiaGFzLWJpbmFyeVwiOjQxLFwic29ja2V0LmlvLXBhcnNlclwiOjQ3LFwidG8tYXJyYXlcIjo1MX1dLDM1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyoqXG4gKiBNb2R1bGUgZGVwZW5kZW5jaWVzLlxuICovdmFyIHBhcnNldXJpPV9kZXJlcV8oJ3BhcnNldXJpJyk7dmFyIGRlYnVnPV9kZXJlcV8oJ2RlYnVnJykoJ3NvY2tldC5pby1jbGllbnQ6dXJsJyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IHVybDsgLyoqXG4gKiBVUkwgcGFyc2VyLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB1cmxcbiAqIEBwYXJhbSB7T2JqZWN0fSBBbiBvYmplY3QgbWVhbnQgdG8gbWltaWMgd2luZG93LmxvY2F0aW9uLlxuICogICAgICAgICAgICAgICAgIERlZmF1bHRzIHRvIHdpbmRvdy5sb2NhdGlvbi5cbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiB1cmwodXJpLGxvYyl7dmFyIG9iaj11cmk7IC8vIGRlZmF1bHQgdG8gd2luZG93LmxvY2F0aW9uXG52YXIgbG9jPWxvYyB8fCBnbG9iYWwubG9jYXRpb247aWYobnVsbCA9PSB1cmkpdXJpID0gbG9jLnByb3RvY29sICsgJy8vJyArIGxvYy5ob3N0OyAvLyByZWxhdGl2ZSBwYXRoIHN1cHBvcnRcbmlmKCdzdHJpbmcnID09IHR5cGVvZiB1cmkpe2lmKCcvJyA9PSB1cmkuY2hhckF0KDApKXtpZignLycgPT0gdXJpLmNoYXJBdCgxKSl7dXJpID0gbG9jLnByb3RvY29sICsgdXJpO31lbHNlIHt1cmkgPSBsb2MuaG9zdCArIHVyaTt9fWlmKCEvXihodHRwcz98d3NzPyk6XFwvXFwvLy50ZXN0KHVyaSkpe2RlYnVnKCdwcm90b2NvbC1sZXNzIHVybCAlcycsdXJpKTtpZigndW5kZWZpbmVkJyAhPSB0eXBlb2YgbG9jKXt1cmkgPSBsb2MucHJvdG9jb2wgKyAnLy8nICsgdXJpO31lbHNlIHt1cmkgPSAnaHR0cHM6Ly8nICsgdXJpO319IC8vIHBhcnNlXG5kZWJ1ZygncGFyc2UgJXMnLHVyaSk7b2JqID0gcGFyc2V1cmkodXJpKTt9IC8vIG1ha2Ugc3VyZSB3ZSB0cmVhdCBgbG9jYWxob3N0OjgwYCBhbmQgYGxvY2FsaG9zdGAgZXF1YWxseVxuaWYoIW9iai5wb3J0KXtpZigvXihodHRwfHdzKSQvLnRlc3Qob2JqLnByb3RvY29sKSl7b2JqLnBvcnQgPSAnODAnO31lbHNlIGlmKC9eKGh0dHB8d3MpcyQvLnRlc3Qob2JqLnByb3RvY29sKSl7b2JqLnBvcnQgPSAnNDQzJzt9fW9iai5wYXRoID0gb2JqLnBhdGggfHwgJy8nO3ZhciBpcHY2PW9iai5ob3N0LmluZGV4T2YoJzonKSAhPT0gLTE7dmFyIGhvc3Q9aXB2Nj8nWycgKyBvYmouaG9zdCArICddJzpvYmouaG9zdDsgLy8gZGVmaW5lIHVuaXF1ZSBpZFxub2JqLmlkID0gb2JqLnByb3RvY29sICsgJzovLycgKyBob3N0ICsgJzonICsgb2JqLnBvcnQ7IC8vIGRlZmluZSBocmVmXG5vYmouaHJlZiA9IG9iai5wcm90b2NvbCArICc6Ly8nICsgaG9zdCArIChsb2MgJiYgbG9jLnBvcnQgPT0gb2JqLnBvcnQ/Jyc6JzonICsgb2JqLnBvcnQpO3JldHVybiBvYmo7fX0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcImRlYnVnXCI6MzksXCJwYXJzZXVyaVwiOjQ1fV0sMzY6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyAvKipcbiAqIEV4cG9zZSBgQmFja29mZmAuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IEJhY2tvZmY7IC8qKlxuICogSW5pdGlhbGl6ZSBiYWNrb2ZmIHRpbWVyIHdpdGggYG9wdHNgLlxuICpcbiAqIC0gYG1pbmAgaW5pdGlhbCB0aW1lb3V0IGluIG1pbGxpc2Vjb25kcyBbMTAwXVxuICogLSBgbWF4YCBtYXggdGltZW91dCBbMTAwMDBdXG4gKiAtIGBqaXR0ZXJgIFswXVxuICogLSBgZmFjdG9yYCBbMl1cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQGFwaSBwdWJsaWNcbiAqL2Z1bmN0aW9uIEJhY2tvZmYob3B0cyl7b3B0cyA9IG9wdHMgfHwge307dGhpcy5tcyA9IG9wdHMubWluIHx8IDEwMDt0aGlzLm1heCA9IG9wdHMubWF4IHx8IDEwMDAwO3RoaXMuZmFjdG9yID0gb3B0cy5mYWN0b3IgfHwgMjt0aGlzLmppdHRlciA9IG9wdHMuaml0dGVyID4gMCAmJiBvcHRzLmppdHRlciA8PSAxP29wdHMuaml0dGVyOjA7dGhpcy5hdHRlbXB0cyA9IDA7fSAvKipcbiAqIFJldHVybiB0aGUgYmFja29mZiBkdXJhdGlvbi5cbiAqXG4gKiBAcmV0dXJuIHtOdW1iZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovQmFja29mZi5wcm90b3R5cGUuZHVyYXRpb24gPSBmdW5jdGlvbigpe3ZhciBtcz10aGlzLm1zICogTWF0aC5wb3codGhpcy5mYWN0b3IsdGhpcy5hdHRlbXB0cysrKTtpZih0aGlzLmppdHRlcil7dmFyIHJhbmQ9TWF0aC5yYW5kb20oKTt2YXIgZGV2aWF0aW9uPU1hdGguZmxvb3IocmFuZCAqIHRoaXMuaml0dGVyICogbXMpO21zID0gKE1hdGguZmxvb3IocmFuZCAqIDEwKSAmIDEpID09IDA/bXMgLSBkZXZpYXRpb246bXMgKyBkZXZpYXRpb247fXJldHVybiBNYXRoLm1pbihtcyx0aGlzLm1heCkgfCAwO307IC8qKlxuICogUmVzZXQgdGhlIG51bWJlciBvZiBhdHRlbXB0cy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovQmFja29mZi5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbigpe3RoaXMuYXR0ZW1wdHMgPSAwO307IC8qKlxuICogU2V0IHRoZSBtaW5pbXVtIGR1cmF0aW9uXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL0JhY2tvZmYucHJvdG90eXBlLnNldE1pbiA9IGZ1bmN0aW9uKG1pbil7dGhpcy5tcyA9IG1pbjt9OyAvKipcbiAqIFNldCB0aGUgbWF4aW11bSBkdXJhdGlvblxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9CYWNrb2ZmLnByb3RvdHlwZS5zZXRNYXggPSBmdW5jdGlvbihtYXgpe3RoaXMubWF4ID0gbWF4O307IC8qKlxuICogU2V0IHRoZSBqaXR0ZXJcbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovQmFja29mZi5wcm90b3R5cGUuc2V0Sml0dGVyID0gZnVuY3Rpb24oaml0dGVyKXt0aGlzLmppdHRlciA9IGppdHRlcjt9O30se31dLDM3OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsgLyoqXG4gKiBTbGljZSByZWZlcmVuY2UuXG4gKi92YXIgc2xpY2U9W10uc2xpY2U7IC8qKlxuICogQmluZCBgb2JqYCB0byBgZm5gLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7RnVuY3Rpb258U3RyaW5nfSBmbiBvciBzdHJpbmdcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICogQGFwaSBwdWJsaWNcbiAqL21vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24ob2JqLGZuKXtpZignc3RyaW5nJyA9PSB0eXBlb2YgZm4pZm4gPSBvYmpbZm5dO2lmKCdmdW5jdGlvbicgIT0gdHlwZW9mIGZuKXRocm93IG5ldyBFcnJvcignYmluZCgpIHJlcXVpcmVzIGEgZnVuY3Rpb24nKTt2YXIgYXJncz1zbGljZS5jYWxsKGFyZ3VtZW50cywyKTtyZXR1cm4gZnVuY3Rpb24oKXtyZXR1cm4gZm4uYXBwbHkob2JqLGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO307fTt9LHt9XSwzODpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogRXhwb3NlIGBFbWl0dGVyYC5cbiAqL21vZHVsZS5leHBvcnRzID0gRW1pdHRlcjsgLyoqXG4gKiBJbml0aWFsaXplIGEgbmV3IGBFbWl0dGVyYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gRW1pdHRlcihvYmope2lmKG9iailyZXR1cm4gbWl4aW4ob2JqKTt9OyAvKipcbiAqIE1peGluIHRoZSBlbWl0dGVyIHByb3BlcnRpZXMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBtaXhpbihvYmope2Zvcih2YXIga2V5IGluIEVtaXR0ZXIucHJvdG90eXBlKSB7b2JqW2tleV0gPSBFbWl0dGVyLnByb3RvdHlwZVtrZXldO31yZXR1cm4gb2JqO30gLyoqXG4gKiBMaXN0ZW4gb24gdGhlIGdpdmVuIGBldmVudGAgd2l0aCBgZm5gLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovRW1pdHRlci5wcm90b3R5cGUub24gPSBFbWl0dGVyLnByb3RvdHlwZS5hZGRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24oZXZlbnQsZm4pe3RoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTsodGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSA9IHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF0gfHwgW10pLnB1c2goZm4pO3JldHVybiB0aGlzO307IC8qKlxuICogQWRkcyBhbiBgZXZlbnRgIGxpc3RlbmVyIHRoYXQgd2lsbCBiZSBpbnZva2VkIGEgc2luZ2xlXG4gKiB0aW1lIHRoZW4gYXV0b21hdGljYWxseSByZW1vdmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKiBAYXBpIHB1YmxpY1xuICovRW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKGV2ZW50LGZuKXtmdW5jdGlvbiBvbigpe3RoaXMub2ZmKGV2ZW50LG9uKTtmbi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7fW9uLmZuID0gZm47dGhpcy5vbihldmVudCxvbik7cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHJldHVybiB7RW1pdHRlcn1cbiAqIEBhcGkgcHVibGljXG4gKi9FbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUV2ZW50TGlzdGVuZXIgPSBmdW5jdGlvbihldmVudCxmbil7dGhpcy5fY2FsbGJhY2tzID0gdGhpcy5fY2FsbGJhY2tzIHx8IHt9OyAvLyBhbGxcbmlmKDAgPT0gYXJndW1lbnRzLmxlbmd0aCl7dGhpcy5fY2FsbGJhY2tzID0ge307cmV0dXJuIHRoaXM7fSAvLyBzcGVjaWZpYyBldmVudFxudmFyIGNhbGxiYWNrcz10aGlzLl9jYWxsYmFja3NbJyQnICsgZXZlbnRdO2lmKCFjYWxsYmFja3MpcmV0dXJuIHRoaXM7IC8vIHJlbW92ZSBhbGwgaGFuZGxlcnNcbmlmKDEgPT0gYXJndW1lbnRzLmxlbmd0aCl7ZGVsZXRlIHRoaXMuX2NhbGxiYWNrc1snJCcgKyBldmVudF07cmV0dXJuIHRoaXM7fSAvLyByZW1vdmUgc3BlY2lmaWMgaGFuZGxlclxudmFyIGNiO2Zvcih2YXIgaT0wO2kgPCBjYWxsYmFja3MubGVuZ3RoO2krKykge2NiID0gY2FsbGJhY2tzW2ldO2lmKGNiID09PSBmbiB8fCBjYi5mbiA9PT0gZm4pe2NhbGxiYWNrcy5zcGxpY2UoaSwxKTticmVhazt9fXJldHVybiB0aGlzO307IC8qKlxuICogRW1pdCBgZXZlbnRgIHdpdGggdGhlIGdpdmVuIGFyZ3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge01peGVkfSAuLi5cbiAqIEByZXR1cm4ge0VtaXR0ZXJ9XG4gKi9FbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24oZXZlbnQpe3RoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTt2YXIgYXJncz1bXS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKSxjYWxsYmFja3M9dGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XTtpZihjYWxsYmFja3Mpe2NhbGxiYWNrcyA9IGNhbGxiYWNrcy5zbGljZSgwKTtmb3IodmFyIGk9MCxsZW49Y2FsbGJhY2tzLmxlbmd0aDtpIDwgbGVuOysraSkge2NhbGxiYWNrc1tpXS5hcHBseSh0aGlzLGFyZ3MpO319cmV0dXJuIHRoaXM7fTsgLyoqXG4gKiBSZXR1cm4gYXJyYXkgb2YgY2FsbGJhY2tzIGZvciBgZXZlbnRgLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHJldHVybiB7QXJyYXl9XG4gKiBAYXBpIHB1YmxpY1xuICovRW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe3RoaXMuX2NhbGxiYWNrcyA9IHRoaXMuX2NhbGxiYWNrcyB8fCB7fTtyZXR1cm4gdGhpcy5fY2FsbGJhY2tzWyckJyArIGV2ZW50XSB8fCBbXTt9OyAvKipcbiAqIENoZWNrIGlmIHRoaXMgZW1pdHRlciBoYXMgYGV2ZW50YCBoYW5kbGVycy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKiBAYXBpIHB1YmxpY1xuICovRW1pdHRlci5wcm90b3R5cGUuaGFzTGlzdGVuZXJzID0gZnVuY3Rpb24oZXZlbnQpe3JldHVybiAhIXRoaXMubGlzdGVuZXJzKGV2ZW50KS5sZW5ndGg7fTt9LHt9XSwzOTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7YXJndW1lbnRzWzRdWzE3XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cyk7fSx7XCIuL2RlYnVnXCI6NDAsXCJkdXBcIjoxN31dLDQwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMThdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcImR1cFwiOjE4LFwibXNcIjo0NH1dLDQxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLypcbiAqIE1vZHVsZSByZXF1aXJlbWVudHMuXG4gKi92YXIgaXNBcnJheT1fZGVyZXFfKCdpc2FycmF5Jyk7IC8qKlxuICogTW9kdWxlIGV4cG9ydHMuXG4gKi9tb2R1bGUuZXhwb3J0cyA9IGhhc0JpbmFyeTsgLyoqXG4gKiBDaGVja3MgZm9yIGJpbmFyeSBkYXRhLlxuICpcbiAqIFJpZ2h0IG5vdyBvbmx5IEJ1ZmZlciBhbmQgQXJyYXlCdWZmZXIgYXJlIHN1cHBvcnRlZC4uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGFueXRoaW5nXG4gKiBAYXBpIHB1YmxpY1xuICovZnVuY3Rpb24gaGFzQmluYXJ5KGRhdGEpe2Z1bmN0aW9uIF9oYXNCaW5hcnkob2JqKXtpZighb2JqKXJldHVybiBmYWxzZTtpZihnbG9iYWwuQnVmZmVyICYmIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIgJiYgZ2xvYmFsLkJ1ZmZlci5pc0J1ZmZlcihvYmopIHx8IGdsb2JhbC5BcnJheUJ1ZmZlciAmJiBvYmogaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fCBnbG9iYWwuQmxvYiAmJiBvYmogaW5zdGFuY2VvZiBCbG9iIHx8IGdsb2JhbC5GaWxlICYmIG9iaiBpbnN0YW5jZW9mIEZpbGUpe3JldHVybiB0cnVlO31pZihpc0FycmF5KG9iaikpe2Zvcih2YXIgaT0wO2kgPCBvYmoubGVuZ3RoO2krKykge2lmKF9oYXNCaW5hcnkob2JqW2ldKSl7cmV0dXJuIHRydWU7fX19ZWxzZSBpZihvYmogJiYgJ29iamVjdCcgPT0gdHlwZW9mIG9iail7IC8vIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL0F1dG9tYXR0aWMvaGFzLWJpbmFyeS9wdWxsLzRcbmlmKG9iai50b0pTT04gJiYgJ2Z1bmN0aW9uJyA9PSB0eXBlb2Ygb2JqLnRvSlNPTil7b2JqID0gb2JqLnRvSlNPTigpO31mb3IodmFyIGtleSBpbiBvYmopIHtpZihPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLGtleSkgJiYgX2hhc0JpbmFyeShvYmpba2V5XSkpe3JldHVybiB0cnVlO319fXJldHVybiBmYWxzZTt9cmV0dXJuIF9oYXNCaW5hcnkoZGF0YSk7fX0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcImlzYXJyYXlcIjo0M31dLDQyOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMjNdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcImR1cFwiOjIzfV0sNDM6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpe2FyZ3VtZW50c1s0XVsyNF1bMF0uYXBwbHkoZXhwb3J0cyxhcmd1bWVudHMpO30se1wiZHVwXCI6MjR9XSw0NDpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7YXJndW1lbnRzWzRdWzI1XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cyk7fSx7XCJkdXBcIjoyNX1dLDQ1OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXthcmd1bWVudHNbNF1bMjhdWzBdLmFwcGx5KGV4cG9ydHMsYXJndW1lbnRzKTt9LHtcImR1cFwiOjI4fV0sNDY6W2Z1bmN0aW9uKF9kZXJlcV8sbW9kdWxlLGV4cG9ydHMpeyhmdW5jdGlvbihnbG9iYWwpeyAvKmdsb2JhbCBCbG9iLEZpbGUqLyAvKipcbiAqIE1vZHVsZSByZXF1aXJlbWVudHNcbiAqL3ZhciBpc0FycmF5PV9kZXJlcV8oJ2lzYXJyYXknKTt2YXIgaXNCdWY9X2RlcmVxXygnLi9pcy1idWZmZXInKTsgLyoqXG4gKiBSZXBsYWNlcyBldmVyeSBCdWZmZXIgfCBBcnJheUJ1ZmZlciBpbiBwYWNrZXQgd2l0aCBhIG51bWJlcmVkIHBsYWNlaG9sZGVyLlxuICogQW55dGhpbmcgd2l0aCBibG9icyBvciBmaWxlcyBzaG91bGQgYmUgZmVkIHRocm91Z2ggcmVtb3ZlQmxvYnMgYmVmb3JlIGNvbWluZ1xuICogaGVyZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0IC0gc29ja2V0LmlvIGV2ZW50IHBhY2tldFxuICogQHJldHVybiB7T2JqZWN0fSB3aXRoIGRlY29uc3RydWN0ZWQgcGFja2V0IGFuZCBsaXN0IG9mIGJ1ZmZlcnNcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLmRlY29uc3RydWN0UGFja2V0ID0gZnVuY3Rpb24ocGFja2V0KXt2YXIgYnVmZmVycz1bXTt2YXIgcGFja2V0RGF0YT1wYWNrZXQuZGF0YTtmdW5jdGlvbiBfZGVjb25zdHJ1Y3RQYWNrZXQoZGF0YSl7aWYoIWRhdGEpcmV0dXJuIGRhdGE7aWYoaXNCdWYoZGF0YSkpe3ZhciBwbGFjZWhvbGRlcj17X3BsYWNlaG9sZGVyOnRydWUsbnVtOmJ1ZmZlcnMubGVuZ3RofTtidWZmZXJzLnB1c2goZGF0YSk7cmV0dXJuIHBsYWNlaG9sZGVyO31lbHNlIGlmKGlzQXJyYXkoZGF0YSkpe3ZhciBuZXdEYXRhPW5ldyBBcnJheShkYXRhLmxlbmd0aCk7Zm9yKHZhciBpPTA7aSA8IGRhdGEubGVuZ3RoO2krKykge25ld0RhdGFbaV0gPSBfZGVjb25zdHJ1Y3RQYWNrZXQoZGF0YVtpXSk7fXJldHVybiBuZXdEYXRhO31lbHNlIGlmKCdvYmplY3QnID09IHR5cGVvZiBkYXRhICYmICEoZGF0YSBpbnN0YW5jZW9mIERhdGUpKXt2YXIgbmV3RGF0YT17fTtmb3IodmFyIGtleSBpbiBkYXRhKSB7bmV3RGF0YVtrZXldID0gX2RlY29uc3RydWN0UGFja2V0KGRhdGFba2V5XSk7fXJldHVybiBuZXdEYXRhO31yZXR1cm4gZGF0YTt9dmFyIHBhY2s9cGFja2V0O3BhY2suZGF0YSA9IF9kZWNvbnN0cnVjdFBhY2tldChwYWNrZXREYXRhKTtwYWNrLmF0dGFjaG1lbnRzID0gYnVmZmVycy5sZW5ndGg7IC8vIG51bWJlciBvZiBiaW5hcnkgJ2F0dGFjaG1lbnRzJ1xucmV0dXJuIHtwYWNrZXQ6cGFjayxidWZmZXJzOmJ1ZmZlcnN9O307IC8qKlxuICogUmVjb25zdHJ1Y3RzIGEgYmluYXJ5IHBhY2tldCBmcm9tIGl0cyBwbGFjZWhvbGRlciBwYWNrZXQgYW5kIGJ1ZmZlcnNcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0IC0gZXZlbnQgcGFja2V0IHdpdGggcGxhY2Vob2xkZXJzXG4gKiBAcGFyYW0ge0FycmF5fSBidWZmZXJzIC0gYmluYXJ5IGJ1ZmZlcnMgdG8gcHV0IGluIHBsYWNlaG9sZGVyIHBvc2l0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fSByZWNvbnN0cnVjdGVkIHBhY2tldFxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMucmVjb25zdHJ1Y3RQYWNrZXQgPSBmdW5jdGlvbihwYWNrZXQsYnVmZmVycyl7dmFyIGN1clBsYWNlSG9sZGVyPTA7ZnVuY3Rpb24gX3JlY29uc3RydWN0UGFja2V0KGRhdGEpe2lmKGRhdGEgJiYgZGF0YS5fcGxhY2Vob2xkZXIpe3ZhciBidWY9YnVmZmVyc1tkYXRhLm51bV07IC8vIGFwcHJvcHJpYXRlIGJ1ZmZlciAoc2hvdWxkIGJlIG5hdHVyYWwgb3JkZXIgYW55d2F5KVxucmV0dXJuIGJ1Zjt9ZWxzZSBpZihpc0FycmF5KGRhdGEpKXtmb3IodmFyIGk9MDtpIDwgZGF0YS5sZW5ndGg7aSsrKSB7ZGF0YVtpXSA9IF9yZWNvbnN0cnVjdFBhY2tldChkYXRhW2ldKTt9cmV0dXJuIGRhdGE7fWVsc2UgaWYoZGF0YSAmJiAnb2JqZWN0JyA9PSB0eXBlb2YgZGF0YSl7Zm9yKHZhciBrZXkgaW4gZGF0YSkge2RhdGFba2V5XSA9IF9yZWNvbnN0cnVjdFBhY2tldChkYXRhW2tleV0pO31yZXR1cm4gZGF0YTt9cmV0dXJuIGRhdGE7fXBhY2tldC5kYXRhID0gX3JlY29uc3RydWN0UGFja2V0KHBhY2tldC5kYXRhKTtwYWNrZXQuYXR0YWNobWVudHMgPSB1bmRlZmluZWQ7IC8vIG5vIGxvbmdlciB1c2VmdWxcbnJldHVybiBwYWNrZXQ7fTsgLyoqXG4gKiBBc3luY2hyb25vdXNseSByZW1vdmVzIEJsb2JzIG9yIEZpbGVzIGZyb20gZGF0YSB2aWFcbiAqIEZpbGVSZWFkZXIncyByZWFkQXNBcnJheUJ1ZmZlciBtZXRob2QuIFVzZWQgYmVmb3JlIGVuY29kaW5nXG4gKiBkYXRhIGFzIG1zZ3BhY2suIENhbGxzIGNhbGxiYWNrIHdpdGggdGhlIGJsb2JsZXNzIGRhdGEuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAYXBpIHByaXZhdGVcbiAqL2V4cG9ydHMucmVtb3ZlQmxvYnMgPSBmdW5jdGlvbihkYXRhLGNhbGxiYWNrKXtmdW5jdGlvbiBfcmVtb3ZlQmxvYnMob2JqLGN1cktleSxjb250YWluaW5nT2JqZWN0KXtpZighb2JqKXJldHVybiBvYmo7IC8vIGNvbnZlcnQgYW55IGJsb2JcbmlmKGdsb2JhbC5CbG9iICYmIG9iaiBpbnN0YW5jZW9mIEJsb2IgfHwgZ2xvYmFsLkZpbGUgJiYgb2JqIGluc3RhbmNlb2YgRmlsZSl7cGVuZGluZ0Jsb2JzKys7IC8vIGFzeW5jIGZpbGVyZWFkZXJcbnZhciBmaWxlUmVhZGVyPW5ldyBGaWxlUmVhZGVyKCk7ZmlsZVJlYWRlci5vbmxvYWQgPSBmdW5jdGlvbigpeyAvLyB0aGlzLnJlc3VsdCA9PSBhcnJheWJ1ZmZlclxuaWYoY29udGFpbmluZ09iamVjdCl7Y29udGFpbmluZ09iamVjdFtjdXJLZXldID0gdGhpcy5yZXN1bHQ7fWVsc2Uge2Jsb2JsZXNzRGF0YSA9IHRoaXMucmVzdWx0O30gLy8gaWYgbm90aGluZyBwZW5kaW5nIGl0cyBjYWxsYmFjayB0aW1lXG5pZighIC0tcGVuZGluZ0Jsb2JzKXtjYWxsYmFjayhibG9ibGVzc0RhdGEpO319O2ZpbGVSZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIob2JqKTsgLy8gYmxvYiAtPiBhcnJheWJ1ZmZlclxufWVsc2UgaWYoaXNBcnJheShvYmopKXsgLy8gaGFuZGxlIGFycmF5XG5mb3IodmFyIGk9MDtpIDwgb2JqLmxlbmd0aDtpKyspIHtfcmVtb3ZlQmxvYnMob2JqW2ldLGksb2JqKTt9fWVsc2UgaWYob2JqICYmICdvYmplY3QnID09IHR5cGVvZiBvYmogJiYgIWlzQnVmKG9iaikpeyAvLyBhbmQgb2JqZWN0XG5mb3IodmFyIGtleSBpbiBvYmopIHtfcmVtb3ZlQmxvYnMob2JqW2tleV0sa2V5LG9iaik7fX19dmFyIHBlbmRpbmdCbG9icz0wO3ZhciBibG9ibGVzc0RhdGE9ZGF0YTtfcmVtb3ZlQmxvYnMoYmxvYmxlc3NEYXRhKTtpZighcGVuZGluZ0Jsb2JzKXtjYWxsYmFjayhibG9ibGVzc0RhdGEpO319O30pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHtcIi4vaXMtYnVmZmVyXCI6NDgsXCJpc2FycmF5XCI6NDN9XSw0NzpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7IC8qKlxuICogTW9kdWxlIGRlcGVuZGVuY2llcy5cbiAqL3ZhciBkZWJ1Zz1fZGVyZXFfKCdkZWJ1ZycpKCdzb2NrZXQuaW8tcGFyc2VyJyk7dmFyIGpzb249X2RlcmVxXygnanNvbjMnKTt2YXIgaXNBcnJheT1fZGVyZXFfKCdpc2FycmF5Jyk7dmFyIEVtaXR0ZXI9X2RlcmVxXygnY29tcG9uZW50LWVtaXR0ZXInKTt2YXIgYmluYXJ5PV9kZXJlcV8oJy4vYmluYXJ5Jyk7dmFyIGlzQnVmPV9kZXJlcV8oJy4vaXMtYnVmZmVyJyk7IC8qKlxuICogUHJvdG9jb2wgdmVyc2lvbi5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5wcm90b2NvbCA9IDQ7IC8qKlxuICogUGFja2V0IHR5cGVzLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLnR5cGVzID0gWydDT05ORUNUJywnRElTQ09OTkVDVCcsJ0VWRU5UJywnQklOQVJZX0VWRU5UJywnQUNLJywnQklOQVJZX0FDSycsJ0VSUk9SJ107IC8qKlxuICogUGFja2V0IHR5cGUgYGNvbm5lY3RgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkNPTk5FQ1QgPSAwOyAvKipcbiAqIFBhY2tldCB0eXBlIGBkaXNjb25uZWN0YC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5ESVNDT05ORUNUID0gMTsgLyoqXG4gKiBQYWNrZXQgdHlwZSBgZXZlbnRgLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkVWRU5UID0gMjsgLyoqXG4gKiBQYWNrZXQgdHlwZSBgYWNrYC5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5BQ0sgPSAzOyAvKipcbiAqIFBhY2tldCB0eXBlIGBlcnJvcmAuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuRVJST1IgPSA0OyAvKipcbiAqIFBhY2tldCB0eXBlICdiaW5hcnkgZXZlbnQnXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuQklOQVJZX0VWRU5UID0gNTsgLyoqXG4gKiBQYWNrZXQgdHlwZSBgYmluYXJ5IGFja2AuIEZvciBhY2tzIHdpdGggYmluYXJ5IGFyZ3VtZW50cy5cbiAqXG4gKiBAYXBpIHB1YmxpY1xuICovZXhwb3J0cy5CSU5BUllfQUNLID0gNjsgLyoqXG4gKiBFbmNvZGVyIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9leHBvcnRzLkVuY29kZXIgPSBFbmNvZGVyOyAvKipcbiAqIERlY29kZXIgY29uc3RydWN0b3IuXG4gKlxuICogQGFwaSBwdWJsaWNcbiAqL2V4cG9ydHMuRGVjb2RlciA9IERlY29kZXI7IC8qKlxuICogQSBzb2NrZXQuaW8gRW5jb2RlciBpbnN0YW5jZVxuICpcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBFbmNvZGVyKCl7fSAvKipcbiAqIEVuY29kZSBhIHBhY2tldCBhcyBhIHNpbmdsZSBzdHJpbmcgaWYgbm9uLWJpbmFyeSwgb3IgYXMgYVxuICogYnVmZmVyIHNlcXVlbmNlLCBkZXBlbmRpbmcgb24gcGFja2V0IHR5cGUuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9iaiAtIHBhY2tldCBvYmplY3RcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIC0gZnVuY3Rpb24gdG8gaGFuZGxlIGVuY29kaW5ncyAobGlrZWx5IGVuZ2luZS53cml0ZSlcbiAqIEByZXR1cm4gQ2FsbHMgY2FsbGJhY2sgd2l0aCBBcnJheSBvZiBlbmNvZGluZ3NcbiAqIEBhcGkgcHVibGljXG4gKi9FbmNvZGVyLnByb3RvdHlwZS5lbmNvZGUgPSBmdW5jdGlvbihvYmosY2FsbGJhY2spe2RlYnVnKCdlbmNvZGluZyBwYWNrZXQgJWonLG9iaik7aWYoZXhwb3J0cy5CSU5BUllfRVZFTlQgPT0gb2JqLnR5cGUgfHwgZXhwb3J0cy5CSU5BUllfQUNLID09IG9iai50eXBlKXtlbmNvZGVBc0JpbmFyeShvYmosY2FsbGJhY2spO31lbHNlIHt2YXIgZW5jb2Rpbmc9ZW5jb2RlQXNTdHJpbmcob2JqKTtjYWxsYmFjayhbZW5jb2RpbmddKTt9fTsgLyoqXG4gKiBFbmNvZGUgcGFja2V0IGFzIHN0cmluZy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGFja2V0XG4gKiBAcmV0dXJuIHtTdHJpbmd9IGVuY29kZWRcbiAqIEBhcGkgcHJpdmF0ZVxuICovZnVuY3Rpb24gZW5jb2RlQXNTdHJpbmcob2JqKXt2YXIgc3RyPScnO3ZhciBuc3A9ZmFsc2U7IC8vIGZpcnN0IGlzIHR5cGVcbnN0ciArPSBvYmoudHlwZTsgLy8gYXR0YWNobWVudHMgaWYgd2UgaGF2ZSB0aGVtXG5pZihleHBvcnRzLkJJTkFSWV9FVkVOVCA9PSBvYmoudHlwZSB8fCBleHBvcnRzLkJJTkFSWV9BQ0sgPT0gb2JqLnR5cGUpe3N0ciArPSBvYmouYXR0YWNobWVudHM7c3RyICs9ICctJzt9IC8vIGlmIHdlIGhhdmUgYSBuYW1lc3BhY2Ugb3RoZXIgdGhhbiBgL2Bcbi8vIHdlIGFwcGVuZCBpdCBmb2xsb3dlZCBieSBhIGNvbW1hIGAsYFxuaWYob2JqLm5zcCAmJiAnLycgIT0gb2JqLm5zcCl7bnNwID0gdHJ1ZTtzdHIgKz0gb2JqLm5zcDt9IC8vIGltbWVkaWF0ZWx5IGZvbGxvd2VkIGJ5IHRoZSBpZFxuaWYobnVsbCAhPSBvYmouaWQpe2lmKG5zcCl7c3RyICs9ICcsJztuc3AgPSBmYWxzZTt9c3RyICs9IG9iai5pZDt9IC8vIGpzb24gZGF0YVxuaWYobnVsbCAhPSBvYmouZGF0YSl7aWYobnNwKXN0ciArPSAnLCc7c3RyICs9IGpzb24uc3RyaW5naWZ5KG9iai5kYXRhKTt9ZGVidWcoJ2VuY29kZWQgJWogYXMgJXMnLG9iaixzdHIpO3JldHVybiBzdHI7fSAvKipcbiAqIEVuY29kZSBwYWNrZXQgYXMgJ2J1ZmZlciBzZXF1ZW5jZScgYnkgcmVtb3ZpbmcgYmxvYnMsIGFuZFxuICogZGVjb25zdHJ1Y3RpbmcgcGFja2V0IGludG8gb2JqZWN0IHdpdGggcGxhY2Vob2xkZXJzIGFuZFxuICogYSBsaXN0IG9mIGJ1ZmZlcnMuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQHJldHVybiB7QnVmZmVyfSBlbmNvZGVkXG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGVuY29kZUFzQmluYXJ5KG9iaixjYWxsYmFjayl7ZnVuY3Rpb24gd3JpdGVFbmNvZGluZyhibG9ibGVzc0RhdGEpe3ZhciBkZWNvbnN0cnVjdGlvbj1iaW5hcnkuZGVjb25zdHJ1Y3RQYWNrZXQoYmxvYmxlc3NEYXRhKTt2YXIgcGFjaz1lbmNvZGVBc1N0cmluZyhkZWNvbnN0cnVjdGlvbi5wYWNrZXQpO3ZhciBidWZmZXJzPWRlY29uc3RydWN0aW9uLmJ1ZmZlcnM7YnVmZmVycy51bnNoaWZ0KHBhY2spOyAvLyBhZGQgcGFja2V0IGluZm8gdG8gYmVnaW5uaW5nIG9mIGRhdGEgbGlzdFxuY2FsbGJhY2soYnVmZmVycyk7IC8vIHdyaXRlIGFsbCB0aGUgYnVmZmVyc1xufWJpbmFyeS5yZW1vdmVCbG9icyhvYmosd3JpdGVFbmNvZGluZyk7fSAvKipcbiAqIEEgc29ja2V0LmlvIERlY29kZXIgaW5zdGFuY2VcbiAqXG4gKiBAcmV0dXJuIHtPYmplY3R9IGRlY29kZXJcbiAqIEBhcGkgcHVibGljXG4gKi9mdW5jdGlvbiBEZWNvZGVyKCl7dGhpcy5yZWNvbnN0cnVjdG9yID0gbnVsbDt9IC8qKlxuICogTWl4IGluIGBFbWl0dGVyYCB3aXRoIERlY29kZXIuXG4gKi9FbWl0dGVyKERlY29kZXIucHJvdG90eXBlKTsgLyoqXG4gKiBEZWNvZGVzIGFuIGVjb2RlZCBwYWNrZXQgc3RyaW5nIGludG8gcGFja2V0IEpTT04uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IG9iaiAtIGVuY29kZWQgcGFja2V0XG4gKiBAcmV0dXJuIHtPYmplY3R9IHBhY2tldFxuICogQGFwaSBwdWJsaWNcbiAqL0RlY29kZXIucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKG9iail7dmFyIHBhY2tldDtpZignc3RyaW5nJyA9PSB0eXBlb2Ygb2JqKXtwYWNrZXQgPSBkZWNvZGVTdHJpbmcob2JqKTtpZihleHBvcnRzLkJJTkFSWV9FVkVOVCA9PSBwYWNrZXQudHlwZSB8fCBleHBvcnRzLkJJTkFSWV9BQ0sgPT0gcGFja2V0LnR5cGUpeyAvLyBiaW5hcnkgcGFja2V0J3MganNvblxudGhpcy5yZWNvbnN0cnVjdG9yID0gbmV3IEJpbmFyeVJlY29uc3RydWN0b3IocGFja2V0KTsgLy8gbm8gYXR0YWNobWVudHMsIGxhYmVsZWQgYmluYXJ5IGJ1dCBubyBiaW5hcnkgZGF0YSB0byBmb2xsb3dcbmlmKHRoaXMucmVjb25zdHJ1Y3Rvci5yZWNvblBhY2suYXR0YWNobWVudHMgPT09IDApe3RoaXMuZW1pdCgnZGVjb2RlZCcscGFja2V0KTt9fWVsc2UgeyAvLyBub24tYmluYXJ5IGZ1bGwgcGFja2V0XG50aGlzLmVtaXQoJ2RlY29kZWQnLHBhY2tldCk7fX1lbHNlIGlmKGlzQnVmKG9iaikgfHwgb2JqLmJhc2U2NCl7IC8vIHJhdyBiaW5hcnkgZGF0YVxuaWYoIXRoaXMucmVjb25zdHJ1Y3Rvcil7dGhyb3cgbmV3IEVycm9yKCdnb3QgYmluYXJ5IGRhdGEgd2hlbiBub3QgcmVjb25zdHJ1Y3RpbmcgYSBwYWNrZXQnKTt9ZWxzZSB7cGFja2V0ID0gdGhpcy5yZWNvbnN0cnVjdG9yLnRha2VCaW5hcnlEYXRhKG9iaik7aWYocGFja2V0KXsgLy8gcmVjZWl2ZWQgZmluYWwgYnVmZmVyXG50aGlzLnJlY29uc3RydWN0b3IgPSBudWxsO3RoaXMuZW1pdCgnZGVjb2RlZCcscGFja2V0KTt9fX1lbHNlIHt0aHJvdyBuZXcgRXJyb3IoJ1Vua25vd24gdHlwZTogJyArIG9iaik7fX07IC8qKlxuICogRGVjb2RlIGEgcGFja2V0IFN0cmluZyAoSlNPTiBkYXRhKVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge09iamVjdH0gcGFja2V0XG4gKiBAYXBpIHByaXZhdGVcbiAqL2Z1bmN0aW9uIGRlY29kZVN0cmluZyhzdHIpe3ZhciBwPXt9O3ZhciBpPTA7IC8vIGxvb2sgdXAgdHlwZVxucC50eXBlID0gTnVtYmVyKHN0ci5jaGFyQXQoMCkpO2lmKG51bGwgPT0gZXhwb3J0cy50eXBlc1twLnR5cGVdKXJldHVybiBlcnJvcigpOyAvLyBsb29rIHVwIGF0dGFjaG1lbnRzIGlmIHR5cGUgYmluYXJ5XG5pZihleHBvcnRzLkJJTkFSWV9FVkVOVCA9PSBwLnR5cGUgfHwgZXhwb3J0cy5CSU5BUllfQUNLID09IHAudHlwZSl7dmFyIGJ1Zj0nJzt3aGlsZShzdHIuY2hhckF0KCsraSkgIT0gJy0nKSB7YnVmICs9IHN0ci5jaGFyQXQoaSk7aWYoaSA9PSBzdHIubGVuZ3RoKWJyZWFrO31pZihidWYgIT0gTnVtYmVyKGJ1ZikgfHwgc3RyLmNoYXJBdChpKSAhPSAnLScpe3Rocm93IG5ldyBFcnJvcignSWxsZWdhbCBhdHRhY2htZW50cycpO31wLmF0dGFjaG1lbnRzID0gTnVtYmVyKGJ1Zik7fSAvLyBsb29rIHVwIG5hbWVzcGFjZSAoaWYgYW55KVxuaWYoJy8nID09IHN0ci5jaGFyQXQoaSArIDEpKXtwLm5zcCA9ICcnO3doaWxlKCsraSkge3ZhciBjPXN0ci5jaGFyQXQoaSk7aWYoJywnID09IGMpYnJlYWs7cC5uc3AgKz0gYztpZihpID09IHN0ci5sZW5ndGgpYnJlYWs7fX1lbHNlIHtwLm5zcCA9ICcvJzt9IC8vIGxvb2sgdXAgaWRcbnZhciBuZXh0PXN0ci5jaGFyQXQoaSArIDEpO2lmKCcnICE9PSBuZXh0ICYmIE51bWJlcihuZXh0KSA9PSBuZXh0KXtwLmlkID0gJyc7d2hpbGUoKytpKSB7dmFyIGM9c3RyLmNoYXJBdChpKTtpZihudWxsID09IGMgfHwgTnVtYmVyKGMpICE9IGMpey0taTticmVhazt9cC5pZCArPSBzdHIuY2hhckF0KGkpO2lmKGkgPT0gc3RyLmxlbmd0aClicmVhazt9cC5pZCA9IE51bWJlcihwLmlkKTt9IC8vIGxvb2sgdXAganNvbiBkYXRhXG5pZihzdHIuY2hhckF0KCsraSkpe3RyeXtwLmRhdGEgPSBqc29uLnBhcnNlKHN0ci5zdWJzdHIoaSkpO31jYXRjaChlKSB7cmV0dXJuIGVycm9yKCk7fX1kZWJ1ZygnZGVjb2RlZCAlcyBhcyAlaicsc3RyLHApO3JldHVybiBwO30gLyoqXG4gKiBEZWFsbG9jYXRlcyBhIHBhcnNlcidzIHJlc291cmNlc1xuICpcbiAqIEBhcGkgcHVibGljXG4gKi9EZWNvZGVyLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24oKXtpZih0aGlzLnJlY29uc3RydWN0b3Ipe3RoaXMucmVjb25zdHJ1Y3Rvci5maW5pc2hlZFJlY29uc3RydWN0aW9uKCk7fX07IC8qKlxuICogQSBtYW5hZ2VyIG9mIGEgYmluYXJ5IGV2ZW50J3MgJ2J1ZmZlciBzZXF1ZW5jZScuIFNob3VsZFxuICogYmUgY29uc3RydWN0ZWQgd2hlbmV2ZXIgYSBwYWNrZXQgb2YgdHlwZSBCSU5BUllfRVZFTlQgaXNcbiAqIGRlY29kZWQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhY2tldFxuICogQHJldHVybiB7QmluYXJ5UmVjb25zdHJ1Y3Rvcn0gaW5pdGlhbGl6ZWQgcmVjb25zdHJ1Y3RvclxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBCaW5hcnlSZWNvbnN0cnVjdG9yKHBhY2tldCl7dGhpcy5yZWNvblBhY2sgPSBwYWNrZXQ7dGhpcy5idWZmZXJzID0gW107fSAvKipcbiAqIE1ldGhvZCB0byBiZSBjYWxsZWQgd2hlbiBiaW5hcnkgZGF0YSByZWNlaXZlZCBmcm9tIGNvbm5lY3Rpb25cbiAqIGFmdGVyIGEgQklOQVJZX0VWRU5UIHBhY2tldC5cbiAqXG4gKiBAcGFyYW0ge0J1ZmZlciB8IEFycmF5QnVmZmVyfSBiaW5EYXRhIC0gdGhlIHJhdyBiaW5hcnkgZGF0YSByZWNlaXZlZFxuICogQHJldHVybiB7bnVsbCB8IE9iamVjdH0gcmV0dXJucyBudWxsIGlmIG1vcmUgYmluYXJ5IGRhdGEgaXMgZXhwZWN0ZWQgb3JcbiAqICAgYSByZWNvbnN0cnVjdGVkIHBhY2tldCBvYmplY3QgaWYgYWxsIGJ1ZmZlcnMgaGF2ZSBiZWVuIHJlY2VpdmVkLlxuICogQGFwaSBwcml2YXRlXG4gKi9CaW5hcnlSZWNvbnN0cnVjdG9yLnByb3RvdHlwZS50YWtlQmluYXJ5RGF0YSA9IGZ1bmN0aW9uKGJpbkRhdGEpe3RoaXMuYnVmZmVycy5wdXNoKGJpbkRhdGEpO2lmKHRoaXMuYnVmZmVycy5sZW5ndGggPT0gdGhpcy5yZWNvblBhY2suYXR0YWNobWVudHMpeyAvLyBkb25lIHdpdGggYnVmZmVyIGxpc3RcbnZhciBwYWNrZXQ9YmluYXJ5LnJlY29uc3RydWN0UGFja2V0KHRoaXMucmVjb25QYWNrLHRoaXMuYnVmZmVycyk7dGhpcy5maW5pc2hlZFJlY29uc3RydWN0aW9uKCk7cmV0dXJuIHBhY2tldDt9cmV0dXJuIG51bGw7fTsgLyoqXG4gKiBDbGVhbnMgdXAgYmluYXJ5IHBhY2tldCByZWNvbnN0cnVjdGlvbiB2YXJpYWJsZXMuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9CaW5hcnlSZWNvbnN0cnVjdG9yLnByb3RvdHlwZS5maW5pc2hlZFJlY29uc3RydWN0aW9uID0gZnVuY3Rpb24oKXt0aGlzLnJlY29uUGFjayA9IG51bGw7dGhpcy5idWZmZXJzID0gW107fTtmdW5jdGlvbiBlcnJvcihkYXRhKXtyZXR1cm4ge3R5cGU6ZXhwb3J0cy5FUlJPUixkYXRhOidwYXJzZXIgZXJyb3InfTt9fSx7XCIuL2JpbmFyeVwiOjQ2LFwiLi9pcy1idWZmZXJcIjo0OCxcImNvbXBvbmVudC1lbWl0dGVyXCI6NDksXCJkZWJ1Z1wiOjM5LFwiaXNhcnJheVwiOjQzLFwianNvbjNcIjo1MH1dLDQ4OltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXttb2R1bGUuZXhwb3J0cyA9IGlzQnVmOyAvKipcbiAqIFJldHVybnMgdHJ1ZSBpZiBvYmogaXMgYSBidWZmZXIgb3IgYW4gYXJyYXlidWZmZXIuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9mdW5jdGlvbiBpc0J1ZihvYmope3JldHVybiBnbG9iYWwuQnVmZmVyICYmIGdsb2JhbC5CdWZmZXIuaXNCdWZmZXIob2JqKSB8fCBnbG9iYWwuQXJyYXlCdWZmZXIgJiYgb2JqIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI7fX0pLmNhbGwodGhpcyx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIj9zZWxmOnR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCI/d2luZG93OnR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCI/Z2xvYmFsOnt9KTt9LHt9XSw0OTpbZnVuY3Rpb24oX2RlcmVxXyxtb2R1bGUsZXhwb3J0cyl7YXJndW1lbnRzWzRdWzE1XVswXS5hcHBseShleHBvcnRzLGFyZ3VtZW50cyk7fSx7XCJkdXBcIjoxNX1dLDUwOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXsoZnVuY3Rpb24oZ2xvYmFsKXsgLyohIEpTT04gdjMuMy4yIHwgaHR0cDovL2Jlc3RpZWpzLmdpdGh1Yi5pby9qc29uMyB8IENvcHlyaWdodCAyMDEyLTIwMTQsIEtpdCBDYW1icmlkZ2UgfCBodHRwOi8va2l0Lm1pdC1saWNlbnNlLm9yZyAqLzsoZnVuY3Rpb24oKXsgLy8gRGV0ZWN0IHRoZSBgZGVmaW5lYCBmdW5jdGlvbiBleHBvc2VkIGJ5IGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy4gVGhlXG4vLyBzdHJpY3QgYGRlZmluZWAgY2hlY2sgaXMgbmVjZXNzYXJ5IGZvciBjb21wYXRpYmlsaXR5IHdpdGggYHIuanNgLlxudmFyIGlzTG9hZGVyPXR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kOyAvLyBBIHNldCBvZiB0eXBlcyB1c2VkIHRvIGRpc3Rpbmd1aXNoIG9iamVjdHMgZnJvbSBwcmltaXRpdmVzLlxudmFyIG9iamVjdFR5cGVzPXtcImZ1bmN0aW9uXCI6dHJ1ZSxcIm9iamVjdFwiOnRydWV9OyAvLyBEZXRlY3QgdGhlIGBleHBvcnRzYCBvYmplY3QgZXhwb3NlZCBieSBDb21tb25KUyBpbXBsZW1lbnRhdGlvbnMuXG52YXIgZnJlZUV4cG9ydHM9b2JqZWN0VHlwZXNbdHlwZW9mIGV4cG9ydHNdICYmIGV4cG9ydHMgJiYgIWV4cG9ydHMubm9kZVR5cGUgJiYgZXhwb3J0czsgLy8gVXNlIHRoZSBgZ2xvYmFsYCBvYmplY3QgZXhwb3NlZCBieSBOb2RlIChpbmNsdWRpbmcgQnJvd3NlcmlmeSB2aWFcbi8vIGBpbnNlcnQtbW9kdWxlLWdsb2JhbHNgKSwgTmFyd2hhbCwgYW5kIFJpbmdvIGFzIHRoZSBkZWZhdWx0IGNvbnRleHQsXG4vLyBhbmQgdGhlIGB3aW5kb3dgIG9iamVjdCBpbiBicm93c2Vycy4gUmhpbm8gZXhwb3J0cyBhIGBnbG9iYWxgIGZ1bmN0aW9uXG4vLyBpbnN0ZWFkLlxudmFyIHJvb3Q9b2JqZWN0VHlwZXNbdHlwZW9mIHdpbmRvd10gJiYgd2luZG93IHx8IHRoaXMsZnJlZUdsb2JhbD1mcmVlRXhwb3J0cyAmJiBvYmplY3RUeXBlc1t0eXBlb2YgbW9kdWxlXSAmJiBtb2R1bGUgJiYgIW1vZHVsZS5ub2RlVHlwZSAmJiB0eXBlb2YgZ2xvYmFsID09IFwib2JqZWN0XCIgJiYgZ2xvYmFsO2lmKGZyZWVHbG9iYWwgJiYgKGZyZWVHbG9iYWxbXCJnbG9iYWxcIl0gPT09IGZyZWVHbG9iYWwgfHwgZnJlZUdsb2JhbFtcIndpbmRvd1wiXSA9PT0gZnJlZUdsb2JhbCB8fCBmcmVlR2xvYmFsW1wic2VsZlwiXSA9PT0gZnJlZUdsb2JhbCkpe3Jvb3QgPSBmcmVlR2xvYmFsO30gLy8gUHVibGljOiBJbml0aWFsaXplcyBKU09OIDMgdXNpbmcgdGhlIGdpdmVuIGBjb250ZXh0YCBvYmplY3QsIGF0dGFjaGluZyB0aGVcbi8vIGBzdHJpbmdpZnlgIGFuZCBgcGFyc2VgIGZ1bmN0aW9ucyB0byB0aGUgc3BlY2lmaWVkIGBleHBvcnRzYCBvYmplY3QuXG5mdW5jdGlvbiBydW5JbkNvbnRleHQoY29udGV4dCxleHBvcnRzKXtjb250ZXh0IHx8IChjb250ZXh0ID0gcm9vdFtcIk9iamVjdFwiXSgpKTtleHBvcnRzIHx8IChleHBvcnRzID0gcm9vdFtcIk9iamVjdFwiXSgpKTsgLy8gTmF0aXZlIGNvbnN0cnVjdG9yIGFsaWFzZXMuXG52YXIgTnVtYmVyPWNvbnRleHRbXCJOdW1iZXJcIl0gfHwgcm9vdFtcIk51bWJlclwiXSxTdHJpbmc9Y29udGV4dFtcIlN0cmluZ1wiXSB8fCByb290W1wiU3RyaW5nXCJdLE9iamVjdD1jb250ZXh0W1wiT2JqZWN0XCJdIHx8IHJvb3RbXCJPYmplY3RcIl0sRGF0ZT1jb250ZXh0W1wiRGF0ZVwiXSB8fCByb290W1wiRGF0ZVwiXSxTeW50YXhFcnJvcj1jb250ZXh0W1wiU3ludGF4RXJyb3JcIl0gfHwgcm9vdFtcIlN5bnRheEVycm9yXCJdLFR5cGVFcnJvcj1jb250ZXh0W1wiVHlwZUVycm9yXCJdIHx8IHJvb3RbXCJUeXBlRXJyb3JcIl0sTWF0aD1jb250ZXh0W1wiTWF0aFwiXSB8fCByb290W1wiTWF0aFwiXSxuYXRpdmVKU09OPWNvbnRleHRbXCJKU09OXCJdIHx8IHJvb3RbXCJKU09OXCJdOyAvLyBEZWxlZ2F0ZSB0byB0aGUgbmF0aXZlIGBzdHJpbmdpZnlgIGFuZCBgcGFyc2VgIGltcGxlbWVudGF0aW9ucy5cbmlmKHR5cGVvZiBuYXRpdmVKU09OID09IFwib2JqZWN0XCIgJiYgbmF0aXZlSlNPTil7ZXhwb3J0cy5zdHJpbmdpZnkgPSBuYXRpdmVKU09OLnN0cmluZ2lmeTtleHBvcnRzLnBhcnNlID0gbmF0aXZlSlNPTi5wYXJzZTt9IC8vIENvbnZlbmllbmNlIGFsaWFzZXMuXG52YXIgb2JqZWN0UHJvdG89T2JqZWN0LnByb3RvdHlwZSxnZXRDbGFzcz1vYmplY3RQcm90by50b1N0cmluZyxpc1Byb3BlcnR5LGZvckVhY2gsdW5kZWY7IC8vIFRlc3QgdGhlIGBEYXRlI2dldFVUQypgIG1ldGhvZHMuIEJhc2VkIG9uIHdvcmsgYnkgQFlhZmZsZS5cbnZhciBpc0V4dGVuZGVkPW5ldyBEYXRlKC0zNTA5ODI3MzM0NTczMjkyKTt0cnl7IC8vIFRoZSBgZ2V0VVRDRnVsbFllYXJgLCBgTW9udGhgLCBhbmQgYERhdGVgIG1ldGhvZHMgcmV0dXJuIG5vbnNlbnNpY2FsXG4vLyByZXN1bHRzIGZvciBjZXJ0YWluIGRhdGVzIGluIE9wZXJhID49IDEwLjUzLlxuaXNFeHRlbmRlZCA9IGlzRXh0ZW5kZWQuZ2V0VVRDRnVsbFllYXIoKSA9PSAtMTA5MjUyICYmIGlzRXh0ZW5kZWQuZ2V0VVRDTW9udGgoKSA9PT0gMCAmJiBpc0V4dGVuZGVkLmdldFVUQ0RhdGUoKSA9PT0gMSAmJiAgLy8gU2FmYXJpIDwgMi4wLjIgc3RvcmVzIHRoZSBpbnRlcm5hbCBtaWxsaXNlY29uZCB0aW1lIHZhbHVlIGNvcnJlY3RseSxcbi8vIGJ1dCBjbGlwcyB0aGUgdmFsdWVzIHJldHVybmVkIGJ5IHRoZSBkYXRlIG1ldGhvZHMgdG8gdGhlIHJhbmdlIG9mXG4vLyBzaWduZWQgMzItYml0IGludGVnZXJzIChbLTIgKiogMzEsIDIgKiogMzEgLSAxXSkuXG5pc0V4dGVuZGVkLmdldFVUQ0hvdXJzKCkgPT0gMTAgJiYgaXNFeHRlbmRlZC5nZXRVVENNaW51dGVzKCkgPT0gMzcgJiYgaXNFeHRlbmRlZC5nZXRVVENTZWNvbmRzKCkgPT0gNiAmJiBpc0V4dGVuZGVkLmdldFVUQ01pbGxpc2Vjb25kcygpID09IDcwODt9Y2F0Y2goZXhjZXB0aW9uKSB7fSAvLyBJbnRlcm5hbDogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBuYXRpdmUgYEpTT04uc3RyaW5naWZ5YCBhbmQgYHBhcnNlYFxuLy8gaW1wbGVtZW50YXRpb25zIGFyZSBzcGVjLWNvbXBsaWFudC4gQmFzZWQgb24gd29yayBieSBLZW4gU255ZGVyLlxuZnVuY3Rpb24gaGFzKG5hbWUpe2lmKGhhc1tuYW1lXSAhPT0gdW5kZWYpeyAvLyBSZXR1cm4gY2FjaGVkIGZlYXR1cmUgdGVzdCByZXN1bHQuXG5yZXR1cm4gaGFzW25hbWVdO312YXIgaXNTdXBwb3J0ZWQ7aWYobmFtZSA9PSBcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKXsgLy8gSUUgPD0gNyBkb2Vzbid0IHN1cHBvcnQgYWNjZXNzaW5nIHN0cmluZyBjaGFyYWN0ZXJzIHVzaW5nIHNxdWFyZVxuLy8gYnJhY2tldCBub3RhdGlvbi4gSUUgOCBvbmx5IHN1cHBvcnRzIHRoaXMgZm9yIHByaW1pdGl2ZXMuXG5pc1N1cHBvcnRlZCA9IFwiYVwiWzBdICE9IFwiYVwiO31lbHNlIGlmKG5hbWUgPT0gXCJqc29uXCIpeyAvLyBJbmRpY2F0ZXMgd2hldGhlciBib3RoIGBKU09OLnN0cmluZ2lmeWAgYW5kIGBKU09OLnBhcnNlYCBhcmVcbi8vIHN1cHBvcnRlZC5cbmlzU3VwcG9ydGVkID0gaGFzKFwianNvbi1zdHJpbmdpZnlcIikgJiYgaGFzKFwianNvbi1wYXJzZVwiKTt9ZWxzZSB7dmFyIHZhbHVlLHNlcmlhbGl6ZWQ9XCJ7XFxcImFcXFwiOlsxLHRydWUsZmFsc2UsbnVsbCxcXFwiXFxcXHUwMDAwXFxcXGJcXFxcblxcXFxmXFxcXHJcXFxcdFxcXCJdfVwiOyAvLyBUZXN0IGBKU09OLnN0cmluZ2lmeWAuXG5pZihuYW1lID09IFwianNvbi1zdHJpbmdpZnlcIil7dmFyIHN0cmluZ2lmeT1leHBvcnRzLnN0cmluZ2lmeSxzdHJpbmdpZnlTdXBwb3J0ZWQ9dHlwZW9mIHN0cmluZ2lmeSA9PSBcImZ1bmN0aW9uXCIgJiYgaXNFeHRlbmRlZDtpZihzdHJpbmdpZnlTdXBwb3J0ZWQpeyAvLyBBIHRlc3QgZnVuY3Rpb24gb2JqZWN0IHdpdGggYSBjdXN0b20gYHRvSlNPTmAgbWV0aG9kLlxuKHZhbHVlID0gZnVuY3Rpb24oKXtyZXR1cm4gMTt9KS50b0pTT04gPSB2YWx1ZTt0cnl7c3RyaW5naWZ5U3VwcG9ydGVkID0gIC8vIEZpcmVmb3ggMy4xYjEgYW5kIGIyIHNlcmlhbGl6ZSBzdHJpbmcsIG51bWJlciwgYW5kIGJvb2xlYW5cbi8vIHByaW1pdGl2ZXMgYXMgb2JqZWN0IGxpdGVyYWxzLlxuc3RyaW5naWZ5KDApID09PSBcIjBcIiAmJiAgLy8gRkYgMy4xYjEsIGIyLCBhbmQgSlNPTiAyIHNlcmlhbGl6ZSB3cmFwcGVkIHByaW1pdGl2ZXMgYXMgb2JqZWN0XG4vLyBsaXRlcmFscy5cbnN0cmluZ2lmeShuZXcgTnVtYmVyKCkpID09PSBcIjBcIiAmJiBzdHJpbmdpZnkobmV3IFN0cmluZygpKSA9PSAnXCJcIicgJiYgIC8vIEZGIDMuMWIxLCAyIHRocm93IGFuIGVycm9yIGlmIHRoZSB2YWx1ZSBpcyBgbnVsbGAsIGB1bmRlZmluZWRgLCBvclxuLy8gZG9lcyBub3QgZGVmaW5lIGEgY2Fub25pY2FsIEpTT04gcmVwcmVzZW50YXRpb24gKHRoaXMgYXBwbGllcyB0b1xuLy8gb2JqZWN0cyB3aXRoIGB0b0pTT05gIHByb3BlcnRpZXMgYXMgd2VsbCwgKnVubGVzcyogdGhleSBhcmUgbmVzdGVkXG4vLyB3aXRoaW4gYW4gb2JqZWN0IG9yIGFycmF5KS5cbnN0cmluZ2lmeShnZXRDbGFzcykgPT09IHVuZGVmICYmICAvLyBJRSA4IHNlcmlhbGl6ZXMgYHVuZGVmaW5lZGAgYXMgYFwidW5kZWZpbmVkXCJgLiBTYWZhcmkgPD0gNS4xLjcgYW5kXG4vLyBGRiAzLjFiMyBwYXNzIHRoaXMgdGVzdC5cbnN0cmluZ2lmeSh1bmRlZikgPT09IHVuZGVmICYmICAvLyBTYWZhcmkgPD0gNS4xLjcgYW5kIEZGIDMuMWIzIHRocm93IGBFcnJvcmBzIGFuZCBgVHlwZUVycm9yYHMsXG4vLyByZXNwZWN0aXZlbHksIGlmIHRoZSB2YWx1ZSBpcyBvbWl0dGVkIGVudGlyZWx5Llxuc3RyaW5naWZ5KCkgPT09IHVuZGVmICYmICAvLyBGRiAzLjFiMSwgMiB0aHJvdyBhbiBlcnJvciBpZiB0aGUgZ2l2ZW4gdmFsdWUgaXMgbm90IGEgbnVtYmVyLFxuLy8gc3RyaW5nLCBhcnJheSwgb2JqZWN0LCBCb29sZWFuLCBvciBgbnVsbGAgbGl0ZXJhbC4gVGhpcyBhcHBsaWVzIHRvXG4vLyBvYmplY3RzIHdpdGggY3VzdG9tIGB0b0pTT05gIG1ldGhvZHMgYXMgd2VsbCwgdW5sZXNzIHRoZXkgYXJlIG5lc3RlZFxuLy8gaW5zaWRlIG9iamVjdCBvciBhcnJheSBsaXRlcmFscy4gWVVJIDMuMC4wYjEgaWdub3JlcyBjdXN0b20gYHRvSlNPTmBcbi8vIG1ldGhvZHMgZW50aXJlbHkuXG5zdHJpbmdpZnkodmFsdWUpID09PSBcIjFcIiAmJiBzdHJpbmdpZnkoW3ZhbHVlXSkgPT0gXCJbMV1cIiAmJiAgLy8gUHJvdG90eXBlIDw9IDEuNi4xIHNlcmlhbGl6ZXMgYFt1bmRlZmluZWRdYCBhcyBgXCJbXVwiYCBpbnN0ZWFkIG9mXG4vLyBgXCJbbnVsbF1cImAuXG5zdHJpbmdpZnkoW3VuZGVmXSkgPT0gXCJbbnVsbF1cIiAmJiAgLy8gWVVJIDMuMC4wYjEgZmFpbHMgdG8gc2VyaWFsaXplIGBudWxsYCBsaXRlcmFscy5cbnN0cmluZ2lmeShudWxsKSA9PSBcIm51bGxcIiAmJiAgLy8gRkYgMy4xYjEsIDIgaGFsdHMgc2VyaWFsaXphdGlvbiBpZiBhbiBhcnJheSBjb250YWlucyBhIGZ1bmN0aW9uOlxuLy8gYFsxLCB0cnVlLCBnZXRDbGFzcywgMV1gIHNlcmlhbGl6ZXMgYXMgXCJbMSx0cnVlLF0sXCIuIEZGIDMuMWIzXG4vLyBlbGlkZXMgbm9uLUpTT04gdmFsdWVzIGZyb20gb2JqZWN0cyBhbmQgYXJyYXlzLCB1bmxlc3MgdGhleVxuLy8gZGVmaW5lIGN1c3RvbSBgdG9KU09OYCBtZXRob2RzLlxuc3RyaW5naWZ5KFt1bmRlZixnZXRDbGFzcyxudWxsXSkgPT0gXCJbbnVsbCxudWxsLG51bGxdXCIgJiYgIC8vIFNpbXBsZSBzZXJpYWxpemF0aW9uIHRlc3QuIEZGIDMuMWIxIHVzZXMgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2VzXG4vLyB3aGVyZSBjaGFyYWN0ZXIgZXNjYXBlIGNvZGVzIGFyZSBleHBlY3RlZCAoZS5nLiwgYFxcYmAgPT4gYFxcdTAwMDhgKS5cbnN0cmluZ2lmeSh7XCJhXCI6W3ZhbHVlLHRydWUsZmFsc2UsbnVsbCxcIlxceDAwXFxiXFxuXFxmXFxyXFx0XCJdfSkgPT0gc2VyaWFsaXplZCAmJiAgLy8gRkYgMy4xYjEgYW5kIGIyIGlnbm9yZSB0aGUgYGZpbHRlcmAgYW5kIGB3aWR0aGAgYXJndW1lbnRzLlxuc3RyaW5naWZ5KG51bGwsdmFsdWUpID09PSBcIjFcIiAmJiBzdHJpbmdpZnkoWzEsMl0sbnVsbCwxKSA9PSBcIltcXG4gMSxcXG4gMlxcbl1cIiAmJiAgLy8gSlNPTiAyLCBQcm90b3R5cGUgPD0gMS43LCBhbmQgb2xkZXIgV2ViS2l0IGJ1aWxkcyBpbmNvcnJlY3RseVxuLy8gc2VyaWFsaXplIGV4dGVuZGVkIHllYXJzLlxuc3RyaW5naWZ5KG5ldyBEYXRlKC04LjY0ZTE1KSkgPT0gJ1wiLTI3MTgyMS0wNC0yMFQwMDowMDowMC4wMDBaXCInICYmICAvLyBUaGUgbWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LCBidXQgcmVxdWlyZWQgaW4gNS4xLlxuc3RyaW5naWZ5KG5ldyBEYXRlKDguNjRlMTUpKSA9PSAnXCIrMjc1NzYwLTA5LTEzVDAwOjAwOjAwLjAwMFpcIicgJiYgIC8vIEZpcmVmb3ggPD0gMTEuMCBpbmNvcnJlY3RseSBzZXJpYWxpemVzIHllYXJzIHByaW9yIHRvIDAgYXMgbmVnYXRpdmVcbi8vIGZvdXItZGlnaXQgeWVhcnMgaW5zdGVhZCBvZiBzaXgtZGlnaXQgeWVhcnMuIENyZWRpdHM6IEBZYWZmbGUuXG5zdHJpbmdpZnkobmV3IERhdGUoLTYyMTk4NzU1MmU1KSkgPT0gJ1wiLTAwMDAwMS0wMS0wMVQwMDowMDowMC4wMDBaXCInICYmICAvLyBTYWZhcmkgPD0gNS4xLjUgYW5kIE9wZXJhID49IDEwLjUzIGluY29ycmVjdGx5IHNlcmlhbGl6ZSBtaWxsaXNlY29uZFxuLy8gdmFsdWVzIGxlc3MgdGhhbiAxMDAwLiBDcmVkaXRzOiBAWWFmZmxlLlxuc3RyaW5naWZ5KG5ldyBEYXRlKC0xKSkgPT0gJ1wiMTk2OS0xMi0zMVQyMzo1OTo1OS45OTlaXCInO31jYXRjaChleGNlcHRpb24pIHtzdHJpbmdpZnlTdXBwb3J0ZWQgPSBmYWxzZTt9fWlzU3VwcG9ydGVkID0gc3RyaW5naWZ5U3VwcG9ydGVkO30gLy8gVGVzdCBgSlNPTi5wYXJzZWAuXG5pZihuYW1lID09IFwianNvbi1wYXJzZVwiKXt2YXIgcGFyc2U9ZXhwb3J0cy5wYXJzZTtpZih0eXBlb2YgcGFyc2UgPT0gXCJmdW5jdGlvblwiKXt0cnl7IC8vIEZGIDMuMWIxLCBiMiB3aWxsIHRocm93IGFuIGV4Y2VwdGlvbiBpZiBhIGJhcmUgbGl0ZXJhbCBpcyBwcm92aWRlZC5cbi8vIENvbmZvcm1pbmcgaW1wbGVtZW50YXRpb25zIHNob3VsZCBhbHNvIGNvZXJjZSB0aGUgaW5pdGlhbCBhcmd1bWVudCB0b1xuLy8gYSBzdHJpbmcgcHJpb3IgdG8gcGFyc2luZy5cbmlmKHBhcnNlKFwiMFwiKSA9PT0gMCAmJiAhcGFyc2UoZmFsc2UpKXsgLy8gU2ltcGxlIHBhcnNpbmcgdGVzdC5cbnZhbHVlID0gcGFyc2Uoc2VyaWFsaXplZCk7dmFyIHBhcnNlU3VwcG9ydGVkPXZhbHVlW1wiYVwiXS5sZW5ndGggPT0gNSAmJiB2YWx1ZVtcImFcIl1bMF0gPT09IDE7aWYocGFyc2VTdXBwb3J0ZWQpe3RyeXsgLy8gU2FmYXJpIDw9IDUuMS4yIGFuZCBGRiAzLjFiMSBhbGxvdyB1bmVzY2FwZWQgdGFicyBpbiBzdHJpbmdzLlxucGFyc2VTdXBwb3J0ZWQgPSAhcGFyc2UoJ1wiXFx0XCInKTt9Y2F0Y2goZXhjZXB0aW9uKSB7fWlmKHBhcnNlU3VwcG9ydGVkKXt0cnl7IC8vIEZGIDQuMCBhbmQgNC4wLjEgYWxsb3cgbGVhZGluZyBgK2Agc2lnbnMgYW5kIGxlYWRpbmdcbi8vIGRlY2ltYWwgcG9pbnRzLiBGRiA0LjAsIDQuMC4xLCBhbmQgSUUgOS0xMCBhbHNvIGFsbG93XG4vLyBjZXJ0YWluIG9jdGFsIGxpdGVyYWxzLlxucGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjAxXCIpICE9PSAxO31jYXRjaChleGNlcHRpb24pIHt9fWlmKHBhcnNlU3VwcG9ydGVkKXt0cnl7IC8vIEZGIDQuMCwgNC4wLjEsIGFuZCBSaGlubyAxLjdSMy1SNCBhbGxvdyB0cmFpbGluZyBkZWNpbWFsXG4vLyBwb2ludHMuIFRoZXNlIGVudmlyb25tZW50cywgYWxvbmcgd2l0aCBGRiAzLjFiMSBhbmQgMixcbi8vIGFsc28gYWxsb3cgdHJhaWxpbmcgY29tbWFzIGluIEpTT04gb2JqZWN0cyBhbmQgYXJyYXlzLlxucGFyc2VTdXBwb3J0ZWQgPSBwYXJzZShcIjEuXCIpICE9PSAxO31jYXRjaChleGNlcHRpb24pIHt9fX19fWNhdGNoKGV4Y2VwdGlvbikge3BhcnNlU3VwcG9ydGVkID0gZmFsc2U7fX1pc1N1cHBvcnRlZCA9IHBhcnNlU3VwcG9ydGVkO319cmV0dXJuIGhhc1tuYW1lXSA9ICEhaXNTdXBwb3J0ZWQ7fWlmKCFoYXMoXCJqc29uXCIpKXsgLy8gQ29tbW9uIGBbW0NsYXNzXV1gIG5hbWUgYWxpYXNlcy5cbnZhciBmdW5jdGlvbkNsYXNzPVwiW29iamVjdCBGdW5jdGlvbl1cIixkYXRlQ2xhc3M9XCJbb2JqZWN0IERhdGVdXCIsbnVtYmVyQ2xhc3M9XCJbb2JqZWN0IE51bWJlcl1cIixzdHJpbmdDbGFzcz1cIltvYmplY3QgU3RyaW5nXVwiLGFycmF5Q2xhc3M9XCJbb2JqZWN0IEFycmF5XVwiLGJvb2xlYW5DbGFzcz1cIltvYmplY3QgQm9vbGVhbl1cIjsgLy8gRGV0ZWN0IGluY29tcGxldGUgc3VwcG9ydCBmb3IgYWNjZXNzaW5nIHN0cmluZyBjaGFyYWN0ZXJzIGJ5IGluZGV4LlxudmFyIGNoYXJJbmRleEJ1Z2d5PWhhcyhcImJ1Zy1zdHJpbmctY2hhci1pbmRleFwiKTsgLy8gRGVmaW5lIGFkZGl0aW9uYWwgdXRpbGl0eSBtZXRob2RzIGlmIHRoZSBgRGF0ZWAgbWV0aG9kcyBhcmUgYnVnZ3kuXG5pZighaXNFeHRlbmRlZCl7dmFyIGZsb29yPU1hdGguZmxvb3I7IC8vIEEgbWFwcGluZyBiZXR3ZWVuIHRoZSBtb250aHMgb2YgdGhlIHllYXIgYW5kIHRoZSBudW1iZXIgb2YgZGF5cyBiZXR3ZWVuXG4vLyBKYW51YXJ5IDFzdCBhbmQgdGhlIGZpcnN0IG9mIHRoZSByZXNwZWN0aXZlIG1vbnRoLlxudmFyIE1vbnRocz1bMCwzMSw1OSw5MCwxMjAsMTUxLDE4MSwyMTIsMjQzLDI3MywzMDQsMzM0XTsgLy8gSW50ZXJuYWw6IENhbGN1bGF0ZXMgdGhlIG51bWJlciBvZiBkYXlzIGJldHdlZW4gdGhlIFVuaXggZXBvY2ggYW5kIHRoZVxuLy8gZmlyc3QgZGF5IG9mIHRoZSBnaXZlbiBtb250aC5cbnZhciBnZXREYXk9ZnVuY3Rpb24gZ2V0RGF5KHllYXIsbW9udGgpe3JldHVybiBNb250aHNbbW9udGhdICsgMzY1ICogKHllYXIgLSAxOTcwKSArIGZsb29yKCh5ZWFyIC0gMTk2OSArIChtb250aCA9ICsobW9udGggPiAxKSkpIC8gNCkgLSBmbG9vcigoeWVhciAtIDE5MDEgKyBtb250aCkgLyAxMDApICsgZmxvb3IoKHllYXIgLSAxNjAxICsgbW9udGgpIC8gNDAwKTt9O30gLy8gSW50ZXJuYWw6IERldGVybWluZXMgaWYgYSBwcm9wZXJ0eSBpcyBhIGRpcmVjdCBwcm9wZXJ0eSBvZiB0aGUgZ2l2ZW5cbi8vIG9iamVjdC4gRGVsZWdhdGVzIHRvIHRoZSBuYXRpdmUgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAgbWV0aG9kLlxuaWYoIShpc1Byb3BlcnR5ID0gb2JqZWN0UHJvdG8uaGFzT3duUHJvcGVydHkpKXtpc1Byb3BlcnR5ID0gZnVuY3Rpb24ocHJvcGVydHkpe3ZhciBtZW1iZXJzPXt9LGNvbnN0cnVjdG9yO2lmKChtZW1iZXJzLl9fcHJvdG9fXyA9IG51bGwsbWVtYmVycy5fX3Byb3RvX18gPSB7IC8vIFRoZSAqcHJvdG8qIHByb3BlcnR5IGNhbm5vdCBiZSBzZXQgbXVsdGlwbGUgdGltZXMgaW4gcmVjZW50XG4vLyB2ZXJzaW9ucyBvZiBGaXJlZm94IGFuZCBTZWFNb25rZXkuXG5cInRvU3RyaW5nXCI6MX0sbWVtYmVycykudG9TdHJpbmcgIT0gZ2V0Q2xhc3MpeyAvLyBTYWZhcmkgPD0gMi4wLjMgZG9lc24ndCBpbXBsZW1lbnQgYE9iamVjdCNoYXNPd25Qcm9wZXJ0eWAsIGJ1dFxuLy8gc3VwcG9ydHMgdGhlIG11dGFibGUgKnByb3RvKiBwcm9wZXJ0eS5cbmlzUHJvcGVydHkgPSBmdW5jdGlvbihwcm9wZXJ0eSl7IC8vIENhcHR1cmUgYW5kIGJyZWFrIHRoZSBvYmplY3QncyBwcm90b3R5cGUgY2hhaW4gKHNlZSBzZWN0aW9uIDguNi4yXG4vLyBvZiB0aGUgRVMgNS4xIHNwZWMpLiBUaGUgcGFyZW50aGVzaXplZCBleHByZXNzaW9uIHByZXZlbnRzIGFuXG4vLyB1bnNhZmUgdHJhbnNmb3JtYXRpb24gYnkgdGhlIENsb3N1cmUgQ29tcGlsZXIuXG52YXIgb3JpZ2luYWw9dGhpcy5fX3Byb3RvX18scmVzdWx0PShwcm9wZXJ0eSBpbiAodGhpcy5fX3Byb3RvX18gPSBudWxsLHRoaXMpKTsgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgcHJvdG90eXBlIGNoYWluLlxudGhpcy5fX3Byb3RvX18gPSBvcmlnaW5hbDtyZXR1cm4gcmVzdWx0O307fWVsc2UgeyAvLyBDYXB0dXJlIGEgcmVmZXJlbmNlIHRvIHRoZSB0b3AtbGV2ZWwgYE9iamVjdGAgY29uc3RydWN0b3IuXG5jb25zdHJ1Y3RvciA9IG1lbWJlcnMuY29uc3RydWN0b3I7IC8vIFVzZSB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSB0byBzaW11bGF0ZSBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpblxuLy8gb3RoZXIgZW52aXJvbm1lbnRzLlxuaXNQcm9wZXJ0eSA9IGZ1bmN0aW9uKHByb3BlcnR5KXt2YXIgcGFyZW50PSh0aGlzLmNvbnN0cnVjdG9yIHx8IGNvbnN0cnVjdG9yKS5wcm90b3R5cGU7cmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgIShwcm9wZXJ0eSBpbiBwYXJlbnQgJiYgdGhpc1twcm9wZXJ0eV0gPT09IHBhcmVudFtwcm9wZXJ0eV0pO307fW1lbWJlcnMgPSBudWxsO3JldHVybiBpc1Byb3BlcnR5LmNhbGwodGhpcyxwcm9wZXJ0eSk7fTt9IC8vIEludGVybmFsOiBOb3JtYWxpemVzIHRoZSBgZm9yLi4uaW5gIGl0ZXJhdGlvbiBhbGdvcml0aG0gYWNyb3NzXG4vLyBlbnZpcm9ubWVudHMuIEVhY2ggZW51bWVyYXRlZCBrZXkgaXMgeWllbGRlZCB0byBhIGBjYWxsYmFja2AgZnVuY3Rpb24uXG5mb3JFYWNoID0gZnVuY3Rpb24ob2JqZWN0LGNhbGxiYWNrKXt2YXIgc2l6ZT0wLFByb3BlcnRpZXMsbWVtYmVycyxwcm9wZXJ0eTsgLy8gVGVzdHMgZm9yIGJ1Z3MgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQncyBgZm9yLi4uaW5gIGFsZ29yaXRobS4gVGhlXG4vLyBgdmFsdWVPZmAgcHJvcGVydHkgaW5oZXJpdHMgdGhlIG5vbi1lbnVtZXJhYmxlIGZsYWcgZnJvbVxuLy8gYE9iamVjdC5wcm90b3R5cGVgIGluIG9sZGVyIHZlcnNpb25zIG9mIElFLCBOZXRzY2FwZSwgYW5kIE1vemlsbGEuXG4oUHJvcGVydGllcyA9IGZ1bmN0aW9uKCl7dGhpcy52YWx1ZU9mID0gMDt9KS5wcm90b3R5cGUudmFsdWVPZiA9IDA7IC8vIEl0ZXJhdGUgb3ZlciBhIG5ldyBpbnN0YW5jZSBvZiB0aGUgYFByb3BlcnRpZXNgIGNsYXNzLlxubWVtYmVycyA9IG5ldyBQcm9wZXJ0aWVzKCk7Zm9yKHByb3BlcnR5IGluIG1lbWJlcnMpIHsgLy8gSWdub3JlIGFsbCBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbmlmKGlzUHJvcGVydHkuY2FsbChtZW1iZXJzLHByb3BlcnR5KSl7c2l6ZSsrO319UHJvcGVydGllcyA9IG1lbWJlcnMgPSBudWxsOyAvLyBOb3JtYWxpemUgdGhlIGl0ZXJhdGlvbiBhbGdvcml0aG0uXG5pZighc2l6ZSl7IC8vIEEgbGlzdCBvZiBub24tZW51bWVyYWJsZSBwcm9wZXJ0aWVzIGluaGVyaXRlZCBmcm9tIGBPYmplY3QucHJvdG90eXBlYC5cbm1lbWJlcnMgPSBbXCJ2YWx1ZU9mXCIsXCJ0b1N0cmluZ1wiLFwidG9Mb2NhbGVTdHJpbmdcIixcInByb3BlcnR5SXNFbnVtZXJhYmxlXCIsXCJpc1Byb3RvdHlwZU9mXCIsXCJoYXNPd25Qcm9wZXJ0eVwiLFwiY29uc3RydWN0b3JcIl07IC8vIElFIDw9IDgsIE1vemlsbGEgMS4wLCBhbmQgTmV0c2NhcGUgNi4yIGlnbm9yZSBzaGFkb3dlZCBub24tZW51bWVyYWJsZVxuLy8gcHJvcGVydGllcy5cbmZvckVhY2ggPSBmdW5jdGlvbihvYmplY3QsY2FsbGJhY2spe3ZhciBpc0Z1bmN0aW9uPWdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLHByb3BlcnR5LGxlbmd0aDt2YXIgaGFzUHJvcGVydHk9IWlzRnVuY3Rpb24gJiYgdHlwZW9mIG9iamVjdC5jb25zdHJ1Y3RvciAhPSBcImZ1bmN0aW9uXCIgJiYgb2JqZWN0VHlwZXNbdHlwZW9mIG9iamVjdC5oYXNPd25Qcm9wZXJ0eV0gJiYgb2JqZWN0Lmhhc093blByb3BlcnR5IHx8IGlzUHJvcGVydHk7Zm9yKHByb3BlcnR5IGluIG9iamVjdCkgeyAvLyBHZWNrbyA8PSAxLjAgZW51bWVyYXRlcyB0aGUgYHByb3RvdHlwZWAgcHJvcGVydHkgb2YgZnVuY3Rpb25zIHVuZGVyXG4vLyBjZXJ0YWluIGNvbmRpdGlvbnM7IElFIGRvZXMgbm90LlxuaWYoIShpc0Z1bmN0aW9uICYmIHByb3BlcnR5ID09IFwicHJvdG90eXBlXCIpICYmIGhhc1Byb3BlcnR5LmNhbGwob2JqZWN0LHByb3BlcnR5KSl7Y2FsbGJhY2socHJvcGVydHkpO319IC8vIE1hbnVhbGx5IGludm9rZSB0aGUgY2FsbGJhY2sgZm9yIGVhY2ggbm9uLWVudW1lcmFibGUgcHJvcGVydHkuXG5mb3IobGVuZ3RoID0gbWVtYmVycy5sZW5ndGg7cHJvcGVydHkgPSBtZW1iZXJzWy0tbGVuZ3RoXTtoYXNQcm9wZXJ0eS5jYWxsKG9iamVjdCxwcm9wZXJ0eSkgJiYgY2FsbGJhY2socHJvcGVydHkpKTt9O31lbHNlIGlmKHNpemUgPT0gMil7IC8vIFNhZmFyaSA8PSAyLjAuNCBlbnVtZXJhdGVzIHNoYWRvd2VkIHByb3BlcnRpZXMgdHdpY2UuXG5mb3JFYWNoID0gZnVuY3Rpb24ob2JqZWN0LGNhbGxiYWNrKXsgLy8gQ3JlYXRlIGEgc2V0IG9mIGl0ZXJhdGVkIHByb3BlcnRpZXMuXG52YXIgbWVtYmVycz17fSxpc0Z1bmN0aW9uPWdldENsYXNzLmNhbGwob2JqZWN0KSA9PSBmdW5jdGlvbkNsYXNzLHByb3BlcnR5O2Zvcihwcm9wZXJ0eSBpbiBvYmplY3QpIHsgLy8gU3RvcmUgZWFjaCBwcm9wZXJ0eSBuYW1lIHRvIHByZXZlbnQgZG91YmxlIGVudW1lcmF0aW9uLiBUaGVcbi8vIGBwcm90b3R5cGVgIHByb3BlcnR5IG9mIGZ1bmN0aW9ucyBpcyBub3QgZW51bWVyYXRlZCBkdWUgdG8gY3Jvc3MtXG4vLyBlbnZpcm9ubWVudCBpbmNvbnNpc3RlbmNpZXMuXG5pZighKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgIWlzUHJvcGVydHkuY2FsbChtZW1iZXJzLHByb3BlcnR5KSAmJiAobWVtYmVyc1twcm9wZXJ0eV0gPSAxKSAmJiBpc1Byb3BlcnR5LmNhbGwob2JqZWN0LHByb3BlcnR5KSl7Y2FsbGJhY2socHJvcGVydHkpO319fTt9ZWxzZSB7IC8vIE5vIGJ1Z3MgZGV0ZWN0ZWQ7IHVzZSB0aGUgc3RhbmRhcmQgYGZvci4uLmluYCBhbGdvcml0aG0uXG5mb3JFYWNoID0gZnVuY3Rpb24ob2JqZWN0LGNhbGxiYWNrKXt2YXIgaXNGdW5jdGlvbj1nZXRDbGFzcy5jYWxsKG9iamVjdCkgPT0gZnVuY3Rpb25DbGFzcyxwcm9wZXJ0eSxpc0NvbnN0cnVjdG9yO2Zvcihwcm9wZXJ0eSBpbiBvYmplY3QpIHtpZighKGlzRnVuY3Rpb24gJiYgcHJvcGVydHkgPT0gXCJwcm90b3R5cGVcIikgJiYgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCxwcm9wZXJ0eSkgJiYgIShpc0NvbnN0cnVjdG9yID0gcHJvcGVydHkgPT09IFwiY29uc3RydWN0b3JcIikpe2NhbGxiYWNrKHByb3BlcnR5KTt9fSAvLyBNYW51YWxseSBpbnZva2UgdGhlIGNhbGxiYWNrIGZvciB0aGUgYGNvbnN0cnVjdG9yYCBwcm9wZXJ0eSBkdWUgdG9cbi8vIGNyb3NzLWVudmlyb25tZW50IGluY29uc2lzdGVuY2llcy5cbmlmKGlzQ29uc3RydWN0b3IgfHwgaXNQcm9wZXJ0eS5jYWxsKG9iamVjdCxwcm9wZXJ0eSA9IFwiY29uc3RydWN0b3JcIikpe2NhbGxiYWNrKHByb3BlcnR5KTt9fTt9cmV0dXJuIGZvckVhY2gob2JqZWN0LGNhbGxiYWNrKTt9OyAvLyBQdWJsaWM6IFNlcmlhbGl6ZXMgYSBKYXZhU2NyaXB0IGB2YWx1ZWAgYXMgYSBKU09OIHN0cmluZy4gVGhlIG9wdGlvbmFsXG4vLyBgZmlsdGVyYCBhcmd1bWVudCBtYXkgc3BlY2lmeSBlaXRoZXIgYSBmdW5jdGlvbiB0aGF0IGFsdGVycyBob3cgb2JqZWN0IGFuZFxuLy8gYXJyYXkgbWVtYmVycyBhcmUgc2VyaWFsaXplZCwgb3IgYW4gYXJyYXkgb2Ygc3RyaW5ncyBhbmQgbnVtYmVycyB0aGF0XG4vLyBpbmRpY2F0ZXMgd2hpY2ggcHJvcGVydGllcyBzaG91bGQgYmUgc2VyaWFsaXplZC4gVGhlIG9wdGlvbmFsIGB3aWR0aGBcbi8vIGFyZ3VtZW50IG1heSBiZSBlaXRoZXIgYSBzdHJpbmcgb3IgbnVtYmVyIHRoYXQgc3BlY2lmaWVzIHRoZSBpbmRlbnRhdGlvblxuLy8gbGV2ZWwgb2YgdGhlIG91dHB1dC5cbmlmKCFoYXMoXCJqc29uLXN0cmluZ2lmeVwiKSl7IC8vIEludGVybmFsOiBBIG1hcCBvZiBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuXG52YXIgRXNjYXBlcz17OTI6XCJcXFxcXFxcXFwiLDM0OidcXFxcXCInLDg6XCJcXFxcYlwiLDEyOlwiXFxcXGZcIiwxMDpcIlxcXFxuXCIsMTM6XCJcXFxcclwiLDk6XCJcXFxcdFwifTsgLy8gSW50ZXJuYWw6IENvbnZlcnRzIGB2YWx1ZWAgaW50byBhIHplcm8tcGFkZGVkIHN0cmluZyBzdWNoIHRoYXQgaXRzXG4vLyBsZW5ndGggaXMgYXQgbGVhc3QgZXF1YWwgdG8gYHdpZHRoYC4gVGhlIGB3aWR0aGAgbXVzdCBiZSA8PSA2LlxudmFyIGxlYWRpbmdaZXJvZXM9XCIwMDAwMDBcIjt2YXIgdG9QYWRkZWRTdHJpbmc9ZnVuY3Rpb24gdG9QYWRkZWRTdHJpbmcod2lkdGgsdmFsdWUpeyAvLyBUaGUgYHx8IDBgIGV4cHJlc3Npb24gaXMgbmVjZXNzYXJ5IHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluXG4vLyBPcGVyYSA8PSA3LjU0dTIgd2hlcmUgYDAgPT0gLTBgLCBidXQgYFN0cmluZygtMCkgIT09IFwiMFwiYC5cbnJldHVybiAobGVhZGluZ1plcm9lcyArICh2YWx1ZSB8fCAwKSkuc2xpY2UoLXdpZHRoKTt9OyAvLyBJbnRlcm5hbDogRG91YmxlLXF1b3RlcyBhIHN0cmluZyBgdmFsdWVgLCByZXBsYWNpbmcgYWxsIEFTQ0lJIGNvbnRyb2xcbi8vIGNoYXJhY3RlcnMgKGNoYXJhY3RlcnMgd2l0aCBjb2RlIHVuaXQgdmFsdWVzIGJldHdlZW4gMCBhbmQgMzEpIHdpdGhcbi8vIHRoZWlyIGVzY2FwZWQgZXF1aXZhbGVudHMuIFRoaXMgaXMgYW4gaW1wbGVtZW50YXRpb24gb2YgdGhlXG4vLyBgUXVvdGUodmFsdWUpYCBvcGVyYXRpb24gZGVmaW5lZCBpbiBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLlxudmFyIHVuaWNvZGVQcmVmaXg9XCJcXFxcdTAwXCI7dmFyIHF1b3RlPWZ1bmN0aW9uIHF1b3RlKHZhbHVlKXt2YXIgcmVzdWx0PSdcIicsaW5kZXg9MCxsZW5ndGg9dmFsdWUubGVuZ3RoLHVzZUNoYXJJbmRleD0hY2hhckluZGV4QnVnZ3kgfHwgbGVuZ3RoID4gMTA7dmFyIHN5bWJvbHM9dXNlQ2hhckluZGV4ICYmIChjaGFySW5kZXhCdWdneT92YWx1ZS5zcGxpdChcIlwiKTp2YWx1ZSk7Zm9yKDtpbmRleCA8IGxlbmd0aDtpbmRleCsrKSB7dmFyIGNoYXJDb2RlPXZhbHVlLmNoYXJDb2RlQXQoaW5kZXgpOyAvLyBJZiB0aGUgY2hhcmFjdGVyIGlzIGEgY29udHJvbCBjaGFyYWN0ZXIsIGFwcGVuZCBpdHMgVW5pY29kZSBvclxuLy8gc2hvcnRoYW5kIGVzY2FwZSBzZXF1ZW5jZTsgb3RoZXJ3aXNlLCBhcHBlbmQgdGhlIGNoYXJhY3RlciBhcy1pcy5cbnN3aXRjaChjaGFyQ29kZSl7Y2FzZSA4OmNhc2UgOTpjYXNlIDEwOmNhc2UgMTI6Y2FzZSAxMzpjYXNlIDM0OmNhc2UgOTI6cmVzdWx0ICs9IEVzY2FwZXNbY2hhckNvZGVdO2JyZWFrO2RlZmF1bHQ6aWYoY2hhckNvZGUgPCAzMil7cmVzdWx0ICs9IHVuaWNvZGVQcmVmaXggKyB0b1BhZGRlZFN0cmluZygyLGNoYXJDb2RlLnRvU3RyaW5nKDE2KSk7YnJlYWs7fXJlc3VsdCArPSB1c2VDaGFySW5kZXg/c3ltYm9sc1tpbmRleF06dmFsdWUuY2hhckF0KGluZGV4KTt9fXJldHVybiByZXN1bHQgKyAnXCInO307IC8vIEludGVybmFsOiBSZWN1cnNpdmVseSBzZXJpYWxpemVzIGFuIG9iamVjdC4gSW1wbGVtZW50cyB0aGVcbi8vIGBTdHIoa2V5LCBob2xkZXIpYCwgYEpPKHZhbHVlKWAsIGFuZCBgSkEodmFsdWUpYCBvcGVyYXRpb25zLlxudmFyIHNlcmlhbGl6ZT1mdW5jdGlvbiBzZXJpYWxpemUocHJvcGVydHksb2JqZWN0LGNhbGxiYWNrLHByb3BlcnRpZXMsd2hpdGVzcGFjZSxpbmRlbnRhdGlvbixzdGFjayl7dmFyIHZhbHVlLGNsYXNzTmFtZSx5ZWFyLG1vbnRoLGRhdGUsdGltZSxob3VycyxtaW51dGVzLHNlY29uZHMsbWlsbGlzZWNvbmRzLHJlc3VsdHMsZWxlbWVudCxpbmRleCxsZW5ndGgscHJlZml4LHJlc3VsdDt0cnl7IC8vIE5lY2Vzc2FyeSBmb3IgaG9zdCBvYmplY3Qgc3VwcG9ydC5cbnZhbHVlID0gb2JqZWN0W3Byb3BlcnR5XTt9Y2F0Y2goZXhjZXB0aW9uKSB7fWlmKHR5cGVvZiB2YWx1ZSA9PSBcIm9iamVjdFwiICYmIHZhbHVlKXtjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHZhbHVlKTtpZihjbGFzc05hbWUgPT0gZGF0ZUNsYXNzICYmICFpc1Byb3BlcnR5LmNhbGwodmFsdWUsXCJ0b0pTT05cIikpe2lmKHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDApeyAvLyBEYXRlcyBhcmUgc2VyaWFsaXplZCBhY2NvcmRpbmcgdG8gdGhlIGBEYXRlI3RvSlNPTmAgbWV0aG9kXG4vLyBzcGVjaWZpZWQgaW4gRVMgNS4xIHNlY3Rpb24gMTUuOS41LjQ0LiBTZWUgc2VjdGlvbiAxNS45LjEuMTVcbi8vIGZvciB0aGUgSVNPIDg2MDEgZGF0ZSB0aW1lIHN0cmluZyBmb3JtYXQuXG5pZihnZXREYXkpeyAvLyBNYW51YWxseSBjb21wdXRlIHRoZSB5ZWFyLCBtb250aCwgZGF0ZSwgaG91cnMsIG1pbnV0ZXMsXG4vLyBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGlmIHRoZSBgZ2V0VVRDKmAgbWV0aG9kcyBhcmVcbi8vIGJ1Z2d5LiBBZGFwdGVkIGZyb20gQFlhZmZsZSdzIGBkYXRlLXNoaW1gIHByb2plY3QuXG5kYXRlID0gZmxvb3IodmFsdWUgLyA4NjRlNSk7Zm9yKHllYXIgPSBmbG9vcihkYXRlIC8gMzY1LjI0MjUpICsgMTk3MCAtIDE7Z2V0RGF5KHllYXIgKyAxLDApIDw9IGRhdGU7eWVhcisrKTtmb3IobW9udGggPSBmbG9vcigoZGF0ZSAtIGdldERheSh5ZWFyLDApKSAvIDMwLjQyKTtnZXREYXkoeWVhcixtb250aCArIDEpIDw9IGRhdGU7bW9udGgrKyk7ZGF0ZSA9IDEgKyBkYXRlIC0gZ2V0RGF5KHllYXIsbW9udGgpOyAvLyBUaGUgYHRpbWVgIHZhbHVlIHNwZWNpZmllcyB0aGUgdGltZSB3aXRoaW4gdGhlIGRheSAoc2VlIEVTXG4vLyA1LjEgc2VjdGlvbiAxNS45LjEuMikuIFRoZSBmb3JtdWxhIGAoQSAlIEIgKyBCKSAlIEJgIGlzIHVzZWRcbi8vIHRvIGNvbXB1dGUgYEEgbW9kdWxvIEJgLCBhcyB0aGUgYCVgIG9wZXJhdG9yIGRvZXMgbm90XG4vLyBjb3JyZXNwb25kIHRvIHRoZSBgbW9kdWxvYCBvcGVyYXRpb24gZm9yIG5lZ2F0aXZlIG51bWJlcnMuXG50aW1lID0gKHZhbHVlICUgODY0ZTUgKyA4NjRlNSkgJSA4NjRlNTsgLy8gVGhlIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzLCBhbmQgbWlsbGlzZWNvbmRzIGFyZSBvYnRhaW5lZCBieVxuLy8gZGVjb21wb3NpbmcgdGhlIHRpbWUgd2l0aGluIHRoZSBkYXkuIFNlZSBzZWN0aW9uIDE1LjkuMS4xMC5cbmhvdXJzID0gZmxvb3IodGltZSAvIDM2ZTUpICUgMjQ7bWludXRlcyA9IGZsb29yKHRpbWUgLyA2ZTQpICUgNjA7c2Vjb25kcyA9IGZsb29yKHRpbWUgLyAxZTMpICUgNjA7bWlsbGlzZWNvbmRzID0gdGltZSAlIDFlMzt9ZWxzZSB7eWVhciA9IHZhbHVlLmdldFVUQ0Z1bGxZZWFyKCk7bW9udGggPSB2YWx1ZS5nZXRVVENNb250aCgpO2RhdGUgPSB2YWx1ZS5nZXRVVENEYXRlKCk7aG91cnMgPSB2YWx1ZS5nZXRVVENIb3VycygpO21pbnV0ZXMgPSB2YWx1ZS5nZXRVVENNaW51dGVzKCk7c2Vjb25kcyA9IHZhbHVlLmdldFVUQ1NlY29uZHMoKTttaWxsaXNlY29uZHMgPSB2YWx1ZS5nZXRVVENNaWxsaXNlY29uZHMoKTt9IC8vIFNlcmlhbGl6ZSBleHRlbmRlZCB5ZWFycyBjb3JyZWN0bHkuXG52YWx1ZSA9ICh5ZWFyIDw9IDAgfHwgeWVhciA+PSAxZTQ/KHllYXIgPCAwP1wiLVwiOlwiK1wiKSArIHRvUGFkZGVkU3RyaW5nKDYseWVhciA8IDA/LXllYXI6eWVhcik6dG9QYWRkZWRTdHJpbmcoNCx5ZWFyKSkgKyBcIi1cIiArIHRvUGFkZGVkU3RyaW5nKDIsbW9udGggKyAxKSArIFwiLVwiICsgdG9QYWRkZWRTdHJpbmcoMixkYXRlKSArICAvLyBNb250aHMsIGRhdGVzLCBob3VycywgbWludXRlcywgYW5kIHNlY29uZHMgc2hvdWxkIGhhdmUgdHdvXG4vLyBkaWdpdHM7IG1pbGxpc2Vjb25kcyBzaG91bGQgaGF2ZSB0aHJlZS5cblwiVFwiICsgdG9QYWRkZWRTdHJpbmcoMixob3VycykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsbWludXRlcykgKyBcIjpcIiArIHRvUGFkZGVkU3RyaW5nKDIsc2Vjb25kcykgKyAgLy8gTWlsbGlzZWNvbmRzIGFyZSBvcHRpb25hbCBpbiBFUyA1LjAsIGJ1dCByZXF1aXJlZCBpbiA1LjEuXG5cIi5cIiArIHRvUGFkZGVkU3RyaW5nKDMsbWlsbGlzZWNvbmRzKSArIFwiWlwiO31lbHNlIHt2YWx1ZSA9IG51bGw7fX1lbHNlIGlmKHR5cGVvZiB2YWx1ZS50b0pTT04gPT0gXCJmdW5jdGlvblwiICYmIChjbGFzc05hbWUgIT0gbnVtYmVyQ2xhc3MgJiYgY2xhc3NOYW1lICE9IHN0cmluZ0NsYXNzICYmIGNsYXNzTmFtZSAhPSBhcnJheUNsYXNzIHx8IGlzUHJvcGVydHkuY2FsbCh2YWx1ZSxcInRvSlNPTlwiKSkpeyAvLyBQcm90b3R5cGUgPD0gMS42LjEgYWRkcyBub24tc3RhbmRhcmQgYHRvSlNPTmAgbWV0aG9kcyB0byB0aGVcbi8vIGBOdW1iZXJgLCBgU3RyaW5nYCwgYERhdGVgLCBhbmQgYEFycmF5YCBwcm90b3R5cGVzLiBKU09OIDNcbi8vIGlnbm9yZXMgYWxsIGB0b0pTT05gIG1ldGhvZHMgb24gdGhlc2Ugb2JqZWN0cyB1bmxlc3MgdGhleSBhcmVcbi8vIGRlZmluZWQgZGlyZWN0bHkgb24gYW4gaW5zdGFuY2UuXG52YWx1ZSA9IHZhbHVlLnRvSlNPTihwcm9wZXJ0eSk7fX1pZihjYWxsYmFjayl7IC8vIElmIGEgcmVwbGFjZW1lbnQgZnVuY3Rpb24gd2FzIHByb3ZpZGVkLCBjYWxsIGl0IHRvIG9idGFpbiB0aGUgdmFsdWVcbi8vIGZvciBzZXJpYWxpemF0aW9uLlxudmFsdWUgPSBjYWxsYmFjay5jYWxsKG9iamVjdCxwcm9wZXJ0eSx2YWx1ZSk7fWlmKHZhbHVlID09PSBudWxsKXtyZXR1cm4gXCJudWxsXCI7fWNsYXNzTmFtZSA9IGdldENsYXNzLmNhbGwodmFsdWUpO2lmKGNsYXNzTmFtZSA9PSBib29sZWFuQ2xhc3MpeyAvLyBCb29sZWFucyBhcmUgcmVwcmVzZW50ZWQgbGl0ZXJhbGx5LlxucmV0dXJuIFwiXCIgKyB2YWx1ZTt9ZWxzZSBpZihjbGFzc05hbWUgPT0gbnVtYmVyQ2xhc3MpeyAvLyBKU09OIG51bWJlcnMgbXVzdCBiZSBmaW5pdGUuIGBJbmZpbml0eWAgYW5kIGBOYU5gIGFyZSBzZXJpYWxpemVkIGFzXG4vLyBgXCJudWxsXCJgLlxucmV0dXJuIHZhbHVlID4gLTEgLyAwICYmIHZhbHVlIDwgMSAvIDA/XCJcIiArIHZhbHVlOlwibnVsbFwiO31lbHNlIGlmKGNsYXNzTmFtZSA9PSBzdHJpbmdDbGFzcyl7IC8vIFN0cmluZ3MgYXJlIGRvdWJsZS1xdW90ZWQgYW5kIGVzY2FwZWQuXG5yZXR1cm4gcXVvdGUoXCJcIiArIHZhbHVlKTt9IC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3RzIGFuZCBhcnJheXMuXG5pZih0eXBlb2YgdmFsdWUgPT0gXCJvYmplY3RcIil7IC8vIENoZWNrIGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhpcyBpcyBhIGxpbmVhciBzZWFyY2g7IHBlcmZvcm1hbmNlXG4vLyBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2YgdW5pcXVlIG5lc3RlZCBvYmplY3RzLlxuZm9yKGxlbmd0aCA9IHN0YWNrLmxlbmd0aDtsZW5ndGgtLTspIHtpZihzdGFja1tsZW5ndGhdID09PSB2YWx1ZSl7IC8vIEN5Y2xpYyBzdHJ1Y3R1cmVzIGNhbm5vdCBiZSBzZXJpYWxpemVkIGJ5IGBKU09OLnN0cmluZ2lmeWAuXG50aHJvdyBUeXBlRXJyb3IoKTt9fSAvLyBBZGQgdGhlIG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG5zdGFjay5wdXNoKHZhbHVlKTtyZXN1bHRzID0gW107IC8vIFNhdmUgdGhlIGN1cnJlbnQgaW5kZW50YXRpb24gbGV2ZWwgYW5kIGluZGVudCBvbmUgYWRkaXRpb25hbCBsZXZlbC5cbnByZWZpeCA9IGluZGVudGF0aW9uO2luZGVudGF0aW9uICs9IHdoaXRlc3BhY2U7aWYoY2xhc3NOYW1lID09IGFycmF5Q2xhc3MpeyAvLyBSZWN1cnNpdmVseSBzZXJpYWxpemUgYXJyYXkgZWxlbWVudHMuXG5mb3IoaW5kZXggPSAwLGxlbmd0aCA9IHZhbHVlLmxlbmd0aDtpbmRleCA8IGxlbmd0aDtpbmRleCsrKSB7ZWxlbWVudCA9IHNlcmlhbGl6ZShpbmRleCx2YWx1ZSxjYWxsYmFjayxwcm9wZXJ0aWVzLHdoaXRlc3BhY2UsaW5kZW50YXRpb24sc3RhY2spO3Jlc3VsdHMucHVzaChlbGVtZW50ID09PSB1bmRlZj9cIm51bGxcIjplbGVtZW50KTt9cmVzdWx0ID0gcmVzdWx0cy5sZW5ndGg/d2hpdGVzcGFjZT9cIltcXG5cIiArIGluZGVudGF0aW9uICsgcmVzdWx0cy5qb2luKFwiLFxcblwiICsgaW5kZW50YXRpb24pICsgXCJcXG5cIiArIHByZWZpeCArIFwiXVwiOlwiW1wiICsgcmVzdWx0cy5qb2luKFwiLFwiKSArIFwiXVwiOlwiW11cIjt9ZWxzZSB7IC8vIFJlY3Vyc2l2ZWx5IHNlcmlhbGl6ZSBvYmplY3QgbWVtYmVycy4gTWVtYmVycyBhcmUgc2VsZWN0ZWQgZnJvbVxuLy8gZWl0aGVyIGEgdXNlci1zcGVjaWZpZWQgbGlzdCBvZiBwcm9wZXJ0eSBuYW1lcywgb3IgdGhlIG9iamVjdFxuLy8gaXRzZWxmLlxuZm9yRWFjaChwcm9wZXJ0aWVzIHx8IHZhbHVlLGZ1bmN0aW9uKHByb3BlcnR5KXt2YXIgZWxlbWVudD1zZXJpYWxpemUocHJvcGVydHksdmFsdWUsY2FsbGJhY2sscHJvcGVydGllcyx3aGl0ZXNwYWNlLGluZGVudGF0aW9uLHN0YWNrKTtpZihlbGVtZW50ICE9PSB1bmRlZil7IC8vIEFjY29yZGluZyB0byBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zOiBcIklmIGBnYXBgIHt3aGl0ZXNwYWNlfVxuLy8gaXMgbm90IHRoZSBlbXB0eSBzdHJpbmcsIGxldCBgbWVtYmVyYCB7cXVvdGUocHJvcGVydHkpICsgXCI6XCJ9XG4vLyBiZSB0aGUgY29uY2F0ZW5hdGlvbiBvZiBgbWVtYmVyYCBhbmQgdGhlIGBzcGFjZWAgY2hhcmFjdGVyLlwiXG4vLyBUaGUgXCJgc3BhY2VgIGNoYXJhY3RlclwiIHJlZmVycyB0byB0aGUgbGl0ZXJhbCBzcGFjZVxuLy8gY2hhcmFjdGVyLCBub3QgdGhlIGBzcGFjZWAge3dpZHRofSBhcmd1bWVudCBwcm92aWRlZCB0b1xuLy8gYEpTT04uc3RyaW5naWZ5YC5cbnJlc3VsdHMucHVzaChxdW90ZShwcm9wZXJ0eSkgKyBcIjpcIiArICh3aGl0ZXNwYWNlP1wiIFwiOlwiXCIpICsgZWxlbWVudCk7fX0pO3Jlc3VsdCA9IHJlc3VsdHMubGVuZ3RoP3doaXRlc3BhY2U/XCJ7XFxuXCIgKyBpbmRlbnRhdGlvbiArIHJlc3VsdHMuam9pbihcIixcXG5cIiArIGluZGVudGF0aW9uKSArIFwiXFxuXCIgKyBwcmVmaXggKyBcIn1cIjpcIntcIiArIHJlc3VsdHMuam9pbihcIixcIikgKyBcIn1cIjpcInt9XCI7fSAvLyBSZW1vdmUgdGhlIG9iamVjdCBmcm9tIHRoZSB0cmF2ZXJzZWQgb2JqZWN0IHN0YWNrLlxuc3RhY2sucG9wKCk7cmV0dXJuIHJlc3VsdDt9fTsgLy8gUHVibGljOiBgSlNPTi5zdHJpbmdpZnlgLiBTZWUgRVMgNS4xIHNlY3Rpb24gMTUuMTIuMy5cbmV4cG9ydHMuc3RyaW5naWZ5ID0gZnVuY3Rpb24oc291cmNlLGZpbHRlcix3aWR0aCl7dmFyIHdoaXRlc3BhY2UsY2FsbGJhY2sscHJvcGVydGllcyxjbGFzc05hbWU7aWYob2JqZWN0VHlwZXNbdHlwZW9mIGZpbHRlcl0gJiYgZmlsdGVyKXtpZigoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbChmaWx0ZXIpKSA9PSBmdW5jdGlvbkNsYXNzKXtjYWxsYmFjayA9IGZpbHRlcjt9ZWxzZSBpZihjbGFzc05hbWUgPT0gYXJyYXlDbGFzcyl7IC8vIENvbnZlcnQgdGhlIHByb3BlcnR5IG5hbWVzIGFycmF5IGludG8gYSBtYWtlc2hpZnQgc2V0LlxucHJvcGVydGllcyA9IHt9O2Zvcih2YXIgaW5kZXg9MCxsZW5ndGg9ZmlsdGVyLmxlbmd0aCx2YWx1ZTtpbmRleCA8IGxlbmd0aDt2YWx1ZSA9IGZpbHRlcltpbmRleCsrXSwoY2xhc3NOYW1lID0gZ2V0Q2xhc3MuY2FsbCh2YWx1ZSksY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzIHx8IGNsYXNzTmFtZSA9PSBudW1iZXJDbGFzcykgJiYgKHByb3BlcnRpZXNbdmFsdWVdID0gMSkpO319aWYod2lkdGgpe2lmKChjbGFzc05hbWUgPSBnZXRDbGFzcy5jYWxsKHdpZHRoKSkgPT0gbnVtYmVyQ2xhc3MpeyAvLyBDb252ZXJ0IHRoZSBgd2lkdGhgIHRvIGFuIGludGVnZXIgYW5kIGNyZWF0ZSBhIHN0cmluZyBjb250YWluaW5nXG4vLyBgd2lkdGhgIG51bWJlciBvZiBzcGFjZSBjaGFyYWN0ZXJzLlxuaWYoKHdpZHRoIC09IHdpZHRoICUgMSkgPiAwKXtmb3Iod2hpdGVzcGFjZSA9IFwiXCIsd2lkdGggPiAxMCAmJiAod2lkdGggPSAxMCk7d2hpdGVzcGFjZS5sZW5ndGggPCB3aWR0aDt3aGl0ZXNwYWNlICs9IFwiIFwiKTt9fWVsc2UgaWYoY2xhc3NOYW1lID09IHN0cmluZ0NsYXNzKXt3aGl0ZXNwYWNlID0gd2lkdGgubGVuZ3RoIDw9IDEwP3dpZHRoOndpZHRoLnNsaWNlKDAsMTApO319IC8vIE9wZXJhIDw9IDcuNTR1MiBkaXNjYXJkcyB0aGUgdmFsdWVzIGFzc29jaWF0ZWQgd2l0aCBlbXB0eSBzdHJpbmcga2V5c1xuLy8gKGBcIlwiYCkgb25seSBpZiB0aGV5IGFyZSB1c2VkIGRpcmVjdGx5IHdpdGhpbiBhbiBvYmplY3QgbWVtYmVyIGxpc3Rcbi8vIChlLmcuLCBgIShcIlwiIGluIHsgXCJcIjogMX0pYCkuXG5yZXR1cm4gc2VyaWFsaXplKFwiXCIsKHZhbHVlID0ge30sdmFsdWVbXCJcIl0gPSBzb3VyY2UsdmFsdWUpLGNhbGxiYWNrLHByb3BlcnRpZXMsd2hpdGVzcGFjZSxcIlwiLFtdKTt9O30gLy8gUHVibGljOiBQYXJzZXMgYSBKU09OIHNvdXJjZSBzdHJpbmcuXG5pZighaGFzKFwianNvbi1wYXJzZVwiKSl7dmFyIGZyb21DaGFyQ29kZT1TdHJpbmcuZnJvbUNoYXJDb2RlOyAvLyBJbnRlcm5hbDogQSBtYXAgb2YgZXNjYXBlZCBjb250cm9sIGNoYXJhY3RlcnMgYW5kIHRoZWlyIHVuZXNjYXBlZFxuLy8gZXF1aXZhbGVudHMuXG52YXIgVW5lc2NhcGVzPXs5MjpcIlxcXFxcIiwzNDonXCInLDQ3OlwiL1wiLDk4OlwiXFxiXCIsMTE2OlwiXFx0XCIsMTEwOlwiXFxuXCIsMTAyOlwiXFxmXCIsMTE0OlwiXFxyXCJ9OyAvLyBJbnRlcm5hbDogU3RvcmVzIHRoZSBwYXJzZXIgc3RhdGUuXG52YXIgSW5kZXgsU291cmNlOyAvLyBJbnRlcm5hbDogUmVzZXRzIHRoZSBwYXJzZXIgc3RhdGUgYW5kIHRocm93cyBhIGBTeW50YXhFcnJvcmAuXG52YXIgYWJvcnQ9ZnVuY3Rpb24gYWJvcnQoKXtJbmRleCA9IFNvdXJjZSA9IG51bGw7dGhyb3cgU3ludGF4RXJyb3IoKTt9OyAvLyBJbnRlcm5hbDogUmV0dXJucyB0aGUgbmV4dCB0b2tlbiwgb3IgYFwiJFwiYCBpZiB0aGUgcGFyc2VyIGhhcyByZWFjaGVkXG4vLyB0aGUgZW5kIG9mIHRoZSBzb3VyY2Ugc3RyaW5nLiBBIHRva2VuIG1heSBiZSBhIHN0cmluZywgbnVtYmVyLCBgbnVsbGBcbi8vIGxpdGVyYWwsIG9yIEJvb2xlYW4gbGl0ZXJhbC5cbnZhciBsZXg9ZnVuY3Rpb24gbGV4KCl7dmFyIHNvdXJjZT1Tb3VyY2UsbGVuZ3RoPXNvdXJjZS5sZW5ndGgsdmFsdWUsYmVnaW4scG9zaXRpb24saXNTaWduZWQsY2hhckNvZGU7d2hpbGUoSW5kZXggPCBsZW5ndGgpIHtjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtzd2l0Y2goY2hhckNvZGUpe2Nhc2UgOTpjYXNlIDEwOmNhc2UgMTM6Y2FzZSAzMjogLy8gU2tpcCB3aGl0ZXNwYWNlIHRva2VucywgaW5jbHVkaW5nIHRhYnMsIGNhcnJpYWdlIHJldHVybnMsIGxpbmVcbi8vIGZlZWRzLCBhbmQgc3BhY2UgY2hhcmFjdGVycy5cbkluZGV4Kys7YnJlYWs7Y2FzZSAxMjM6Y2FzZSAxMjU6Y2FzZSA5MTpjYXNlIDkzOmNhc2UgNTg6Y2FzZSA0NDogLy8gUGFyc2UgYSBwdW5jdHVhdG9yIHRva2VuIChge2AsIGB9YCwgYFtgLCBgXWAsIGA6YCwgb3IgYCxgKSBhdFxuLy8gdGhlIGN1cnJlbnQgcG9zaXRpb24uXG52YWx1ZSA9IGNoYXJJbmRleEJ1Z2d5P3NvdXJjZS5jaGFyQXQoSW5kZXgpOnNvdXJjZVtJbmRleF07SW5kZXgrKztyZXR1cm4gdmFsdWU7Y2FzZSAzNDogLy8gYFwiYCBkZWxpbWl0cyBhIEpTT04gc3RyaW5nOyBhZHZhbmNlIHRvIHRoZSBuZXh0IGNoYXJhY3RlciBhbmRcbi8vIGJlZ2luIHBhcnNpbmcgdGhlIHN0cmluZy4gU3RyaW5nIHRva2VucyBhcmUgcHJlZml4ZWQgd2l0aCB0aGVcbi8vIHNlbnRpbmVsIGBAYCBjaGFyYWN0ZXIgdG8gZGlzdGluZ3Vpc2ggdGhlbSBmcm9tIHB1bmN0dWF0b3JzIGFuZFxuLy8gZW5kLW9mLXN0cmluZyB0b2tlbnMuXG5mb3IodmFsdWUgPSBcIkBcIixJbmRleCsrO0luZGV4IDwgbGVuZ3RoOykge2NoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoSW5kZXgpO2lmKGNoYXJDb2RlIDwgMzIpeyAvLyBVbmVzY2FwZWQgQVNDSUkgY29udHJvbCBjaGFyYWN0ZXJzICh0aG9zZSB3aXRoIGEgY29kZSB1bml0XG4vLyBsZXNzIHRoYW4gdGhlIHNwYWNlIGNoYXJhY3RlcikgYXJlIG5vdCBwZXJtaXR0ZWQuXG5hYm9ydCgpO31lbHNlIGlmKGNoYXJDb2RlID09IDkyKXsgLy8gQSByZXZlcnNlIHNvbGlkdXMgKGBcXGApIG1hcmtzIHRoZSBiZWdpbm5pbmcgb2YgYW4gZXNjYXBlZFxuLy8gY29udHJvbCBjaGFyYWN0ZXIgKGluY2x1ZGluZyBgXCJgLCBgXFxgLCBhbmQgYC9gKSBvciBVbmljb2RlXG4vLyBlc2NhcGUgc2VxdWVuY2UuXG5jaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KCsrSW5kZXgpO3N3aXRjaChjaGFyQ29kZSl7Y2FzZSA5MjpjYXNlIDM0OmNhc2UgNDc6Y2FzZSA5ODpjYXNlIDExNjpjYXNlIDExMDpjYXNlIDEwMjpjYXNlIDExNDogLy8gUmV2aXZlIGVzY2FwZWQgY29udHJvbCBjaGFyYWN0ZXJzLlxudmFsdWUgKz0gVW5lc2NhcGVzW2NoYXJDb2RlXTtJbmRleCsrO2JyZWFrO2Nhc2UgMTE3OiAvLyBgXFx1YCBtYXJrcyB0aGUgYmVnaW5uaW5nIG9mIGEgVW5pY29kZSBlc2NhcGUgc2VxdWVuY2UuXG4vLyBBZHZhbmNlIHRvIHRoZSBmaXJzdCBjaGFyYWN0ZXIgYW5kIHZhbGlkYXRlIHRoZVxuLy8gZm91ci1kaWdpdCBjb2RlIHBvaW50LlxuYmVnaW4gPSArK0luZGV4O2Zvcihwb3NpdGlvbiA9IEluZGV4ICsgNDtJbmRleCA8IHBvc2l0aW9uO0luZGV4KyspIHtjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTsgLy8gQSB2YWxpZCBzZXF1ZW5jZSBjb21wcmlzZXMgZm91ciBoZXhkaWdpdHMgKGNhc2UtXG4vLyBpbnNlbnNpdGl2ZSkgdGhhdCBmb3JtIGEgc2luZ2xlIGhleGFkZWNpbWFsIHZhbHVlLlxuaWYoIShjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1NyB8fCBjaGFyQ29kZSA+PSA5NyAmJiBjaGFyQ29kZSA8PSAxMDIgfHwgY2hhckNvZGUgPj0gNjUgJiYgY2hhckNvZGUgPD0gNzApKXsgLy8gSW52YWxpZCBVbmljb2RlIGVzY2FwZSBzZXF1ZW5jZS5cbmFib3J0KCk7fX0gLy8gUmV2aXZlIHRoZSBlc2NhcGVkIGNoYXJhY3Rlci5cbnZhbHVlICs9IGZyb21DaGFyQ29kZShcIjB4XCIgKyBzb3VyY2Uuc2xpY2UoYmVnaW4sSW5kZXgpKTticmVhaztkZWZhdWx0OiAvLyBJbnZhbGlkIGVzY2FwZSBzZXF1ZW5jZS5cbmFib3J0KCk7fX1lbHNlIHtpZihjaGFyQ29kZSA9PSAzNCl7IC8vIEFuIHVuZXNjYXBlZCBkb3VibGUtcXVvdGUgY2hhcmFjdGVyIG1hcmtzIHRoZSBlbmQgb2YgdGhlXG4vLyBzdHJpbmcuXG5icmVhazt9Y2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCk7YmVnaW4gPSBJbmRleDsgLy8gT3B0aW1pemUgZm9yIHRoZSBjb21tb24gY2FzZSB3aGVyZSBhIHN0cmluZyBpcyB2YWxpZC5cbndoaWxlKGNoYXJDb2RlID49IDMyICYmIGNoYXJDb2RlICE9IDkyICYmIGNoYXJDb2RlICE9IDM0KSB7Y2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTt9IC8vIEFwcGVuZCB0aGUgc3RyaW5nIGFzLWlzLlxudmFsdWUgKz0gc291cmNlLnNsaWNlKGJlZ2luLEluZGV4KTt9fWlmKHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KSA9PSAzNCl7IC8vIEFkdmFuY2UgdG8gdGhlIG5leHQgY2hhcmFjdGVyIGFuZCByZXR1cm4gdGhlIHJldml2ZWQgc3RyaW5nLlxuSW5kZXgrKztyZXR1cm4gdmFsdWU7fSAvLyBVbnRlcm1pbmF0ZWQgc3RyaW5nLlxuYWJvcnQoKTtkZWZhdWx0OiAvLyBQYXJzZSBudW1iZXJzIGFuZCBsaXRlcmFscy5cbmJlZ2luID0gSW5kZXg7IC8vIEFkdmFuY2UgcGFzdCB0aGUgbmVnYXRpdmUgc2lnbiwgaWYgb25lIGlzIHNwZWNpZmllZC5cbmlmKGNoYXJDb2RlID09IDQ1KXtpc1NpZ25lZCA9IHRydWU7Y2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdCgrK0luZGV4KTt9IC8vIFBhcnNlIGFuIGludGVnZXIgb3IgZmxvYXRpbmctcG9pbnQgdmFsdWUuXG5pZihjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyl7IC8vIExlYWRpbmcgemVyb2VzIGFyZSBpbnRlcnByZXRlZCBhcyBvY3RhbCBsaXRlcmFscy5cbmlmKGNoYXJDb2RlID09IDQ4ICYmIChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4ICsgMSksY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpKXsgLy8gSWxsZWdhbCBvY3RhbCBsaXRlcmFsLlxuYWJvcnQoKTt9aXNTaWduZWQgPSBmYWxzZTsgLy8gUGFyc2UgdGhlIGludGVnZXIgY29tcG9uZW50LlxuZm9yKDtJbmRleCA8IGxlbmd0aCAmJiAoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChJbmRleCksY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpO0luZGV4KyspOyAvLyBGbG9hdHMgY2Fubm90IGNvbnRhaW4gYSBsZWFkaW5nIGRlY2ltYWwgcG9pbnQ7IGhvd2V2ZXIsIHRoaXNcbi8vIGNhc2UgaXMgYWxyZWFkeSBhY2NvdW50ZWQgZm9yIGJ5IHRoZSBwYXJzZXIuXG5pZihzb3VyY2UuY2hhckNvZGVBdChJbmRleCkgPT0gNDYpe3Bvc2l0aW9uID0gKytJbmRleDsgLy8gUGFyc2UgdGhlIGRlY2ltYWwgY29tcG9uZW50LlxuZm9yKDtwb3NpdGlvbiA8IGxlbmd0aCAmJiAoY2hhckNvZGUgPSBzb3VyY2UuY2hhckNvZGVBdChwb3NpdGlvbiksY2hhckNvZGUgPj0gNDggJiYgY2hhckNvZGUgPD0gNTcpO3Bvc2l0aW9uKyspO2lmKHBvc2l0aW9uID09IEluZGV4KXsgLy8gSWxsZWdhbCB0cmFpbGluZyBkZWNpbWFsLlxuYWJvcnQoKTt9SW5kZXggPSBwb3NpdGlvbjt9IC8vIFBhcnNlIGV4cG9uZW50cy4gVGhlIGBlYCBkZW5vdGluZyB0aGUgZXhwb25lbnQgaXNcbi8vIGNhc2UtaW5zZW5zaXRpdmUuXG5jaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KEluZGV4KTtpZihjaGFyQ29kZSA9PSAxMDEgfHwgY2hhckNvZGUgPT0gNjkpe2NoYXJDb2RlID0gc291cmNlLmNoYXJDb2RlQXQoKytJbmRleCk7IC8vIFNraXAgcGFzdCB0aGUgc2lnbiBmb2xsb3dpbmcgdGhlIGV4cG9uZW50LCBpZiBvbmUgaXNcbi8vIHNwZWNpZmllZC5cbmlmKGNoYXJDb2RlID09IDQzIHx8IGNoYXJDb2RlID09IDQ1KXtJbmRleCsrO30gLy8gUGFyc2UgdGhlIGV4cG9uZW50aWFsIGNvbXBvbmVudC5cbmZvcihwb3NpdGlvbiA9IEluZGV4O3Bvc2l0aW9uIDwgbGVuZ3RoICYmIChjaGFyQ29kZSA9IHNvdXJjZS5jaGFyQ29kZUF0KHBvc2l0aW9uKSxjaGFyQ29kZSA+PSA0OCAmJiBjaGFyQ29kZSA8PSA1Nyk7cG9zaXRpb24rKyk7aWYocG9zaXRpb24gPT0gSW5kZXgpeyAvLyBJbGxlZ2FsIGVtcHR5IGV4cG9uZW50LlxuYWJvcnQoKTt9SW5kZXggPSBwb3NpdGlvbjt9IC8vIENvZXJjZSB0aGUgcGFyc2VkIHZhbHVlIHRvIGEgSmF2YVNjcmlwdCBudW1iZXIuXG5yZXR1cm4gK3NvdXJjZS5zbGljZShiZWdpbixJbmRleCk7fSAvLyBBIG5lZ2F0aXZlIHNpZ24gbWF5IG9ubHkgcHJlY2VkZSBudW1iZXJzLlxuaWYoaXNTaWduZWQpe2Fib3J0KCk7fSAvLyBgdHJ1ZWAsIGBmYWxzZWAsIGFuZCBgbnVsbGAgbGl0ZXJhbHMuXG5pZihzb3VyY2Uuc2xpY2UoSW5kZXgsSW5kZXggKyA0KSA9PSBcInRydWVcIil7SW5kZXggKz0gNDtyZXR1cm4gdHJ1ZTt9ZWxzZSBpZihzb3VyY2Uuc2xpY2UoSW5kZXgsSW5kZXggKyA1KSA9PSBcImZhbHNlXCIpe0luZGV4ICs9IDU7cmV0dXJuIGZhbHNlO31lbHNlIGlmKHNvdXJjZS5zbGljZShJbmRleCxJbmRleCArIDQpID09IFwibnVsbFwiKXtJbmRleCArPSA0O3JldHVybiBudWxsO30gLy8gVW5yZWNvZ25pemVkIHRva2VuLlxuYWJvcnQoKTt9fSAvLyBSZXR1cm4gdGhlIHNlbnRpbmVsIGAkYCBjaGFyYWN0ZXIgaWYgdGhlIHBhcnNlciBoYXMgcmVhY2hlZCB0aGUgZW5kXG4vLyBvZiB0aGUgc291cmNlIHN0cmluZy5cbnJldHVybiBcIiRcIjt9OyAvLyBJbnRlcm5hbDogUGFyc2VzIGEgSlNPTiBgdmFsdWVgIHRva2VuLlxudmFyIGdldD1mdW5jdGlvbiBnZXQodmFsdWUpe3ZhciByZXN1bHRzLGhhc01lbWJlcnM7aWYodmFsdWUgPT0gXCIkXCIpeyAvLyBVbmV4cGVjdGVkIGVuZCBvZiBpbnB1dC5cbmFib3J0KCk7fWlmKHR5cGVvZiB2YWx1ZSA9PSBcInN0cmluZ1wiKXtpZigoY2hhckluZGV4QnVnZ3k/dmFsdWUuY2hhckF0KDApOnZhbHVlWzBdKSA9PSBcIkBcIil7IC8vIFJlbW92ZSB0aGUgc2VudGluZWwgYEBgIGNoYXJhY3Rlci5cbnJldHVybiB2YWx1ZS5zbGljZSgxKTt9IC8vIFBhcnNlIG9iamVjdCBhbmQgYXJyYXkgbGl0ZXJhbHMuXG5pZih2YWx1ZSA9PSBcIltcIil7IC8vIFBhcnNlcyBhIEpTT04gYXJyYXksIHJldHVybmluZyBhIG5ldyBKYXZhU2NyaXB0IGFycmF5LlxucmVzdWx0cyA9IFtdO2Zvcig7O2hhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge3ZhbHVlID0gbGV4KCk7IC8vIEEgY2xvc2luZyBzcXVhcmUgYnJhY2tldCBtYXJrcyB0aGUgZW5kIG9mIHRoZSBhcnJheSBsaXRlcmFsLlxuaWYodmFsdWUgPT0gXCJdXCIpe2JyZWFrO30gLy8gSWYgdGhlIGFycmF5IGxpdGVyYWwgY29udGFpbnMgZWxlbWVudHMsIHRoZSBjdXJyZW50IHRva2VuXG4vLyBzaG91bGQgYmUgYSBjb21tYSBzZXBhcmF0aW5nIHRoZSBwcmV2aW91cyBlbGVtZW50IGZyb20gdGhlXG4vLyBuZXh0LlxuaWYoaGFzTWVtYmVycyl7aWYodmFsdWUgPT0gXCIsXCIpe3ZhbHVlID0gbGV4KCk7aWYodmFsdWUgPT0gXCJdXCIpeyAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBhcnJheSBsaXRlcmFsLlxuYWJvcnQoKTt9fWVsc2UgeyAvLyBBIGAsYCBtdXN0IHNlcGFyYXRlIGVhY2ggYXJyYXkgZWxlbWVudC5cbmFib3J0KCk7fX0gLy8gRWxpc2lvbnMgYW5kIGxlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLlxuaWYodmFsdWUgPT0gXCIsXCIpe2Fib3J0KCk7fXJlc3VsdHMucHVzaChnZXQodmFsdWUpKTt9cmV0dXJuIHJlc3VsdHM7fWVsc2UgaWYodmFsdWUgPT0gXCJ7XCIpeyAvLyBQYXJzZXMgYSBKU09OIG9iamVjdCwgcmV0dXJuaW5nIGEgbmV3IEphdmFTY3JpcHQgb2JqZWN0LlxucmVzdWx0cyA9IHt9O2Zvcig7O2hhc01lbWJlcnMgfHwgKGhhc01lbWJlcnMgPSB0cnVlKSkge3ZhbHVlID0gbGV4KCk7IC8vIEEgY2xvc2luZyBjdXJseSBicmFjZSBtYXJrcyB0aGUgZW5kIG9mIHRoZSBvYmplY3QgbGl0ZXJhbC5cbmlmKHZhbHVlID09IFwifVwiKXticmVhazt9IC8vIElmIHRoZSBvYmplY3QgbGl0ZXJhbCBjb250YWlucyBtZW1iZXJzLCB0aGUgY3VycmVudCB0b2tlblxuLy8gc2hvdWxkIGJlIGEgY29tbWEgc2VwYXJhdG9yLlxuaWYoaGFzTWVtYmVycyl7aWYodmFsdWUgPT0gXCIsXCIpe3ZhbHVlID0gbGV4KCk7aWYodmFsdWUgPT0gXCJ9XCIpeyAvLyBVbmV4cGVjdGVkIHRyYWlsaW5nIGAsYCBpbiBvYmplY3QgbGl0ZXJhbC5cbmFib3J0KCk7fX1lbHNlIHsgLy8gQSBgLGAgbXVzdCBzZXBhcmF0ZSBlYWNoIG9iamVjdCBtZW1iZXIuXG5hYm9ydCgpO319IC8vIExlYWRpbmcgY29tbWFzIGFyZSBub3QgcGVybWl0dGVkLCBvYmplY3QgcHJvcGVydHkgbmFtZXMgbXVzdCBiZVxuLy8gZG91YmxlLXF1b3RlZCBzdHJpbmdzLCBhbmQgYSBgOmAgbXVzdCBzZXBhcmF0ZSBlYWNoIHByb3BlcnR5XG4vLyBuYW1lIGFuZCB2YWx1ZS5cbmlmKHZhbHVlID09IFwiLFwiIHx8IHR5cGVvZiB2YWx1ZSAhPSBcInN0cmluZ1wiIHx8IChjaGFySW5kZXhCdWdneT92YWx1ZS5jaGFyQXQoMCk6dmFsdWVbMF0pICE9IFwiQFwiIHx8IGxleCgpICE9IFwiOlwiKXthYm9ydCgpO31yZXN1bHRzW3ZhbHVlLnNsaWNlKDEpXSA9IGdldChsZXgoKSk7fXJldHVybiByZXN1bHRzO30gLy8gVW5leHBlY3RlZCB0b2tlbiBlbmNvdW50ZXJlZC5cbmFib3J0KCk7fXJldHVybiB2YWx1ZTt9OyAvLyBJbnRlcm5hbDogVXBkYXRlcyBhIHRyYXZlcnNlZCBvYmplY3QgbWVtYmVyLlxudmFyIHVwZGF0ZT1mdW5jdGlvbiB1cGRhdGUoc291cmNlLHByb3BlcnR5LGNhbGxiYWNrKXt2YXIgZWxlbWVudD13YWxrKHNvdXJjZSxwcm9wZXJ0eSxjYWxsYmFjayk7aWYoZWxlbWVudCA9PT0gdW5kZWYpe2RlbGV0ZSBzb3VyY2VbcHJvcGVydHldO31lbHNlIHtzb3VyY2VbcHJvcGVydHldID0gZWxlbWVudDt9fTsgLy8gSW50ZXJuYWw6IFJlY3Vyc2l2ZWx5IHRyYXZlcnNlcyBhIHBhcnNlZCBKU09OIG9iamVjdCwgaW52b2tpbmcgdGhlXG4vLyBgY2FsbGJhY2tgIGZ1bmN0aW9uIGZvciBlYWNoIHZhbHVlLiBUaGlzIGlzIGFuIGltcGxlbWVudGF0aW9uIG9mIHRoZVxuLy8gYFdhbGsoaG9sZGVyLCBuYW1lKWAgb3BlcmF0aW9uIGRlZmluZWQgaW4gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMi5cbnZhciB3YWxrPWZ1bmN0aW9uIHdhbGsoc291cmNlLHByb3BlcnR5LGNhbGxiYWNrKXt2YXIgdmFsdWU9c291cmNlW3Byb3BlcnR5XSxsZW5ndGg7aWYodHlwZW9mIHZhbHVlID09IFwib2JqZWN0XCIgJiYgdmFsdWUpeyAvLyBgZm9yRWFjaGAgY2FuJ3QgYmUgdXNlZCB0byB0cmF2ZXJzZSBhbiBhcnJheSBpbiBPcGVyYSA8PSA4LjU0XG4vLyBiZWNhdXNlIGl0cyBgT2JqZWN0I2hhc093blByb3BlcnR5YCBpbXBsZW1lbnRhdGlvbiByZXR1cm5zIGBmYWxzZWBcbi8vIGZvciBhcnJheSBpbmRpY2VzIChlLmcuLCBgIVsxLCAyLCAzXS5oYXNPd25Qcm9wZXJ0eShcIjBcIilgKS5cbmlmKGdldENsYXNzLmNhbGwodmFsdWUpID09IGFycmF5Q2xhc3Mpe2ZvcihsZW5ndGggPSB2YWx1ZS5sZW5ndGg7bGVuZ3RoLS07KSB7dXBkYXRlKHZhbHVlLGxlbmd0aCxjYWxsYmFjayk7fX1lbHNlIHtmb3JFYWNoKHZhbHVlLGZ1bmN0aW9uKHByb3BlcnR5KXt1cGRhdGUodmFsdWUscHJvcGVydHksY2FsbGJhY2spO30pO319cmV0dXJuIGNhbGxiYWNrLmNhbGwoc291cmNlLHByb3BlcnR5LHZhbHVlKTt9OyAvLyBQdWJsaWM6IGBKU09OLnBhcnNlYC4gU2VlIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjIuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24oc291cmNlLGNhbGxiYWNrKXt2YXIgcmVzdWx0LHZhbHVlO0luZGV4ID0gMDtTb3VyY2UgPSBcIlwiICsgc291cmNlO3Jlc3VsdCA9IGdldChsZXgoKSk7IC8vIElmIGEgSlNPTiBzdHJpbmcgY29udGFpbnMgbXVsdGlwbGUgdG9rZW5zLCBpdCBpcyBpbnZhbGlkLlxuaWYobGV4KCkgIT0gXCIkXCIpe2Fib3J0KCk7fSAvLyBSZXNldCB0aGUgcGFyc2VyIHN0YXRlLlxuSW5kZXggPSBTb3VyY2UgPSBudWxsO3JldHVybiBjYWxsYmFjayAmJiBnZXRDbGFzcy5jYWxsKGNhbGxiYWNrKSA9PSBmdW5jdGlvbkNsYXNzP3dhbGsoKHZhbHVlID0ge30sdmFsdWVbXCJcIl0gPSByZXN1bHQsdmFsdWUpLFwiXCIsY2FsbGJhY2spOnJlc3VsdDt9O319ZXhwb3J0c1tcInJ1bkluQ29udGV4dFwiXSA9IHJ1bkluQ29udGV4dDtyZXR1cm4gZXhwb3J0czt9aWYoZnJlZUV4cG9ydHMgJiYgIWlzTG9hZGVyKXsgLy8gRXhwb3J0IGZvciBDb21tb25KUyBlbnZpcm9ubWVudHMuXG5ydW5JbkNvbnRleHQocm9vdCxmcmVlRXhwb3J0cyk7fWVsc2UgeyAvLyBFeHBvcnQgZm9yIHdlYiBicm93c2VycyBhbmQgSmF2YVNjcmlwdCBlbmdpbmVzLlxudmFyIG5hdGl2ZUpTT049cm9vdC5KU09OLHByZXZpb3VzSlNPTj1yb290W1wiSlNPTjNcIl0saXNSZXN0b3JlZD1mYWxzZTt2YXIgSlNPTjM9cnVuSW5Db250ZXh0KHJvb3Qscm9vdFtcIkpTT04zXCJdID0geyAvLyBQdWJsaWM6IFJlc3RvcmVzIHRoZSBvcmlnaW5hbCB2YWx1ZSBvZiB0aGUgZ2xvYmFsIGBKU09OYCBvYmplY3QgYW5kXG4vLyByZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBgSlNPTjNgIG9iamVjdC5cblwibm9Db25mbGljdFwiOmZ1bmN0aW9uIG5vQ29uZmxpY3QoKXtpZighaXNSZXN0b3JlZCl7aXNSZXN0b3JlZCA9IHRydWU7cm9vdC5KU09OID0gbmF0aXZlSlNPTjtyb290W1wiSlNPTjNcIl0gPSBwcmV2aW91c0pTT047bmF0aXZlSlNPTiA9IHByZXZpb3VzSlNPTiA9IG51bGw7fXJldHVybiBKU09OMzt9fSk7cm9vdC5KU09OID0ge1wicGFyc2VcIjpKU09OMy5wYXJzZSxcInN0cmluZ2lmeVwiOkpTT04zLnN0cmluZ2lmeX07fSAvLyBFeHBvcnQgZm9yIGFzeW5jaHJvbm91cyBtb2R1bGUgbG9hZGVycy5cbmlmKGlzTG9hZGVyKXtkZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gSlNPTjM7fSk7fX0pLmNhbGwodGhpcyk7fSkuY2FsbCh0aGlzLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiP3NlbGY6dHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIj93aW5kb3c6dHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIj9nbG9iYWw6e30pO30se31dLDUxOltmdW5jdGlvbihfZGVyZXFfLG1vZHVsZSxleHBvcnRzKXttb2R1bGUuZXhwb3J0cyA9IHRvQXJyYXk7ZnVuY3Rpb24gdG9BcnJheShsaXN0LGluZGV4KXt2YXIgYXJyYXk9W107aW5kZXggPSBpbmRleCB8fCAwO2Zvcih2YXIgaT1pbmRleCB8fCAwO2kgPCBsaXN0Lmxlbmd0aDtpKyspIHthcnJheVtpIC0gaW5kZXhdID0gbGlzdFtpXTt9cmV0dXJuIGFycmF5O319LHt9XX0se30sWzMxXSkoMzEpO30pO31cblxuY2MuX1JGcG9wKCk7Il19
