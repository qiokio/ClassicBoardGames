// 中国象棋游戏主文件

// 游戏常量
const BOARD_WIDTH = 9; // 棋盘宽度
const BOARD_HEIGHT = 10; // 棋盘高度
const PLAYER_RED = 1; // 红方
const PLAYER_BLACK = 2; // 黑方

// 棋子类型
const PIECE_TYPES = {
    GENERAL: 'general', // 将/帅
    ADVISOR: 'advisor', // 士/仕
    ELEPHANT: 'elephant', // 象/相
    HORSE: 'horse', // 马
    CHARIOT: 'chariot', // 车
    CANNON: 'cannon', // 炮
    PAWN: 'pawn' // 兵/卒
};

// 游戏状态变量
let gameBoard = []; // 棋盘状态
let currentPlayer = PLAYER_RED; // 当前玩家，红方先行
let gameActive = false; // 游戏是否进行中
let gameMode = 'pvp'; // 游戏模式：pvp（双人对战）或 pvc（人机对战）
let currentDifficulty = 'easy'; // AI难度
let moveHistory = []; // 移动历史
let scores = { red: 0, black: 0, tie: 0 }; // 分数记录
let selectedPiece = null; // 当前选中的棋子
let legalMoves = []; // 当前选中棋子的合法移动

// DOM 元素
const boardElement = document.getElementById('board');
const turnMarker = document.getElementById('turn-marker');
const turnText = document.getElementById('turn-text');
const redScoreElement = document.getElementById('red-score');
const blackScoreElement = document.getElementById('black-score');
const tieScoreElement = document.getElementById('tie-score');
const pvpButton = document.getElementById('pvp-btn');
const pvcButton = document.getElementById('pvc-btn');
const difficultySelector = document.getElementById('difficulty-selector');
const resetButton = document.getElementById('reset-btn');
const undoButton = document.getElementById('undo-btn');
const resetScoreButton = document.getElementById('reset-score-btn');

// 初始化函数
function init() {
    setupEventListeners();
    resetGame();
    loadScores();
    updateScoreDisplay();
}

// 设置事件监听器
function setupEventListeners() {
    // 游戏模式按钮
    pvpButton.addEventListener('click', () => setGameMode('pvp'));
    pvcButton.addEventListener('click', () => setGameMode('pvc'));
    
    // 难度按钮
    const difficultyButtons = difficultySelector.querySelectorAll('button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.getAttribute('data-level'));
            
            // 更新UI
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // 游戏控制按钮
    resetButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoMove);
    resetScoreButton.addEventListener('click', resetScores);
}

// 设置游戏模式
function setGameMode(mode) {
    gameMode = mode;
    
    // 更新UI
    if (mode === 'pvp') {
        pvpButton.classList.add('active');
        pvcButton.classList.remove('active');
        difficultySelector.style.display = 'none';
    } else {
        pvcButton.classList.add('active');
        pvpButton.classList.remove('active');
        difficultySelector.style.display = 'flex';
    }
    
    resetGame();
}

// 设置AI难度
function setDifficulty(difficulty) {
    currentDifficulty = difficulty;
}

// 加载分数
function loadScores() {
    const savedScores = localStorage.getItem('xiangqi_scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}

// 保存分数
function saveScores() {
    localStorage.setItem('xiangqi_scores', JSON.stringify(scores));
    
    // 保存最后游玩时间
    localStorage.setItem('game_xiangqi_lastplayed', new Date().toISOString());
}

// 更新分数显示
function updateScoreDisplay() {
    redScoreElement.textContent = scores.red;
    blackScoreElement.textContent = scores.black;
    tieScoreElement.textContent = scores.tie;
}

// 重置分数
function resetScores() {
    scores = { red: 0, black: 0, tie: 0 };
    updateScoreDisplay();
    saveScores();
}

// 重置游戏
function resetGame() {
    // 创建空棋盘
    gameBoard = createEmptyBoard();
    
    // 设置初始棋子
    setupInitialPosition();
    
    // 重置游戏状态
    currentPlayer = PLAYER_RED;
    gameActive = true;
    selectedPiece = null;
    legalMoves = [];
    moveHistory = [];
    
    // 更新UI
    renderBoard();
    updateTurnIndicator();
}

// 创建空棋盘
function createEmptyBoard() {
    const board = [];
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_WIDTH; col++) {
            board[row][col] = null;
        }
    }
    return board;
}

// 设置初始棋子位置
function setupInitialPosition() {
    // 红方（下方）棋子
    // 车
    gameBoard[9][0] = { type: PIECE_TYPES.CHARIOT, player: PLAYER_RED };
    gameBoard[9][8] = { type: PIECE_TYPES.CHARIOT, player: PLAYER_RED };
    // 马
    gameBoard[9][1] = { type: PIECE_TYPES.HORSE, player: PLAYER_RED };
    gameBoard[9][7] = { type: PIECE_TYPES.HORSE, player: PLAYER_RED };
    // 相
    gameBoard[9][2] = { type: PIECE_TYPES.ELEPHANT, player: PLAYER_RED };
    gameBoard[9][6] = { type: PIECE_TYPES.ELEPHANT, player: PLAYER_RED };
    // 士
    gameBoard[9][3] = { type: PIECE_TYPES.ADVISOR, player: PLAYER_RED };
    gameBoard[9][5] = { type: PIECE_TYPES.ADVISOR, player: PLAYER_RED };
    // 帅
    gameBoard[9][4] = { type: PIECE_TYPES.GENERAL, player: PLAYER_RED };
    // 炮
    gameBoard[7][1] = { type: PIECE_TYPES.CANNON, player: PLAYER_RED };
    gameBoard[7][7] = { type: PIECE_TYPES.CANNON, player: PLAYER_RED };
    // 兵
    gameBoard[6][0] = { type: PIECE_TYPES.PAWN, player: PLAYER_RED };
    gameBoard[6][2] = { type: PIECE_TYPES.PAWN, player: PLAYER_RED };
    gameBoard[6][4] = { type: PIECE_TYPES.PAWN, player: PLAYER_RED };
    gameBoard[6][6] = { type: PIECE_TYPES.PAWN, player: PLAYER_RED };
    gameBoard[6][8] = { type: PIECE_TYPES.PAWN, player: PLAYER_RED };
    
    // 黑方（上方）棋子
    // 车
    gameBoard[0][0] = { type: PIECE_TYPES.CHARIOT, player: PLAYER_BLACK };
    gameBoard[0][8] = { type: PIECE_TYPES.CHARIOT, player: PLAYER_BLACK };
    // 马
    gameBoard[0][1] = { type: PIECE_TYPES.HORSE, player: PLAYER_BLACK };
    gameBoard[0][7] = { type: PIECE_TYPES.HORSE, player: PLAYER_BLACK };
    // 象
    gameBoard[0][2] = { type: PIECE_TYPES.ELEPHANT, player: PLAYER_BLACK };
    gameBoard[0][6] = { type: PIECE_TYPES.ELEPHANT, player: PLAYER_BLACK };
    // 士
    gameBoard[0][3] = { type: PIECE_TYPES.ADVISOR, player: PLAYER_BLACK };
    gameBoard[0][5] = { type: PIECE_TYPES.ADVISOR, player: PLAYER_BLACK };
    // 将
    gameBoard[0][4] = { type: PIECE_TYPES.GENERAL, player: PLAYER_BLACK };
    // 炮
    gameBoard[2][1] = { type: PIECE_TYPES.CANNON, player: PLAYER_BLACK };
    gameBoard[2][7] = { type: PIECE_TYPES.CANNON, player: PLAYER_BLACK };
    // 卒
    gameBoard[3][0] = { type: PIECE_TYPES.PAWN, player: PLAYER_BLACK };
    gameBoard[3][2] = { type: PIECE_TYPES.PAWN, player: PLAYER_BLACK };
    gameBoard[3][4] = { type: PIECE_TYPES.PAWN, player: PLAYER_BLACK };
    gameBoard[3][6] = { type: PIECE_TYPES.PAWN, player: PLAYER_BLACK };
    gameBoard[3][8] = { type: PIECE_TYPES.PAWN, player: PLAYER_BLACK };
}

// 绘制棋盘
function renderBoard() {
    // 清空棋盘
    boardElement.innerHTML = '';
    
    // 添加九宫格斜线
    addPalaceLines();
    
    // 创建棋盘格子和棋子
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            // 创建格子
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.style.left = `${col * (100 / BOARD_WIDTH)}%`;
            cell.style.top = `${row * (100 / BOARD_HEIGHT)}%`;
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            // 检查是否是选中的棋子
            if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                cell.classList.add('selected');
            }
            
            // 检查是否是合法移动位置
            if (legalMoves.some(move => move.row === row && move.col === col)) {
                cell.classList.add('legal-move');
            }
            
            // 添加棋子
            const piece = gameBoard[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(piece.player === PLAYER_RED ? 'red' : 'black');
                
                // 设置棋子类型的中文显示
                pieceElement.dataset.type = getPieceChineseChar(piece.type, piece.player);
                
                cell.appendChild(pieceElement);
            }
            
            boardElement.appendChild(cell);
        }
    }
}

// 添加九宫格斜线
function addPalaceLines() {
    // 上方九宫
    addPalaceLine(0, 3, 2, 5);
    addPalaceLine(0, 5, 2, 3);
    
    // 下方九宫
    addPalaceLine(7, 3, 9, 5);
    addPalaceLine(7, 5, 9, 3);
}

// 添加单条九宫格斜线
function addPalaceLine(startRow, startCol, endRow, endCol) {
    const line = document.createElement('div');
    line.classList.add('palace-line');
    
    // 计算线的长度和角度
    const deltaX = endCol - startCol;
    const deltaY = endRow - startRow;
    const length = Math.sqrt(Math.pow(deltaX * (100 / BOARD_WIDTH), 2) + Math.pow(deltaY * (100 / BOARD_HEIGHT), 2));
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    
    // 设置线的位置和样式
    line.style.width = `${length}%`;
    line.style.height = '1px';
    line.style.left = `${startCol * (100 / BOARD_WIDTH) + (100 / BOARD_WIDTH) / 2}%`;
    line.style.top = `${startRow * (100 / BOARD_HEIGHT) + (100 / BOARD_HEIGHT) / 2}%`;
    line.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    
    boardElement.appendChild(line);
}

// 获取棋子的中文字符
function getPieceChineseChar(type, player) {
    const isRed = player === PLAYER_RED;
    
    switch (type) {
        case PIECE_TYPES.GENERAL:
            return isRed ? '帅' : '将';
        case PIECE_TYPES.ADVISOR:
            return isRed ? '仕' : '士';
        case PIECE_TYPES.ELEPHANT:
            return isRed ? '相' : '象';
        case PIECE_TYPES.HORSE:
            return isRed ? '马' : '馬';
        case PIECE_TYPES.CHARIOT:
            return isRed ? '车' : '車';
        case PIECE_TYPES.CANNON:
            return isRed ? '炮' : '砲';
        case PIECE_TYPES.PAWN:
            return isRed ? '兵' : '卒';
        default:
            return '';
    }
}

// 更新回合指示器
function updateTurnIndicator() {
    // 更新指示器的颜色
    turnMarker.className = 'player-marker';
    turnMarker.classList.add(currentPlayer === PLAYER_RED ? 'red' : 'black');
    
    // 更新文本
    turnText.textContent = currentPlayer === PLAYER_RED ? '红方回合' : '黑方回合';
}

// 处理格子点击事件
function handleCellClick(row, col) {
    if (!gameActive) return;
    
    // 如果是人机模式且当前是AI回合，则忽略点击
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK) return;
    
    const piece = gameBoard[row][col];
    
    // 如果点击了自己的棋子
    if (piece && piece.player === currentPlayer) {
        selectPiece(row, col);
        return;
    }
    
    // 如果已选择了一个棋子，尝试移动
    if (selectedPiece) {
        // 检查是否是合法移动
        const isLegal = legalMoves.some(move => move.row === row && move.col === col);
        if (isLegal) {
            movePiece(selectedPiece, { row, col });
        } else {
            // 不是合法移动，重置选择
            selectedPiece = null;
            legalMoves = [];
            renderBoard();
        }
    }
}

// 选择棋子
function selectPiece(row, col) {
    const piece = gameBoard[row][col];
    
    if (!piece || piece.player !== currentPlayer) return;
    
    selectedPiece = { row, col, piece };
    
    // 计算合法移动
    legalMoves = calculateLegalMoves(row, col, piece);
    
    // 更新UI
    renderBoard();
}

// 移动棋子
function movePiece(from, to) {
    const piece = gameBoard[from.row][from.col];
    const capturedPiece = gameBoard[to.row][to.col];
    
    // 记录移动历史，用于悔棋
    moveHistory.push({
        from: { row: from.row, col: from.col },
        to: { row: to.row, col: to.col },
        piece: piece,
        captured: capturedPiece
    });
    
    // 更新棋盘
    gameBoard[to.row][to.col] = piece;
    gameBoard[from.row][from.col] = null;
    
    // 重置选择状态
    selectedPiece = null;
    legalMoves = [];
    
    // 检查游戏是否结束
    if (capturedPiece && capturedPiece.type === PIECE_TYPES.GENERAL) {
        endGame(currentPlayer);
        return;
    }
    
    // 切换玩家
    switchPlayer();
    
    // 更新UI
    renderBoard();
    updateTurnIndicator();
    
    // 如果是人机模式且当前是AI回合，则让AI移动
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK) {
        setTimeout(makeAIMove, 500);
    }
}

// 切换玩家
function switchPlayer() {
    currentPlayer = currentPlayer === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED;
}

// 悔棋
function undoMove() {
    if (moveHistory.length === 0) return;
    
    // 如果是人机模式，需要撤销两步（玩家和AI各一步）
    if (gameMode === 'pvc') {
        // 先撤销AI的移动
        if (currentPlayer === PLAYER_RED && moveHistory.length >= 1) {
            const move = moveHistory.pop();
            gameBoard[move.from.row][move.from.col] = move.piece;
            gameBoard[move.to.row][move.to.col] = move.captured;
        }
        
        // 再撤销玩家的移动
        if (moveHistory.length >= 1) {
            const move = moveHistory.pop();
            gameBoard[move.from.row][move.from.col] = move.piece;
            gameBoard[move.to.row][move.to.col] = move.captured;
            
            // 确保回到玩家回合
            currentPlayer = PLAYER_RED;
        }
    } else {
        // 双人模式，只撤销一步
        const move = moveHistory.pop();
        gameBoard[move.from.row][move.from.col] = move.piece;
        gameBoard[move.to.row][move.to.col] = move.captured;
        
        // 切换回上一个玩家
        switchPlayer();
    }
    
    // 重置选择状态
    selectedPiece = null;
    legalMoves = [];
    
    // 如果游戏已经结束，重新激活
    gameActive = true;
    
    // 更新UI
    renderBoard();
    updateTurnIndicator();
}

// 结束游戏
function endGame(winner) {
    gameActive = false;
    
    // 更新分数
    if (winner === PLAYER_RED) {
        scores.red++;
    } else {
        scores.black++;
    }
    
    updateScoreDisplay();
    saveScores();
    
    // 显示获胜信息
    alert(winner === PLAYER_RED ? '红方获胜！' : '黑方获胜！');
}

// 计算合法移动
function calculateLegalMoves(row, col, piece) {
    const moves = [];
    
    switch (piece.type) {
        case PIECE_TYPES.GENERAL:
            addGeneralMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.ADVISOR:
            addAdvisorMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.ELEPHANT:
            addElephantMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.HORSE:
            addHorseMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.CHARIOT:
            addChariotMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.CANNON:
            addCannonMoves(row, col, piece.player, moves);
            break;
        case PIECE_TYPES.PAWN:
            addPawnMoves(row, col, piece.player, moves);
            break;
    }
    
    return moves;
}

// 添加将/帅的合法移动
function addGeneralMoves(row, col, player, moves) {
    // 将/帅只能在九宫格内移动
    const isRed = player === PLAYER_RED;
    const minRow = isRed ? 7 : 0;
    const maxRow = isRed ? 9 : 2;
    const minCol = 3;
    const maxCol = 5;
    
    // 上下左右各一格
    const directions = [
        { dr: -1, dc: 0 }, // 上
        { dr: 1, dc: 0 },  // 下
        { dr: 0, dc: -1 }, // 左
        { dr: 0, dc: 1 }   // 右
    ];
    
    for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        // 检查是否在九宫格内
        if (newRow >= minRow && newRow <= maxRow && newCol >= minCol && newCol <= maxCol) {
            // 检查目标位置是否为空或有敌方棋子
            const targetPiece = gameBoard[newRow][newCol];
            if (!targetPiece || targetPiece.player !== player) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
    
    // 特殊规则：将帅对面
    checkGeneralFacing(row, col, player, moves);
}

// 检查将帅是否面对面（特殊规则）
function checkGeneralFacing(row, col, player, moves) {
    const enemyPlayer = player === PLAYER_RED ? PLAYER_BLACK : PLAYER_RED;
    
    // 向对方将/帅的方向检查
    let dir = player === PLAYER_RED ? -1 : 1;
    let checkRow = row + dir;
    let foundPiece = false;
    
    while (checkRow >= 0 && checkRow < BOARD_HEIGHT) {
        const piece = gameBoard[checkRow][col];
        if (piece) {
            foundPiece = true;
            // 如果找到的是敌方将/帅，可以直接吃掉
            if (piece.player === enemyPlayer && piece.type === PIECE_TYPES.GENERAL) {
                moves.push({ row: checkRow, col: col });
            }
            break;
        }
        checkRow += dir;
    }
}

// 添加士/仕的合法移动
function addAdvisorMoves(row, col, player, moves) {
    // 士/仕只能在九宫格内斜线移动
    const isRed = player === PLAYER_RED;
    const minRow = isRed ? 7 : 0;
    const maxRow = isRed ? 9 : 2;
    const minCol = 3;
    const maxCol = 5;
    
    // 四个斜方向
    const directions = [
        { dr: -1, dc: -1 }, // 左上
        { dr: -1, dc: 1 },  // 右上
        { dr: 1, dc: -1 },  // 左下
        { dr: 1, dc: 1 }    // 右下
    ];
    
    for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        // 检查是否在九宫格内
        if (newRow >= minRow && newRow <= maxRow && newCol >= minCol && newCol <= maxCol) {
            // 检查目标位置是否为空或有敌方棋子
            const targetPiece = gameBoard[newRow][newCol];
            if (!targetPiece || targetPiece.player !== player) {
                moves.push({ row: newRow, col: newCol });
            }
        }
    }
}

// 添加象/相的合法移动
function addElephantMoves(row, col, player, moves) {
    // 象/相只能在己方区域内移动，且不能过河
    const isRed = player === PLAYER_RED;
    const minRow = isRed ? 5 : 0;
    const maxRow = isRed ? 9 : 4;
    
    // 四个斜方向（田字形）
    const directions = [
        { dr: -2, dc: -2 }, // 左上
        { dr: -2, dc: 2 },  // 右上
        { dr: 2, dc: -2 },  // 左下
        { dr: 2, dc: 2 }    // 右下
    ];
    
    for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        // 检查是否在合法区域内
        if (newRow >= minRow && newRow <= maxRow && newCol >= 0 && newCol < BOARD_WIDTH) {
            // 检查象眼是否有棋子阻挡
            const eyeRow = row + dir.dr / 2;
            const eyeCol = col + dir.dc / 2;
            
            if (!gameBoard[eyeRow][eyeCol]) {
                // 象眼无阻挡，检查目标位置
                const targetPiece = gameBoard[newRow][newCol];
                if (!targetPiece || targetPiece.player !== player) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
}

// 添加马的合法移动
function addHorseMoves(row, col, player, moves) {
    // 马走日
    const directions = [
        { dr: -2, dc: -1 }, // 上左
        { dr: -2, dc: 1 },  // 上右
        { dr: -1, dc: -2 }, // 左上
        { dr: -1, dc: 2 },  // 右上
        { dr: 1, dc: -2 },  // 左下
        { dr: 1, dc: 2 },   // 右下
        { dr: 2, dc: -1 },  // 下左
        { dr: 2, dc: 1 }    // 下右
    ];
    
    for (const dir of directions) {
        const newRow = row + dir.dr;
        const newCol = col + dir.dc;
        
        // 检查是否在棋盘内
        if (newRow >= 0 && newRow < BOARD_HEIGHT && newCol >= 0 && newCol < BOARD_WIDTH) {
            // 检查蹩马腿
            const legRow = row + (dir.dr === 2 || dir.dr === -2 ? dir.dr / 2 : 0);
            const legCol = col + (dir.dc === 2 || dir.dc === -2 ? dir.dc / 2 : 0);
            
            if (!gameBoard[legRow][legCol]) {
                // 没有蹩马腿，检查目标位置
                const targetPiece = gameBoard[newRow][newCol];
                if (!targetPiece || targetPiece.player !== player) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
    }
}

// 添加车的合法移动
function addChariotMoves(row, col, player, moves) {
    // 车可以沿直线移动任意距离，不能越过棋子
    // 上方向
    for (let r = row - 1; r >= 0; r--) {
        if (addMoveIfValid(r, col, player, moves)) break;
    }
    
    // 下方向
    for (let r = row + 1; r < BOARD_HEIGHT; r++) {
        if (addMoveIfValid(r, col, player, moves)) break;
    }
    
    // 左方向
    for (let c = col - 1; c >= 0; c--) {
        if (addMoveIfValid(row, c, player, moves)) break;
    }
    
    // 右方向
    for (let c = col + 1; c < BOARD_WIDTH; c++) {
        if (addMoveIfValid(row, c, player, moves)) break;
    }
}

// 添加炮的合法移动
function addCannonMoves(row, col, player, moves) {
    // 炮移动时与车相同，但吃子时需要翻山（中间必须有一个棋子）
    
    // 上方向
    let obstacleFound = false;
    for (let r = row - 1; r >= 0; r--) {
        if (!obstacleFound) {
            // 移动模式
            if (gameBoard[r][col]) {
                obstacleFound = true;
                continue;
            } else {
                moves.push({ row: r, col: col });
            }
        } else {
            // 吃子模式
            if (gameBoard[r][col]) {
                if (gameBoard[r][col].player !== player) {
                    moves.push({ row: r, col: col });
                }
                break;
            }
        }
    }
    
    // 下方向
    obstacleFound = false;
    for (let r = row + 1; r < BOARD_HEIGHT; r++) {
        if (!obstacleFound) {
            // 移动模式
            if (gameBoard[r][col]) {
                obstacleFound = true;
                continue;
            } else {
                moves.push({ row: r, col: col });
            }
        } else {
            // 吃子模式
            if (gameBoard[r][col]) {
                if (gameBoard[r][col].player !== player) {
                    moves.push({ row: r, col: col });
                }
                break;
            }
        }
    }
    
    // 左方向
    obstacleFound = false;
    for (let c = col - 1; c >= 0; c--) {
        if (!obstacleFound) {
            // 移动模式
            if (gameBoard[row][c]) {
                obstacleFound = true;
                continue;
            } else {
                moves.push({ row: row, col: c });
            }
        } else {
            // 吃子模式
            if (gameBoard[row][c]) {
                if (gameBoard[row][c].player !== player) {
                    moves.push({ row: row, col: c });
                }
                break;
            }
        }
    }
    
    // 右方向
    obstacleFound = false;
    for (let c = col + 1; c < BOARD_WIDTH; c++) {
        if (!obstacleFound) {
            // 移动模式
            if (gameBoard[row][c]) {
                obstacleFound = true;
                continue;
            } else {
                moves.push({ row: row, col: c });
            }
        } else {
            // 吃子模式
            if (gameBoard[row][c]) {
                if (gameBoard[row][c].player !== player) {
                    moves.push({ row: row, col: c });
                }
                break;
            }
        }
    }
}

// 添加兵/卒的合法移动
function addPawnMoves(row, col, player, moves) {
    const isRed = player === PLAYER_RED;
    
    // 兵/卒只能向前移动，过河后可以左右移动
    
    // 前进方向
    const forwardRow = row + (isRed ? -1 : 1);
    if (forwardRow >= 0 && forwardRow < BOARD_HEIGHT) {
        addMoveIfValid(forwardRow, col, player, moves);
    }
    
    // 检查是否过河
    const crossedRiver = isRed ? row <= 4 : row >= 5;
    
    if (crossedRiver) {
        // 左右移动
        if (col - 1 >= 0) {
            addMoveIfValid(row, col - 1, player, moves);
        }
        if (col + 1 < BOARD_WIDTH) {
            addMoveIfValid(row, col + 1, player, moves);
        }
    }
}

// 辅助函数：添加移动，如果位置有棋子则返回true（用于停止直线移动）
function addMoveIfValid(row, col, player, moves) {
    const targetPiece = gameBoard[row][col];
    
    if (!targetPiece) {
        // 空位置，可以移动
        moves.push({ row, col });
        return false;
    } else if (targetPiece.player !== player) {
        // 敌方棋子，可以吃
        moves.push({ row, col });
        return true;
    } else {
        // 自己的棋子，不能移动
        return true;
    }
}

// AI移动函数 - 主入口点
function makeAIMove() {
    if (!gameActive) return;
    
    let move;
    
    // 根据难度选择不同的AI策略
    switch (currentDifficulty) {
        case 'easy':
            move = makeRandomMove();
            break;
        case 'medium':
            move = makeMediumMove();
            break;
        case 'hard':
            move = makeHardMove();
            break;
        case 'expert':
            move = makeExpertMove();
            break;
        case 'master':
            move = makeMasterMove();
            break;
        case 'grandmaster':
            move = makeGrandmasterMove();
            break;
        default:
            move = makeRandomMove();
    }
    
    // 执行移动
    if (move) {
        movePiece(move.from, move.to);
    }
}

// 新手级别：随机移动
function makeRandomMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 随机选择一个移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 收集指定玩家的所有合法移动
function getAllLegalMoves(player) {
    const moves = [];
    
    // 遍历棋盘，找出所有属于该玩家的棋子
    for (let row = 0; row < BOARD_HEIGHT; row++) {
        for (let col = 0; col < BOARD_WIDTH; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.player === player) {
                // 获取该棋子的所有合法移动
                const pieceMoves = calculateLegalMoves(row, col, piece);
                
                // 将这些移动添加到结果中，同时添加起始位置信息
                pieceMoves.forEach(move => {
                    // 检查目标位置是否有棋子（吃子）
                    const capture = gameBoard[move.row][move.col];
                    moves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        piece: piece,
                        capture: capture
                    });
                });
            }
        }
    }
    
    return moves;
}

// 入门级别：优先吃子
function makeMediumMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 优先检查是否可以吃子
    const captureMoves = legalMoves.filter(move => move.capture);
    
    if (captureMoves.length > 0) {
        // 找出价值最高的吃子移动
        let bestCaptureMove = captureMoves[0];
        let highestValue = getPieceValue(captureMoves[0].capture);
        
        for (const move of captureMoves) {
            const captureValue = getPieceValue(move.capture);
            if (captureValue > highestValue) {
                highestValue = captureValue;
                bestCaptureMove = move;
            }
        }
        
        return bestCaptureMove;
    }
    
    // 如果没有吃子机会，随机选择一个合法移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 获取棋子的价值
function getPieceValue(piece) {
    switch (piece.type) {
        case PIECE_TYPES.PAWN: return 1;    // 兵/卒
        case PIECE_TYPES.CANNON: return 4;  // 炮
        case PIECE_TYPES.HORSE: return 4;   // 马
        case PIECE_TYPES.CHARIOT: return 9; // 车
        case PIECE_TYPES.ELEPHANT: return 2; // 象/相
        case PIECE_TYPES.ADVISOR: return 2;  // 士/仕
        case PIECE_TYPES.GENERAL: return 100; // 将/帅
        default: return 0;
    }
}

// 初级及以上级别简单实现（实际中这些函数需要更复杂的逻辑）
function makeHardMove() {
    return makeMediumMove(); // 简化实现
}

function makeExpertMove() {
    return makeMediumMove(); // 简化实现
}

function makeMasterMove() {
    return makeMediumMove(); // 简化实现
}

function makeGrandmasterMove() {
    return makeMediumMove(); // 简化实现
}

// 在页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init); 