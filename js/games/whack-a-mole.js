// 打地鼠游戏

// 游戏变量
let score = 0;
let highScore = localStorage.getItem('game_mole_highscore') || 0;
let timer = 30;
let gameActive = false;
let gameInterval;
let timerInterval;
let currentDifficulty = 'easy';
let activeMoles = 0; // 当前活跃的地鼠数量
let maxActiveMoles = 1; // 最大同时活跃地鼠数量

// 难度设置
const difficulties = {
    easy: {
        minTime: 1000,    // 地鼠最短出现时间 (ms)
        maxTime: 2000,    // 地鼠最长出现时间 (ms)
        gameTime: 30,     // 游戏时间 (s)
        points: 10,       // 每只地鼠的分数
        maxMoles: 1       // 最大同时活跃地鼠数量
    },
    medium: {
        minTime: 700,
        maxTime: 1500,
        gameTime: 30,
        points: 15,
        maxMoles: 2
    },
    hard: {
        minTime: 500,
        maxTime: 1000,
        gameTime: 30,
        points: 20,
        maxMoles: 3
    }
};

// DOM 元素
const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const timerElement = document.getElementById('timer');
const statusElement = document.getElementById('game-status');
const startButton = document.getElementById('start-btn');
const resetButton = document.getElementById('reset-btn');
const difficultyButtons = document.querySelectorAll('.difficulty-selector .game-btn');

// 初始化游戏
function initGame() {
    // 加载最高分
    highScoreElement.textContent = highScore;
    
    // 创建地鼠洞
    createHoles(9);
    
    // 添加事件监听器
    startButton.addEventListener('click', startGame);
    resetButton.addEventListener('click', resetScore);
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (gameActive) {
                if (confirm('更改难度将结束当前游戏，确定要继续吗？')) {
                    endGame();
                    setDifficulty(button.getAttribute('data-level'));
                }
            } else {
                setDifficulty(button.getAttribute('data-level'));
            }
        });
    });
}

// 创建地鼠洞
function createHoles(count) {
    for (let i = 0; i < count; i++) {
        const hole = document.createElement('div');
        hole.className = 'hole';
        hole.setAttribute('data-index', i);
        
        const mole = document.createElement('div');
        mole.className = 'mole';
        mole.addEventListener('click', whackMole);
        
        hole.appendChild(mole);
        gameBoard.appendChild(hole);
    }
}

// 设置难度
function setDifficulty(level) {
    // 如果难度没有变化，不执行任何操作
    if (level === currentDifficulty) {
        return;
    }
    
    // 显示确认对话框
    if (confirm(`确定要将难度更改为"${getDifficultyName(level)}"吗？这将重新开始游戏。`)) {
        difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-level') === level) {
                btn.classList.add('active');
            }
        });
        
        currentDifficulty = level;
        timer = difficulties[level].gameTime;
        timerElement.textContent = timer;
        maxActiveMoles = difficulties[level].maxMoles;
        
        // 如果游戏正在进行，重置游戏
        if (gameActive) {
            // 停止当前游戏
            endGame();
            // 重置UI
            statusElement.textContent = '已更改难度，点击开始游戏';
        }
    }
}

// 获取难度名称的辅助函数
function getDifficultyName(difficulty) {
    const difficultyNames = {
        'easy': '简单',
        'medium': '中等',
        'hard': '困难'
    };
    return difficultyNames[difficulty] || difficulty;
}

// 开始游戏
function startGame() {
    if (gameActive) return;
    
    // 重置状态
    score = 0;
    scoreElement.textContent = '0';
    timer = difficulties[currentDifficulty].gameTime;
    timerElement.textContent = timer;
    gameActive = true;
    activeMoles = 0;
    maxActiveMoles = difficulties[currentDifficulty].maxMoles;
    statusElement.textContent = '游戏进行中！';
    startButton.disabled = true;
    
    // 开始计时器
    timerInterval = setInterval(updateTimer, 1000);
    
    // 开始弹出地鼠
    popMole();
}

// 更新计时器
function updateTimer() {
    timer--;
    timerElement.textContent = timer;
    
    if (timer <= 0) {
        endGame();
    }
}

// 弹出地鼠
function popMole() {
    if (!gameActive) return;
    
    // 如果已经达到最大活跃地鼠数量，则不再弹出新地鼠
    if (activeMoles >= maxActiveMoles) {
        // 稍后再尝试
        setTimeout(popMole, 300);
        return;
    }
    
    // 获取所有洞
    const holes = document.querySelectorAll('.hole');
    const inactiveHoles = Array.from(holes).filter(hole => !hole.classList.contains('active'));
    
    // 如果没有可用的洞，稍后再尝试
    if (inactiveHoles.length === 0) {
        setTimeout(popMole, 300);
        return;
    }
    
    // 随机选择一个洞
    const randomIndex = Math.floor(Math.random() * inactiveHoles.length);
    const hole = inactiveHoles[randomIndex];
    
    // 弹出地鼠
    hole.classList.add('active');
    activeMoles++;
    
    // 随机确定该地鼠停留的时间
    const settings = difficulties[currentDifficulty];
    const time = Math.random() * (settings.maxTime - settings.minTime) + settings.minTime;
    
    // 设定时间后收回地鼠
    setTimeout(() => {
        if (gameActive) {
            hole.classList.remove('active');
            const mole = hole.querySelector('.mole');
            mole.classList.remove('whacked');
            activeMoles--;
            
            // 弹出下一个地鼠
            setTimeout(popMole, Math.random() * 500);
        }
    }, time);
    
    // 如果游戏活跃且当前地鼠数量未达到上限，增加机会弹出另一只地鼠
    if (gameActive && activeMoles < maxActiveMoles) {
        setTimeout(popMole, Math.random() * 1000);
    }
}

// 打地鼠
function whackMole(e) {
    if (!gameActive) return;
    
    const mole = e.target;
    const hole = mole.parentElement;
    
    // 检查该洞是否已经被打过
    if (mole.classList.contains('whacked') || !hole.classList.contains('active')) return;
    
    // 标记为已打
    mole.classList.add('whacked');
    hole.classList.add('hit-effect');
    
    // 加分
    score += difficulties[currentDifficulty].points;
    scoreElement.textContent = score;
    
    // 移除动画效果
    setTimeout(() => {
        hole.classList.remove('hit-effect');
    }, 200);
}

// 结束游戏
function endGame() {
    gameActive = false;
    clearInterval(timerInterval);
    
    // 移除所有活跃的地鼠
    document.querySelectorAll('.hole').forEach(hole => {
        hole.classList.remove('active');
        const mole = hole.querySelector('.mole');
        mole.classList.remove('whacked');
    });
    
    // 重置活跃地鼠计数
    activeMoles = 0;
    
    // 更新状态
    statusElement.textContent = '游戏结束！';
    startButton.disabled = false;
    
    // 检查高分
    if (score > highScore) {
        highScore = score;
        highScoreElement.textContent = highScore;
        localStorage.setItem('game_mole_highscore', highScore);
        
        // 记录游戏状态（用于首页展示）
        const difficulty = { easy: 1, medium: 2, hard: 3 }[currentDifficulty];
        localStorage.setItem('game_mole_bestscore', score);
        localStorage.setItem('game_mole_difficulty', difficulty);
        localStorage.setItem('game_mole_lastplayed', new Date().toISOString());
    }
    
    // 显示游戏结束对话框
    showGameOverDialog(score > highScore);
}

// 重置分数
function resetScore() {
    if (confirm('确定要重置分数记录吗？')) {
        highScore = 0;
        highScoreElement.textContent = '0';
        localStorage.removeItem('game_mole_highscore');
        localStorage.removeItem('game_mole_bestscore');
        localStorage.removeItem('game_mole_difficulty');
        statusElement.textContent = '分数已重置';
    }
}

// 显示游戏结束对话框
function showGameOverDialog(isNewRecord) {
    // 创建弹窗容器
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'game-modal';
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-header';
    modalTitle.textContent = '游戏结束';
    
    const modalMessage = document.createElement('p');
    modalMessage.className = 'modal-score';
    modalMessage.innerHTML = `
        你的得分: <strong>${score}</strong>
        ${isNewRecord ? '<br><strong style="color:#3b82f6">新纪录!</strong>' : ''}
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    const restartButton = document.createElement('button');
    restartButton.className = 'game-btn';
    restartButton.textContent = '再玩一次';
    restartButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
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

// 页面加载后初始化游戏
window.addEventListener('load', initGame); 