
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/componentCRDC/gladRenderer/gladButton',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'game/levelController',
    'skbJet/componentCRDC/gladRenderer/Tween',
    'skbJet/component/gladPixiRenderer/Sprite',
    'com/pixijs/pixi'
    
], function (msgBus, audio, gr, gameUtils, gladButton, loader, SKBeInstant, levelInfo,Tween, Sprite, PIXI) {
    var mapButton, startButton,exitButton;
    var scaleType = {'scaleXWhenClick': 0.92, 'scaleYWhenClick': 0.92};
    var style = {dropShadow: true, dropShadowDistance: 3, dropShadowAngle: Math.PI / 6, dropShadowAlpha:0.3, dropShadowBlur:4};

    var level =1;
    var preLevel = 1;
    var inGame = false;
    var enableToolTip = false;
    var sceneStartLevel={2:5,3:11,4:19,5:29};
    var hopTime = 1200;
    var errorOn = false;
    var clickedSymbol = null;
    function cloneKeyAnimation(){
        for (var i = 1; i < 29; i++) {
            var name = '_MapPlayerMarker_Ani_'+i;
            var list = [];
            list.push('_MapPlayerMarker_'+i);
            gr.animMap['_MapPlayerMarker_Ani_0'].clone(list, name);
            
            name = '_MapPlayerMarkerRipple_Ani_' + i;
            list = [];
            list.push('_MapPlayerMarkerRipple_'+i);
            list.push('_MapPlayerMarkerRipple_'+i+'_'+i);
            gr.animMap['_MapPlayerMarkerRipple_Ani_0'].clone(list, name);                     
        }
    }
//    var starTimer = null;
    
    function resetRipple(){
        for(var i=0; i<29; i++){
            gr.lib['_MapPlayerMarkerRipple_'+i].updateCurrentStyle({'_opacity':1,'_trnsform':{'_scale':{"_x": "0.2","_y": "0.2"}}});
            gr.lib['_MapPlayerMarkerRipple_'+i+'_'+i].updateCurrentStyle({'_opacity':0,'_trnsform':{'_scale':{"_x": "0.2","_y": "0.2"}}});
        }
    }
    
    function setComplete(){
        function setMapPlayerMarkerRippleGladComplete(gladAnim){
            gladAnim._onComplete = function () {
                if (errorOn) {
                return;
            }
                gr.getTimer().setTimeout(function () {
                    if (errorOn) {
                        return;
                    }
                    resetRipple();
                    gr.animMap['_MapPlayerMarker_Ani_' + gladAnim.index].play();
                    gladAnim.play();
                }, 800);
            };            
            
            
        }
        
        function setStarComplete(symbol){
            symbol.onComplete = function(){
                if (errorOn) {
                    return;
                }
              var index = symbol.index;
              gr.lib['_star_'+index].show(false);
            };
        }
        
        for(var i=0; i<29; i++){
            gr.animMap['_MapPlayerMarkerRipple_Ani_' + i].index = i;
            setMapPlayerMarkerRippleGladComplete(gr.animMap['_MapPlayerMarkerRipple_Ani_' + i]);
        }
        
        for(i in sceneStartLevel){
            gr.lib['_star_' + (sceneStartLevel[i] -1)].index = sceneStartLevel[i] -1;
            setStarComplete(gr.lib['_star_' + (sceneStartLevel[i] -1)]) ;
        }
    }
    
    function setClick4Segment(symbol) {
        symbol.clickFunc = function () {
            if (errorOn) {
                return;
            }
            var index = symbol.index;
            if (clickedSymbol && clickedSymbol !== gr.lib['_ToolTip_' + index]) {
                clickedSymbol.show(false);
            }
            clickedSymbol = gr.lib['_ToolTip_' + index];
            var flag = gr.lib['_ToolTip_' + index].pixiContainer.visible;
            gr.lib['_ToolTip_' + index].show(!flag);
        };
    }
    function setMouseout4Segment(symbol) {
        symbol.mouseoutFunc = function () {
            if (errorOn) {
                return;
            }
            gr.lib['_ToolTip_' + symbol.index].show(false);
        };
    }
    function setMouseover4Segment(symbol) {
        symbol.mouseoverFunc = function () {
            if (errorOn) {
                return;
            }
            var index = symbol.index;
            if (clickedSymbol && clickedSymbol !== gr.lib['_ToolTip_' + index]) {
                clickedSymbol.show(false);
            }
            clickedSymbol = gr.lib['_ToolTip_' + index];
            gr.lib['_ToolTip_' + symbol.index].show(true);
        };
    }
    
    function addAnimation() {
        var array = [];
        for (var i = 0; i < 10; i++) {
            array.push('lock-Opening_000' + i);
        }
        for (i = 10; i < 13; i++) {
            array.push('lock-Opening_00' + i);
        }
        Sprite.addSpriteSheetAnimation('lock-Opening', array);
    }
    
    function resetMarker(){
        resetRipple();
        for(var i=0; i<29; i++){
            gr.lib['_MapPlayerMarker_'+i].show(false);
            gameUtils.setTextStyle(gr.lib['_MapMarker_Text_'+i], style);
            gr.lib['_MapMarker_Text_'+i].setText(i+1);
            gr.lib['_MapMarker_Text_'+i].show(true);
            gr.lib['_MapMarker_Text_' +i].updateCurrentStyle({"_text":{"_color":"ffffff","_gradient":{"_color":["ffffff","dfdedd"]}}});
            gr.lib['_MapPlayerMarkerRipple_'+i].show(false);
            gr.lib['_MapPlayerMarkerRipple_'+i+'_'+i].show(false);
            gr.lib['_MapMarker_p_' + i].setImage('Map-Marker');            
        }
        
        for(var key in sceneStartLevel){
            var index = sceneStartLevel[key]-1;
            gr.lib['_MapMarker_p_' + index].setImage('Map-Marker-Silver');    
            gr.lib['_star_'+index].show(false);
            gr.lib['_MapMarker_Text_'+index].show(false);
            gr.lib['_MapPlayerMarker_'+index].show(false);
            gr.lib['_MapScenePlayerMarker_'+index].show(true);            
            gr.lib['_MapScenePlayerMarker_'+index].index = index;
            gr.lib['_ToolTip_'+index].show(false);
            gr.lib['_ToolTip_Text_'+index].autoFontFitText = true;
            gr.lib['_ToolTip_Text_'+index].setText(loader.i18n.Map.segmentTip);
        }
        
    }
    
    function onGameParametersUpdated(){
        addAnimation();
        gr.lib._Map.show(false);
        gameUtils.setTextStyle(gr.lib._mapTitle, style);
        
        cloneKeyAnimation();
        setComplete();
        resetMarker();
        
       mapButton = new gladButton(gr.lib._buttonMap, "buttonMap", scaleType);
       mapButton.show(false);
       mapButton.click(showMapInGame);
       
        function hideToolTip() {
            for (var key in sceneStartLevel) {
                var index = sceneStartLevel[key] - 1;
                gr.lib['_ToolTip_' + index].show(false);
            }
        }
   
        gr.animMap._transferMapToBase._onStart = function(){
            gr.lib._GameSymbol.show(true);
            hideToolTip();
            stopKeyAnim();
            gr.lib._ToolTip.show(false);            
        };
        gr.animMap._transferMapToBase._onComplete = function () {
            mapButton.show(true);
            gr.lib._Map.show(false);
            if(inGame){ //click OK
                msgBus.publish('mapIsHide');                
            }else{//click start
            }
        };
        gr.lib._startText.autoFontFitText = true;
        gr.lib._startText.setText(loader.i18n.Game.map_start);
        startButton = new gladButton(gr.lib._startButton, "buttonCommon", scaleType);
        startButton.show(false);
        startButton.click(function () {
            inGame = true;
            startButton.show(false);
            gr.lib._ToolTip.show(false);
            audio.play('Click',9);
            stopKeyAnim();
            hideToolTip();
            gr.animMap._LOGOAnim.updateStyleToTime(0);
            gr.animMap._GameSymbolAni.updateStyleToTime(0);
            gr.lib._gameLogo.show(true);
            gr.lib._Map.show(false);
            gr.lib._GameSymbol.updateCurrentStyle({'_opacity':1});
            gr.lib._GameSymbol.show(true);
            gr.getTimer().setTimeout(function () {
                gr.animMap._LOGOAnim.play();
                gr.animMap._GameSymbolAni.play();
            }, 20);
            audio.stopChannel(2); //stop MapLevelLoop
            audio.play('IntroMusic_stereo_44k',0);
            msgBus.publish('mapStartButtonClicked');
        });
       
        gr.lib._mapExitText.autoFontFitText = true;
        gr.lib._mapExitText.setText(loader.i18n.Game.map_exit);
        exitButton = new gladButton(gr.lib._mapExitButton, "buttonCommon", scaleType);
        exitButton.show(false);
        exitButton.click(function () {
            exitButton.show(false);
            audio.play('Click',9);
            gr.animMap._transferMapToBase.play();
        });
        
        gr.lib._MapFuelMeter_value.autoFontFitText = true;
        gr.lib._maxValue_Text.autoFontFitText = true;
        gr.lib._ToolTip_Text.autoFontFitText = true;
        gr.lib._ToolTip_Text.setText(loader.i18n.Map.desc);        
        gr.lib._ToolTip.show(false);
        
        gr.lib._MapFuelMeter.pixiContainer.hitArea = new PIXI.Rectangle(10, 10, 170, 70);
//        if(SKBeInstant.config.screenEnvironment === 'device'){
            gr.lib._MapFuelMeter.on('click',function(){
                if(enableToolTip && (level <29)){
                    if(clickedSymbol && clickedSymbol !== gr.lib._ToolTip){
                        clickedSymbol.show(false);
                    }
                    clickedSymbol = gr.lib._ToolTip;
                    var flag = gr.lib._ToolTip.pixiContainer.visible;
                    gr.lib._ToolTip.show(!flag);                
                }
            });

            gr.lib._MapFuelMeter.on('mouseout',function(){
                if(enableToolTip && (level <29)){
                    gr.lib._ToolTip.show(false);                
                }
            });
            gr.lib._MapFuelMeter.on('mouseover',function(){
                if(enableToolTip && (level <29)){
                    if(clickedSymbol && clickedSymbol !== gr.lib._ToolTip){
                        clickedSymbol.show(false);
                    }
                    clickedSymbol = gr.lib._ToolTip;
                    gr.lib._ToolTip.show(true);
                }
            });
            
            
            for (var key in sceneStartLevel) {
                var value = sceneStartLevel[key]-1;
            }
            
//        }else{            
            

            for (var key in sceneStartLevel) {
                var value = sceneStartLevel[key]-1;
                setClick4Segment(gr.lib['_MapScenePlayerMarker_' + value]);
                setMouseout4Segment(gr.lib['_MapScenePlayerMarker_' + value]);
                setMouseover4Segment(gr.lib['_MapScenePlayerMarker_' + value]);
                gr.lib['_MapScenePlayerMarker_' + value].on('click', gr.lib['_MapScenePlayerMarker_' + value].clickFunc);
                gr.lib['_MapScenePlayerMarker_' + value].on('mouseout', gr.lib['_MapScenePlayerMarker_' + value].mouseoutFunc);
                gr.lib['_MapScenePlayerMarker_' + value].on('mouseover', gr.lib['_MapScenePlayerMarker_' + value].mouseoverFunc);
            }
            
//        }
    }
    
    function playStar(){
        gr.getTimer().setTimeout(function () {
            for (var key in sceneStartLevel) {
                if (sceneStartLevel[key] > level) {
                    var index = sceneStartLevel[key] - 1;
                    gr.lib['_star_' + index].show(true);
                    gr.lib['_star_' + index].gotoAndPlay('star', 0.4,true);
                }
            }
        }, 500);
    }
    
    function moveToPre(preLevel){
        var targetSprite = gr.lib['_MapPlayerMarker_'+(preLevel-1)];
        var sourceSprite = gr.lib['_moveMarker'];
        var gp = targetSprite.toGlobal({x: targetSprite._currentStyle._width / 2, y: targetSprite._currentStyle._height / 2});
        var lp = sourceSprite.parent.toLocal(gp);
        var left = lp.x - sourceSprite._currentStyle._width / 2;
        var top = lp.y - sourceSprite._currentStyle._height / 2;
        sourceSprite.updateCurrentStyle({"_left":left,"_top":top});
    }
    function showMap() {
        if(levelInfo.getLevelUpType() === 2){
            resetMarker();
        }
        gr.lib._gameLogo.show(false);
        mapButton.show(false);

        if (preLevel === level) {
            setShowLevel(level);
        } else {
            setShowLevel(preLevel);
            moveToPre(preLevel);            
            Tween.create(gr.lib._moveMarker,gr.lib['_MapPlayerMarker_'+(level-1)],hopTime);
            gr.animMap['_moveMarker_tween']._onStart = function(){
                var index = preLevel-1;
                gr.lib['_MapMarker_Text_' + index].updateCurrentStyle({"_text":{"_color":"a6a6a6","_gradient":{"_color":["a6a6a6","a6a6a6"]}}});
                gr.lib['_MapMarker_Text_'+ index].show(true);
                gr.lib['_MapPlayerMarkerRipple_' + index + '_' + index].show(false);
                gr.lib['_MapPlayerMarkerRipple_' + index].show(false);
                if (preLevel === 5 || preLevel === 11 || preLevel === 19) {
                    gr.lib['_MapMarker_p_' + (preLevel - 1)].setImage('Map-Marker-Silver-Played');
                } else {
                    gr.lib['_MapMarker_p_' + (preLevel - 1)].setImage('Map-Marker-Played');
                }
            };
            gr.animMap['_moveMarker_tween']._onComplete=function(){
                var index = level -1;
                gr.lib['_MapMarker_Text_'+ index].show(false);   
                gr.lib._moveMarker.updateCurrentStyle({"_opacity":0});
                gr.lib['_MapPlayerMarker_'+index].show(true);
                gr.animMap._mapTitle_anim.stop();
                gr.animMap['_MapPlayerMarkerRipple_Ani_' + index].updateStyleToTime(0);
                //gr.lib._mapTitle.updateStyleToTime(0);
				gr.animMap._mapTitle_anim.updateStyleToTime(0);
                gr.lib._mapTitle.setText(loader.i18n.Map.title + '' + level);

                if (level === 5 || level === 11 || level === 19 ||level === 29) {
                    gr.lib['_Padlock-Unlocked_' + index].onComplete = function(){
                        startButton.show(true);
                        gr.animMap['_MapPlayerMarker_Ani_' + (level - 1)].play();
                        gr.lib['_MapPlayerMarkerRipple_' + (level - 1) + '_' + (level - 1)].show(true);
                        gr.lib['_MapPlayerMarkerRipple_' + (level - 1)].show(true);
                        gr.animMap['_MapPlayerMarkerRipple_Ani_' + (level - 1)].play();                    
                        if (level === 29) {
                            gr.lib._maxValue_Text.setText(loader.i18n.Game.maxlevel);
                            gr.lib._MiniGasSymbol.show(false);
                            gr.lib._MapFuelMeter_value.show(false);
                            gr.lib._maxValue_Text.show(true);
                        }
                    };
                    gr.lib['_star_' + index].stopPlay();
                    gr.lib['_star_' + index].show(false);
                    gr.lib['_MapScenePlayerMarker_' + index].show(false);
                    gr.lib['_Padlock-Unlocked_' + index].gotoAndPlay('lock-Opening',0.3);
                }else{
                     startButton.show(true);
                     gr.animMap['_MapPlayerMarker_Ani_' + (level - 1)].play();
                    gr.lib['_MapPlayerMarkerRipple_' + index + '_' + index].show(true);
                    gr.lib['_MapPlayerMarkerRipple_' + index].show(true);
                     gr.animMap['_MapPlayerMarkerRipple_Ani_' + (level - 1)].play();  
                }
            };
        }
        gr.lib._Map.show(true);
        playStar();
        enableToolTip = true;
        msgBus.publish('mapIsShown');
        if (preLevel === level) {
            startButton.show(true);
            gr.animMap['_MapPlayerMarker_Ani_' + (level - 1)].play();
            gr.animMap['_MapPlayerMarkerRipple_Ani_' + (level - 1)].play();
        }else{
            gr.lib['_moveMarker'].updateCurrentStyle({"_opacity":1});
            gr.lib['_MapPlayerMarker_'+(preLevel-1)].show(false);
            
            if (level === 5 || level === 11 || level === 19 ||level === 29){
                Tween.to(gr.lib['_MapScenePlayerMarker_' + (level-1)],{"opacity":0},hopTime);
            }
            gr.animMap['_moveMarker_tween'].play();
        }
    }
    
    function showMapInGame() {
        mapButton.show(false);
        playStar();
        audio.play('EngineTransition',9);
//        gr.lib._gameLogo.show(false);
        gr.lib._Map.updateCurrentStyle({"_opacity": 0});
        gr.lib._Map.show(true);
//        gr.lib._GameSymbol.show(false);        
        msgBus.publish('mapIsShown');
        gr.animMap._transferBaseToMap._onComplete = function () {
            gr.lib._GameSymbol.show(false);
            gr.animMap['_MapPlayerMarker_Ani_' + (level - 1)].play();
            gr.animMap['_MapPlayerMarkerRipple_Ani_' + (level - 1)].play();
            exitButton.show(true);
        };
        
        gr.animMap._transferBaseToMap.play();       
    }
    
    function setShowLevel(showLevel) {
        if(showLevel === 29){
            gr.lib._maxValue_Text.setText(loader.i18n.Game.maxlevel); 
            gr.lib._MiniGasSymbol.show(false);
            gr.lib._MapFuelMeter_value.show(false);
            gr.lib._maxValue_Text.show(true);
        }else{
            gr.lib._MapFuelMeter_value.setText(levelInfo.getCurrentTicks()+"/"+levelInfo.getTicksToNextLevel());
            gr.lib._MiniGasSymbol.show(true);
            gr.lib._MapFuelMeter_value.show(true);
            gr.lib._maxValue_Text.show(false);            
        }
        for (var i = 0; i < showLevel - 1; i++) {
            gr.lib['_MapPlayerMarker_' + i].show(false);
            gr.lib['_MapPlayerMarkerRipple_' + i + '_' + i].show(false);
            gr.lib['_MapPlayerMarkerRipple_' + i].show(false);
            gr.lib['_MapMarker_p_' + i].setImage('Map-Marker-Played');
            
            
            gr.lib['_MapMarker_Text_' + i].updateCurrentStyle({"_text":{"_color":"a6a6a6","_gradient":{"_color":["a6a6a6","a6a6a6"]}}});
            gr.lib['_MapMarker_Text_' + i].show(true);
            if (i === 4 || i === 10 || i === 18) {
//                gr.lib['_Padlock_' + i].show(false);
//                gr.lib['_Padlock-Unlocked_' + i].show(true);
                gr.lib['_Padlock-Unlocked_' + i].setImage('lock-Opening_0012');
                gr.lib['_MapScenePlayerMarker_' + i].show(false);
                gr.lib['_MapMarker_p_' + i].setImage('Map-Marker-Silver-Played');
            }
        }
        gr.lib['_MapMarker_Text_' + i].show(false);
        

        if (i === 4 || i === 10 || i === 18 || i === 28) {
            gr.lib['_star_' + i].show(false);
//            gr.lib['_Padlock_' + i].show(false);
//            gr.lib['_Padlock-Unlocked_' + i].show(true);
            gr.lib['_Padlock-Unlocked_' + i].setImage('lock-Opening_0012');
            gr.lib['_MapScenePlayerMarker_' + i].show(false);            
        }
        
        gr.lib['_MapPlayerMarker_' + i].show(true);
        gr.lib['_MapPlayerMarkerRipple_' + i].show(true);
        gr.lib['_MapPlayerMarkerRipple_' + i + '_' + i].show(true);
    }
    
    
    function stopKeyAnim(){
        var i = (level -1);
        gr.animMap['_MapPlayerMarker_Ani_'+ i].stop();
        gr.animMap['_MapPlayerMarkerRipple_Ani_'+i].stop();

        for (var key in sceneStartLevel) {
            if (sceneStartLevel[key] > level) {
                var index = sceneStartLevel[key] - 1;
                gr.lib['_star_' + index].stopPlay();
            }
        }
    }
  
    function onStartUserInteraction(data) {
        if (data.scenario) {
//            gr.lib._Map.updateCurrentStyle({"_opacity": 1});
            gr.lib._Map.show(true);
            startButton.show(false);
//            audio.play('MapLevelLoop',0,true);
//            startButton.show(true);
        } else {
            startButton.show(false);
        }
        
        exitButton.show(false);
    }
    
    function onFinishedGetInfo(){
        level = levelInfo.getCurrentLevel();
        preLevel = levelInfo.getPreLevel();
        if (preLevel === level) {
            gr.lib._mapTitle.setText(loader.i18n.Map.title + '' + level);
        }else{
            gr.animMap._mapTitle_anim.play(Number.MAX_VALUE);
            gr.lib._mapTitle.setText(loader.i18n.Map.newLevel);            
        }
        showMap();
    }
    
    function onReInitialize(){//WFTIW-108
        gr.lib._Map.updateCurrentStyle({"_opacity": 1});
        gr.lib._Map.show(false);
    }
    
    
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onStartUserInteraction);
    msgBus.subscribe('startReveallAll',function(){
        mapButton.show(false);
    });
    msgBus.subscribe('stopRevealAll', function () {
        mapButton.show(true);
    });    
    msgBus.subscribe('finishedGetInfo', onFinishedGetInfo);
    msgBus.subscribe('showGame', function () {
        mapButton.show(true);
    });
    
    msgBus.subscribe('tutorialIsShown', function () {
        mapButton.show(false);
    });
    msgBus.subscribe('tutorialIsHide', function () {
        if (inGame) {
            mapButton.show(true);
        }
    });
    
    msgBus.subscribe('clickedAllSymbol', function(){
        inGame = false; 
        enableToolTip = false;
        mapButton.show(false);
    });
    
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.error', function () {
        startButton.show(false);
        exitButton.show(false);
        errorOn = true;
    });
    
    msgBus.subscribe('playerWantsPlayAgain', function(){
        gr.lib._Map.show(false);
    });
});

