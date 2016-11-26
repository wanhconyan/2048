const Map = require("Map");
const TYPE = cc.Enum(
    {
        PLAYER:1,
        MONSTER:2
    })
cc.Class({
    extends: cc.Component,

    properties: {
        playerPrefab:cc.Prefab,
        bombPrefab:cc.Prefab,
        monsterPrefab:cc.Prefab,
        effectPrefab:cc.Prefab,
        maxLen:10,
        level:1,
        game:Map
    },
    

    onLoad: function () {
        if(!this.revivePos )
        {
             this.revivePos = [
            [9,9],[9,9],[9,9],[9,9],[9,9],[9,9]
            ];
            this.walks= [[],[0,1],[0,-1],[-1,0],[1,0]];
            this.monsterPos = [[0,0],[0,0],[0,0],[0,0],[0,0]];
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

      //初始化敌人
    initMonster:function(i,j,url)
    {
        this.monsterpos = [i, j];
        this.monster = cc.instantiate(this.monsterPrefab);
        this.monster.parent = this.node ;
        this.monster.on("loadComplete",this.loadMonsterComplete,this);
        this.monsterCode = this.monster.getComponent("Monster");
        this.monsterCode.initMonsterWithUrl(url);
        this.monsterAi = this.monster.getComponent("MonsterAI");
        this.monsterAi.astar = this.game.astar ;
        this.monsterAi.map = this.game.blockLayer.blocks ;
        this.monsterAi.aiProxy = this ;
    },
    
    
    loadComplete:function()
    {
        var self = this ;
        var direction = 1 ;
        self.playerCode.moveTo(self.revive[0],self.revive[1],direction);
        
    },

    loadMonsterComplete:function()
    {
        var self = this ;
        var direction = 1 ;
        self.monsterCode.moveTo(self.monsterpos[0],self.monsterpos[1],direction);
        
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
    initPass:function(currentPass,url,map)
    {   
        this.game =map ;
         if(!this.revivePos )
        {
             this.revivePos = [
            [9,9],[9,9],[9,9],[9,9],[9,9]
            ];
            this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
            this.monsterPos = [[0,0],[0,0],[0,0],[0,0],[0,0]];
        }
        var pos = this.revivePos[currentPass];
        this.level = currentPass ; 
        var monsterPos = this.monsterPos[currentPass];
        this.initPlayer(pos[0],pos[1],"");
        this.initMonster(monsterPos[0],monsterPos[1],"");
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
        this.blocks = this.game.blockLayer.blocks ;
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
    putBomb:function(type)
    {
        var targetCode  ;
        var target ;
        var i ;
        var j  ;
        if(type == TYPE.PLAYER)
        {
            target = this.player ;
            targetCode = this.playerCode ;
            i = this.playerCode.i ;
            j = this.playerCode.j ;
        }
        if(type == TYPE.MONSTER)
        {
            target = this.monster ;
            targetCode = this.monsterCode ;
            i = this.monsterCode.i ;
            j = this.monsterCode.j ;
        }
        if(!this.blocks)
        {
            this.blocks = this.game.blockLayer.blocks ;
        }
        if(this.blocks[i] && this.blocks[i][j])
        {
            return ;
        }
        var bomb = cc.instantiate(this.bombPrefab);
        var bombCode = bomb.getComponent("Bomb");
        bomb.parent = this.node ;
        bomb.emiter = target ;
        bomb.on("boomRound",this.boomRound,this)
        bombCode.initBombWith(targetCode.i,targetCode.j,0);
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
        this.bombEveryThing(round) ; //炸毁周围对象
        this.blocks[bombCode.i][bombCode.j] = null; 
    },

    //炸毁攻击范围内的节点
    bombEveryThing:function(round)
    {
        for(var i = 0 ; i < round.length ; i ++ )
        {
            var pos = round[i];
            var oi = pos[0] ;
            var oj = pos[1];
            if(this.blocks[pos[0]] && this.blocks[pos[0]][pos[i]])
            {
                var code = this.blocks[pos[0]][pos[i]] ;
                // if(code is BombEffect)
                code.bomb();
            }
            if(oi < 0 || oi > this.maxLen || oj > this.maxLen || oj < 0)
            {
                continue ;
            }
            var effect = cc.instantiate(this.effectPrefab);
            var effectCode = effect.getComponent("BombEffect");
            effect.parent = this.node ;
            effectCode.initBomb(oi,oj,0);
        }
    }
    
});
