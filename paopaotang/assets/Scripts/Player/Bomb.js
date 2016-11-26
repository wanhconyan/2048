const BoomEvent = cc.Enum({
    BOOM_ROUND:"boomRound",
    BOOM_OVER:"boomOver"
});
cc.Class({
    extends: cc.Component,

    properties: {
       attackRound:1,
       bombEffect:
       {
           type:cc.Animation,
           default:null
       },
       i : 0 ,
       j : 0 , 
       bombTime:3000,//爆炸事件
       boomWidth:60
    },

    
    onLoad: function () {
        this.defX = -264 ;
        this.defY =  380 ;
        this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
        this.types = ["Hero/bomb","Hero/bomb","Hero/bomb","Hero/bomb1","Hero/bomb1","Hero/bomb1"];
    },



    //在i,j节点生产一个type类型的炸弹
    initBombWith:function(i,j,type)
    {
        this.i = i ;
        this.j = j ;
        this.node.x = this.defX + this.i * this.boomWidth ;
        this.node.y = this.defY - this.j * this.boomWidth ;
        // console.log("bomb"+this.node.x,this.node.y,i,j);
        let self = this ;
        var url = this.types[type];
        self.animation = this.getComponent(cc.Animation);
        self.animation.active = true ;
        cc.loader.loadRes(url, cc.SpriteAtlas, (err, atlas) => {
        self.heroAtlas = atlas ;
        this.play("bomb");
     });

    },

    //创建以key为截点的动画
    createAnimationClips:function(key,frameCount)
    {
        var frame = [];
        for(var i = 1; i <= frameCount ; i ++)
        {
            var spriteFrame =  this.heroAtlas.getSpriteFrame(key + i);
            frame.push(spriteFrame);
        }
        var clip = cc.AnimationClip.createWithSpriteFrames(frame,frameCount);
        clip.name = key ;
        clip.wrapMode = cc.WrapMode.Loop;
        this.animation.addClip(clip);
    },

    //播放相应动画
    play:function(key)
    {
        var self = this ;
        if(!this.animation._nameToState[key])
        {
            this.createAnimationClips(key,4);
        }
        this.animation.play(key);
        setTimeout(self.bombThisMine,2000,this) ;//问题 使用申明的参数回导致下一次的延迟时间为0 
    },


    //爆炸 并通知爆炸范围
    bombThisMine:function(target)
    {
        target.node.emit(BoomEvent.BOOM_ROUND)
    },


    //播放爆炸特效
    playBoomEffect:function()
    {
            

    },

    dispose:function()
    {
        // this.destory();
    },

    bomb:function() //该写个基类 所有可以被伤害的对象都继承此对象
    {
        this.node.active =  false;
        this.dispose();
    },


    //获取爆炸范围
    getBoomRound:function()
    {
        var round = [];
        for(var i = 1 ; i <= this.attackRound ; i ++)
        {
            for(var j = 1 ; j <= 4 ; j ++)
            {
                var walk = this.walks[j];
                var m = this.i + walk[0]* i 
                var n = this.j + walk[1]* i ;
                if(m != 0 && n != 0 || m < 10 && n < 10)
                {
                    round.push([m,n]);
                }
            }
        }
        return round;
    }
});
