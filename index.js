'use strict';

window.onload = function () {
  function _drawRect(r) {
    var x = r.x;
    var y = data.canvas.h - r.y - r.h;
    var width = r.w;
    var height = r.h;

    ctx.fillRect(x, y, width, height);
  }

  function drawFloor() {
    _drawRect(data.floor);
  }

  function drawObstacles() {
    data.obstacles.forEach(_drawRect);
  }

  function drawStepables() {
    data.stepables.forEach(_drawRect);
  }

  function drawHero() {
    _drawRect(data.hero);
  }

  function drawScore() {
    ctx.textAlign = 'left';
    ctx.font = "18px monospace";
    ctx.fillText('' + Math.floor(data.score), 5, 23);
  }

  function drawGameOver() {
    ctx.textAlign = 'center';
    ctx.font = "24px monospace";
    ctx.fillText('Game Over', data.canvas.w / 2, data.canvas.h / 2);
  }

  function moveHero() {
    if (data.state.up && !data.hero.hasClimaxed && data.hero.dy >= 0) {
      data.hero.isJumping = true;
      data.hero.dy = data.config.jumpAccel(data.hero.dy);
    } else {
      data.hero.dy = data.config.jumpDecel(data.hero.dy);
    }

    if (data.hero.dy > data.config.jumpAccelMax) {
      data.hero.hasClimaxed = true;
    }

    data.hero.y += data.hero.dy;
  }

  function moveObstacles() {
    data.obstacles = data.obstacles.filter(function (o) {
      return o.x + o.w >= 0;
    });

    if (data.obstacles.length === 0) {
      var type = Math.floor(Math.random() * obstacleTypes.length);
      data.obstacles.push(Object.assign(obstacleTypes[type], {
        x: data.canvas.w * 1.5,
        y: data.floor.y + data.floor.h
      }));
    }

    data.obstacles.forEach(function (o) {
      return o.x -= data.config.gameSpeed;
    });
  }

  function moveStepables() {
    data.stepables = data.stepables.filter(function (o) {
      return o.x + o.w >= 0;
    });

    if (data.stepables.length === 0) {
      var type = Math.floor(Math.random() * stepableTypes.length);
      data.stepables.push(Object.assign(stepableTypes[type], {
        x: data.canvas.w * 1.2,
        y: 20 + Math.random() * 40
      }));
    }

    data.stepables.forEach(function (o) {
      return o.x -= data.config.gameSpeed;
    });
  }

  function detectFloorCollision() {
    var hasCollided = _detectCollision(data.hero, data.floor);

    if (hasCollided) {
      data.hero.y = data.floor.y + data.floor.h;
      data.hero.dy = 0;
      data.hero.hasClimaxed = false;
      data.hero.isJumping = false;
    }
  }

  function detectStepableCollision() {
    data.stepables.find(function (o) {
      var hasCollided = _detectCollision(data.hero, o);

      // can jump through platforms, mario style
      if (hasCollided && data.hero.dy < 0) {
        data.hero.y = o.y + o.h;
        data.hero.dy = 0;
        data.hero.hasClimaxed = false;
        data.hero.isJumping = false;
      }
    });
  }

  function detectObstacleCollision() {
    data.obstacles.find(function (o) {
      var hasCollided = _detectCollision(data.hero, o);

      if (hasCollided) {
        data.state.isAlive = false;
        stop();
      }
    });
  }

  function _detectCollision(a, b) {
    if (a.x < b.x + b.w && a.x + a.w - a.dx > b.x && a.y < b.y + b.h && a.h - a.dy + a.y > b.y) {
      return true;
    } else {
      return false;
    }
  }

  function draw() {
    if (data.state.isPlaying) {
      setTimeout(function () {
        window.requestAnimationFrame(function () {
          return draw();
        });
      }, 15);
    }

    data.config.gameSpeed *= data.config.deltaGameSpeed;
    moveHero();
    moveObstacles();
    moveStepables();
    detectStepableCollision();
    detectObstacleCollision();
    detectFloorCollision();

    if (data.state.isAlive) {
      data.score += 0.4;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawFloor();
      drawHero();
      drawObstacles();
      drawStepables();
      drawScore();
    } else {
      drawGameOver();
    }
  }

  function start() {
    if (data.state.isPlaying === false) {
      data.state.isPlaying = true;
      draw();
    }
  }

  function stop() {
    data.state.isPlaying = false;
  }

  function initalizeGame() {
    return {
      score: 0,
      config: {
        jumpAccelMax: 12,
        jumpAccel: function jumpAccel(d) {
          return d + 1.5;
        },
        jumpDecel: function jumpDecel(d) {
          return d - 1.8;
        },
        gameSpeed: 5,
        deltaGameSpeed: 1.0005
      },
      canvas: {
        h: 300,
        w: 300
      },
      state: {
        isAlive: true,
        isPlaying: false,
        up: false,
        down: false,
        left: false,
        right: false
      },
      hero: {
        h: 10,
        w: 10,
        x: 30,
        y: 1,
        dx: 0,
        dy: 0,
        isJumping: false,
        hasClimaxed: false
      },
      floor: {
        type: 'platform',
        h: 1,
        w: 300,
        x: 0,
        y: 0
      },
      obstacles: [],
      stepables: []
    };
  }

  var canvas = document.getElementById("canvas");
  var ctx = canvas.getContext("2d");

  var obstacleTypes = [{
    type: 'obstacle',
    x: 0,
    y: 0,
    w: 20,
    h: 70
  }, {
    type: 'obstacle',
    x: 0,
    y: 0,
    w: 40,
    h: 40
  }, {
    type: 'obstacle',
    x: 0,
    y: 0,
    w: 60,
    h: 20
  }];

  var stepableTypes = [{
    type: 'platform',
    x: 0,
    y: 0,
    w: 60,
    h: 1
  }, {
    type: 'platform',
    x: 0,
    y: 0,
    w: 80,
    h: 1
  }, {
    type: 'platform',
    x: 0,
    y: 0,
    w: 100,
    h: 1
  }];

  var data = initalizeGame();

  // retina bloating
  canvas.width = data.canvas.w * 2;
  canvas.height = data.canvas.h * 2;
  canvas.style.width = data.canvas.w + 'px';
  canvas.style.height = data.canvas.h + 'px';
  ctx.scale(2, 2);
  ctx.fillStyle = '#333333';

  function handlePress(e) {
    if (!data.hero.isJumping) {
      data.state.up = true;
    }

    if (!data.state.isPlaying || !data.state.isAlive) {
      data = initalizeGame();
      start();
    }
  }

  function handleRelease(e) {
    data.state.up = false;
  }

  document.addEventListener('touchstart', handlePress);
  document.addEventListener('keydown', handlePress);
  document.addEventListener('touchend', handleRelease);
  document.addEventListener('keyup', handleRelease);

  draw();
};
