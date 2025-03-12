/**
 * @module game/revealAllButton
 * @description reveal all button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
	'skbJet/component/SKBeInstant/SKBeInstant',
    'game/configController',
    'game/revealAllFunc'
], function (msgBus, gr, loader, audio, gladButton, gameUtils, SKBeInstant, config, revealAllFunc) {

    var autoPlay;
    var autoPlayText;
    var enableAuto = true;
    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        autoPlay = new gladButton(gr.lib._buttonAutoPlay, config.gladButtonImgName.buttonAutoPlay, scaleType);
        autoPlay.click(revealClick);
        if (config.style.autoPlayText) {
            gameUtils.setTextStyle(gr.lib._autoPlayText, config.style.autoPlayText);
        }
        if (config.textAutoFit.autoPlayText){
            gr.lib._autoPlayText.autoFontFitText = config.textAutoFit.autoPlayText.isAutoFit;
        }
		if(SKBeInstant.isWLA()){
			autoPlayText = loader.i18n.MenuCommand.WLA.button_autoPlay;
		}else{
			autoPlayText = loader.i18n.MenuCommand.Commercial.button_autoPlay;
		}	
        gr.lib._autoPlayText.setText(autoPlayText);
        gr.lib._buttonAutoPlay.show(false);
    }
	
	function revealClick(){
		audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
		gr.lib._buttonAutoPlay.show(false);
		revealAllFunc.revealAll();
	}
	
    function showAutoRevell(){
        if (enableAuto) {
                gr.lib._buttonAutoPlay.show(true);
        } else {
            gr.lib._buttonAutoPlay.show(false);
        }
    }
    
    function onStartUserInteraction() {
        enableAuto = SKBeInstant.config.autoRevealEnabled === false? false: true;
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }
	
    function onReInitialize() {
        gr.lib._buttonAutoPlay.show(false);
    }

    function onReset() {
        onReInitialize();
    }
    
    function onAllRevealed(){
        gr.lib._buttonAutoPlay.show(false);
    }
        

    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('reset', onReset);
    msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('mapIsHide',function(){
        showAutoRevell();
    });
    msgBus.subscribe('mapIsShown',function(){
         gr.lib._buttonAutoPlay.show(false);
    });
     msgBus.subscribe('showGame',function(){
          showAutoRevell();
     });

    return {};
});