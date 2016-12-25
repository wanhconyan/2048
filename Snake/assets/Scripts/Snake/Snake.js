const Global = require("Global");
cc.Class({
    extends: cc.Component,
    properties: {
        angle:0.0,
        snakeHead:cc.Prefab,
        canvas:cc.Node,
        lbl: {
            default: null,
            type: cc.Label
        }
        
        
    },

    
    onLoad: function () {
        this.head = cc.instantiate(this.snakeHead);
        this.head.parent = this.canvas ;
        this.headCode = this.head.getComponent("SnakeHead");
        this.headCode.lbl = this.lbl;
    },
    
    
    moveTo:function(angle)
    {   
        this.headCode.moveTo(angle);
    },

    update:function(t)
    {
       

    }
    
    
    
});
