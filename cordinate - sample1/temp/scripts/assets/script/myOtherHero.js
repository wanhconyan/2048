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