// const Grid = require("Grid")
cc.Class({
    extends: cc.Component,

    properties: {
        x:0,
        y:0,
        g:0.0,
        f:0.0,
        h:0.0,
        walkAble:cc.Boolean,
        maxRaw:10,
        maxCol:9
    },
    // use this for initialization
    onLoad: function () {

    },

    //初始化A星格子
    init:function(x,y,g,f,moveAble)
    {
        this.x = x ;
        this.y = y ;
        this.g = g ;
        this.f = f ; 
        this.moveAble = moveAble ;
        this.h = g* 10 + f* 10 ;
    },

    reset:function()
    {
        this.x = 0;
        this.y = 0 ;
        this.f = 0 ;
        this.g = 0 ;
        this.h = 0 ;
        this.walkAble = false ; 
    }

});
