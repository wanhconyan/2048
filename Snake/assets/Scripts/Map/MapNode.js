cc.Class({
    extends: cc.Component,

    properties: {
        defH:80,
        defW:160,
        stageX:0,
        stageY:0
    },


    onLoad: function () {

    },


    //设置位置
    setPostion:function(i,j)
    {
      this.node.x = ~~(i * this.defW + this.stageX + this.defW/2) ;
      this.node.y= ~~(j * this.defH + this.stageY + this.defH/2) ;
      console.log(this.node.x , this.node.y);
    },

    show:function()
    {
        this.node.active = true ;
    },

    hide:function()
    {
        this.node.active = false;
    }


});
