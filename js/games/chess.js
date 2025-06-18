// 国际象棋游戏主文件

// 游戏常量
const BOARD_SIZE = 8; // 8x8棋盘
const EMPTY = 0;
const PLAYER_WHITE = 1;
const PLAYER_BLACK = 2;

// 棋子类型
const PIECE_TYPES = {
    PAWN: 'pawn',
    KNIGHT: 'knight',
    BISHOP: 'bishop',
    ROOK: 'rook',
    QUEEN: 'queen',
    KING: 'king'
};

// 游戏状态变量
let gameBoard = []; // 棋盘状态
let currentPlayer = PLAYER_WHITE; // 当前玩家
let gameActive = false; // 游戏是否进行中
let gameMode = 'pvp'; // 游戏模式：pvp（双人对战）或 pvc（人机对战）
let currentDifficulty = 'easy'; // AI难度
let moveHistory = []; // 移动历史
let scores = { white: 0, black: 0, tie: 0 }; // 分数记录
let selectedPiece = null; // 当前选中的棋子
let legalMoves = []; // 当前选中棋子的合法移动

// DOM 元素
const boardElement = document.getElementById('board');
const turnMarker = document.getElementById('turn-marker');
const turnText = document.getElementById('turn-text');
const whiteScoreElement = document.getElementById('white-score');
const blackScoreElement = document.getElementById('black-score');
const tieScoreElement = document.getElementById('tie-score');
const pvpButton = document.getElementById('pvp-btn');
const pvcButton = document.getElementById('pvc-btn');
const difficultySelector = document.getElementById('difficulty-selector');
const resetButton = document.getElementById('reset-btn');
const undoButton = document.getElementById('undo-btn');
const resetScoreButton = document.getElementById('reset-score-btn');
const promotionModal = document.getElementById('promotion-modal');

// 初始化函数
function init() {
    setupEventListeners();
    resetGame();
    loadScores();
    updateScoreDisplay();
}

// 设置事件监听器
function setupEventListeners() {
    // 游戏模式按钮
    pvpButton.addEventListener('click', () => setGameMode('pvp'));
    pvcButton.addEventListener('click', () => setGameMode('pvc'));
    
    // 难度按钮
    const difficultyButtons = difficultySelector.querySelectorAll('button');
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            setDifficulty(button.getAttribute('data-level'));
            
            // 更新UI
            difficultyButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // 游戏控制按钮
    resetButton.addEventListener('click', resetGame);
    undoButton.addEventListener('click', undoMove);
    resetScoreButton.addEventListener('click', resetScores);
    
    // 升变选项
    const promotionOptions = document.querySelectorAll('.promotion-option');
    promotionOptions.forEach(option => {
        option.addEventListener('click', () => {
            const pieceType = option.getAttribute('data-piece');
            completePromotion(pieceType);
        });
    });
}

// 设置游戏模式
function setGameMode(mode) {
    gameMode = mode;
    
    // 更新UI
    pvpButton.classList.toggle('active', mode === 'pvp');
    pvcButton.classList.toggle('active', mode === 'pvc');
    difficultySelector.style.display = mode === 'pvc' ? 'flex' : 'none';
    
    // 重置游戏
    resetGame();
}

// 设置AI难度
function setDifficulty(level) {
    currentDifficulty = level;
    
    // 如果当前是人机模式且轮到AI，则让AI移动
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK && gameActive) {
        setTimeout(window.makeAIMove, 500);
    }
}

// 重置游戏
function resetGame() {
    // 初始化棋盘
    initializeBoard();
    
    // 重置游戏状态
    currentPlayer = PLAYER_WHITE;
    gameActive = true;
    moveHistory = [];
    selectedPiece = null;
    legalMoves = [];
    
    // 更新UI
    renderBoard();
    updateTurnIndicator();
    
    // 保存当前状态到本地存储
    saveGameState();
    
    // 更新游戏最后游玩时间
    localStorage.setItem('game_chess_lastplayed', new Date().toISOString());
}

// 初始化棋盘
function initializeBoard() {
    gameBoard = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(null));
    
    // 设置白方棋子（下方）
    setupPieces(PLAYER_WHITE, 6, 7);
    
    // 设置黑方棋子（上方）
    setupPieces(PLAYER_BLACK, 1, 0);
}

// 设置初始棋子
function setupPieces(player, pawnRow, pieceRow) {
    // 放置兵
    for (let col = 0; col < BOARD_SIZE; col++) {
        gameBoard[pawnRow][col] = {
            player: player,
            type: PIECE_TYPES.PAWN,
            hasMoved: false
        };
    }
    
    // 放置城堡
    gameBoard[pieceRow][0] = { player: player, type: PIECE_TYPES.ROOK, hasMoved: false };
    gameBoard[pieceRow][7] = { player: player, type: PIECE_TYPES.ROOK, hasMoved: false };
    
    // 放置骑士
    gameBoard[pieceRow][1] = { player: player, type: PIECE_TYPES.KNIGHT };
    gameBoard[pieceRow][6] = { player: player, type: PIECE_TYPES.KNIGHT };
    
    // 放置主教
    gameBoard[pieceRow][2] = { player: player, type: PIECE_TYPES.BISHOP };
    gameBoard[pieceRow][5] = { player: player, type: PIECE_TYPES.BISHOP };
    
    // 放置皇后和国王
    gameBoard[pieceRow][3] = { player: player, type: PIECE_TYPES.QUEEN };
    gameBoard[pieceRow][4] = { player: player, type: PIECE_TYPES.KING, hasMoved: false };
}

// 渲染棋盘
function renderBoard() {
    // 清空棋盘
    boardElement.innerHTML = '';
    
    // 创建棋盘格子和棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const isLight = (row + col) % 2 === 0;
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.classList.add(isLight ? 'light' : 'dark');
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            // 添加点击事件
            cell.addEventListener('click', () => handleCellClick(row, col));
            
            // 标记选中的棋子
            if (selectedPiece && selectedPiece.row === row && selectedPiece.col === col) {
                cell.classList.add('selected');
            }
            
            // 标记合法的移动位置
            const isLegalMove = legalMoves.some(move => move.row === row && move.col === col);
            if (isLegalMove) {
                const moveMarker = document.createElement('div');
                moveMarker.classList.add('move-marker');
                
                // 如果是吃子移动，显示不同的标记
                const piece = gameBoard[row][col];
                if (piece) {
                    moveMarker.classList.add('capture-marker');
                }
                
                cell.appendChild(moveMarker);
            }
            
            // 渲染棋子
            const piece = gameBoard[row][col];
            if (piece) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece');
                pieceElement.classList.add(piece.player === PLAYER_WHITE ? 'white' : 'black');
                pieceElement.classList.add(piece.type);
                cell.appendChild(pieceElement);
            }
            
            boardElement.appendChild(cell);
        }
    }
    
    // 添加CSS样式，如果还没有添加过
    if (!document.getElementById('chess-extra-styles')) {
        const styleElement = document.createElement('style');
        styleElement.id = 'chess-extra-styles';
        styleElement.textContent = `
            .cell.selected {
                background-color: rgba(255, 255, 0, 0.4) !important;
            }
            
            .move-marker {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background-color: rgba(0, 128, 0, 0.4);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 1;
            }
            
            .capture-marker {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                border: 3px solid rgba(255, 0, 0, 0.6);
                background-color: transparent;
            }
            
            .cell {
                position: relative;
            }
        `;
        document.head.appendChild(styleElement);
    }
}

// 更新回合指示器
function updateTurnIndicator() {
    turnMarker.className = 'player-marker';
    turnMarker.classList.add(currentPlayer === PLAYER_WHITE ? 'white' : 'black');
    turnText.textContent = currentPlayer === PLAYER_WHITE ? '白方回合' : '黑方回合';
}

function isValidSquare(row, col) {
     return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
    }
    

    
// 处理格子点击事件
function handleCellClick(row, col) {
    if (!gameActive) return;
    
    // 如果是人机模式且当前是AI回合，则忽略点击
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK) return;
    
    const piece = gameBoard[row][col];
    
    // 调试日志 - 点击的格子
    console.log('点击格子:', { row, col, piece });
    
    // 如果点击了自己的棋子
    if (piece && piece.player === currentPlayer) {
        selectPiece(row, col);
        return;
    }
    
    // 如果已选择了一个棋子，尝试移动
    if (selectedPiece) {
        // 确保选中的格子有棋子
        const selectedPieceObj = gameBoard[selectedPiece.row][selectedPiece.col];
        if (!selectedPieceObj) {
            console.error('选中的格子没有棋子:', selectedPiece);
            selectedPiece = null;
            legalMoves = [];
            renderBoard();
            return;
        }
        
        // 检查是否是合法移动
        const isLegal = legalMoves.some(move => move.row === row && move.col === col);
        
        // 调试日志 - 移动尝试
        console.log('移动尝试:', { 
            从: selectedPiece, 
            到: { row, col }, 
            是否合法: isLegal,
            合法移动列表: legalMoves
        });
        
        if (isLegal) {
            movePiece(selectedPiece, { row, col });
        } else {
            // 不是合法移动，重置选择
            selectedPiece = null;
            legalMoves = [];
            renderBoard();
        }
    }
}

// 选择棋子
function selectPiece(row, col) {
    selectedPiece = { row, col };
    legalMoves = calculateLegalMoves(row, col);
    renderBoard();
}

// 计算所有合法移动
function calculateLegalMoves(row, col) {
    const piece = gameBoard[row][col];
    if (!piece || piece.player !== currentPlayer) return [];
    
    // 根据棋子类型计算合法移动
    let moves = [];
    
    switch (piece.type) {
        case PIECE_TYPES.PAWN:
            moves = calculatePawnMoves(row, col);
            break;
        case PIECE_TYPES.KNIGHT:
            moves = calculateKnightMoves(row, col);
            break;
        case PIECE_TYPES.BISHOP:
            moves = calculateBishopMoves(row, col);
            break;
        case PIECE_TYPES.ROOK:
            moves = calculateRookMoves(row, col);
            break;
        case PIECE_TYPES.QUEEN:
            moves = calculateQueenMoves(row, col);
            break;
        case PIECE_TYPES.KING:
            moves = calculateKingMoves(row, col);
            break;
    }
    
    // 过滤掉会导致自己被将军的移动
    return filterCheckMoves(row, col, moves);
}

// 过滤掉会导致自己被将军的移动
function filterCheckMoves(fromRow, fromCol, moves) {
    const currentPiece = gameBoard[fromRow][fromCol];
    const filteredMoves = [];
    
    for (const move of moves) {
        // Validate array bounds first
        if (move.row < 0 || move.row >= BOARD_SIZE || move.col < 0 || move.col >= BOARD_SIZE) continue;
        // 临时保存当前状态
        const capturedPiece = gameBoard[move.row][move.col];
        
        // 模拟移动
        gameBoard[move.row][move.col] = currentPiece;
        gameBoard[fromRow][fromCol] = null;
        
        // 检查移动后是否被将军
        const isInCheck = isKingInCheck(currentPlayer);
        
        // 恢复状态
        gameBoard[fromRow][fromCol] = currentPiece;
        gameBoard[move.row][move.col] = capturedPiece;
        
        // 如果移动后没有被将军，添加到合法移动中
        if (!isInCheck) {
            filteredMoves.push(move);
        }
    }
    
    return filteredMoves;
}

// 检查指定玩家的国王是否被将军
function isKingInCheck(player) {
    // 找到国王位置
    let kingRow = -1, kingCol = -1;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameBoard[r][c];
            if (piece && piece.player === player && piece.type === PIECE_TYPES.KING) {
                kingRow = r;
                kingCol = c;
                break;
            }
        }
        if (kingRow !== -1) break;
    }
    
    // 检查对方棋子是否可以吃到国王
    const opponent = player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameBoard[r][c];
            if (piece && piece.player === opponent) {
                const moves = getMovesWithoutCheckFilter(r, c);
                for (const move of moves) {
                    if (move.row === kingRow && move.col === kingCol) {
                        return true; // 国王被将军
                    }
                }
            }
        }
    }
    
    return false; // 国王没有被将军
}

// 获取移动，但不进行将军过滤（防止递归）
function getMovesWithoutCheckFilter(row, col) {
    const piece = gameBoard[row][col];
    if (!piece) return [];
    
    // 暂存当前玩家
    const originalPlayer = currentPlayer;
    // 设置当前玩家为棋子所属玩家
    currentPlayer = piece.player;
    
    let moves;
    switch (piece.type) {
        case PIECE_TYPES.PAWN:
            moves = calculatePawnMoves(row, col, true);
            break;
        case PIECE_TYPES.KNIGHT:
            moves = calculateKnightMoves(row, col);
            break;
        case PIECE_TYPES.BISHOP:
            moves = calculateBishopMoves(row, col);
            break;
        case PIECE_TYPES.ROOK:
            moves = calculateRookMoves(row, col);
            break;
        case PIECE_TYPES.QUEEN:
            moves = calculateQueenMoves(row, col);
            break;
        case PIECE_TYPES.KING:
            moves = calculateKingMoves(row, col, true);
            break;
        default:
            moves = [];
    }
    
    // 恢复当前玩家
    currentPlayer = originalPlayer;
    
    return moves;
}

// 计算兵的合法移动
function calculatePawnMoves(row, col, skipCheckFilter = false) {
    const moves = [];
    const piece = gameBoard[row][col];
    if (!piece) return moves;
    
    const player = piece.player;
    // 恢复正确移动方向：白棋向上(row减小)，黑棋向下(row增大)
    const direction = player === PLAYER_WHITE ? -1 : 1;
    // 恢复正确起始位置：白棋起始行6，黑棋起始行1
    const startRow = player === PLAYER_WHITE ? 6 : 1;
    // 白棋升变行是0，黑棋升变行是7
    const promotionRow = player === PLAYER_WHITE ? 0 : 7;
    const opponent = player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    
    // 调试日志
    console.log('计算兵的移动:', {
        玩家: player === PLAYER_WHITE ? '白方' : '黑方',
        当前位置: { row, col },
        移动方向: direction,
        起始行: startRow,
        升变行: promotionRow,
        前方一格: { row: row + direction, col: col },
        前方两格: { row: row + direction * 2, col: col },
        前方一格状态: row + direction >= 0 && row + direction < BOARD_SIZE ? 
            (gameBoard[row + direction][col] ? '有棋子' : '空') : '越界',
        前方两格状态: row + direction * 2 >= 0 && row + direction * 2 < BOARD_SIZE ? 
            (gameBoard[row + direction * 2][col] ? '有棋子' : '空') : '越界',
        是否在起始行: row === startRow
    });
    
    // 前进一步
    if (row + direction >= 0 && row + direction < BOARD_SIZE && !gameBoard[row + direction][col]) {
        if (isValidSquare(row + direction, col)) {
    moves.push({ 
      row: row + direction, 
      col: col,
      _debug: '白棋原始方向: ' + (player === PLAYER_WHITE ? '向上' : '向下')
    });
}
        
        // 起始位置可以前进两步
        if (row === startRow && row + direction * 2 >= 0 && row + direction * 2 < BOARD_SIZE && !gameBoard[row + direction * 2][col]) {
            if (isValidSquare(row + direction * 2, col)) {
    moves.push({
      row: row + direction * 2,
      col: col,
      _debug: '白棋两步移动: ' + (player === PLAYER_WHITE ? '起始行' : '黑棋起始行')
    });
}
        }
    }
    
    // 吃子移动（左斜）
    if (col > 0 && row + direction >= 0 && row + direction < BOARD_SIZE) {
        const leftTarget = gameBoard[row + direction][col - 1];
        if (leftTarget && leftTarget.player !== player) {
            moves.push({ row: row + direction, col: col - 1 });
        }
        
        // 过路兵（En Passant）
        if (moveHistory.length > 0) {
            const lastMove = moveHistory[moveHistory.length - 1];
            if (lastMove && lastMove.pieceMoved && lastMove.pieceMoved.type === PIECE_TYPES.PAWN && 
                lastMove.pieceMoved.player === opponent &&
                lastMove.from.row === (opponent === PLAYER_WHITE ? 6 : 1) && 
                lastMove.to.row === row && 
                lastMove.to.col === col - 1 && 
                Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
                moves.push({ 
                    row: row + direction, 
                    col: col - 1, 
                    isEnPassant: true,
                    captureRow: row,
                    captureCol: col - 1
                });
            }
        }
    }
    
    // 吃子移动（右斜）
    if (col < BOARD_SIZE - 1 && row + direction >= 0 && row + direction < BOARD_SIZE) {
        const rightTarget = gameBoard[row + direction][col + 1];
        if (rightTarget && rightTarget.player !== player) {
            moves.push({ row: row + direction, col: col + 1 });
        }
        
        // 过路兵（En Passant）
        if (moveHistory.length > 0) {
            const lastMove = moveHistory[moveHistory.length - 1];
            if (lastMove && lastMove.pieceMoved && lastMove.pieceMoved.type === PIECE_TYPES.PAWN && 
                lastMove.pieceMoved.player === opponent &&
                lastMove.from.row === (opponent === PLAYER_WHITE ? 6 : 1) && 
                lastMove.to.row === row && 
                lastMove.to.col === col + 1 && 
                Math.abs(lastMove.from.row - lastMove.to.row) === 2) {
                moves.push({ 
                    row: row + direction, 
                    col: col + 1, 
                    isEnPassant: true,
                    captureRow: row,
                    captureCol: col + 1
                });
            }
        }
    }
    
    // 检查升变
    for (let i = 0; i < moves.length; i++) {
        const move = moves[i];
        if (move.row === promotionRow) {
            move.promotion = true;
        }
    }
    
    // 调试日志 - 输出计算出的合法移动
    console.log('兵的合法移动:', moves);
    
    return moves;
}

// 计算骑士的合法移动
function calculateKnightMoves(row, col) {
    const player = gameBoard[row][col].player;
    const moves = [
        {row: row-2, col: col-1}, {row: row-2, col: col+1},
        {row: row-1, col: col-2}, {row: row-1, col: col+2},
        {row: row+1, col: col-2}, {row: row+1, col: col+2},
        {row: row+2, col: col-1}, {row: row+2, col: col+1}
    ];
    
    return moves.filter(move => 
        move.row >= 0 && move.row < BOARD_SIZE && 
        move.col >= 0 && move.col < BOARD_SIZE &&
        (!gameBoard[move.row][move.col] || gameBoard[move.row][move.col].player !== player)
    );
}

// 计算主教的合法移动
function calculateBishopMoves(row, col) {
    return getDiagonalMoves(row, col);
}

// 计算车的合法移动
function calculateRookMoves(row, col) {
    return getStraightMoves(row, col);
}

// 计算皇后的合法移动
function calculateQueenMoves(row, col) {
    return [...getDiagonalMoves(row, col), ...getStraightMoves(row, col)];
}

// 计算国王的合法移动
function calculateKingMoves(row, col, skipCastling = false) {
    const player = gameBoard[row][col].player;
    const moves = [];
    
    // 常规移动（周围八个方向）
    for (let r = row - 1; r <= row + 1; r++) {
        for (let c = col - 1; c <= col + 1; c++) {
            if (r === row && c === col) continue; // 跳过当前位置
            
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
                if (!gameBoard[r][c] || gameBoard[r][c].player !== player) {
                    moves.push({row: r, col: c});
                }
            }
        }
    }
    
    // 王车易位
    if (!skipCastling) {
        const king = gameBoard[row][col];
        if (king && !king.hasMoved && !isKingInCheck(player)) {
            // 短易位（王翼）
            if (gameBoard[row][7] && 
                gameBoard[row][7].type === PIECE_TYPES.ROOK && 
                gameBoard[row][7].player === player &&
                !gameBoard[row][7].hasMoved && 
                !gameBoard[row][6] && 
                !gameBoard[row][5] && 
                !isSquareThreatened(row, 5, player) && 
                !isSquareThreatened(row, 6, player)) {
                moves.push({row: row, col: col + 2, isCastling: true, rookFromCol: 7, rookToCol: 5});
            }
            
            // 长易位（后翼）
            if (gameBoard[row][0] && 
                gameBoard[row][0].type === PIECE_TYPES.ROOK && 
                gameBoard[row][0].player === player &&
                !gameBoard[row][0].hasMoved && 
                !gameBoard[row][1] && 
                !gameBoard[row][2] && 
                !gameBoard[row][3] && 
                !isSquareThreatened(row, 2, player) && 
                !isSquareThreatened(row, 3, player)) {
                moves.push({row: row, col: col - 2, isCastling: true, rookFromCol: 0, rookToCol: 3});
            }
        }
    }
    
    return moves;
}

// 检查指定格子是否被指定玩家的对手威胁
function isSquareThreatened(row, col, player) {
    const opponent = player === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
    
    for (let r = 0; r < BOARD_SIZE; r++) {
        for (let c = 0; c < BOARD_SIZE; c++) {
            const piece = gameBoard[r][c];
            if (piece && piece.player === opponent) {
                const moves = getMovesWithoutCheckFilter(r, c);
                for (const move of moves) {
                    if (move.row === row && move.col === col) {
                        return true;
                    }
                }
            }
        }
    }
    
    return false;
}

// 获取斜向移动
function getDiagonalMoves(row, col) {
    const player = gameBoard[row][col].player;
    const moves = [];
    const directions = [{r:1,c:1}, {r:1,c:-1}, {r:-1,c:1}, {r:-1,c:-1}];
    
    for (const dir of directions) {
        let r = row + dir.r;
        let c = col + dir.c;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const piece = gameBoard[r][c];
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

// 获取直线移动
function getStraightMoves(row, col) {
    const player = gameBoard[row][col].player;
    const moves = [];
    const directions = [{r:1,c:0}, {r:-1,c:0}, {r:0,c:1}, {r:0,c:-1}];
    
    for (const dir of directions) {
        let r = row + dir.r;
        let c = col + dir.c;
        
        while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
            const piece = gameBoard[r][c];
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

// 移动棋子
function movePiece(from, to, promotion) {
    // 记录移动历史
    moveHistory.push({
        from: {...from},
        to: {...to},
        capturedPiece: gameBoard[to.row][to.col] ? {...gameBoard[to.row][to.col]} : null,
        pieceMoved: {...gameBoard[from.row][from.col]}
    });
    
    // 获取移动信息
    const piece = gameBoard[from.row][from.col];
    
    // 添加安全检查，如果棋子不存在，则返回
    if (!piece) {
        console.error('尝试移动不存在的棋子:', from);
        return;
    }
    
    const move = legalMoves.find(m => m.row === to.row && m.col === to.col);
    
    // 执行移动
    gameBoard[to.row][to.col] = piece;
    gameBoard[from.row][from.col] = null;
    
    // 处理特殊移动
    if (move) {
        // 过路兵
        if (move.isEnPassant) {
            // 移除被吃掉的兵
            gameBoard[move.captureRow][move.captureCol] = null;
            
            // 更新历史记录
            moveHistory[moveHistory.length - 1].capturedPiece = {
                player: currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE,
                type: PIECE_TYPES.PAWN
            };
            moveHistory[moveHistory.length - 1].isEnPassant = true;
            moveHistory[moveHistory.length - 1].captureRow = move.captureRow;
            moveHistory[moveHistory.length - 1].captureCol = move.captureCol;
        }
        
        // 王车易位
        if (move.isCastling) {
            // 移动车
            const rook = gameBoard[from.row][move.rookFromCol];
            gameBoard[from.row][move.rookToCol] = rook;
            gameBoard[from.row][move.rookFromCol] = null;
            
            // 更新历史记录
            moveHistory[moveHistory.length - 1].isCastling = true;
            moveHistory[moveHistory.length - 1].rookFromCol = move.rookFromCol;
            moveHistory[moveHistory.length - 1].rookToCol = move.rookToCol;
        }
    }
    
    // 标记棋子已移动（用于王车易位规则）
    if (piece.type === PIECE_TYPES.KING || piece.type === PIECE_TYPES.ROOK) {
        piece.hasMoved = true;
    }
    
    // 检查兵的升变
    const promotionRow = piece.player === PLAYER_WHITE ? 0 : 7;
    if (piece.type === PIECE_TYPES.PAWN && to.row === promotionRow) {
        if (promotion) {
            // 如果提供了升变类型，直接升变
            piece.type = promotion;
        } else {
            // 否则显示升变选择对话框
            showPromotionDialog(to.row, to.col);
            return; // 暂停游戏流程，等待玩家选择
        }
    }
    
    // 切换玩家
    switchPlayer();
    
    // 重置选择状态
    selectedPiece = null;
    legalMoves = [];
    
    // 更新UI
    renderBoard();
    updateTurnIndicator();
    
    // 保存游戏状态
    saveGameState();
    
    // 检查游戏状态（胜负或平局）
    checkGameStatus();
    
    // 如果是人机对战且轮到AI
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK && gameActive) {
        setTimeout(window.makeAIMove, 500);
    }
}

// 让movePiece在全局范围内可用
window.movePiece = movePiece;

// 显示升变选择对话框
function showPromotionDialog(row, col) {
    // 显示升变对话框
    promotionModal.style.display = 'flex';
    
    // 存储升变位置以供后续使用
    promotionModal.dataset.row = row;
    promotionModal.dataset.col = col;
}

// 完成兵的升变
function completePromotion(pieceType) {
    const row = parseInt(promotionModal.dataset.row);
    const col = parseInt(promotionModal.dataset.col);
    
    // 确保目标位置有棋子
    if (!gameBoard[row] || !gameBoard[row][col]) {
        console.error('升变位置没有棋子:', { row, col });
        promotionModal.style.display = 'none';
        return;
    }
    
    // 升变棋子
    gameBoard[row][col].type = pieceType;
    
    // 隐藏对话框
    promotionModal.style.display = 'none';
    
    // 继续游戏流程
    switchPlayer();
    renderBoard();
    updateTurnIndicator();
    saveGameState();
    checkGameStatus();
    
    // 如果是人机对战且轮到AI
    if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK && gameActive) {
        setTimeout(window.makeAIMove, 500);
    }
}

// 切换当前玩家
function switchPlayer() {
    currentPlayer = currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE;
}

// 检查游戏状态
function checkGameStatus() {
    // 检查是否将军
    const isInCheck = isKingInCheck(currentPlayer);
    
    // 计算当前玩家所有可能的移动
    const allPossibleMoves = getAllPossibleMoves(currentPlayer);
    
    // 如果没有合法移动
    if (allPossibleMoves.length === 0) {
        gameActive = false;
        
        if (isInCheck) {
            // 将死
            turnText.textContent = currentPlayer === PLAYER_WHITE ? 
                "黑方将杀！黑方获胜！" : "白方将杀！白方获胜！";
            
            // 更新分数
            updateScore(currentPlayer === PLAYER_WHITE ? PLAYER_BLACK : PLAYER_WHITE);
        } else {
            // 逼和
            turnText.textContent = "逼和！平局！";
            updateScore(null); // 平局
        }
    } else if (isInCheck) {
        // 将军但有合法移动
        turnText.textContent = currentPlayer === PLAYER_WHITE ? 
            "白方被将军！" : "黑方被将军！";
    } else {
        // 检查是否因子力不足导致无法将杀（和棋）
        if (isInsufficientMaterial()) {
            gameActive = false;
            turnText.textContent = "子力不足，和棋！";
            updateScore(null); // 平局
        }
    }
}

// 获取指定玩家所有可能的移动
function getAllPossibleMoves(player) {
    let allMoves = [];
    
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece && piece.player === player) {
                // 暂时切换当前玩家，以便计算合法移动
                const originalPlayer = currentPlayer;
                currentPlayer = player;
                
                const pieceMoves = calculateLegalMoves(row, col);
                allMoves = allMoves.concat(pieceMoves.map(move => ({
                    from: { row, col },
                    to: move
                })));
                
                // 恢复当前玩家
                currentPlayer = originalPlayer;
            }
        }
    }
    
    return allMoves;
}

// 检查是否因子力不足导致无法将杀
function isInsufficientMaterial() {
    let whitePieces = [];
    let blackPieces = [];
    
    // 统计所有棋子
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const piece = gameBoard[row][col];
            if (piece) {
                if (piece.player === PLAYER_WHITE) {
                    whitePieces.push(piece.type);
                } else {
                    blackPieces.push(piece.type);
                }
            }
        }
    }
    
    // 以下情况属于子力不足：
    // 1. 国王对国王
    if (whitePieces.length === 1 && blackPieces.length === 1) {
        return true;
    }
    
    // 2. 国王对国王和骑士/主教
    if ((whitePieces.length === 1 && blackPieces.length === 2 && 
         (blackPieces.includes(PIECE_TYPES.KNIGHT) || blackPieces.includes(PIECE_TYPES.BISHOP))) ||
        (blackPieces.length === 1 && whitePieces.length === 2 && 
         (whitePieces.includes(PIECE_TYPES.KNIGHT) || whitePieces.includes(PIECE_TYPES.BISHOP)))) {
        return true;
    }
    
    // 3. 国王和主教对国王和同色主教
    if (whitePieces.length === 2 && blackPieces.length === 2 &&
        whitePieces.includes(PIECE_TYPES.BISHOP) && blackPieces.includes(PIECE_TYPES.BISHOP)) {
        // 检查主教是否在同色格子上
        let whiteBishopSquareColor = null;
        let blackBishopSquareColor = null;
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const piece = gameBoard[row][col];
                if (piece && piece.type === PIECE_TYPES.BISHOP) {
                    const squareColor = (row + col) % 2 === 0 ? 'light' : 'dark';
                    if (piece.player === PLAYER_WHITE) {
                        whiteBishopSquareColor = squareColor;
                    } else {
                        blackBishopSquareColor = squareColor;
                    }
                }
            }
        }
        
        if (whiteBishopSquareColor === blackBishopSquareColor) {
            return true;
        }
    }
    
    return false;
}

// 让checkGameStatus在全局范围内可用
window.checkGameStatus = checkGameStatus;

// 撤销上一步操作
function undoMove() {
    if (moveHistory.length === 0) return;
    
    // 如果是人机对战，需要撤销两步（玩家和AI的移动）
    if (gameMode === 'pvc') {
        if (moveHistory.length >= 2) {
            undoLastMove();
            undoLastMove();
        }
    } else {
        undoLastMove();
    }
}

// 撤销最后一步移动
function undoLastMove() {
    if (moveHistory.length === 0) return;
    
    const lastMove = moveHistory.pop();
    
    // 确保移动历史数据完整
    if (!lastMove.pieceMoved) {
        console.error('移动历史数据不完整:', lastMove);
        return;
    }
    
    // 恢复棋子位置
    gameBoard[lastMove.from.row][lastMove.from.col] = lastMove.pieceMoved;
    gameBoard[lastMove.to.row][lastMove.to.col] = lastMove.capturedPiece;
    
    // 处理特殊移动
    if (lastMove.isEnPassant) {
        // 恢复被吃掉的兵
        gameBoard[lastMove.captureRow][lastMove.captureCol] = {
            player: currentPlayer,
            type: PIECE_TYPES.PAWN
        };
        // 确保目标位置为空
        gameBoard[lastMove.to.row][lastMove.to.col] = null;
    }
    
    if (lastMove.isCastling) {
        // 恢复车的位置
        const rook = gameBoard[lastMove.from.row][lastMove.rookToCol];
        gameBoard[lastMove.from.row][lastMove.rookFromCol] = rook;
        gameBoard[lastMove.from.row][lastMove.rookToCol] = null;
    }
    
    // 重置已移动标志
    if (lastMove.pieceMoved.type === PIECE_TYPES.KING || lastMove.pieceMoved.type === PIECE_TYPES.ROOK) {
        // 只有在该棋子原本未移动过时才重置
        if (moveHistory.every(move => 
            move.from.row !== lastMove.from.row || 
            move.from.col !== lastMove.from.col || 
            move.pieceMoved.type !== lastMove.pieceMoved.type
        )) {
            lastMove.pieceMoved.hasMoved = false;
        }
    }
    
    // 切换回上一个玩家
    switchPlayer();
    
    // 更新UI
    selectedPiece = null;
    legalMoves = [];
    renderBoard();
    updateTurnIndicator();
    
    // 如果游戏已结束，恢复游戏状态
    gameActive = true;
    
    // 保存游戏状态
    saveGameState();
}

// 保存游戏状态到本地存储
function saveGameState() {
    // 简化版：此处省略实现
}

// 加载分数
function loadScores() {
    const savedScores = localStorage.getItem('game_chess_scores');
    if (savedScores) {
        scores = JSON.parse(savedScores);
    }
}

// 更新分数显示
function updateScoreDisplay() {
    whiteScoreElement.textContent = scores.white;
    blackScoreElement.textContent = scores.black;
    tieScoreElement.textContent = scores.tie;
}

// 更新分数
function updateScore(winner) {
    if (winner === PLAYER_WHITE) {
        scores.white++;
    } else if (winner === PLAYER_BLACK) {
        scores.black++;
    } else {
        scores.tie++;
    }
    
    // 保存分数
    localStorage.setItem('game_chess_scores', JSON.stringify(scores));
    
    // 更新高分
    const highScore = Math.max(scores.white, scores.black);
    localStorage.setItem('game_chess_highscore', highScore.toString());
    
    // 更新显示
    updateScoreDisplay();
}

// 重置分数
function resetScores() {
    scores = { white: 0, black: 0, tie: 0 };
    localStorage.setItem('game_chess_scores', JSON.stringify(scores));
    updateScoreDisplay();
}

// 加载AI模块
function loadAI() {
    const script = document.createElement('script');
    script.src = '../js/games/chess-ai.js';
    document.head.appendChild(script);
    
    script.onload = () => {
        console.log('AI模块已加载');
        
        // 如果当前是人机模式且轮到AI，则让AI移动
        if (gameMode === 'pvc' && currentPlayer === PLAYER_BLACK && gameActive) {
            setTimeout(window.makeAIMove, 500);
        }
    };
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    init();
    loadAI();
});