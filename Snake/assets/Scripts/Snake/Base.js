const Snake = require("Snake");
cc.Class({
    extends: cc.Component,
    properties: {
        owner:Snake,
        vx:0,
        vy:0,
        texture:cc.SpriteFrame,
        angle:0,
        speed: {
        set: function (value) {
            this._speed = value;
        },
        get:function()
        {
            return this._speed;
        }
    },
    },

    //初始化蛇形状
    init:function(data)
    {

        
    },
 
    onLoad: function () {

    },
});
