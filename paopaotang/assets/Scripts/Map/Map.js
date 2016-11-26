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
        this.astar = this.getComponent("AStar") ;
        this.astar.game = this ;
        this.initMap(0,""); //最底层为tileMap层
        this.inputControl.game = this ;
        this.playerLayer.game = this ;
    },

    //初始化地图和关卡信息
    initMap:function(level,url)
    {
        this.level = level ;
        this.titleLayer.initPass(this.level);
        this.blockLayer.initPass(this.level,this);
        this.playerLayer.initPass(this.level,url,this);
    },

    //移动
    move:function(direction)
    {
        this.playerLayer.moveTo(direction,this.blocks);
    },

    //放置炸弹
    putBomb:function()
    {
        var type = 1 ;//玩家
        this.playerLayer.putBomb(type);
    }
    
});
