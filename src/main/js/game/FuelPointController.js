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
    var cents = 6000;
    var ticks = 120;
//    var fuelPointOrigin = {};
    
    function calculateFuelPoints(pricePoint){
       return pricePoint/50;
    }
    
    function onGameParametersUpdated(){
        var style = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI / 6, dropShadowAlpha:0.5, dropShadowBlur:5};
        
        if (SKBeInstant.config.customBehavior) {
            if(SKBeInstant.config.customBehavior['scene' + 1 + 'Cents']){
                cents = SKBeInstant.config.customBehavior['scene' + 1 + 'Cents'];
                ticks = cents/50;
            }
        }else if (loader.i18n.gameConfig) {
            if(loader.i18n.gameConfig['scene' + 1 + 'Cents']){
                cents = loader.i18n.gameConfig['scene' + 1 + 'Cents'];
                ticks = cents/50;
            }
        }
        
        gameUtils.setTextStyle(gr.lib._fuel_Text, style);
        gr.lib._fuel_Text.autoFontFitText = true;
        gr.lib._des_0_text.autoFontFitText = true;
        setFuelText(calculateFuelPoints(SKBeInstant.config.gameConfigurationDetails.pricePointGameDefault));        
//        setOringin();        
    }
    
    function setFuelText(currentPoint){
        gr.lib._fuel_Text.setText(currentPoint);
        var des0 = loader.i18n.Game.win_up_to_des0;
        gr.lib._des_0_text.setText(des0.replace('{fuelNum}',currentPoint)); 
    }
    
    function onTicketCostChanged(prizePoint){
        var currentPoint = calculateFuelPoints(prizePoint);
        setFuelText(currentPoint);
//        ticksUpdate(currentPoint, ticks);
    }
    
    function playAnim(){
        gr.lib._ticketCostFuelMeterPointer.gotoAndPlay('How-To-Play-Fuel-Meter_Pointer_Anim',0.3,true);
    }
    function stopAnim(){
        gr.lib._ticketCostFuelMeterPointer.stopPlay();
    }
    
//    function setOringin(){
//        if (fuelPointOrigin.top === undefined) {
//            fuelPointOrigin.top = gr.lib._ticketCostFuelMeterPointer._currentStyle._top;
//        }
//        if (fuelPointOrigin.left === undefined) {
//            fuelPointOrigin.left = gr.lib._ticketCostFuelMeterPointer._currentStyle._left;
//        }        
//    }
    
//    function ticksUpdate(currentTicks, sceneTicks) {
//        setOringin();
//        var rotate;
//        if (currentTicks >= sceneTicks) {
//            rotate = 90;
//        } else {
//            rotate = 90 * currentTicks / sceneTicks;
//        }
////        var moveTop, moveLeft;
//        var pivotX = gr.lib._ticketCostFuelMeterPointer._currentStyle._width / 2;
//        var pivotY = gr.lib._ticketCostFuelMeterPointer._currentStyle._height / 2;
//        var originX = pivotX + fuelPointOrigin.left;
//        var originY = pivotY + fuelPointOrigin.top;
//        
//        var newX = originX - (pivotX - Math.cos(rotate * Math.PI / 180) * pivotX);
//        var newY = originY - Math.sin(rotate * Math.PI / 180) * pivotX;
//        var newLeft = newX - pivotX;
//        if(newLeft<18){
//            newLeft = 18;
//        }
//        var newTop = newY - pivotY;
//        if(newTop<60){
//            newTop = 60;
//        }
//
//        gr.lib._ticketCostFuelMeterPointer.updateCurrentStyle({'_left': newLeft, '_top': newTop, '_transform': {'_rotate': (360 - rotate)}});
//    }
    
    
    msgBus.subscribe('jLottery.initialize', playAnim);
    msgBus.subscribe('jLottery.reInitialize', playAnim);
    msgBus.subscribe('jLottery.reStartUserInteraction', stopAnim);
    msgBus.subscribe('jLottery.startUserInteraction', stopAnim);
    msgBus.subscribe('playerWantsPlayAgain', playAnim);

    msgBus.subscribe('ticketCostChanged',onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);

    return {};
});
