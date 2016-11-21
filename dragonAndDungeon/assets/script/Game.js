cc.Class({
    extends: cc.Component,

    properties: {
        btn_start:
        {
            default:null,
            type:cc.Button,
        }
    },

    // use this for initialization
    onLoad: function () {
        
    },

    //游戏开始
    playGame:function()
    {
        cc.director.loadScene("CastleView");
    },
});
