const Grid = require("Grid");
cc.Class({
    extends: cc.Component,

    properties: {
        vistedNum:0,
        visited:[],
        maxX:10,
        maxY:10,
        maps:[],
        close:[],
        open:[],
        around:[[0,-1],[1,0],[-1,0],[0,1]] //四方向
    },


    onLoad: function () {

    },

    //查找路径
    findPath:function(start,end)
    {
        var path = [] ;
        this.start = start ;
        this.end = end; 
        this.vistedNum = 0 ;
        this.visited = [];
        this.start.f = this.start.g = this.start.h = 0 ;




        
        

        return path ;
    },






    euclidian:function(grid)
    {
        var disX = this.end.x - grid.x ;
        var disY = this.end.y - grid.y ;
        return (disX * disX + disY*disY);
    },

    diagonal:function(grid)
    {
        var disX = this.end.x - grid.x ;    
        var dixY = this.end.y - grid.y ;         
        if(disX < 0) disX *= -1 ;
        if(disY < 0) disY *= -1 ;
        var min  = disX < disY ? disX : disY ;
        return min * Math.SQRT2 + (disX + disY - 2*min);
    },



});
