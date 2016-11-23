const RewardType = cc.Enum({

});
cc.Class({
    extends: cc.Component,

    properties: {
        pos:
        {
            type:cc.Label,
            default:null            
        },
        rewardType:-1,
        defX:-270,
        defY:361,
        defW:60,
        defH:60,
    },

    // use this for initialization
    onLoad: function () {
        var sprite = this.getComponent(cc.Sprite);
        if(sprite.spriteFrame)
        {
            this.resize(sprite.spriteFrame.getRect()); 
        }
        this.animation = this.getComponent(cc.Animation);
        this.animation.on("stop",this.playEffectComplete,this)
    },

    //砖块被炸 通过奖励类型判断是否生成奖励物品，和奖励物品的种类
    boomBlock:function(rewardType)
    {

        if(rewardType != -1)
            this.gernateReward(rewardType);
        else
            this.node.active = false;    
    },

    playEffectComplete:function()
    {
        this.animation.node.active = false ;
    },

    //生成奖励
    gernateReward:function(reward)
    {


    },    

    bomb:function()
    {
        console.log("block is bombed")

    },

    //播放爆炸特效
    playBombEffect:function()
    {
        var animation = this.getComponent(cc.Animation);
        animation.active = true ;
        cc.loader.loadRes("Map/block/bomb", cc.SpriteAtlas, (err, atlas) => {
        var spriteFrames = atlas.getSpriteFrames();
        
        var clip = cc.AnimationClip.createWithSpriteFrames(spriteFrames, 12);
        clip.name = 'run';
        clip.wrapMode = cc.WrapMode.Default;
        animation.addClip(clip);
        animation.play('run');
        });
    },

    //吃掉当前格子中的奖励 并销毁对象
    biteReward:function()
    {
        this.node.active = false; 
    },

    //设置格子样式，并为格子设置格子碰撞体积
    setBoxStyle:function(style)
    {
        let self = this ;
        var sprite = self.getComponent(cc.Sprite);
        cc.loader.loadRes("Map/block/block", cc.SpriteAtlas, function (err, atlas) {
        var frame = atlas.getSpriteFrame('box'+style);
        sprite.spriteFrame = frame;
        });
       
       
    },


    //设置位置
    setPostion:function(i,j)
    {
      this.node.x = i * this.defW + this.defX ;
      this.node.y= -j * this.defH + this.defY ;
      this.pos.string = i + "," + j ;
    },

});
