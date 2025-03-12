/**
 * @module game/tutorialController
 * @description result dialog control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController',
     'skbJet/component/gladPixiRenderer/Sprite'
], function (msgBus, audio, gr, loader, gladButton, SKBeInstant, gameUtils, config, Sprite) {
    var buttonInfo, buttonClose;
    var left, right;
    var index = 0, minIndex = 0, maxIndex;
    var shouldShowTutorialWhenReinitial = false;
    var iconOnImage, iconOffImage, buttonCloseImage;
	var showTutorialAtBeginning = true;
    var resultIsShown = false;
	var showButtonInfoTimer = null;
    var currentIndex = 0;
    var inGame = false;
    var startGame = false;

    function showTutorial() {
        gr.lib._BG_dim.off('click');
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        if (gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible) {
            resultIsShown = true;
        }
        gr.animMap._tutorialAnim._onComplete = function(){
            startCurrentAnim();
        };
        gr.animMap._tutorialAnim.play();
        msgBus.publish('tutorialIsShown');
        if(config.audio.HelpPageOpen){
            audio.play(config.audio.HelpPageOpen.name, config.audio.HelpPageOpen.channel);
        }
    }

    function hideTutorial() {
        index = minIndex;
        gr.animMap._tutorialUP._onComplete = function(){
            gr.lib._tutorial.show(false);
            for (var i = minIndex; i <= maxIndex; i++) {
                if (i === minIndex) {
                    gr.lib['_tutorialPage_0' + i].show(true);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(true);
                    if (gr.lib['_tutorialPageIcon_0' + i]) {
                        gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                    }
                } else {
                    gr.lib['_tutorialPage_0' + i].show(false);
                    gr.lib['_tutorialPage_0'+i+'_Text_00'].show(false);
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
                }
            }
        currentIndex = 0;
            if (inGame || !startGame) {
                buttonInfo.show(true);
            }else{
                buttonInfo.show(false);
            }
        if (!resultIsShown){
            gr.lib._BG_dim.show(false);
        }else{
            resultIsShown = false;
        }
        msgBus.publish('tutorialIsHide');
    };
        gr.animMap._tutorialUP.play();     
        if(config.audio.HelpPageClose){
            audio.play(config.audio.HelpPageClose.name, config.audio.HelpPageClose.channel);
        }   
    }
    
    function addAnimation() {
        var array = [];
        for (var i = 0; i < 10; i++) {
            array.push('How-To-Play-Fuel-Meter_Pointer_Anim_000' + i);
        }
        for (i = 10; i < 60; i++) {
            array.push('How-To-Play-Fuel-Meter_Pointer_Anim_00' + i);
        }
        Sprite.addSpriteSheetAnimation('How-To-Play-Fuel-Meter_Pointer_Anim', array);
    }

    function onGameParametersUpdated() {
        addAnimation();
        gr.lib._versionText.autoFontFitText = true;
		gr.lib._versionText.setText(window._cacheFlag.gameVersion+".CL"+window._cacheFlag.changeList+"_"+window._cacheFlag.buildNumber);
		
        // Prevent click the symbols when tutorial is shown
        gr.lib._BG_dim.on('click', function(event){
            event.stopPropagation();
        });

        iconOnImage = config.gladButtonImgName.iconOn;
        iconOffImage = config.gladButtonImgName.iconOff;
        buttonCloseImage = "buttonCommon";
        maxIndex = 4;
        
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
        buttonInfo = new gladButton(gr.lib._buttonInfo, "buttonInfo", scaleType);
        buttonClose = new gladButton(gr.lib._buttonCloseTutorial, buttonCloseImage, scaleType);
        buttonInfo.show(false);
		if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.showTutorialAtBeginning === false) {
                showTutorialAtBeginning = false;
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.showTutorialAtBeginning === false) {
                showTutorialAtBeginning = false;
            }
        }

        if (showTutorialAtBeginning === false) {
            buttonInfo.show(true);
            gr.lib._BG_dim.show(false);
            gr.lib._tutorial.show(false);
        }
		
        buttonInfo.click(function () {
            showTutorial();
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });

        buttonClose.click(function () {
            hideTutorial();
            audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
        });
        if (gr.lib._buttonTutorialArrowLeft) {
            left = new gladButton(gr.lib._buttonTutorialArrowLeft, "leftTutorialScrollBtn", scaleType);
            left.click(function () {
                index--;
                if (index < minIndex){
                    index = maxIndex;
                }
                showTutorialPageByIndex(index);
                audio.play(config.audio.ButtonBetDown.name, config.audio.ButtonBetDown.channel);         
            });
        }
        if (gr.lib._buttonTutorialArrowRight) {
            right = new gladButton(gr.lib._buttonTutorialArrowRight, "rightTutorialScrollBtn", scaleType);
            right.click(function () {
                index++;
                if (index > maxIndex){
                    index = minIndex;
                }

                showTutorialPageByIndex(index);
                audio.play(config.audio.ButtonBetUp.name, config.audio.ButtonBetUp.channel);
            });
        }

        for (var i = minIndex; i <= maxIndex; i++) {
            if(i !== 0){
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0'+i+'_Text_00'].show(false);
            }else{
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                }
            }
            var obj = gr.lib['_tutorialPage_0'+i+'_Text_00'];
            if (config.tutorialDropShadow) {
                gameUtils.setTextStyle(obj, {
                    padding: config.dropShadow.padding,
                    dropShadow: config.dropShadow.dropShadow,
                    dropShadowDistance: config.dropShadow.dropShadowDistance
                });
            }
            gameUtils.setTextStyle(obj,config.style.textStyle);
            if (loader.i18n.Game['tutorial_0' + i + '_landscape'] || loader.i18n.Game['tutorial_0' + i + '_portrait']){
                if(SKBeInstant.getGameOrientation() === "landscape"){
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_landscape']);
                }else{
                    obj.setText(loader.i18n.Game['tutorial_0' + i + '_portrait']);
                }
            }else{
                obj.setText(loader.i18n.Game['tutorial_0' + i]);
            }
        }

        gameUtils.setTextStyle(gr.lib._tutorialTitleText,config.style.tutorialTitleText);
        if (config.textAutoFit.tutorialTitleText){
            gr.lib._tutorialTitleText.autoFontFitText = config.textAutoFit.tutorialTitleText.isAutoFit;
        }
        gr.lib._tutorialTitleText.setText(loader.i18n.Game.tutorial_title);
        gameUtils.setTextStyle(gr.lib._closeTutorialText,config.style.closeTutorialText);
        if (config.textAutoFit.closeTutorialText){
            gr.lib._closeTutorialText.autoFontFitText = config.textAutoFit.closeTutorialText.isAutoFit;
        }
        gr.lib._closeTutorialText.setText(loader.i18n.Game.message_close);
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._closeTutorialText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._tutorialTitleText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
        
        function setStarComplete(gladAnim) {
            gladAnim._onComplete = function () {
                gladAnim.play();
            };
        }
        
        for(var i=0; i<3; i++){
            var name = '_sparke1_' + i + '_anim';
            var list = [];
            list.push('_sparke1_' + i);
            gr.animMap['_sparke3_' + i + '_anim'].clone(list, name);

            setStarComplete(gr.animMap['_sparke1_' + i + '_anim']);
            setStarComplete(gr.animMap['_sparkle_Anim_' + i]);
        }
        
        for(var i=0; i<6; i++){
            setStarComplete(gr.animMap['_tutorialPageSparkle_' + i+'_Ani']);
        }
        
    }

    function showTutorialPageByIndex(index){
        hideAllTutorialPages();
        gr.lib['_tutorialPage_0' + index].show(true);
        gr.lib['_tutorialPage_0'+ index +'_Text_00'].show(true);
        gr.lib['_tutorialPageIcon_0'+index].setImage(iconOnImage);
        currentIndex = index;
        startCurrentAnim();
    }
    function startCurrentAnim(){
        if (currentIndex === 0) {
            for (var i = 0; i < 6; i++) {
                gr.animMap['_tutorialPageSparkle_' + i+'_Ani'].play();
            }
        }else if(currentIndex === 1){
            gr.lib._tutorialPoint.gotoAndPlay('How-To-Play-Fuel-Meter_Pointer_Anim', 0.3, true);  
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparke1_'+i +'_anim'].play();
            }
        }else if(currentIndex === 2){
            gr.lib._fuel_star_t.gotoAndPlay('star',0.4,true);
        }else if (currentIndex === 3) {
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparke3_'+i +'_anim'].play(Number.MAX_VALUE);
            }
        }
        else if(currentIndex === 4){
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparkle_Anim_' + i].play();
            }
        }
        
    }
    function stopCurrentAnim() {
        if (currentIndex === 0) {
            for (var i = 0; i < 6; i++) {
                gr.animMap['_tutorialPageSparkle_' + i+'_Ani'].stop();
            }
        } else if (currentIndex === 1) {
            gr.lib._tutorialPoint.stopPlay();
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparke1_'+i +'_anim'].stop();
            }
        } else if (currentIndex === 2) {
            gr.lib._fuel_star_t.stopPlay();
        } else if (currentIndex === 3) {
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparke3_'+i +'_anim'].stop();
            }
        } else if (currentIndex === 4) {
            for (var i = 0; i < 3; i++) {
                gr.animMap['_sparkle_Anim_' + i].stop();
            }
        }
    }
    function hideAllTutorialPages(){
        for (var i = 0; i <= maxIndex; i++){
            gr.lib['_tutorialPage_0' + i].show(false);
            gr.lib['_tutorialPage_0'+ i +'_Text_00'].show(false);
            if (gr.lib['_tutorialPageIcon_0' + i]) {
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
        stopCurrentAnim();
    }

    function onReInitialize() {
        startGame = false;
        inGame = false;
        if(shouldShowTutorialWhenReinitial){
            shouldShowTutorialWhenReinitial = false;
            if (showTutorialAtBeginning) {
                showTutorial();
            }else{
                msgBus.publish('tutorialIsHide');
            }           
        }else{
            gr.lib._tutorial.show(false);
            buttonInfo.show(true);
        }
    }

    function onDisableUI() {
        gr.lib._buttonInfo.show(false);
    }
    
    function onEnableUI() {
        gr.lib._buttonInfo.show(true);
    }
    
    function showTutorialOnInitial(){
        for (var i = minIndex; i <= maxIndex; i++) {
            if (i === minIndex) {
                gr.lib['_tutorialPage_0' + i].show(true);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(true);
                if (gr.lib['_tutorialPageIcon_0' + i]) {
                    gr.lib['_tutorialPageIcon_0' + i].setImage(iconOnImage);
                }
            } else {
                gr.lib['_tutorialPage_0' + i].show(false);
                gr.lib['_tutorialPage_0' + i + '_Text_00'].show(false);
                gr.lib['_tutorialPageIcon_0' + i].setImage(iconOffImage);
            }
        }
        buttonInfo.show(false);
        gr.lib._BG_dim.show(true);
        gr.lib._tutorial.show(true);
        msgBus.publish('tutorialIsShown');
    }
    
    function onInitialize(){
        if(showTutorialAtBeginning){
            showTutorialOnInitial();
            gr.getTimer().setTimeout(function () {
                startCurrentAnim();
            }, 500);
        }else{
            msgBus.publish('tutorialIsHide');
        }
    }
    function onReStartUserInteraction(){
        startGame = true;
		if(showButtonInfoTimer){ 
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
		}
    }
    function onStartUserInteraction(){
        startGame = true;
        buttonInfo.show(false);
        if(SKBeInstant.config.gameType === 'ticketReady'){
            if (showTutorialAtBeginning) {
                showTutorialOnInitial();
            } else {
                msgBus.publish('tutorialIsHide');
            }
        }else{
            gr.lib._tutorial.show(false);
        }
    }
    
    function onEnterResultScreenState() {       
        showButtonInfoTimer = gr.getTimer().setTimeout(function () {
            startGame = false;
            inGame = false;
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
			if(gr.lib._warningAndError && !gr.lib._warningAndError.pixiContainer.visible){
				buttonInfo.show(true);
			}	
        }, Number(SKBeInstant.config.compulsionDelayInSeconds) * 1000);     
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
		if(showButtonInfoTimer){ 
			gr.getTimer().clearTimeout(showButtonInfoTimer);
			showButtonInfoTimer = null;
		}
        shouldShowTutorialWhenReinitial = true;
    }

    function clickContinue(){
        if(!showButtonInfoTimer){
            buttonInfo.show(true);
        }   
    }
    msgBus.subscribe('jLotterySKB.reset', function(){onEnableUI();});
    msgBus.subscribe('enableUI', onEnableUI);
    msgBus.subscribe('disableUI', onDisableUI);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('clickContinue', clickContinue);
    msgBus.subscribe('showGame', function () {
        inGame = true;
        buttonInfo.show(true);
    });
    
       
    msgBus.subscribe('clickedAllSymbol', function () {
        buttonInfo.show(false);
    });
    
    msgBus.subscribe('mapIsShown', function () {
        buttonInfo.show(false); 
    });
    msgBus.subscribe('mapIsHide', function () {
        buttonInfo.show(true);
    });
    
    return {};
});
