// 五子棋游戏

// 公开全局变量供其他JS文件使用
window.PLAYER_BLACK = 'black';
window.PLAYER_WHITE = 'white';
window.EMPTY = '';
window.BOARD_SIZE = 15;  // 15x15棋盘
window.DIRECTIONS = [
    [0, 1],  // 水平
    [1, 0],  // 垂直
    [1, 1],  // 对角线
    [1, -1]  // 反对角线
];
window.MARK_POSITIONS = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11]
];

// 游戏常量
const PLAYER_BLACK = 'black';
const PLAYER_WHITE = 'white';
const EMPTY = '';
const BOARD_SIZE = 15;  // 15x15棋盘

// 游戏变量
let currentPlayer = PLAYER_BLACK;  // 黑棋先行
let gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
let gameActive = true;
let againstAI = false;
let currentDifficulty = 'easy';  // 默认难度级别：简单
let lastMove = null;  // 记录最后一步
let moveHistory = [];  // 记录所有移动
let scores = {
    black: 0,
    white: 0,
    tie: 0
};

// 也将游戏变量公开给其他JS文件
window.gameBoard = gameBoard;
window.currentPlayer = currentPlayer;
window.gameActive = gameActive;
window.currentDifficulty = currentDifficulty;
window.lastMove = lastMove;
window.moveHistory = moveHistory;

// 获胜方向
const DIRECTIONS = [
    [0, 1],  // 水平
    [1, 0],  // 垂直
    [1, 1],  // 对角线
    [1, -1]  // 反对角线
];

// 标记点位置（天元和星）
const MARK_POSITIONS = [
    [3, 3], [3, 7], [3, 11],
    [7, 3], [7, 7], [7, 11],
    [11, 3], [11, 7], [11, 11]
];

// DOM元素
const board = document.getElementById('board');
const turnText = document.getElementById('turn-text');
const turnMarker = document.getElementById('turn-marker');
const resetButton = document.getElementById('reset-btn');
const undoButton = document.getElementById('undo-btn');
const resetScoreButton = document.getElementById('reset-score-btn');
const pvpButton = document.getElementById('pvp-btn');
const pvcButton = document.getElementById('pvc-btn');
const difficultySelector = document.getElementById('difficulty-selector');
const difficultyButtons = document.querySelectorAll('.difficulty-selector .game-btn');
const scoreElements = {
    black: document.getElementById('black-score'),
    white: document.getElementById('white-score'),
    tie: document.getElementById('tie-score')
};

// 初始化游戏
function initGame() {
    // 创建棋盘
    createBoard();
    
    // 从本地存储加载分数
    loadScores();
    
    // 添加按钮事件
    resetButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoMove);
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

// 创建棋盘
function createBoard() {
    board.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 添加边缘样式
            if (row === 0) cell.classList.add('edge-top');
            if (row === BOARD_SIZE - 1) cell.classList.add('edge-bottom');
            if (col === 0) cell.classList.add('edge-left');
            if (col === BOARD_SIZE - 1) cell.classList.add('edge-right');
            
            // 添加标记点
            if (MARK_POSITIONS.some(([r, c]) => r === row && c === col)) {
                cell.classList.add('mark');
            }
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            board.appendChild(cell);
        }
    }
}

// 单元格点击处理
function handleCellClick(row, col) {
    console.log("点击单元格:", row, col);
    console.log("当前模式:", againstAI ? "人机对战" : "双人对战");
    console.log("当前玩家:", currentPlayer);

    // 检查单元格是否已被占用或游戏是否已结束
    if (gameBoard[row][col] !== EMPTY || !gameActive) {
        console.log("单元格已占用或游戏已结束，不处理点击");
        return;
    }
    
    // 在人机模式下，玩家只能控制黑棋
    if (againstAI && currentPlayer !== PLAYER_BLACK) {
        console.log("人机模式下玩家尝试控制白棋，已阻止");
        return;
    }
    
    // 玩家落子
    console.log("玩家在位置放置棋子:", row, col);
    placePiece(row, col);
    
    // 检查游戏状态
    const gameEnded = checkGameStatus(row, col);
    console.log("游戏状态检查结果:", gameEnded ? "游戏结束" : "游戏继续");
    
    // 如果游戏继续，且是人机模式
    if (!gameEnded && againstAI) {
        console.log("人机模式，游戏继续，当前玩家:", currentPlayer);
        if (currentPlayer === PLAYER_WHITE) {
            console.log("准备调用AI...");
            // 立即调用AI，不使用setTimeout
            try {
                // 确保makeAIMove是可用的
                if (typeof makeAIMove === 'function') {
                    makeAIMove();
                } else {
                    console.error("makeAIMove函数不可用，尝试使用备用方法");
                    // 使用内联备用方法
                    const backupAI = function() {
                        console.log("使用内联备用AI");
                        
                        // 简单随机移动
                        const emptyPositions = [];
                        for (let r = 0; r < BOARD_SIZE; r++) {
                            for (let c = 0; c < BOARD_SIZE; c++) {
                                if (gameBoard[r][c] === EMPTY) {
                                    emptyPositions.push({ row: r, col: c });
                                }
                            }
                        }
                        
                        if (emptyPositions.length > 0) {
                            const move = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                            console.log("备用AI选择位置:", move.row, move.col);
                            placePiece(move.row, move.col);
                            checkGameStatus(move.row, move.col);
                        }
                    };
                    
                    backupAI();
                }
            } catch (e) {
                console.error("AI移动出错:", e);
            }
        }
    }
}

// 放置棋子
function placePiece(row, col) {
    // 更新游戏数据
    gameBoard[row][col] = currentPlayer;
    
    // 记录历史移动
    moveHistory.push({ row, col, player: currentPlayer });
    
    // 更新UI
    renderPiece(row, col);
}

// 渲染棋子
function renderPiece(row, col) {
    // 清除旧的最后一步标记
    if (lastMove) {
        const lastCell = board.querySelector(`.cell[data-row="${lastMove.row}"][data-col="${lastMove.col}"] .piece`);
        if (lastCell) {
            lastCell.classList.remove('last-move');
        }
    }
    
    // 创建棋子
    const cell = board.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const piece = document.createElement('div');
    piece.className = `piece ${currentPlayer}`;
    piece.classList.add('last-move');  // 标记为最后一步
    cell.appendChild(piece);
    
    // 更新最后一步
    lastMove = { row, col };
}

// 检查游戏状态，返回游戏是否结束
function checkGameStatus(row, col) {
    console.log("检查游戏状态...");
    
    // 检查胜利
    if (checkWin(row, col)) {
        console.log("检测到获胜:", currentPlayer);
        gameActive = false;
        updateScore(currentPlayer);
        showGameOverMessage(`${currentPlayer === PLAYER_BLACK ? '黑棋' : '白棋'} 获胜了!`);
        return true;
    }
    
    // 检查平局
    if (checkTie()) {
        console.log("检测到平局");
        gameActive = false;
        updateScore('tie');
        showGameOverMessage('平局！');
        return true;
    }
    
    console.log("游戏继续");
    // 继续游戏，切换玩家
    switchPlayer();
    return false;
}

// 切换玩家
function switchPlayer() {
    currentPlayer = currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
    updateTurnIndicator();
}

// 检查胜利
function checkWin(row, col) {
    const player = gameBoard[row][col];
    
    // 检查四个方向
    for (const [dx, dy] of DIRECTIONS) {
        let count = 1;  // 已经包含当前落子
        
        // 正方向检查
        count += countConsecutive(row, col, dx, dy, player);
        // 反方向检查
        count += countConsecutive(row, col, -dx, -dy, player);
        
        // 如果连续五子，则获胜
        if (count >= 5) {
            // 显示获胜线
            showWinningLine(row, col, dx, dy, count);
            return true;
        }
    }
    
    return false;
}

// 计算连续同色棋子数量
function countConsecutive(row, col, dx, dy, player) {
    let count = 0;
    let r = row + dx;
    let c = col + dy;
    
    while (
        r >= 0 && r < BOARD_SIZE && 
        c >= 0 && c < BOARD_SIZE && 
        gameBoard[r][c] === player
    ) {
        count++;
        r += dx;
        c += dy;
    }
    
    return count;
}

// 显示获胜线
function showWinningLine(row, col, dx, dy, count) {
    // 计算起点和终点
    const startRow = row - (count - 1) * dx / 2;
    const startCol = col - (count - 1) * dy / 2;
    const endRow = row + (count - 1) * dx / 2;
    const endCol = col + (count - 1) * dy / 2;
    
    // 计算线的长度和角度
    const cellSize = board.clientWidth / BOARD_SIZE;
    const length = cellSize * (count - 0.5);
    
    // 计算角度
    let angle = 0;
    if (dx === 0) angle = 0;  // 水平
    else if (dy === 0) angle = 90;  // 垂直
    else if (dx === dy) angle = 45;  // 对角线
    else angle = -45;  // 反对角线
    
    // 创建线元素
    const line = document.createElement('div');
    line.className = 'winning-line';
    line.style.width = `${length}px`;
    line.style.height = `4px`;
    line.style.top = `${(startRow + endRow) * cellSize / 2 + cellSize / 2}px`;
    line.style.left = `${(startCol + endCol) * cellSize / 2 + cellSize / 2}px`;
    line.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    
    board.appendChild(line);
}

// 检查平局
function checkTie() {
    return gameBoard.every(row => row.every(cell => cell !== EMPTY));
}

// 悔棋功能
function undoMove() {
    // 如果没有历史记录或游戏结束，不允许悔棋
    if (moveHistory.length === 0 || !gameActive) return;
    
    // 移除最后一步
    const lastMove = moveHistory.pop();
    
    // 更新游戏数据
    gameBoard[lastMove.row][lastMove.col] = EMPTY;
    
    // 更新UI
    const cell = board.querySelector(`.cell[data-row="${lastMove.row}"][data-col="${lastMove.col}"]`);
    if (cell.lastChild) {
        cell.removeChild(cell.lastChild);
    }
    
    // 如果是人机模式下悔棋，需要悔两步（一次悔棋应该同时撤销玩家和电脑的落子）
    if (againstAI && moveHistory.length > 0) {
        // 如果是黑棋（玩家）回合，说明上一步是电脑(白棋)走的，再悔一步
        if (lastMove.player === PLAYER_WHITE) {
            // 移除玩家（黑棋）的上一步
            const playerLastMove = moveHistory.pop();
            
            // 更新游戏数据
            gameBoard[playerLastMove.row][playerLastMove.col] = EMPTY;
            
            // 更新UI
            const playerCell = board.querySelector(`.cell[data-row="${playerLastMove.row}"][data-col="${playerLastMove.col}"]`);
            if (playerCell.lastChild) {
                playerCell.removeChild(playerCell.lastChild);
            }
            
            // 确保当前玩家是黑棋（玩家）
            currentPlayer = PLAYER_BLACK;
        }
    } else {
        // 切换玩家
        switchPlayer();
    }
    
    // 更新最后一步标记
    if (moveHistory.length > 0) {
        const prevMove = moveHistory[moveHistory.length - 1];
        lastMove = { row: prevMove.row, col: prevMove.col };
        const prevCell = board.querySelector(`.cell[data-row="${prevMove.row}"][data-col="${prevMove.col}"] .piece`);
        if (prevCell) {
            prevCell.classList.add('last-move');
        }
    } else {
        lastMove = null;
    }
    
    // 更新回合指示器
    updateTurnIndicator();
}

// 更新得分
function updateScore(winner) {
    scores[winner]++;
    scoreElements[winner].textContent = scores[winner];
    saveScores();
}

// 重置游戏
function resetGame() {
    // 重置游戏数据
    gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    gameActive = true;
    lastMove = null;
    moveHistory = [];
    
    // 在人机模式下，玩家总是黑棋
    if (againstAI) {
        currentPlayer = PLAYER_BLACK;
    } else {
        currentPlayer = PLAYER_BLACK; // 黑棋始终先行
    }
    
    // 清空棋盘
    board.innerHTML = '';
    
    // 重新创建棋盘
    createBoard();
    
    // 更新玩家指示器
    updateTurnIndicator();
    
    // 移除游戏结束消息
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
    
    console.log("游戏已重置，当前模式:", againstAI ? "人机对战" : "双人对战", "，当前玩家:", currentPlayer);
}

// 重置分数
function resetScores() {
    scores = { black: 0, white: 0, tie: 0 };
    scoreElements.black.textContent = '0';
    scoreElements.white.textContent = '0';
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
        // 确保在人机对战模式下，玩家总是黑棋
        currentPlayer = PLAYER_BLACK;
        updateTurnIndicator();
        console.log("已启用人机模式，玩家执黑，电脑执白");
    } else {
        pvpButton.classList.add('active');
        pvcButton.classList.remove('active');
        difficultySelector.style.display = 'none'; // 隐藏难度选择器
        console.log("已启用双人模式");
    }
}

// 更新回合指示器
function updateTurnIndicator() {
    const playerText = currentPlayer === PLAYER_BLACK ? '黑棋' : '白棋';
    turnText.textContent = `${playerText}回合`;
    
    // 更新标记颜色
    turnMarker.classList.remove('white');
    if (currentPlayer === PLAYER_WHITE) {
        turnMarker.classList.add('white');
    }
    
    // 在人机模式下，如果是电脑回合，禁用悔棋按钮
    undoButton.disabled = againstAI && currentPlayer === PLAYER_WHITE;
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
    localStorage.setItem('gomoku_scores', JSON.stringify(scores));
    // 记录游戏状态
    localStorage.setItem('game_gomoku_lastplayed', new Date().toISOString());
    // 记录最高分（用于首页显示）
    localStorage.setItem('game_gomoku_highscore', Math.max(scores.black, scores.white));
}

// 从本地存储加载分数
function loadScores() {
    const savedScores = localStorage.getItem('gomoku_scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
        scoreElements.black.textContent = scores.black;
        scoreElements.white.textContent = scores.white;
        scoreElements.tie.textContent = scores.tie;
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    // 创建备用的AI函数，确保即使脚本加载失败也能工作
    ensureHelperFunctionsExist();
    
    // 从games/gomoku.html加载时的正确路径
    console.log("当前页面URL:", window.location.href);
    console.log("尝试加载AI脚本...");
    
    loadScripts([
        '../js/games/gomoku-ai-helper.js',
        '../js/games/gomoku-ai.js'
    ], function() {
        console.log("脚本加载回调执行");
        // 脚本加载后创建直接引用
        if (typeof makeAIMove !== 'function') {
            console.error("脚本加载后makeAIMove仍未定义，使用备用函数");
        } else {
            console.log("成功加载makeAIMove函数");
        }
        initGame();
    });
});

// 加载脚本辅助函数
function loadScripts(urls, callback) {
    let loadedCount = 0;
    let errorCount = 0;
    
    console.log("开始加载脚本:", urls);
    
    // 检查所有脚本是否加载完成
    function checkAllLoaded() {
        loadedCount++;
        console.log(`脚本加载进度: ${loadedCount}/${urls.length}, 错误: ${errorCount}`);
        
        if (loadedCount === urls.length) {
            if (errorCount > 0) {
                console.error(`有${errorCount}个脚本加载失败，可能影响游戏功能`);
                // 添加基本的辅助函数实现，防止错误
                ensureHelperFunctionsExist();
            }
            console.log("所有脚本加载完成，初始化游戏");
            callback();
        }
    }
    
    // 加载每个脚本
    urls.forEach(url => {
        const script = document.createElement('script');
        script.src = url;
        script.onload = function() {
            console.log(`脚本加载成功: ${url}`);
            checkAllLoaded();
        };
        script.onerror = function() {
            console.error(`脚本加载失败: ${url}`);
            errorCount++;
            checkAllLoaded(); // 继续加载其他脚本
        };
        document.body.appendChild(script);
    });
}

// 确保基本函数存在
function ensureHelperFunctionsExist() {
    console.log("添加备用辅助函数");
    
    // 确保基本AI函数存在
    if (typeof findWinningMove !== 'function') {
        console.log("添加备用findWinningMove函数");
        window.findWinningMove = function(player) {
            return null;
        };
    }
    
    if (typeof findDefensiveMove !== 'function') {
        window.findDefensiveMove = function() {
            return null;
        };
    }
    
    if (typeof findOffensiveMove !== 'function') {
        window.findOffensiveMove = function() {
            return null;
        };
    }
    
    if (typeof findThreeInRowMove !== 'function') {
        window.findThreeInRowMove = function() {
            return null;
        };
    }
    
    if (typeof findNearbyMove !== 'function') {
        window.findNearbyMove = function() {
            return null;
        };
    }
    
    if (typeof makeRandomMove !== 'function') {
        window.makeRandomMove = function() {
            // 实现简单的随机移动
            const emptyPositions = [];
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    if (gameBoard[row][col] === EMPTY) {
                        emptyPositions.push({ row, col });
                    }
                }
            }
            if (emptyPositions.length > 0) {
                return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
            }
            return null;
        };
    }
    
    // 确保makeAIMove函数存在
    if (typeof makeAIMove !== 'function') {
        console.log("添加备用makeAIMove函数");
        window.makeAIMove = function() {
            console.log("使用内置AI函数");
            
            if (!gameActive) {
                console.log("游戏已结束，AI不行动");
                return;
            }
            
            if (currentPlayer !== PLAYER_WHITE) {
                console.log("不是AI回合，AI不行动");
                return;
            }
            
            console.log("AI正在思考...");
            
            // 简单随机移动
            const emptyPositions = [];
            for (let row = 0; row < BOARD_SIZE; row++) {
                for (let col = 0; col < BOARD_SIZE; col++) {
                    if (gameBoard[row][col] === EMPTY) {
                        emptyPositions.push({ row, col });
                    }
                }
            }
            
            if (emptyPositions.length > 0) {
                const move = emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
                console.log("AI选择位置:", move.row, move.col);
                placePiece(move.row, move.col);
                checkGameStatus(move.row, move.col);
            } else {
                console.log("没有可用的移动位置");
            }
        };
    }
}

// 公开给其他脚本使用
window.placePiece = placePiece;
window.checkGameStatus = checkGameStatus;
window.switchPlayer = switchPlayer; 