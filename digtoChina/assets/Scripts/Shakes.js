cc.Class({
    extends: cc.Component,

    properties: {
       flag:false
    },

    // use this for initialization
    onLoad: function () {

    },
    
    update: function (dt) {
        this.flag = !this.flag ;
        if(this.flag)
        {
            this.node.x += 0.5 ;
            this.node.y += 2 ;
        }else
        {
             this.node.x -= 0.5 ;
            this.node.y -= 2 ;
        }
    },
});
