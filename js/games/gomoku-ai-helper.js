// 五子棋AI辅助函数

// 寻找获胜移动
function findWinningMove(player) {
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
                    return { row, col };
                }
            }
        }
    }
    
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
            return move;
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    return null;
}

// 模拟四三局面
function findFourThreeMove(player) {
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
                return move;
            }
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    return null;
}

// 模拟双三局面
function findDoubleThreeMove(player) {
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
            return move;
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
    }
    
    return null;
}

// 使用评分系统寻找最佳位置
function findBestPositionByScore() {
    let bestScore = -Infinity;
    let bestPosition = null;
    
    // 遍历所有空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 评估该位置的分数
                const score = evaluatePosition(row, col);
                
                // 更新最佳位置
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = { row, col };
                }
            }
        }
    }
    
    return bestPosition;
}

// 使用高级评分系统寻找最佳位置
function findBestPositionByAdvancedScore() {
    let bestScore = -Infinity;
    let bestPosition = null;
    
    // 遍历所有空位置
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                // 评估该位置的高级分数
                const score = evaluatePositionAdvanced(row, col);
                
                // 更新最佳位置
                if (score > bestScore) {
                    bestScore = score;
                    bestPosition = { row, col };
                }
            }
        }
    }
    
    return bestPosition;
}

// 评估位置分数
function evaluatePosition(row, col) {
    // 如果该位置周围没有棋子，分数较低
    if (!hasNeighbor(row, col, 2)) {
        return 0;
    }
    
    // 模拟AI在该位置落子
    gameBoard[row][col] = PLAYER_WHITE;
    const aiScore = evaluateBoard();
    
    // 模拟玩家在该位置落子
    gameBoard[row][col] = PLAYER_BLACK;
    const playerScore = evaluateBoard();
    
    // 恢复空位置
    gameBoard[row][col] = EMPTY;
    
    // 综合考虑进攻和防守
    return aiScore * 1.1 + playerScore;
}

// 高级位置评估
function evaluatePositionAdvanced(row, col) {
    // 如果该位置周围没有棋子，分数较低
    if (!hasNeighbor(row, col, 2)) {
        return 0;
    }
    
    // 模拟AI在该位置落子
    gameBoard[row][col] = PLAYER_WHITE;
    const aiScore = evaluateBoardAdvanced();
    
    // 模拟玩家在该位置落子
    gameBoard[row][col] = PLAYER_BLACK;
    const playerScore = evaluateBoardAdvanced();
    
    // 恢复空位置
    gameBoard[row][col] = EMPTY;
    
    // 综合考虑进攻和防守，加入位置价值
    return aiScore * 1.1 + playerScore + getPositionValue(row, col);
}

// 为特定玩家评估位置
function evaluatePositionForPlayer(row, col, player) {
    let score = 0;
    
    // 检查8个方向
    for (const [dx, dy] of DIRECTIONS) {
        // 正方向
        score += evaluateDirectionForPlayer(row, col, dx, dy, player);
        // 反方向
        score += evaluateDirectionForPlayer(row, col, -dx, -dy, player);
    }
    
    return score;
}

// 评估特定方向的分数
function evaluateDirectionForPlayer(row, col, dx, dy, player) {
    const pattern = getPatternInDirection(row, col, dx, dy, player);
    return evaluatePattern(pattern, player === PLAYER_WHITE);
}

// 评估棋盘整体分数
function evaluateBoard() {
    return evaluatePatterns();
}

// 高级棋盘评估
function evaluateBoardAdvanced() {
    // 基础模式评分
    const baseScore = evaluatePatterns();
    
    // 加入位置控制评分
    const controlScore = evaluatePositionControl();
    
    // 加入威胁评分
    const threatScore = evaluateThreatPatterns();
    
    return baseScore + controlScore + threatScore;
}

// 评估棋型分数
function evaluatePatterns() {
    let aiScore = 0;
    let playerScore = 0;
    
    // 遍历所有棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                const isAI = gameBoard[row][col] === PLAYER_WHITE;
                
                // 检查4个方向
                for (const [dx, dy] of DIRECTIONS) {
                    // 只检查每个连续棋型的起点
                    if (!isStartOfLine(row, col, -dx, -dy, gameBoard[row][col])) {
                        const pattern = getPatternInDirection(row, col, dx, dy, gameBoard[row][col]);
                        const score = evaluatePattern(pattern, isAI);
                        
                        if (isAI) {
                            aiScore += score;
                        } else {
                            playerScore += score;
                        }
                    }
                }
            }
        }
    }
    
    return aiScore - playerScore;
}

// 评估位置控制
function evaluatePositionControl() {
    let score = 0;
    
    // 计算关键位置的控制情况
    const centerControl = countPiecesInArea(5, 5, 9, 9, PLAYER_WHITE) - 
                         countPiecesInArea(5, 5, 9, 9, PLAYER_BLACK);
    
    // 计算边缘控制
    const edgeControl = countPiecesInArea(0, 0, 14, 4, PLAYER_WHITE) +
                       countPiecesInArea(0, 10, 14, 14, PLAYER_WHITE) + 
                       countPiecesInArea(0, 0, 4, 14, PLAYER_WHITE) +
                       countPiecesInArea(10, 0, 14, 14, PLAYER_WHITE) -
                       (countPiecesInArea(0, 0, 14, 4, PLAYER_BLACK) +
                       countPiecesInArea(0, 10, 14, 14, PLAYER_BLACK) + 
                       countPiecesInArea(0, 0, 4, 14, PLAYER_BLACK) +
                       countPiecesInArea(10, 0, 14, 14, PLAYER_BLACK));
    
    score += centerControl * 10; // 中心控制更重要
    score += edgeControl * 5;    // 边缘控制也有价值
    
    return score;
}

// 计算区域内特定玩家的棋子数量
function countPiecesInArea(startRow, startCol, endRow, endCol, player) {
    let count = 0;
    
    for (let row = startRow; row <= endRow; row++) {
        for (let col = startCol; col <= endCol; col++) {
            if (gameBoard[row][col] === player) {
                count++;
            }
        }
    }
    
    return count;
}

// 评估威胁棋型
function evaluateThreatPatterns() {
    let score = 0;
    
    // 检查AI的跳活三
    const aiJumpThrees = countPatternOccurrences(PLAYER_WHITE, "EMPTY,PLAYER,PLAYER,EMPTY,PLAYER,EMPTY");
    score += aiJumpThrees * 50;
    
    // 检查玩家的跳活三
    const playerJumpThrees = countPatternOccurrences(PLAYER_BLACK, "EMPTY,PLAYER,PLAYER,EMPTY,PLAYER,EMPTY");
    score -= playerJumpThrees * 60; // 防守权重更高
    
    // 检查AI的连活三
    const aiLiveThrees = countPatternOccurrences(PLAYER_WHITE, "EMPTY,PLAYER,PLAYER,PLAYER,EMPTY");
    score += aiLiveThrees * 80;
    
    // 检查玩家的连活三
    const playerLiveThrees = countPatternOccurrences(PLAYER_BLACK, "EMPTY,PLAYER,PLAYER,PLAYER,EMPTY");
    score -= playerLiveThrees * 90;
    
    return score;
}

// 计算特定棋型的出现次数
function countPatternOccurrences(player, patternStr) {
    const pattern = patternStr.split(',').map(item => 
        item === 'PLAYER' ? player : 
        item === 'EMPTY' ? EMPTY : 
        item === 'OPPONENT' ? (player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE) : 
        item
    );
    
    let count = 0;
    
    // 遍历所有可能的起点
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            // 检查4个方向
            for (const [dx, dy] of DIRECTIONS) {
                if (matchesPattern(row, col, dx, dy, pattern)) {
                    count++;
                }
            }
        }
    }
    
    return count;
}

// 检查是否匹配特定棋型
function matchesPattern(row, col, dx, dy, pattern) {
    for (let i = 0; i < pattern.length; i++) {
        const r = row + i * dx;
        const c = col + i * dy;
        
        // 检查边界
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
            return false;
        }
        
        // 检查棋子是否匹配
        if (pattern[i] !== gameBoard[r][c]) {
            return false;
        }
    }
    
    return true;
}

// 获取特定方向的棋型
function getPatternInDirection(row, col, dx, dy, player) {
    let pattern = '';
    let count = 0;
    
    // 最多检查6个位置（足够评估五子连珠相关的棋型）
    for (let i = 0; i < 6; i++) {
        const r = row + i * dx;
        const c = col + i * dy;
        
        // 检查边界
        if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
            pattern += 'X'; // 边界外用X表示
            continue;
        }
        
        // 根据棋子类型添加到棋型中
        if (gameBoard[r][c] === EMPTY) {
            pattern += '.';
        } else if (gameBoard[r][c] === player) {
            pattern += 'O';
            count++;
        } else {
            pattern += 'X';
        }
    }
    
    return pattern;
}

// 评估特定棋型的分数
function evaluatePattern(pattern, isAI) {
    // 五子连珠
    if (pattern.includes('OOOOO')) return isAI ? 100000 : -100000;
    
    // 活四
    if (pattern.includes('.OOOO.')) return isAI ? 10000 : -10000;
    
    // 冲四
    if (pattern.includes('XOOOO.') || pattern.includes('.OOOOX') || 
        pattern.includes('OOO.O') || pattern.includes('OO.OO') || 
        pattern.includes('O.OOO')) return isAI ? 1000 : -1000;
    
    // 活三
    if (pattern.includes('.OOO..') || pattern.includes('..OOO.') || 
        pattern.includes('.O.OO.') || pattern.includes('.OO.O.')) return isAI ? 500 : -500;
    
    // 眠三
    if (pattern.includes('XOOO..') || pattern.includes('..OOOX') || 
        pattern.includes('XO.OO.') || pattern.includes('.OO.OX') || 
        pattern.includes('XOO.O.') || pattern.includes('.O.OOX')) return isAI ? 100 : -100;
    
    // 活二
    if (pattern.includes('..OO..') || pattern.includes('.O.O..') || 
        pattern.includes('..O.O.')) return isAI ? 50 : -50;
    
    // 眠二
    if (pattern.includes('X.OO..') || pattern.includes('..OO.X') || 
        pattern.includes('XO.O..') || pattern.includes('..O.OX')) return isAI ? 10 : -10;
    
    // 活一
    if (pattern.includes('...O...')) return isAI ? 5 : -5;
    
    return 0;
}

// 检查棋型：活四
function checkFour(row, col, dx, dy, player) {
    // 获取该方向的棋型
    const pattern = getPatternInDirection(row, col, dx, dy, player);
    
    // 检查是否形成活四或冲四
    return pattern.includes('.OOOO.') || pattern.includes('XOOOO.') || 
           pattern.includes('.OOOOX') || pattern.includes('OOO.O') || 
           pattern.includes('OO.OO') || pattern.includes('O.OOO');
}

// 检查棋型：活三
function checkLiveThree(row, col, dx, dy, player) {
    // 获取该方向的棋型
    const pattern = getPatternInDirection(row, col, dx, dy, player);
    
    // 检查是否形成活三
    return pattern.includes('.OOO..') || pattern.includes('..OOO.') || 
           pattern.includes('.O.OO.') || pattern.includes('.OO.O.');
}

// 检查是否是连续棋型的起点
function isStartOfLine(row, col, dx, dy, player) {
    const r = row + dx;
    const c = col + dy;
    
    // 检查边界
    if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
        return true;
    }
    
    // 如果前一个位置是相同玩家的棋子，则不是起点
    return gameBoard[r][c] === player;
}

// 检查是否有邻居
function hasNeighbor(row, col, distance) {
    for (let i = -distance; i <= distance; i++) {
        for (let j = -distance; j <= distance; j++) {
            if (i === 0 && j === 0) continue;
            
            const r = row + i;
            const c = col + j;
            
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] !== EMPTY) {
                return true;
            }
        }
    }
    
    return false;
}

// 获取位置价值
function getPositionValue(row, col) {
    // 中心位置最有价值
    const centerDistance = Math.sqrt(Math.pow(row - 7, 2) + Math.pow(col - 7, 2));
    
    // 标记点位置也有额外价值
    const isMarkPosition = MARK_POSITIONS.some(([r, c]) => r === row && c === col);
    
    // 计算位置价值
    return Math.max(0, 15 - centerDistance) + (isMarkPosition ? 5 : 0);
}

// 获取可用的移动
function getAvailableMoves() {
    const moves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                moves.push({ row, col });
            }
        }
    }
    
    return moves;
}

// 寻找跳跃式活四移动
function findJumpFourMove(player) {
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否形成跳跃式活四
        let hasJumpFour = false;
        
        // 检查所有方向
        for (const [dx, dy] of DIRECTIONS) {
            // 检查不同形式的跳跃式活四
            if (checkJumpPattern(move.row, move.col, dx, dy, player, "OO.OO") ||
                checkJumpPattern(move.row, move.col, dx, dy, player, "O.OOO")) {
                hasJumpFour = true;
                break;
            }
        }
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
        
        // 如果形成跳跃式活四，返回该位置
        if (hasJumpFour) {
            return move;
        }
    }
    
    return null;
}

// 检查跳跃式棋型
function checkJumpPattern(row, col, dx, dy, player, patternStr) {
    const pattern = patternStr.split('').map(c => 
        c === 'O' ? player : 
        c === '.' ? EMPTY : 
        c === 'X' ? (player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE) : 
        c
    );
    
    // 向两个方向检查
    for (let direction = -1; direction <= 1; direction += 2) {
        let matches = true;
        
        for (let i = 0; i < pattern.length; i++) {
            const r = row + direction * dx * i;
            const c = col + direction * dy * i;
            
            // 检查边界
            if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) {
                matches = false;
                break;
            }
            
            // 检查棋子是否匹配
            if (gameBoard[r][c] !== pattern[i]) {
                matches = false;
                break;
            }
        }
        
        if (matches) return true;
    }
    
    return false;
}

// 检查是否有跳跃式活三
function hasJumpThree(row, col, player) {
    let jumpThreeCount = 0;
    
    // 检查所有方向
    for (const [dx, dy] of DIRECTIONS) {
        if (checkJumpThree(row, col, dx, dy, player)) {
            jumpThreeCount++;
            // 如果找到一个跳跃式活三就返回
            if (jumpThreeCount > 0) {
                return true;
            }
        }
    }
    
    return false;
}

// 检查特定方向是否有跳跃式活三
function checkJumpThree(row, col, dx, dy, player) {
    // 检查棋型: .O.OO. 或 .OO.O.
    return checkJumpPattern(row, col, dx, dy, player, ".O.OO.") || 
           checkJumpPattern(row, col, dx, dy, player, ".OO.O.");
}

// 寻找跳活三移动
function findJumpThreeMoves(player) {
    // 获取所有可用的移动
    const availableMoves = getAvailableMoves();
    
    for (const move of availableMoves) {
        // 模拟落子
        gameBoard[move.row][move.col] = player;
        
        // 检查是否形成跳跃式活三
        const hasJumpThreeResult = hasJumpThree(move.row, move.col, player);
        
        // 还原棋盘
        gameBoard[move.row][move.col] = EMPTY;
        
        // 如果形成跳跃式活三，返回该位置
        if (hasJumpThreeResult) {
            return move;
        }
    }
    
    return null;
}

// 使用带有历史启发的Alpha-Beta极小化极大算法
function minimaxWithHistory(depth, isMaximizing, alpha, beta) {
    // 到达叶子节点或达到搜索深度限制
    if (depth === 0 || isGameOver()) {
        return evaluateBoardAdvanced();
    }
    
    // 获取所有可能的移动，并使用历史启发进行排序
    const moves = getPrioritizedMoves();
    
    if (isMaximizing) {
        let maxEval = -Infinity;
        
        for (const move of moves) {
            // 模拟落子
            gameBoard[move.row][move.col] = PLAYER_WHITE;
            
            // 递归评估
            const evaluation = minimaxWithHistory(depth - 1, false, alpha, beta);
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最大评分
            maxEval = Math.max(maxEval, evaluation);
            
            // Alpha-Beta剪枝
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        
        return maxEval;
    } else {
        let minEval = Infinity;
        
        for (const move of moves) {
            // 模拟落子
            gameBoard[move.row][move.col] = PLAYER_BLACK;
            
            // 递归评估
            const evaluation = minimaxWithHistory(depth - 1, true, alpha, beta);
            
            // 还原棋盘
            gameBoard[move.row][move.col] = EMPTY;
            
            // 更新最小评分
            minEval = Math.min(minEval, evaluation);
            
            // Alpha-Beta剪枝
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) {
                break;
            }
        }
        
        return minEval;
    }
}

// 检查游戏是否结束
function isGameOver() {
    // 检查是否有获胜者
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] !== EMPTY) {
                // 检查是否连成五子
                for (const [dx, dy] of DIRECTIONS) {
                    const count = 1 + countConsecutive(row, col, dx, dy, gameBoard[row][col]) + 
                                  countConsecutive(row, col, -dx, -dy, gameBoard[row][col]);
                    if (count >= 5) {
                        return true;
                    }
                }
            }
        }
    }
    
    // 检查是否平局（棋盘已满）
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameBoard[row][col] === EMPTY) {
                return false;
            }
        }
    }
    
    return true;
}