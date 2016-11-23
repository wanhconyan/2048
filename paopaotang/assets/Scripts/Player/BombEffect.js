cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    

    onLoad: function () {

    },

  
    //在i,j节点生产一个type类型的炸弹
    initBoom:function(i,j,type)
    {
        this.i = i ;
        this.j = j ;
        this.node.x = this.defX + this.i * this.boomWidth ;
        this.node.y = this.defY - this.j * this.boomWidth ;
        console.log("bomb"+this.node.x,this.node.y,i,j);
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
});
