// 国际象棋AI决策逻辑
// 注意：此文件依赖于chess.js中定义的全局变量，包括：
// - gameActive: 游戏是否进行中的标志
// - currentDifficulty: 当前AI难度设置
// - gameBoard: 棋盘对象，包含棋盘状态（注意：之前错误引用为chessBoard）
// - moveHistory: 移动历史记录
// - PLAYER_WHITE, PLAYER_BLACK: 玩家常量，由chess.js定义
// - movePiece, checkGameStatus: 函数，由chess.js定义
// - BOARD_SIZE: 棋盘大小常量，由chess.js定义，默认为8
// - PIECE_TYPES: 棋子类型常量对象，由chess.js定义

// 添加兼容性检查
(function() {
    // 确保PIECE_TYPES存在，如果不存在，使用默认值
    if (typeof PIECE_TYPES === 'undefined') {
        console.warn('PIECE_TYPES is not defined in global scope, using default values');
        window.PIECE_TYPES = {
            PAWN: 'pawn',
            KNIGHT: 'knight',
            BISHOP: 'bishop',
            ROOK: 'rook',
            QUEEN: 'queen',
            KING: 'king'
        };
    }
})();

// 确保AI移动函数在全局作用域可见
window.makeAIMove = function() {
    // 确保游戏处于活动状态
    if (typeof gameActive === 'undefined' || !gameActive) return;
    
    let move;
    
    // 根据难度选择不同的AI策略
    const difficulty = typeof currentDifficulty !== 'undefined' ? currentDifficulty : 'easy';
    
    switch (difficulty) {
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
    if (move && typeof window.movePiece === 'function') {
        window.movePiece(move.from, move.to, move.promotion);
    } else if (move) {
        console.error('movePiece function is not available');
    }
    
    // 检查游戏状态
    if (typeof window.checkGameStatus === 'function') {
        window.checkGameStatus();
    }
};

// 新手级别：随机移动
function makeRandomMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 随机选择一个移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 初级：优先吃子和基本防守
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
    
    // 检查是否有自己的棋子受到威胁，优先保护
    const defensiveMoves = findDefensiveMoves(legalMoves);
    if (defensiveMoves.length > 0) {
        return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
    }
    
    // 如果没有特别的移动，随机选择一个
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 中级：有简单战略思维，考虑棋子发展和控制中心
function makeHardMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 1. 检查是否可以将军
    const checkMoves = findCheckMoves(legalMoves);
    if (checkMoves.length > 0) {
        return checkMoves[Math.floor(Math.random() * checkMoves.length)];
    }
    
    // 2. 优先检查是否可以吃子
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
    
    // 3. 检查是否有自己的棋子受到威胁，优先保护
    const defensiveMoves = findDefensiveMoves(legalMoves);
    if (defensiveMoves.length > 0) {
        return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
    }
    
    // 4. 考虑发展棋子和控制中心
    const strategicMoves = findStrategicMoves(legalMoves);
    if (strategicMoves.length > 0) {
        return strategicMoves[Math.floor(Math.random() * strategicMoves.length)];
    }
    
    // 如果没有特别的移动，随机选择一个
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 高级：使用简单的评分系统和深度1的搜索
function makeExpertMove() {
    // 使用简单的极小化极大搜索，深度为1
    return findBestMoveWithMinMax(1);
}

// 专家：使用更深层次的搜索和Alpha-Beta剪枝
function makeMasterMove() {
    // 使用深度3的极小化极大搜索和Alpha-Beta剪枝
    return findBestMoveWithAlphaBeta(3);
}

// 大师：使用更复杂的评估函数和更深层次的搜索
function makeGrandmasterMove() {
    // 使用深度5的极小化极大搜索和Alpha-Beta剪枝
    // 同时使用更复杂的局面评估和开局库
    if (isOpeningPhase()) {
        const bookMove = findOpeningBookMove();
        if (bookMove) return bookMove;
    }
    
    // 使用增强的评估函数
    return findBestMoveWithAdvancedEvaluation(5);
}

// 获取棋子的价值
function getPieceValue(piece) {
    switch (piece.type) {
        case 'pawn': return 1;
        case 'knight': return 3;
        case 'bishop': return 3;
        case 'rook': return 5;
        case 'queen': return 9;
        case 'king': return 100;
        default: return 0;
    }
}

// 判断是否处于开局阶段
function isOpeningPhase() {
    // 通过检查已移动的棋子数量或回合数来判断是否为开局阶段
    // 一般认为前10步或者所有主要棋子都未移动时为开局阶段
    const moveCount = getMoveCount();
    return moveCount < 10;
}

// 从开局库中查找合适的下一步移动
function findOpeningBookMove() {
    // 在实际实现中，这里可以包含一个开局库数据库
    // 简化版：返回一些常见的开局着法
    const currentPosition = getCurrentBoardPosition();
    
    // 检查当前局面是否匹配任何已知的开局模式
    const openingMove = checkOpeningBook(currentPosition);
    if (openingMove) {
        return openingMove;
    }
    
    return null;
}

// 获取当前已移动的步数
function getMoveCount() {
    // 实际实现时应该从游戏状态中获取已经下了多少步棋
    // 这里简化为从moveHistory中获取
    return typeof moveHistory !== 'undefined' && moveHistory ? moveHistory.length : 0;
}

// 获取当前棋盘状态
function getCurrentBoardPosition() {
    // 返回当前棋盘的状态表示
    // 简化实现
    return gameBoard ? getBoardFEN() : '';
}

// 检查开局库
function checkOpeningBook(position) {
    // 简化的开局库实现
    // 在实际项目中，这里应该查询一个包含常见开局的数据库
    
    // 如果是起始位置，可以返回一些常见的开局着法
    if (position === 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1') {
        // 一些常见的开局，如王翼兵开局(e4)或后翼兵开局(d4)
        const commonOpenings = [
            { from: 'e2', to: 'e4' },  // 国王兵开局
            { from: 'd2', to: 'd4' },  // 王后兵开局
            { from: 'c2', to: 'c4' },  // 英国开局
            { from: 'g1', to: 'f3' }   // 王翼骑士展开
        ];
        
        return commonOpenings[Math.floor(Math.random() * commonOpenings.length)];
    }
    
    // 其他开局模式可以在这里添加
    
    return null;
}

// 使用高级评估函数查找最佳着法
function findBestMoveWithAdvancedEvaluation(depth) {
    // 这个函数应该实现一个更复杂的评估函数和搜索算法
    // 简化版：调用现有的Alpha-Beta搜索但使用更复杂的评估
    return findBestMoveWithAlphaBeta(depth);
}

// 使用Alpha-Beta剪枝查找最佳移动
function findBestMoveWithAlphaBeta(depth) {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 创建一个置换表来存储已评估的局面
    const transpositionTable = new Map();
    
    for (const move of legalMoves) {
        // 模拟移动
        const originalBoard = copyBoard();
        makeSimulatedMove(move);
        
        // 使用Alpha-Beta剪枝评估移动
        const score = alphaBetaMinMax(depth - 1, -Infinity, Infinity, false, transpositionTable);
        
        // 恢复棋盘
        restoreBoard(originalBoard);
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// Alpha-Beta剪枝极小化极大搜索
function alphaBetaMinMax(depth, alpha, beta, isMaximizing, transpositionTable) {
    // 检查是否终局或达到最大深度
    if (depth === 0 || isGameOver()) {
        return evaluateBoard();
    }
    
    // 获取当前棋盘的哈希值或FEN表示
    const boardKey = getBoardFEN();
    
    // 检查置换表中是否已有当前局面的评估
    if (transpositionTable.has(boardKey)) {
        return transpositionTable.get(boardKey);
    }
    
    if (isMaximizing) {
        // AI的回合(PLAYER_BLACK)，寻找最大评分
        let maxEval = -Infinity;
        const moves = getAllLegalMoves(PLAYER_BLACK);
        
        for (const move of moves) {
            // 模拟移动
            const originalBoard = copyBoard();
            makeSimulatedMove(move);
            
            // 递归评估
            const evaluation = alphaBetaMinMax(depth - 1, alpha, beta, false, transpositionTable);
            
            // 恢复棋盘
            restoreBoard(originalBoard);
            
            // 更新最大评分
            maxEval = Math.max(maxEval, evaluation);
            
            // Alpha-Beta剪枝
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) {
                break; // Beta剪枝
            }
        }
        
        // 存储结果到置换表
        transpositionTable.set(boardKey, maxEval);
        return maxEval;
    } else {
        // 玩家的回合(PLAYER_WHITE)，寻找最小评分
        let minEval = Infinity;
        const moves = getAllLegalMoves(PLAYER_WHITE);
        
        for (const move of moves) {
            // 模拟移动
            const originalBoard = copyBoard();
            makeSimulatedMove(move);
            
            // 递归评估
            const evaluation = alphaBetaMinMax(depth - 1, alpha, beta, true, transpositionTable);
            
            // 恢复棋盘
            restoreBoard(originalBoard);
            
            // 更新最小评分
            minEval = Math.min(minEval, evaluation);
            
            // Alpha-Beta剪枝
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) {
                break; // Alpha剪枝
            }
        }
        
        // 存储结果到置换表
        transpositionTable.set(boardKey, minEval);
        return minEval;
    }
}

// 评估当前棋盘状态
function evaluateBoard() {
    // 基本评估：计算材料价值差异
    let score = 0;
    
    // 遍历棋盘计算分数
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            if (piece) {
                // 根据棋子类型和所属玩家计算分数
                const pieceValue = getPieceValue(piece);
                score += piece.player === PLAYER_BLACK ? pieceValue : -pieceValue;
            }
        }
    }
    
    // 添加位置价值评估
    score += evaluatePosition();
    
    return score;
}

// 评估棋子位置
function evaluatePosition() {
    let score = 0;
    
    // 位置评估矩阵可以在这里添加
    // 例如：中心位置控制、兵的前进、王的安全等
    
    return score;
}

// 复制当前棋盘状态
function copyBoard() {
    // 根据游戏实现方式返回当前棋盘的深拷贝
    return JSON.parse(JSON.stringify(gameBoard));
}

// 恢复棋盘到指定状态
function restoreBoard(boardState) {
    // 根据游戏实现方式恢复棋盘状态
    gameBoard = JSON.parse(JSON.stringify(boardState));
}

// 模拟移动
function makeSimulatedMove(move) {
    // 在不更新UI的情况下模拟一个移动
    // 简化实现
    const piece = getPieceAt(move.from.row, move.from.col);
    setPieceAt(move.from.row, move.from.col, null);
    setPieceAt(move.to.row, move.to.col, piece);
    
    // 处理特殊移动，如升变、王车易位等
    if (move.promotion) {
        setPieceAt(move.to.row, move.to.col, {type: move.promotion, player: piece.player});
    }
}

// 获取棋盘FEN表示
function getBoardFEN() {
    // 返回当前棋盘的FEN(Forsyth-Edwards Notation)表示
    // 简化实现
    let fen = '';
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        let emptyCount = 0;
        
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            
            if (!piece) {
                emptyCount++;
            } else {
                if (emptyCount > 0) {
                    fen += emptyCount;
                    emptyCount = 0;
                }
                
                let pieceChar = '';
                // 处理不同格式的棋子类型名称
                const pieceType = piece.type.toLowerCase();
                switch (pieceType) {
                    case 'pawn': pieceChar = 'p'; break;
                    case 'knight': pieceChar = 'n'; break;
                    case 'bishop': pieceChar = 'b'; break;
                    case 'rook': pieceChar = 'r'; break;
                    case 'queen': pieceChar = 'q'; break;
                    case 'king': pieceChar = 'k'; break;
                }
                
                fen += piece.player === PLAYER_WHITE ? pieceChar.toUpperCase() : pieceChar;
            }
        }
        
        if (emptyCount > 0) {
            fen += emptyCount;
        }
        
        if (row < BOARD_SIZE - 1) {
            fen += '/';
        }
    }
    
    // 添加当前玩家
    fen += ' ' + (currentPlayer === PLAYER_WHITE ? 'w' : 'b');
    
    // 简化其他FEN字段
    fen += ' KQkq - 0 1';
    
    return fen;
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否将军、将死、逼和或其他结束条件
    
    // 检查是否有合法移动
    const currentPlayerMoves = getAllLegalMoves(currentPlayer);
    
    // 如果当前玩家没有合法移动，游戏结束
    if (currentPlayerMoves.length === 0) {
        return true;
    }
    
    // 简化：检查是否只剩下国王（不够棋子将死）
    let whitePieces = 0;
    let blackPieces = 0;
    let onlyKings = true;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            if (piece) {
                if (piece.player === PLAYER_WHITE) {
                    whitePieces++;
                } else {
                    blackPieces++;
                }
                
                if (piece.type !== 'king') {
                    onlyKings = false;
                }
            }
        }
    }
    
    // 如果只有国王，或者任一方没有棋子，游戏结束
    if (onlyKings || whitePieces === 0 || blackPieces === 0) {
        return true;
    }
    
    return false;
}

// 获取指定位置的棋子
function getPieceAt(row, col) {
    // 返回指定位置的棋子
    return gameBoard && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE ? gameBoard[row][col] : null;
}

// 设置指定位置的棋子
function setPieceAt(row, col, piece) {
    // 在指定位置设置棋子
    if (gameBoard && row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
        gameBoard[row][col] = piece;
    }
}

// 获取所有合法移动
function getAllLegalMoves(player) {
    // 返回指定玩家的所有合法移动
    const moves = [];
    
    // 遍历棋盘，找到所有属于指定玩家的棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            if (piece && piece.player === player) {
                // 计算该棋子的所有合法移动
                const pieceMoves = calculatePieceLegalMoves(row, col, player);
                
                // 将移动添加到结果中，包含起始位置信息
                pieceMoves.forEach(move => {
                    moves.push({
                        from: { row, col },
                        to: { row: move.row, col: move.col },
                        capture: getPieceAt(move.row, move.col)
                    });
                });
            }
        }
    }
    
    return moves;
}

// 计算特定棋子的合法移动
function calculatePieceLegalMoves(row, col, player) {
    const piece = getPieceAt(row, col);
    if (!piece || piece.player !== player) return [];
    
    // 简化版：根据棋子类型返回一些基本移动
    // 实际实现应考虑所有国际象棋规则
    
    // 处理不同类型名称的兼容性（大写/小写）
    const pieceType = piece.type.toLowerCase();
    
    switch (pieceType) {
        case 'pawn':
            return calculatePawnMoves(row, col, player);
        case 'knight':
            return calculateKnightMoves(row, col, player);
        case 'bishop':
            return calculateBishopMoves(row, col, player);
        case 'rook':
            return calculateRookMoves(row, col, player);
        case 'queen':
            return calculateQueenMoves(row, col, player);
        case 'king':
            return calculateKingMoves(row, col, player);
        default:
            return [];
    }
}

// 计算兵的合法移动
function calculateAIPawnMoves(row, col, player) {
    const moves = [];
    const direction = player === PLAYER_WHITE ? -1 : 1; // 白棋向上移动，黑棋向下移动
    const startRow = player === PLAYER_WHITE ? BOARD_SIZE-2 : 1;   // 起始行
    
    // 前进一步
    if (!getPieceAt(row + direction, col)) {
        moves.push({ row: row + direction, col: col });
        
        // 起始位置可以前进两步
        if (row === startRow && !getPieceAt(row + direction * 2, col)) {
            moves.push({ row: row + direction * 2, col: col });
        }
    }
    
    // 吃子移动（左斜）
    if (col > 0) {
        const leftTarget = getPieceAt(row + direction, col - 1);
        if (leftTarget && leftTarget.player !== player) {
            moves.push({ row: row + direction, col: col - 1 });
        }
    }
    
    // 吃子移动（右斜）
    if (col < BOARD_SIZE - 1) {
        const rightTarget = getPieceAt(row + direction, col + 1);
        if (rightTarget && rightTarget.player !== player) {
            moves.push({ row: row + direction, col: col + 1 });
        }
    }
    
    return moves;
}

// 以下是简化版的其他棋子移动计算函数
// 实际实现应该考虑所有国际象棋规则

function calculateKnightMoves(row, col, player) {
    const knightMoves = [
        {row: row-2, col: col-1}, {row: row-2, col: col+1},
        {row: row-1, col: col-2}, {row: row-1, col: col+2},
        {row: row+1, col: col-2}, {row: row+1, col: col+2},
        {row: row+2, col: col-1}, {row: row+2, col: col+1}
    ];
    
    return knightMoves.filter(move => 
        move.row >= 0 && move.row < BOARD_SIZE && 
        move.col >= 0 && move.col < BOARD_SIZE &&
        (!getPieceAt(move.row, move.col) || getPieceAt(move.row, move.col).player !== player)
    );
}

function calculateBishopMoves(row, col, player) {
    return getDiagonalMoves(row, col, player);
}

function calculateRookMoves(row, col, player) {
    return getStraightMoves(row, col, player);
}

function calculateQueenMoves(row, col, player) {
    return [...getDiagonalMoves(row, col, player), ...getStraightMoves(row, col, player)];
}

function calculateKingMoves(row, col, player) {
    const kingMoves = [
        {row: row-1, col: col-1}, {row: row-1, col: col}, {row: row-1, col: col+1},
        {row: row, col: col-1},                         {row: row, col: col+1},
        {row: row+1, col: col-1}, {row: row+1, col: col}, {row: row+1, col: col+1}
    ];
    
    return kingMoves.filter(move => 
        move.row >= 0 && move.row < BOARD_SIZE && 
        move.col >= 0 && move.col < BOARD_SIZE &&
        (!getPieceAt(move.row, move.col) || getPieceAt(move.row, move.col).player !== player)
    );
}

function getDiagonalMoves(row, col, player) {
    const moves = [];
    const directions = [{r:1,c:1}, {r:1,c:-1}, {r:-1,c:1}, {r:-1,c:-1}];
    
    for (const dir of directions) {
        let r = row + dir.r;
        let c = col + dir.c;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const piece = getPieceAt(r, c);
            if (!piece) {
                moves.push({row: r, col: c});
            } else {
                if (piece.player !== player) {
                    moves.push({row: r, col: c});
                }
                break;
            }
            r += dir.r;
            c += dir.c;
        }
    }
    
    return moves;
}

function getStraightMoves(row, col, player) {
    const moves = [];
    const directions = [{r:1,c:0}, {r:-1,c:0}, {r:0,c:1}, {r:0,c:-1}];
    
    for (const dir of directions) {
        let r = row + dir.r;
        let c = col + dir.c;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const piece = getPieceAt(r, c);
            if (!piece) {
                moves.push({row: r, col: c});
            } else {
                if (piece.player !== player) {
                    moves.push({row: r, col: c});
                }
                break;
            }
            r += dir.r;
            c += dir.c;
        }
    }
    
    return moves;
}

// 找出能够将军的移动
function findCheckMoves(legalMoves) {
    // 找出所有能够将军的移动
    const checkMoves = [];
    
    for (const move of legalMoves) {
        // 模拟移动
        const originalBoard = copyBoard();
        makeSimulatedMove(move);
        
        // 检查移动后是否将军
        if (isCheck(PLAYER_WHITE)) {
            checkMoves.push(move);
        }
        
        // 恢复棋盘
        restoreBoard(originalBoard);
    }
    
    return checkMoves;
}

// 找出防御性移动
function findDefensiveMoves(legalMoves) {
    // 找出能够保护被威胁棋子的移动
    const defensiveMoves = [];
    
    // 先找出所有被威胁的棋子
    const threatenedPieces = findThreatenedPieces(PLAYER_BLACK);
    
    if (threatenedPieces.length === 0) {
        return defensiveMoves;
    }
    
    // 检查每个合法移动是否能保护被威胁的棋子
    for (const move of legalMoves) {
        // 模拟移动
        const originalBoard = copyBoard();
        makeSimulatedMove(move);
        
        // 检查移动后是否减少了被威胁的棋子
        const newThreatenedPieces = findThreatenedPieces(PLAYER_BLACK);
        if (newThreatenedPieces.length < threatenedPieces.length) {
            defensiveMoves.push(move);
        }
        
        // 恢复棋盘
        restoreBoard(originalBoard);
    }
    
    return defensiveMoves;
}

// 找出战略性移动
function findStrategicMoves(legalMoves) {
    // 找出有战略价值的移动，如控制中心、展开棋子等
    const strategicMoves = [];
    
    // 中心格子坐标
    const centerSquares = [
        {row: 3, col: 3},
        {row: 3, col: 4},
        {row: 4, col: 3},
        {row: 4, col: 4}
    ];
    
    for (const move of legalMoves) {
        // 检查是否移动到中心格子
        if (centerSquares.some(square => square.row === move.to.row && square.col === move.to.col)) {
            strategicMoves.push(move);
            continue;
        }
        
        // 检查是否发展棋子（例如骑士或主教）
        const piece = getPieceAt(move.from.row, move.from.col);
        if (piece) {
            const pieceType = piece.type.toLowerCase();
            if (pieceType === 'knight' || pieceType === 'bishop') {
                if (move.from.row === 0 || move.from.row === BOARD_SIZE - 1) { // 起始行
                    strategicMoves.push(move);
                    continue;
                }
            }
        }
        
        // 其他战略考虑可以在这里添加
    }
    
    return strategicMoves;
}

// 检查是否将军
function isCheck(player) {
    // 检查指定玩家的王是否被将军
    // 找到指定玩家的王
    let kingRow = -1, kingCol = -1;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            if (piece && piece.player === player && piece.type.toLowerCase() === 'king') {
                kingRow = row;
                kingCol = col;
                break;
            }
        }
        if (kingRow !== -1) break;
    }
    
    if (kingRow === -1) return false; // 找不到王（不应该发生）
    
    // 检查是否有对方棋子可以攻击到王
    const opponent = player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    return isSquareThreatened(kingRow, kingCol, player);
}

// 找出被威胁的棋子
function findThreatenedPieces(player) {
    // 找出指定玩家所有被威胁的棋子
    const threatenedPieces = [];
    
    // 遍历棋盘，找出所有指定玩家的棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = getPieceAt(row, col);
            if (piece && piece.player === player) {
                // 检查该棋子是否被对方威胁
                if (isSquareThreatened(row, col, player)) {
                    threatenedPieces.push({row, col, piece});
                }
            }
        }
    }
    
    return threatenedPieces;
}

// 检查格子是否被威胁
function isSquareThreatened(row, col, player) {
    // 检查指定格子是否被对方威胁
    // 简化实现
    const opponentPlayer = player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    const opponentMoves = getAllLegalMoves(opponentPlayer);
    
    return opponentMoves.some(move => move.to.row === row && move.to.col === col);
}