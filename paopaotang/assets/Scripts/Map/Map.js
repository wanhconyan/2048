const InputControl = require("InputControl");
cc.Class({
    extends: cc.Component,

    properties: {
        level: 0,
        inputControl:InputControl,
    },

    
    onLoad: function () {
        this.titleLayer = this.getComponent("TileLayer");
        this.blockLayer = this.getComponent('BlockLayer');
        this.playerLayer = this.getComponent("PlayerLayer");
        this.initMap(0,""); //最底层为tileMap层
        this.inputControl.game = this ;
    },

    //初始化地图和关卡信息
    initMap:function(level,url)
    {
        this.level = level ;
        this.titleLayer.initPass(this.level);
        this.blockLayer.initPass(this.level);
        this.playerLayer.initPass(this.level,url);
    },

    //移动
    move:function(direction)
    {
        this.playerLayer.moveTo(0,0,direction);
    },

    //放置炸弹
    putBomb:function()
    {
        this.playerLayer.putBomb();
    }
    
});
