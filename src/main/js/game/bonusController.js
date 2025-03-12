define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/levelController',
    'game/RotaryTable'
], function (msgBus, audio, gr, SKBeInstant, gameUtils, gladButton, loader, levelInfo, RotaryTable) {
    var spinButton;
    var winValue = {"IW1": "", "IW2": "", "IW3": ""};
    var noWin = "";
    var prizeTable = null;
    var WHEELSegments = 24;
//    var winStyle = {"_opacity": "1","_text": {"_color": "ffffff","_strokeWidth": "2","_strokeColor": "000000"},"_font": {"_size": 42}};
//    var noWinStyle = {"_opacity": "0.8","_text": {"_color": "000000","_strokeWidth": "2","_strokeColor": "ffffff"},"_font": {"_size": 20}};
    var noWinPixiStyle = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI*2/3, dropShadowAlpha:0.5, dropShadowBlur:5, padding:0, lineHeight:22};
    var winPixiStyle = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI*2/3, dropShadowAlpha:0.5, dropShadowBlur:5, padding:0, lineHeight:42};
    var winValueResult = 0;
    var scrollInterval = 2000;
    
    
    var map = {
        1: {0: [23, 22, 21, 19, 18, 17, 15, 14, 13, 11, 10, 9, 7, 6, 5, 3, 2, 1], 1: [0, 12], 2: [20, 8], 3: [16, 4]},
        2: {0: [23, 22, 20, 18, 17, 15, 14, 12, 10, 9, 7, 6, 4, 2, 1], 1: [0, 16, 8], 2: [21, 13, 5], 3: [19, 11, 3]},
        3: {0: [23, 21, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1], 1: [0, 18, 12, 6], 2: [22, 16, 10, 4], 3: [20, 14, 8, 2]},
        4: {0: [0, 20, 19, 15, 14, 10, 9, 5, 4], 1: [22, 17, 12, 7, 2], 2: [21, 16, 11, 6, 1], 3: [23, 18, 13, 8, 3]},
        5: {0: [22, 18, 14, 10, 6, 2], 1: [0, 20, 16, 12, 8, 4], 2: [23, 19, 15, 11, 7, 3], 3: [21, 17, 13, 9, 5, 1]}
    };
    
    var lockMap = {
        1: [23, 22, 19, 18, 15, 14,11, 10,  7, 6,  3, 2],
        2: [23, 20, 18, 15, 12, 10, 7, 4, 2],
        3: [23, 19, 15, 11, 7,  3],
        4: [19,  10,  4]        
    };
    var noWinUnLockMap = {
        1: [21, 17, 13, 9, 5, 1],
        2: [22, 17, 14, 9, 6, 1],
        3: [21, 17, 13, 9, 5, 1],
        4: [0, 20, 15, 14, 9, 5]        
    };

    var rotaryTable;
    var bonusWinValue = 0;
    var baseGameWin = 0;
    var stopIndex = 0;
    var lock=[];
    var idleTimer = null;
    var errorOn = false;

    function setComplete() {
        gr.animMap._transferToBonus0._onComplete = function () {
            if(errorOn){
                return;
            }
//            backgroudController.setBlackGround();
            gr.animMap._transferToBonus1.play();
            gr.getTimer().setTimeout(function () {
                gr.lib._lights_even.updateCurrentStyle({"_opacity": 1});
                gr.lib._lights_odd.updateCurrentStyle({"_opacity": 1});
                gr.animMap._bonusWheelAni.play();                
            }, 100);
        };
        gr.animMap._transferToBonus1._onComplete = function () {
            if(errorOn){
                return;
            }
            gr.lib._bonus_rays.updateCurrentStyle({"_opacity": 1});
            gr.animMap._bonus_rays_anim.play(Number.MAX_VALUE);
            gr.getTimer().setTimeout(function () {
                if (errorOn) {
                    return;
                }
                audio.playAndFadeIn(7,'WheelSpinLoop',true,9000);
            }, 700);
        };
        
        gr.animMap._spinButtonFadeIn._onComplete = function () {
            if(errorOn){
                gr.lib._spinButton.show(false);
                return;
            }
            gr.animMap._spinButton_flashAnim.play(Number.MAX_VALUE);
            audio.play('DrumRoll', 4, true);  
        };
        gr.animMap._bonusWheelAni._onComplete = function () {
            if (errorOn) {
                return;
            }
            gr.getTimer().setTimeout(function () {
                if (errorOn) {
                    return;
                }
                gr.lib._spinButton.updateCurrentStyle({"_opacity": "0"});
                gr.lib._spinButton.show(true);
                gr.animMap._spinButtonFadeIn.play();
            }, 500);
        };

    }

    function updateStyle() {
        var  orientation = SKBeInstant.getGameOrientation();
        if (orientation === 'landscape') {
            gr.lib._bonusWheel.updateCurrentStyle({"_top": "498"}); //landscape
        } else {
            gr.lib._bonusWheel.updateCurrentStyle({"_top": "840"});//portraint
        }
        
        gr.lib._Bonus.updateCurrentStyle({"_opacity": "0"});
        gr.lib._BonusWheelSegments.updateCurrentStyle({"_rotate": 0});
        
        gr.lib._bonusNoWin.updateCurrentStyle({"_opacity": "0"});
        gr.lib._bonusWin.updateCurrentStyle({"_opacity": "0"});

        gr.lib._spinButton.show(false);
        

    }
    function wheelStop() {
        gr.lib._BonusWheelPointerLight.show(true);
        gr.animMap._lights_Anim.stop();     
        gr.lib._lights_even.updateCurrentStyle({"_opacity": 1});
        gr.lib._lights_odd.updateCurrentStyle({"_opacity": 1});
        gr.animMap._lights_faster_Anim.play(2);
        if (bonusWinValue > 0) {
            if ((baseGameWin + bonusWinValue) !== winValueResult) {
                msgBus.publish('winboxError', {errorCode: '29000'});
                return;
            }
        } else {
            if (baseGameWin < winValueResult) {
                msgBus.publish('winboxError', {errorCode: '29000'});
                return;
            } else if (baseGameWin > winValueResult) {
                return;
            }

        }
        
        gr.animMap._BonusWheelPointerLight_Anim.play();
        
        if (bonusWinValue > 0) {
            audio.play('WheelStop_Win', 4);
            audio.play('CrowdAnticipationEnd_Win', 5);
            msgBus.publish('playCoinShower');
            gr.getTimer().setTimeout(function () {
                gr.lib._bonusWin_Value.setText(SKBeInstant.formatCurrency(bonusWinValue).formattedAmount);
//                gr.lib._bonusWin.show(true);
                gr.animMap._bonusWin_Anim.play();
                gr.lib._winsValue.setText(SKBeInstant.formatCurrency(baseGameWin + bonusWinValue).formattedAmount);
                gameUtils.fixMeter(gr);
//                gr.getTimer().setTimeout(function () {
                    msgBus.publish('allRevealed');
//                }, 1000);
            }, 2800);

        } else {
            audio.play('CrowdAnticipationEnd_lose', 5);
            gr.getTimer().setTimeout(function () {
//                gr.lib._bonusNoWin.show(true);
                gr.animMap._bonusNoWin_Anim.play();
                msgBus.publish('allRevealed');
            }, 2000);
        }

    }
    
    function onGameParametersUpdated() {
        updateStyle();
        setComplete();
        for(var i=0; i< WHEELSegments; i++){
            lock.push(false);
        }

        rotaryTable = new RotaryTable({sprite: gr.lib._BonusWheelSegments, callback: wheelStop});
        noWin = addBlankToNoWinString(loader.i18n.Bonus.noWin);
        for (var i = 0; i < WHEELSegments; i++) {
            gr.lib['_bonus_nowin_text_' + i].setText(noWin);
            gameUtils.setTextStyle(gr.lib['_bonus_nowin_text_'+i], noWinPixiStyle);
            gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.style.wordWrap = true;
            gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.style.wordWrapWidth = 1;
            var prefontsize = Number(gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.style.fontSize);
            var fontsize = prefontsize;
            while(gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.height > 235){
                fontsize--;
                noWinPixiStyle.fontSize= fontsize;
                noWinPixiStyle.lineHeight= fontsize+2;
                gameUtils.setTextStyle(gr.lib['_bonus_nowin_text_'+i], noWinPixiStyle);
            }
            
            if(fontsize < prefontsize){ //set _bonus_nowin_text_0
                if(gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.width < gr.lib['_bonus_nowin_text_' + i]._currentStyle._width){
                    gr.lib['_bonus_nowin_text_' + i].pixiContainer.x = gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.width;                    
                }else if(gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.width > gr.lib['_bonus_nowin_text_' + i]._currentStyle._width){
                    gr.lib['_bonus_nowin_text_' + i].pixiContainer.x = gr.lib['_bonus_nowin_text_' + i].pixiContainer.$text.width/2;    
                }
            }else{
                    gr.lib['_bonus_nowin_text_' + i].pixiContainer.x = gr.lib['_bonus_nowin_text_' + 0].pixiContainer.x;
            }
        }
        
        if (SKBeInstant.config.customBehavior) {
            scrollInterval = SKBeInstant.config.customBehavior.scrollInterval || scrollInterval;
        }else if(loader.i18n.gameConfig){
            scrollInterval = loader.i18n.gameConfig.scrollInterval || scrollInterval;
        }
         

        //_bonusnNoWin
        gr.lib._BonusRoundMessage_Text_1.autoFontFitText = true;
        
        if (SKBeInstant.getGameOrientation() === 'landscape') {
        gr.lib._BonusRoundMessage_Text_1.setText(loader.i18n.Bonus.round1_L);
            gr.lib._bonusNoWin_Text.setText(loader.i18n.Bonus.message_nonWinL);
        } else {
            gr.lib._bonusNoWin_Text.autoFontFitText = true;
            gr.lib._BonusRoundMessage_Text_1.setText(loader.i18n.Bonus.round1_P);
            gr.lib._bonusNoWin_Text.setText(loader.i18n.Bonus.message_nonWinP);
        }

        //_BonusWin
        gr.lib._bonusWin_Text.autoFontFitText = true;
        gr.lib._bonusWin_Text.setText(loader.i18n.Bonus.message_win);

        gr.lib._bonusWin_Value.autoFontFitText = true;


        //_bonusRoundMessage
        gr.lib._BonusRoundMessage_Text_0.autoFontFitText = true;
        gr.lib._BonusRoundMessage_Text_0.setText(loader.i18n.Bonus.round0);


        //_spinButton
        gr.lib._spin_text.autoFontFitText = true;
        gr.lib._spin_text.setText(loader.i18n.Bonus.spin);
        spinButton = new gladButton(gr.lib._spinButton, "buttonCommon", {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92});
        spinButton.click(triggerSpin);
        
    }

    function addBlankToString(source) {
        var temp= source.replace(/\s/g, "");
        var output = "";
        if (temp.length >= 1) {
            output += temp.charAt(0);
            for (var i = 1; i < temp.length; i++) {
                output += " ";
                output += temp.charAt(i);
            }
        }
        return output;
    }
    
    function addBlankToNoWinString(source) {
        var output = "";
        if (source.length >= 1) {
            output += source.charAt(0);
            for (var i = 1; i < source.length; i++) {
                if (source.charAt(i - 1) !== " ") {
                    output += " ";
                }
                output += source.charAt(i);
            }
        }
        return output;
    }



    function triggerSpin() {
        gr.animMap._lights_Anim.play(Number.MAX_VALUE);
        audio.stopChannel(4);//stop DrumRoll
        audio.play('SpinButtonTouch', 3);
        audio.play('CrowdAnticipationStart_03', 5);
        if (idleTimer) {
            gr.getTimer().clearTimeout(idleTimer);
            idleTimer = null;
        }
        gr.animMap._spinButton_flashAnim.stop();
        spinButton.show(false);
        gr.lib._spinButton.updateCurrentStyle({"_style": {"_transform": {	"_scale": {	"_x": "1","_y": "1"}}}});
//        gr.lib._bonusSpin.show(false);

        gr.getTimer().setTimeout(function () {
            rotaryTable.begin();
            gr.getTimer().setTimeout(function () {
                rotaryTable.stop(stopIndex);
            }, scrollInterval);
        }, 500);

    }

    function onReInitialize() {
        updateStyle();
    }

    function onStartUserInteraction() {
        updateStyle();
    }
    function onReStartUserInteraction() {
        updateStyle();
    }

    function onFinishedGetInfo(data) {
        prizeTable = data.prizeTable;
        if (data.playResult === "WIN") {
            winValueResult = data.prizeValue;
        } else {
            winValueResult = 0;
        }
        
        for (var j = 1; j <= 3; j++) {
             winValue["IW" + j] = SKBeInstant.formatCurrency(prizeTable[10 + j].prize).formattedAmount;

            var value = SKBeInstant.formatCurrency(prizeTable[10 + j].prize).formattedAmount;
            var index = value.indexOf('.');
            if (index === -1) {
                winValue["IW" + j] = value;
            }else{
                if (((index + 1) < value.length) && (value.charAt(index + 1) === '0')) { //for example 1.00
                    value = value.substr(0, index);
                }
                
                winValue["IW" + j] = value;
            }
            
        }

        var scene = levelInfo.getCurrentScene();
        console.log("scene: " + scene);
        if (scene === 5) {
            gr.lib._BonusRoundMessage_Text_1.setText(loader.i18n.Bonus.round1_Max);
        }
        for (var i = 0; i < WHEELSegments; i++) {
            lock[i] = false;
            gr.lib['_bonus_lock_' + i].show(false);
            
            gr.lib['_bonus_nowin_text_'+i].show(true);
            gr.lib['_bonus_win_text_' + i].show(false);
        }
        setLock(scene);
        var sceneData = map[scene];
        console.log("sceneData: " + sceneData);
        
        function setString(indexArray, value) {
            for (var index = 0; index < indexArray.length; index++) {
                var key = indexArray[index];
                gr.lib['_bonus_nowin_text_'+key].show(false);
                gr.lib['_bonus_win_text_' + key].show(true);
                gr.lib['_bonus_win_text_' + key].setText(value);
                gameUtils.setTextStyle(gr.lib['_bonus_win_text_'+ key], winPixiStyle);
                gr.lib['_bonus_win_text_'+ key].pixiContainer.$text.style.wordWrap = true;
                gr.lib['_bonus_win_text_'+ key].pixiContainer.$text.style.wordWrapWidth = 1;
            }
        }
        //sceneData: {1:[0,6,12,18],2:[2,8,14,20],3:[4,10,16,22]}
        for (var key in sceneData) {
            if(Number(key) === 0){
                continue;
            }
            var IWData = sceneData[key];
            console.log("IWData: " + IWData);
            setString(IWData, addBlankToString(winValue["IW" + key]));
        }
    }
    
    msgBus.subscribe('finishedGetInfo', onFinishedGetInfo);
    msgBus.subscribe('startBonus', function (obj) {
        gr.lib._BonusWheelPointerLight.show(false);
        gr.animMap._transferToBonus0.play();       

        baseGameWin = obj.winValue;
        var currentScene = levelInfo.getCurrentScene();
        if (Number(obj.bonusResult) !== 0) {
            bonusWinValue = prizeTable[10 + Number(obj.bonusResult)].prize;
        } else {
            bonusWinValue = 0;            
        }
        
        msgBus.publish('getWinValue',{base:baseGameWin,bonus:bonusWinValue});
        if(currentScene === 5 || obj.bonusResult !== 0){
            var indexArray = map[currentScene][obj.bonusResult];
            stopIndex = indexArray[Math.floor(Math.random() * indexArray.length)];
        }else{
            stopIndex = noWinUnLockMap[currentScene][Math.floor(Math.random() * noWinUnLockMap[currentScene].length)];
//            stopIndex = 5;
        }
        console.log('stopIndex: '+stopIndex);

    });
    
    function setLock(scene){
        if(scene === 5){
            return;
        }
        for(var i=0; i<lockMap[scene].length; i++){
            var index = lockMap[scene][i];
            gr.lib['_bonus_lock_' + index].show(true);
            lock[index] = true;
        }
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    
    msgBus.subscribe('playerWantsPlayAgain', function () {        
        gr.lib._Bonus.updateCurrentStyle({"_opacity": "0"});
        gr.animMap._bonus_rays_anim.stop();        
    });
    msgBus.subscribe('jLottery.enterResultScreenState', function(){
        audio.stopChannel(7);//stop WheelSpinLoop        
        gr.lib._bonusNoWin.updateCurrentStyle({"_opacity": "0"});
        gr.lib._bonusWin.updateCurrentStyle({"_opacity": "0"});
    });
    
    msgBus.subscribe('jLottery.error', function(){
        errorOn = true;
    });

});

