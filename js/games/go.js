// 围棋游戏主要逻辑

// 常量定义
const BLACK = 'black';
const WHITE = 'white';
const EMPTY = null;
const BOARD_SIZES = {
    SMALL: 9,
    MEDIUM: 13,
    LARGE: 19
};

// 游戏状态变量
let boardSize = BOARD_SIZES.MEDIUM; // 默认棋盘大小
let gameBoard = []; // 棋盘数组
let currentPlayer = BLACK; // 当前玩家
let gameActive = false; // 游戏是否进行中
let gameMode = 'pvp'; // 游戏模式：pvp(玩家对玩家)或pvc(玩家对电脑)
let difficulty = 'easy'; // AI难度
let lastMove = null; // 最后一步
let passCount = 0; // 连续放弃次数
let captures = { // 提子数量
    [BLACK]: 0,
    [WHITE]: 0
};
let gameHistory = []; // 游戏历史记录
let koPoint = null; // 打劫点
let scores = { // 胜利次数
    [BLACK]: 0,
    [WHITE]: 0
};

// DOM 元素引用
let boardElement;
let turnMarker;
let turnText;
let blackScoreElement;
let whiteScoreElement;
let blackCapturesElement;
let whiteCapturesElement;

// 调试函数
function debug(message, obj = null) {
    const debugMode = true; // 设置为false可关闭调试输出
    if (debugMode) {
        if (obj) {
            console.log(`[围棋调试] ${message}`, obj);
        } else {
            console.log(`[围棋调试] ${message}`);
        }
    }
}

// 初始化游戏
function initGame() {
    // 初始化棋盘
    gameBoard = createEmptyBoard(boardSize);
    
    // 重置游戏状态
    currentPlayer = BLACK;
    gameActive = true;
    passCount = 0;
    captures = {
        [BLACK]: 0,
        [WHITE]: 0
    };
    gameHistory = [];
    koPoint = null;
    lastMove = null;
    
    // 更新UI
    createBoardUI();
    updateTurnIndicator();
    updateCapturesDisplay();
}

// 创建空棋盘
function createEmptyBoard(size) {
    const board = [];
    for (let i = 0; i < size; i++) {
        board[i] = [];
        for (let j = 0; j < size; j++) {
            board[i][j] = EMPTY;
        }
    }
    return board;
}

// 初始化页面元素
function initElements() {
    debug('正在初始化页面元素...');
    boardElement = document.getElementById('board');
    turnMarker = document.getElementById('turn-marker');
    turnText = document.getElementById('turn-text');
    blackScoreElement = document.getElementById('black-score');
    whiteScoreElement = document.getElementById('white-score');
    blackCapturesElement = document.getElementById('black-captures');
    whiteCapturesElement = document.getElementById('white-captures');
    
    // 检查元素是否存在
    if (!boardElement) debug('警告: 棋盘元素未找到!');
    if (!turnMarker) debug('警告: 回合标记元素未找到!');
    if (!turnText) debug('警告: 回合文本元素未找到!');
    if (!blackScoreElement) debug('警告: 黑方分数元素未找到!');
    if (!whiteScoreElement) debug('警告: 白方分数元素未找到!');
    if (!blackCapturesElement) debug('警告: 黑方提子元素未找到!');
    if (!whiteCapturesElement) debug('警告: 白方提子元素未找到!');
}

// 初始化事件监听
function initEventListeners() {
    // 棋盘大小选择
    const boardSizeButtons = document.querySelectorAll('#board-size-selector button');
    boardSizeButtons.forEach(button => {
        button.addEventListener('click', () => {
            boardSizeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            boardSize = parseInt(button.dataset.size);
            initGame();
        });
    });
    
    // 游戏模式选择
    document.getElementById('pvp-btn').addEventListener('click', () => {
        document.getElementById('pvp-btn').classList.add('active');
        document.getElementById('pvc-btn').classList.remove('active');
        document.getElementById('difficulty-selector').style.display = 'none';
        gameMode = 'pvp';
        initGame();
    });
    
    document.getElementById('pvc-btn').addEventListener('click', () => {
        document.getElementById('pvc-btn').classList.add('active');
        document.getElementById('pvp-btn').classList.remove('active');
        document.getElementById('difficulty-selector').style.display = 'block';
        gameMode = 'pvc';
        initGame();
    });
    
    // 难度选择
    const difficultyButtons = document.querySelectorAll('#difficulty-selector button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            difficulty = button.dataset.level;
        });
    });
    
    // 游戏控制按钮
    document.getElementById('reset-btn').addEventListener('click', initGame);
    document.getElementById('pass-btn').addEventListener('click', handlePass);
    document.getElementById('resign-btn').addEventListener('click', handleResign);
    document.getElementById('undo-btn').addEventListener('click', handleUndo);
    document.getElementById('reset-score-btn').addEventListener('click', resetScores);
}

// 检查CSS文件是否加载
function checkCSSLoaded() {
    debug('检查CSS文件是否加载...');
    
    const stylesheets = Array.from(document.styleSheets);
    const goCSSLoaded = stylesheets.some(sheet => {
        try {
            return sheet.href && sheet.href.includes('go.css');
        } catch (e) {
            return false;
        }
    });
    
    if (!goCSSLoaded) {
        debug('警告: go.css 可能未加载!');
        console.warn('围棋CSS文件可能未正确加载，这可能导致棋盘显示异常。');
    } else {
        debug('go.css 已加载');
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 检查CSS是否加载
    checkCSSLoaded();
    
    // 初始化元素引用
    initElements();
    
    // 检查元素是否存在
    if (!boardElement) {
        console.error("棋盘元素未找到！");
        return;
    }
    
    // 初始化事件监听
    initEventListeners();
    
    // 初始化游戏
    initGame();
    
    // 初始化显示分数
    updateScoreDisplay();
});

// 创建棋盘UI
function createBoardUI() {
    debug(`正在创建棋盘UI，棋盘大小: ${boardSize}x${boardSize}`);
    
    // 清空棋盘
    boardElement.innerHTML = '';
    
    // 设置棋盘大小CSS变量
    boardElement.style.setProperty('--board-size', boardSize);
    debug(`设置CSS变量 --board-size = ${boardSize}`);
    
    // 创建交叉点
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const intersection = document.createElement('div');
            intersection.className = 'intersection';
            intersection.dataset.row = i;
            intersection.dataset.col = j;
            
            // 计算交叉点位置（从0到1的百分比）
            const x = (j / (boardSize - 1)) * 100;
            const y = (i / (boardSize - 1)) * 100;
            intersection.style.left = `${x}%`;
            intersection.style.top = `${y}%`;
            
            // 添加星位标记
            if (isStarPoint(i, j)) {
                const starPoint = document.createElement('div');
                starPoint.className = 'star-point';
                intersection.appendChild(starPoint);
                debug(`添加星位点在 (${i}, ${j})`);
            }
            
            // 添加点击事件
            intersection.addEventListener('click', () => handleIntersectionClick(i, j));
            
            boardElement.appendChild(intersection);
        }
    }
    
    debug(`创建了 ${boardSize * boardSize} 个交叉点`);
    
    // 更新棋盘状态
    updateBoardUI();
}

// 判断是否是星位点
function isStarPoint(row, col) {
    // 9路棋盘的星位
    if (boardSize === BOARD_SIZES.SMALL) {
        return (row === 2 && col === 2) || 
               (row === 2 && col === 6) || 
               (row === 6 && col === 2) || 
               (row === 6 && col === 6) || 
               (row === 4 && col === 4);
    }
    // 13路棋盘的星位
    else if (boardSize === BOARD_SIZES.MEDIUM) {
        return (row === 3 && col === 3) || 
               (row === 3 && col === 9) || 
               (row === 9 && col === 3) || 
               (row === 9 && col === 9) || 
               (row === 6 && col === 6);
    }
    // 19路棋盘的星位
    else {
        return (row === 3 && col === 3) || 
               (row === 3 && col === 9) || 
               (row === 3 && col === 15) || 
               (row === 9 && col === 3) || 
               (row === 9 && col === 9) || 
               (row === 9 && col === 15) || 
               (row === 15 && col === 3) || 
               (row === 15 && col === 9) || 
               (row === 15 && col === 15);
    }
}

// 更新棋盘UI
function updateBoardUI() {
    // 清除所有棋子
    document.querySelectorAll('.stone').forEach(stone => stone.remove());
    document.querySelectorAll('.intersection').forEach(intersection => {
        intersection.classList.remove('last-move');
    });
    
    // 放置棋子
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            const cell = gameBoard[i][j];
            if (cell !== EMPTY) {
                const intersection = document.querySelector(`.intersection[data-row="${i}"][data-col="${j}"]`);
                if (intersection) {
                    const stone = document.createElement('div');
                    stone.className = `stone ${cell}`;
                    intersection.appendChild(stone);
                    
                    // 标记最后一步
                    if (lastMove && lastMove.row === i && lastMove.col === j) {
                        intersection.classList.add('last-move');
                    }
                }
            }
        }
    }
}

// 更新回合指示器
function updateTurnIndicator() {
    if (currentPlayer === BLACK) {
        turnMarker.style.backgroundColor = '#000';
        turnText.textContent = '黑方回合';
    } else {
        turnMarker.style.backgroundColor = '#fff';
        turnMarker.style.border = '1px solid #000';
        turnText.textContent = '白方回合';
    }
}

// 更新提子显示
function updateCapturesDisplay() {
    blackCapturesElement.textContent = captures[BLACK];
    whiteCapturesElement.textContent = captures[WHITE];
}

// 更新分数显示
function updateScoreDisplay() {
    blackScoreElement.textContent = scores[BLACK];
    whiteScoreElement.textContent = scores[WHITE];
}

// 处理交叉点点击
function handleIntersectionClick(row, col) {
    debug(`点击了交叉点: (${row}, ${col})`);
    
    // 如果游戏未激活或不是玩家回合，不响应点击
    if (!gameActive || (gameMode === 'pvc' && currentPlayer === WHITE)) {
        debug('点击被忽略: 游戏未激活或不是玩家回合');
        return;
    }
    
    // 尝试放置棋子
    if (placeStone(row, col)) {
        debug(`成功在 (${row}, ${col}) 放置了 ${currentPlayer === BLACK ? '黑' : '白'}棋`);
        // 如果是PvC模式且成功放置，让AI走棋
        if (gameMode === 'pvc' && gameActive) {
            setTimeout(makeAIMove, 500);
        }
    } else {
        debug(`在 (${row}, ${col}) 放置棋子失败`);
    }
}

// 处理放弃一手
function handlePass() {
    if (!gameActive) return;
    
    // 记录历史
    gameHistory.push({
        board: JSON.parse(JSON.stringify(gameBoard)),
        currentPlayer,
        captures: {...captures},
        koPoint,
        isPass: true
    });
    
    // 增加连续放弃计数
    passCount++;
    
    // 如果连续两次放弃，游戏结束
    if (passCount >= 2) {
        endGame();
        return;
    }
    
    // 切换玩家
    switchPlayer();
    
    // 如果是PvC模式且轮到AI，让AI走棋
    if (gameMode === 'pvc' && currentPlayer === WHITE && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// 处理认输
function handleResign() {
    if (!gameActive) return;
    
    // 当前玩家认输，对方获胜
    const winner = currentPlayer === BLACK ? WHITE : BLACK;
    scores[winner]++;
    updateScoreDisplay();
    
    gameActive = false;
    alert(`${winner === BLACK ? '黑方' : '白方'}获胜！`);
}

// 处理悔棋
function handleUndo() {
    if (gameHistory.length === 0) return;
    
    // 在PvC模式下，需要撤销两步（玩家和AI的）
    if (gameMode === 'pvc') {
        // 如果历史记录只有一步，或者当前是电脑回合（说明玩家刚走完），只撤销一步
        if (gameHistory.length === 1 || currentPlayer === WHITE) {
            undoLastMove();
        } else {
            // 否则撤销两步
            undoLastMove();
            undoLastMove();
        }
    } else {
        // PvP模式只撤销一步
        undoLastMove();
    }
}

// 撤销最后一步
function undoLastMove() {
    if (gameHistory.length === 0) return;
    
    const lastState = gameHistory.pop();
    gameBoard = lastState.board;
    currentPlayer = lastState.currentPlayer;
    captures = lastState.captures;
    koPoint = lastState.koPoint;
    
    // 如果上一步是放弃，减少放弃计数
    if (lastState.isPass) {
        passCount = Math.max(0, passCount - 1);
    }
    
    // 更新UI
    updateBoardUI();
    updateTurnIndicator();
    updateCapturesDisplay();
}

// 重置分数
function resetScores() {
    scores[BLACK] = 0;
    scores[WHITE] = 0;
    updateScoreDisplay();
}

// 放置棋子
function placeStone(row, col) {
    // 检查位置是否有效
    if (!isValidMove(row, col)) {
        return false;
    }
    
    // 记录当前游戏状态用于历史记录
    const previousBoard = JSON.parse(JSON.stringify(gameBoard));
    const previousCaptures = {...captures};
    const previousKoPoint = koPoint;
    
    // 放置棋子
    gameBoard[row][col] = currentPlayer;
    
    // 记录最后一步
    lastMove = { row, col };
    
    // 检查并移除被吃掉的棋子
    const capturedStones = removeCapturedStones(row, col);
    
    // 检查打劫
    checkForKo(row, col, capturedStones);
    
    // 记录历史
    gameHistory.push({
        board: previousBoard,
        currentPlayer,
        captures: previousCaptures,
        koPoint: previousKoPoint
    });
    
    // 重置连续放弃计数
    passCount = 0;
    
    // 切换玩家
    switchPlayer();
    
    // 更新UI
    updateBoardUI();
    updateTurnIndicator();
    updateCapturesDisplay();
    
    return true;
}

// 检查移动是否有效
function isValidMove(row, col) {
    // 检查位置是否在棋盘范围内
    if (row < 0 || row >= boardSize || col < 0 || col >= boardSize) {
        return false;
    }
    
    // 检查位置是否已经有棋子
    if (gameBoard[row][col] !== EMPTY) {
        return false;
    }
    
    // 检查是否是打劫点
    if (koPoint && koPoint.row === row && koPoint.col === col) {
        return false;
    }
    
    // 检查自杀规则（不能放在会立即被提走的位置）
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    tempBoard[row][col] = currentPlayer;
    
    // 如果这一步会导致其他棋子被提走，那么这一步是有效的
    const opponent = currentPlayer === BLACK ? WHITE : BLACK;
    let willCaptureOpponent = false;
    
    // 检查四个相邻位置
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        // 检查位置是否有效
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            continue;
        }
        
        // 如果相邻位置是对手的棋子，检查它是否会被提走
        if (tempBoard[newRow][newCol] === opponent) {
            const group = findConnectedStones(newRow, newCol, tempBoard);
            if (countLiberties(group, tempBoard) === 0) {
                willCaptureOpponent = true;
                break;
            }
        }
    }
    
    // 如果不会提走对手的棋子，检查这一步是否会导致自杀
    if (!willCaptureOpponent) {
        const group = findConnectedStones(row, col, tempBoard);
        if (countLiberties(group, tempBoard) === 0) {
            return false;
        }
    }
    
    return true;
}

// 移除被吃掉的棋子
function removeCapturedStones(row, col) {
    const opponent = currentPlayer === BLACK ? WHITE : BLACK;
    const capturedGroups = [];
    
    // 检查四个相邻位置
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        // 检查位置是否有效
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            continue;
        }
        
        // 如果相邻位置是对手的棋子，检查它是否被提走
        if (gameBoard[newRow][newCol] === opponent) {
            const group = findConnectedStones(newRow, newCol, gameBoard);
            if (countLiberties(group, gameBoard) === 0) {
                capturedGroups.push(group);
            }
        }
    }
    
    // 移除被提走的棋子
    let capturedCount = 0;
    for (const group of capturedGroups) {
        for (const stone of group) {
            gameBoard[stone.row][stone.col] = EMPTY;
            capturedCount++;
        }
    }
    
    // 更新提子数量
    captures[currentPlayer] += capturedCount;
    
    return capturedGroups.flat();
}

// 查找连接的棋子（同一组）
function findConnectedStones(row, col, board) {
    const color = board[row][col];
    if (color === EMPTY) return [];
    
    const visited = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    const group = [];
    const queue = [{ row, col }];
    
    while (queue.length > 0) {
        const stone = queue.shift();
        if (visited[stone.row][stone.col]) continue;
        
        visited[stone.row][stone.col] = true;
        group.push(stone);
        
        // 检查四个相邻位置
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const newRow = stone.row + dx;
            const newCol = stone.col + dy;
            
            // 检查位置是否有效
            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                continue;
            }
            
            // 如果相邻位置是同色棋子，加入队列
            if (board[newRow][newCol] === color && !visited[newRow][newCol]) {
                queue.push({ row: newRow, col: newCol });
            }
        }
    }
    
    return group;
}

// 计算一组棋子的气数
function countLiberties(group, board) {
    const liberties = new Set();
    
    for (const stone of group) {
        // 检查四个相邻位置
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const newRow = stone.row + dx;
            const newCol = stone.col + dy;
            
            // 检查位置是否有效
            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                continue;
            }
            
            // 如果相邻位置是空的，这是一口气
            if (board[newRow][newCol] === EMPTY) {
                liberties.add(`${newRow},${newCol}`);
            }
        }
    }
    
    return liberties.size;
}

// 检查打劫
function checkForKo(row, col, capturedStones) {
    // 如果只提走了一个棋子，可能是打劫
    if (capturedStones.length === 1) {
        // 检查刚放下的棋子是否只有一口气
        const group = findConnectedStones(row, col, gameBoard);
        if (countLiberties(group, gameBoard) === 1) {
            // 这是打劫点
            koPoint = {
                row: capturedStones[0].row,
                col: capturedStones[0].col
            };
            return;
        }
    }
    
    // 不是打劫
    koPoint = null;
}

// 切换当前玩家
function switchPlayer() {
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
}

// 游戏结束处理
function endGame() {
    gameActive = false;
    
    // 计算领地和得分
    const { territories, finalScores } = calculateScore();
    
    // 确定胜者
    let winner;
    if (finalScores[BLACK] > finalScores[WHITE]) {
        winner = BLACK;
    } else if (finalScores[WHITE] > finalScores[BLACK]) {
        winner = WHITE;
    } else {
        winner = null; // 平局
    }
    
    // 更新胜利记录
    if (winner) {
        scores[winner]++;
        updateScoreDisplay();
    }
    
    // 显示结果
    const blackScore = finalScores[BLACK];
    const whiteScore = finalScores[WHITE];
    const message = winner 
        ? `游戏结束！${winner === BLACK ? '黑方' : '白方'}胜利！\n黑方得分：${blackScore}\n白方得分：${whiteScore}`
        : `游戏结束！平局！\n黑方得分：${blackScore}\n白方得分：${whiteScore}`;
    
    alert(message);
}

// 计算得分
function calculateScore() {
    // 创建临时棋盘用于计算领地
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    const territories = {
        [BLACK]: [],
        [WHITE]: [],
        neutral: []
    };
    
    // 标记所有空点的所有者
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (tempBoard[i][j] === EMPTY) {
                const owner = determineTerritory(i, j, tempBoard);
                if (owner === BLACK) {
                    territories[BLACK].push({ row: i, col: j });
                } else if (owner === WHITE) {
                    territories[WHITE].push({ row: i, col: j });
                } else {
                    territories.neutral.push({ row: i, col: j });
                }
            }
        }
    }
    
    // 计算最终得分
    const finalScores = {
        [BLACK]: territories[BLACK].length + captures[BLACK],
        [WHITE]: territories[WHITE].length + captures[WHITE]
    };
    
    return { territories, finalScores };
}

// 确定空点的领地归属
function determineTerritory(row, col, board) {
    const visited = Array(boardSize).fill().map(() => Array(boardSize).fill(false));
    const emptyPoints = [];
    const borderingColors = new Set();
    
    // 使用BFS查找连接的空点
    const queue = [{ row, col }];
    
    while (queue.length > 0) {
        const point = queue.shift();
        if (visited[point.row][point.col]) continue;
        
        visited[point.row][point.col] = true;
        emptyPoints.push(point);
        
        // 检查四个相邻位置
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dx, dy] of directions) {
            const newRow = point.row + dx;
            const newCol = point.col + dy;
            
            // 检查位置是否有效
            if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
                continue;
            }
            
            // 如果是空点，加入队列
            if (board[newRow][newCol] === EMPTY && !visited[newRow][newCol]) {
                queue.push({ row: newRow, col: newCol });
            }
            // 如果是棋子，记录颜色
            else if (board[newRow][newCol] !== EMPTY) {
                borderingColors.add(board[newRow][newCol]);
            }
        }
    }
    
    // 如果只与一种颜色相邻，则属于该颜色的领地
    if (borderingColors.size === 1) {
        return Array.from(borderingColors)[0];
    } else {
        return null; // 中立区域
    }
}

// AI相关功能
// =====================

// AI移动
function makeAIMove() {
    if (!gameActive || currentPlayer !== WHITE) return;
    
    // 根据难度选择不同的AI策略
    let move;
    switch (difficulty) {
        case 'easy':
            move = makeRandomMove();
            break;
        case 'medium':
            move = makeMediumMove();
            break;
        case 'hard':
        case 'expert':
        case 'master':
        case 'grandmaster':
        case 'legendary':
            move = makeAdvancedMove();
            break;
        default:
            move = makeRandomMove();
    }
    
    // 如果找不到有效移动，AI放弃一手
    if (!move) {
        handlePass();
        return;
    }
    
    // 执行移动
    placeStone(move.row, move.col);
}

// 随机移动（简单难度）
function makeRandomMove() {
    // 获取所有有效移动
    const validMoves = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (isValidMove(i, j)) {
                validMoves.push({ row: i, col: j });
            }
        }
    }
    
    // 如果没有有效移动，返回null
    if (validMoves.length === 0) {
        return null;
    }
    
    // 随机选择一个有效移动
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

// 中等难度AI移动
function makeMediumMove() {
    // 30%的概率使用高级移动，70%的概率使用随机移动
    if (Math.random() < 0.3) {
        return makeAdvancedMove();
    } else {
        return makeRandomMove();
    }
}

// 高级AI移动
function makeAdvancedMove() {
    // 这里实现一个简单的启发式算法
    // 在实际应用中，可以使用更复杂的算法如蒙特卡洛树搜索（MCTS）
    
    // 获取所有有效移动
    const validMoves = [];
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (isValidMove(i, j)) {
                validMoves.push({ row: i, col: j });
            }
        }
    }
    
    // 如果没有有效移动，返回null
    if (validMoves.length === 0) {
        return null;
    }
    
    // 评估每个移动
    const scoredMoves = validMoves.map(move => {
        const score = evaluateMove(move.row, move.col);
        return { ...move, score };
    });
    
    // 根据难度选择移动
    let selectedMove;
    
    // 越高级的难度，越倾向于选择最佳移动
    const randomFactor = getDifficultyRandomFactor();
    
    if (Math.random() < randomFactor) {
        // 随机选择一个移动
        selectedMove = scoredMoves[Math.floor(Math.random() * scoredMoves.length)];
    } else {
        // 选择得分最高的移动
        scoredMoves.sort((a, b) => b.score - a.score);
        selectedMove = scoredMoves[0];
    }
    
    return selectedMove;
}

// 根据难度获取随机因子
function getDifficultyRandomFactor() {
    switch (difficulty) {
        case 'hard': return 0.4;
        case 'expert': return 0.3;
        case 'master': return 0.2;
        case 'grandmaster': return 0.1;
        case 'legendary': return 0.05;
        default: return 0.5;
    }
}

// 评估移动
function evaluateMove(row, col) {
    // 创建临时棋盘
    const tempBoard = JSON.parse(JSON.stringify(gameBoard));
    tempBoard[row][col] = WHITE;
    
    let score = 0;
    
    // 1. 检查是否可以提子
    const opponent = BLACK;
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    
    for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        // 检查位置是否有效
        if (newRow < 0 || newRow >= boardSize || newCol < 0 || newCol >= boardSize) {
            continue;
        }
        
        // 如果相邻位置是对手的棋子，检查它是否会被提走
        if (tempBoard[newRow][newCol] === opponent) {
            const group = findConnectedStones(newRow, newCol, tempBoard);
            const liberties = countLiberties(group, tempBoard);
            
            if (liberties === 0) {
                // 可以提子，加分
                score += group.length * 10;
            } else if (liberties === 1) {
                // 威胁对方棋子，加分
                score += group.length * 5;
            }
        }
    }
    
    // 2. 检查自己棋子的安全性
    const ownGroup = findConnectedStones(row, col, tempBoard);
    const ownLiberties = countLiberties(ownGroup, tempBoard);
    
    // 气越多越安全
    score += ownLiberties * 3;
    
    // 3. 位置评估
    // 倾向于在棋盘中央放置棋子
    const centerRow = boardSize / 2;
    const centerCol = boardSize / 2;
    const distanceToCenter = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
    const maxDistance = Math.sqrt(Math.pow(boardSize, 2) + Math.pow(boardSize, 2)) / 2;
    
    // 距离中心越近，分数越高
    score += (1 - distanceToCenter / maxDistance) * 10;
    
    // 4. 靠近自己的棋子
    let nearbyOwnStones = 0;
    for (let i = Math.max(0, row - 2); i <= Math.min(boardSize - 1, row + 2); i++) {
        for (let j = Math.max(0, col - 2); j <= Math.min(boardSize - 1, col + 2); j++) {
            if (tempBoard[i][j] === WHITE) {
                const distance = Math.abs(i - row) + Math.abs(j - col);
                if (distance <= 2) {
                    nearbyOwnStones++;
                }
            }
        }
    }
    
    score += nearbyOwnStones * 2;
    
    // 5. 随机因素，增加变化性
    score += Math.random() * 5;
    
    return score;
}
