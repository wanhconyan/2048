cc.Class({
    extends: cc.Component,

    properties: {
       blockTile:cc.Prefab
    },

    // use this for initialization
    onLoad: function () {

    },

    initPass:function(currentPass)
    {
        if(!this.passNode)
        {
            this.blockTile = cc.instantiate(this.blockTile);
            this.blockTile.parent = this.node ;
        }
        var blockTileCode = this.blockTile.getComponent("BlockTile");
        blockTileCode.initBlockByPass(currentPass,this.node);
    }
});
