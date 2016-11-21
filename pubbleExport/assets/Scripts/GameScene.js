const RestartUI = require('RestartUI');
const Direction = cc.Enum({
    UP: 1,
    DOWM:2,
    LEFT:3,
    RIGHT:4
});
cc.Class({
    extends: cc.Component,
    properties: {
      score:
        {
            default:null,
            type:cc.Label,
        },
        numNode: cc.Prefab,
        preX:1,
        preY:1,
        nextX:1,
        nextY:1,
        minDistance : 5 ,
        posx:-226,
        posy:308,
        nodeList:[],
        row:[],
        col:[],
        noneStateList:[],
        maxLevel:1 ,// iconNode maxium num 
        scoreNum:0,
        restartUI:RestartUI,
        flag:false,
        // 
    },

    

    // use this for initialization
    onLoad: function () {
       this.node.on('touchstart', this.onTouchDown, this);
        this.node.on('touchend', this.onTouchUp, this);
        this.node.on('touchcancel', this.onTouchUp, this);
        this.startGame();
    },
    
    //触摸开始
    onTouchDown:function(event)
    {
         this.preX = event.touch.getLocation().x ;
         this.preY = event.touch.getLocation().y ; 
    },
    
    //触摸结束
    onTouchUp:function(event)
    {
      this.nextX = event.touch.getLocation().x ;
      this.nextY = event.touch.getLocation().y ; 
      this.doMove();
    },

    //移动小节点
    doMove:function()   
    {
        var moveOffsetX = this.nextX - this.preX ;
        var moveOffsetY = this.nextY - this.preY ;
       if(Math.abs(moveOffsetX) < this.minDistance && Math.abs(moveOffsetY) < this.minDistance)
        {
             cc.log("move so near !");
             return;
        } 
        if(Math.abs(moveOffsetX) > Math.abs(moveOffsetY))
        {
            moveOffsetX > 0 ? this.move(Direction.RIGHT):this.move(Direction.LEFT);
        }else
        {
            moveOffsetY > 0 ? this.move(Direction.UP):this.move(Direction.DOWM); 
        }
    },


    //生成一个随机数字点
    gernationRandomIconNodeByLevel:function(level)
    {
        var len = this.noneStateList.length ;
        if(len === 0)
        {
            this.restartUI.show();
            return ;
        }
        var randomIndex = Math.floor(Math.random() * len); 
        console.log(randomIndex);
        var iconNode = this.noneStateList[randomIndex];
        var numNodeCode = iconNode.getComponent("NumNode");
        numNodeCode.init(level); //随机设置一个
        this.noneStateList.splice(randomIndex, 1);
    },


    //初始化显示对象
    startGame:function()
    {
        var nodeIndex = 0 ;
        for(let i = 0 ; i < 4 ; i ++)
        {   
            this.row[i] = [];
            for(let j = 0 ; j < 4 ; j ++)
            {
                nodeIndex = i *4 + j ;
                let obj = cc.instantiate(this.numNode);
                var numNodeCode = obj.getComponent("NumNode");
                this.row[i][j] = obj;
                obj.parent = this.node ;
                numNodeCode.resetPostion(i,j);
                numNodeCode.game = this;
                this.nodeList[nodeIndex] = obj;
                this.noneStateList[nodeIndex] = obj ;
            }
         }

         this.gernationRandomIconNodeByLevel(1);
         this.gernationRandomIconNodeByLevel(1);
    },

    // restart game
    reStart:function()
    {
        for(let i = 0 ; i < 4 ; i ++)
        {   
            for(let j = 0 ; j < 4 ; j ++)
            {
                var nodeIndex = i *4 + j ;
                let obj = this.nodeList[nodeIndex];
                var numNodeCode = obj.getComponent("NumNode");
                numNodeCode.clearState();
                this.noneStateList[nodeIndex] = obj ;
            }
         }
        this.gernationRandomIconNodeByLevel(1);
        this.gernationRandomIconNodeByLevel(1);
        this.score.string = "score:0";
        this.scoreNum = 0 ;
        this.restartUI.hide();
    },
    
    
     //combine iconNode 
    move:function(direction)
    {   
        this.flag = false; 
        var moveTarget= this.getMoveTarget();
        var loop = this.getLoopParams(direction);
        var uloop = loop.u;
        var vloop = loop.v;
        for(var i = 0 ; i < 4 ; i ++)
        {
            var u = uloop[i];
            for(var j = 0 ; j < 4 ; j ++)
            {
              var v = vloop[j];
              var node = moveTarget[u][v];
              var nodeCode = node.getComponent("NumNode");
              nodeCode.move(direction);
            }
        }
         for(var i = 0 ; i < 4 ; i ++)
        {
            var u = uloop[i];
            for(var j = 0 ; j < 4 ; j ++)
            {
              var v = vloop[j];
              var node = moveTarget[u][v];
              var nodeCode = node.getComponent("NumNode");
              nodeCode.move(direction);
            }
        }
        for(var i = 0 ; i < 4 ; i ++)
        {
            var u = uloop[i];
            for(var j = 0 ; j < 4 ; j ++)
            {
              var v = vloop[j];
              var node = moveTarget[u][v];
              var nodeCode = node.getComponent("NumNode");
              nodeCode.move(direction);
            }
        }
        if(this.flag)
        {
            this.collectNodeState();
            var level = this.getNextInconLelevel();
            this.gernationRandomIconNodeByLevel(level);
        }
         if(this.noneStateList.length === 0)
        {
            cc.director.loadScene("NewGame");//结束面板
        }
    },

    //获取一个移动对象
    getMoveTarget:function()
    {
        return this.row ;
    },

    combineNode:function(node,nextNode)
    {
        // return fasle;
        var nodeCode = node.getComponent("NumNode");
        var  combineBool ;
        if(nodeCode)
        {
             combineBool = nodeCode.combineNode(nextNode);
        }
        var nextNodeCode = node.getComponent("NumNode");
        if(combineBool === 1 || combineBool === 0)
        {
            this.scoreNum = combineBool === 1? this.scoreNum + 1 : this.scoreNum ;
            this.flag = true ;
        }
      this.score.string = "score:" + this.scoreNum ; //合并成功 ＋score 
    },


    collectNodeState:function(node)
    {
        this.noneStateList = [];
         for(var i = 0 ; i < 4 ; i ++)
         {
            for(var j = 0 ; j < 4 ; j ++)
            {
              var node = this.row[i][j];
              var nodeCode = node.getComponent("NumNode");
              if(nodeCode.num == 0)
              {
                  this.noneStateList.push(node);
              } 
            }
        }
       
    },

    getLoopParams:function(direction)
    {
        var result = {};
        var uloop = [];
        var vloop = [];
        for(var i = 0 ; i < 4 ; i++)
        {
            uloop[i] = i ;
            vloop[i] = i ;
        }
        if(direction === Direction.UP)
        {
            vloop = vloop.reverse();
        }
        if(direction === Direction.LEFT)
        {
            uloop = uloop.reverse();
        }
        result.u = uloop ;
        result.v = vloop ;
        return result ;
    },

    getNextInconLelevel:function()
    {
        var result = 2; 
        return result ;
    },


    getNodeByUV:function(u ,v)
    {
        var nodeIndex = u *4 + v ;
        let obj = this.nodeList[nodeIndex];
        return obj ;
    },

  
    // 获取移动方向
    getMoveVect:function(direction)
    {
        return direction ==1 ? {x:0,y:-1} : (direction ==2 ? {x:0,y:1} : (direction == 3 ? {x:-1,y:0}:{x:1,y:0}));
    }
});
