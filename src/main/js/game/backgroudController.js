/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

define([
        'com/pixijs/pixi',
		'skbJet/component/gameMsgBus/GameMsgBus',
        'skbJet/component/SKBeInstant/SKBeInstant',
        'skbJet/component/gladPixiRenderer/gladPixiRenderer',
         'skbJet/component/pixiResourceLoader/pixiResourceLoader',
        'game/levelController'
    ], function(PIXI, msgBus, SKBeInstant, gr, pixiResourceLoader, levelInfo){   
var gce;
var blackImgUrl;
var sceneName;

    function setGameBackground(){
        var currentSceneName = levelInfo.getCurrentSceneName();
        if(sceneName !== currentSceneName){
            sceneName = currentSceneName;
            var orientation = SKBeInstant.getGameOrientation();
           gr.lib._GameSymbol.setImage(orientation +''+ sceneName + 'BG');
        }
    }
    
    function getBlackURL(){
        gce = SKBeInstant.getGameContainerElem();
        var orientation = SKBeInstant.getGameOrientation();
		
        var imgUrl = orientation + 'Loading';
		//get imgUrl from PIXI cache, or generate base64 image object from pixiResourceLoader
		var cacheImg = PIXI.utils.TextureCache[imgUrl];
		if(cacheImg&&cacheImg.baseTexture.imageUrl.match(imgUrl+'.png')){
			blackImgUrl = cacheImg.baseTexture.imageUrl;
		}else{
			blackImgUrl = pixiResourceLoader.getImgObj(imgUrl).src;
		}        
    }
    function setBlackGround(){
        if (!blackImgUrl) {
            getBlackURL();
        }
        //avoid blank background between two background switch.
		gce.style.backgroundImage = gce.style.backgroundImage+', url('+blackImgUrl+')';
		setTimeout(function(){
			gce.style.backgroundImage = 'url('+blackImgUrl+')';
		}, 40);
    }
    
    msgBus.subscribe('mapStartButtonClicked', function(){
        gr.animMap._colorfulAni.play();
    });

    msgBus.subscribe('finishedGetInfo', setGameBackground);
    msgBus.subscribe('SKBeInstant.gameParametersUpdated', function(){
        gr.animMap._colorfulAni._onComplete = function(){
            gr.animMap._colorfulAni.play();
        };
    });

    
    
    return {
        setBlackGround:setBlackGround
    };
});

