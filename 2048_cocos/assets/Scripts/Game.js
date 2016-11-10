cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    // use this for initialization
    onLoad: function () {

    },
    
    //开始游戏
    startGame:function()
    {
        cc.director.loadScene("MainPanel");
    }
});
