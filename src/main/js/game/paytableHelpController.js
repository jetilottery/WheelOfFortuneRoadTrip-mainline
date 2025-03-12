define([
		'skbJet/component/gameMsgBus/GameMsgBus',
		'skbJet/component/gladPixiRenderer/gladPixiRenderer',
        'skbJet/component/pixiResourceLoader/pixiResourceLoader',
		'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer',
        'skbJet/component/SKBeInstant/SKBeInstant',
        'game/configController'
	], function(msgBus, gr, loader, audio, SKBeInstant, config){

    function onSystemInit(){
        var articles=document.getElementsByTagName('article');
        for(var i=0;i<articles.length;i++){
            articles[i].addEventListener('mousedown',preventDefault,false);
        }
        document.addEventListener('mousemove',preventDefault,false);
	}
    
    function preventDefault(e){
        var ev=e||window.event;
        ev.returnValue=false;
        ev.preventDefault();
    }

    function onGameInit(){
        registerConsole();   
    }

    function onBeforeShowStage(){
        fillHeaders();
        fillContent();
        fillCloseBtn();
        if(config.helpClickList){
            registerHelpList();
        }
    }
    
    function onStartUserInteraction(){
        disableConsole();       
    }
    
    function onReStartUserInteraction(){
        disableConsole();        
    }
    
    function onReInitialize(){
         enableConsole();  
    }

    function registerConsole(){
        var paytableText, howToPlayText;
        if(SKBeInstant.isWLA()){
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        }else{
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'paytable',
                    text:paytableText,
                    enabled:1
                }]
            }
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Register",
            data:{
                options:[{
                    type:'command',
                    name:'howToPlay',
                    text:howToPlayText,
                    enabled:1
                }]
            }
        });
    }

    function enableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[1]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[1]}
        });
    }  
    
    function disableConsole(){
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"howToPlay","event":"enable","params":[0]}
        });
        msgBus.publish('toPlatform',{
            channel:"Game",
            topic:"Game.Control",
            data:{"name":"paytable","event":"enable","params":[0]}
        });
    }

    function fillHeaders(){
        var gameRulesHeader = document.getElementById('gameRulesHeader');
        var payTableHeader = document.getElementById('paytableHeader');
        var paytableText, howToPlayText;
        if (SKBeInstant.isWLA()) {
            paytableText = loader.i18n.MenuCommand.WLA.payTable;
            howToPlayText = loader.i18n.MenuCommand.WLA.howToPlay;
        } else {
            paytableText = loader.i18n.MenuCommand.Commercial.payTable;
            howToPlayText = loader.i18n.MenuCommand.Commercial.howToPlay;
        }
        gameRulesHeader.innerHTML = howToPlayText;
        payTableHeader.innerHTML = paytableText;
    }

    function fillContent(){
        //fill paytable
        var paytableText = loader.i18n.paytableHTML.replace(/\"/g,"'");
        var name;
        if (SKBeInstant.isWLA()) {
            name = loader.i18n.title + " - " + loader.i18n.MenuCommand.WLA.payTable;
        } else {
            name = loader.i18n.title + " - " + loader.i18n.MenuCommand.Commercial.payTable;
        }
        paytableText = paytableText.replace('{name}',name);
        
        var tHead = '<table><thead><th>'+ loader.i18n.Game.prizeLevel + '</th><th>' + loader.i18n.Game.prizeValue + '</th></thead>';
        var tBody = '';
        
        var revealConfigurations = SKBeInstant.config.gameConfigurationDetails.revealConfigurations;
        var i, j;
        for (i = 0; i < revealConfigurations.length; i++) {
            tBody += '<h2>' + loader.i18n.Game.paytableWager + SKBeInstant.formatCurrency(revealConfigurations[i].price).formattedAmount + '</h2><p> </p>';
            tBody += tHead;
            tBody += '<tbody>';
            var prizeTable = revealConfigurations[i].prizeTable;
            for(j=0; j< prizeTable.length; j++){
                tBody += '<tr><td>' + (j+1) + '</td><td>' + SKBeInstant.formatCurrency(prizeTable[j].prize).formattedAmount + '</td></tr>';                
            }
            tBody += '</tbody></table>';            
        }
        
        paytableText = paytableText.replace('{paytableBody}',tBody);
        
         if(SKBeInstant.isWLA()){
             paytableText = paytableText.replace('{payBackInfo}','').replace('{payback}','').replace(/{REVEALALL}/g, loader.i18n.MenuCommand.WLA.button_autoPlay).replace(/{RevealAll}/g,loader.i18n.MenuCommand.WLA.button_autoPlay_title);
         }else{
            var minRTP = SKBeInstant.config.gameConfigurationDetails.minRTP;
            var maxRTP = SKBeInstant.config.gameConfigurationDetails.maxRTP;
            var paybackRTP = "";
			//RGS5.2 doesn't support RTP value, so hard-code RTP for game rules.
			if(!minRTP || !maxRTP){
                paybackRTP = loader.i18n.Paytable.hardCodeRTP;
			}else{
				if(minRTP === maxRTP){
					loader.i18n.Paytable.RTPvalue = loader.i18n.Paytable.RTPvalue.replace('{@minRTP}',minRTP);
					paybackRTP = loader.i18n.Paytable.RTPvalue;
				}else{
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@minRTP}',minRTP);
					loader.i18n.Paytable.RTPrange = loader.i18n.Paytable.RTPrange.replace('{@maxRTP}',maxRTP);
					paybackRTP = loader.i18n.Paytable.RTPrange;
				}	
			}
            loader.i18n.Paytable.paybackBody = loader.i18n.Paytable.paybackBody.replace('{RTP}',paybackRTP);
            var payback = '<h3>'+ loader.i18n.Paytable.paybackTitle +'</h3><p>'+loader.i18n.Paytable.paybackBody+'</p>';
            
            paytableText = paytableText.replace('{payBackInfo}',loader.i18n.Paytable.payBackInfo).replace('{payback}',payback).replace(/{REVEALALL}/g,loader.i18n.MenuCommand.Commercial.button_autoPlay).replace(/{RevealAll}/g,loader.i18n.MenuCommand.Commercial.button_autoPlay_title);
         }
        
        var paytableBox = document.getElementById('paytableArticle');
        paytableBox.innerHTML = paytableText;
        
        var howToPlayText = loader.i18n.helpHTML.replace(/\"/g,"'");
        
        var howToPlayBox = document.getElementById('gameRulesArticle');
        howToPlayBox.innerHTML = howToPlayText;
    }
    
    function fillCloseBtn(){
        var buttons=document.getElementsByClassName('closeBtn');
        Array.prototype.forEach.call(buttons,function(item){
            item.innerHTML = loader.i18n.Game.buttonClose;
            item.onclick=function(){showOne('game');};
        });
    }
	
	function registerHelpList(){
        var titleList;
        var helpClickTitle = [];
        var gameRulesSection = document.getElementsByTagName("section")[0];
        var backToTop = document.getElementsByClassName("top");
		function gameRulsTitle(index){
			return function(){
				gameRulesSection.scrollTop = helpClickTitle[index].offsetTop - helpClickTitle[index].offsetHeight*4;
			};
		}
		function topBackUp(){
			return function(){
				gameRulesSection.scrollTop = 0;
			};
        }
        
        if(config.helpClickList.titleList){
            titleList = document.getElementById("titleList").getElementsByTagName("li");
        }else{
            titleList = document.getElementsByTagName("li");
        }
        if(config.helpClickList.titleContent){
            var content = config.helpClickList.titleContent;
            for(var key in content){
				var currentNode = document.getElementById(content[key]);
                helpClickTitle.push(currentNode);
            }
        }
        
        for (var i = 0; i < titleList.length; i++) {
			titleList[i].onclick = gameRulsTitle(i);
        }
        for (i = 0; i < backToTop.length; i++) {  
			backToTop[i].onclick = topBackUp();
        }
    }

    function showOne(id){
        var tabs=document.getElementsByClassName('tab');
        for(var i=0;i<tabs.length;i++){
            tabs[i].style.display='none';
        }
		if(id === 'game'){
            if(config.audio && config.audio.PaytableClose){
                audio.play(config.audio.PaytableClose.name, config.audio.PaytableClose.channel);                
            }
		}else{
            if (config.audio && config.audio.PaytableOpen) {
                audio.play(config.audio.PaytableOpen.name, config.audio.PaytableOpen.channel);
            }
		}
        document.getElementById(id).style.display='block';
    }

    //retrigger clickbtn
    function onGameControl(data){
        if(data.option==='paytable'||data.option==='howToPlay'){
            var id = data.option==='howToPlay'? 'gameRules' : 'paytable';
            if(document.getElementById(id).style.display==='block'){
                showOne('game');
            }else{
                showOne(id);
            }
        }
    }

    function onAbortNextStage(){
        disableConsole();
    }

    function onResetNextStage(){
        enableConsole();
    }
    
    function onEnterResultScreenState(){
        enableConsole();
    }
    
 	msgBus.subscribe('platformMsg/Kernel/System.Init', onSystemInit);
    msgBus.subscribe('platformMsg/ClientService/Game.Init', onGameInit);
    msgBus.subscribe('onBeforeShowStage', onBeforeShowStage);
    msgBus.subscribe('onAbortNextStage', onAbortNextStage);
    msgBus.subscribe('onResetNextStage', onResetNextStage);
    msgBus.subscribe('platformMsg/ConsoleService/Game.Control', onGameControl);
       
    msgBus.subscribe('jLottery.reInitialize', onReInitialize);
	msgBus.subscribe('jLottery.reStartUserInteraction', onReStartUserInteraction);
    msgBus.subscribe('jLottery.startUserInteraction', onStartUserInteraction);
	msgBus.subscribe('jLottery.enterResultScreenState', onEnterResultScreenState);
	return {};
});

