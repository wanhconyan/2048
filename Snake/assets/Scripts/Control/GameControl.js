const Nipple = require("Nipple");
const SnakeData = require("SnakeData");
var GameControl = cc.Class({
    extends: cc.Component,

    properties: {
        nipple:Nipple,
        btnAcc:cc.Button,
        snakePrefab:cc.Prefab,
    },


    statics:
    {
        instance:null
    },

    onLoad: function () {
        var nippleCode = this.nipple.getComponent("Nipple");
        nippleCode.control = this ;
        GameControl.instance = this ;
    },


    moveTo:function(angle)
    {
        if(!this.gameStart)return ;
        var code = this.snake.getComponent("Snake");
        code.moveTo(angle);
    },


    //开始游戏
    startGame:function(map)
    {
        this.snake = cc.instantiate(this.snakePrefab);
        this.snake.getComponent("Snake").initSnake({nikeName:"机器人"});
        this.snake.parent = map.node;
        this.gameStart = true ;
    },
});

module.exports = GameControl ;