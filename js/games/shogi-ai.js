// 将棋AI逻辑

// 难度级别常量
const DIFFICULTY = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard',
    EXPERT: 'expert'
};

// 棋子价值
const PIECE_VALUES = {
    [PIECE_TYPES.KING]: 10000,
    [PIECE_TYPES.ROOK]: 450,
    [PIECE_TYPES.BISHOP]: 350,
    [PIECE_TYPES.GOLD]: 250,
    [PIECE_TYPES.SILVER]: 200,
    [PIECE_TYPES.KNIGHT]: 150,
    [PIECE_TYPES.LANCE]: 150,
    [PIECE_TYPES.PAWN]: 100,
    // 升变后的棋子价值更高
    [`${PIECE_TYPES.ROOK}_promoted`]: 550,
    [`${PIECE_TYPES.BISHOP}_promoted`]: 450,
    [`${PIECE_TYPES.SILVER}_promoted`]: 300,
    [`${PIECE_TYPES.KNIGHT}_promoted`]: 250,
    [`${PIECE_TYPES.LANCE}_promoted`]: 250,
    [`${PIECE_TYPES.PAWN}_promoted`]: 200
};

// 当前难度
let currentDifficulty = DIFFICULTY.MEDIUM;

// 初始化AI
function initShogiAI() {
    // 监听难度选择变化
    const difficultySelect = document.getElementById('difficulty');
    if (difficultySelect) {
        difficultySelect.addEventListener('change', (e) => {
            currentDifficulty = e.target.value;
            console.log(`难度已设置为: ${currentDifficulty}`);
        });
        
        // 设置初始难度
        currentDifficulty = difficultySelect.value;
    }
}

// 根据难度选择AI移动策略
function makeAIMove() {
    if (!gameActive || currentPlayer !== AI) return;
    
    let move;
    
    // 根据难度选择不同的策略
    switch (currentDifficulty) {
        case DIFFICULTY.EASY:
            move = getRandomMove();
            break;
        case DIFFICULTY.MEDIUM:
            move = getMediumMove();
            break;
        case DIFFICULTY.HARD:
            move = getHardMove();
            break;
        case DIFFICULTY.EXPERT:
            move = getExpertMove();
            break;
        default:
            move = getMediumMove();
    }
    
    if (move) {
        executeAIMove(move);
    } else {
        // 如果AI没有有效移动，玩家获胜
        gameActive = false;
        updateGameStatus();
    }
}

// 执行AI移动
function executeAIMove(move) {
    if (move.isCaptured) {
        // 放置被吃掉的棋子
        const piece = createPiece(move.type, AI);
        gameBoard[move.toRow][move.toCol] = piece;
        
        // 更新被吃掉的棋子计数
        capturedPieces[AI][move.type]--;
        
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
            // 如果必须升变或者升变更有利，则升变
            if (mustPromote(toRow, piece) || shouldAIPromote(piece)) {
                shouldPromote = true;
            }
        }
        
        executeMove(fromRow, fromCol, toRow, toCol, shouldPromote);
    }
    
    // 检查游戏是否结束
    if (checkGameOver()) {
        gameActive = false;
        updateGameStatus();
        return;
    }
    
    // 切换玩家
    currentPlayer = PLAYER;
    updateGameStatus();
    updateBoardUI();
}

// 简单难度：随机移动
function getRandomMove() {
    const allMoves = getAllPossibleMoves(AI);
    
    if (allMoves.length > 0) {
        return allMoves[Math.floor(Math.random() * allMoves.length)];
    }
    
    return null;
}

// 中等难度：有一定策略的移动
function getMediumMove() {
    // 检查是否可以将军
    const checkMove = findCheckMove();
    if (checkMove) return checkMove;
    
    // 检查是否可以吃子
    const captureMove = findBestCaptureMove();
    if (captureMove) return captureMove;
    
    // 如果没有特殊移动，随机选择一个移动，但给予进攻性移动更高权重
    return getWeightedRandomMove();
}

// 困难难度：使用简单的评估函数
function getHardMove() {
    const allMoves = getAllPossibleMoves(AI);
    
    if (allMoves.length === 0) return null;
    
    // 对每个移动进行评估，选择最佳移动
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of allMoves) {
        // 模拟移动
        const boardCopy = copyBoard(gameBoard);
        simulateMove(move);
        
        // 评估局面
        const score = evaluateBoard();
        
        // 恢复棋盘
        gameBoard = boardCopy;
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// 专家难度：使用极小化极大算法
function getExpertMove() {
    const allMoves = getAllPossibleMoves(AI);
    
    if (allMoves.length === 0) return null;
    
    // 使用极小化极大算法评估移动
    let bestMove = null;
    let bestScore = -Infinity;
    
    for (const move of allMoves) {
        // 模拟移动
        const boardCopy = copyBoard(gameBoard);
        const capturedCopy = JSON.parse(JSON.stringify(capturedPieces));
        
        simulateMove(move);
        
        // 使用极小化极大算法评估
        const score = minimax(2, false, -Infinity, Infinity);
        
        // 恢复棋盘和被吃掉的棋子
        gameBoard = boardCopy;
        capturedPieces = capturedCopy;
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// 极小化极大算法
function minimax(depth, isMaximizing, alpha, beta) {
    // 如果达到最大深度或游戏结束，评估局面
    if (depth === 0 || checkGameOver()) {
        return evaluateBoard();
    }
    
    if (isMaximizing) {
        // AI的回合，寻找最大评分
        let maxEval = -Infinity;
        const allMoves = getAllPossibleMoves(AI);
        
        for (const move of allMoves) {
            // 模拟移动
            const boardCopy = copyBoard(gameBoard);
            const capturedCopy = JSON.parse(JSON.stringify(capturedPieces));
            
            simulateMove(move);
            
            // 递归评估
            const eval = minimax(depth - 1, false, alpha, beta);
            
            // 恢复棋盘和被吃掉的棋子
            gameBoard = boardCopy;
            capturedPieces = capturedCopy;
            
            // 更新最大评分
            maxEval = Math.max(maxEval, eval);
            
            // Alpha-Beta剪枝
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        
        return maxEval;
    } else {
        // 玩家的回合，寻找最小评分
        let minEval = Infinity;
        const allMoves = getAllPossibleMoves(PLAYER);
        
        for (const move of allMoves) {
            // 模拟移动
            const boardCopy = copyBoard(gameBoard);
            const capturedCopy = JSON.parse(JSON.stringify(capturedPieces));
            
            simulateMove(move);
            
            // 递归评估
            const eval = minimax(depth - 1, true, alpha, beta);
            
            // 恢复棋盘和被吃掉的棋子
            gameBoard = boardCopy;
            capturedPieces = capturedCopy;
            
            // 更新最小评分
            minEval = Math.min(minEval, eval);
            
            // Alpha-Beta剪枝
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        
        return minEval;
    }
}

// 模拟移动
function simulateMove(move) {
    if (move.isCaptured) {
        // 放置被吃掉的棋子
        const piece = createPiece(move.type, AI);
        gameBoard[move.toRow][move.toCol] = piece;
        
        // 更新被吃掉的棋子计数
        capturedPieces[AI][move.type]--;
    } else {
        // 移动棋子
        const fromRow = move.fromRow;
        const fromCol = move.fromCol;
        const toRow = move.toRow;
        const toCol = move.toCol;
        const piece = gameBoard[fromRow][fromCol];
        
        // 如果目标位置有棋子，记录被吃掉的棋子
        const capturedPiece = gameBoard[toRow][toCol];
        if (capturedPiece) {
            const captureType = capturedPiece.type;
            if (!capturedPieces[piece.owner][captureType]) {
                capturedPieces[piece.owner][captureType] = 0;
            }
            capturedPieces[piece.owner][captureType]++;
        }
        
        // 移动棋子
        gameBoard[toRow][toCol] = piece;
        gameBoard[fromRow][fromCol] = null;
        
        // 如果可以升变且应该升变，则升变
        if (canPromote(fromRow, fromCol, toRow, toCol, piece)) {
            if (mustPromote(toRow, piece) || shouldAIPromote(piece)) {
                gameBoard[toRow][toCol].promoted = true;
            }
        }
    }
}

// 复制棋盘
function copyBoard(board) {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row] = [];
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (board[row][col]) {
                newBoard[row][col] = { ...board[row][col] };
            } else {
                newBoard[row][col] = null;
            }
        }
    }
    return newBoard;
}

// 评估棋盘局势
function evaluateBoard() {
    let score = 0;
    
    // 棋子价值评估
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece) {
                const pieceValue = piece.promoted ? 
                    PIECE_VALUES[`${piece.type}_promoted`] : 
                    PIECE_VALUES[piece.type];
                
                if (piece.owner === AI) {
                    score += pieceValue;
                    
                    // 位置加成
                    score += getPositionBonus(row, col, piece);
                } else {
                    score -= pieceValue;
                    
                    // 位置加成
                    score -= getPositionBonus(BOARD_SIZE - 1 - row, col, piece);
                }
            }
        }
    }
    
    // 被吃掉的棋子评估
    Object.entries(capturedPieces[AI]).forEach(([type, count]) => {
        score += PIECE_VALUES[type] * count * 0.5; // 被吃掉的棋子价值减半
    });
    
    Object.entries(capturedPieces[PLAYER]).forEach(([type, count]) => {
        score -= PIECE_VALUES[type] * count * 0.5; // 被吃掉的棋子价值减半
    });
    
    // 将军状态评估
    if (isInCheck(PLAYER)) {
        score += 200; // AI将军加分
    }
    
    if (isInCheck(AI)) {
        score -= 300; // AI被将军减分
    }
    
    // 控制中心评估
    score += evaluateCenterControl();
    
    return score;
}

// 评估中心控制
function evaluateCenterControl() {
    let score = 0;
    const centerRows = [3, 4, 5];
    const centerCols = [3, 4, 5];
    
    for (const row of centerRows) {
        for (const col of centerCols) {
            const piece = gameBoard[row][col];
            if (piece) {
                if (piece.owner === AI) {
                    score += 10;
                } else {
                    score -= 10;
                }
            }
            
            // 评估对中心的控制（可以移动到中心的棋子）
            score += evaluateControlOfSquare(row, col, AI) - evaluateControlOfSquare(row, col, PLAYER);
        }
    }
    
    return score;
}

// 评估对特定位置的控制
function evaluateControlOfSquare(row, col, player) {
    let controlCount = 0;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameBoard[r][c];
            if (piece && piece.owner === player) {
                const moves = getValidMoves(r, c, piece);
                if (moves.some(move => move.row === row && move.col === col)) {
                    controlCount++;
                }
            }
        }
    }
    
    return controlCount * 5;
}

// 获取位置加成
function getPositionBonus(row, col, piece) {
    let bonus = 0;
    
    // 前进的棋子获得加分
    if (piece.owner === AI) {
        bonus += row * 5; // AI在下方，越靠下越好
    } else {
        bonus += (BOARD_SIZE - 1 - row) * 5; // 玩家在上方，越靠上越好
    }
    
    // 中心位置加分
    const centerDistance = Math.abs(col - 4) + Math.abs(row - 4);
    bonus += (8 - centerDistance) * 2;
    
    return bonus;
}

// 寻找将军的移动
function findCheckMove() {
    const allMoves = getAllPossibleMoves(AI);
    
    for (const move of allMoves) {
        // 模拟移动
        const boardCopy = copyBoard(gameBoard);
        simulateMove(move);
        
        // 检查是否将军
        if (isInCheck(PLAYER)) {
            // 恢复棋盘
            gameBoard = boardCopy;
            return move;
        }
        
        // 恢复棋盘
        gameBoard = boardCopy;
    }
    
    return null;
}

// 寻找最佳吃子移动
function findBestCaptureMove() {
    const allMoves = getAllPossibleMoves(AI);
    let bestMove = null;
    let bestCaptureValue = -1;
    
    for (const move of allMoves) {
        if (!move.isCaptured && gameBoard[move.toRow][move.toCol]) {
            const capturedPiece = gameBoard[move.toRow][move.toCol];
            const captureValue = capturedPiece.promoted ? 
                PIECE_VALUES[`${capturedPiece.type}_promoted`] : 
                PIECE_VALUES[capturedPiece.type];
            
            if (captureValue > bestCaptureValue) {
                bestCaptureValue = captureValue;
                bestMove = move;
            }
        }
    }
    
    return bestMove;
}

// 获取加权随机移动
function getWeightedRandomMove() {
    const allMoves = getAllPossibleMoves(AI);
    
    if (allMoves.length === 0) return null;
    
    // 给每个移动分配权重
    const weightedMoves = allMoves.map(move => {
        let weight = 1; // 基础权重
        
        // 如果是吃子移动，增加权重
        if (!move.isCaptured && gameBoard[move.toRow][move.toCol]) {
            const capturedPiece = gameBoard[move.toRow][move.toCol];
            const captureValue = capturedPiece.promoted ? 
                PIECE_VALUES[`${capturedPiece.type}_promoted`] : 
                PIECE_VALUES[capturedPiece.type];
            
            weight += captureValue / 100;
        }
        
        // 如果是向前移动，增加权重
        if (!move.isCaptured) {
            const fromRow = move.fromRow;
            const toRow = move.toRow;
            if (toRow > fromRow) { // AI向下移动
                weight += (toRow - fromRow) * 0.5;
            }
        }
        
        return { move, weight };
    });
    
    // 计算总权重
    const totalWeight = weightedMoves.reduce((sum, item) => sum + item.weight, 0);
    
    // 随机选择一个移动，权重越高的移动被选中的概率越大
    let random = Math.random() * totalWeight;
    
    for (const item of weightedMoves) {
        random -= item.weight;
        if (random <= 0) {
            return item.move;
        }
    }
    
    // 如果出现问题，返回第一个移动
    return allMoves[0];
}

// AI是否应该升变棋子
function shouldAIPromote(piece) {
    // 大多数情况下，升变是有利的
    // 但有些情况下，保持原状可能更好（例如，角行的长距离移动能力）
    
    // 对于飞车和角行，只有在特定情况下才升变
    if (piece.type === PIECE_TYPES.ROOK || piece.type === PIECE_TYPES.BISHOP) {
        // 80%的概率升变
        return Math.random() < 0.8;
    }
    
    // 其他棋子总是升变
    return true;
}

// 页面加载完成后初始化AI
document.addEventListener('DOMContentLoaded', initShogiAI); 