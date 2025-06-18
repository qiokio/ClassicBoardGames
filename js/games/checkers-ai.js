// 跳棋AI决策逻辑

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
        default:
            move = makeRandomMove();
    }
    
    // 执行移动
    if (move) {
        movePiece(move.from, move.to, move.captures);
    }
    
    // 检查游戏状态
    checkGameStatus();
}

// 简单级别：随机移动
function makeRandomMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 随机选择一个移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 普通级别：优先选择吃子移动
function makeMediumMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 筛选出所有可以吃子的移动
    const captureMoves = legalMoves.filter(move => move.captures && move.captures.length > 0);
    
    if (captureMoves.length > 0) {
        // 优先选择可以吃掉最多棋子的移动
        captureMoves.sort((a, b) => b.captures.length - a.captures.length);
        return captureMoves[0];
    }
    
    // 如果没有吃子机会，随机选择一个合法移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 困难级别：多步规划，注重王棋
function makeHardMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 1. 筛选出所有可以吃子的移动
    const captureMoves = legalMoves.filter(move => move.captures && move.captures.length > 0);
    
    if (captureMoves.length > 0) {
        // 优先选择可以吃掉最多棋子的移动
        captureMoves.sort((a, b) => b.captures.length - a.captures.length);
        return captureMoves[0];
    }
    
    // 2. 检查是否有机会升级成王棋
    const promotionMoves = legalMoves.filter(move => canPromote(move));
    if (promotionMoves.length > 0) {
        return promotionMoves[Math.floor(Math.random() * promotionMoves.length)];
    }
    
    // 3. 检查是否需要保护自己的棋子
    const defensiveMoves = findDefensiveMoves(legalMoves);
    if (defensiveMoves.length > 0) {
        return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
    }
    
    // 4. 王棋的移动优先级高
    const kingMoves = legalMoves.filter(move => isKing(move.from));
    if (kingMoves.length > 0) {
        return kingMoves[Math.floor(Math.random() * kingMoves.length)];
    }
    
    // 5. 优先向前推进
    const forwardMoves = findForwardMoves(legalMoves);
    if (forwardMoves.length > 0) {
        return forwardMoves[Math.floor(Math.random() * forwardMoves.length)];
    }
    
    // 如果没有特别的移动，随机选择一个
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 专家级别：使用极小化极大算法评估多步后的局面
function makeExpertMove() {
    // 使用简单的极小化极大搜索，深度为3
    return findBestMoveWithMinMax(3);
}

// 大师级别：使用Alpha-Beta剪枝和高级局面评估
function makeMasterMove() {
    // 使用深度5的Alpha-Beta剪枝搜索和高级局面评估
    return findBestMoveWithAlphaBeta(5);
}

// 判断是否可以升级成王棋
function canPromote(move) {
    // 判断是否可以到达底线升级成王
    // 具体实现取决于棋盘表示方式
    const row = getRow(move.to);
    return !isKing(move.from) && row === 0; // 假设到达第0行可以升级
}

// 判断棋子是否为王棋
function isKing(position) {
    // 根据棋盘状态判断指定位置的棋子是否为王
    // 具体实现取决于游戏状态表示方式
    const piece = getPiece(position);
    return piece && piece.isKing;
}

// 寻找前进的移动
function findForwardMoves(moves) {
    // 筛选出向前移动的棋子
    // 对于黑方棋子，向下移动是前进
    return moves.filter(move => {
        const fromRow = getRow(move.from);
        const toRow = getRow(move.to);
        return toRow > fromRow;
    });
}

// 其他辅助函数在此省略，实际实现中需要完善这些函数
// 包括：getAllLegalMoves, findDefensiveMoves, getRow, getPiece,
// findBestMoveWithMinMax, findBestMoveWithAlphaBeta 等 