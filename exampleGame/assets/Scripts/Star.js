cc.Class({
    extends: cc.Component,

    properties: {
        pickRadius:0,
    },
    

      update: function (dt) {
        // 每帧判断和主角之间的距离是否小于收集距离
        if (this.getPlayerDistance() < this.pickRadius) {
            // 调用收集行为
            this.onPicked();
            return;
        }
         var opacityRatio = 1 - this.game.timer/this.game.starDuration;
        var minOpacity = 50;
        this.node.opacity = minOpacity + Math.floor(opacityRatio * (255 - minOpacity));
        
    },

    
   getPlayerDistance: function () {
        // 根据 player 节点位置判断距离
        var playerPos = this.game.player.getPosition();
        // 根据两点位置计算两点之间距离
        var dist = cc.pDistance(this.node.position, playerPos);
        return dist;
    },

    onPicked: function() {
        // 当星星被收集时，调用 Game 脚本中的接口，生成一个新的星星
        this.game.spawnNewStar();
        // 然后销毁当前星星节点
        this.node.destroy();
        this.game.gainScore();
    },

    // },
});
