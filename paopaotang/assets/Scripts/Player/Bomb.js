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
       bombTime:4,//爆炸事件
    },

    
    onLoad: function () {
        this.types = ["Hero/bomb","Hero/bomb","Hero/bomb","Hero/bomb1","Hero/bomb1","Hero/bomb1"];
    },



    //在i,j节点生产一个type类型的炸弹
    initBombWith:function(type)
    {
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
            console.log(key);
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
        if(!this.animation._nameToState[key])
        {
            this.createAnimationClips(key,4);
        }
        this.animation.play(key);
    },


    //爆炸 并通知爆炸范围
    bombThisMine:function()
    {
        var round = this.getBoomRound();
        this.node.emit(BoomEvent.BOOM_ROUND,round)
    },

    //获取爆炸范围
    getBoomRound:function()
    {
        var round = [];

        return round;
    }
});
