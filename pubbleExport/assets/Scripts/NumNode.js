const GameScene = require("GameScene");
cc.Class({
    extends: cc.Component,

    properties: {
        num:1, // 标记使用哪一个spriteFrame
        state:1, //定义当前格子是否显示 并确定当前格子是否是合法个字
        icon:cc.Sprite,
        spriteFrames:
        {
            default:[],
            type:cc.SpriteFrame
        },
        lbl_num:
        {
            default:null,
            type:cc.Label
        },
        posx:-200,// default position x 
        posy:278, // default position y 
        iconSize:140, //default size 
        game:GameScene,
        u:1, // get arround iconnode  by uv position
        v:1 // get arround iconnode  by uv position
    },

    //加载完成
    onLoad: function () {
       this.clearState();
    },


    // initilize state , label value
    init:function(num)
    {
        if(num === 0)
        {
          return ;
        }
        this.num = num ;
        this.state = 1 ;
        this.node.active = true ;
        // this.icon.spriteFrame.setTexture(().texture) ;
        this.lbl_num.string = Math.pow(2,num).toString();
        this.icon.spriteFrame = this.spriteFrames[num]
    },

    //clear default state , current show
    clearState:function()
    {
        this.num = 0 ;
        this.state = 0 ;
        this.node.active = false ;
        this.lbl_num.string = "" ;
    },

    //reset position 
    resetPostion:function(i,j)
    {
        this.node.x =  this.posx + i * this.iconSize ;
        this.node.y =  this.posy - j * this.iconSize ;
        this.u = i ;
        this.v = j ; 
    },

    //组合节点
    combineNode:function(node)
    {
        if(node === null || node === this)
        {
            return false;
        }
        var nodeCode = node.getComponent("NumNode") ;
        console.log("u:" + this.u + "v:" + this.v + "num:" + this.num);
        console.log("nu:" + nodeCode.u + "nv:" + nodeCode.v + "nnum:" + nodeCode.num);
        if(nodeCode.num === this.num && this.num !== 0)
        {
            console.log("equal"+nodeCode.num);
            nodeCode.init(this.num + 1)
            this.clearState();
            return 1 ;
        }
        if(nodeCode.num === 0 && this.num !== 0)
        {
            console.log("pass"+nodeCode.num);
            nodeCode.init(this.num);
            this.clearState();
            return 0 ;
        }
        if(nodeCode.num !== this.num)
        {
            return -1;
        }
    },

    //移动位置
    move:function(direction)
    {
        if(this.num == 0) //当前格子数为0 时不移动
        {
            return ;
        }
        var nextNode = this.getNextNode(direction); 
        if(nextNode)
        {
            this.game.combineNode(this,nextNode);
        }   
        this.direction = direction ;
    },



    //获取当前方向中下一个节点
    getNextNode:function(direction)
    {
        let moveDir = this.game.getMoveVect(direction);
        var nextU = this.u + moveDir.x ;
        var nextV = this.v + moveDir.y ;
        if(nextU < 0 || nextV < 0 || nextU > 3 || nextV > 3)
        {
          return null;
        }
        var nextNode = this.game.getNodeByUV(nextU,nextV);   
        return  nextNode ;
    },
});
