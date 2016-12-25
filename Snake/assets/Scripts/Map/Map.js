cc.Class({
    extends: cc.Component,

    properties: {
        mapNode:cc.Prefab,
        canvas:cc.Node,
        maxCol:50,
        maxRaw:100,
        nodeWith:160,
        nodeHeight:80,
    },


    onLoad: function () {
        console.log(this.canvas.width,this.canvas.height);
        this.stageWidth = this.canvas.width ;
        this.stageHeight = this.canvas.height ;
        this.nodes = [] ;
        this.renderRaw = this.getEven((this.stageWidth / this.nodeWith >> 0) + 1) ;
        this.renderCol = this.getEven((this.stageHeight / this.nodeHeight >> 0) + 1);
        this.stageX =  - this.stageWidth / 2 ;
        this.stageY =  - this.stageHeight / 2 ;
        for(var i = 0 ; i < this.renderRaw ; i ++)
        {
            for(var j = 0 ; j < this.renderCol; j ++)
            {
                var mapNode = cc.instantiate(this.mapNode);
                mapNode.parent = this.node ;
               var nodeCode =  mapNode.getComponent("MapNode");
               nodeCode.stageX = this.stageX ;
               nodeCode.stageY = this.stageY ;
                this.nodes.push(nodeCode);
               nodeCode.setPostion(i,j);
            }
        }
    },

    //获取一个偶数
    getEven:function(num)
    {
       return  num % 2 === 0 ? num : num + 1 ;
    },


    //移动到某一位置 渲染地图
    moveTo:function(x,y)
    {
        this.node.x = x ;
        this.node.y = y ;
        var pos =  this.getCenter(x,y);
        this.renderMap(pos.x,pos.y);
    },


    //获取中心点坐标
    getCenter:function(x,y)
    {  
        var posx = x % this.nodeWith;
        var posy = y % this.node.nodeHeight ;

        return {x:posx,y:posy};
    },

    //平铺地图个字
    renderMap:function(raw ,col)
    {
        this.clear();
        var halfRaw = this.renderRaw >> 1;
        var halfCol = this.renderCol >> 1;
        var index = 0 ;
        for(var i = -halfRaw ; i < halfRaw ; i ++)
        {
            for(var j = -renderCol ; j < renderCol ; j ++)
            {
                var offsetx = i + raw ;
                var offsety = j + col ;
                if(offsetx < -1||offsetx > this.maxRaw+1)continue;
                if(offsety < -1||offsety > this.maxCol+1)continue;
                this.nodes[index].setPostion(offsetx,offsety);
                index ++ ;
            
            }
        }



    }
});
