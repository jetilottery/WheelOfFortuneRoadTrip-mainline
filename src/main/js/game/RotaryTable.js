/**
 * @module RotaryTable
 * @description
 */
define([
	'skbJet/component/gladPixiRenderer/gladPixiRenderer',
	'skbJet/component/howlerAudioPlayer/howlerAudioSpritePlayer'
	],function(gr, audio){

	var angleList = [
//        {
//		"id": 0,
//		"angleCenter": 0
//		}
//        ,{
//		"id": 1,
//		"angleCenter": 345
//		},{
//		"id": 2,
//		"angleCenter": 330
//		},{
//		"id": 3,
//		"angleCenter": 315
//		},{
//		"id": 4,
//		"angleCenter": 300
//		},{
//		"id": 5,
//		"angleCenter": 285
//		},{
//		"id": 6,
//		"angleCenter": 270
//		},{
//		"id": 7,
//		"angleCenter": 255
//		},{
//		"id": 8,
//		"angleCenter": 240
//		},{
//		"id": 9,
//		"angleCenter": 225
//		},{
//		"id": 10,
//		"angleCenter": 210
//		},{
//		"id": 11,
//		"angleCenter": 195
//		},{
//		"id": 12,
//		"angleCenter": 180
//		},{
//		"id": 13,
//		"angleCenter": 165
//		},{
//		"id": 14,
//		"angleCenter": 310,
//		"angleRange":[320, 300],
//		"flagAngle": -25,
//		"maxChangeAngle": 335
//		},{
//		"id": 15,
//		"angleCenter": 335,
//		"angleRange":[350, 320],
//		"flagAngle": -25,
//		"maxChangeAngle": 360
//		}
	];
	/**
	 * 
	 * 
	 * 
	*/
	var cbs = {};
	var _this;
	function RotaryTable(options){
		if(!options || typeof options !== "object"){
			throw new Error("incoming parameters error");
		}
		try{
			if(!options.sprite){
				throw new Error();
			}
		}catch(e){
			throw new Error("need sprites");
		}
		if(typeof RotaryTable.instance === "object"){
			return RotaryTable.instance;
		}
        
        for (var i = 0; i < 24; i++) {
            var obj = {};
            obj[i] = i;
            obj['angleCenter'] = i * 15;
            angleList.push(obj);
        }
        
        
		_this = this; 
		this.options = options;
		this.sprite = options.sprite;
		this.init(options);	
		RotaryTable.instance = this;
		gr.getTicker().add(function(){
			if(!_this.isPlaying){
				return;
			}
			_start(_this);
			console.log(gr.getTicker().FPS);
		});
	}


	RotaryTable.prototype.isPlaying = false;
	RotaryTable.prototype.init = function (options){
		this.options = options;
		this.sprite = options.sprite;
		this.baseSpeed = options.speed || 10;
		this.currentAngle = options.startAngle || 0;
		this.callback = options.callback || null;
		this.statusCode = {
			"unBegin": "1",
			"activity": "2",
			"isStoping": "3"
		};
		this.status = this.statusCode.unBegin;
		this.beginStep = 0.15;
		this.stopStep = 0.05;
		this.isStoping = false;
		this.offsetAngle = options.offsetAngle || 6;
		this.startCurrentIndex = 0;
	};

	RotaryTable.prototype.begin = function(){
		this.isPlaying = true;
		var statusCode = this.statusCode;
		if(statusCode.unBegin !== this.status){
			return;
		}
		this.status = statusCode.activity;
		this.speed = Math.floor(this.baseSpeed / 8);
		this.stopId = "";
        
        audio.play('WheelSpin_Start',4);
        audio.volume(4,0.4);
        gr.getTimer().setTimeout(function () {
            audio.play('WheelSpin_Spin', 4, true);
            audio.volume(4,0.4);
//            gr.getTimer().setTimeout(function () {
//                audio.play('WheelSpin_Stop', 4);
//            }, 600);
        }, 200);
	};
	RotaryTable.prototype.stop = function (id) {
        audio.play('WheelSpin_Stop', 4);
        audio.volume(4,0.4);
		var statusCode = this.statusCode;
		if (statusCode.activity !== this.status) {
			return;
		}
//        audio.play('CrowdAnticipationStart_03',5);
		this.status = statusCode.isStoping;
		this.stopId = id;
	};
	RotaryTable.prototype.getStopAngle = function () {
		var speed = this.speed,
			n = 0,
			angle = 0,
			stopStep = this.stopStep;

		n = Math.ceil(speed / stopStep);
		angle = n * speed - n * (n - 1) * stopStep / 2 + 3600;

		return angle % 360;
	};

	function activity(This){
		var _this = This;
		if(_this.speed < _this.baseSpeed){
			_this.speed += _this.beginStep;
		}

		if(_this.speed > _this.baseSpeed){
			_this.speed = _this.baseSpeed;
		}
		_scroll(_this);
	}			
	

	function isStoping(This) {
		var _this = This;

		// ???????????????,????????
		if (_this.speed < 0.1 * _this.stopStep) {
			_this.speed = - 0.1;
			_this.offsetAngle -= 0.1;
			if(_this.offsetAngle <= 0){
				_this.sprite.pixiContainer.rotation = (_this.currentAngle - _this.offsetAngle) *Math.PI/180;
				_this.isPlaying = false;
				_this.status = _this.statusCode.unBegin;
				_this.isStoping = false;
				_this.init(_this.options);	
				if(_this.callback){
					_this.callback();
				}
				return;
			}else{
				_scroll(_this);
				return;
			}
		}

		// ??????????
		// ???????,???????,????????????
		if (!_this.isStoping && !_isBeginStop(_this)) {
			cbs[_this.statusCode.activity](_this);
			return;
		}

		_this.isStoping = true;

		// ????
		if (_this.speed > 2 * _this.stopStep) {
			if (_justfiyStop(_this)) {
				_this.speed -= _this.stopStep;
			}
		} else {
			if (_canStop(_this)) {
				_this.speed -= _this.stopStep;
			}
		}

		_scroll(_this);
	}
	cbs["3"] = isStoping;
	cbs["2"] = activity;
	cbs['1'] = function () {};
	function _scroll(This){
		var _this = This;
		_this.currentAngle += _this.speed;
		if(_this.currentAngle >= 360){
			_this.currentAngle = _this.currentAngle % 360;
		}

		_this.sprite.pixiContainer.rotation = _this.currentAngle*Math.PI/180;
	}

	function _start(This){
		var _this = This;
		var status = _this.status,
			cb = cbs[status];
		
		if(typeof cb === "function"){
			cb(_this);
		}
	}

	RotaryTable.prototype.isStoped = function () {
		return this.status === this.statusCode.unBegin;
	};

	function _getStopAngle(gift) {
		var angle = gift.angleCenter + _this.offsetAngle;
		return (angle + 360) % 360;
	}

	function _isBeginStop(This) {
		var _this = This;
		var gift = angleList[_this.stopId],
		bwAngle = 0,
		lastAngle = 0,
		curBase = 0;

		lastAngle = _getStopAngle(gift);		

		bwAngle = _this.getStopAngle();
		curBase = lastAngle - bwAngle;

		if (curBase < 0) {
			curBase += 360;
		}

		if (Math.abs(curBase - _this.currentAngle) < _this.speed) {
			_this.lastAngle = lastAngle;
			return true;
		} else {
			_this.lastAngle = "";
			return false;
		}
	}			
	
	function _justfiyStop(This) {
		var _this = This;
		var bwAngle = _this.getStopAngle(),
		curBase = 0;

		curBase = _this.lastAngle - bwAngle;

		if (curBase < 0) {
			curBase += 360;
		}
		if (Math.abs(curBase - _this.currentAngle) < _this.speed) {
			return true;
		} else {
			return false;
		}
	}
	
	function _canStop(This) {
		var _this = This;
		var gift = angleList[_this.stopId];

		if (gift) {
			return true;
		}
		return Math.abs(_this.lastAngle - _this.currentAngle) < 0.001;
	}

	return RotaryTable;
});