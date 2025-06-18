// 贪吃蛇游戏

// 游戏常量
const GRID_SIZE = 20; // 网格大小
const GAME_SPEED = 100; // 初始游戏速度 (毫秒)
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const DIRECTIONS = {
    ArrowUp: { x: 0, y: -1 },
    ArrowDown: { x: 0, y: 1 },
    ArrowLeft: { x: -1, y: 0 },
    ArrowRight: { x: 1, y: 0 },
    w: { x: 0, y: -1 },
    s: { x: 0, y: 1 },
    a: { x: -1, y: 0 },
    d: { x: 1, y: 0 }
};

// 颜色
const COLORS = {
    background: '#ffffff',
    grid: '#f0f0f0',
    snakeHead: '#3b82f6', // primary-color
    snakeBody: '#93c5fd', // primary-light
    food: '#f97316', // secondary-color
    eyes: '#ffffff',
    pupils: '#1e293b' // text-color
};

// 游戏变量
let snake = [{ x: 10, y: 10 }];
let food = { x: 5, y: 5 };
let direction = { x: 0, y: 0 };
let newDirection = { x: 0, y: 0 };
let gameInterval;
let gameSpeed = GAME_SPEED;
let gameStarted = false;
let gamePaused = false;
let score = 0;
let highScore = localStorage.getItem('game_snake_highscore') || 0;

// DOM元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const gameStatusElement = document.getElementById('game-status');
const startButton = document.getElementById('start-btn');
const pauseButton = document.getElementById('pause-btn');
const resetButton = document.getElementById('reset-btn');
const touchButtons = {
    up: document.getElementById('up-btn'),
    down: document.getElementById('down-btn'),
    left: document.getElementById('left-btn'),
    right: document.getElementById('right-btn')
};
// 方向按钮
const directionButtons = {
    up: document.getElementById('btn-up'),
    down: document.getElementById('btn-down'),
    left: document.getElementById('btn-left'),
    right: document.getElementById('btn-right')
};

// 初始化
function init() {
    // 设置画布尺寸和位置
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 显示当前最高分
    highScoreElement.textContent = highScore;
    
    // 事件监听
    document.addEventListener('keydown', handleKeyPress);
    startButton.addEventListener('click', startGame);
    pauseButton.addEventListener('click', togglePause);
    resetButton.addEventListener('click', resetGame);
    
    // 方向按钮控制
    directionButtons.up.addEventListener('click', () => setDirection('ArrowUp'));
    directionButtons.down.addEventListener('click', () => setDirection('ArrowDown'));
    directionButtons.left.addEventListener('click', () => setDirection('ArrowLeft'));
    directionButtons.right.addEventListener('click', () => setDirection('ArrowRight'));
    
    // 触摸控制
    touchButtons.up.addEventListener('touchstart', () => setDirection('ArrowUp'));
    touchButtons.down.addEventListener('touchstart', () => setDirection('ArrowDown'));
    touchButtons.left.addEventListener('touchstart', () => setDirection('ArrowLeft'));
    touchButtons.right.addEventListener('touchstart', () => setDirection('ArrowRight'));
    
    // 绘制初始状态
    drawGame();
}

// 响应式调整画布
function resizeCanvas() {
    const container = document.getElementById('game-container');
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // 设置画布尺寸
    canvas.width = containerWidth;
    canvas.height = containerHeight;
    
    // 重绘游戏
    if (gameStarted) {
        drawGame();
    }
}

// 开始游戏
function startGame() {
    if (gameStarted && !gamePaused) return;
    
    if (!gameStarted) {
        resetGame();
        gameStarted = true;
    }
    
    gamePaused = false;
    gameStatusElement.textContent = '游戏进行中';
    startButton.disabled = true;
    pauseButton.disabled = false;
    
    // 开始游戏循环
    gameInterval = setInterval(updateGame, gameSpeed);
}

// 暂停游戏
function togglePause() {
    if (!gameStarted) return;
    
    if (gamePaused) {
        gamePaused = false;
        gameStatusElement.textContent = '游戏进行中';
        pauseButton.textContent = '暂停游戏';
        gameInterval = setInterval(updateGame, gameSpeed);
    } else {
        gamePaused = true;
        clearInterval(gameInterval);
        gameStatusElement.textContent = '游戏暂停';
        pauseButton.textContent = '继续游戏';
    }
}

// 重置游戏
function resetGame() {
    clearInterval(gameInterval);
    
    snake = [{ x: 10, y: 10 }];
    generateFood();
    direction = { x: 0, y: 0 };
    newDirection = { x: 0, y: 0 };
    gameSpeed = GAME_SPEED;
    gameStarted = false;
    gamePaused = false;
    score = 0;
    
    scoreElement.textContent = score;
    gameStatusElement.textContent = '按空格键或点击开始按钮';
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = '暂停游戏';
    
    drawGame();
}

// 处理键盘输入
function handleKeyPress(event) {
    // 阻止方向键滚动页面
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'w', 'a', 's', 'd'].includes(event.key)) {
        event.preventDefault();
    }
    
    if (event.key === ' ') { // 空格键暂停/继续
        if (!gameStarted) {
            startGame();
        } else {
            togglePause();
        }
        return;
    }
    
    if (DIRECTIONS[event.key]) {
        setDirection(event.key);
    }
}

// 设置方向
function setDirection(key) {
    const newDir = DIRECTIONS[key];
    
    if (!newDir) return;
    
    // 禁止反向移动
    if (
        (newDir.x === 1 && direction.x === -1) ||
        (newDir.x === -1 && direction.x === 1) ||
        (newDir.y === 1 && direction.y === -1) ||
        (newDir.y === -1 && direction.y === 1)
    ) {
        return;
    }
    
    newDirection = newDir;
    
    // 如果游戏未开始，按方向键启动游戏
    if (!gameStarted) {
        startGame();
    }
}

// 更新游戏状态
function updateGame() {
    // 更新蛇的方向
    if (newDirection.x !== 0 || newDirection.y !== 0) {
        direction = { ...newDirection };
    }
    
    // 如果蛇没有移动方向，不更新游戏
    if (direction.x === 0 && direction.y === 0) return;
    
    // 计算新头部位置
    const head = { ...snake[0] };
    head.x += direction.x;
    head.y += direction.y;
    
    // 检查碰撞
    if (isCollision(head)) {
        gameOver();
        return;
    }
    
    // 添加新头部
    snake.unshift(head);
    
    // 检查是否吃到食物
    if (head.x === food.x && head.y === food.y) {
        increaseScore();
        generateFood();
        increaseSpeed();
    } else {
        // 移除尾部
        snake.pop();
    }
    
    // 绘制游戏状态
    drawGame();
}

// 检查碰撞
function isCollision(position) {
    // 检查墙壁碰撞
    if (
        position.x < 0 ||
        position.y < 0 ||
        position.x >= GRID_SIZE ||
        position.y >= GRID_SIZE
    ) {
        return true;
    }
    
    // 检查自身碰撞（跳过头部位置）
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === position.x && snake[i].y === position.y) {
            return true;
        }
    }
    
    return false;
}

// 生成食物
function generateFood() {
    let newFood;
    let foodOnSnake;
    
    do {
        foodOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
        
        // 确保食物不在蛇身上
        for (let i = 0; i < snake.length; i++) {
            if (snake[i].x === newFood.x && snake[i].y === newFood.y) {
                foodOnSnake = true;
                break;
            }
        }
    } while (foodOnSnake);
    
    food = newFood;
}

// 增加得分
function increaseScore() {
    score += 10;
    scoreElement.textContent = score;
    
    // 更新最高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('game_snake_highscore', highScore);
    }
    
    // 保存游戏记录
    localStorage.setItem('game_snake_bestscore', score);
    localStorage.setItem('game_snake_lastplayed', new Date().toISOString());
}

// 增加游戏速度
function increaseSpeed() {
    if (gameSpeed > 50) {
        gameSpeed -= 2;
        clearInterval(gameInterval);
        gameInterval = setInterval(updateGame, gameSpeed);
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    gameStatusElement.textContent = '游戏结束';
    startButton.disabled = false;
    pauseButton.disabled = true;
    
    // 记录最后游玩时间
    localStorage.setItem('game_snake_lastplayed', new Date().toISOString());
    
    // 创建游戏结束弹窗
    createModal('游戏结束', `你的得分: ${score}`);
}

// 创建模态弹窗
function createModal(title, message) {
    // 创建弹窗容器
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'game-modal';
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-header';
    modalTitle.textContent = title;
    
    const modalMessage = document.createElement('p');
    modalMessage.className = 'modal-score';
    modalMessage.textContent = message;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    const restartButton = document.createElement('button');
    restartButton.className = 'game-btn';
    restartButton.textContent = '再玩一次';
    restartButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        resetGame();
        startGame();
    });
    
    const menuButton = document.createElement('button');
    menuButton.className = 'game-btn';
    menuButton.textContent = '返回首页';
    menuButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    buttonContainer.appendChild(restartButton);
    buttonContainer.appendChild(menuButton);
    
    modalContainer.appendChild(modalTitle);
    modalContainer.appendChild(modalMessage);
    modalContainer.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContainer);
    
    document.body.appendChild(modalOverlay);
}

// 绘制游戏
function drawGame() {
    const cellSizeX = canvas.width / GRID_SIZE;
    const cellSizeY = canvas.height / GRID_SIZE;
    const borderRadius = Math.min(cellSizeX, cellSizeY) * 0.2; // 圆角大小
    
    // 清空画布
    ctx.fillStyle = COLORS.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格 (优化了网格显示，使其更加美观)
    ctx.strokeStyle = COLORS.grid;
    ctx.lineWidth = 1;
    
    for (let i = 0; i < GRID_SIZE; i++) {
        for (let j = 0; j < GRID_SIZE; j++) {
            // 绘制格子背景
            if ((i + j) % 2 === 0) {
                ctx.fillStyle = COLORS.grid;
                ctx.fillRect(
                    i * cellSizeX, 
                    j * cellSizeY, 
                    cellSizeX, 
                    cellSizeY
                );
            }
        }
    }
    
    // 绘制食物（使用圆形食物）
    ctx.fillStyle = COLORS.food;
    ctx.beginPath();
    const foodX = food.x * cellSizeX + cellSizeX / 2;
    const foodY = food.y * cellSizeY + cellSizeY / 2;
    const foodRadius = Math.min(cellSizeX, cellSizeY) * 0.4;
    
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();
    
    // 添加食物高光效果
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath();
    ctx.arc(foodX - foodRadius * 0.3, foodY - foodRadius * 0.3, foodRadius * 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 圆角矩形函数
        function roundRect(x, y, width, height, radius) {
            ctx.beginPath();
            ctx.moveTo(x + radius, y);
            ctx.arcTo(x + width, y, x + width, y + height, radius);
            ctx.arcTo(x + width, y + height, x, y + height, radius);
            ctx.arcTo(x, y + height, x, y, radius);
            ctx.arcTo(x, y, x + width, y, radius);
            ctx.closePath();
            ctx.fill();
        }
        
        // 蛇头
        if (index === 0) {
            ctx.fillStyle = COLORS.snakeHead;
            roundRect(
                segment.x * cellSizeX + 1,
                segment.y * cellSizeY + 1,
                cellSizeX - 2,
                cellSizeY - 2,
                borderRadius
            );
            
            // 绘制眼睛
            ctx.fillStyle = COLORS.eyes;
            const eyeSize = cellSizeX * 0.15;
            let eyeX1, eyeY1, eyeX2, eyeY2;
            
            switch (true) {
                case direction.x === 1: // 向右
                    eyeX1 = eyeX2 = segment.x * cellSizeX + cellSizeX * 0.7;
                    eyeY1 = segment.y * cellSizeY + cellSizeY * 0.3;
                    eyeY2 = segment.y * cellSizeY + cellSizeY * 0.7;
                    break;
                case direction.x === -1: // 向左
                    eyeX1 = eyeX2 = segment.x * cellSizeX + cellSizeX * 0.3;
                    eyeY1 = segment.y * cellSizeY + cellSizeY * 0.3;
                    eyeY2 = segment.y * cellSizeY + cellSizeY * 0.7;
                    break;
                case direction.y === -1: // 向上
                    eyeX1 = segment.x * cellSizeX + cellSizeX * 0.3;
                    eyeX2 = segment.x * cellSizeX + cellSizeX * 0.7;
                    eyeY1 = eyeY2 = segment.y * cellSizeY + cellSizeY * 0.3;
                    break;
                default: // 向下或原地
                    eyeX1 = segment.x * cellSizeX + cellSizeX * 0.3;
                    eyeX2 = segment.x * cellSizeX + cellSizeX * 0.7;
                    eyeY1 = eyeY2 = segment.y * cellSizeY + cellSizeY * 0.7;
            }
            
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize, 0, 2 * Math.PI);
            ctx.arc(eyeX2, eyeY2, eyeSize, 0, 2 * Math.PI);
            ctx.fill();
            
            // 瞳孔
            ctx.fillStyle = COLORS.pupils;
            ctx.beginPath();
            ctx.arc(eyeX1, eyeY1, eyeSize * 0.6, 0, 2 * Math.PI);
            ctx.arc(eyeX2, eyeY2, eyeSize * 0.6, 0, 2 * Math.PI);
            ctx.fill();
        } else {
            // 蛇身 - 使用渐变色，越往尾部越浅
            const gradient = (snake.length <= 5) ? 1 : (1 - index / (snake.length * 1.5));
            const r = 59;  // RGB for #3b82f6
            const g = 130;
            const b = 246;
            
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.4, gradient)})`;
            
            roundRect(
                segment.x * cellSizeX + 2, 
                segment.y * cellSizeY + 2, 
                cellSizeX - 4, 
                cellSizeY - 4, 
                borderRadius
            );
        }
    });
}

// 初始化游戏
window.addEventListener('load', () => {
    init();
    generateFood();
}); 