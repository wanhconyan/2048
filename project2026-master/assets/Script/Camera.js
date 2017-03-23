cc.Class({
    extends: cc.Component,

    properties: {
        target: {
            default: null,
            type: cc.Node
        },

        map: {
            default: null,
            type: cc.Node
        }
    },

    // use this for initialization
    onLoad: function () {
        let winSize = cc.winSize;
        this.screenMiddle = cc.v2(winSize.width/2, winSize.height/2);

        this.boundingBox = cc.rect(0,0, this.map.width,this.map.height);

        this.minx = -(this.boundingBox.xMax - winSize.width);
        this.maxx = this.boundingBox.xMin;
        this.miny = -(this.boundingBox.yMax - winSize.height);
        this.maxy = this.boundingBox.yMin;
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        let pos = this.node.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let targetPos = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
        let dif = pos.sub(targetPos);

        let dest = dif.add(this.screenMiddle);

        dest.x = cc.clampf(dest.x, this.minx, this.maxx);
        dest.y = cc.clampf(dest.y, this.miny, this.maxy);

        this.node.position = this.node.parent.convertToNodeSpaceAR(dest);
    },
});
