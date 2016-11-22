
const DIRECTION = cc.Enum({
    UP:1,
    DOWN:2,
    LEFT:3,
    RIGHT:4
});
cc.Class({
    extends: cc.Component,

    properties: {
       direction:cc.Integer,
       speed:1,
       i:0,
       j:0,
    },

    // use this for initialization
    onLoad: function () {
        this.defX = -264 ;
        this.defY =  380 ;
        this.defW =  66 ;
        this.defH =  76 ;
        this.heroAtlas = {};
        this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
        this.action = ["","hero_up","hero_down","hero_right","hero_left"];
    },

    //移动
    move:function(i,j,direction)
    {
        var walk = this.walks[direction];
        var offsetx = walk[0] ;
        var offsety = walk[1] ;
        this.i += walk[0] ;
        this.j += walk[1] ;
        this.node.x = this.defX + this.i * this.defW ;
        this.node.y = this.defY - this.j * this.defH ;
        var key = this.action[direction];
        this.play(key);
        console.log("pos"+this.node.x ,this.node.y);

    },

    //放置炸弹
    putBomb:function()
    {


    },

    //被攻击
    beAttack:function()
    {



    },

    //骑乘坐起
    ridingMount:function(type)
    {


    },

    //使用物品
    useItem:function()
    {
        

    },


    //更换皮肤
    initPlayerWithUrl:function(url)
    {
        let self = this ;
        if(url == undefined || url == "")
        {
            url = "Hero/heroAltas" ;
        }
        self.animation = this.getComponent(cc.Animation);
        self.animation.active = true ;
        cc.loader.loadRes(url, cc.SpriteAtlas, (err, atlas) => {
        self.heroAtlas = atlas ;
        this.play("hero_up");
     });

    },

    //创建以key为截点的动画
    createAnimationClips:function(key,frameCount)
    {
        var frame = [];
        for(var i = 1; i <= frameCount ; i ++)
        {
            console.log(key);
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
