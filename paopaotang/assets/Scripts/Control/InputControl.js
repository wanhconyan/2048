cc.Class({
    extends: cc.Component,

    properties: {
       
    },

    // use this for initialization
    onLoad: function () {
        // this.blockNode = cc.instantiate(this.block);
        // this.blockNode.parent = this.node ;
        // this.blockNode.x = -280;
        // this.blockNode.y = -400 ;
    },

    // playEffect:function()
    // {
    //     var blockNode = this.blockNode.getComponent("Block");
    //     blockNode.playBombEffect(); 
    // }


    //移动玩家
    move:function(event,direction)
    {
        console.log(direction) ;
        this.game.move(direction);
    },

    //放置炸弹
    putBomb:function()
    {
        this.game.putBomb();
    }

    



    
});
