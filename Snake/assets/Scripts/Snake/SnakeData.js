var SnakeData = function()
{
    this.head = {} ;
    this.uid = 0 ;
    this.body = [];
    this.score = 0 ;
    this.fashion = 0 ;
    this.nikeName = "机器蛇" ;
    this.angle = 0 ;
    this.toAngle = 0 ;
    this.curTime = 0 ;
    this.createTime = 0 ;
    this.roomID = 0 ;
}
var TYPE = SnakeData.Type = cc.Enum({
	ROBOT: 0,
    PLAYER: 1
});
SnakeData.prototype.getSnakeDataByType =function()
{
        
    return {}; 
}
module.exports = SnakeData ;