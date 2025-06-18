// 将棋游戏主要逻辑

// 常量定义
const BOARD_SIZE = 9; // 棋盘大小 9x9
const PLAYER = 'player'; // 玩家
const AI = 'ai'; // 电脑AI

// 棋子类型
const PIECE_TYPES = {
    KING: 'K',     // 王将/玉将
    ROOK: 'R',     // 飞车
    BISHOP: 'B',   // 角行
    GOLD: 'G',     // 金将
    SILVER: 'S',   // 银将
    KNIGHT: 'N',   // 桂马
    LANCE: 'L',    // 香车
    PAWN: 'P'      // 步兵
};

// 棋子符号
const PIECE_SYMBOLS = {
    [PIECE_TYPES.KING]: '王',
    [PIECE_TYPES.ROOK]: '飞',
    [PIECE_TYPES.BISHOP]: '角',
    [PIECE_TYPES.GOLD]: '金',
    [PIECE_TYPES.SILVER]: '银',
    [PIECE_TYPES.KNIGHT]: '桂',
    [PIECE_TYPES.LANCE]: '香',
    [PIECE_TYPES.PAWN]: '步',
    // 升变后的棋子
    [`${PIECE_TYPES.ROOK}_promoted`]: '龙',
    [`${PIECE_TYPES.BISHOP}_promoted`]: '马',
    [`${PIECE_TYPES.SILVER}_promoted`]: '全',
    [`${PIECE_TYPES.KNIGHT}_promoted`]: '圭',
    [`${PIECE_TYPES.LANCE}_promoted`]: '杏',
    [`${PIECE_TYPES.PAWN}_promoted`]: 'と'
};

// 游戏状态
let gameBoard = []; // 棋盘
let selectedPiece = null; // 当前选中的棋子
let currentPlayer = PLAYER; // 当前玩家
let gameActive = false; // 游戏是否进行中
let lastMove = null; // 最后一步移动
let capturedPieces = {
    [PLAYER]: [],
    [AI]: []
};
let moveHistory = []; // 移动历史
let validMoves = []; // 有效移动位置
let pendingPromotion = null; // 待升变的棋子
let currentTurn = PLAYER; // 当前回合
let gameOver = false; // 游戏是否结束

// 初始化游戏
function initGame() {
    gameBoard = createEmptyBoard();
    setupInitialPosition();
    currentPlayer = PLAYER;
    gameActive = true;
    selectedPiece = null;
    lastMove = null;
    capturedPieces = {
        [PLAYER]: [],
        [AI]: []
    };
    moveHistory = [];
    validMoves = [];
    pendingPromotion = null;
    currentTurn = PLAYER;
    gameOver = false;
    
    updateBoardUI();
    updateTurnDisplay();
    updateGameStatus('游戏开始，玩家执先');
    
    // 启用按钮
    document.getElementById('undo-btn').disabled = false;
    document.getElementById('hint-btn').disabled = false;
    
    // 设置AI难度
    const difficulty = document.getElementById('difficulty').value;
    if (typeof setDifficulty === 'function') {
        setDifficulty(difficulty);
    }
}

// 创建空棋盘
function createEmptyBoard() {
    const board = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        board[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            board[row][col] = null;
        }
    }
    return board;
}

// 设置初始棋子位置
function setupInitialPosition() {
    // AI方（上方）棋子
    gameBoard[0][0] = createPiece(PIECE_TYPES.LANCE, AI);
    gameBoard[0][1] = createPiece(PIECE_TYPES.KNIGHT, AI);
    gameBoard[0][2] = createPiece(PIECE_TYPES.SILVER, AI);
    gameBoard[0][3] = createPiece(PIECE_TYPES.GOLD, AI);
    gameBoard[0][4] = createPiece(PIECE_TYPES.KING, AI);
    gameBoard[0][5] = createPiece(PIECE_TYPES.GOLD, AI);
    gameBoard[0][6] = createPiece(PIECE_TYPES.SILVER, AI);
    gameBoard[0][7] = createPiece(PIECE_TYPES.KNIGHT, AI);
    gameBoard[0][8] = createPiece(PIECE_TYPES.LANCE, AI);
    
    gameBoard[1][1] = createPiece(PIECE_TYPES.ROOK, AI);
    gameBoard[1][7] = createPiece(PIECE_TYPES.BISHOP, AI);
    
    for (let col = 0; col < BOARD_SIZE; col++) {
        gameBoard[2][col] = createPiece(PIECE_TYPES.PAWN, AI);
    }
    
    // 玩家方（下方）棋子
    gameBoard[8][0] = createPiece(PIECE_TYPES.LANCE, PLAYER);
    gameBoard[8][1] = createPiece(PIECE_TYPES.KNIGHT, PLAYER);
    gameBoard[8][2] = createPiece(PIECE_TYPES.SILVER, PLAYER);
    gameBoard[8][3] = createPiece(PIECE_TYPES.GOLD, PLAYER);
    gameBoard[8][4] = createPiece(PIECE_TYPES.KING, PLAYER);
    gameBoard[8][5] = createPiece(PIECE_TYPES.GOLD, PLAYER);
    gameBoard[8][6] = createPiece(PIECE_TYPES.SILVER, PLAYER);
    gameBoard[8][7] = createPiece(PIECE_TYPES.KNIGHT, PLAYER);
    gameBoard[8][8] = createPiece(PIECE_TYPES.LANCE, PLAYER);
    
    gameBoard[7][7] = createPiece(PIECE_TYPES.ROOK, PLAYER);
    gameBoard[7][1] = createPiece(PIECE_TYPES.BISHOP, PLAYER);
    
    for (let col = 0; col < BOARD_SIZE; col++) {
        gameBoard[6][col] = createPiece(PIECE_TYPES.PAWN, PLAYER);
    }
}

// 创建棋子对象
function createPiece(type, owner) {
    return {
        type,
        owner,
        promoted: false
    };
}

// 获取棋子符号
function getPieceNotation(piece) {
    if (piece.promoted) {
        return PIECE_SYMBOLS[`${piece.type}_promoted`];
    } else {
        return PIECE_SYMBOLS[piece.type];
    }
}

// 创建棋盘UI
function createBoardUI() {
    const boardElement = document.getElementById('shogi-board');
    boardElement.innerHTML = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = document.createElement('div');
            cell.className = 'shogi-cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            boardElement.appendChild(cell);
        }
    }
}

// 更新棋盘UI
function updateBoardUI() {
    const cells = document.querySelectorAll('.shogi-cell');
    
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        // 清除所有棋子和高亮
        cell.innerHTML = '';
        cell.classList.remove('selected', 'valid-move', 'last-move');
        
        // 标记最后一步移动
        if (lastMove && ((lastMove.toRow === row && lastMove.toCol === col) || 
                         (lastMove.fromRow === row && lastMove.fromCol === col))) {
            cell.classList.add('last-move');
        }
        
        // 标记选中的棋子
        if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
            cell.classList.add('selected');
        }
        
        // 标记有效移动位置
        if (validMoves.some(move => move.row === row && move.col === col)) {
            cell.classList.add('valid-move');
        }
        
        // 添加棋子
        const piece = gameBoard[row][col];
        if (piece) {
            const pieceElement = document.createElement('div');
            pieceElement.className = `shogi-piece ${piece.owner}`;
            if (piece.promoted) {
                pieceElement.classList.add('promoted');
            }
            
            const symbol = getPieceNotation(piece);
            
            pieceElement.innerHTML = `<span class="piece-notation">${symbol}</span>`;
            cell.appendChild(pieceElement);
        }
    });
    
    // 更新被吃掉的棋子显示
    updateCapturedPiecesUI();
}

// 更新被吃掉的棋子UI
function updateCapturedPiecesUI() {
    const playerCapturedElement = document.getElementById('player-captured');
    const aiCapturedElement = document.getElementById('ai-captured');
    
    playerCapturedElement.innerHTML = '';
    aiCapturedElement.innerHTML = '';
    
    // 按类型对已捕获的棋子进行分组
    const groupedPlayerCaptured = groupCapturedPieces(capturedPieces[PLAYER]);
    const groupedAICaptured = groupCapturedPieces(capturedPieces[AI]);
    
    // 渲染玩家捕获的棋子
    Object.entries(groupedPlayerCaptured).forEach(([type, pieces]) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'captured-piece player';
        pieceElement.dataset.type = type;
        
        const pieceText = document.createElement('span');
        pieceText.className = 'piece-notation';
        pieceText.textContent = getPieceNotation({ type, owner: PLAYER, promoted: false });
        pieceElement.appendChild(pieceText);
        
        if (pieces.length > 1) {
            const countElement = document.createElement('div');
            countElement.className = 'captured-count';
            countElement.textContent = pieces.length;
            pieceElement.appendChild(countElement);
        }
        
        // 添加点击事件，用于放置捕获的棋子
        pieceElement.addEventListener('click', () => handleCapturedPieceClick(type, PLAYER));
        
        playerCapturedElement.appendChild(pieceElement);
    });
    
    // 渲染AI捕获的棋子
    Object.entries(groupedAICaptured).forEach(([type, pieces]) => {
        const pieceElement = document.createElement('div');
        pieceElement.className = 'captured-piece ai';
        pieceElement.dataset.type = type;
        
        const pieceText = document.createElement('span');
        pieceText.className = 'piece-notation';
        pieceText.textContent = getPieceNotation({ type, owner: AI, promoted: false });
        pieceElement.appendChild(pieceText);
        
        if (pieces.length > 1) {
            const countElement = document.createElement('div');
            countElement.className = 'captured-count';
            countElement.textContent = pieces.length;
            pieceElement.appendChild(countElement);
        }
        
        aiCapturedElement.appendChild(pieceElement);
    });
}

// 对已捕获的棋子按类型分组
function groupCapturedPieces(pieces) {
    return pieces.reduce((groups, piece) => {
        if (!groups[piece.type]) {
            groups[piece.type] = [];
        }
        groups[piece.type].push(piece);
        return groups;
    }, {});
}

// 更新游戏状态显示
function updateGameStatus(status) {
    document.getElementById('game-status').textContent = status;
}

// 更新回合显示
function updateTurnDisplay() {
    const turnMarker = document.getElementById('turn-marker');
    const turnText = document.getElementById('turn-text');
    
    if (currentTurn === PLAYER) {
        turnMarker.style.backgroundColor = '#000000';
        turnText.textContent = '玩家回合';
    } else {
        turnMarker.style.backgroundColor = '#800000';
        turnText.textContent = '电脑回合';
    }
}

// 处理棋盘格子点击事件
function handleCellClick(row, col) {
    if (!gameActive || currentPlayer !== PLAYER) return;
    
    const clickedPiece = gameBoard[row][col];
    
    // 如果有待升变的棋子，不处理其他点击
    if (pendingPromotion) return;
    
    // 如果已经选择了棋子，尝试移动
    if (selectedPiece) {
        // 检查是否点击了同一个位置（取消选择）
        if (clickedPiece && clickedPiece.owner === PLAYER) {
            selectedPiece = null;
            validMoves = [];
            updateBoardUI();
            return;
        }
        
        // 检查是否是有效移动
        const isValidMove = validMoves.some(move => move.row === row && move.col === col);
        
        if (isValidMove) {
            // 执行移动
            const fromRow = selectedPiece.row;
            const fromCol = selectedPiece.col;
            const piece = selectedPiece.piece;
            
            // 检查是否可以升变
            if (canPromote(fromRow, fromCol, row, col, piece)) {
                // 如果必须升变（例如，桂马、香车、步兵到达对方阵地的最后两行）
                if (mustPromote(row, piece)) {
                    executeMoveWithPromotion(fromRow, fromCol, row, col, true);
                } else {
                    // 否则询问玩家是否要升变
                    pendingPromotion = {
                        fromRow,
                        fromCol,
                        toRow: row,
                        toCol: col
                    };
                    showPromotionDialog();
                    return;
                }
            } else {
                // 执行普通移动
                executeMove(fromRow, fromCol, row, col);
            }
            
            // 移动完成，清除选中状态
            selectedPiece = null;
            validMoves = [];
            
            // 更新UI
            updateBoardUI();
            
            // 检查游戏是否结束
            if (checkGameOver()) {
                gameActive = false;
                updateGameStatus('游戏结束，电脑获胜！');
                return;
            }
            
            // 切换玩家
            currentPlayer = AI;
            updateTurnDisplay();
            
            // AI回合
            setTimeout(makeAIMove, 500);
        } else {
            // 无效移动，清除选中状态
            selectedPiece = null;
            validMoves = [];
            updateBoardUI();
        }
    } else {
        // 如果没有选中棋子，选择一个己方棋子
        if (clickedPiece && clickedPiece.owner === PLAYER) {
            selectedPiece = { row, col, piece: clickedPiece };
            validMoves = getValidMoves(row, col, clickedPiece);
            updateBoardUI();
        }
    }
}

// 处理被吃掉的棋子点击事件
function handleCapturedPieceClick(type, owner) {
    if (!gameActive || currentPlayer !== owner) return;
    
    // 清除之前选中的棋子
    selectedPiece = {
        captured: true,
        type,
        piece: { type, owner, promoted: false }
    };
    
    // 获取可以放置的位置
    validMoves = getValidDropPositions(type, owner);
    updateBoardUI();
}

// 获取棋子可以放置的位置
function getValidDropPositions(type, owner) {
    const validPositions = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 只能放在空位置
            if (gameBoard[row][col] === null) {
                // 特殊规则：步兵不能在同一列有另一个未升变的己方步兵
                if (type === PIECE_TYPES.PAWN) {
                    let hasUnpromotedPawnInColumn = false;
                    
                    for (let r = 0; r < BOARD_SIZE; r++) {
                        const piece = gameBoard[r][col];
                        if (piece && 
                            piece.owner === owner && 
                            piece.type === PIECE_TYPES.PAWN && 
                            !piece.promoted) {
                            hasUnpromotedPawnInColumn = true;
                            break;
                        }
                    }
                    
                    if (hasUnpromotedPawnInColumn) {
                        continue;
                    }
                }
                
                // 特殊规则：不能直接将死对方（打步诘）
                if (type === PIECE_TYPES.PAWN) {
                    // 模拟放置
                    gameBoard[row][col] = createPiece(type, owner);
                    
                    // 检查是否直接将死
                    const isCheckmate = isInCheckmate(owner === PLAYER ? AI : PLAYER);
                    
                    // 恢复棋盘
                    gameBoard[row][col] = null;
                    
                    if (isCheckmate) {
                        continue;
                    }
                }
                
                // 特殊规则：桂马不能放在最后两行，因为无法移动
                if (type === PIECE_TYPES.KNIGHT) {
                    if ((owner === PLAYER && row < 2) || 
                        (owner === AI && row > 6)) {
                        continue;
                    }
                }
                
                // 特殊规则：香车不能放在最后一行，因为无法移动
                if (type === PIECE_TYPES.LANCE) {
                    if ((owner === PLAYER && row === 0) || 
                        (owner === AI && row === 8)) {
                        continue;
                    }
                }
                
                // 特殊规则：步兵不能放在最后一行，因为无法移动
                if (type === PIECE_TYPES.PAWN) {
                    if ((owner === PLAYER && row === 0) || 
                        (owner === AI && row === 8)) {
                        continue;
                    }
                }
                
                validPositions.push({ row, col });
            }
        }
    }
    
    return validPositions;
}

// 执行移动
function executeMove(fromRow, fromCol, toRow, toCol, promote = false) {
    const piece = gameBoard[fromRow][fromCol];
    const capturedPiece = gameBoard[toRow][toCol];
    
    // 记录移动历史
    moveHistory.push({
        fromRow,
        fromCol,
        toRow,
        toCol,
        piece: { ...piece },
        capturedPiece: capturedPiece ? { ...capturedPiece } : null,
        wasPromoted: promote
    });
    
    // 如果目标位置有棋子，记录被吃掉的棋子
    if (capturedPiece) {
        const captureType = capturedPiece.type;
        if (!capturedPieces[piece.owner].some(p => p.type === captureType)) {
            capturedPieces[piece.owner].push(captureType);
        }
    }
    
    // 移动棋子
    gameBoard[toRow][toCol] = piece;
    gameBoard[fromRow][fromCol] = null;
    
    // 如果需要升变
    if (promote) {
        piece.promoted = true;
    }
    
    // 记录最后一步移动
    lastMove = {
        fromRow,
        fromCol,
        toRow,
        toCol
    };
}

// 执行带升变的移动
function executeMoveWithPromotion(fromRow, fromCol, toRow, toCol, promote) {
    executeMove(fromRow, fromCol, toRow, toCol, promote);
    pendingPromotion = null;
    hidePromotionDialog();
}

// 处理升变选择
function handlePromotionChoice(promote) {
    if (pendingPromotion) {
        const { fromRow, fromCol, toRow, toCol } = pendingPromotion;
        executeMoveWithPromotion(fromRow, fromCol, toRow, toCol, promote);
        
        // 更新UI
        updateBoardUI();
        
        // 检查游戏是否结束
        if (checkGameOver()) {
            gameActive = false;
            updateGameStatus('游戏结束，电脑获胜！');
            return;
        }
        
        // 切换玩家
        currentPlayer = AI;
        updateTurnDisplay();
        
        // AI回合
        setTimeout(makeAIMove, 500);
    }
}

// 显示升变对话框
function showPromotionDialog() {
    const dialog = document.getElementById('promotion-dialog');
    dialog.classList.add('active');
}

// 隐藏升变对话框
function hidePromotionDialog() {
    const dialog = document.getElementById('promotion-dialog');
    dialog.classList.remove('active');
}

// 检查棋子是否可以升变
function canPromote(fromRow, fromCol, toRow, toCol, piece) {
    // 如果已经升变，不能再升变
    if (piece.promoted) return false;
    
    // 王将和金将不能升变
    if (piece.type === PIECE_TYPES.KING || piece.type === PIECE_TYPES.GOLD) return false;
    
    // 如果移动到对方阵地（前三行）或从对方阵地移动，可以升变
    if (piece.owner === PLAYER) {
        return fromRow <= 2 || toRow <= 2;
    } else {
        return fromRow >= 6 || toRow >= 6;
    }
}

// 检查棋子是否必须升变
function mustPromote(row, piece) {
    // 桂马在对方阵地的最后两行必须升变
    if (piece.type === PIECE_TYPES.KNIGHT) {
        if (piece.owner === PLAYER && row <= 1) return true;
        if (piece.owner === AI && row >= 7) return true;
    }
    
    // 香车和步兵在对方阵地的最后一行必须升变
    if (piece.type === PIECE_TYPES.LANCE || piece.type === PIECE_TYPES.PAWN) {
        if (piece.owner === PLAYER && row === 0) return true;
        if (piece.owner === AI && row === 8) return true;
    }
    
    return false;
}

// 初始化事件监听
function initEventListeners() {
    document.getElementById('new-game-btn').addEventListener('click', initGame);
    document.getElementById('undo-btn').addEventListener('click', undoMove);
    document.getElementById('hint-btn').addEventListener('click', showHint);
    document.getElementById('promote-yes').addEventListener('click', () => handlePromotionChoice(true));
    document.getElementById('promote-no').addEventListener('click', () => handlePromotionChoice(false));
}

// 撤销移动
function undoMove() {
    if (moveHistory.length === 0 || !gameActive) return;
    
    const lastMove = moveHistory.pop();
    const { fromRow, fromCol, toRow, toCol, piece, capturedPiece, wasPromoted } = lastMove;
    
    // 恢复棋子位置
    gameBoard[fromRow][fromCol] = { ...piece };
    if (wasPromoted) {
        gameBoard[fromRow][fromCol].promoted = false;
    }
    
    // 恢复被吃掉的棋子
    if (capturedPiece) {
        gameBoard[toRow][toCol] = { ...capturedPiece };
        
        // 更新被吃掉的棋子计数
        const owner = piece.owner;
        const captureType = capturedPiece.type;
        capturedPieces[owner].splice(capturedPieces[owner].indexOf(captureType), 1);
    } else {
        gameBoard[toRow][toCol] = null;
    }
    
    // 如果是AI的回合，需要撤销两步（玩家和AI的移动）
    if (currentPlayer === AI && moveHistory.length > 0) {
        undoMove();
    } else {
        // 更新当前玩家
        currentPlayer = PLAYER;
    }
    
    // 清除选中状态
    selectedPiece = null;
    validMoves = [];
    
    // 更新UI
    updateBoardUI();
    updateTurnDisplay();
    updateGameStatus('已撤销上一步');
}

// 显示提示
function showHint() {
    if (gameOver || currentTurn !== PLAYER) return;
    
    // 获取简单的推荐移动
    const possibleMoves = getAllPossibleMoves(PLAYER);
    if (possibleMoves.length === 0) return;
    
    // 随机选择一个可能的移动作为提示
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    
    // 清除之前的选择
    selectedPiece = null;
    validMoves = [];
    
    // 高亮显示推荐的移动
    if (randomMove.fromRow !== undefined) {
        // 选择棋子
        selectedPiece = { 
            row: randomMove.fromRow, 
            col: randomMove.fromCol, 
            piece: gameBoard[randomMove.fromRow][randomMove.fromCol] 
        };
        // 显示有效移动
        validMoves = [{ row: randomMove.toRow, col: randomMove.toCol }];
    }
    
    updateBoardUI();
    updateGameStatus('提示：这是一个可能的移动');
    
    // 5秒后清除提示
    setTimeout(() => {
        selectedPiece = null;
        validMoves = [];
        updateBoardUI();
        updateGameStatus('游戏进行中...');
    }, 5000);
}

// 获取棋子的有效移动位置
function getValidMoves(row, col, piece) {
    const moves = [];
    const owner = piece.owner;
    const type = piece.type;
    const promoted = piece.promoted;
    
    // 根据棋子类型和是否升变获取移动方向
    const directions = getPieceDirections(type, owner, promoted);
    
    // 对于每个方向，检查可移动的位置
    directions.forEach(dir => {
        const { dx, dy, range } = dir;
        
        for (let i = 1; i <= range; i++) {
            const newRow = row + dy * i;
            const newCol = col + dx * i;
            
            // 检查是否超出棋盘
            if (newRow < 0 || newRow >= BOARD_SIZE || newCol < 0 || newCol >= BOARD_SIZE) {
                break;
            }
            
            const targetPiece = gameBoard[newRow][newCol];
            
            // 如果目标位置是空的，可以移动
            if (targetPiece === null) {
                moves.push({ row: newRow, col: newCol });
            }
            // 如果目标位置是对方的棋子，可以吃掉
            else if (targetPiece.owner !== owner) {
                moves.push({ row: newRow, col: newCol });
                break; // 不能越过对方棋子
            }
            // 如果目标位置是己方棋子，不能移动
            else {
                break;
            }
        }
    });
    
    return moves;
}

// 获取棋子的移动方向
function getPieceDirections(type, owner, promoted) {
    const directions = [];
    
    // 移动方向定义：dx, dy, range（移动范围）
    // 注意：玩家在下方，AI在上方，所以玩家的向前是负方向，AI的向前是正方向
    const forward = owner === PLAYER ? -1 : 1;
    
    switch (type) {
        case PIECE_TYPES.KING:
            // 王将可以向八个方向移动一格
            directions.push({ dx: 0, dy: 1, range: 1 });
            directions.push({ dx: 1, dy: 1, range: 1 });
            directions.push({ dx: 1, dy: 0, range: 1 });
            directions.push({ dx: 1, dy: -1, range: 1 });
            directions.push({ dx: 0, dy: -1, range: 1 });
            directions.push({ dx: -1, dy: -1, range: 1 });
            directions.push({ dx: -1, dy: 0, range: 1 });
            directions.push({ dx: -1, dy: 1, range: 1 });
            break;
            
        case PIECE_TYPES.ROOK:
            if (promoted) {
                // 龙王（升变后的飞车）可以直线移动任意格数，并可以斜向移动一格
                directions.push({ dx: 0, dy: 1, range: BOARD_SIZE - 1 });
                directions.push({ dx: 1, dy: 0, range: BOARD_SIZE - 1 });
                directions.push({ dx: 0, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: 0, range: BOARD_SIZE - 1 });
                directions.push({ dx: 1, dy: 1, range: 1 });
                directions.push({ dx: 1, dy: -1, range: 1 });
                directions.push({ dx: -1, dy: -1, range: 1 });
                directions.push({ dx: -1, dy: 1, range: 1 });
            } else {
                // 飞车可以直线移动任意格数
                directions.push({ dx: 0, dy: 1, range: BOARD_SIZE - 1 });
                directions.push({ dx: 1, dy: 0, range: BOARD_SIZE - 1 });
                directions.push({ dx: 0, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: 0, range: BOARD_SIZE - 1 });
            }
            break;
            
        case PIECE_TYPES.BISHOP:
            if (promoted) {
                // 龙马（升变后的角行）可以斜向移动任意格数，并可以直线移动一格
                directions.push({ dx: 1, dy: 1, range: BOARD_SIZE - 1 });
                directions.push({ dx: 1, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: 1, range: BOARD_SIZE - 1 });
                directions.push({ dx: 0, dy: 1, range: 1 });
                directions.push({ dx: 1, dy: 0, range: 1 });
                directions.push({ dx: 0, dy: -1, range: 1 });
                directions.push({ dx: -1, dy: 0, range: 1 });
            } else {
                // 角行可以斜向移动任意格数
                directions.push({ dx: 1, dy: 1, range: BOARD_SIZE - 1 });
                directions.push({ dx: 1, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: -1, range: BOARD_SIZE - 1 });
                directions.push({ dx: -1, dy: 1, range: BOARD_SIZE - 1 });
            }
            break;
            
        case PIECE_TYPES.GOLD:
            // 金将可以向前、左、右、后和斜前方移动一格
            directions.push({ dx: 0, dy: forward, range: 1 });
            directions.push({ dx: 1, dy: forward, range: 1 });
            directions.push({ dx: -1, dy: forward, range: 1 });
            directions.push({ dx: 1, dy: 0, range: 1 });
            directions.push({ dx: -1, dy: 0, range: 1 });
            directions.push({ dx: 0, dy: -forward, range: 1 });
            break;
            
        case PIECE_TYPES.SILVER:
            if (promoted) {
                // 升变后的银将移动方式与金将相同
                directions.push({ dx: 0, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: forward, range: 1 });
                directions.push({ dx: -1, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: 0, range: 1 });
                directions.push({ dx: -1, dy: 0, range: 1 });
                directions.push({ dx: 0, dy: -forward, range: 1 });
            } else {
                // 银将可以向前和四个斜向移动一格
                directions.push({ dx: 0, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: forward, range: 1 });
                directions.push({ dx: -1, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: -forward, range: 1 });
                directions.push({ dx: -1, dy: -forward, range: 1 });
            }
            break;
            
        case PIECE_TYPES.KNIGHT:
            if (promoted) {
                // 升变后的桂马移动方式与金将相同
                directions.push({ dx: 0, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: forward, range: 1 });
                directions.push({ dx: -1, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: 0, range: 1 });
                directions.push({ dx: -1, dy: 0, range: 1 });
                directions.push({ dx: 0, dy: -forward, range: 1 });
            } else {
                // 桂马只能向前跳跃式移动（类似于国际象棋中的马，但只能向前）
                directions.push({ dx: 1, dy: 2 * forward, range: 1 });
                directions.push({ dx: -1, dy: 2 * forward, range: 1 });
            }
            break;
            
        case PIECE_TYPES.LANCE:
            if (promoted) {
                // 升变后的香车移动方式与金将相同
                directions.push({ dx: 0, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: forward, range: 1 });
                directions.push({ dx: -1, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: 0, range: 1 });
                directions.push({ dx: -1, dy: 0, range: 1 });
                directions.push({ dx: 0, dy: -forward, range: 1 });
            } else {
                // 香车只能向前移动任意格数
                directions.push({ dx: 0, dy: forward, range: BOARD_SIZE - 1 });
            }
            break;
            
        case PIECE_TYPES.PAWN:
            if (promoted) {
                // 升变后的步兵移动方式与金将相同
                directions.push({ dx: 0, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: forward, range: 1 });
                directions.push({ dx: -1, dy: forward, range: 1 });
                directions.push({ dx: 1, dy: 0, range: 1 });
                directions.push({ dx: -1, dy: 0, range: 1 });
                directions.push({ dx: 0, dy: -forward, range: 1 });
            } else {
                // 步兵只能向前移动一格
                directions.push({ dx: 0, dy: forward, range: 1 });
            }
            break;
    }
    
    return directions;
}

// 检查游戏是否结束
function checkGameOver() {
    // 检查是否有一方的王将被吃掉
    let playerKingExists = false;
    let aiKingExists = false;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.type === PIECE_TYPES.KING) {
                if (piece.owner === PLAYER) {
                    playerKingExists = true;
                } else {
                    aiKingExists = true;
                }
            }
        }
    }
    
    return !playerKingExists || !aiKingExists;
}

// 检查是否将军
function isInCheck(player) {
    // 找到玩家的王将位置
    let kingRow = -1;
    let kingCol = -1;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.type === PIECE_TYPES.KING && piece.owner === player) {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
        if (kingRow !== -1) break;
    }
    
    // 检查对方的每个棋子是否可以吃掉王将
    const opponent = player === PLAYER ? AI : PLAYER;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.owner === opponent) {
                const moves = getValidMoves(row, col, piece);
                if (moves.some(move => move.row === kingRow && move.col === kingCol)) {
                    return true;
                }
            }
        }
    }
    
    return false;
}

// 检查是否将死
function isInCheckmate(player) {
    // 如果没有被将军，就不是将死
    if (!isInCheck(player)) {
        return false;
    }
    
    // 检查是否有任何合法移动可以解除将军
    const allMoves = getAllPossibleMoves(player);
    
    return allMoves.length === 0;
}

// 获取所有可能的移动
function getAllPossibleMoves(player) {
    const allMoves = [];
    
    // 检查棋盘上的每个棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.owner === player) {
                const moves = getValidMoves(row, col, piece);
                
                moves.forEach(move => {
                    // 模拟移动，检查是否解除将军
                    const originalPiece = gameBoard[move.row][move.col];
                    gameBoard[move.row][move.col] = piece;
                    gameBoard[row][col] = null;
                    
                    // 如果移动后不再被将军，则是有效的移动
                    if (!isInCheck(player)) {
                        allMoves.push({
                            fromRow: row,
                            fromCol: col,
                            toRow: move.row,
                            toCol: move.col
                        });
                    }
                    
                    // 恢复棋盘
                    gameBoard[row][col] = piece;
                    gameBoard[move.row][move.col] = originalPiece;
                });
            }
        }
    }
    
    // 检查被吃掉的棋子是否可以放置
    Object.entries(capturedPieces[player]).forEach(([type, count]) => {
        if (count > 0) {
            const validPositions = getValidDropPositions(type, player);
            
            validPositions.forEach(pos => {
                // 模拟放置，检查是否解除将军
                const piece = createPiece(type, player);
                gameBoard[pos.row][pos.col] = piece;
                
                // 如果放置后不再被将军，则是有效的移动
                if (!isInCheck(player)) {
                    allMoves.push({
                        isCaptured: true,
                        type,
                        toRow: pos.row,
                        toCol: pos.col
                    });
                }
                
                // 恢复棋盘
                gameBoard[pos.row][pos.col] = null;
            });
        }
    });
    
    return allMoves;
}

// AI移动
function makeAIMove() {
    if (!gameActive || currentPlayer !== AI) return;
    
    // 简单AI实现：随机选择一个有效移动
    // 在实际项目中，这里应该使用更复杂的AI算法
    const allMoves = getAllPossibleMoves(AI);
    
    if (allMoves.length > 0) {
        const move = allMoves[Math.floor(Math.random() * allMoves.length)];
        
        if (move.isCaptured) {
            // 放置被吃掉的棋子
            const piece = createPiece(move.type, AI);
            gameBoard[move.toRow][move.toCol] = piece;
            
            // 更新被吃掉的棋子计数
            capturedPieces[AI].splice(capturedPieces[AI].indexOf(move.type), 1);
            
            // 记录移动历史
            moveHistory.push({
                isCaptured: true,
                type: move.type,
                toRow: move.toRow,
                toCol: move.toCol,
                piece: { ...piece }
            });
        } else {
            // 移动棋子
            const fromRow = move.fromRow;
            const fromCol = move.fromCol;
            const toRow = move.toRow;
            const toCol = move.toCol;
            const piece = gameBoard[fromRow][fromCol];
            
            // 检查是否可以升变
            let shouldPromote = false;
            if (canPromote(fromRow, fromCol, toRow, toCol, piece)) {
                // AI总是选择升变，如果可以的话
                shouldPromote = true;
            }
            
            executeMove(fromRow, fromCol, toRow, toCol, shouldPromote);
        }
        
        // 检查游戏是否结束
        if (checkGameOver()) {
            gameActive = false;
            updateGameStatus('游戏结束，电脑获胜！');
            return;
        }
        
        // 切换玩家
        currentPlayer = PLAYER;
        updateGameStatus();
        updateBoardUI();
    } else {
        // 如果AI没有有效移动，玩家获胜
        gameActive = false;
        updateGameStatus();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    createBoardUI();
    initEventListeners();
    initGame();
});

// 设置AI难度
function setDifficulty(level) {
    // 在实际项目中，可以根据难度级别调整AI的行为
    // 例如，更高的难度可以让AI考虑更多步骤，或使用更复杂的评估函数
    console.log(`将棋AI难度设置为: ${level}`);
    
    // 这里可以根据难度调整AI的行为
    // 例如：
    // - 简单：随机移动
    // - 中等：考虑简单的战术
    // - 困难：使用更深层次的搜索和更复杂的评估
} 