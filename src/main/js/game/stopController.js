
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/configController'
], function (msgBus, audio, gr, SKBeInstant, gameUtils, gladButton, loader, config) {
 var stopButton;   
//    var count = 0;
//    var total = 0;
    var openedAllSymbols = false;
    
    function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        gr.lib._stopText.autoFontFitText = true;
        gr.lib._stopText.setText(loader.i18n.Game.button_stop);
        
        stopButton = new gladButton(gr.lib._buttonStop, "buttonCommon", scaleType);
        stopButton.show(false);
        stopButton.click(function(){
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            stopButton.show(false);
            if(!openedAllSymbols){
                msgBus.publish('stopRevealAll');
                msgBus.publish('enableUI');
            }
        });
    }
    
    function startUserInteraction(){
        openedAllSymbols = false;
        stopButton.show(false);
    }
    
    function onClickedAllSymbol() {
        openedAllSymbols = true;
        stopButton.show(false);
    }
    
    function startReveallAll(){
        stopButton.show(true);
    }
    
    
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', startUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', startUserInteraction);
    msgBus.subscribe('startReveallAll', startReveallAll);
    msgBus.subscribe('clickedAllSymbol', onClickedAllSymbol);
});


