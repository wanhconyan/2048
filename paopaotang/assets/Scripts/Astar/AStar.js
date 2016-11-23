cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
        this.endNode = {} ;
        this.startNode = {} ;
        this.map = {};
        this.around = [[0,-1],[1,0],[-1,0],[0,1]] //查找四方向上最优解四方向

    },

    //查找路径
    findPath:function(start,end,map)
    {
        this.endNode = this.getNode(end[0],end[1],0);
        this.endNode.c = end[1];
        var node = this.startNode = this.getNode(start[0],start[1],0);
        this.generateMap(map);
        this.openList = [];
        this.closeList = [] ;

        openList.push(node);
        closeList.push(node);
        while(node != endNode)
        {
            var bestNode = this.getBestNode(node);
            if(!bestNode.isOpen)
            {
                path.shift();
                bestNode = this.getBestNode(node.parentNode);
                if(bestNode)
                {
                    closeList.push(bestNode);
                    bestNode.isOPen = false;
                }
            }
            if(node != startNode)
            {
                bestNode.parentNode = node ;
            }
            path.push(bestNode);
            node = bestNode ;
            openList.push(node);
            if(!node)
            {
                return path;
            }
        }
        return path ;
    },


    //获取最佳节点
    getBestNode:function($node)
    {
        if($node)
        {
            return null ;
        }
        var i = 0 ;
        var g = 0 ;
        var point = {};
        var node = {} ;
        var bestNodes = [];
        while(i < 4)
        {
            point = this.around[i];
            g = this.getDistance(point);
            node = this.getNode($node.r+point.x ,$node.c+point.y,$node.g + g)
            if(node)
            {
                bestNodes.push(node);
            }
            i ++ ;
        }
        bestNodes.sort(function(a,b)
        {
            return a.f > b.f ;

        });
        node = bestNodes.shift();
        return node;
    },

    //生成搜索地图
    generateMap:function(blocks)
    {

        for(var i = 0 ; i < 10 ; i ++)
        {
            for(var j = 0; j < 10 ; j ++)
            {
                var node = {} ;
                node.r = i ; 
                node.c = j ;
                node.parentNode = null ;
                node.isOPen = true;
                node.walkAble = !blocks[i]||!blocks[i][j] // 当节点不存在时 可行走
            }
        }

    },


    //获取A* 逻辑 节点
    getNode:function(r,c,g)
    {
        var node = this.map[r][c];
        node.g = g ;
        var h = Math.abs(this.end.r - node.r) *10 + Math.abs(this.end.c-node.c)*10 ;
        node.h = h  ;
        if(node.isOpen)
        {
            return null ;
        }
        if(!node.walkAble)
        {
            return null;
        }
        return node ;
    },

    //获取节点长度
    getDistance:function(point)
    {
        var distance = Math.SQRT2( point[0] * point[0]+point[1] * point[1])*10 > 0;
        console.log("distance"+distance);
        return distance ;
    }


});
