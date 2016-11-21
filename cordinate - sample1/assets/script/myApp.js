cc.Class({
    extends: cc.Component,

    properties: {
        ServerState : {
            default : null,
            type : cc.Label,
        },
        background : {
            default: null,
            type: cc.Node,
        },
        otherHero : {
            default: null,
            type : cc.Prefab,
        },
        
        radio : 2,
        
        myID: 0,
        
        
        userList: []
    },
    
    _drawUser : function(posX,posY,user){
         var otherhero = cc.instantiate(this.otherHero);
         this.background.addChild(otherhero, user.userID, user.userID);
         otherhero.setPosition(posX,posY);
    },

    // use this for initialization
    onLoad: function () {
        let self = this;
        
        if(cc.sys.isNative){
            window.io = SocketIO;
        }
        else{
            require('socket.io');
        }
        
        socket = io('http://localhost:3000');
        
        //begin---------------登录处理-----------------------//
        
        socket.on('connected',function(data){
            self.myID = data.userID;                //存入自己的ID
            self.ServerState.string = 'your ID: ' + data.userID;
            self.userList = data.userList;          //获取原有用户列表
            
            for(var user of self.userList){         //画到背景
                if(user == undefined) continue;
               self._drawUser(688,-504,user);
            }
        });
        
        //end-----------------登录处理-----------------------//
        
        
        //begin-----------------新增处理-----------------------//
        
        socket.on('newUser',function(data){
            self.ServerState.string = 'new user: ' + data.userID;
            self.userList.push(data);               //加到列表
            self._drawUser(688,-504,data);          //画到背景
        });
        
        //end-------------------新增处理-----------------------//
        
        //end-------------------离开处理-----------------------//
        
        socket.on('userLeave',function(data){
            self.ServerState.string = 'user leave: ' + data.userID;
            delete self.userList[data.userID];      //从列表删除
           self.background.removeChildByTag(data.userID); //从背景移除
           
        });
        
        //end-------------------离开处理-----------------------//
        
        //begin-------------------移动发出处理-----------------------//
        
            var myUtil = require('myUtil');
            var util = new myUtil();
            
            var myGround = this.background.getComponent('myGround');
            var curTileX = myGround.curTileX;
            var curTileY = myGround.curTileY;
            
            
            
            
            self.node.on('myClick',function(event){

                //console.log(event);
                socket.emit('move',{
                    userID : self.myID,
                    curTileX: curTileX,
                    curTileY: curTileY,
                    newPos: util.convertTo45(event.detail)
                });
            });
            
        
        //end---------------------移动发出处理-----------------------//
        
        //begin-------------------移动收到处理-----------------------//
        
            
            
            socket.on('move',function(data){
                    var target = self.background.getChildByTag(data.userID).getComponent('myOtherHero');
                    //var target = self.background.getChildByTag(data.userID).getComponent('myHero');
                    var Path = util.convertToPath(data.newPos,data.curTileX,data.curTileY);
                    var asc = [];
                    
                    console.log(target);
                    target.path = Path;
                    
                    for(var dir of Path){
                        asc.push(cc.callFunc(target.toWalk,target));
                        //asc.push(cc.callFunc(target.toWalk,target));
                        asc.push(cc.moveBy(
                            self.radio * ((dir.dx != 0) && (dir.dy != 0) ? 1.4 : 1) / 10, 
                            (dir.dy+dir.dx)*32, 
                             (dir.dx-dir.dy)*24
                        ));
                    }
                    
                    asc.push(cc.callFunc(target.toStand,target));
                    
                    target.node.runAction(cc.sequence(asc));
               
            });
            
        
        //end---------------------移动收到处理-----------------------//
        
        
         
         
        
        
        
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
