cc.Class({
    extends: cc.Component,

    properties: {
        starPrefab:
        {
            default:null,
            type:cc.Prefab,
        },
        maxStarDuration:0 ,
        minStarDuration:0,
        ground:
        {
                default :null ,
                type:cc.Node ,
        },
        
        player:{
            default:null,
            type:cc.Node,
        },
        score:
        {
            default:null,
            type:cc.Label,
        }
    },

    // use this for initialization
     onLoad: function () {
        // 获取地平面的 y 轴坐标
        this.timer = 0 ;
        this.scoreNum = 0;
        this.starDuration = 0 ;
        this.groundY = this.ground.y + this.ground.height/2;
        // 生成一个新的星星
        this.spawnNewStar();
       
        
    },

    spawnNewStar: function() {
        // 使用给定的模板在场景中生成一个新节点
        var newStar = cc.instantiate(this.starPrefab);
        // 将新增的节点添加到 Canvas 节点下面
        this.node.addChild(newStar);
        // 为星星设置一个随机位置
        newStar.setPosition(this.getNewStarPosition());
        newStar.getComponent("Star").game = this;
        
        this.scoreNum = 0;
        this.starDuration  = this.minStarDuration + cc.random0To1() * (this.maxStarDuration - this.minStarDuration);
       
       this.timer = 0 ;
    },

    getNewStarPosition: function () {
        var randX = 0;
        // 根据地平面位置和主角跳跃高度，随机得到一个星星的 y 坐标
        var randY = this.groundY + cc.random0To1() * this.player.getComponent('Player').jumpHeight + 50;
        // 根据屏幕宽度，随机得到一个星星 x 坐标
        var maxX = this.node.width/2;
        randX = cc.randomMinus1To1() * maxX;
        // 返回星星坐标
        return cc.p(randX, randY);
    },
    
    gainScore:function()
    {
        this.scoreNum ++ ;
        
        this.score.string =  "score:" + this.scoreNum.toString();
        console.log(this.scoreNum);
        
    },
    
    update:function(dt)
    {
            if(this.timer > this.starDuration)
            {
                this.gameOver();
                return ;
                
            }
            this.timer += dt ;
    },
    
    gameOver:function()
    {
        this.player.stopAllActions(); //停止 player 节点的跳跃动作
        cc.director.loadScene('game');
        
    }
});
