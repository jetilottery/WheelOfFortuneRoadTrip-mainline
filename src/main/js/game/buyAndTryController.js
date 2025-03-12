/**
 * @module game/buyAndTryController
 * @description buy and try button control
 */
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'game/configController'
], function (msgBus, audio, gr, loader, SKBeInstant, gladButton, gameUtils, config) {
    
    var currentTicketCost = null;
    var replay, tryButton, buyButton;
    var MTMReinitial = false;
    
    function onGameParametersUpdated(){
        var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92, 'avoidMultiTouch':true};
        tryButton = new gladButton(gr.lib._buttonTry, config.gladButtonImgName.buttonTry, scaleType);
        buyButton = new gladButton(gr.lib._buttonBuy, config.gladButtonImgName.buttonBuy, scaleType);
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        gr.lib._network.show(false);
        replay = false;
        
        if (config.style.buyText) {
            gameUtils.setTextStyle(gr.lib._buyText, config.style.buyText);
        }
        if (config.textAutoFit.buyText){
            gr.lib._buyText.autoFontFitText = config.textAutoFit.buyText.isAutoFit;
        }

        if(SKBeInstant.config.wagerType === 'BUY'){
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
        }else{
            gr.lib._buyText.setText(loader.i18n.Game.button_try);
        }

        if (config.style.tryText) {
            gameUtils.setTextStyle(gr.lib._tryText, config.style.tryText);
        }
        if (config.textAutoFit.tryText){
            gr.lib._tryText.autoFontFitText = config.textAutoFit.tryText.isAutoFit;
        }

        gr.lib._tryText.setText(loader.i18n.Game.button_try);
        if (config.dropShadow) {
            gameUtils.setTextStyle(gr.lib._tryText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
            gameUtils.setTextStyle(gr.lib._buyText, {
                padding: config.dropShadow.padding,
                dropShadow: config.dropShadow.dropShadow,
                dropShadowDistance: config.dropShadow.dropShadowDistance
            });
        }
		
		if(gr.lib._MTMText){
			gameUtils.keepSameSizeWithMTMText(gr.lib._tryText, gr);
		}
		
        tryButton.click(buyOrTryClickEvent);
        buyButton.click(buyOrTryClickEvent);
    }
	
    function play() {
        if (replay) {
            msgBus.publish('jLotteryGame.playerWantsToRePlay', {price:currentTicketCost});
        } else {
            msgBus.publish('jLotteryGame.playerWantsToPlay', {price:currentTicketCost});
        }
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        gr.lib._network.show(true);
        gr.lib._network.gotoAndPlay('LoadingSwirl', 0.3, true);
        audio.play('Buy', 1);
        msgBus.publish('disableUI');
    }

	function buyOrTryClickEvent(){
		msgBus.publish('buyOrTryHaveClicked');
		play();
	}
	
    function onStartUserInteraction(data) {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);        
        
        gr.lib._buttonBuy.show(false);
        gr.lib._buttonTry.show(false);
        currentTicketCost = data.price;
        replay = true;
    }

    function showBuyOrTryButton() {
        if (SKBeInstant.config.jLotteryPhase !== 2) {
            return;
        }
            gr.lib._buttonBuy.show(true);
            gr.lib._buttonTry.show(true);
    }

    function onInitialize() {
        showBuyOrTryButton();
    }

    function onTicketCostChanged(data) {
        currentTicketCost = data;
    }

    function onReInitialize() {
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        
        if (MTMReinitial) {
			replay = false;
            gr.lib._buyText.setText(loader.i18n.Game.button_buy);
            MTMReinitial = false;
        }
        showBuyOrTryButton();
    }
    
    function onPlayerWantsPlayAgain(){
        showBuyOrTryButton();
    }
    
    function onReStartUserInteraction(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);   
    }
    
    function onPlayerWantsToMoveToMoneyGame(){
        MTMReinitial = true;
    }
    function onReset(){
        gr.lib._network.stopPlay();
        gr.lib._network.show(false);  
        showBuyOrTryButton();
    }
    msgBus.subscribe('jLotterySKB.reset', onReset);
    msgBus.subscribe("playerWantsPlayAgain", onPlayerWantsPlayAgain);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.initialize', onInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('ticketCostChanged', onTicketCostChanged);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame',onPlayerWantsToMoveToMoneyGame);

    return {};
});