const Base = require("Base");
const Global = require("Global");
cc.Class({
    extends: Base,

    properties: {
       nikeName:
       {
           type:cc.Label,
           default:null
       }
    },

  
    onLoad: function () {
        this.toAngle = 0; 
        this.angle = 0 ;
        this.speed = 4 ;
    },

    moveTo:function(angle)
    {       
        this.directTo(angle);
    },


    directTo:function(angle) {
        if(angle <  0 )
        {
            angle = angle + 360 ;
        }
         this.toAngle = angle ;
    },


   // 根据蛇头角度计算水平速度和垂直速度
    velocity:function() {
        
        let angle = this.toAngle ;
        const radius = angle / 180 * Math.PI ;
        var vx = this.speed * Math.abs(Math.cos(radius));
        var vy = this.speed * Math.abs(Math.sin(radius));
        
        if(radius >= Math.PI/2 && radius < Math.PI)
        {
            vx = -vx ;
        }
        if(radius >= Math.PI && radius < Math.PI * 3 / 2)
        {
            vy = - vy ;
            vx = -vx ;
        }
        if(radius >= Math.PI * 3 /2 && radius < Math.PI * 2 )
        {
            vy = - vy ;
        }
       this.vx = vx ;
       this.vy = vy ;
    },


  turnAround:function() {
      
      let rotation = this.toAngle ;
      while(rotation < 0 )
      {
          rotation += 360 ;
      }
      
      if(rotation > 90 && rotation < 180)
      {
          rotation = rotation + 180 ;
      }
      if(rotation > 270 && rotation < 360)
      {
          rotation = rotation - 180 ;
      }

      this.node.rotation = rotation  ;
      console.log(rotation) ;
  },

    translateToSnakeCornate:function(angle)
    {
        

        return angle ;
    },

    update:function(t)
    {
        this.turnAround();
        this.velocity();
        this.node.x += this.vx ;
        this.node.y += this.vy ;
        console.log("snake:" + this.node.x,this.node.y);
    }
     
});
