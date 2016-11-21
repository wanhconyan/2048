cc.Class({
    extends: cc.Component,

    properties: {
        bagUI:
        {
            default:null  ,
            type:
        }
    },

    // use this for initialization
    onLoad: function () {

    },
    
    backHome:function()
    {
         if (this.curPanel === PanelType.Shop) {
            this.shopUI.hide();
            this.curPanel = PanelType.Home;
        }
    }

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
