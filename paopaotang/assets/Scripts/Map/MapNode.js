cc.Class({
    extends: cc.Component,

    properties: {
        tileMapNode:
        {
            type:cc.Sprite,
            default:null 
        }, 
        defX:-270,
        defY:361,
        defW:60,
        defH:60,


    },
    onLoad: function () {

    },

    //设置位置
    setPostion:function(i,j)
    {
      this.node.x = i * this.defW + this.defX ;
      this.node.y= -j * this.defH + this.defY ;
    },


    //设置样式
    setStyle:function(style)
    {
        var sprite = this.getComponent(cc.Sprite);
        cc.loader.loadRes("Map/tile/tileAltas", cc.SpriteAtlas, function (err, atlas) {
        var frame = atlas.getSpriteFrame('node'+style);
        sprite.spriteFrame = frame;
        });
    }

});
