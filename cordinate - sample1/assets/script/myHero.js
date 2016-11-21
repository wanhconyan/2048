cc.Class({
    extends: cc.Component,

    properties: {
       
        StandAnimName : '',
        WalkAnimName : '',
        curDir : '',
        

    },
    
    toStand: function(){
        this.getComponent(cc.Animation).play(this.StandAnimName + this.curDir);
    },
    
    toWalk: function(dir){
        //console.log(dir);
        if(dir == this.curDir) return;
        this.curDir = dir;
        this.getComponent(cc.Animation).play(this.WalkAnimName + dir);
    },
    // use this for initialization
    onLoad: function () {

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
