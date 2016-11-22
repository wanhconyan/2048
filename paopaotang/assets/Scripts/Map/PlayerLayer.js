cc.Class({
    extends: cc.Component,

    properties: {
        playerPrefab:cc.Prefab,
        bombPrefab:cc.Prefab,
        maxLen:10 
    },
    

    onLoad: function () {
        if(!this.revivePos )
        {
             this.revivePos = [
            [9,9],[9,9],[9,9],[9,9],[9,9],[9,9]
            ];
            this.walks= [[],[0,1],[0,-1],[-1,0],[1,0]];
        }
    },

    //初始化玩家
    initPlayer:function(i,j,url)
    {
        this.revive = [i, j];
        this.player = cc.instantiate(this.playerPrefab);
        this.player.parent = this.node ;
        this.player.on("loadComplete",this.loadComplete,this);
        this.playerCode = this.player.getComponent("Player");
        this.playerCode.initPlayerWithUrl(url);
    },
    
    loadComplete:function()
    {
        var self = this ;
        var direction = 1 ;
        self.playerCode.moveTo(self.revive[0],self.revive[1],direction);
        
    },


    //获取角色复活点
    getOriginPosition:function(i,j)
    {
        var pos = {x:0,y:0 } ;
        pos.x = this.playerCode.defX + i * this.player.width ;
        pos.y = this.playerCode.defY - j * this.player.height ;
        return pos ;
    },

    //初始化玩家位置
    initPass:function(currentPass,url)
    {   
         if(!this.revivePos )
        {
             this.revivePos = [
            [9,9],[9,9],[9,9],[9,9],[9,9]
            ];
            this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
        }
        var pos = this.revivePos[currentPass];
        this.initPlayer(pos[0],pos[1],"");
    }, 

    //移动玩家到某个点
    moveTo:function(direction,blocks)
    {
        this.blocks = blocks ;
        if(this.checkWalkAble(direction))
        {
            this.playerCode.move(direction);
        }else
        {
            this.playerCode.changeDirection(direction);
        }
    },

    checkWalkAble:function(direction)
    {
        var walk = this.walks[direction];
        var offsetx = this.playerCode.i  + walk[0] ;
        var offsety =  this.playerCode.j  + walk[1] ;
        if(offsetx >= this.maxLen || offsety >= this.maxLen ||offsetx< 0 || offsety < 0 )
        {
            return false ;
        }
        if(this.blocks[offsetx]&& !this.blocks[offsetx][offsety] || !this.blocks[offsetx] )
        {
            return true ;
        }
        return false ;
        
    },

    //放置炸弹
    putBomb:function()
    {
        var i = this.playerCode.i;
        var j = this.playerCode.j ;
        if(this.blocks[i] && this.blocks[i][j])
        {
            return ;
        }
        var bomb = cc.instantiate(this.bombPrefab);
        var bombCode = bomb.getComponent("Bomb");
        bomb.parent = this.node ;
        bomb.on("boomRound",this.boomRound)
        bombCode.initBombWith(this.playerCode.i,this.playerCode.j,0);
        if(!this.blocks[i])
        {
            this.blocks[i] = [];
        }
        this.blocks[i][j] = bombCode;
    },

    //爆炸范围
    boomRound:function(event)
    {
        console.log("bombRound");
        var boom = event.target ;
        var bombCode = boom.getComponent("Bomb");
        bombCode.bomb();
        var round = bombCode.getBoomRound();
        var boomCenter = [bombCode.i,bombCode.j];
        this.bombEveryThing(round) ; //
    },

    //炸毁攻击范围内的节点
    bombEveryThing:function(round)
    {
        for(var i = 0 ; i < round.length ; i ++ )
        {
            var pos = round[i];
            if(this.blocks[pos[0]] && this.blocks[pos[0]][pos[i]])
            {
                var code = this.blocks[pos[0]][pos[i]] ;
                code.bomb();
            }

        }

    }
    
});
