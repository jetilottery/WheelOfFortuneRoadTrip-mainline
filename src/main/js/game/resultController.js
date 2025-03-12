define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController',
    
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    var winClose, nonWinClose;
    var playAgain = false;

    var resultData = null;
    var resultPlaque = null;
    var baseWin, bonusWin;
    function onGameParametersUpdated() {
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92,'avoidMultiTouch':true};
        winClose = new gladButton(gr.lib._buttonWinClose, config.gladButtonImgName.buttonWinClose, scaleType);
        nonWinClose = new gladButton(gr.lib._buttonNonWinClose, config.gladButtonImgName.buttonNonWinClose, scaleType);
        
        for(var i=10; i<20;i++){
            var name = '_winSparcleAni_' + i;
            var list = [];
            list.push('_winSparcle_' + i);
            gr.animMap['_winSparcleAni_'+(i-10)].clone(list, name);
        }
        
        gr.animMap._transferToBase._onComplete = function () {
            console.log('playAgain: '+playAgain);
            if(playAgain){
                playAgain = false;
                return;
            }
        };

        function closeResultPlaque(){
            msgBus.publish('closeResult');
            gr.lib._BG_dim.show(false);
            hideDialog();
            if (config.audio && config.audio.ButtonGeneric) {
                audio.play(config.audio.ButtonGeneric.name, config.audio.ButtonGeneric.channel);
            }
            gr.getTimer().setTimeout(function(){
                if (!playAgain) {
                    gr.animMap._transferToBase.play();
                }
            }, 1000);
        }
        
        winClose.click(closeResultPlaque);
        nonWinClose.click(closeResultPlaque);
        
        var dropStyle = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI / 6, dropShadowAlpha:0.5, dropShadowBlur:5};

            gr.lib._win_Text.autoFontFitText = true;
            gr.lib._win_Value.autoFontFitText = true;
            gr.lib._base_win_Text.autoFontFitText = true;
            gr.lib._bonus_win_Text.autoFontFitText = true;
            gr.lib._could_win_Text.autoFontFitText = true;
            gr.lib._closeWinText.autoFontFitText = true;
            gr.lib._closeNonWinText.autoFontFitText = true;

        if (SKBeInstant.config.wagerType === 'TRY')
        {
            if (Number(SKBeInstant.config.demosB4Move2MoneyButton) === -1) {
                gr.lib._win_Text.setText(loader.i18n.Game.message_anonymousTryWin);
                gr.lib._could_win_Text.setText(loader.i18n.Game.message_anonymousTryWin_have_won);
            } else {
                gr.lib._win_Text.setText(loader.i18n.Game.message_tryWin);
                gr.lib._could_win_Text.setText(loader.i18n.Game.message_tryWin_have_won);
            }

        } else {
            gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
            gr.lib._could_win_Text.setText(loader.i18n.Game.message_buyWin_have_won);
        }
        
        
        gameUtils.setTextStyle(gr.lib._win_Text, dropStyle);        
        gameUtils.setTextStyle(gr.lib._base_win_Text, dropStyle);        
        gameUtils.setTextStyle(gr.lib._bonus_win_Text, dropStyle);        
        gameUtils.setTextStyle(gr.lib._could_win_Text, dropStyle);        
        gameUtils.setTextStyle(gr.lib._win_Value, dropStyle);
        
//        if (config.style.closeWinText) {
//            gameUtils.setTextStyle(gr.lib._closeWinText, config.style.closeWinText);
//        }
        gr.lib._closeWinText.setText(loader.i18n.Game.message_close);
        
        gr.lib._nonWin_Text.setText(loader.i18n.Game.message_nonWin);        
        gameUtils.setTextStyle(gr.lib._nonWin_Text, dropStyle);
        
//        gameUtils.setTextStyle(gr.lib._closeNonWinText, dropStyle);
        gr.lib._closeNonWinText.setText(loader.i18n.Game.message_close);
        
        hideDialog();
        function setStartComplete(gladAnim) {
            gladAnim._onComplete = function () {
                gladAnim.play();
            };
        }
        
        for(var i=0; i<20; i++){
            setStartComplete(gr.animMap['_winSparcleAni_'+i]);
        }
    }

    function hideDialog() {
        gr.lib._winPlaque.show(false);
        gr.lib._nonWinPlaque.show(false);
        gr.animMap._winPlaque_Anim.stop();
        gr.animMap._nonWinPlaque_Anim.stop();
        for (var i = 0; i < 20; i++) {
            gr.animMap['_winSparcleAni_' + i].stop();
        }
    }

    function showDialog() {
        gr.lib._BG_dim.show(true);
        if (resultData.playResult === 'WIN') {
            gr.lib._win_Text.show(true);
            
            if (SKBeInstant.config.wagerType === 'BUY')
            {
                gr.lib._win_Text.setText(loader.i18n.Game.message_buyWin);
                gr.lib._could_win_Text.setText(loader.i18n.Game.message_buyWin_have_won);
            }
                        
//            if(bonusWin >0){
            gr.lib._base_win_Text.setText(loader.i18n.Game.message_baseGame + SKBeInstant.formatCurrency(baseWin).formattedAmount);
            gr.lib._bonus_win_Text.setText(loader.i18n.Game.message_bonusGame + SKBeInstant.formatCurrency(bonusWin).formattedAmount);
            gr.lib._extraText.show(true);
//            }else{
//                gr.lib._extraText.show(false);
//            }
            
            gr.lib._win_Value.setText(SKBeInstant.formatCurrency(resultData.prizeValue).formattedAmount);

            gr.lib._winPlaque.updateCurrentStyle({"_opacity": "0"});
            gr.lib._winPlaque.show(true);
            gr.animMap._winPlaque_Anim.play();
            gr.lib._nonWinPlaque.show(false);
            
            for(var i=0; i<20; i++){
                gr.animMap['_winSparcleAni_'+i].play();
            }
        } else {
            gr.lib._winPlaque.show(false);
            gr.lib._nonWinPlaque.updateCurrentStyle({"_opacity": "0"});
            gr.lib._nonWinPlaque.show(true);
            gr.animMap._nonWinPlaque_Anim.play();
        }
    }

    function onStartUserInteraction(data) {
        resultData = data;
        hideDialog();
    }

    function onAllRevealed() {
        msgBus.publish('jLotteryGame.ticketResultHasBeenSeen', {
            tierPrizeShown: resultData.prizeDivision,
            formattedAmountWonShown: resultData.prizeValue
        });
        msgBus.publish('disableUI');
    }

    function onEnterResultScreenState() {
        playAgain = false;
        showDialog();
    }

    function onReStartUserInteraction(data) {
        onStartUserInteraction(data);
    }

    function onReInitialize() {
        hideDialog();
    }

    
    function onPlayerWantsPlayAgain(){
        console.log('run onPlayerWantsPlayAgain');
        playAgain = true;
        gr.animMap._transferToBase.stop();
        gr.lib._Bonus.updateCurrentStyle({"_opacity": "0"});
        
        gr.lib._BG_dim.show(false);
        hideDialog();
    }
    
    function onTutorialIsShown(){
        if(gr.lib._winPlaque.pixiContainer.visible || gr.lib._nonWinPlaque.pixiContainer.visible){            
            resultPlaque = gr.lib._winPlaque.pixiContainer.visible? gr.lib._winPlaque: gr.lib._nonWinPlaque;
            hideDialog();
            gr.lib._BG_dim.show(true);
        }
    }
    
    function onTutorialIsHide(){
        if(resultPlaque){
            resultPlaque.show(true);
            resultPlaque.updateCurrentStyle({"_opacity": "1"});
            resultPlaque = null;
        }        
    }
    
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);

    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('allRevealed', onAllRevealed);
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    msgBus.subscribe('tutorialIsShown', onTutorialIsShown);
    msgBus.subscribe('tutorialIsHide', onTutorialIsHide);
    msgBus.subscribe('getWinValue',function(obj){
        baseWin = obj.base;
        bonusWin = obj.bonus;
    });
        
    return {};
});