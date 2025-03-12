/**
 * @module control some game config
 * @description control the customized data of paytable&help page and other customized config
 */
define({
    style:{
        win_Text:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowAngle: Math.PI/3, dropShadowBlur:20,dropShadowColor: "#5f300a"},
        win_Try_Text:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowAngle: Math.PI/3, dropShadowBlur:20,dropShadowColor: "#5f300a"},
        win_Value:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowAngle: Math.PI/3, dropShadowBlur:20,dropShadowColor: "#5f300a"},
        nonWin_Text:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowAngle: Math.PI/3, dropShadowBlur:20,dropShadowColor: "#5f300a"},
        errorText:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowBlur:10},
        warningText:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowBlur:10},
        tutorialTitleText:{dropShadow: true, dropShadowDistance: 5,dropShadowAlpha: 0.8, dropShadowBlur:10},
    },
    backgroundStyle:{
        "splashSize":"100% 100%",
        "gameSize":"100% 100%"        
    },
    winMaxValuePortrait: true,
    winUpToTextFieldSpace: 10,
    textAutoFit:{
        "autoPlayText":{
            "isAutoFit": true
        },
        "autoPlayMTMText":{
            "isAutoFit": true
        },
        "buyText":{
            "isAutoFit": true
        },
        "tryText":{
            "isAutoFit": true
        },
        "warningExitText":{
            "isAutoFit": true
        },
        "warningContinueText":{
            "isAutoFit": true
        },
        "warningText":{
            "isAutoFit": true
        },
        "errorExitText":{
            "isAutoFit": true
        },
        "errorTitle":{
            "isAutoFit": true
        },
        "errorText":{
            "isAutoFit": false
        },
        "exitText":{
            "isAutoFit": true
        },
        "playAgainText":{
            "isAutoFit": true
        },
        "playAgainMTMText":{
            "isAutoFit": true
        },
        "MTMText":{
            "isAutoFit": true
        }, 
        "win_Text":{
            "isAutoFit": true
        },
        "win_Try_Text":{
            "isAutoFit": true
        }, 
        "win_Value":{
            "isAutoFit": true
        },
        "closeWinText":{
            "isAutoFit": true
        }, 
        "nonWin_Text":{
            "isAutoFit": true
        },
        "closeNonWinText":{
            "isAutoFit": true
        }, 
        "win_Value_color":{
            "isAutoFit": true
        },
        "ticketCostText":{
            "isAutoFit": true
        },
        "ticketCostValue":{
            "isAutoFit": true
        }, 
        "tutorialTitleText":{
            "isAutoFit": true
        }, 
        "closeTutorialText":{
            "isAutoFit": true
        },
        "winUpToText":{
            "isAutoFit": true
        },
        "winUpToValue":{
            "isAutoFit": true
        }
    },
    audio:{
        "gameLoop":{
            "name":"MapLevelLoop",
            "channel":"0"
        },
        "gameWin":{
            "name":"ExitMusicLoop1",
            "channel":"10"
        },
        "gameNoWin":{
            "name":"ExitMusicLoop1",
            "channel":"10"
        },
        "ButtonGeneric":{
            "name":"Click",
            "channel":"9"
        },
        "PaytableOpen":{
            "name":"Click",
            "channel":"9"
        },
        "PaytableClose":{
            "name":"Click",
            "channel":"9"
        },
        "ButtonBetMax":{
            "name":"BetMax",
            "channel":"0"
        },
        "ButtonBetUp":{
            "name":"BetUp",
            "channel":"0"
        },
        "ButtonBetDown":{
            "name":"BetDown",
            "channel":"0"
        }
    },
    gladButtonImgName:{
        //audioController
        "buttonAudioOn":"buttonAudioOn",
        "buttonAudioOff":"buttonAudioOff",        
        //buyAndTryController
        "buttonTry":"buttonCommon",
        "buttonBuy":"buttonCommon",
        //errorWarningController
        "warningContinueButton":"buttonCommon",
        "warningExitButton":"buttonCommon",
        "errorExitButton":"buttonCommon",
        //exitAndHomeController
        "buttonExit":"buttonCommon",
        "buttonHome":"buttonHome",
        //playAgainController
        "buttonPlayAgain":"buttonCommon",
        "buttonPlayAgainMTM":"buttonCommon",
        //playWithMoneyController
        "buttonMTM":"buttonCommon",
        //resultController
        "buttonWinClose":"buttonCommon",
        "buttonNonWinClose":"buttonCommon",
        //ticketCostController
        "ticketCostPlus":"arrowPlus",
        "ticketCostMinus":"arrowMinus",
        //tutorialController
        "iconOff":"tutorialPageIconOff",
        "iconOn":"tutorialPageIconOn",
        //revealAllController
        "buttonAutoPlay":"buttonCommon",
        "buttonAutoPlayMTM":"buttonCommon"

    },
    gameParam:{
        //tutorialController
        "pageNum":4,
		"arrowPlusSpecial":true
    },
    predefinedStyle:{
        "swirlName":"LoadingSwirl",
        "splashLogoName":"logoLoader",
		landscape:{
            canvas:{
                width:960,
                height:600
            },
            gameLogoDiv:{
				width:497,
				height:220,
                y:240
			},
			progressSwirl:{
				width:100,
				height:100,
                animationSpeed:0.5,
                loop:true,
                y:480,
                scale:{
                    x:1.2,
                    y:1.2
                }
			},
            brandCopyRightDiv:{
                bottom: 20,
                fontSize: 18,
                color: "#d4c5fb",
                fontFamily: '"Arial"'
			},            
            progressTextDiv:{
                y:480,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: '"Oswald"'
                }
			}
		},
		portrait:{
            canvas:{
                width:600,
                height:960
            },
            gameLogoDiv:{
				width:497,
				height:220,
                y:380
			},
			progressSwirl:{
				width:100,
				height:100,
                animationSpeed:0.5,
                loop:true,
                y:770,
                scale:{
                    x:1.2,
                    y:1.2
                }
			},			
            brandCopyRightDiv: {
                bottom: 20,
                fontSize: 18,
                color: "#d4c5fb",
                fontFamily: '"Arial"'
            },
            progressTextDiv:{
                y: 770,
                style: {
                    fontSize: 25,
                    fill: "#ffffff",
                    fontWeight: 800,
                    fontFamily: '"Oswald"'
                }
			}
		}
	}
    
});
