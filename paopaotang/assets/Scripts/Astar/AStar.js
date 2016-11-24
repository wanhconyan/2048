cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
        this.endNode = {} ;
        this.startNode = {} ;
        this.map = {};
        this.around = [[0,-1],[1,0],[-1,0],[0,1]] //查找四方向上最优解四方向
        this.walkAbleNodes = [];

    },

    //查找路径
    findPath:function(start,end,map)
    {
        this.endNode = this.getNodeByRW(end[0],end[1]) ;
        this.startNode = this.getNodeByRW(start[0],start[1]) ; 
        var node = this.startNode ;
        if(map === undefined)
        {
            map = this.game.blockLayer.blocks ;
            this.generateMap(map);
        }
        this.openList = [];
        this.closeList = [] ;
        var path = [];

        this.openList.push(node);
        this.closeList.push(node);
        // while(node != this.endNode)
         while(node.c !=  this.endNode.c || node.r != this.endNode.r)
        {
            var bestNode = this.getBestNode(node);
            if(bestNode && !bestNode.isOpen)
            {
                path.shift();
                bestNode = this.getBestNode(node.parentNode);
                if(bestNode)
                {
                    this.closeList.push(bestNode);
                    bestNode.isOpen = false;
                }
            }
            try {
                if(node != this.startNode)
                {
                    bestNode.parentNode = node ;
                }
                console.log("最佳点"+bestNode.r,bestNode.c+"结束点"+this.endNode.r,this.endNode.c)
            } catch (error) {
                console.log("findPath error!")
            }
          
            path.push(bestNode);
            node = bestNode ;
            this.openList.push(node);
            if(!node)
            {
                return path;
            }
            if(path.length > 100)
            {
                return null;
            }
        }
        return path ;
    },


    //获取最佳节点
    getBestNode:function($node)
    {
        if(!$node)
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
            node = this.getNode($node.r+point[0] ,$node.c+point[1],$node.g + g)
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
            this.map[i] = [] ;
            for(var j = 0; j < 10 ; j ++)
            {
                var node = {} ;
                node.r = i ; 
                node.c = j ;
                node.g = 0 ;
                node.h = 0;
                node.f = 0 ;
                node.parentNode = null ;
                node.isOpen = true;
                node.walkAble = !blocks[i]||!blocks[i][j] // 当节点不存在时 可行走
                this.map[i][j] = node ;
                if(node.walkAble)
                {
                    this.walkAbleNodes.push(node);
                }
            }
        }

    },


    //获取rc节点
    getNodeByRW:function(r,c)
    {
        return this.map[r][c];
    },


    //获取A* 逻辑 节点
    getNode:function(r,c,g)
    {   
        if(!this.map[r] || !this.map[r][c])
        {
            return null;
        }
        var node = this.map[r][c] ;
        node.g = g ;
        var h = Math.abs(this.endNode.r - node.r) *10 + Math.abs(this.endNode.c-node.c)*10 ;
        node.h = h  ;
        node.f = node.g + node.h;
        if(!node.isOpen)
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
        var distance = Math.sqrt( point[0] * point[0]+point[1] * point[1])*10 >> 0;
        return distance ;
    }


});
