
define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/componentCRDC/IwGameControllers/gameUtils',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader',
    'game/levelController',
    'skbJet/componentCRDC/gladRenderer/Tween',
    'skbJet/component/gladPixiRenderer/Sprite',
    'com/pixijs/pixi',
    'com/pixijs/pixi-particles',
    'skbJet/component/gladRenderer/view/spriteUtil'
], function (msgBus, audio, gr, SKBeInstant, gameUtils, loader, levelInfo,Tween, Sprite,PIXI, Particles,spriteUtil) {
    var YOURNumbers = 16;
    var WinningNumbers = 4;
    var fuelPointOrigin = {'top': 0, 'left': 0};
    var winNumOpened = [];
    var yourNumOpened = [];
    var finishedNum = 0;
    var clickedNum = 0;

    var unlockNum = 12;
    var mapIsShown = false;
    var fuelIndex = -1;

    var bannerTimer = null;
    var playResult;
    var winValue = 0;
//    var splitArray = null;
    var orientation;
    var money = 0;
    var timeBeforeShowWin = 200;
    var winBoxError = false;
    var dropStyle = {dropShadow: true, dropShadowDistance: 4, dropShadowAngle: Math.PI / 6, dropShadowAlpha:0.5, dropShadowBlur:5};

    var winNumArray = [], yourNumArray = [], winBonus, winFuel;
    var yourNum0Array, yourNum1Array;
    var multipleMap = {"W": 2, "X": 3, "Y": 5, "Z": 10};
    var prizeTable;
    var revealInterval = 300;
    var winningNumbersRevealInterval = 1;
    var winSymbol={};
    var openedSymbol={};
    var fuelIsOnWinSymbol = false;
    var renderer;
    var emitter;
    var elapsed;
    var updateId;
    var emitterContainer;
    var idolTimer = null;
    var errorOn = false;
    var clickedSymbol= null;
    var transferBonusIntervalWin = 4000;
    var transferBonusIntervalNoWin = 2000;
    
 
    var noWinStyle = {"_text": {
            "_gradient": {
                "_color": [
                    "fbff49",
                    "fdd210"
                ],
                "_stop": [
                    0,
                    1
                ],
                "_type": "vertical"
            }
        }
    };
    var winStyle = {"_text": {
            "_gradient": {
                "_color": [
                    "ffffff",
                    "dfdedd"
                ],
                "_stop": [
                    0,
                    1
                ],
                "_type": "vertical"
            }
        }
    };
    
    var emitterConfig = {
        "alpha": {
            "start": 0.9,
            "end": 0.7
        },
        "scale": {
            "start": 1,
            "end": 0.3,
            "minimumScaleMultiplier": 2
        },
        "color": {
            "start": "ffffff",
            "end": "ffffff"
        },
        "speed": {
            "start": 200,
            "end": 200
        },
        "startRotation": {
            "min": 0,
            "max": 0
        },
        "rotationSpeed": {
            "min": 0,
            "max": 0
        },
        "lifetime": {
            "min": 0.5,
            "max": 0.5
        },
        "frequency": 0.2,
        "emitterLifetime": 0.5,
        "maxParticles": 1000,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "burst",
        "particlesPerWave": 10,
        "particleSpacing": 36,
        "angleStart": 0
    };
    
    function getFuelPointOrigin() {
        fuelPointOrigin.top = gr.lib._FuelMeterPointer._currentStyle._top;
        fuelPointOrigin.left = gr.lib._FuelMeterPointer._currentStyle._left;
    }

    function setComplete() {
        function setWinNumScaleGladComplete(gladAnim) {
            gladAnim._onComplete = function () {
                var matchedArray = [];
                for (var i = 0; i < unlockNum; i++) {
                    if (yourNumOpened[i] === true) {
                        if (winNumArray[gladAnim.index] === yourNum0Array[i]) {
                            matchedArray.push(i);
                        }
                    }
                }

                if (matchedArray.length > 0) { //play win Anim
                    gr.getTimer().setTimeout(function () {
                        audio.play('Ping', 4);
                        audio.play('WinFanfare', 5);
                        gr.lib['_WinNumbersBackgroundCircles_Text_' + gladAnim.index].updateCurrentStyle(winStyle);
                        gr.lib['_WinningMatchSwirl_' + gladAnim.index].show(true);
                        gr.lib['_WinningMatchEffectLightball_' + gladAnim.index].show(true);
                        gr.animMap['_WinningMatchSwirl_Anim_' + gladAnim.index].play(Number.MAX_VALUE);
                        gr.animMap['_WinningMatchEffectLightball_Anim_' + gladAnim.index].play();
                        for (i = 0; i < matchedArray.length; i++) { //play your num Anim
                            var matchIndex = matchedArray[i];
                            console.log('your number ' + matchIndex + ' updateWinValue ' + yourNum1Array[matchIndex]);
                            updateWinValue(yourNum1Array[matchIndex], matchIndex);
                            gr.lib['_WinningEffectLightball_' + matchIndex].show(true);

                            gr.lib['_PrizeBanner_' + matchIndex].show(true);
                            gr.lib['_YourNumbersBackgroundCircles_Text_' + matchIndex].updateCurrentStyle(winStyle);
                            gr.lib['_PrizeBanner_Text_' + matchIndex].updateCurrentStyle(winStyle);
                            gr.lib['_YourNumbersBackgroundCircles_Text_' + matchIndex].show(true);
                            gr.lib['_WinningEffectsSwirl_' + matchIndex].show(true);
                            gr.lib['_YourNumbersMatchBackgroundCircles_' + matchIndex].show(true);

                            gr.animMap['_WinningEffectLightball_Ani_' + matchIndex].play();
                            gr.animMap['_WinningEffectsSwirl_Ani_' + matchIndex].play(Number.MAX_VALUE);

                        }
                    }, timeBeforeShowWin);
                } else {
//                    audio.play('NumReveal',1);
                    startBonus('win' + gladAnim.index);
                }
            };
        }
        
        
        function setWinNumGladComplete(gladAnim) {
            gladAnim._onComplete = function () {     
                if (winBoxError) {
                    return;
                }
                winNumOpened[gladAnim.index] = true;
                gr.lib['_WinningNumberWheel_' + gladAnim.index].show(false);
                gr.lib['_WinningNumberWheel_' + gladAnim.index].updateCurrentStyle({"_opacity": "1", "_transform": {"_rotate": 0}});
                gr.animMap['_WINNumbers_Text_Anim_'+gladAnim.index].play();
            };
        }

        function setYourNumScaleGladComplete(gladAnim){
            gladAnim._onComplete = function(){
                var index = gladAnim.index;
                if (index === fuelIndex) { //play tween anim
                    audio.play('FuelFound',7);
                    gr.lib['_gameStar_' + index].show(true);
                    gr.lib['_gameStar_' + index].gotoAndPlay('star', 0.4);
                    //playtweenAnim
                    msgBus.publish('revealedFuel',fuelIndex);

                } else {
                    if (isMultiple(yourNum0Array[index])) {
                        audio.play('WinFanfare',5);
                        audio.play('MultiplierFound',10);
                        gr.lib['_gameStar_' + index].show(true);
                        gr.lib['_gameStar_' + index].gotoAndPlay('star', 0.4);
                        gr.animMap['_WinningEffectLightball_Ani_' + index].play();
                        gr.animMap['_WinningEffectsSwirl_Ani_' + index].play(Number.MAX_VALUE);

                        //
                        console.log('your number '+ index + ' updateWinValue '+ (yourNum1Array[index] * Number(multipleMap[yourNum0Array[index]])));
                        gr.animMap['_PrizeBanner_Text_Ani_' + index].play();
                        updateWinValue(yourNum1Array[index] * Number(multipleMap[yourNum0Array[index]]),index);
                        
                        gr.animMap['_multiplier_Anim_'+index].play(Number.MAX_VALUE);
                    } else {
                        for (var i = 0; i < winNumArray.length; i++) { //play your num Anim
                            gr.lib['_YourNumbersBackgroundCircles_Text_' + gladAnim.index].show(true);
                            if (winNumOpened[i] === true) {
                                if (winNumArray[i] === yourNum0Array[index]) {
                                    gr.getTimer().setTimeout(function(){
                                        audio.play('Ping',4);
                                        audio.play('WinFanfare',5);
                                        console.log('your number '+ index + ' updateWinValue '+ yourNum1Array[index]);
                                        updateWinValue(yourNum1Array[index],index);
                                        //win num
                                        gr.animMap['_WinningMatchSwirl_Anim_' + i].play(Number.MAX_VALUE);
                                        gr.animMap['_WinningMatchEffectLightball_Anim_' + i].play();

                                        //your num
                                        gr.animMap['_WinningEffectLightball_Ani_' + gladAnim.index].play();
                                        gr.animMap['_WinningEffectsSwirl_Ani_' + gladAnim.index].play(Number.MAX_VALUE);
                                        gr.animMap['_PrizeBanner_Text_Ani_' + gladAnim.index].play();
                                    },timeBeforeShowWin);
                                    break;
                                }
                            }
                        }
                        if (i === 4) {
                            startBonus('your'+index);
                        }
                    }

                }
            };
        }

        function setYourNumGladComplete(gladAnim) {
            gladAnim._onComplete = function () {
                if(winBoxError){
                    return;
                }
                var index = gladAnim.index;
                yourNumOpened[index] = true;
                gr.lib['_segment_' + index].show(false);
                gr.lib['_segment_' + index].updateCurrentStyle({'_opacity': 1, '_transform': {'_rotate': 0}});
                gr.lib['_PrizeBanner_' + index].show(true);
                if (index === fuelIndex) { //play tween anim
                    gr.lib['_fuel_tail_' + index].show(false);
                    gr.lib['_fuel_' + index].show(true);
                    gr.lib['_YourNumbersBackgroundCircles_Text_' + index].show(true);
                    gr.lib['_YourNumbersBackgroundCircles_' + index].show(true);
                } else {
                    if (isMultiple(yourNum0Array[index])) {
                        gr.lib['_PrizeBanner_Text_' + index].updateCurrentStyle(winStyle);
                        gr.lib['_YourNumbersMatchBackgroundCircles_' + index].show(true);
                        gr.lib['_WinningEffectLightball_' + index].show(true);
                        gr.lib['_WinningEffectsSwirl_' + index].show(true);
                        gr.lib['_multiplier_' + index].setImage(orientation + '-' + multipleMap[yourNum0Array[index]] + 'x-multiplier');
                        gr.lib['_multiplier_' + index].show(true);                        
                    } else {
                        for (var i = 0; i < winNumArray.length; i++) { //play your num Anim
                            gr.lib['_YourNumbersBackgroundCircles_Text_' + gladAnim.index].show(true);
                            if (winNumOpened[i] === true) {
                                if (winNumArray[i] === yourNum0Array[index]) {
                                        console.log('your number '+ index + ' updateWinValue '+ yourNum1Array[index]);
                                        updateWinValue(yourNum1Array[index],index);
                                        //win num
                                        gr.lib['_WinNumbersBackgroundCircles_Text_' + i].updateCurrentStyle(winStyle);
                                        gr.lib['_WinningMatchSwirl_' + i].show(true);
                                        gr.lib['_WinningMatchEffectLightball_' + i].show(true);

                                        //your num
                                        gr.lib['_YourNumbersBackgroundCircles_Text_' + gladAnim.index].updateCurrentStyle(winStyle);
                                        gr.lib['_PrizeBanner_Text_' + gladAnim.index].updateCurrentStyle(winStyle);
                                        gr.lib['_YourNumbersMatchBackgroundCircles_' + gladAnim.index].show(true);
                                        gr.lib['_WinningEffectLightball_' + gladAnim.index].show(true);
                                        gr.lib['_WinningEffectsSwirl_' + gladAnim.index].show(true);
                                    break;
                                }
                            }
                        }
                        if (i === 4) {
//                            audio.play('NumReveal',1);
                            gr.lib['_YourNumbersBackgroundCircles_' + index].show(true);
                            gr.lib['_YourNumbersBackgroundCircles_Text_' + index].show(true);
                        }
                    }

                }
                gr.animMap['_YourNumbers_Anim_'+index].play();
            };
        }

        function setWinningEffectLightballGladComplete(gladAnim) {
            gladAnim._onComplete = function () {
                gr.lib['_WinningEffectLightball_' + gladAnim.index].show(false);
                gr.lib['_WinningEffectLightball_' + gladAnim.index].updateCurrentStyle({"_transform": {"_rotate": 0}});
                console.log('startBonus _WinningEffectLightball_ ' + gladAnim.index);
                startBonus('your'+gladAnim.index);
            };
        }

        function setWinningMatchEffectLightballGladComplete(gladAnim) {
            gladAnim._onComplete = function () {
                gr.lib['_WinningMatchEffectLightball_' + gladAnim.index].show(false);
                gr.lib['_WinningMatchEffectLightball_' + gladAnim.index].updateCurrentStyle({"_transform": {"_rotate": 0}});
                startBonus('win'+gladAnim.index);
            };
        }

        function setStarComplete(symbol) {
            symbol.onComplete = function () {
                gr.lib['_gameStar_' + symbol.gameIndex].show(false);
                if (symbol.gameIndex === fuelIndex) {
                    gr.animMap['_fuel_' + symbol.gameIndex + '_tween'].play();
                }
            };
        }
        
        function setFuelTweenGladAnimComplete(gladAnim){
            gladAnim._onComplete = function () {
                var index = gladAnim.index;
                audio.play('FuelMeterFilled', 8);
                var index = gladAnim.index;
                var top = gr.lib['_fuel_' + index].originTop;
                var left = gr.lib['_fuel_' + index].originLeft;

                gr.lib['_fuel_tail_' + index].stopPlay();
                gr.lib['_fuel_tail_' + index].show(false);
                gr.lib['_fuel_' + index].show(false);
                gr.lib['_fuel_' + index].updateCurrentStyle({'_top': top, '_left': left, "_transform": {"_scale": {"_x": "1", "_y": "1"}}});
                ticksUpdate(levelInfo.getCurrentTicks() + levelInfo.getFuelPoints(), levelInfo.getTicksToNextLevel());
                if (!fuelIsOnWinSymbol) {
                    startBonus('your' + gladAnim.index);
                }else{
                    gr.getTimer().setTimeout(function(){
                        audio.play('Ping', 4);
                        audio.play('WinFanfare', 5);
                        console.log('your number ' + index + ' updateWinValue ' + yourNum1Array[index]);
                        updateWinValue(yourNum1Array[index], index);
                        
                        for (var j = 0; j < 4; j++) {
                            if (winNumArray[j] === yourNum0Array[index]) {
                                break;
                            }
                        }                        
                        //win num
                        gr.lib['_WinNumbersBackgroundCircles_Text_' + j].updateCurrentStyle(winStyle);
                        gr.lib['_WinningMatchSwirl_' + j].show(true);
                        gr.lib['_WinningMatchEffectLightball_' + j].show(true);
                        gr.animMap['_WinningMatchSwirl_Anim_' + j].play();
                        gr.animMap['_WinningMatchEffectLightball_Anim_' + j].play();

                        //your num
                        gr.lib['_YourNumbersBackgroundCircles_Text_' + index].updateCurrentStyle(winStyle);
                        gr.lib['_PrizeBanner_Text_' + index].updateCurrentStyle(winStyle);
                        gr.lib['_YourNumbersMatchBackgroundCircles_' + index].show(true);
                        gr.lib['_WinningEffectLightball_' + index].show(true);
                        gr.lib['_WinningEffectsSwirl_' + index].show(true);
                        gr.animMap['_WinningEffectLightball_Ani_' + index].play();
                        gr.animMap['_WinningEffectsSwirl_Ani_' + index].play();
                        gr.animMap['_PrizeBanner_Text_Ani_' + index].play();
                    },300);
                }

            };
        }
        function setFuelTweenGladAnimStart(gladAnim){
            gladAnim._onStart = function () {
                var index = gladAnim.index;
                gr.lib['_fuel_tail_'+index].show(true);
                gr.lib['_fuel_tail_'+index].gotoAndPlay('fuel-trail',0.7,true);
            };
        }

        for (var i = 0; i < 4; i++) {
            gr.animMap['_WinningNumberWheelAni_' + i].index = i;
            setWinNumGladComplete(gr.animMap['_WinningNumberWheelAni_' + i]);
                        
            gr.animMap['_WINNumbers_Text_Anim_' + i].index = i;
            setWinNumScaleGladComplete(gr.animMap['_WINNumbers_Text_Anim_' + i]);

            gr.animMap['_WinningMatchEffectLightball_Anim_' + i].index = i;
            setWinningMatchEffectLightballGladComplete(gr.animMap['_WinningMatchEffectLightball_Anim_' + i]);


        }


        for (i = 0; i < YOURNumbers; i++) {
            gr.lib['_gameStar_' + i].gameIndex = i;
            setStarComplete(gr.lib['_gameStar_' + i]);

            gr.animMap['_segmentAni_' + i].index = i;
            setYourNumGladComplete(gr.animMap['_segmentAni_' + i]);
            
            gr.animMap['_YourNumbers_Anim_' + i].index = i;
            setYourNumScaleGladComplete(gr.animMap['_YourNumbers_Anim_' + i]);

            gr.animMap['_WinningEffectLightball_Ani_' + i].index = i;
            setWinningEffectLightballGladComplete(gr.animMap['_WinningEffectLightball_Ani_' + i]);
            
            gr.animMap['_fuel_' + i + '_tween'].index = i;
            setFuelTweenGladAnimComplete(gr.animMap['_fuel_' + i + '_tween']);
            setFuelTweenGladAnimStart(gr.animMap['_fuel_' + i + '_tween']);
        }
        
        gr.animMap['_GameSymbolAni']._onComplete = function () {
            audio.playAndFadeIn(6,'BGMusicLoop',true,6000);
            msgBus.publish('showGame');
            mapIsShown = false;
            for (i = 0; i < 4; i++) {
                gr.lib['_WinningNumberWheel_' + i].on('click', gr.lib['_WinningNumberWheel_' + i].revealFunc);
                gr.lib['_WinningNumberWheel_' + i].pixiContainer.$sprite.interactive = true;
                gr.lib['_WinningNumberWheel_' + i].pixiContainer.$sprite.cursor = "pointer";
            }
            for (i = 0; i < unlockNum; i++) {
                gr.lib['_segment_' + i].on('click', gr.lib['_segment_' + i].revealFunc);
                gr.lib['_segment_' + i].pixiContainer.$sprite.interactive = true;
                gr.lib['_segment_' + i].pixiContainer.$sprite.cursor = "pointer";
            }
            
            addIdolTimer();
            addEventOnLockedSegment();
        };

    }
    
    function hideUnlockTips() {
        for (var i = 12; i < 16; i++) {
            gr.lib['_unlockTips_' + i].show(false);
        }
    }

    function resetSymbol() {
//        gr.lib._GameSymbol.updateCurrentStyle({"_opacity": "0"});
        gr.lib._GameSymbol.show(false);
        gr.lib._bonusRoundMessage.updateCurrentStyle({"_opacity": "0"});
        
        gr.lib._unlock_plaque.updateCurrentStyle({"_opacity": 0});
        for (var i = 0; i < 4; i++) {
            gr.animMap['_fuel_max_star_' + i + '_Anim'].updateStyleToTime(0);
            gr.animMap['_WINNumbers_Text_Anim_' + i ].updateStyleToTime(0);
            gr.lib['_fuel_max_star_' + i].show(false);
        }
        
        hideUnlockTips();
        
        for (i = 0; i < YOURNumbers; i++) {
            yourNumOpened[i] = false;
            gr.animMap['_YourNumbers_Anim_'+i].updateStyleToTime(0);
            gr.animMap['_multiplier_Anim_'+i].updateStyleToTime(0);
            gr.lib['_WinningEffectsSwirl_' + i].show(false);
            gr.lib['_YourNumbersBackgroundCircles_Text_' + i].show(false);
            gr.lib['_PrizeBanner_' + i].show(false);
            gr.lib['_WinningEffectLightball_' + i].show(false);
            gr.lib['_YourNumbersBackgroundCircles_' + i].show(false);
            gr.lib['_YourNumbersMatchBackgroundCircles_' + i].show(false);
            gr.lib['_fuel_' + i].show(false);
            gr.lib['_multiplier_' + i].show(false);
            gr.lib['_gameStar_' + i].show(false);
            gr.lib['_fuel_tail_' + i].show(false);
            gr.lib['_segment_' + i].show(true);
            gr.lib['_segment_' + i].revealed = false;

            gr.lib['_YourNumbersBackgroundCircles_Text_' + i].updateCurrentStyle(noWinStyle);
            gr.lib['_PrizeBanner_Text_' + i].updateCurrentStyle(noWinStyle);
            gr.lib['_segment_' + i].updateCurrentStyle({"_transform": {"_rotate": 0}});
            gr.lib['_WinningEffectsSwirl_' + i].updateCurrentStyle({"_transform": {"_rotate": 0}});
            gr.lib['_WinningEffectLightball_' + i].updateCurrentStyle({"_transform": {"_rotate": 0}});
        }
        for (var i = 0; i < WinningNumbers; i++) {
            winNumOpened[i]=false;
            gr.lib['_WinNumbersBackgroundCircles_Text_' + i].updateCurrentStyle(noWinStyle);
            gr.lib['_WinningMatchSwirl_' + i].show(false);
            gr.lib['_WinningMatchEffectLightball_' + i].show(false);
            gr.lib['_WinNumbersBackgroundCircles_Text_' + i].show(true);
            gr.lib['_WinningNumberWheel_' + i].show(true);
            gr.lib['_WinningNumberWheel_' + i].revealed =false;

            gr.lib['_WinningMatchSwirl_' + i].updateCurrentStyle({"_transform": {"_rotate": 0}});
            gr.lib['_WinningMatchEffectLightball_' + i].updateCurrentStyle({"_transform": {"_rotate": 0}});
        }
    }

    function cloneGladAnim() {
        //clone win Number
        for (var i = 1; i < 4; i++) {
            var name = '_WinningNumberWheelAni_' + i;
            var list = [];
            list.push('_WinningNumberWheel_' + i);
            gr.animMap['_WinningNumberWheelAni_0'].clone(list, name);

            name = '_WinningMatchEffectLightball_Anim_' + i;
            list = [];
            list.push('_WinningMatchEffectLightball_' + i);
            gr.animMap['_WinningMatchEffectLightball_Anim_0'].clone(list, name);

            name = '_WinningMatchSwirl_Anim_' + i;
            list = [];
            list.push('_WinningMatchSwirl_' + i);
            gr.animMap['_WinningMatchSwirl_Anim_0'].clone(list, name);

            name = '_WINNumbers_Text_Anim_' + i;
            list = [];
            list.push('_WinNumbersBackgroundCircles_Text_' + i);
            gr.animMap['_WINNumbers_Text_Anim_0'].clone(list, name);
        }

        //clone your number
        for (i = 1; i < 16; i++) {
            var name = '_segmentAni_' + i;
            var list = [];
            list.push('_segment_' + i);
            gr.animMap['_segmentAni_0'].clone(list, name);

            name = '_WinningEffectsSwirl_Ani_' + i;
            list = [];
            list.push('_WinningEffectsSwirl_' + i);
            gr.animMap['_WinningEffectsSwirl_Ani_0'].clone(list, name);

            name = '_WinningEffectLightball_Ani_' + i;
            list = [];
            list.push('_WinningEffectLightball_' + i);
            gr.animMap['_WinningEffectLightball_Ani_0'].clone(list, name);
            
            
            name = '_PrizeBanner_Text_Ani_' + i;
            list = [];
            list.push('_PrizeBanner_Text_' + i);
            gr.animMap['_PrizeBanner_Text_Ani_0'].clone(list, name);
            
            name = '_segment_Idol_Ani_' + i;
            list = [];
            list.push('_segment_' + i);
            gr.animMap['_segment_Idol_Ani_0'].clone(list, name);
            
            name = '_YourNumbers_Anim_' + i;
            list = [];
            list.push('_YourNumbers_' + i);
            gr.animMap['_YourNumbers_Anim_0'].clone(list, name);
            
            name = '_multiplier_Anim_' + i;
            list = [];
            list.push('_multiplier_' + i);
            gr.animMap['_multiplier_Anim_0'].clone(list, name);
        }
    }
    
    function initEmitter() {
        var art;
        art = [];
        art.push(PIXI.Texture.fromImage('single-sparkle-big-3'));
        renderer = gr.getPixiRenderer();

        emitter = new Particles.Emitter(
                emitterContainer,
                art,
                emitterConfig
                );
    }

    var update = function () {
        if (emitter) {
            // Update the next frame
            updateId = requestAnimationFrame(update);

            var now = Date.now();
            emitter.update((now - elapsed) * 0.001);

            elapsed = now;

            // render the stage
            gr.forceRender();
        }
    };
    
    function startAnim(sp) {
        if (emitter) {
            var lp = spriteUtil.toGlobal(sp, {x: sp._currentStyle._width / 2, y: sp._currentStyle._height / 2});
            emitter.spawnPos.x = lp.x;
            emitter.spawnPos.y = lp.y;

//            emitter.updateSpawnPos(lp.x, lp.y);

            emitter.emit = true;
            elapsed = Date.now();
            update();
        }
    }
    function stopAnim() {
        if (emitter) {
            emitter.emit = false;
            emitter.destroy();
            emitter = null;
            
            //reset SpriteRenderer's batching to fully release particles for GC
            if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites) {
                renderer.plugins.sprite.sprites.length = 0;
            }

            gr.forceRender();
        }
    }
    
    function getCustConfigInfo(){
        if (SKBeInstant.config.customBehavior) {
            if (SKBeInstant.config.customBehavior.transferBonusIntervalWin !== undefined && Number(SKBeInstant.config.customBehavior.transferBonusIntervalWin) >= 0 ) {
                transferBonusIntervalWin = Number(SKBeInstant.config.customBehavior.transferBonusIntervalWin);
            }
            if (SKBeInstant.config.customBehavior.transferBonusIntervalNoWin !== undefined && Number(SKBeInstant.config.customBehavior.transferBonusIntervalNoWin) >= 0 ) {
                transferBonusIntervalNoWin = Number(SKBeInstant.config.customBehavior.transferBonusIntervalNoWin);
            }
        } else if (loader.i18n.gameConfig) {
            if (loader.i18n.gameConfig.transferBonusIntervalWin !== undefined && Number(loader.i18n.gameConfig.transferBonusIntervalWin) >= 0 ) {
                transferBonusIntervalWin = Number(loader.i18n.gameConfig.transferBonusIntervalWin);
            }
            if (loader.i18n.gameConfig.transferBonusIntervalNoWin !== undefined && Number(loader.i18n.gameConfig.transferBonusIntervalNoWin) >= 0 ) {
                transferBonusIntervalNoWin = Number(loader.i18n.gameConfig.transferBonusIntervalNoWin);
            }
        }
    }
    
    function onGameParametersUpdated() {
        getCustConfigInfo();
        emitterContainer = new PIXI.Container();
        gr.lib._GameSymbol.pixiContainer.addChild(emitterContainer);
        addSprite();
        gameUtils.setTextStyle(gr.lib['_WinningNumbersBanner_Text'], dropStyle);
        gameUtils.setTextStyle(gr.lib['_YourNumbersBanner_Text'], dropStyle);
        for (var i = 0; i < 4; i++) {
            winNumOpened.push(false);
            gameUtils.setTextStyle(gr.lib['_WinNumbersBackgroundCircles_Text_'+i], dropStyle);
        }
        for (i = 0; i < 16; i++) {
            yourNumOpened.push(false);
            gr.lib['_PrizeBanner_Text_'+i].autoFontFitText = true;
            gameUtils.setTextStyle(gr.lib['_PrizeBanner_Text_'+i], dropStyle);
            gameUtils.setTextStyle(gr.lib['_YourNumbersBackgroundCircles_Text_'+i], dropStyle);  
            
             gr.lib['_fuel_' + i].originTop = gr.lib['_fuel_' + i]._currentStyle._top;
             gr.lib['_fuel_' + i].originLeft = gr.lib['_fuel_' + i]._currentStyle._left;
            Tween.create(gr.lib['_fuel_' + i], gr.lib._FuelMeterPointer, 2000, {scale: {x: 0.8, y: 0.8}});
        }
        
        gameUtils.setTextStyle(gr.lib['_FuelInfo_Text'], dropStyle);
        gameUtils.setTextStyle(gr.lib['_FuelMeterLevel_Text'], dropStyle);
        
        gr.lib._unlock_text.autoFontFitText = true;
        gr.lib._unlock_text.setText(loader.i18n.Game.nextLevel);
        
        
        
        getFuelPointOrigin();
        orientation = SKBeInstant.getGameOrientation();
        if (orientation === 'landscape') {
            orientation = "Landscape";
        } else {
            orientation = "Portrait";
        }
        cloneGladAnim();
        setComplete();
        resetSymbol();
        setSymbolRevealFunc();

        if (SKBeInstant.config.customBehavior) {
            revealInterval = SKBeInstant.config.customBehavior.revealInterval || revealInterval;
            winningNumbersRevealInterval = SKBeInstant.config.customBehavior.winningNumbersRevealInterval || winningNumbersRevealInterval;
        }else if(loader.i18n.gameConfig){            
            revealInterval = loader.i18n.gameConfig.revealInterval || revealInterval;
            winningNumbersRevealInterval = loader.i18n.gameConfig.winningNumbersRevealInterval || winningNumbersRevealInterval;
        }

        if (orientation === "Landscape") {
            gr.lib._YourNumbersBanner_Text.setText(loader.i18n.Game.your_numbersL);
            gr.lib._WinningNumbersBanner_Text.setText(loader.i18n.Game.win_numbersL);
        } else {
            gr.lib._YourNumbersBanner_Text.setText(loader.i18n.Game.your_numbersP);
            gr.lib._WinningNumbersBanner_Text.setText(loader.i18n.Game.win_numbersP);
        }

        gr.lib._FuelMeterLevel_Text.autoFontFitText = true;
        gr.lib._FuelInfo_Text.autoFontFitText = true;
        gr.lib._Max_Text.autoFontFitText = true;
        
        var maxHeight = 146;
        for(i=12; i<16;i++){
            gr.lib['_unlockTips_'+i].show(false);
//            gr.lib['_unlockTips_text_'+i].autoFontFitText = true;
            gr.lib['_unlockTips_text_'+i].setText(loader.i18n.Game['unlocksegment_'+i]);
            gr.lib['_unlockTips_text_'+i].updateCurrentStyle({_top:(maxHeight  - gr.lib['_unlockTips_text_'+i].pixiContainer.$text.height)/2});
            setClick4Segment(gr.lib['_segment_'+i]);
            setMouseover4Segment(gr.lib['_segment_'+i]);
            setMouseout4Segment(gr.lib['_segment_'+i]);
        }
    }
    
    function setMouseover4Segment(symbol) {
        symbol.mouseoverFunc = function () {
            var index = symbol.index;
            if (clickedSymbol && clickedSymbol !== gr.lib['_unlockTips_' + index]) {
                clickedSymbol.show(false);
            }
            clickedSymbol = gr.lib['_unlockTips_' + index];
            gr.lib['_unlockTips_' + symbol.index].show(true);
        };
    }

    function setMouseout4Segment(symbol) {
        symbol.mouseoutFunc = function () {
            gr.lib['_unlockTips_' + symbol.index].show(false);
        };
    }
    
    function setClick4Segment(symbol) {
        symbol.clickFunc = function () {
            var index = symbol.index;
            if (clickedSymbol && clickedSymbol !== gr.lib['_unlockTips_' + index]) {
                clickedSymbol.show(false);
            }
            clickedSymbol = gr.lib['_unlockTips_' + index];
            var flag = gr.lib['_unlockTips_' + index].pixiContainer.visible;
            gr.lib['_unlockTips_' + index].show(!flag);
        };
    }
    
    function stopBaseGladAnim(){
        for (var i = 0; i < 4; i++) {
            gr.animMap['_fuel_max_star_' + i + '_Anim'].stop();
            gr.animMap['_WinningMatchSwirl_Anim_' + i].stop();
//            gr.animMap['_WinningMatchEffectLightball_Anim_' + i].stop();
        }
        
        for (i = 0; i < unlockNum; i++) {
//            gr.animMap['_WinningEffectLightball_Ani_' + i].stop();
            gr.animMap['_WinningEffectsSwirl_Ani_' + i].stop();
            gr.animMap['_multiplier_Anim_' + i].stop();
        }
    }
    
    function stopMaxFuelAnim() {
        gr.animMap._fuelPoint_Antis_anim.stop();
        gr.lib._FuelMeterPointer.updateCurrentStyle({"_opacity": 1});

        if (gr.animMap._unlock_plaque_anim.isPlaying()) {
            gr.animMap._unlock_plaque_anim.stop();
            gr.lib._unlock_plaque.updateCurrentStyle({"_opacity": 1});
        }
    }
    
    function addEventOnLockedSegment() {
        for (var i = unlockNum; i < 16; i++) {
            gr.lib['_segment_' + i].on('click', gr.lib['_segment_' + i].clickFunc);
            gr.lib['_segment_' + i].on('mouseout', gr.lib['_segment_' + i].mouseoutFunc);
            gr.lib['_segment_' + i].on('mouseover', gr.lib['_segment_' + i].mouseoverFunc);
        }
    }
            
    
    
    function removeEventOnLockedSegment() {
        for (var i = unlockNum; i < 16; i++) {
            gr.lib['_unlockTips_' + i].show(false);
            gr.lib['_segment_' + i].off('click');
            gr.lib['_segment_' + i].off('mouseout');
            gr.lib['_segment_' + i].off('mouseover');
        }
    }
    
    
    function startBonus(key) {        
        if(winBoxError || openedSymbol[key] || errorOn){
            return;
        }
        
        openedSymbol[key] = true;
        finishedNum++;
        console.log('startBonus: finishedNum '+ finishedNum);
        console.log('startBonus: unlockNum '+ unlockNum);
        
        if (finishedNum === (4 + unlockNum)) {
            clearIdolTimer();
            removeEventOnLockedSegment();
            if (bannerTimer) {
                bannerTimer = null;
                gr.getTimer().clearTimeout(bannerTimer);
            }
            var interval;
            if (winValue > 0 || winFuel === 1) {
                interval = transferBonusIntervalWin;
            } else {
                interval = transferBonusIntervalNoWin;
            }
            gr.getTimer().setTimeout(function () {
                stopAnim();
                stopMaxFuelAnim();
                gr.animMap._bonusRoundMessage_Anim.play();
                audio.stopChannel(6);//stop BGMusicLoop
                audio.play('WheelBonusChant',2);
                gr.getTimer().setTimeout(function () {
                    msgBus.publish('startBonus', {'winValue': money, 'bonusResult': winBonus});
                }, 1200);
            }, interval);
        }
    }

    function setSymbolRevealFunc() {
        function setWinSymbolRevealFun(symbol) {
            symbol.revealFunc = function () {
                if (mapIsShown || symbol.revealed) {
                    return;
                }
                symbol.revealed = true;
                clearIdolTimer();
                addIdolTimer();
                audio.play('WinNumReveal',2);
                audio.volume(2,0.7);
                symbol.off('click');
                symbol.pixiContainer.$sprite.cursor = "default";
                var index = symbol.index;
                startAnim(symbol);
                clickedNum++;
                if(clickedNum >= (4 + unlockNum)){
                    msgBus.publish('clickedAllSymbol');
                }
                gr.animMap['_WinningNumberWheelAni_' + index].play();
            };
        }
        function setYourSymbolRevealFun(symbol) {
            symbol.revealFunc = function () {
                if (mapIsShown || symbol.revealed) {
                    return;
                }
                symbol.revealed =true;
                clearIdolTimer();
                addIdolTimer();
                hideUnlockTips();
                audio.play('YourNumReveal',3);
                symbol.off('click');
                symbol.pixiContainer.$sprite.cursor = "default";
                
                var index = symbol.index;
                startAnim(symbol);
                clickedNum++;
                if (clickedNum >= (4 + unlockNum)) {
                    msgBus.publish('clickedAllSymbol');
                }
                gr.animMap['_segmentAni_' + index].play();
            };
        }

        for (var i = 0; i < 4; i++) {
            gr.lib['_WinningNumberWheel_' + i].index = i;
            setWinSymbolRevealFun(gr.lib['_WinningNumberWheel_' + i]);
        }
        for (i = 0; i < 16; i++) {
            gr.lib['_segment_' + i].index = i;
            setYourSymbolRevealFun(gr.lib['_segment_' + i]);
        }
    }


    function sceneUpdate() {
        var sceneName = levelInfo.getCurrentSceneName();
        function setLightBall(lightBallSprite) {
            if (sceneName === 'Beach' || sceneName === 'Forest') {
                lightBallSprite.setImage(orientation + '-Winning-Effect-Lightball-Yellow');
            } else {
                lightBallSprite.setImage(orientation + '-Winning-Effect-Lightball-Blue');
            }
        }

        function setSwirl(swirlSprite) {
            if (sceneName === 'Beach' || sceneName === 'City' || sceneName === 'Forest') {
                swirlSprite.setImage(orientation + '-Winning-Effects-Swirl-Purple');
            } else {
                swirlSprite.setImage(orientation + '-Winning-Effects-Swirl-orange');
            }
        }


        //set winning numbers
        for (var i = 0; i < WinningNumbers; i++) {
            gr.lib['_winningNumbersBackgroundCircles_' + i].setImage(orientation + '-Winning-Numbers-Background-Circle-' + sceneName);
            setLightBall(gr.lib['_WinningMatchEffectLightball_' + i]);
            setSwirl(gr.lib['_WinningMatchSwirl_' + i]);
        }
        gr.lib._WinningNumbersBackgroundPanel.setImage(orientation + '-Winning-Numbers-Background-Panel-' + sceneName);

        //set your numbers
        gr.lib._YourNumbersPanelPeak.setImage(orientation + '-Your-Numbers-Background-Panel-' + sceneName);
        for (var i = 0; i < YOURNumbers; i++) {
            gr.lib['_YourNumbersBackgroundCircles_' + i].setImage(orientation + '-Your-Numbers-Background-Circle-' + sceneName);
            gr.lib['_YourNumbersMatchBackgroundCircles_' + i].setImage(orientation + '-Winning-Numbers-Background-Circle-' + sceneName);
            gr.lib['_PrizeBanner_' + i].setImage('Prize-Banner-' + sceneName);
            setLightBall(gr.lib['_WinningEffectLightball_' + i]);
            setSwirl(gr.lib['_WinningEffectsSwirl_' + i]);
        }
        
        gr.lib._FuelMeterB.setImage('Fuel-Meter-'+sceneName);

        switch (sceneName) {
            case 'City':
                unlockNum = 13;
                gr.lib._Padlock_City.show(false);
                break;
            case 'Forest':
                unlockNum = 14;
                gr.lib._Padlock_City.show(false);
                gr.lib._Padlock_Forest.show(false);
                break;
            case 'Mountain':
                unlockNum = 15;
                gr.lib._Padlock_City.show(false);
                gr.lib._Padlock_Forest.show(false);
                gr.lib._Padlock_Mountain.show(false);
                break;
            case 'Peak':
                unlockNum = 16;
                gr.lib._Padlock_City.show(false);
                gr.lib._Padlock_Forest.show(false);
                gr.lib._Padlock_Mountain.show(false);
                gr.lib._Padlock_Peak.show(false);
                break;
        }
        for (var i = 0; i < unlockNum; i++) {
            gr.lib['_segment_' + i].setImage(sceneName + '-Segment');
        }

    }

    function levelUpdate() {
        var level = levelInfo.getCurrentLevel();
        if (level === 29) {
            gr.lib._levelDetail.show(false);
            gr.lib._Max_Text.show(true);
            gr.lib._Max_Text.setText(loader.i18n.Game.maxlevel);
        } else {
            gr.lib._levelDetail.show(true);
            gr.lib._Max_Text.show(false);           
            gr.lib._FuelMeterLevel_Text.setText(loader.i18n.Game.level + level);
        }
    }

    function ticksUpdate(currentTicks, sceneTicks) {
        var rotate;
        var pivotX, pivotY;
        if(levelInfo.getCurrentLevel() >= 29){
            rotate = 90;
        }else{
            gr.lib._FuelInfo_Text.setText(currentTicks + '/' + sceneTicks);
            gr.lib._MapFuelMeter_value.setText(currentTicks + '/' + sceneTicks);
            if (currentTicks >= sceneTicks) {
                rotate = 90;
            } else {
                rotate = 90 * currentTicks / sceneTicks;
            }           
        }

        pivotX = gr.lib._FuelMeterPointer._currentStyle._width / 2;
        pivotY = gr.lib._FuelMeterPointer._currentStyle._height / 2;
        var originX = pivotX + fuelPointOrigin.left;
        var originY = pivotY + fuelPointOrigin.top;

        var newX = originX - (pivotX - Math.cos(rotate * Math.PI / 180) * pivotX);
        var newY = originY - Math.sin(rotate * Math.PI / 180) * pivotX;
        var newLeft = newX - pivotX;
        if(newLeft<3){
            newLeft = 3;
        }
        
//        var newTop = newY - (pivotY / Math.cos(rotate * Math.PI / 180));
        var newTop = newY - pivotY;
        if(newTop<74){
            newTop = 74;
        }

        gr.lib._FuelMeterPointer.updateCurrentStyle({'_left': newLeft, '_top': newTop, '_transform': {'_rotate': 360-rotate}});
        if (levelInfo.getCurrentLevel() < 29) {
            playMaxAnim(rotate);
        }

    }
    
    function playMaxAnim(rotate) {
        if (rotate >= 75) {
            if (rotate === 90) {
                gr.animMap._fuelPoint_Antis_anim.stop();
                gr.lib._FuelMeterPointer.updateCurrentStyle({"_opacity": 1});
                
                gr.animMap._unlock_plaque_anim.play(Number.MAX_VALUE);
                
                for (var i = 0; i < 4; i++) {
                    gr.animMap['_fuel_max_star_' + i + '_Anim'].updateStyleToTime(0);
                    gr.lib['_fuel_max_star_' + i].show(true);
                    gr.animMap['_fuel_max_star_' + i + '_Anim'].play(Number.MAX_VALUE);
                }
            } else {
                gr.animMap._fuelPoint_Antis_anim.play(Number.MAX_VALUE);
            }
        }
    }

    function playBannerShine() {
        for (var i = 0; i < 4; i++) {
            gr.animMap['_'+ orientation+'BannerShineAni_' + i].play();
            
        }
        bannerTimer = gr.getTimer().setTimeout(playBannerShine, 15000 + Math.floor(Math.random() * 5000));//every 15-20s play again.
    }
    
    function addSprite() {
        var array = [];
        for (var i = 0; i < 10; i++) {
            array.push('fuel-trail_000' + i);
        }
        for (i = 10; i < 24; i++) {
            array.push('fuel-trail_00' + i);
        }
        Sprite.addSpriteSheetAnimation('fuel-trail', array);
    }

    function updateWinValue(value,index) {
        if(winSymbol[index]){
            return;
        }
        winSymbol[index] = value;
        
        money += value;
        if(money > winValue){
            winBoxError = true;
            msgBus.publish('winboxError', {errorCode: '29000'});
            return;
        }
        gr.lib._winsValue.setText(SKBeInstant.formatCurrency(money).formattedAmount);
        gameUtils.fixMeter(gr);
    }

    function resetParameter() {
        finishedNum = 0;
        money = 0;
        clickedNum = 0;
        winSymbol = {};
        openedSymbol = {};        
    }
    function onStartUserInteraction() {
        playBannerShine();
    }
    function isMultiple(yourNumber) {
        return /[WXYZ]/.test(yourNumber);
    }
    
    function updateAssets(){
        sceneUpdate();
        levelUpdate();
        if(levelInfo.getCurrentLevel() <29){            
            ticksUpdate(levelInfo.getCurrentTicks(), levelInfo.getTicksToNextLevel());
        }else{
            ticksUpdate();
        }
    }
    
    function handleData(data) {
        prizeTable = {};
        function getPrizeTable() {
            var rc = data.prizeTable;
            for (var i = 0; i < rc.length - 3; i++) {
                prizeTable[rc[i].description] = rc[i].prize;
            }
        }
        function analyzYourNumbers() {
            yourNum0Array = [];
            yourNum1Array = [];
            var unmatch = [];
            for (var i = 0; i < yourNumArray.length; i++) {
                var split = yourNumArray[i].split(':');
                if (!isMultiple(split[0])) {
                    gr.lib['_YourNumbersBackgroundCircles_Text_' + i].setText(split[0]);
                }
                yourNum0Array.push(split[0]);
                yourNum1Array.push(prizeTable[split[1]]);
                gr.lib['_PrizeBanner_Text_' + i].setText(SKBeInstant.formatCurrency(prizeTable[split[1]]).formattedAmount);
                if (winFuel === 1 && fuelIndex === -1) {
                    if (!isMultiple(split[0])) {
                        for (var j = 0; j < 4; j++) {
                            if (winNumArray[j] === split[0]) {
                                break;
                            }
                        }
                        if (j === 4) { //didn't match
                            unmatch.push(i);
                        }
                    }

                }
            }
            if(winFuel === 1){
                if (fuelIndex === -1) {
                    if (unmatch.length === 0) { //in case all symbol is matched.
                        fuelIndex = Math.floor(Math.random() * unlockNum);
                        fuelIsOnWinSymbol = true;
                    } else {
                        fuelIndex = unmatch[Math.floor(Math.random() * unmatch.length)];
                    }
                    msgBus.publish('setFuelIndex', fuelIndex);
                }else{
                    for (var j = 0; j < 4; j++) {
                        if (winNumArray[j] === yourNum0Array[fuelIndex]) {
                            fuelIsOnWinSymbol = true;
                            break;
                        }
                    }
                }
            }
        }
        winNumArray = [];
        yourNumArray = [];
        winBonus = 0;
        winFuel = 0;
        var splitArray = null;
        if (data.scenario) {
            getPrizeTable();
            splitArray = data.scenario.split('|');

            winNumArray = splitArray[0].split(',');
            for (var i = 0; i < winNumArray.length; i++) {
                gr.lib['_WinNumbersBackgroundCircles_Text_' + i].setText(winNumArray[i]);
            }

            winBonus = Number(splitArray[1]);
            winFuel = Number(splitArray[2]);
            if(levelInfo.getCurrentLevel() >= 29){
                winFuel = 0;
            }

            yourNumArray = splitArray[levelInfo.getCurrentScene()+2].split(',');
            
            analyzYourNumbers();

            playResult = data.playResult;
            if (playResult === "WIN") {
                winValue = data.prizeValue;
            } else {
                winValue = 0;
            }
        } else {
            return;
        }
 
    }

    function onPlayerWantsPlayAgain() {
        fuelIsOnWinSymbol = false;
        fuelIndex = -1;
        stopBaseGladAnim();
        resetSymbol();
    }

    function onReInitialize() {
        fuelIsOnWinSymbol = false;
        fuelIndex = -1;
        resetSymbol();
    }

    function onFinishedGetInfo(data){
        initEmitter();
        updateAssets();
        resetParameter();
//        gr.lib._GameSymbol.updateCurrentStyle({"_opacity": "0"});
        handleData(data);
    }

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', function(){
        gr.lib._GameSymbol.show(false);
    });
    msgBus.subscribe('playerWantsPlayAgain', onPlayerWantsPlayAgain);
    
    function clearIdolTimer() {
        if (idolTimer) {
            console.log('clear timer');
            gr.getTimer().clearTimeout(idolTimer);
            idolTimer = null;
        }
    }
    function addIdolTimer() {
        idolTimer = gr.getTimer().setTimeout(function(){
             if (finishedNum === (4 + unlockNum)){
                 return;
             }
             var index =  Math.floor(Math.random()*unlockNum);
             console.log('add timer '+index);
             if(yourNumOpened[index]){
                 addIdolTimer();
             }else{
                gr.animMap['_segment_Idol_Ani_'+index]._onComplete=function(){
                    addIdolTimer();
                };
                gr.animMap['_segment_Idol_Ani_'+index].play(); 
             }
            
        },(Math.floor(Math.random()*2000)+2000));
    }
    msgBus.subscribe('startReveallAll', function () {
        hideUnlockTips();
        var delayTime = 0;
        for (var i = 0; i < 4; i++) {
            if (!winNumOpened[i]) {
                gr.lib['_WinningNumberWheel_' + i].off('click');
                gr.lib['_WinningNumberWheel_' + i].pixiContainer.$sprite.cursor = "default";
                gr.lib['_WinningNumberWheel_' + i].revealTimer = gr.getTimer().setTimeout(gr.lib['_WinningNumberWheel_' + i].revealFunc, delayTime);
                delayTime += winningNumbersRevealInterval;
            }
        }
        for ( i = 0; i < unlockNum; i++) {
            if(!yourNumOpened[i]){
                gr.lib['_segment_' + i].off('click');
                gr.lib['_segment_' + i].pixiContainer.$sprite.cursor = "default";
                gr.lib['_segment_'+i].revealTimer = gr.getTimer().setTimeout(gr.lib['_segment_'+i].revealFunc, delayTime);
                delayTime += revealInterval;
            }
        }
        removeEventOnLockedSegment();
    });
    msgBus.subscribe('stopRevealAll', function () {
        for (var i = 0; i < 4; i++) {            
            if (!winNumOpened[i]){
                gr.lib['_WinningNumberWheel_' + i].on('click', gr.lib['_WinningNumberWheel_' + i].revealFunc);
                gr.lib['_WinningNumberWheel_' + i].pixiContainer.$sprite.cursor = "pointer";
                gr.getTimer().clearTimeout(gr.lib['_WinningNumberWheel_' + i].revealTimer);                
            }
        }
        for (i = 0; i < unlockNum; i++) {
            if (!yourNumOpened[i]){
                gr.lib['_segment_' + i].on('click', gr.lib['_segment_' + i].revealFunc);
                gr.lib['_segment_' + i].pixiContainer.$sprite.cursor = "pointer";
                gr.getTimer().clearTimeout(gr.lib['_segment_' + i].revealTimer);                
            }
        }
        addEventOnLockedSegment();
    });

    msgBus.subscribe('mapIsShown', function () {
        mapIsShown = true;
        clearIdolTimer();
    });
    msgBus.subscribe('mapIsHide', function () {
        mapIsShown = false;
        addIdolTimer();
    });

    msgBus.subscribe('finishedGetInfo', onFinishedGetInfo);
    msgBus.subscribe('updateFuelIndex', function(index){
        fuelIndex = index;
    });
    
    function onError() {
        errorOn = true;
        for (var i = 0; i < 4; i++) {
            if (!winNumOpened[i]) {
                gr.lib['_WinningNumberWheel_' + i].off('click');
                gr.lib['_WinningNumberWheel_' + i].pixiContainer.$sprite.cursor = "default";
                gr.getTimer().clearTimeout(gr.lib['_WinningNumberWheel_' + i].revealTimer);
            }
        }
        for (i = 0; i < unlockNum; i++) {
            if (!yourNumOpened[i]) {
                gr.lib['_segment_' + i].off('click');
                gr.lib['_segment_' + i].pixiContainer.$sprite.cursor = "default";
                gr.getTimer().clearTimeout(gr.lib['_segment_' + i].revealTimer);
            }
        }

        removeEventOnLockedSegment();
    }
    
    msgBus.subscribe('winboxError', onError);
    
    msgBus.subscribe('jLottery.error', onError);


});