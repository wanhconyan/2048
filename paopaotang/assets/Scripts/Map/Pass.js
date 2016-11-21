const MapNode = require("MapNode");
cc.Class({
    extends: cc.Component,

    properties: {
        mapNode:cc.Prefab ,
        pass: 0 
    },

    // use this for initialization
    onLoad: function () {
            this.passes = [
            [
            [2,2,2,4,4,4,4,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,3,5,5,3,2,2,2],
            [2,2,2,4,4,4,4,2,2,2]
        ],
        [
            [2,2,2,4,4,4,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,4,4,4,2,2,2]
        ],
        [
            [2,2,2,4,4,4,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,5,5,4,2,2,2],
            [2,2,2,4,4,4,4,2,2,2]
        ]
        ]
        this.nodes = [];
    },

    //手动创建tileMap背景层
    initTitleByPass:function(pass,node)
    {
        let passInfo = this.passes[pass];
        let len = passInfo.length ;
        for(var i = 0 ; i < len ; i ++)
        {
            let leng = passInfo[i].length ;
            for(var j = 0 ; j < leng ; j ++)
            {
                var mapNode = cc.instantiate(this.mapNode);
                mapNode.parent = node ;
                var nodeCode = mapNode.getComponent("MapNode");
                nodeCode.setStyle(passInfo[j][i]);
                nodeCode.setPostion(i,j);
                // this.nodes[i][j] = mapNode ;
            }
        }
    }
});
