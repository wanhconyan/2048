cc.Class({
    extends: cc.Component,

    properties: {
        pressendScale:1.2,
        transDuration:0
    },

    onLoad: function () {
        var self = this ;
        self.initScale = this.node.scale;
        self.button = self.getComponent(cc.Button);
        self.scaleDownAction = cc.scaleTo(self.transDuration,self.pressendScale);
        self.scaleUpAction = cc.scaleTo(self.transDuration,self.initScale);
        function onTouchDown(event)
        {
            this.stopAllActions();
            this.runAction(self.scaleDownAction);
        }
        function onTouchUp(event)
        {
            this.stopAllActions();
            this.runAction(self.scaleUpAction);
        }
        this.node.on("touchstart",onTouchDown,this.node);
        this.node.on("touchend",onTouchUp,this.node);
        this.node.on("touchcancel",onTouchUp,this.node);

    },
});
