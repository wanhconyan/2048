cc.Class({
    extends: cc.Component,

    properties: {
      lbl_pos:
      {
          type : cc.Label,
          default:null
      },
       direction:cc.Integer,
       speed:1,
       i:0,
       j:0,
    },

    // use this for initialization
    onLoad: function () {
        this.defX = -272 ;
        this.defY =  362 ;
        this.defW =  44 ;
        this.defH =  56 ;
        this.moveLen = 60 ;
        this.heroAtlas = {};
        this.walks= [[],[0,-1],[0,1],[-1,0],[1,0]];
        this.action = ["","monster_up","monster_down","monster_left","monster_right"];
    },

     moveTo:function(i,j,direction)
    {
        this.i = i ;
        this.j = j ;
        this.lbl_pos.string = i + "," + j ;
        this.changeDirection(direction);
        this.node.x = this.defX + this.i * this.moveLen ;
        this.node.y = this.defY - this.j * this.moveLen ;
        console.log("monster moveTo" + this.node.x,this.node.y ,this.i ,this.j);
    },

     changeDirection:function(direction)
    {
        var key = this.action[direction];
        this.play(key);
    },


      //更换皮肤
    initMonsterWithUrl:function(url)
    {
        let self = this ;
        if(url === undefined || url === "")
        {
            url = "Monster/monster1" ;
        }
        self.animation = this.getComponent(cc.Animation);
        self.animation.active = true ;
        cc.loader.loadRes(url, cc.SpriteAtlas, (err, atlas) => {
        self.heroAtlas = atlas ;
        this.node.emit("loadComplete"); //通知资源加载完成
        this.play("monster_down");
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
            this.createAnimationClips(key,5);
        }
        this.animation.play(key);
    },
});
