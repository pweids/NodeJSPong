var Accelerometer = function(player){
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.player = player;
    //Change below URL to proper URL for socket server
    this.socket = io.connect('http://paulw-laptop.wv.cc.cmu.edu:3000/');
}

Accelerometer.prototype.startListening = function(){
    if (window.ondevicemotion !== undefined){
        this.startListeningDeviceMotion();
    }
    else if (window.navigator.accelerometer !== undefined){
        this.startListeningNavigatorAccelerometer();
    }
    else if (window.ondeviceorientation !== undefined){
        this.startListeningDeviceOrientation();
        //alert('deviceorientation');
    }
    else {
        alert('no accelerometer detected! (try arrow keys)');
        this.startListeningKeys();
    }
}

Accelerometer.prototype.startListeningDeviceMotion = function(){
    var timesEventFired = 0;
    var enabled = false;
    var tooBigX = 100; //turns out firefox actually posts devicemotion events 
                        //with random (generally large) numbers
    window.addEventListener('devicemotion', function(event){
        if (event.accelerationIncludingGravity.x !== null &&
            event.accelerationIncludingGravity.y !== null  &&
            event.accelerationIncludingGravity.z !== null &&
            event.accelerationIncludingGravity.x <= tooBigX){
            if (enabled){
                this.y = event.accelerationIncludingGravity.y;
                this.sendPosition();
            }
            timesEventFired += 1;
            //console.log(event.accelerationIncludingGravity.x);
        }
    }.bind(this));
    setTimeout(function(){
        if (timesEventFired <= 3){
            alert('no accelerometer detected! (try arrow keys)');
            this.startListeningKeys();
        }
        else
            enabled = true;
    }.bind(this),  1000);
}

Accelerometer.prototype.startListeningNavigatorAccelerometer = function(){
    window.navigator.accelerometer.watchAccelerometer(function(event){
        this.y = event.y;
        this.sendPosition();
    }.bind(this));
}

Accelerometer.prototype.startListeningDeviceOrientation = function(){
    var timesEventFired = 0;
    var enabled = false;
    window.addEventListener('deviceorientation', function(event){
        if (event.alpha !== null || event.beta !== null || event.gamma !== null){
            if (enabled){
                this.y = -event.beta/5;
                this.sendPosition();
            }
            console.log(this.x, this.y, this.z);
            timesEventFired += 1;
        }
    }.bind(this));
    setTimeout(function(){
        if (timesEventFired <= 3){
            alert('no accelerometer detected! (try arrow keys)');
            this.startListeningKeys();
        }
        else
            enabled = true;
    }.bind(this),  1000);
}

Accelerometer.prototype.startListeningKeys = function(){
    var namesToKeycodes = {
        up: 38,
        down: 40,
        left: 37,
        right: 39
    };
    window.addEventListener('keydown', function(e){
        var keycode = e.which;
        if (keycode === namesToKeycodes['up'])
            this.y = -2;
        else if (keycode === namesToKeycodes['down'])
            this.y = 2;
        this.sendPosition();
    }.bind(this));

    window.addEventListener('keyup', function(e){
        var keycode = e.which;
        if (keycode === namesToKeycodes['up'])
            this.y = 0;
        else if (keycode === namesToKeycodes['down'])
            this.y = 0;
        this.sendPosition();
    }.bind(this));
}

Accelerometer.prototype.getLast = function(){
    if (window.util.isIOS()){
        return {
            y: -this.y,
        };
    }
    else if (window.util.isAndroid() && window.util.isChrome()){
        return {
            y: -this.y,
        };
    }
    else {
        return {
            y: this.y,
        };
    }
}

Accelerometer.prototype.sendPosition = function() {
    var pos = this.getLast();
    pos["player"] = this.player;
    this.socket.emit('send', pos);
}
