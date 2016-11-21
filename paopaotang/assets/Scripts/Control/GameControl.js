const HelpPanel = require('HelpPanel');
const StartGame = require('StartGame');
cc.Class({
    extends: cc.Component,

    properties: {
     helpPanel:
     {
         type:HelpPanel,
         default:null,
     },
       startGame:
     {
         type:StartGame,
         default:null,
     },
    },

    // use this for initialization
    onLoad: function () {
        this.startGame.gameControl = this ;
        this.helpPanel.node.active = false ;
        this.startGame.node.active = true ;
    },

    showHelpPanel:function()
    {
        this.helpPanel.node.active = true ;
        this.startGame.node.active = false ;
    }
});
