// 五子棋AI决策逻辑

// AI移动函数 - 主入口点
function makeAIMove() {
    // 确保游戏处于活跃状态
    if (!gameActive) {
        return;
    }
    
    // 确保是AI的回合（白棋）
    if (currentPlayer !== PLAYER_WHITE) {
        return;
    }
    
    // 根据难度选择AI策略
    let aiMove = null;
    
    switch (currentDifficulty) {
        case 'medium':
            aiMove = makeMediumMove();
            break;
        case 'hard':
            aiMove = makeHardMove();
            break;
        case 'expert':
            aiMove = makeExpertMove();
            break;
        case 'master':
            aiMove = makeMasterMove();
            break;
        default:
            // 默认使用简单随机策略
            aiMove = makeRandomMove();
            break;
    }
    
    // 如果高级策略没有找到移动，回退到随机移动
    if (!aiMove) {
        aiMove = makeRandomMove();
    }
    
    // 执行移动
    placePiece(aiMove.row, aiMove.col);
    
    // 检查游戏状态
    const gameEnded = checkGameStatus(aiMove.row, aiMove.col);
    
    // 如果游戏未结束但当前玩家仍然是AI(白棋)，手动切换到玩家(黑棋)
    if (!gameEnded && currentPlayer === PLAYER_WHITE) {
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

// 大师模式：使用增强的极小化极大算法和高级策略
function makeMasterMove() {
    // 1. 先检查AI自己能否连五子获胜（立即获胜的情况）
    const winningMove = findWinningMove(PLAYER_WHITE);
    if (winningMove) return winningMove;
    
    // 2. 检查玩家是否能连五子，如果能则阻止（立即防守的情况）
    const blockingMove = findWinningMove(PLAYER_BLACK);
    if (blockingMove) return blockingMove;
    
    // 3. 检查AI自己是否能形成双四局面（必胜局面）
    const doubleFourMove = findDoubleFourMove(PLAYER_WHITE);
    if (doubleFourMove) return doubleFourMove;
    
    // 4. 检查玩家是否能形成双四局面，如果能则阻止
    const blockDoubleFourMove = findDoubleFourMove(PLAYER_BLACK);
    if (blockDoubleFourMove) return blockDoubleFourMove;
    
    // 5. 检查AI是否能形成跳活四（更隐蔽的威胁）
    const jumpFourMove = findJumpFourMove(PLAYER_WHITE);
    if (jumpFourMove) return jumpFourMove;
    
    // 6. 检查玩家是否能形成跳活四，如果能则阻止
    const blockJumpFourMove = findJumpFourMove(PLAYER_BLACK);
    if (blockJumpFourMove) return blockJumpFourMove;
    
    // 7. 检查AI自己是否能形成四三局面（强势局面）
    const fourThreeMove = findFourThreeMove(PLAYER_WHITE);
    if (fourThreeMove) return fourThreeMove;
    
    // 8. 检查玩家是否能形成四三局面，如果能则阻止
    const blockFourThreeMove = findFourThreeMove(PLAYER_BLACK);
    if (blockFourThreeMove) return blockFourThreeMove;
    
    // 9. 检查AI是否能形成三三局面
    const doubleThreeMove = findDoubleThreeMove(PLAYER_WHITE);
    if (doubleThreeMove) return doubleThreeMove;
    
    // 10. 检查玩家是否能形成三三局面，如果能则阻止
    const blockDoubleThreeMove = findDoubleThreeMove(PLAYER_BLACK);
    if (blockDoubleThreeMove) return blockDoubleThreeMove;
    
    // 11. 检查AI是否能形成跳活三（特殊威胁）
    const jumpThreeMove = findJumpThreeMoves(PLAYER_WHITE);
    if (jumpThreeMove) return jumpThreeMove;
    
    // 12. 检查玩家是否能形成跳活三，如果能则阻止
    const blockJumpThreeMove = findJumpThreeMoves(PLAYER_BLACK);
    if (blockJumpThreeMove) return blockJumpThreeMove;
    
    // 13. 使用增强的极小化极大算法进行深度搜索
    const depth = getBoardComplexity() <= 30 ? 4 : 3; // 根据棋盘复杂度调整搜索深度
    const minMaxMove = findBestMoveWithMinMax(depth);
    if (minMaxMove) return minMaxMove;
    
    // 14. 如果极小化极大算法失败，回退到使用高级评分系统
    return findBestPositionByAdvancedScore();
}

// 根据棋盘上棋子数量判断棋盘复杂度
function getBoardComplexity() {
    let pieceCount = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                pieceCount++;
            }
        }
    }
    return pieceCount;
}

// 使用增强的极小化极大算法
function findBestMoveWithMinMax(depth) {
    // 获取所有有价值的可能移动（靠近现有棋子的空位）
    const availableMoves = getPrioritizedMoves();
    
    if (availableMoves.length === 0) {
        return null;
    }
    
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 对每个可能的移动进行评估
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = PLAYER_WHITE;
        
        // 使用带有历史启发的Alpha-Beta极小化极大算法评估移动
        const score = minimaxWithHistory(depth, false, -Infinity, Infinity);
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
        
        // 更新最佳移动
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

// 获取优先级排序的可能移动
function getPrioritizedMoves() {
    // 只考虑现有棋子周围2格范围内的空位
    const candidateMoves = [];
    const visited = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    
    // 首先找出所有已有棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                // 检查周围2格范围内的空位
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const r = row + dr;
                        const c = col + dc;
                        
                        // 确保位置在棋盘内且为空
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                            gameBoard[r][c] === EMPTY && !visited[r][c]) {
                            visited[r][c] = true;
                            
                            // 为每个候选位置计算启发式评分
                            const score = evaluatePositionHeuristic(r, c);
                            candidateMoves.push({ row: r, col: c, score: score });
                        }
                    }
                }
            }
        }
    }
    
    // 如果没有候选位置（棋盘为空），返回中心位置
    if (candidateMoves.length === 0) {
        if (gameBoard[7][7] === EMPTY) {
            return [{ row: 7, col: 7, score: 100 }];
        }
        // 如果中心位置被占，返回周围位置
        const centerNeighbors = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = 7 + dr;
                const c = 7 + dc;
                if (gameBoard[r][c] === EMPTY) {
                    centerNeighbors.push({ row: r, col: c, score: 50 });
                }
            }
        }
        if (centerNeighbors.length > 0) {
            return centerNeighbors;
        }
    }
    
    // 按评分降序排序
    candidateMoves.sort((a, b) => b.score - a.score);
    
    // 只返回前N个最有价值的位置以提高效率
    const maxMoves = Math.min(15, candidateMoves.length);
    return candidateMoves.slice(0, maxMoves);
}

// 对特定位置进行启发式评估
function evaluatePositionHeuristic(row, col) {
    // 模拟AI在此位置落子
    gameBoard[row][col] = PLAYER_WHITE;
    const aiScore = evaluatePositionForPlayer(row, col, PLAYER_WHITE);
    
    // 模拟玩家在此位置落子
    gameBoard[row][col] = PLAYER_BLACK;
    const playerScore = evaluatePositionForPlayer(row, col, PLAYER_BLACK);
    
    // 还原棋盘
    gameBoard[row][col] = EMPTY;
    
    // AI进攻与防守的平衡
    return aiScore * 1.1 + playerScore;
}
