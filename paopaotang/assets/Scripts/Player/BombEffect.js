cc.Class({
    extends: cc.Component,

    properties: {
        defX:-270,
        defY:361,
        defW:60,
        defH:60,
    },

    

    onLoad: function () {
        this.bombUrls = ["Hero/bombEffect"];
        this.bombType = ["center","center"];
    },

  
    //在i,j节点生产一个type类型的炸弹
    initBomb:function(i,j,type)
    {
        this.bombUrls = ["Hero/bombEffect"];
        this.bombType = ["center", "center"];
        this.i = i ;
        this.j = j ;
        var url = this.bombUrls[0];
        this.node.x = this.defX + this.i * this.defW ;
        this.node.y = this.defY - this.j * this.defH ;
        let self = this ;
        self.animation = this.getComponent(cc.Animation);
        self.animation.active = true ;
        cc.loader.loadRes(url, cc.SpriteAtlas, (err, atlas) => {
        self.heroAtlas = atlas ;
        var key = this.bombType[type];
        this.play(key);
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
        if(!this.animation._nameToState[key])
        {
            this.createAnimationClips(key,5);
        }
        this.animation.play(key);
        setTimeout(this.hideEffect, 2000,this);
    },


    //爆炸 并通知爆炸范围
    hideEffect:function(target)
    {
        target.node.active = false;
        var sprite = target.getComponent(cc.Sprite);
        sprite.node.active  = false ;
    },
});
