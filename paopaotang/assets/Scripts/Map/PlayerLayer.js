cc.Class({
    extends: cc.Component,

    properties: {
        playerPrefab:cc.Prefab,
        bombPrefab:cc.Prefab,
    },
    

    onLoad: function () {
        if(!this.revivePos )
        {
             this.revivePos = [
            [10,9],[10,9],[10,9],[10,9],[10,9]
            ];
        }
    },

    //初始化玩家
    initPlayer:function(i,j,url)
    {
        this.player = cc.instantiate(this.playerPrefab);
        this.player.parent = this.node ;
        this.playerCode = this.player.getComponent("Player");
        this.playerCode.initPlayerWithUrl(url);
        var pos = this.getOriginPosition(i,j);
        this.player.x = pos.x ;
        this.player.y = pos.y ;
    },


    //获取角色复活点
    getOriginPosition:function(i,j)
    {
        var pos = {x:0,y:0 } ;
        pos.x = this.player.defX + i * this.player.width ;
        pos.y = this.player.defY + j * this.player.height ;
        pos.x = 0 ;
        pos.y = 0 ;
        return pos ;
    },

    //初始化玩家位置
    initPass:function(currentPass,url)
    {   
         if(!this.revivePos )
        {
             this.revivePos = [
            [10,9],[10,9],[10,9],[10,9],[10,9]
            ];
        }
        var pos = this.revivePos[currentPass];
        this.initPlayer(pos[0],pos[1],"");
    }, 

    //移动玩家到某个点
    moveTo:function(i,j,direction)
    {
        this.playerCode.move(i,j,direction);
    },

    //放置炸弹
    putBomb:function()
    {
        var bomb = cc.instantiate(this.bombPrefab);
        var bombCode = bomb.getComponent("Bomb");
        bomb.parent = this.node ;
        bomb.x = 40 ;
        bomb.y = 40 ;
        bombCode.initBombWith(this.playerCode.i,this.playerCode.j,0);
    }

    
});
