cc.Class({
    extends: cc.Component,

    properties: {
      
    },

    // use this for initialization
    onLoad: function () {

    },

       //创建以key为截点的动画
    createAnimationClips:function(key,frameCount)
    {
        var frame = [];
        for(var i = 1; i <= frameCount ; i ++)
        {
            // console.log(key);
            var spriteFrame =  this.heroAtlas.getSpriteFrame(key +"_"+ i);
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
            this.createAnimationClips(key,6);
        }
        this.animation.play(key);
    },
});
