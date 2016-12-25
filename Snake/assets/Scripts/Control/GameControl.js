const Nipple = require("Nipple");
cc.Class({
    extends: cc.Component,

    properties: {
        nipple:Nipple,
        btnAcc:cc.Button,
        snake:cc.Node,
    },

    
    onLoad: function () {
        var nippleCode = this.nipple.getComponent("Nipple");
        nippleCode.control = this ;
    },


    moveTo:function(angle)
    {
        var code = this.snake.getComponent("Snake");
        code.moveTo(angle);
    
    }
});
