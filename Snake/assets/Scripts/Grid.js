cc.Class({
    extends: cc.Component,

    properties: {
         nodeWidth:50,
         nodeHeight:50,
         raw:100,
         col:100,
    },

    // use this for initialization
    onLoad: function () {
        this.initGrid();
    },
    
    

   
});
