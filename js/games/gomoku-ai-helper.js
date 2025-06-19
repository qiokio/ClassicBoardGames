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

// 神经网络评估
// function evaluateWithNeuralNetwork() { ... }

// 战术移动
// function findTacticalMove() { ... }

// 开局库
// function findOpeningBookMove() { ... }

// 强化学习
// function findMoveWithReinforcementLearning() { ... }

// 迭代加深搜索
// function findBestMoveWithIterativeDeepening() { ... }

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

// 检查是否形成连续四子
function checkFour(row, col, dx, dy, player) {
    // 从该位置向指定方向检查连续四子
    let count = 1; // 当前位置已经有一个棋子
    
    // 沿着方向检查
    for (let step = 1; step <= 4; step++) {
        const r = row + dx * step;
        const c = col + dy * step;
        
        // 超出边界或不是指定玩家的棋子，跳出循环
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || gameBoard[r][c] !== player) {
            break;
        }
        
        count++;
    }
    
    // 沿着反方向检查
    for (let step = 1; step <= 4; step++) {
        const r = row - dx * step;
        const c = col - dy * step;
        
        // 超出边界或不是指定玩家的棋子，跳出循环
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE || gameBoard[r][c] !== player) {
            break;
        }
        
        count++;
    }
    
    // 如果总数达到4，则形成连续四子
    return count >= 4;
}

// 检查是否形成活三（两端都是空格的连续三子）
function checkLiveThree(row, col, dx, dy, player) {
    // 获取这个方向的模式
    const pattern = getPatternInDirection(row, col, dx, dy, player);
    
    // 检查是否是活三模式
    // 活三模式: _XXX_ (两端都是空格的连续三子)
    return pattern === `${EMPTY}${player}${player}${player}${EMPTY}`;
}

// 检查特定模式
function checkPattern(row, col, dx, dy, pattern) {
    const length = pattern.length;
    
    // 检查是否能放置模式（是否超出边界）
    for (let i = 0; i < length; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
            return false;
        }
    }
    
    // 检查是否匹配模式
    for (let i = 0; i < length; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        
        if (gameBoard[r][c] !== pattern[i]) {
            return false;
        }
    }
    
    return true;
}