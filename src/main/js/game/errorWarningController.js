define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function(msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config) {
    var scaleType;
    var continueButton, warningExitButton, errorExitButton, winboxExitButton;
    var tutorialVisible = false;
    var resultPlaque = null;
    var showWarn = false;
    var warnMessage = null;
    var inGame = false;
    var gameError = false;
    var hasWin = false;
    
    function onGameParametersUpdated() {
        scaleType = { 'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch': true };
        continueButton = new gladButton(gr.lib._warningContinueButton, config.gladButtonImgName.warningContinueButton, scaleType);
        warningExitButton = new gladButton(gr.lib._warningExitButton, config.gladButtonImgName.warningExitButton, scaleType);
        errorExitButton = new gladButton(gr.lib._errorExitButton, config.gladButtonImgName.errorExitButton, scaleType);
        winboxExitButton = new gladButton(gr.lib._winboxExitButton, config.gladButtonImgName.errorExitButton, scaleType);
        if (gr.lib._warningAndError){
            gr.lib._warningAndError.show(false);
        }
        
        if(gr.lib._winBoxError){
            gr.lib._winBoxError.show(false);
        }
        
        if (config.style.warningExitText) {
            gameUtils.setTextStyle(gr.lib._warningExitText, config.style.warningExitText);
        }
        if (config.textAutoFit.warningExitText) {
            gr.lib._warningExitText.autoFontFitText = config.textAutoFit.warningExitText.isAutoFit;
        }

        gr.lib._warningExitText.setText(loader.i18n.Game.warning_button_exitGame);


        if (config.style.warningContinueText) {
            gameUtils.setTextStyle(gr.lib._warningContinueText, config.style.warningContinueText);
        }
        if (config.textAutoFit.warningContinueText) {
            gr.lib._warningContinueText.autoFontFitText = config.textAutoFit.warningContinueText.isAutoFit;
        }
        gr.lib._warningContinueText.setText(loader.i18n.Game.warning_button_continue);


        if (config.style.warningText) {
            gameUtils.setTextStyle(gr.lib._warningText, config.style.warningText);
        }
        if (config.textAutoFit.warningText) {
            gr.lib._warningText.autoFontFitText = config.textAutoFit.warningText.isAutoFit;
        }

        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._warningContinueText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._warningExitText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
        if (config.style.errorExitText) {
            gameUtils.setTextStyle(gr.lib._errorExitText, config.style.errorExitText);
            gameUtils.setTextStyle(gr.lib._winboxExitText, config.style.errorExitText);
        }
        if (config.textAutoFit.errorExitText) {
            gr.lib._errorExitText.autoFontFitText = config.textAutoFit.errorExitText.isAutoFit;
            gr.lib._winboxExitText.autoFontFitText = config.textAutoFit.errorExitText.isAutoFit;
        }
        gr.lib._errorExitText.setText(loader.i18n.Game.error_button_exit);
        gr.lib._winboxExitText.setText(loader.i18n.Game.error_button_exit);
        gr.lib._errorTitle.show(true);

        if (config.style.errorTitle) {
            gameUtils.setTextStyle(gr.lib._errorTitle, config.style.errorTitles);
        }
        if (config.textAutoFit.errorTitle) {
            gr.lib._errorTitle.autoFontFitText = config.textAutoFit.errorTitle.isAutoFit;
        }
        gr.lib._errorTitle.setText(loader.i18n.Game.error_title);

        if (config.style.errorText) {
            gameUtils.setTextStyle(gr.lib._errorText, config.style.errorText);
        }
        if (config.textAutoFit.errorText) {
            gr.lib._errorText.autoFontFitText = config.textAutoFit.errorText.isAutoFit;
        }

        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._errorExitText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._winboxExitText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
        errorExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        });
        winboxExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        });
        continueButton.click(clickContinue);
        warningExitButton.click(function() {
            msgBus.publish('jLotteryGame.playerWantsToExit');
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
        });
    }

    function onWarn(warning) {
        if (gr.lib._warningAndError){
            gr.lib._warningAndError.show(true);
        }
        
        gr.lib._buttonInfo.show(false);
        gr.lib._BG_dim.show(true);      
        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }
        
        resultPlaque = hasWin ? gr.lib._winPlaque: gr.lib._nonWinPlaque;
        
		if(resultPlaque.pixiContainer.visible){
			resultPlaque.show(false);
		}else{
			resultPlaque = null;
		}
        
        msgBus.publish('tutorialIsShown');
        gr.lib._errorText.show(false);
        gr.lib._warningText.show(true);
        gr.lib._warningText.setText(warning.warningMessage);
        gr.lib._warningExitButton.show(true);
        gr.lib._warningContinueButton.show(true);
        gr.lib._errorExitButton.show(false);

        gr.lib._errorTitle.show(false);

    }

    function clickContinue() {
        if (gr.lib._warningAndError){
            gr.lib._warningAndError.show(false);
        }
        
        if (tutorialVisible || resultPlaque) {
            if (tutorialVisible) {
                gr.lib._tutorial.show(true);
                tutorialVisible = false;
            }else{
                resultPlaque.show(true);
                resultPlaque = null;
                msgBus.publish('tutorialIsHide');
                msgBus.publish('clickContinue');
            }
        } else {
            gr.lib._BG_dim.show(false);
            msgBus.publish('tutorialIsHide');
            msgBus.publish('clickContinue');
        }
        if (config.audio && config.audio.ButtonGeneric) {
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        }
        if(gameError){
            gameError = false;
        }
    }

    function onError(error) {
        gameError = true;
		gr.lib._network.stopPlay();
        gr.lib._network.show(false); 
        gr.lib._BG_dim.show(true);      
        if (gr.lib._tutorial.pixiContainer.visible) {
            gr.lib._tutorial.show(false);
            tutorialVisible = true;
        }
        //When error happend, Sound must be silenced.
        audio.stopAllChannel();
        
        if (error.errorCode === '29000') {
            if (gr.lib._winBoxError) {
                gr.lib._winBoxError.show(true);
            }
            gr.lib._winBoxErrorText.setText(error.errorCode);
        } else {
            if (gr.lib._warningAndError) {
                gr.lib._warningAndError.show(true);
            }
            gr.lib._errorTitle.show(true);
            gr.lib._buttonInfo.show(false);

            gr.lib._warningText.show(false);
            gr.lib._errorText.show(true);
            gr.lib._errorText.setText(error.errorCode + ": " + error.errorDescriptionSpecific + "\n" + error.errorDescriptionGeneric);
            gr.lib._warningExitButton.show(false);
            gr.lib._warningContinueButton.show(false);
            gr.lib._errorExitButton.show(true);
        }
        msgBus.publish('tutorialIsShown');
		
        //destroy if error code is 00000
        //this is a carry-over from jLottery1 where if the game is closed via the confirm prompt
        //rather than the exit button
        if (error.errorCode === '00000' || error.errorCode === '66605') {
            if (document.getElementById(SKBeInstant.config.targetDivId)) {
                document.getElementById(SKBeInstant.config.targetDivId).innerHTML = "";
                document.getElementById(SKBeInstant.config.targetDivId).style.background = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.backgroundSize = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitUserSelect = '';
                document.getElementById(SKBeInstant.config.targetDivId).style.webkitTapHighlightColor = '';
            }
            //clear require cache
            if (window.loadedRequireArray) {
                for (var i = window.loadedRequireArray.length - 1; i >= 0; i--) {
                    requirejs.undef(window.loadedRequireArray[i]);
                }
            }            
        }		
		

    }

    function onEnterResultScreenState(){
        inGame = false;
        if (showWarn) {
            showWarn = false;
            gr.getTimer().setTimeout(function () {
                onWarn(warnMessage);
            }, (Number(SKBeInstant.config.compulsionDelayInSeconds) + 0.3) * 1000);
        }
    }
    
    msgBus.subscribe('jLottery.reInitialize', function () {
        inGame = false;
    });
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.error', onError);
	msgBus.subscribe('winboxError', onError);
    msgBus.subscribe('buyOrTryHaveClicked', function(){
        inGame = true;
    });
    msgBus.subscribe('jLottery.playingSessionTimeoutWarning', function (warning) {
        if(SKBeInstant.config.jLotteryPhase === 1 || gameError){
            return;
        }
    
        if (inGame) {
            warnMessage = warning;
            showWarn = true;
        } else {
            onWarn(warning);
        }
    });

    function onStartUserInteraction(data){
		inGame = true;// gameType is ticketReady
        hasWin = (data.playResult === 'WIN');
    }

    function onReStartUserInteraction(data){
        onStartUserInteraction(data);
    }

    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    
    return {};
});