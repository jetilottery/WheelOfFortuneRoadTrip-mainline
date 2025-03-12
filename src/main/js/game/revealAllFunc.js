/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer'
], function (msgBus, gr) {

    function revealAll() {
        msgBus.publish('startReveallAll');
        msgBus.publish('disableUI');
    }

    msgBus.subscribe('clickedAllSymbol', function () {
        gr.lib._buttonAutoPlay.show(false);

    });
    msgBus.subscribe('stopRevealAll', function(){
        gr.lib._buttonAutoPlay.show(true);
    });

    return {
        revealAll:revealAll
    };
});