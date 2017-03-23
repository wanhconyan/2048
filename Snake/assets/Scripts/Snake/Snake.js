const Global = require("Global");
const map = require("Map");
const SnakeData = require("SnakeData") ;
cc.Class({
    extends: cc.Component,
    properties: {
        angle:0.0,
        snakeHead:cc.Prefab,
    },

    
    onLoad: function () {
    
    },


    initSnake:function(snakeData)
    {
        this.head = cc.instantiate(this.snakeHead);
        this.head.parent = this.node ;
        this.headCode = this.head.getComponent("SnakeHead");
        this.bodys = [] ;
        this.headCode.nikeName.String  = snakeData.nikeName ;
    } ,

    changeSkin:function(snakeData)
    {


    },

    updateBody:function()
    {
        


    },
    
    
    moveTo:function(angle)
    {   
        this.headCode.moveTo(angle);   
    },

    update:function(t)
    {
        this.node.x = this.head.x;
        this.node.y = this.head.y;
       map.instance.vx = this.headCode.vx ;
       map.instance.vy = this.headCode.vy ;
    }
    
    
    
});
