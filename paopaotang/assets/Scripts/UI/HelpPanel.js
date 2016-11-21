cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // use this for initialization
    onLoad: function () {

    },

    startGame:function()
    {
        cc.director.loadScene("GameView");
    },
});
