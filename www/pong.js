var pongApp = function(){
    this.setup();
    window.util.deltaTimeRequestAnimationFrame(this.draw.bind(this));
}

//==============================================
//SETUP
//==============================================

pongApp.prototype.setup = function(){
    window.util.patchRequestAnimationFrame();
    window.util.patchFnBind();
    this.initCanvas();
    this.initBall();
    this.initPaddle();
    //define what socket to connect to
    this.initSocket();
}

pongApp.prototype.initCanvas = function(){
    this.body = $(document.body);
    this.body.width(document.body.offsetWidth);
    this.body.height(window.innerHeight - 20);
    this.width = 720;
    this.height = 480;
    this.canvas = window.util.makeAspectRatioCanvas(this.body, this.width/this.height);
    this.page = new ScaledPage(this.canvas, this.width);
};

pongApp.prototype.initBall = function(){
    var velX = Math.floor(Math.random() * 31) - 20;
    var velY = Math.floor(Math.random() * 31) - 20;
    if (velX < 10 && velX >= 0) velX = 10;
    if (velX > -10 && velX < 0) velX = -10;
    this.ball = {'x': this.width/2, 'y': this.height/2, 'velx': velX, 'vely': velY, 'radius': 10}

}

pongApp.prototype.updatePaddle = function(accelData) {
    if(accelData.player === 1) {
        this.paddle1.y += accelData.y*2.5;
        this.paddle1.active = true;
    }
    if(accelData.player === 2) {
        this.paddle2.y += accelData.y*2.5;
        this.paddle2.active = true;
    }
};

pongApp.prototype.initPaddle = function(){
    this.paddle1 = new Paddle({'player': 'player1' , 'x': 0, 'y': this.height/2,
                            'width': 5, 'height': this.height/5, 'maxY': this.height, 'score': 0});
    this.paddle2 = new Paddle({'player': 'player2', 'x': this.width-5, 'y': this.height/2,
                            'width': 5, 'height': this.height/5, 'maxY': this.height, 'score': 0});
}

pongApp.prototype.initSocket = function() {
    
    //Change the below URL to the proper URL for the socket server
    this.socket = io.connect('http://paulw-laptop.wv.cc.cmu.edu:3000/');
    this.socket.on('receive', (function(data) {
        // update the DOM with received data
        this.updatePaddle(data);
    }).bind(this)
    );
}

//==============================================
//DRAWING
//==============================================

pongApp.prototype.draw = function(timeDiff){
    this.clearPage();
    this.updateBall();
    this.paddle1.draw(this.page);
    this.paddle2.draw(this.page);
    this.drawBall(timeDiff);
    this.isGameOver();

    //this.updatePosition();
}

pongApp.prototype.clearPage = function(){
    this.page.fillRect(0, 0, this.width, this.height, '#eee');
}

pongApp.prototype.isGameOver = function(){
    if (this.paddle1.score >= 10){
        alert('Player 1 Wins!');
        this.paddle1.score = 0;
        this.paddle2.score = 0;
        
    }
    else if (this.paddle2.score >= 10){
        alert('Player 2 Wins');
        this.paddle1.score = 0;
        this.paddle2.score = 0;
        
    }
    
}

pongApp.prototype.drawBall = function(timeDiff){
    this.page.fillCircle(this.ball.x, this.ball.y, this.ball.radius, 'black');
}



pongApp.prototype.updateBall = function(){
    this.ball.x += this.ball.velx/5;
    this.ball.y += this.ball.vely/5;

    if (this.ball.x - this.ball.radius < 0) {
        this.paddle2.updateScore();
        $('#player2Score').html('Player 2 -- Score: ' + this.paddle2.score)
        this.initBall();
    }
    else if (this.ball.x + this.ball.radius > this.width){
        this.paddle1.updateScore();
        $('#player1Score').html('Player 1 -- Score: ' + this.paddle1.score)
        this.initBall();
    }
    
    if (this.ball.x - this.ball.radius < this.paddle1.width) {
        if ((this.ball.y < this.paddle1.y+this.paddle1.height/2) && (this.ball.y> this.paddle1.y-this.paddle1.height/2)){
            this.ball.x = this.ball.radius+this.paddle1.width;
            this.ball.velx = -this.ball.velx;
        }
    }
    else if (this.ball.x + this.ball.radius > (this.width-this.paddle2.width)) {
        if ((this.ball.y < this.paddle2.y+this.paddle2.height/2) && (this.ball.y> this.paddle2.y-this.paddle1.height/2)) {
            this.ball.x = this.width-this.ball.radius - this.paddle1.width;
            this.ball.velx = -this.ball.velx;
        }
    }
    if (this.ball.y - this.ball.radius <= 0){
        this.ball.y = this.ball.radius;
        this.ball.vely = -this.ball.vely;
    }
    else if (this.ball.y + this.ball.radius > this.height){
        this.ball.y = this.height - this.ball.radius;
        this.ball.vely = -this.ball.vely;
    }
}


//======================================================
//Objects
//======================================================


var Paddle = function(config){
    this.style = 'black';
    this.width = config.width;
    this.height = config.height;

    this.x = config.x;
    this.y = config.y;
    
    this.active = false;

    this.maxX = config.maxX;
    this.maxY = config.maxY;

    this.score = config.score;

}

Paddle.prototype.updateScore = function() {
    if (this.active) this.score+= 1;
}

Paddle.prototype.draw = function(scaledPage){
    scaledPage.fillRect(this.x, this.y-this.height/2, this.width, this.height, this.style)
}

