// 五子棋AI决策逻辑

// AI移动函数 - 主入口点
function makeAIMove() {
    console.log("AI移动函数被调用");
    
    // 确保游戏处于活跃状态
    if (!gameActive) {
        console.log("游戏已结束，AI不行动");
        return;
    }
    
    // 确保是AI的回合（白棋）
    if (currentPlayer !== PLAYER_WHITE) {
        console.log("不是AI回合，AI不行动");
        return;
    }
    
    // 输出当前的AI难度等级
    console.log("当前AI难度设置:", currentDifficulty);
    
    console.log("AI正在思考...")
    
    // 根据难度选择AI策略
    let aiMove = null;
    
    switch (currentDifficulty) {
        case 'medium':
            console.log("使用中等难度AI策略");
            aiMove = makeMediumMove();
            break;
        case 'hard':
            console.log("使用困难难度AI策略");
            aiMove = makeHardMove();
            break;
        case 'expert':
            console.log("使用专家难度AI策略");
            aiMove = makeExpertMove();
            break;
        case 'master':
            console.log("使用大师难度AI策略");
            aiMove = makeMasterMove();
            break;
        default:
            console.log("使用简单难度AI策略");
            // 默认使用简单随机策略
            aiMove = makeRandomMove();
            break;
    }
    
    // 如果高级策略没有找到移动，回退到随机移动
    if (!aiMove) {
        // 简单随机移动
        aiMove = makeRandomMove();
        console.log("使用随机策略选择位置:", aiMove.row, aiMove.col);
    }
    
    // 执行移动
    console.log("AI最终选择位置:", aiMove.row, aiMove.col);
    
    // 放置棋子
    placePiece(aiMove.row, aiMove.col);
    
    // 检查游戏状态
    const gameEnded = checkGameStatus(aiMove.row, aiMove.col);
    console.log("AI下棋后游戏状态:", gameEnded ? "游戏结束" : "游戏继续");
    
    // 确认游戏状态和当前玩家
    console.log("当前玩家:", currentPlayer);
    
    // 如果游戏未结束但当前玩家仍然是AI(白棋)，手动切换到玩家(黑棋)
    if (!gameEnded && currentPlayer === PLAYER_WHITE) {
        console.log("检测到AI下棋后未切换玩家，手动切换到玩家回合");
        currentPlayer = PLAYER_BLACK;
        updateTurnIndicator();
    }
}

// 简单模式：随机移动
function makeRandomMove() {
    // 收集所有空位置
    const emptyPositions = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                emptyPositions.push({ row, col });
            }
        }
    }
    
    // 随机选择一个位置
    if (emptyPositions.length === 0) {
        return null;
    }
    return emptyPositions[Math.floor(Math.random() * emptyPositions.length)];
}

// 中等模式：阻止玩家获胜或随机移动
function makeMediumMove() {
    // 1. 先检查AI自己能否连五子获胜
    const winningMove = findWinningMove(PLAYER_WHITE);
    if (winningMove) return winningMove;
    
    // 2. 检查玩家是否能连五子，如果能则阻止
    const blockingMove = findWinningMove(PLAYER_BLACK);
    if (blockingMove) return blockingMove;
    
    // 3. 检查是否有四子情况需要防守
    const defensiveMove = findDefensiveMove();
    if (defensiveMove) return defensiveMove;
    
    // 4. 如果中间位置空闲，优先选择
    if (gameBoard[7][7] === EMPTY) {
        return { row: 7, col: 7 };
    }
    
    // 5. 在已有棋子周围随机选择一个位置
    const nearbyMove = findNearbyMove();
    if (nearbyMove) return nearbyMove;
    
    // 6. 随机移动
    return makeRandomMove();
}

// 困难模式：使用更复杂的策略
function makeHardMove() {
    // 1. 先检查AI自己能否连五子获胜
    const winningMove = findWinningMove(PLAYER_WHITE);
    if (winningMove) return winningMove;
    
    // 2. 检查玩家是否能连五子，如果能则阻止
    const blockingMove = findWinningMove(PLAYER_BLACK);
    if (blockingMove) return blockingMove;
    
    // 3. 检查AI自己是否能形成四子
    const offensiveMove = findOffensiveMove();
    if (offensiveMove) return offensiveMove;
    
    // 4. 检查是否有四子情况需要防守
    const defensiveMove = findDefensiveMove();
    if (defensiveMove) return defensiveMove;
    
    // 5. 检查是否可以形成三子活棋
    const threeInRowMove = findThreeInRowMove();
    if (threeInRowMove) return threeInRowMove;
    
    // 6. 如果中间位置空闲，优先选择
    if (gameBoard[7][7] === EMPTY) {
        return { row: 7, col: 7 };
    }
    
    // 7. 选择标记点位置
    for (const [row, col] of MARK_POSITIONS) {
        if (gameBoard[row][col] === EMPTY) {
            return { row, col };
        }
    }
    
    // 8. 在已有棋子周围随机选择一个位置
    const nearbyMove = findNearbyMove();
    if (nearbyMove) return nearbyMove;
    
    // 9. 随机移动
    return makeRandomMove();
}

// 专家模式：使用更高级的策略和评分系统
function makeExpertMove() {
    // 1. 先检查AI自己能否连五子获胜
    const winningMove = findWinningMove(PLAYER_WHITE);
    if (winningMove) return winningMove;
    
    // 2. 检查玩家是否能连五子，如果能则阻止
    const blockingMove = findWinningMove(PLAYER_BLACK);
    if (blockingMove) return blockingMove;
    
    // 3. 检查AI自己是否能形成双四局面（必胜局面）
    const doubleFourMove = findDoubleFourMove(PLAYER_WHITE);
    if (doubleFourMove) return doubleFourMove;
    
    // 4. 检查玩家是否能形成双四局面，如果能则阻止
    const blockDoubleFourMove = findDoubleFourMove(PLAYER_BLACK);
    if (blockDoubleFourMove) return blockDoubleFourMove;
    
    // 5. 检查AI自己是否能形成四三局面（强势局面）
    const fourThreeMove = findFourThreeMove(PLAYER_WHITE);
    if (fourThreeMove) return fourThreeMove;
    
    // 6. 检查玩家是否能形成四三局面，如果能则阻止
    const blockFourThreeMove = findFourThreeMove(PLAYER_BLACK);
    if (blockFourThreeMove) return blockFourThreeMove;
    
    // 7. 检查AI自己是否能形成双三局面
    const doubleThreeMove = findDoubleThreeMove(PLAYER_WHITE);
    if (doubleThreeMove) return doubleThreeMove;
    
    // 8. 检查玩家是否能形成双三局面，如果能则阻止
    const blockDoubleThreeMove = findDoubleThreeMove(PLAYER_BLACK);
    if (blockDoubleThreeMove) return blockDoubleThreeMove;
    
    // 9. 检查AI自己是否能形成四子
    const offensiveMove = findOffensiveMove();
    if (offensiveMove) return offensiveMove;
    
    // 10. 检查是否有四子情况需要防守
    const defensiveMove = findDefensiveMove();
    if (defensiveMove) return defensiveMove;
    
    // 11. 检查是否可以形成三子活棋
    const threeInRowMove = findThreeInRowMove();
    if (threeInRowMove) return threeInRowMove;
    
    // 12. 使用评分系统选择最佳位置
    return findBestPositionByScore();
}

// 大师模式：使用极小化极大算法和Alpha-Beta剪枝
function makeMasterMove() {
    // 1. 先检查AI自己能否连五子获胜（立即获胜的情况）
    const winningMove = findWinningMove(PLAYER_WHITE);
    if (winningMove) return winningMove;
    
    // 2. 检查玩家是否能连五子，如果能则阻止（立即防守的情况）
    const blockingMove = findWinningMove(PLAYER_BLACK);
    if (blockingMove) return blockingMove;
    
    // 3. 使用极小化极大算法和Alpha-Beta剪枝进行深度搜索
    const minMaxMove = findBestMoveWithMinMax();
    if (minMaxMove) return minMaxMove;
    
    // 如果极小化极大算法失败，回退到使用评分系统
    return findBestPositionByScore();
}

// 使用极小化极大算法
function findBestMoveWithMinMax() {
    console.log("使用极小化极大算法寻找最佳移动");
    
    // 获取所有可能的移动
    const availableMoves = getAvailableMoves();
    
    if (availableMoves.length === 0) {
        console.log("没有可用的移动");
        return null;
    }
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 对每个可能的移动进行评估
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = PLAYER_WHITE;
        
        // 使用带有历史启发的极小化极大算法评估移动
        const score = minimaxWithHistory(3, false, -Infinity, Infinity);
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
        
        console.log(`位置 (${move.row}, ${move.col}) 的评分: ${score}`);
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    console.log(`选择最佳移动: (${bestMove.row}, ${bestMove.col}), 评分: ${bestScore}`);
    return bestMove;
}
