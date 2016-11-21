cc.Class({
    extends: cc.Component,

    properties: {
        pass:cc.Prefab,
    },

    // use this for initialization
    onLoad: function () {
        if(!this.passNode)
        {
            this.passNode = cc.instantiate(this.pass);
        }
        this.passNode.parent = this.node ;
    },

    //初始化关卡
    initPass:function(currentPass)
    {
        if(!this.passNode)
        {
            this.passNode = cc.instantiate(this.pass);
            this.passNode.parent = this.node ;
        }
        var passCode = this.passNode.getComponent("Pass");
        passCode.initTitleByPass(currentPass,this.node);
    }
});
