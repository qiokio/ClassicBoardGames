// 井字棋游戏

// 游戏常量
const PLAYER_X = 'x';
const PLAYER_O = 'o';
const EMPTY = '';

// 游戏变量
let currentPlayer = PLAYER_X;
let gameBoard = Array(9).fill(EMPTY);
let gameActive = true;
let againstAI = false;
let currentDifficulty = 'easy'; // 默认难度级别：简单
let scores = {
    x: 0,
    o: 0,
    tie: 0
};

// 获胜组合
const winningCombinations = [
    [0, 1, 2], // 顶行
    [3, 4, 5], // 中行
    [6, 7, 8], // 底行
    [0, 3, 6], // 左列
    [1, 4, 7], // 中列
    [2, 5, 8], // 右列
    [0, 4, 8], // 对角线
    [2, 4, 6]  // 对角线
];

// DOM元素
const board = document.getElementById('board');
const cells = document.querySelectorAll('.cell');
const turnText = document.getElementById('turn-text');
const turnMarker = document.getElementById('turn-marker');
const resetButton = document.getElementById('reset-btn');
const resetScoreButton = document.getElementById('reset-score-btn');
const pvpButton = document.getElementById('pvp-btn');
const pvcButton = document.getElementById('pvc-btn');
const difficultySelector = document.getElementById('difficulty-selector');
const difficultyButtons = document.querySelectorAll('.difficulty-selector .game-btn');
const scoreElements = {
    x: document.getElementById('x-score'),
    o: document.getElementById('o-score'),
    tie: document.getElementById('tie-score')
};

// 初始化游戏
function initGame() {
    // 从本地存储加载分数
    loadScores();
    
    // 添加单元格点击事件
    cells.forEach(cell => {
        cell.addEventListener('click', () => handleCellClick(cell));
    });
    
    // 添加按钮事件
    resetButton.addEventListener('click', resetGame);
    resetScoreButton.addEventListener('click', resetScores);
    pvpButton.addEventListener('click', () => setGameMode(false));
    pvcButton.addEventListener('click', () => setGameMode(true));
    
    // 添加难度选择事件
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            // 移除所有按钮的active类
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            // 为当前按钮添加active类
            button.classList.add('active');
            // 设置当前难度
            currentDifficulty = button.getAttribute('data-level');
        });
    });
    
    // 设置初始游戏状态
    updateTurnIndicator();
}

// 单元格点击处理
function handleCellClick(cell) {
    const index = cell.getAttribute('data-index');
    
    // 检查单元格是否已被占用或游戏是否已结束
    if (gameBoard[index] !== EMPTY || !gameActive) {
        return;
    }
    
    // 放置标记
    placeMarker(index);
    
    // 检查游戏状态
    checkGameStatus();
    
    // 如果是人机模式且游戏仍在进行，电脑下一步棋
    if (againstAI && gameActive && currentPlayer === PLAYER_O) {
        setTimeout(makeAIMove, 500);
    }
}

// 放置标记
function placeMarker(index) {
    gameBoard[index] = currentPlayer;
    cells[index].textContent = currentPlayer.toUpperCase();
    cells[index].classList.add(currentPlayer);
}

// 切换玩家
function switchPlayer() {
    currentPlayer = currentPlayer === PLAYER_X ? PLAYER_O : PLAYER_X;
    updateTurnIndicator();
}

// 检查游戏状态
function checkGameStatus() {
    // 检查胜利
    if (checkWin()) {
        gameActive = false;
        updateScore(currentPlayer);
        showGameOverMessage(`${currentPlayer.toUpperCase()} 获胜了!`);
        return;
    }
    
    // 检查平局
    if (checkTie()) {
        gameActive = false;
        updateScore('tie');
        showGameOverMessage('平局！');
        return;
    }
    
    // 继续游戏，切换玩家
    switchPlayer();
}

// 检查胜利
function checkWin() {
    return winningCombinations.some(combination => {
        return combination.every(index => {
            return gameBoard[index] === currentPlayer;
        });
    });
}

// 检查平局
function checkTie() {
    return gameBoard.every(cell => cell !== EMPTY);
}

// 电脑移动
function makeAIMove() {
    if (!gameActive) return;
    
    let bestMove;
    
    // 根据难度选择不同的AI策略
    switch (currentDifficulty) {
        case 'easy':
            bestMove = makeRandomMove();
            break;
        case 'medium':
            bestMove = makeMediumMove();
            break;
        case 'hard':
            bestMove = makeHardMove();
            break;
        default:
            bestMove = makeRandomMove();
    }
    
    // 放置标记
    placeMarker(bestMove);
    
    // 检查游戏状态
    checkGameStatus();
}

// 简单模式：随机移动
function makeRandomMove() {
    const availableCells = gameBoard
        .map((cell, index) => cell === EMPTY ? index : null)
        .filter(cell => cell !== null);
    
    return availableCells[Math.floor(Math.random() * availableCells.length)];
}

// 中等模式：阻止玩家获胜或随机移动
function makeMediumMove() {
    // 如果中间可用，就选中间
    if (gameBoard[4] === EMPTY) {
        return 4;
    }
    
    // 防守：阻止玩家获胜
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        // 检查玩家是否有两个连续的标记
        if (gameBoard[a] === PLAYER_X && gameBoard[b] === PLAYER_X && gameBoard[c] === EMPTY) {
            return c;
        }
        if (gameBoard[a] === PLAYER_X && gameBoard[c] === PLAYER_X && gameBoard[b] === EMPTY) {
            return b;
        }
        if (gameBoard[b] === PLAYER_X && gameBoard[c] === PLAYER_X && gameBoard[a] === EMPTY) {
            return a;
        }
    }
    
    // 角落策略
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => gameBoard[corner] === EMPTY);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 随机移动
    return makeRandomMove();
}

// 困难模式：使用最优策略
function makeHardMove() {
    // 首先检查自己是否能赢
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        // 检查AI是否有两个连续的标记
        if (gameBoard[a] === PLAYER_O && gameBoard[b] === PLAYER_O && gameBoard[c] === EMPTY) {
            return c;
        }
        if (gameBoard[a] === PLAYER_O && gameBoard[c] === PLAYER_O && gameBoard[b] === EMPTY) {
            return b;
        }
        if (gameBoard[b] === PLAYER_O && gameBoard[c] === PLAYER_O && gameBoard[a] === EMPTY) {
            return a;
        }
    }
    
    // 然后阻止玩家获胜
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        // 检查玩家是否有两个连续的标记
        if (gameBoard[a] === PLAYER_X && gameBoard[b] === PLAYER_X && gameBoard[c] === EMPTY) {
            return c;
        }
        if (gameBoard[a] === PLAYER_X && gameBoard[c] === PLAYER_X && gameBoard[b] === EMPTY) {
            return b;
        }
        if (gameBoard[b] === PLAYER_X && gameBoard[c] === PLAYER_X && gameBoard[a] === EMPTY) {
            return a;
        }
    }
    
    // 如果中间可用，就选中间
    if (gameBoard[4] === EMPTY) {
        return 4;
    }
    
    // 对角线策略：如果玩家占据了相对的角落，则选择边缘
    if ((gameBoard[0] === PLAYER_X && gameBoard[8] === PLAYER_X) || 
        (gameBoard[2] === PLAYER_X && gameBoard[6] === PLAYER_X)) {
        const edges = [1, 3, 5, 7];
        const availableEdges = edges.filter(edge => gameBoard[edge] === EMPTY);
        if (availableEdges.length > 0) {
            return availableEdges[Math.floor(Math.random() * availableEdges.length)];
        }
    }
    
    // 角落策略
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(corner => gameBoard[corner] === EMPTY);
    if (availableCorners.length > 0) {
        return availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
    
    // 边缘策略
    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(edge => gameBoard[edge] === EMPTY);
    if (availableEdges.length > 0) {
        return availableEdges[Math.floor(Math.random() * availableEdges.length)];
    }
    
    // 如果其他策略都不适用，则随机移动
    return makeRandomMove();
}

// 更新得分
function updateScore(winner) {
    scores[winner]++;
    scoreElements[winner].textContent = scores[winner];
    saveScores();
}

// 重置游戏
function resetGame() {
    gameBoard = Array(9).fill(EMPTY);
    currentPlayer = PLAYER_X;
    gameActive = true;
    
    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove(PLAYER_X);
        cell.classList.remove(PLAYER_O);
    });
    
    updateTurnIndicator();
    
    // 移除游戏结束消息
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// 重置分数
function resetScores() {
    scores = { x: 0, o: 0, tie: 0 };
    scoreElements.x.textContent = '0';
    scoreElements.o.textContent = '0';
    scoreElements.tie.textContent = '0';
    saveScores();
}

// 设置游戏模式
function setGameMode(ai) {
    againstAI = ai;
    resetGame();
    
    // 设置活跃按钮样式
    if (ai) {
        pvpButton.classList.remove('active');
        pvcButton.classList.add('active');
        difficultySelector.style.display = 'flex'; // 显示难度选择器
    } else {
        pvpButton.classList.add('active');
        pvcButton.classList.remove('active');
        difficultySelector.style.display = 'none'; // 隐藏难度选择器
    }
}

// 更新回合指示器
function updateTurnIndicator() {
    const playerText = currentPlayer === PLAYER_X ? 'X' : 'O';
    turnText.textContent = `玩家 ${playerText} 回合`;
    
    // 更新标记颜色
    turnMarker.classList.remove('o');
    if (currentPlayer === PLAYER_O) {
        turnMarker.classList.add('o');
    }
}

// 显示游戏结束消息
function showGameOverMessage(message) {
    // 创建模态对话框
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'game-modal';
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-header';
    modalTitle.textContent = '游戏结束';
    
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

// 保存分数到本地存储
function saveScores() {
    localStorage.setItem('tictactoe_scores', JSON.stringify(scores));
    // 记录游戏状态
    localStorage.setItem('game_tictactoe_lastplayed', new Date().toISOString());
    // 记录最高分（用于首页显示）
    localStorage.setItem('game_tictactoe_highscore', Math.max(scores.x, scores.o));
}

// 从本地存储加载分数
function loadScores() {
    const savedScores = localStorage.getItem('tictactoe_scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        scoreElements.x.textContent = scores.x;
        scoreElements.o.textContent = scores.o;
        scoreElements.tie.textContent = scores.tie;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', initGame); 