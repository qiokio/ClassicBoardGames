// 五子棋AI辅助函数

// 寻找获胜移动
function findWinningMove(player) {
    console.log("查找获胜移动:", player);
    // 检查每个空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟放置棋子
                gameBoard[row][col] = player;
                
                // 检查是否获胜
                const isWinning = DIRECTIONS.some(([dx, dy]) => {
                    const count = 1 + countConsecutive(row, col, dx, dy, player) + 
                                  countConsecutive(row, col, -dx, -dy, player);
                    return count >= 5;
                });
                
                // 恢复空位置
                gameBoard[row][col] = EMPTY;
                
                // 如果是获胜移动，返回该位置
                if (isWinning) {
                    console.log("找到获胜移动:", row, col);
                    return { row, col };
                }
            }
        }
    }
    
    console.log("未找到获胜移动");
    return null;
}

// 寻找防守移动（阻止玩家形成四子）
function findDefensiveMove() {
    const player = PLAYER_BLACK;
    
    // 检查每个空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟放置棋子
                gameBoard[row][col] = player;
                
                // 检查是否形成四子
                const isFourInRow = DIRECTIONS.some(([dx, dy]) => {
                    const count = 1 + countConsecutive(row, col, dx, dy, player) + 
                                  countConsecutive(row, col, -dx, -dy, player);
                    return count === 4;
                });
                
                // 恢复空位置
                gameBoard[row][col] = EMPTY;
                
                // 如果是形成四子，就需要防守
                if (isFourInRow) {
                    return { row, col };
                }
            }
        }
    }
    
    return null;
}

// 寻找进攻移动（形成四子）
function findOffensiveMove() {
    const player = PLAYER_WHITE;
    
    // 检查每个空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟放置棋子
                gameBoard[row][col] = player;
                
                // 检查是否形成四子
                const isFourInRow = DIRECTIONS.some(([dx, dy]) => {
                    const count = 1 + countConsecutive(row, col, dx, dy, player) + 
                                  countConsecutive(row, col, -dx, -dy, player);
                    return count === 4;
                });
                
                // 恢复空位置
                gameBoard[row][col] = EMPTY;
                
                // 如果是形成四子，就进攻
                if (isFourInRow) {
                    return { row, col };
                }
            }
        }
    }
    
    return null;
}

// 寻找形成三子活棋的移动
function findThreeInRowMove() {
    const player = PLAYER_WHITE;
    
    // 检查每个空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟放置棋子
                gameBoard[row][col] = player;
                
                // 检查是否形成三子活棋
                const isThreeInRow = DIRECTIONS.some(([dx, dy]) => {
                    const count = 1 + countConsecutive(row, col, dx, dy, player) + 
                                  countConsecutive(row, col, -dx, -dy, player);
                    return count === 3;
                });
                
                // 恢复空位置
                gameBoard[row][col] = EMPTY;
                
                // 如果是形成三子活棋，就选择该位置
                if (isThreeInRow) {
                    return { row, col };
                }
            }
        }
    }
    
    return null;
}

// 寻找已有棋子周围的空位置
function findNearbyMove() {
    const nearbyPositions = [];
    
    // 扫描整个棋盘
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 如果该位置有棋子
            if (gameBoard[row][col] !== EMPTY) {
                // 检查周围8个位置
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const r = row + dr;
                        const c = col + dc;
                        
                        // 确保位置在棋盘内且为空
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] === EMPTY) {
                            nearbyPositions.push({ row: r, col: c });
                        }
                    }
                }
            }
        }
    }
    
    // 如果有周围的空位置，随机选择一个
    if (nearbyPositions.length > 0) {
        return nearbyPositions[Math.floor(Math.random() * nearbyPositions.length)];
    }
    
    return null;
}

// 模拟双重威胁 - 双四局面
function findDoubleFourMove(player) {
    console.log("寻找双四移动:", player);
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否形成双四
        let fourCount = 0;
        
        // 检查所有方向
        for (const [dx, dy] of DIRECTIONS) {
            if (checkFour(move.row, move.col, dx, dy, player)) {
                fourCount++;
            }
        }
        
        // 如果形成双四，返回该位置
        if (fourCount >= 2) {
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            console.log(`找到双四移动: (${move.row}, ${move.col})`);
            return move;
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    console.log("未找到双四移动");
    return null;
}

// 模拟四三局面
function findFourThreeMove(player) {
    console.log("寻找四三局面:", player);
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否同时形成活四和活三
        let hasFour = false;
        let hasThree = false;
        
        // 检查所有方向
        for (const [dx, dy] of DIRECTIONS) {
            // 检查是否形成四子
            if (checkFour(move.row, move.col, dx, dy, player)) {
                hasFour = true;
            }
            
            // 检查是否形成三子活棋
            if (checkLiveThree(move.row, move.col, dx, dy, player)) {
                hasThree = true;
            }
            
            // 如果同时形成四子和三子活棋，返回该位置
            if (hasFour && hasThree) {
                // 还原棋盘
                gameBoard[move.row][move.col] = EMPTY;
                
                console.log(`找到四三局面: (${move.row}, ${move.col})`);
                return move;
            }
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    console.log("未找到四三局面");
    return null;
}

// 模拟双三局面
function findDoubleThreeMove(player) {
    console.log("寻找双三局面:", player);
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否形成双三
        let threeCount = 0;
        
        // 检查所有方向
        for (const [dx, dy] of DIRECTIONS) {
            if (checkLiveThree(move.row, move.col, dx, dy, player)) {
                threeCount++;
            }
        }
        
        // 如果形成双三，返回该位置
        if (threeCount >= 2) {
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            console.log(`找到双三局面: (${move.row}, ${move.col})`);
            return move;
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    console.log("未找到双三局面");
    return null;
}

// 使用评分系统选择最佳位置
function findBestPositionByScore() {
    console.log("使用评分系统寻找最佳位置");
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    if (availableMoves.length === 0) {
        console.log("没有可用的移动");
        return null;
    }
    
    // 评估每个位置的分数
    const scoredMoves = availableMoves.map(move => {
        const score = evaluatePosition(move.row, move.col);
        return { ...move, score };
    });
    
    // 按分数降序排序
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // 返回得分最高的位置
    console.log(`最佳评分位置: (${scoredMoves[0].row}, ${scoredMoves[0].col}), 评分: ${scoredMoves[0].score}`);
    return scoredMoves[0];
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
    
    console.log(`选择最佳移动: (${bestMove ? bestMove.row : 'null'}, ${bestMove ? bestMove.col : 'null'}), 评分: ${bestScore}`);
    return bestMove;
}

// 深度搜索
function findBestMoveWithEnhancedSearch() {
    console.log("使用增强版搜索算法寻找最佳移动");
    
    // 这个函数使用更深层次的迭代加深搜索，并使用置换表优化
    const transpositionTable = new Map();
    const bestMove = iterativeDeepeningSearch(6, transpositionTable); // 搜索深度为6
    
    if (bestMove) {
        console.log(`增强版搜索选择位置: (${bestMove.row}, ${bestMove.col})`);
        return bestMove;
    }
    
    console.log("增强版搜索未找到合适的移动");
    return null;
}

// 迭代加深搜索
function iterativeDeepeningSearch(maxDepth, transpositionTable) {
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 从浅到深逐步增加搜索深度
    for (let depth = 1; depth <= maxDepth; depth++) {
        console.log(`迭代加深搜索深度: ${depth}`);
        const result = alphaBetaSearch(depth, -Infinity, Infinity, true, transpositionTable);
        if (result.score > bestScore) {
            bestScore = result.score;
            bestMove = result.move;
            console.log(`深度 ${depth} 找到更好的移动: (${bestMove.row}, ${bestMove.col}), 评分: ${bestScore}`);
        }
    }
    
    return bestMove;
}

// VCT移动 (连贯威胁组合)
function findVCTMove(player) {
    console.log("寻找VCT移动:", player);
    
    // 简化实现：检查是否可以形成多个威胁
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    // 评估每个位置能形成的威胁数量
    const threatMoves = [];
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 计算威胁数量
        const threatCount = countThreats(move.row, move.col, player);
        
        // 如果能形成多个威胁，记录下来
        if (threatCount >= 2) {
            threatMoves.push({
                ...move,
                threatCount
            });
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    // 按威胁数量降序排序
    threatMoves.sort((a, b) => b.threatCount - a.threatCount);
    
    // 返回威胁数量最多的位置
    if (threatMoves.length > 0) {
        console.log(`找到VCT移动: (${threatMoves[0].row}, ${threatMoves[0].col}), 威胁数量: ${threatMoves[0].threatCount}`);
        return threatMoves[0];
    }
    
    console.log("未找到VCT移动");
    return null;
}

// VCF移动 (连续强制胜利)
function findVCFMove(player) {
    console.log("寻找VCF移动:", player);
    
    // 简化实现：检查是否可以形成冲四
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否形成冲四
        let hasForcingMove = false;
        
        for (const [dx, dy] of DIRECTIONS) {
            if (checkFour(move.row, move.col, dx, dy, player)) {
                hasForcingMove = true;
                break;
            }
        }
        
        // 如果形成冲四，检查下一步是否能获胜
        if (hasForcingMove) {
            // 模拟对手防守最佳位置
            // 在实际实现中，这里应该进行更复杂的搜索
            // 简化实现：如果形成冲四，就认为是VCF移动
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            console.log(`找到VCF移动: (${move.row}, ${move.col})`);
            return move;
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    console.log("未找到VCF移动");
    return null;
}

// 神经网络评估
function evaluateWithNeuralNetwork() {
    console.log("使用神经网络评估棋局");
    
    // 在实际项目中，这里会调用预训练的神经网络模型
    // 我们这里使用简化版实现，结合蒙特卡洛树搜索
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    if (availableMoves.length === 0) {
        console.log("没有可用的移动");
        return null;
    }
    
    // 对每个可能的移动进行蒙特卡洛模拟
    const simulatedMoves = availableMoves.map(move => {
        // 进行少量模拟以评估该位置
        const winRate = simulateMCTS(move, 10); // 简化版只模拟10次
        return { ...move, winRate };
    });
    
    // 按胜率降序排序
    simulatedMoves.sort((a, b) => b.winRate - a.winRate);
    
    // 返回胜率最高的位置
    if (simulatedMoves.length > 0) {
        console.log(`神经网络选择的最佳位置: (${simulatedMoves[0].row}, ${simulatedMoves[0].col}), 胜率: ${simulatedMoves[0].winRate}`);
        return simulatedMoves[0];
    }
    
    console.log("神经网络评估未找到合适的移动");
    return null;
}

// 战术移动
function findTacticalMove() {
    console.log("寻找战术移动...");
    
    // 1. 查找阻止玩家战术的着法
    const blockingMove = findBlockingTacticalMoves();
    if (blockingMove) {
        console.log("找到阻止玩家战术的移动:", blockingMove);
        return blockingMove;
    }
    
    // 2. 查找AI自己的活三着法
    const liveThreeMoves = findLiveThreeMoves(PLAYER_WHITE);
    if (liveThreeMoves.length > 0) {
        console.log("找到AI的活三移动:", liveThreeMoves[0]);
        return liveThreeMoves[0];
    }
    
    // 3. 查找AI自己的跳三着法
    const jumpThreeMoves = findJumpThreeMoves(PLAYER_WHITE);
    if (jumpThreeMoves.length > 0) {
        console.log("找到AI的跳三移动:", jumpThreeMoves[0]);
        return jumpThreeMoves[0];
    }
    
    // 4. 查找最佳评分位置
    const bestScoreMove = findBestPositionByScore();
    if (bestScoreMove) {
        console.log("找到最佳评分位置:", bestScoreMove);
        return bestScoreMove;
    }
    
    console.log("未找到战术移动");
    return null;
}

// 开局库
function findOpeningBookMove() {
    // 检查当前的棋局状态
    const boardState = getBoardState();
    
    // 检查是否匹配任何已知的开局模式
    const openingMove = checkOpeningBook(boardState);
    if (openingMove) {
        return openingMove;
    }
    
    return null;
}

// 强化学习
function findMoveWithReinforcementLearning() {
    console.log("使用强化学习模型选择移动");
    
    // 在实际项目中，这里会调用预训练的强化学习模型
    
    // 获取棋盘特征
    const boardFeatures = extractBoardFeatures();
    
    // 生成候选着法并评估
    const candidates = generateCandidateMoves();
    const evaluatedMoves = candidates.map(move => {
        return {
            ...move,
            score: evaluateMoveWithRL(move, boardFeatures)
        };
    });
    
    // 选择得分最高的着法
    evaluatedMoves.sort((a, b) => b.score - a.score);
    
    if (evaluatedMoves.length > 0) {
        console.log(`强化学习选择位置: (${evaluatedMoves[0].row}, ${evaluatedMoves[0].col}), 评分: ${evaluatedMoves[0].score}`);
        return evaluatedMoves[0];
    }
    
    // 如果没有可用移动，返回null
    console.log("没有可用的移动");
    return null;
}

// 评估位置的分数
function evaluatePosition(row, col) {
    let score = 0;
    
    // 中心位置加分
    const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
    score += (7 - centerDistance) * 2;
    
    // 标记点位置加分
    if (MARK_POSITIONS.some(([r, c]) => r === row && c === col)) {
        score += 10;
    }
    
    // 模拟AI放置棋子
    gameBoard[row][col] = PLAYER_WHITE;
    
    // 评估AI的局势
    for (const [dx, dy] of DIRECTIONS) {
        const aiCount = 1 + countConsecutive(row, col, dx, dy, PLAYER_WHITE) + 
                       countConsecutive(row, col, -dx, -dy, PLAYER_WHITE);
        
        // 根据连子数量加分
        if (aiCount === 5) score += 10000;  // 五子连珠
        else if (aiCount === 4) score += 1000;  // 四子连珠
        else if (aiCount === 3) score += 100;   // 三子连珠
        else if (aiCount === 2) score += 10;    // 二子连珠
    }
    
    // 恢复空位置
    gameBoard[row][col] = EMPTY;
    
    // 模拟玩家放置棋子
    gameBoard[row][col] = PLAYER_BLACK;
    
    // 评估玩家的局势（防守得分）
    for (const [dx, dy] of DIRECTIONS) {
        const playerCount = 1 + countConsecutive(row, col, dx, dy, PLAYER_BLACK) + 
                           countConsecutive(row, col, -dx, -dy, PLAYER_BLACK);
        
        // 根据连子数量加分（防守分值略低于进攻）
        if (playerCount === 5) score += 8000;  // 五子连珠
        else if (playerCount === 4) score += 800;  // 四子连珠
        else if (playerCount === 3) score += 80;   // 三子连珠
        else if (playerCount === 2) score += 8;    // 二子连珠
    }
    
    // 恢复空位置
    gameBoard[row][col] = EMPTY;
    
    return score;
}

// 评估整个棋盘的局势
function evaluateBoard() {
    let score = 0;
    
    // 扫描整个棋盘
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                const player = gameBoard[row][col];
                const isAI = player === PLAYER_WHITE;
                
                // 对每个方向进行评估
                for (const [dx, dy] of DIRECTIONS) {
                    // 只评估每个连续序列一次
                    if (
                        row - dx < 0 || row - dx >= BOARD_SIZE || 
                        col - dy < 0 || col - dy >= BOARD_SIZE || 
                        gameBoard[row - dx][col - dy] !== player
                    ) {
                        let count = 1;
                        let blocked = 0;
                        
                        // 计算连续棋子数量
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
                        
                        // 检查是否被阻挡
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] !== EMPTY) {
                            blocked++;
                        }
                        
                        r = row - dx;
                        c = col - dy;
                        
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] !== EMPTY && gameBoard[r][c] !== player) {
                            blocked++;
                        }
                        
                        // 根据连子数量和是否被阻挡计算分数
                        let patternScore = 0;
                        
                        if (count >= 5) {
                            patternScore = 100000;  // 五子连珠
                        } else if (count === 4) {
                            patternScore = blocked === 0 ? 10000 : 1000;  // 活四/冲四
                        } else if (count === 3) {
                            patternScore = blocked === 0 ? 1000 : 100;    // 活三/冲三
                        } else if (count === 2) {
                            patternScore = blocked === 0 ? 100 : 10;      // 活二/冲二
                        } else {
                            patternScore = 1;
                        }
                        
                        // AI得分为正，玩家得分为负
                        score += isAI ? patternScore : -patternScore;
                    }
                }
            }
        }
    }
    
    return score;
}

// 高级棋盘评估函数
function evaluateBoardAdvanced() {
    let score = 0;
    
    // 1. 基本评分 - 与evaluateBoard相同的逻辑
    score += evaluateBoard() * 0.7;  // 权重为0.7
    
    // 2. 棋形评分 - 识别和评估特定的棋形
    score += evaluatePatterns() * 0.3;  // 权重为0.3
    
    return score;
}

// 评估棋盘上的棋形
function evaluatePatterns() {
    let score = 0;
    
    // 扫描整个棋盘寻找特定棋形
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                const player = gameBoard[row][col];
                const isAI = player === PLAYER_WHITE;
                
                // 对每个方向进行评估
                for (const [dx, dy] of DIRECTIONS) {
                    // 只评估每个连续序列一次
                    if (
                        row - dx < 0 || row - dx >= BOARD_SIZE || 
                        col - dy < 0 || col - dy >= BOARD_SIZE || 
                        gameBoard[row - dx][col - dy] !== player
                    ) {
                        // 获取该方向上的棋形
                        const pattern = getPatternInDirection(row, col, dx, dy, player);
                        
                        // 评估棋形分数
                        const patternScore = evaluateSpecificPattern(pattern, isAI);
                        
                        // 累加分数
                        score += patternScore;
                    }
                }
            }
        }
    }
    
    return score;
}

// 获取指定方向上的棋形
function getPatternInDirection(row, col, dx, dy, player) {
    let pattern = '';
    
    // 向反方向扩展
    let r = row - dx;
    let c = col - dy;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (gameBoard[r][c] === player) {
            pattern = 'X' + pattern;
        } else if (gameBoard[r][c] === EMPTY) {
            pattern = '.' + pattern;
            break;
        } else {
            pattern = 'O' + pattern;
            break;
        }
        r -= dx;
        c -= dy;
    }
    
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        pattern = '#' + pattern;  // 边界
    }
    
    // 中心点
    pattern += 'X';
    
    // 向正方向扩展
    r = row + dx;
    c = col + dy;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
        if (gameBoard[r][c] === player) {
            pattern += 'X';
        } else if (gameBoard[r][c] === EMPTY) {
            pattern += '.';
            break;
        } else {
            pattern += 'O';
            break;
        }
        r += dx;
        c += dy;
    }
    
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        pattern += '#';  // 边界
    }
    
    return pattern;
}

// 评估特定棋形的分数
function evaluateSpecificPattern(pattern, isAI) {
    // 棋形分数表
    const patternScores = {
        // 活四
        '.XXXX.': 10000,
        // 冲四
        '.XXXX#': 1000, '#XXXX.': 1000, '.XXXOX': 1000, 'XO.XXX': 1000,
        // 活三
        '.XXX..': 1000, '..XXX.': 1000, '.X.XX.': 800, '.XX.X.': 800,
        // 冲三
        '.XXX.O': 100, 'O.XXX.': 100, '#.XXX.': 100, '.XXX.#': 100,
        // 活二
        '..XX..': 100, '.X.X..': 80, '..X.X.': 80,
        // 冲二
        '..XX.O': 10, 'O.XX..': 10, '#.XX..': 10, '..XX.#': 10
    };
    
    // 检查棋形是否在分数表中
    let score = patternScores[pattern] || 0;
    
    // AI得分为正，玩家得分为负
    return isAI ? score : -score;
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否有玩家获胜
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const player = gameBoard[row][col];
            if (player !== EMPTY) {
                for (const [dx, dy] of DIRECTIONS) {
                    let count = 1;
                    
                    // 正方向检查
                    count += countConsecutive(row, col, dx, dy, player);
                    // 反方向检查
                    count += countConsecutive(row, col, -dx, -dy, player);
                    
                    // 如果连续五子，则游戏结束
                    if (count >= 5) {
                        return true;
                    }
                }
            }
        }
    }
    
    // 检查棋盘是否已满
    return gameBoard.every(row => row.every(cell => cell !== EMPTY));
}

// 获取所有可用的移动
function getAvailableMoves() {
    const moves = [];
    
    // 只考虑已有棋子周围的空位置，以减少搜索空间
    const visited = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(false));
    
    // 扫描整个棋盘
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 如果该位置有棋子
            if (gameBoard[row][col] !== EMPTY) {
                // 检查周围8个位置
                for (let dr = -2; dr <= 2; dr++) {
                    for (let dc = -2; dc <= 2; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        
                        const r = row + dr;
                        const c = col + dc;
                        
                        // 确保位置在棋盘内且为空且未被访问过
                        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && 
                            gameBoard[r][c] === EMPTY && !visited[r][c]) {
                            moves.push({ row: r, col: c });
                            visited[r][c] = true;
                        }
                    }
                }
            }
        }
    }
    
    // 如果没有找到移动（棋盘为空或所有棋子周围都被占用），返回中心位置
    if (moves.length === 0 && gameBoard[7][7] === EMPTY) {
        return [{ row: 7, col: 7 }];
    }
    
    return moves;
}

// 获取带有历史启发的可用移动
function getAvailableMovesWithHistory(isMaximizing) {
    const moves = getAvailableMoves();
    
    // 根据历史表对移动进行排序
    moves.sort((a, b) => {
        return historyTable[b.row][b.col] - historyTable[a.row][a.col];
    });
    
    return moves;
}

// 历史启发表 - 记录每个位置的历史得分
const historyTable = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));

// 带有历史启发的极小化极大算法
function minimaxWithHistory(depth, isMaximizing, alpha, beta) {
    // 如果达到最大深度或游戏结束，评估局势
    if (depth === 0 || isGameOver()) {
        return evaluateBoardAdvanced();
    }
    
    // 获取所有可能的移动并根据历史表排序
    const availableMoves = getAvailableMovesWithHistory(isMaximizing);
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        let bestMove = null;
        
        for (const move of availableMoves) {
            // 模拟落子
            gameBoard[move.row][move.col] = PLAYER_WHITE;
            
            // 递归评估
            const evaluation = minimaxWithHistory(depth - 1, false, alpha, beta);
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最大值
            if (evaluation > maxEval) {
                maxEval = evaluation;
                bestMove = move;
            }
            
            // Alpha-Beta剪枝
            alpha = Math.max(alpha, maxEval);
            if (beta <= alpha) {
                break;
            }
        }
        
        return maxEval;
    } else {
        let minEval = Infinity;
        let bestMove = null;
        
        for (const move of availableMoves) {
            // 模拟落子
            gameBoard[move.row][move.col] = PLAYER_BLACK;
            
            // 递归评估
            const evaluation = minimaxWithHistory(depth - 1, true, alpha, beta);
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最小值
            if (evaluation < minEval) {
                minEval = evaluation;
                bestMove = move;
            }
            
            // Alpha-Beta剪枝
            beta = Math.min(beta, minEval);
            if (beta <= alpha) {
                break;
            }
        }
        
        return minEval;
    }
}

// 获取棋盘状态的哈希表示
function getBoardState() {
    // 简单实现：将棋盘转换为字符串
    let state = '';
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            state += gameBoard[row][col];
        }
    }
    return state;
}

// 使用开局库
function checkOpeningBook(boardState) {
    // 在实际项目中，这里会有一个数据库查询
    // 我们这里使用一些常见的开局策略
    
    // 检查是否是空棋盘（开局第一步）
    let isEmpty = true;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                isEmpty = false;
                break;
            }
        }
        if (!isEmpty) break;
    }
    
    if (isEmpty) {
        // 空棋盘，下在中心点
        return { row: 7, col: 7 };
    }
    
    // 检查是否是开局第二步（只有一个黑棋）
    let blackCount = 0;
    let blackPos = null;
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === PLAYER_BLACK) {
                blackCount++;
                blackPos = { row, col };
            } else if (gameBoard[row][col] === PLAYER_WHITE) {
                // 如果已经有白棋，就不是第二步了
                blackCount = -1;
                break;
            }
        }
        if (blackCount > 1 || blackCount === -1) break;
    }
    
    if (blackCount === 1) {
        // 开局第二步，通常在黑棋附近下
        const nearPositions = [
            { row: blackPos.row - 1, col: blackPos.col - 1 },
            { row: blackPos.row - 1, col: blackPos.col + 1 },
            { row: blackPos.row + 1, col: blackPos.col - 1 },
            { row: blackPos.row + 1, col: blackPos.col + 1 }
        ];
        
        // 筛选有效位置
        const validPositions = nearPositions.filter(pos => 
            pos.row >= 0 && pos.row < BOARD_SIZE && 
            pos.col >= 0 && pos.col < BOARD_SIZE &&
            gameBoard[pos.row][pos.col] === EMPTY
        );
        
        if (validPositions.length > 0) {
            // 随机选择一个有效的位置
            return validPositions[Math.floor(Math.random() * validPositions.length)];
        }
    }
    
    // 没有匹配的开局策略
    return null;
}

// 提取棋盘特征
function extractBoardFeatures() {
    // 这里应该提取各种棋盘特征，如棋型分布、威胁等
    // 简化实现
    const features = {
        pieceCount: 0,
        centerControl: 0,
        threats: {
            black: 0,
            white: 0
        }
    };
    
    // 统计棋子数量
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                features.pieceCount++;
                
                // 计算中心控制
                const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
                if (centerDistance < 5) {
                    if (gameBoard[row][col] === PLAYER_BLACK) {
                        features.centerControl -= 1;
                    } else {
                        features.centerControl += 1;
                    }
                }
                
                // 计算威胁
                if (gameBoard[row][col] === PLAYER_BLACK) {
                    features.threats.black += countThreats(row, col, PLAYER_BLACK);
                } else {
                    features.threats.white += countThreats(row, col, PLAYER_WHITE);
                }
            }
        }
    }
    
    return features;
}

// 使用强化学习评估着法
function evaluateMoveWithRL(move, boardFeatures) {
    // 简化实现，基于一些启发式规则
    
    // 基础分数
    let score = 100;
    
    // 模拟落子
    gameBoard[move.row][move.col] = PLAYER_WHITE;
    
    // 检查是否能形成威胁
    const threatScore = countThreats(move.row, move.col, PLAYER_WHITE) * 20;
    score += threatScore;
    
    // 检查中心控制
    const centerDistance = Math.sqrt(Math.pow(move.row - 7, 2) + Math.pow(move.col - 7, 2));
    score -= centerDistance * 5;
    
    // 检查防守价值
    const defensiveValue = evaluateDefensiveValue(move);
    score += defensiveValue;
    
    // 还原棋盘
    gameBoard[move.row][move.col] = EMPTY;
    
    return score;
}

// 评估防守价值
function evaluateDefensiveValue(move) {
    let value = 0;
    
    // 模拟对手在此处落子
    gameBoard[move.row][move.col] = PLAYER_BLACK;
    
    // 检查对手在此处落子是否能形成威胁
    const threatCount = countThreats(move.row, move.col, PLAYER_BLACK);
    value += threatCount * 15;
    
    // 还原棋盘
    gameBoard[move.row][move.col] = EMPTY;
    
    return value;
}

// 计算着法产生的威胁数量
function countThreats(row, col, player) {
    let threatCount = 0;
    
    // 检查各个方向
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    for (const [dx, dy] of directions) {
        // 检查是否形成活三
        if (checkLiveThree(row, col, dx, dy, player)) {
            threatCount += 3;
        }
        
        // 检查是否形成冲四
        if (checkFour(row, col, dx, dy, player)) {
            threatCount += 4;
        }
    }
    
    return threatCount;
} 

// 复制棋盘状态
function copyBoard(board) {
    const newBoard = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
        newBoard[row] = [...board[row]];
    }
    return newBoard;
}

// 检查特定模式
function checkPattern(row, col, dx, dy, pattern) {
    const centerIndex = Math.floor(pattern.length / 2);
    const startRow = row - dx * centerIndex;
    const startCol = col - dy * centerIndex;
    
    for (let i = 0; i < pattern.length; i++) {
        const checkRow = startRow + dx * i;
        const checkCol = startCol + dy * i;
        
        // 检查是否超出边界
        if (checkRow < 0 || checkRow >= BOARD_SIZE || checkCol < 0 || checkCol >= BOARD_SIZE) {
            return false;
        }
        
        // 检查模式是否匹配
        if (gameBoard[checkRow][checkCol] !== pattern[i]) {
            return false;
        }
    }
    
    return true;
}

// 查找活三着法
function findLiveThreeMoves(player) {
    const liveThrees = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟落子
                gameBoard[row][col] = player;
                
                // 检查是否形成活三
                if (hasLiveThree(row, col, player)) {
                    liveThrees.push({ 
                        row, 
                        col, 
                        score: evaluateLiveThreeScore(row, col, player)
                    });
                }
                
                // 还原棋盘
                gameBoard[row][col] = EMPTY;
            }
        }
    }
    
    // 按评分排序
    liveThrees.sort((a, b) => b.score - a.score);
    return liveThrees;
}

// 检查是否有活三
function hasLiveThree(row, col, player) {
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    for (const [dx, dy] of directions) {
        if (checkLiveThree(row, col, dx, dy, player)) {
            return true;
        }
    }
    
    return false;
}

// 检查特定方向上是否有活三
function checkLiveThree(row, col, dx, dy, player) {
    // 活三模式: _XXX_ (两端都是空的连续三个棋子)
    return checkPattern(row, col, dx, dy, [EMPTY, player, player, player, EMPTY]);
}

// 评估活三得分
function evaluateLiveThreeScore(row, col, player) {
    // 基础分
    let score = 80;
    
    // 检查这个位置是否同时形成多个活三
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    let liveThreeCount = 0;
    
    for (const [dx, dy] of directions) {
        if (checkLiveThree(row, col, dx, dy, player)) {
            liveThreeCount++;
        }
    }
    
    // 多个方向的活三会获得额外分数
    score += liveThreeCount * 40;
    
    // 靠近棋盘中心的位置得分更高
    const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
    score -= centerDistance * 5;
    
    return score;
}

// 查找阻止玩家战术的着法
function findBlockingTacticalMoves() {
    // 查找玩家可能的跳三
    const opponentJumpThrees = findJumpThreeMoves(PLAYER_BLACK);
    if (opponentJumpThrees.length > 0) {
        return opponentJumpThrees[0];
    }
    
    // 查找玩家可能的活三
    const opponentLiveThrees = findLiveThreeMoves(PLAYER_BLACK);
    if (opponentLiveThrees.length > 0) {
        return opponentLiveThrees[0];
    }
    
    return null;
}

// 检查四子情况
function checkFour(row, col, dx, dy, player) {
    // 冲四模式: XXXX_ 或 _XXXX 或 XX_XX
    return checkPattern(row, col, dx, dy, [player, player, player, player, EMPTY]) ||
           checkPattern(row, col, dx, dy, [EMPTY, player, player, player, player]) ||
           checkPattern(row, col, dx, dy, [player, player, EMPTY, player, player]);
}

// 蒙特卡洛树搜索模拟
function simulateMCTS(move, simulations) {
    let wins = 0;
    
    // 保存当前棋盘状态
    const originalBoard = copyBoard(gameBoard);
    
    // 进行多次模拟
    for (let i = 0; i < simulations; i++) {
        // 复制当前棋盘
        gameBoard = copyBoard(originalBoard);
        
        // 模拟AI落子
        gameBoard[move.row][move.col] = PLAYER_WHITE;
        
        // 如果这一步获胜，记录为赢
        if (checkWin(move.row, move.col)) {
            wins++;
            gameBoard = originalBoard;
            continue;
        }
        
        // 模拟随机对弈直到游戏结束
        let currentPlayer = PLAYER_BLACK;
        let gameEnded = false;
        let moveCount = 0;
        const maxMoves = 30; // 限制模拟的最大步数
        
        while (!gameEnded && moveCount < maxMoves) {
            // 找到所有可下的位置
            const availableMoves = [];
            for (let r = 0; r < BOARD_SIZE; r++) {
                for (let c = 0; c < BOARD_SIZE; c++) {
                    if (gameBoard[r][c] === EMPTY) {
                        availableMoves.push({ row: r, col: c });
                    }
                }
            }
            
            if (availableMoves.length === 0) {
                gameEnded = true;
                break;
            }
            
            // 随机选择一个位置
            const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            gameBoard[randomMove.row][randomMove.col] = currentPlayer;
            
            // 检查是否获胜
            if (checkWin(randomMove.row, randomMove.col)) {
                gameEnded = true;
                // 如果AI获胜，记录为赢
                if (currentPlayer === PLAYER_WHITE) {
                    wins++;
                }
            }
            
            // 切换玩家
            currentPlayer = currentPlayer === PLAYER_BLACK ? PLAYER_WHITE : PLAYER_BLACK;
            moveCount++;
        }
        
        // 如果达到最大步数，根据棋盘评估结果决定胜负
        if (!gameEnded) {
            const boardEvaluation = evaluateBoard();
            if (boardEvaluation > 0) {
                wins += 0.5; // AI有优势，算半个胜利
            }
        }
        
        // 还原原始棋盘
        gameBoard = originalBoard;
    }
    
    // 返回胜率作为得分
    return wins / simulations;
}

// 棋盘评估函数
function evaluateBoard() {
    let score = 0;
    
    // 统计各种棋型
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === PLAYER_WHITE) {
                score += evaluatePosition(row, col, PLAYER_WHITE);
            } else if (gameBoard[row][col] === PLAYER_BLACK) {
                score -= evaluatePosition(row, col, PLAYER_BLACK);
            }
        }
    }
    
    return score;
}

// 评估特定位置的价值
function evaluatePosition(row, col, player) {
    let score = 1; // 基础分
    
    // 检查各个方向
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    for (const [dx, dy] of directions) {
        const consecutiveCount = getConsecutiveCount(row, col, dx, dy, player);
        
        // 根据连续棋子数量评分
        switch (consecutiveCount) {
            case 5: // 五连胜
                return 100000;
            case 4: // 四连
                score += 10000;
                break;
            case 3: // 三连
                score += 100;
                break;
            case 2: // 二连
                score += 10;
                break;
            default:
                break;
        }
    }
    
    return score;
}

// 获取连续棋子数量
function getConsecutiveCount(row, col, dx, dy, player) {
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || gameBoard[r][c] !== player) {
            break;
        }
        
        count++;
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || gameBoard[r][c] !== player) {
            break;
        }
        
        count++;
    }
    
    return count;
}

// 检查指定位置是否获胜
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
            return true;
        }
    }
    
    return false;
}

// Alpha-Beta剪枝搜索
function alphaBetaSearch(depth, alpha, beta, isMaximizingPlayer, transpositionTable) {
    // 如果到达叶节点或者达到最大深度，评估棋盘
    if (depth === 0) {
        return { 
            score: evaluateBoard(),
            move: null 
        };
    }
    
    // 生成所有可能的着法
    const moves = generateCandidateMoves();
    
    // 如果没有可用着法，返回当前棋盘评估
    if (moves.length === 0) {
        return { 
            score: evaluateBoard(),
            move: null 
        };
    }
    
    let bestMove = null;
    
    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        
        for (const move of moves) {
            // 模拟着法
            gameBoard[move.row][move.col] = PLAYER_WHITE;
            
            // 递归评估
            const boardKey = getBoardState();
            let evaluation;
            
            if (transpositionTable.has(boardKey)) {
                evaluation = transpositionTable.get(boardKey);
            } else {
                evaluation = alphaBetaSearch(depth - 1, alpha, beta, false, transpositionTable).score;
                transpositionTable.set(boardKey, evaluation);
            }
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最大值
            if (evaluation > maxEval) {
                maxEval = evaluation;
                bestMove = move;
            }
            
            // Alpha值更新
            alpha = Math.max(alpha, maxEval);
            
            // Beta剪枝
            if (beta <= alpha) {
                break;
            }
        }
        
        return { score: maxEval, move: bestMove };
    } else {
        let minEval = Infinity;
        
        for (const move of moves) {
            // 模拟着法
            gameBoard[move.row][move.col] = PLAYER_BLACK;
            
            // 递归评估
            const boardKey = getBoardState();
            let evaluation;
            
            if (transpositionTable.has(boardKey)) {
                evaluation = transpositionTable.get(boardKey);
            } else {
                evaluation = alphaBetaSearch(depth - 1, alpha, beta, true, transpositionTable).score;
                transpositionTable.set(boardKey, evaluation);
            }
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最小值
            if (evaluation < minEval) {
                minEval = evaluation;
                bestMove = move;
            }
            
            // Beta值更新
            beta = Math.min(beta, minEval);
            
            // Alpha剪枝
            if (beta <= alpha) {
                break;
            }
        }
        
        return { score: minEval, move: bestMove };
    }
}

// 生成候选移动列表
function generateCandidateMoves() {
    // 使用已有的getAvailableMoves函数获取可用移动
    return getAvailableMoves();
}

// 查找跳三着法
function findJumpThreeMoves(player) {
    const jumpThrees = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 模拟落子
                gameBoard[row][col] = player;
                
                // 检查是否形成跳三
                if (hasJumpThree(row, col, player)) {
                    jumpThrees.push({ 
                        row, 
                        col, 
                        score: evaluateJumpThreeScore(row, col, player)
                    });
                }
                
                // 还原棋盘
                gameBoard[row][col] = EMPTY;
            }
        }
    }
    
    // 按评分排序
    jumpThrees.sort((a, b) => b.score - a.score);
    return jumpThrees;
}

// 检查是否有跳三
function hasJumpThree(row, col, player) {
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    for (const [dx, dy] of directions) {
        if (checkJumpThree(row, col, dx, dy, player)) {
            return true;
        }
    }
    
    return false;
}

// 检查特定方向上是否有跳三
function checkJumpThree(row, col, dx, dy, player) {
    // 跳三模式: X_XX 或 XX_X (中间有一个空位的连续三个棋子)
    return checkPattern(row, col, dx, dy, [player, EMPTY, player, player]) ||
           checkPattern(row, col, dx, dy, [player, player, EMPTY, player]);
}

// 评估跳三得分
function evaluateJumpThreeScore(row, col, player) {
    // 基础分
    let score = 70;
    
    // 检查这个位置是否同时形成多个跳三
    const directions = [
        [0, 1],  // 水平
        [1, 0],  // 垂直
        [1, 1],  // 右下对角
        [1, -1]  // 左下对角
    ];
    
    let jumpThreeCount = 0;
    
    for (const [dx, dy] of directions) {
        if (checkJumpThree(row, col, dx, dy, player)) {
            jumpThreeCount++;
        }
    }
    
    // 多个方向的跳三会获得额外分数
    score += jumpThreeCount * 35;
    
    // 靠近棋盘中心的位置得分更高
    const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
    score -= centerDistance * 4;
    
    return score;
}

// 使用迭代加深搜索
function findBestMoveWithIterativeDeepening() {
    console.log("使用迭代加深搜索寻找最佳移动");
    
    // 使用置换表优化搜索
    const transpositionTable = new Map();
    
    // 从深度1开始，逐步增加搜索深度
    let bestMove = null;
    let bestScore = -Infinity;
    
    // 最大搜索深度为4（实际项目中可以更深）
    for (let depth = 1; depth <= 4; depth++) {
        console.log(`搜索深度: ${depth}`);
        
        // 使用Alpha-Beta剪枝搜索
        const result = alphaBetaSearch(depth, -Infinity, Infinity, true, transpositionTable);
        
        if (result.move) {
            bestMove = result.move;
            bestScore = result.score;
            console.log(`深度 ${depth} 的最佳移动: (${bestMove.row}, ${bestMove.col}), 评分: ${bestScore}`);
        } else {
            console.log(`深度 ${depth} 未找到有效移动`);
        }
    }
    
    if (bestMove) {
        console.log(`迭代加深搜索的最终选择: (${bestMove.row}, ${bestMove.col}), 评分: ${bestScore}`);
        return bestMove;
    }
    
    // 如果搜索失败，退回到简单策略
    console.log("迭代加深搜索失败，使用备用策略");
    const nearbyMove = findNearbyMove();
    if (nearbyMove) {
        return nearbyMove;
    }
    
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    if (availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }
    
    return null;
}