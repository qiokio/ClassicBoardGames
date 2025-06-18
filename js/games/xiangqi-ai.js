// 中国象棋AI决策逻辑

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
    
    // 检查游戏状态
    checkGameStatus();
}

// 新手级别：随机移动
function makeRandomMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 随机选择一个移动
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
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

// 初级：基本战术意识，保护关键棋子
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
    
    // 3. 检查是否需要保护关键棋子
    const defensiveMoves = findDefensiveMoves(legalMoves);
    if (defensiveMoves.length > 0) {
        return defensiveMoves[Math.floor(Math.random() * defensiveMoves.length)];
    }
    
    // 4. 考虑基本的棋子发展
    const developmentMoves = findDevelopmentMoves(legalMoves);
    if (developmentMoves.length > 0) {
        return developmentMoves[Math.floor(Math.random() * developmentMoves.length)];
    }
    
    // 如果没有特别的移动，随机选择一个
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
}

// 中级：战略部署与攻防转换
function makeExpertMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 使用简单的极小化极大搜索，深度为2
    return findBestMoveWithMinMax(2);
}

// 高级：良好的棋型意识和计算能力
function makeMasterMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 使用深度3的Alpha-Beta剪枝搜索
    return findBestMoveWithAlphaBeta(3);
}

// 大师：深度搜索和专业战术
function makeGrandmasterMove() {
    // 收集所有合法移动
    const legalMoves = getAllLegalMoves(PLAYER_BLACK);
    
    if (legalMoves.length === 0) return null;
    
    // 开局阶段使用开局库
    if (isOpeningPhase()) {
        const bookMove = findOpeningBookMove();
        if (bookMove) return bookMove;
    }
    
    // 使用深度5的Alpha-Beta剪枝搜索和高级局面评估
    return findBestMoveWithAdvancedEvaluation(5);
}

// 获取棋子的价值
function getPieceValue(piece) {
    switch (piece.type) {
        case 'pawn': return 1;    // 兵/卒
        case 'cannon': return 4;  // 炮
        case 'horse': return 4;   // 马
        case 'chariot': return 9; // 车
        case 'elephant': return 2; // 象/相
        case 'advisor': return 2;  // 士/仕
        case 'general': return 100; // 将/帅
        default: return 0;
    }
}

// 其他辅助函数在此省略，实际实现中需要完善这些函数
// 包括：getAllLegalMoves, findCheckMoves, findDefensiveMoves, findDevelopmentMoves,
// findBestMoveWithMinMax, findBestMoveWithAlphaBeta, isOpeningPhase,
// findOpeningBookMove, findBestMoveWithAdvancedEvaluation 等 