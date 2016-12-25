cc.Class({
    extends: cc.Component,

    properties: {
        angle:0,
        dtAngle:0, //每帧移动角度 和当前摇杆离中心位置有关 
        nipple:cc.Node,
        canvas:cc.Node,
        maxRange:100,
        lbl: {
            default: null,
            type: cc.Label
        },
    },

    onLoad: function () {
        this.canvas.on('touchstart',this.onTouchStart,this);
        this.canvas.on("touchmove",this.onTouchMove,this);
        this.canvas.on('touchend',this.onTouchEnd,this);
        this.canvas.on('touchcancel',this.onTouchEnd,this);
    },

    //touch start
    onTouchStart:function(event)
    {
        var touches = event.getTouches();
        var touchLoc = touches[0].getLocation();
        var loc = this.node.convertToWorldSpaceAR(cc.Vec2(0,0));
        var touchRangeX = Math.abs(loc.x -touchLoc.x)   ;
        var touchRangeY = Math.abs(loc.y -touchLoc.y)   ;
        if(touchRangeX > 83 || touchRangeY > 83)return ;
        this.ismove = true ;   
        this.endX = this.startX = this.nipple.x = 0;
        this.endY = this.startY = this.nipple.y = 0;
    },

    
      //touch move
    onTouchMove:function(event)
    {
        if(!this.ismove)return ;
        this.startX = this.endX ;
        this.startY = this.endY ;
        var touchs = event.getTouches();
        var touchLoc =  touchs[0].getLocation();
        var loc = this.node.convertToNodeSpaceAR(touchLoc);
        var len = Math.sqrt(loc.x*loc.x + loc.y*loc.y);
        var moveToX = loc.x; ;
        var moveToY = loc.y ;
        if(len >= this.maxRange) 
        {
            moveToX = loc.x * this.maxRange/len ;
            moveToY = loc.y * this.maxRange/len ;
        } ;
        this.endX = this.nipple.x = moveToX ;
        this.endY = this.nipple.y = moveToY ;
        var startAng = Math.atan(this.startX/this.startY);
        if(this.startY === 0 && this.startX === 0) startAng = 0 ;
        this.angle = Math.atan2(this.endY,this.endX)/Math.PI * 180;
        // if(this.angle < 0)
        // {
        //     this.angle += 360 ;
        // }
        this.lbl.string = "x: " + Math.round(this.endX)+"y: " + Math.round(this.endY) + "angle: " + Math.round(this.angle) ;
        this.control.moveTo(this.angle);
    },

    //touchEnd
    onTouchEnd:function()
    {
        this.startX = 0 ;
        this.startY = 0 ; //不再像目标输出偏移角度
        this.endX = 0 ;
        this.endY = 0 ;
        this.easeInPlay();
        this.ismove = false ;   
    },

    easeInPlay:function()
    {
        this.nipple.x = 0 ;
        this.nipple.y = 0 ;
    }
});
