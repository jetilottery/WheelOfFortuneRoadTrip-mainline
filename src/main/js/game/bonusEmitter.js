define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'com/pixijs/pixi',
    'com/pixijs/pixi-particles',
    'skbJet/component/gladRenderer/view/spriteUtil'
], function (msgBus, gr, PIXI, Particles, spriteUtil) {
    var config = {
        "alpha": {
            "start": 1,
            "end": 0
        },
        "scale": {
            "start": 0.6,
            "end": 0.4,
            "minimumScaleMultiplier": 2
        },
        "color": {
            "start": "ffffff",
            "end": "ffffff"
        },
        "speed": {
            "start": 300,
            "end": 150,
            "minimumSpeedMultiplier": 1
        },
        "acceleration": {
            "x": 0,
            "y": 0
        },
        "maxSpeed": 0,
        "startRotation": {
            "min": 215,
            "max": 325
        },
        "noRotation": false,
        "rotationSpeed": {
            "min": 1,
            "max": 250
        },
        "lifetime": {
            "min": 1,
            "max": 5
        },
        "blendMode": "normal",
        "frequency": 0.01,
        "emitterLifetime": -1,
        "maxParticles": 493,
        "pos": {
            "x": 0,
            "y": 0
        },
        "addAtBack": false,
        "spawnType": "rect",
        "spawnRect": {
            "x": 0,
            "y": 0,
            "w": 0,
            "h": 0
        }
    };


    var emitter = null, renderer ;

    // Calculate the current time
    var elapsed;
    elapsed = Date.now();  

    var updateId;
    var playResult;

    // Update function every frame
    var update = function () {        
        if (emitter){
        // Update the next frame
        updateId = requestAnimationFrame(update);

        var now = Date.now();
        emitter.update((now - elapsed) * 0.001);

        elapsed = now;
        
        // render the stage
        gr.forceRender();
        }
    };


    function destroyEmitter() {
        emitter.destroy();
        emitter = null;

        //reset SpriteRenderer's batching to fully release particles for GC
        if (renderer.plugins && renderer.plugins.sprite && renderer.plugins.sprite.sprites){
            renderer.plugins.sprite.sprites.length = 0;
        }

        gr.forceRender();        
    }

    function startAnim() {
        if (emitter) {
            var lp = spriteUtil.toGlobal(gr.lib._winCoinShower, {x: gr.lib._winCoinShower.pixiContainer.x, y: gr.lib._winCoinShower.pixiContainer.y + gr.lib._winCoinShower._currentStyle._height / 2});
            emitter.updateOwnerPos(lp.x, lp.y);
            emitter.emit = true;
            elapsed = Date.now();
            update();
        }
    }
    
    function stopAnim(){
        if (emitter) {
            emitter.emit = false;
            destroyEmitter();
        }
    }
    function resultAnim() {
        if (!emitter && playResult === "WIN") {
            init();
            startAnim();
        }
    }
    
    function init() {
        var art;
        art = [];
        art.push(PIXI.Texture.fromImage('single-sparkle-big-3'));
        renderer = gr.getPixiRenderer();

        emitter = new Particles.Emitter(
                gr.lib._winCoinShower.pixiContainer,
                art,
                config
                );
    }

    function initEmitter(obj) {
        if (Number(obj.bonusResult) !== 0) {
            init();
        }
    }
     msgBus.subscribe('startBonus',initEmitter);
     msgBus.subscribe('playCoinShower',startAnim);
     msgBus.subscribe('finishedGetInfo', function(data){
         playResult = data.playResult;
     });
      msgBus.subscribe('jLottery.enterResultScreenState', resultAnim);
     msgBus.subscribe('playerWantsPlayAgain', stopAnim);
     msgBus.subscribe('closeResult', stopAnim);
     msgBus.subscribe('jLotteryGame.playerWantsToMoveToMoneyGame', stopAnim);

});

