cc.Class({
    extends: cc.Component,

    properties: {
        
        curTileX : 12,
        curTileY : 42,
       
        
        finalList : [],
        
        radio : 1,
        
        hero: {
            default: null,
            type: cc.Node,
        },
        
        curTileXY: {
            default: null,
            type: cc.Label,
        },
        
        curTileForeName : '当前坐标: ',

    },
    

    
    
    toMove : function(){
         if(this.finalList.length == 0){
             this._standHero();
             //this.hero.getComponent('myHero').toStand();
             return;
         }
        var dir = this.finalList.shift();
        

         
        this.curTilePosX = dir.dx;
        this.curTilePosY = dir.dy;
        this.curTileXY.string = this.curTileForeName + this.curTilePosX + ',' + this.curTilePosY;
        //console.log(this.curTilePosX + ' ' + this.curTilePosY);
        //this._moveHero(dir.dx, dir.dy);
        //this.hero.getComponent('myHero').toWalk(dir.dx + '' + dir.dy);
        
        //Begin-----------------------_moveBackground--------------------------//
        this.node.runAction(
            cc.sequence(
                
                cc.callFunc(this._moveHero(dir.dx, dir.dy),this),
                cc.moveBy(
                    this.radio * ((dir.dx != 0) && (dir.dy != 0) ? 1.4 : 1) / 10, 
                    -(dir.dx+dir.dy)*32, 
                     (dir.dy-dir.dx)*24
                ),
                cc.callFunc(this.toMove,this)
            )
            
        );
        
        //this._moveBackground(dir.x,dir.y);
        //End-----------------------_moveBackground----------------------------//
        
        
    
    },
    
    
    // _moveBackground : function(dx,dy){
    //     this.node.runAction(
    //         cc.sequence(
                
    //             cc.callFunc(this._moveHero(dx, dy),this),
    //             cc.moveBy(
    //                 this.radio * ((dx != 0) && (dy != 0) ? 1.4 : 1), 
    //                 -(dx+dy)*32, 
    //                  (dy-dx)*24
    //             ),
    //             cc.callFunc(this.toMove,this)
    //         )
            
    //     );
    // },

    _moveHero : function(dx,dy){
        this.hero.getComponent('myHero').toWalk(dx + '' + dy);
    },
    
    _standHero : function(){
        this.hero.getComponent('myHero').toStand();
    },
    

    // use this for initialization
    onLoad: function () {
        
        var self = this;
        
        var myUtil = self.getComponent('myUtil');
        
        
        this.node.on('mouseup', function(event){
            
            var myevent = new cc.Event.EventCustom('myClick',true);
            myevent.setUserData(event);
            
            this.node.dispatchEvent(myevent);
            
            self.finalList = [];
            self.finalList = myUtil.convertToPath(myUtil.convertTo45(event),self.curTileX,self.curTileY);
            //this.toMoveOnce();
            this.toMove();
        },this);
        
        
        
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

        
    // },
});
