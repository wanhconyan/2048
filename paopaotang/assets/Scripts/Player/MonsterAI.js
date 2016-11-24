const AStar = require("AStar");
const STATE = cc.Enum(
    {   
        MOVE:1,
        PUTBOMB:2,
        KILL:3,
        COLLECT:4
    })
cc.Class({
    extends: cc.Component,

    properties: {
        map:[],// 地图数据
        astar:AStar,
        renderTime:0,
        maxRenderTime:0.5,
        state:""
    },

    onLoad: function () {
        this.monstercode = this.node.getComponent("Monster");
        this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
        this.moveComplete = false ;
    },


    //ai 循环
    update:function(dt)
    {   
        // console.log("update monsterAi" + dt)
        if(this.renderTime >= this.maxRenderTime)
        {
            if(this.path && this.path.length > 0)
            {
                var walkNode = this.path.shift(); 
                this.renderTime = 0 ;
                this.move(walkNode);
                return ;
            }else
            {
                this.putBomb();
                this.renderTime = 0  ;
                this.getRandomMovePos();
            }
        }
        this.renderTime += dt ;

    },

    //搜索舞台上所有的事件 优先度 躲避，攻击, 收集，
    findAllEvent:function()
    {   


    },

    

    doSomeThing:function()



    //怪物移动
    move:function(node)
    {
        if(!node)
        {
            console.log("move complete!") ;
            return ;
        }
        var direction = 1 ;
        direction = this.getDirection(node);
        this.monstercode.moveTo(node.r,node.c,direction)
    },


    //获取下一步行走方向
    getDirection:function(node)
    {
        var  i = this.monstercode.i;
        var  j = this.monstercode.j; 
        var offsetX = node.r - i ;
        var offsetY = node.c - j ;
        var direction = 1 ;
        for( i = 1 ; i <= 4 ; i ++)
        {
            var walk = this.walks[i];
            if(walk[0] === offsetX && walk[1] === offsetY)
            {
                direction = i ; 
            }
        }
        return direction ;
    },

    //放置炸弹
    putBomb:function()
    {   
        this.aiProxy.putBomb(2);// 怪物放置炸弹
    },

    //获取一个随机可行走位置
    getRandomMovePos:function()
    {
        if(!this.astar)
        {
            // console.log("astar is null");
            return ;
        }
        if(!this.map)
        {
            this.map = this.aiProxy.game.blockLayer.blocks ;
        }
        this.astar.generateMap(this.map);
        this.walkNodes = this.astar.walkAbleNodes ;
        var len = this.walkNodes.length ;
        var randomLen = Math.floor(Math.random()*len);
        var node = this.walkNodes[randomLen];
        console.log("getRandomMovePos"+node.r,node.c);
        this.path = this.astar.findPath([this.monstercode.i,this.monstercode.j],[node.r,node.c]);
        // this.path = this.astar.findPath([this.monstercode.i,this.monstercode.j],[1,0]);
    }
});
