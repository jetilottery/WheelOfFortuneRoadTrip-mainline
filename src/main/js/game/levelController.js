

define([
    'skbJet/component/gameMsgBus/GameMsgBus',
    'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
    'skbJet/component/gladPixiRenderer/gladPixiRenderer',
    'skbJet/component/SKBeInstant/SKBeInstant',
    'skbJet/component/pixiResourceLoader/pixiResourceLoader'
], function (msgBus, audio, gr, SKBeInstant, loader) {
    var json_rds;
    var lastFuelPrice = 0;
    var preLevel = 1;
//    var preScene = 1;
    var currentLevel = 1;
    var currentScene = 1;
    var currentTicks = 1;
    var prizePointList = [];
    var map = {
        1: "Beach", //yellow
        2: "City", //blue
        3: "Forest", //green
        4: "Mountain", //red
        5: "Peak"//
    };
    var cents = [0, 6000, 6000, 6000, 6000];
    var ticks = [0, 120, 120, 120, 120]; //for scene
    var ticksForPrice = {1: {}, 2: {}, 3: {}, 4: {}};
    var sceneLevels = [0, 4, 6, 8, 10, 1];
    var currentPrice = 50;
    var levelUpType = 1; //1 is based on overall and 2 is based on how much they have previously spent on the game at that specific price point
    var ticketId = null;
//    var currentData = {fuel:0, fuelAdded:false};
    var fuelIndex = -1;
//    var skbRevealData;

    function getPrizePointList() {
        var length = SKBeInstant.config.gameConfigurationDetails.revealConfigurations.length; //When with phase 1 and jLottery, gameConfigurationDetails.revealConfigurations just contain current price.
        for (var i = 0; i < length; i++) {
            var price = SKBeInstant.config.gameConfigurationDetails.revealConfigurations[i].price;
            prizePointList.push(price);
        }
    }

    function getCustConfigInfo() {
        getPrizePointList();

        if (SKBeInstant.config.customBehavior) {
            for (var i = 1; i < 5; i++) { //get cents Level
                if (SKBeInstant.config.customBehavior['scene' + i + 'Cents']) {
                    cents[i] = Number(SKBeInstant.config.customBehavior['scene' + i + 'Cents']);
                }
            }
            if (Number(SKBeInstant.config.customBehavior.levelUpType) === 2) {
                levelUpType = 2;
            }
        } else if (loader.i18n.gameConfig) {
            for (var i = 1; i < 5; i++) { //get cents Level
                if (loader.i18n.gameConfig['scene' + i + 'Cents']) {
                    cents[i] = Number(loader.i18n.gameConfig['scene' + i + 'Cents']);
                }
            }
            if (Number(loader.i18n.gameConfig.levelUpType) === 2) {
                levelUpType = 2;
            }
        }

        for (var i = 1; i < 5; i++) { //get cents Level
            ticks[i] = cents[i] / 50;
            for (var j = 0; j < prizePointList.length; j++) { //set ticks per play based on scene and price point.
                ticksForPrice[i][prizePointList[j]] = prizePointList[j] / 50;
            }
        }
    }

    function getSceneAndLevel(total) {
//        var count = json_rds.revealDataSave.count;
//        var total = 0, target = 0;
        var target = 0;
        var sceneNum = 0;
        var levelNum = 0;
        var ticksNum = 0;

        for(var i=1; i<5; i++){
            target = 0;
            for(var j=1; j<=i; j++){
                target += sceneLevels[j]*cents[j];
            }
            if(total <= target){
                sceneNum = i;
                break;
            }
        }
        if(total > target){
            sceneNum = 5;
            levelNum = 29;
        } else {
            var level = 0;
            var sceneMoney = 0;
            
                for (i = 1; i < sceneNum; i++) {
                    level += sceneLevels[i];
                    sceneMoney += sceneLevels[i] * cents[i];
                }
                levelNum = level + Math.ceil((total - sceneMoney) / cents[sceneNum]);
                if ((total- sceneMoney)%cents[sceneNum] === 0) {
                    ticksNum = cents[sceneNum] / 50;
                } else {
                    ticksNum = (total - sceneMoney) % cents[sceneNum] / 50;
                }
        }
        return {'scene':sceneNum, 'level':levelNum, 'ticks':ticksNum};
    }

    function escapeCharacter(rdsData) {
        return {revealDataSave:JSON.stringify(rdsData.revealDataSave), wagerDataSave:JSON.stringify(rdsData.wagerDataSave), spots: 0,amount: 0};
    }
	function publishMSG(){
        if (SKBeInstant.config.wagerType !== 'TRY') {
            if (SKBeInstant.isSKB()) {
                msgBus.publish('jLotteryGame.revealDataSave', json_rds);
            } else {
                msgBus.publish('jLotteryGame.revealDataSave', escapeCharacter(json_rds));
            }
        }
	}
    function setInitialRevealDataSave() {
        for (var j = 0; j < prizePointList.length; j++) {
            json_rds.revealDataSave.count[prizePointList[j]] = {playNum:0,fuelNum:0};
        }
    }
    
    function getRevealDataFromResponse(data) {
        var targetData;
        if (!data.revealData || data.revealData === "null") //jLottery MTM will return "null" revealData WFTIW-108
        {
            return;
        }
        if (SKBeInstant.isSKB()) {
            targetData = data.revealData;
        } else {
            var responseRevealData = data.revealData.replace(/\\/g, '');
            responseRevealData = JSON.parse(responseRevealData);
            targetData = responseRevealData;
        }
        return targetData;
    }
    

    function onGameParametersUpdated() {
        getCustConfigInfo();
        getCurrentScene();
    }
    
    function getTotol() {
        var count = json_rds.revealDataSave.count;
        var total = 0;
        if (levelUpType === 1) {
            for (var key in count) {
                total += key * count[key].playNum;
                total += key * count[key].fuelNum;
            }
        } else {
            total += currentPrice * count[currentPrice].playNum;
            total += currentPrice * count[currentPrice].fuelNum;
        }
        return total;
    }
   

	function onStartUserInteraction(data) {
        currentPrice = data.price;
        lastFuelPrice = 0;
        json_rds = {
            revealDataSave: {count: {}},
            wagerDataSave: {},
            spots: 0,
            amount: 0
        };
        if (SKBeInstant.config.wagerType === 'TRY') {
            setInitialRevealDataSave();
            json_rds.revealDataSave.count[currentPrice].playNum++;
        } else {
            if(SKBeInstant.isSKB()){
                ticketId = data.ticketId;
            }else{
                ticketId = data.scenario.substr(0,15);
            }
            
            var targetData = getRevealDataFromResponse(data);

            if (targetData) {
                json_rds.revealDataSave.count = targetData.count;
                if (levelUpType === 1) {
                    for (var key in targetData.count) {
                        if (targetData.count[key].winFuel) {
                            lastFuelPrice = key;
                            break;
                        }
                    }
                }else{
                    if(targetData.count[currentPrice].winFuel){
                        lastFuelPrice = currentPrice;
                    }
                }
            } else {
                setInitialRevealDataSave();
                targetData = {};
                targetData.count = {};
                for (var j = 0; j < prizePointList.length; j++) {
                    targetData.count[prizePointList[j]] = {playNum: 0, fuelNum: 0};
                }
            }
            if (SKBeInstant.config.gameType === 'normal' || !targetData[ticketId]) {
                if(json_rds.revealDataSave.count[currentPrice] === undefined){
                    json_rds.revealDataSave.count[currentPrice] = {playNum: 0, fuelNum: 0};
                }
                json_rds.revealDataSave.count[currentPrice].playNum++;
                var splitArray = data.scenario.split('|');
                var winFuelSymbol = Number(splitArray[2]);
                json_rds.revealDataSave[ticketId]={};
                json_rds.revealDataSave[ticketId].fuel = winFuelSymbol;
                json_rds.revealDataSave[ticketId].fuelAdded = false;         
                json_rds.revealDataSave[ticketId].fuelIndex = -1;    
//                publishMSG();
            }else{
                json_rds.revealDataSave[ticketId] = targetData[ticketId];
                if (json_rds.revealDataSave[ticketId].fuel) {
                    fuelIndex = targetData[ticketId].fuelIndex;
                    msgBus.publish('updateFuelIndex', fuelIndex);
                }
//                publishMSG();
            }
            if (lastFuelPrice) {
                json_rds.revealDataSave.count[lastFuelPrice].winFuel = true;
            }
            publishMSG();
        }
        
        var total = getTotol();
        var currentTotal = total;
        if(json_rds.revealDataSave[ticketId] && json_rds.revealDataSave[ticketId].fuelAdded){//ticketReady
                currentTotal = total - currentPrice;                
        }
        var current = getSceneAndLevel(currentTotal);
        currentScene = current.scene;
        currentLevel = current.level;
        currentTicks = current.ticks;
        
        var preTotal = total - currentPrice - lastFuelPrice;
        if(preTotal===0){
            preLevel = 1;
        }else{            
            var pre = getSceneAndLevel(preTotal);
    //        preScene = pre.scene;
            preLevel = pre.level;
        }
        
        
//        getCurrentSceneAndLevel();
        
        
        
        msgBus.publish('finishedGetInfo', data);
        
	}

    msgBus.subscribe('SKBeInstant.gameParametersUpdated', onGameParametersUpdated);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
    msgBus.subscribe('jLottery.reStartUserInteraction', onStartUserInteraction);
    msgBus.subscribe('onStartGameInitial', function(){
        SKBeInstant.parseOdeResp(true);
    });
    
    msgBus.subscribe('revealedFuel', function (index) {
        if ((json_rds.revealDataSave[ticketId]) &&(!json_rds.revealDataSave[ticketId].fuelAdded)) {
            json_rds.revealDataSave.count[currentPrice].fuelNum++;
            json_rds.revealDataSave.count[currentPrice].winFuel = true;
            json_rds.revealDataSave[ticketId].fuel = 1;
            json_rds.revealDataSave[ticketId].fuelAdded = true;
            json_rds.revealDataSave[ticketId].fuelIndex = index;
            publishMSG();
        }
    });
    msgBus.subscribe('setFuelIndex',function(index){
        if (json_rds.revealDataSave[ticketId]) {
            json_rds.revealDataSave[ticketId].fuelIndex = index;
            publishMSG();
        }
    });
    msgBus.subscribe('mapStartButtonClicked',function(){
        if (lastFuelPrice !== 0 && SKBeInstant.config.wagerType !== 'TRY') {
            json_rds.revealDataSave.count[lastFuelPrice].winFuel =false;
            publishMSG();
        }
    });
    
    function getFuelPoints() {
        return ticksForPrice[currentScene][currentPrice];
    }
    function getCurrentLevel(){
        return currentLevel;
    }
    function getCurrentScene(){
        return currentScene;
    }
    function getTicksToNextLevel(){
        return ticks[currentScene];
    }
    function getCurrentTicks(){
        return currentTicks;
    }
    function getCurrentSceneName(){
        return map[currentScene];
    }
    function getPreLevel(){
        return preLevel;
    }
    
    function getLevelUpType(){
        return levelUpType;
    }
    return{
        getFuelPoints:getFuelPoints,
        getCurrentLevel:getCurrentLevel,
        getCurrentScene:getCurrentScene,
        getCurrentSceneName:getCurrentSceneName,
        getCurrentTicks:getCurrentTicks,
        getTicksToNextLevel:getTicksToNextLevel,
        getPreLevel:getPreLevel,
        getLevelUpType:getLevelUpType
    };
});

