/**
 * @module game/winUpToController
 * @description WinUpTo control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils'
], function (msgBus, gr, loader, SKBeInstant,gameUtils) {
    function onGameParametersUpdated(){
        var style = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI / 6, dropShadowAlpha:0.5, dropShadowBlur:5};

        gameUtils.setTextStyle(gr.lib._winUpToText, style);
        gr.lib._winUpToText.autoFontFitText = true;
        gr.lib._winUpToText.setText(loader.i18n.Game.win_up_to);

        gameUtils.setTextStyle(gr.lib._winUpToValue, style);
        gr.lib._winUpToValue.autoFontFitText = true;
        
        gr.lib._des_1_text.autoFontFitText = true;
        gr.lib._des_1_text.setText(loader.i18n.Game.win_up_to_des1);  
        gr.lib._des_2_text.autoFontFitText = true;
        gr.lib._des_2_text.setText(loader.i18n.Game.win_up_to_des2);  
        
    }
    
    function onTicketCostChanged(prizePoint) {
        var rc = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        for (var i = 0; i < rc.length; i++) {
            if (Number(prizePoint) === Number(rc[i].price)) {
                var ps = rc[i].prizeStructure;
                var maxPrize = 0;
                for (var j = 0; j < ps.length; j++) {
                    var prize = Number(ps[j].prize);
                    if (maxPrize < prize) {
                        maxPrize = prize;
                    }
                }
                gr.lib._winUpToValue.autoFontFitText = true;
                gr.lib._winUpToValue.setText(SKBeInstant.formatCurrency(maxPrize).formattedAmount + loader.i18n.Game.win_up_to_mark);
                return;
            }
        }
    }

   msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});