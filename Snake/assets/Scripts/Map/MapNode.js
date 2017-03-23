cc.Class({
    extends: cc.Component,

    properties: {
        defH:80,
        defW:160,
        nodeState:
        {
            default:null,
            type:cc.Label
        }
    },


    onLoad: function () {
    },


    //设置位置
    setPostion:function(i,j,index)
    {
      this.node.x =  i * this.defW;
      this.node.y=   j * this.defH;
      this.nodeState.String = i + ":" + j ;
      console.log(this.node.x , this.node.y);
    },
});
