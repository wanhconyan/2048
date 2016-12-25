cc.Class({
    extends: cc.Component,

    properties: {
       
       
    },

    // use this for initialization
    onLoad: function () {
        this.node.on('touchstart',this.onTouchStart,this);
        this.node.on('touchend',this.onTouchEnd,this);
        this.node.on('touchcancel',this.onTouchEnd,this);
    },

    onTouchStart:function()
    {
        this.node.scaleX = this.node.scaleY = 0.9;

    },

     onTouchEnd:function()
    {
        this.node.scaleX = this.node.scaleY = 1;

    }

    
});
