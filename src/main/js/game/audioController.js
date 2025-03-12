define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'game/configController',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader'
], function (msgBus, audio, gr, SKBeInstant, gladButton, config, loader) {
    var audioDisabled = false;
    var audioOn, audioOff;
    var playResult;
    var MTMReinitial = false;
	var popUpDialog = false;
	
	var hidden = false;
    var playResultAudio = false;

    function audioSwitch() {
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);
            audioDisabled = false;
        } else {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
            audioDisabled = true;
        }
        audio.muteAll(audioDisabled);
        audio.gameAudioControlChanged(audioDisabled);
    }

    function onConsoleControlChanged(data) {
        if (data.option === 'sound') {
            var isMuted = audio.consoleAudioControlChanged(data);
            if (isMuted) {
                gr.lib._buttonAudioOn.show(false);
                gr.lib._buttonAudioOff.show(true);
                audioDisabled = true;
            } else {
                gr.lib._buttonAudioOn.show(true);
                gr.lib._buttonAudioOff.show(false);
                audioDisabled = false;
            }
            audio.muteAll(audioDisabled);
        }
    }

    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
		if (SKBeInstant.config.customBehavior){ 
			if(SKBeInstant.config.customBehavior.enableAudioDialog === true || SKBeInstant.config.customBehavior.enableAudioDialog === "true" || SKBeInstant.config.customBehavior.enableAudioDialog === 1){
            popUpDialog = true;
			}
        }else if(loader.i18n.gameConfig){
			if(loader.i18n.gameConfig.enableAudioDialog === true || loader.i18n.gameConfig.enableAudioDialog === "true" || loader.i18n.gameConfig.enableAudioDialog === 1){
                popUpDialog = true;
            }
		}
        audioDisabled = SKBeInstant.config.soundStartDisabled;
		if( SKBeInstant.config.assetPack !== 'desktop' && popUpDialog){
			audioDisabled = true;
		}
        audioOn = new gladButton(gr.lib._buttonAudioOn, config.gladButtonImgName.buttonAudioOn, scaleType);
        audioOff = new gladButton(gr.lib._buttonAudioOff, config.gladButtonImgName.buttonAudioOff, scaleType);
        if (audioDisabled) {
            gr.lib._buttonAudioOn.show(false);
            gr.lib._buttonAudioOff.show(true);
        }else{
            gr.lib._buttonAudioOn.show(true);
            gr.lib._buttonAudioOff.show(false);            
        }
		audio.muteAll(audioDisabled);
        audioOn.click(audioSwitch);
        audioOff.click(audioSwitch);
    }

    function onStartUserInteraction(data) {
        playResult = data.playResult;
        if(SKBeInstant.config.gameType === 'normal'){
            audio.stopChannel(6); //stop BGMusicLoop
            audio.play('MapLevelLoop', 2, true);
        }
    }

    function onEnterResultScreenState() {
		if (hidden) {
            playResultAudio = true;
        } else {
            playResultAudio = false;
            audio.play('ExitMusicLoop1',10,true);
            audio.fadeOut(10,13000);
		}
    }

    function onReStartUserInteraction(data) {
        playResult = data.playResult;
        audio.stopChannel(6); //stop BGMusicLoop
        audio.play('MapLevelLoop', 2, true);
    }

    function reset() {
        audio.stopAllChannel();
    }
    
    function onReInitialize(){
        audio.stopAllChannel();
        if (MTMReinitial) {
            audio.play('BGMusicLoop', 6, true);
            MTMReinitial = false;
        }
    }
    
    function onPlayerSelectedAudioWhenGameLaunch(data) {
        if (popUpDialog) {
            audioDisabled = data;
            audioSwitch();
        }else{
             audio.muteAll(audioDisabled);
        }

        if (SKBeInstant.config.gameType === 'ticketReady') {
            gr.getTimer().setTimeout(function () {
                audio.play('MapLevelLoop', 2, true);
            }, 0);
        } else {
            gr.getTimer().setTimeout(function () {
                audio.play('BGMusicLoop', 6, true);
            }, 0);
        }
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
    
    function onPlayerWantsPlayAgain(){
        audio.cancelFade(10);
        audio.stopChannel(10);//stop ExitMusicLoop1
        audio.play('BGMusicLoop', 6, true);
    }
    
   
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLotterySKB.onConsoleControlChanged', onConsoleControlChanged);
    msgBus.subscribe('jLotterySKB.reset', reset);
//    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('audioPlayer.playerSelectedWhenGameLaunch',onPlayerSelectedAudioWhenGameLaunch);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
     msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
	
    msgBus.subscribe('resourceLoaded', function () {
        if (popUpDialog) {
            audio.enableAudioDialog(true);  //set enable the dialog
        }
    });
    msgBus.subscribe('jLotteryGame.playerWantsToExit', function(){
        audio.stopAllChannel();
    });
    
	document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            hidden = true;
        } else {
            hidden = false;
            if(playResultAudio){
                onEnterResultScreenState();
            }
        }
    });
    
    return {};
});