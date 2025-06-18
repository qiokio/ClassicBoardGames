// 数字拼图游戏 - 极简风格

// 游戏变量
let tiles = []; // 拼图块数组
let emptyTile = { row: 0, col: 0 }; // 空白方块的位置
let gridSize = 3; // 默认3x3网格
let moves = 0;
let gameActive = false;
let timerInterval;
let startTime;
let currentDifficulty = 'easy';
let showingSolution = false;

// 难度级别设置
const difficulties = {
    easy: { size: 3, shuffleCount: 20 },
    medium: { size: 4, shuffleCount: 40 },
    hard: { size: 5, shuffleCount: 60 }
};

// DOM元素
let gridElement;
let timerElement;
let bestTimeElement;
let movesElement;
let startButton;
let shuffleButton;
let solveButton;
let difficultyButtons;

// 确保DOM完全加载后再初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM加载完成，开始获取DOM元素");
    
    // 获取DOM元素
    gridElement = document.getElementById('puzzle-grid');
    timerElement = document.getElementById('timer');
    bestTimeElement = document.getElementById('best-time');
    movesElement = document.getElementById('moves');
    startButton = document.getElementById('start-btn');
    shuffleButton = document.getElementById('shuffle-btn');
    solveButton = document.getElementById('solve-btn');
    difficultyButtons = document.querySelectorAll('.difficulty-selector .game-btn');
    
    // 检查是否所有元素都找到了
    const requiredElements = [gridElement, timerElement, bestTimeElement, movesElement, startButton, shuffleButton, solveButton];
    let allElementsFound = true;
    
    requiredElements.forEach((el, index) => {
        if (!el) {
            console.error(`缺少必要的DOM元素:`, ['gridElement', 'timerElement', 'bestTimeElement', 'movesElement', 'startButton', 'shuffleButton', 'solveButton'][index]);
            allElementsFound = false;
        }
    });
    
    if (!difficultyButtons || difficultyButtons.length === 0) {
        console.error("未找到难度选择按钮");
        allElementsFound = false;
    }
    
    if (allElementsFound) {
        console.log("所有DOM元素已找到，初始化游戏");
        initGame();
    } else {
        console.error("初始化失败: 某些DOM元素未找到");
    }
});

// 初始化游戏
function initGame() {
    console.log("初始化游戏");
    
    // 事件监听器
    startButton.addEventListener('click', function() {
        console.log("开始游戏按钮被点击");
        startGame();
    });
    
    shuffleButton.addEventListener('click', function() {
        console.log("洗牌按钮被点击");
        shuffleTiles();
    });
    
    solveButton.addEventListener('click', function() {
        console.log("解法按钮被点击");
        toggleSolution();
    });
    
    difficultyButtons.forEach(button => {
        button.addEventListener('click', () => {
            console.log(`难度按钮被点击: ${button.getAttribute('data-level')}`);
            if (gameActive) {
                if (confirm('更改难度将重新开始游戏，确定要继续吗？')) {
                    setDifficulty(button.getAttribute('data-level'));
                }
            } else {
                setDifficulty(button.getAttribute('data-level'));
            }
        });
    });
    
    // 加载最佳时间
    loadBestTime();
    
    // 创建初始拼图
    createPuzzle();
    
    console.log("游戏初始化完成");
}

// 设置难度级别
function setDifficulty(level) {
    difficultyButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-level') === level) {
            btn.classList.add('active');
        }
    });
    
    currentDifficulty = level;
    gridSize = difficulties[level].size;
    
    // 更新网格类名
    gridElement.className = 'puzzle-grid';
    if (level !== 'easy') {
        gridElement.classList.add(level);
    }
    
    // 重新加载最佳时间
    loadBestTime();
    
    // 重新创建拼图
    resetGame();
}

// 开始游戏
function startGame() {
    console.log("开始游戏函数被调用");
    
    resetGame();
    
    // 标记游戏为活跃状态
    gameActive = true;
    startButton.disabled = true;
    
    // 开始计时器
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
    
    // 打乱拼图（不会再返回到startGame）
    shuffleTilesDirectly();
    
    console.log("游戏已开始，计时器已启动");
}

// 专门用于打乱拼图的函数，不包含游戏状态设置，避免递归
function shuffleTilesDirectly() {
    console.log("开始直接打乱拼图");
    
    // 执行随机移动来打乱拼图
    const shuffleCount = difficulties[currentDifficulty].shuffleCount;
    console.log(`将执行${shuffleCount}次随机移动`);
    
    // 防止出现无解的情况，使用预定义的移动模式
    const directions = [
        { dr: -1, dc: 0 }, // 上
        { dr: 1, dc: 0 },  // 下
        { dr: 0, dc: -1 }, // 左
        { dr: 0, dc: 1 }   // 右
    ];
    
    let lastDirection = -1;
    let effectiveMoves = 0;
    
    for (let i = 0; i < shuffleCount; i++) {
        // 选择一个方向，避免立即回退
        let dirIndex;
        let attempts = 0;
        const maxAttempts = 20; // 防止无限循环
        
        do {
            dirIndex = Math.floor(Math.random() * 4);
            attempts++;
            if (attempts > maxAttempts) break;
        } while (
            (dirIndex === 0 && lastDirection === 1) || // 避免上下来回移动
            (dirIndex === 1 && lastDirection === 0) ||
            (dirIndex === 2 && lastDirection === 3) || // 避免左右来回移动
            (dirIndex === 3 && lastDirection === 2)
        );
        
        const direction = directions[dirIndex];
        lastDirection = dirIndex;
        
        // 计算新位置
        const newRow = emptyTile.row + direction.dr;
        const newCol = emptyTile.col + direction.dc;
        
        // 检查是否在边界内
        if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
            // 模拟点击该位置
            const clickTile = getTileAt(newRow, newCol);
            if (clickTile && !clickTile.isEmpty) {
                // 交换位置以模拟移动
                const currentEmptyRow = emptyTile.row;
                const currentEmptyCol = emptyTile.col;
                
                // 找到两个瓦片
                const currentTile = clickTile;
                const emptyTileObj = getTileAt(currentEmptyRow, currentEmptyCol);
                
                if (currentTile && emptyTileObj) {
                    // 交换视觉效果
                    emptyTileObj.element.textContent = currentTile.value;
                    currentTile.element.textContent = '';
                    
                    emptyTileObj.element.classList.remove('empty');
                    currentTile.element.classList.add('empty');
                    
                    // 交换数据
                    const tempValue = emptyTileObj.value;
                    const tempIsEmpty = emptyTileObj.isEmpty;
                    
                    emptyTileObj.value = currentTile.value;
                    emptyTileObj.isEmpty = currentTile.isEmpty;
                    
                    currentTile.value = tempValue;
                    currentTile.isEmpty = tempIsEmpty;
                    
                    // 更新空格位置
                    emptyTile = { row: newRow, col: newCol };
                    effectiveMoves++;
                }
            }
        }
    }
    
    console.log(`拼图打乱完成，执行了${effectiveMoves}次有效移动`);
}

// 重置游戏
function resetGame() {
    console.log("重置游戏");
    // 清除状态
    clearInterval(timerInterval);
    moves = 0;
    gameActive = false;
    
    // 重置UI
    timerElement.textContent = '00:00';
    movesElement.textContent = '0';
    startButton.disabled = false;
    showingSolution = false;
    
    // 重新创建拼图
    createPuzzle();
}

// 创建拼图
function createPuzzle() {
    console.log(`创建${gridSize}x${gridSize}的拼图`);
    // 清空网格
    gridElement.innerHTML = '';
    
    // 设置网格样式
    gridElement.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    
    // 创建拼图块
    tiles = [];
    let tileNumber = 1;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // 最后一个位置是空白格
            if (row === gridSize - 1 && col === gridSize - 1) {
                // 空白格
                createTile(row, col, '', true);
                emptyTile = { row, col };
            } else {
                // 普通数字格
                createTile(row, col, tileNumber++);
            }
        }
    }
    
    console.log(`已创建${gridSize}x${gridSize}的拼图网格`);
}

// 创建单个拼图块
function createTile(row, col, value, isEmpty = false) {
    const tile = document.createElement('div');
    tile.className = 'puzzle-tile';
    if (isEmpty) {
        tile.classList.add('empty');
    } else {
        tile.textContent = value;
        
        // 使用闭包保存当前的row和col值
        const currentRow = row;
        const currentCol = col;
        tile.addEventListener('click', function() {
            console.log(`点击了位置 [${currentRow},${currentCol}] 的瓦片`);
            moveTile(currentRow, currentCol);
        });
    }
    
    gridElement.appendChild(tile);
    
    // 添加到tiles数组
    tiles.push({
        element: tile,
        row,
        col,
        value: isEmpty ? '' : value,
        isEmpty
    });
}

// 移动拼图块
function moveTile(row, col) {
    console.log(`尝试移动位置 [${row},${col}] 的瓦片`);
    if (!gameActive) {
        console.log("游戏未激活，不处理移动");
        return;
    }
    
    if (showingSolution) {
        console.log("正在显示解决方案，不处理移动");
        return;
    }
    
    // 检查该块是否与空格相邻
    if (
        (Math.abs(row - emptyTile.row) === 1 && col === emptyTile.col) ||
        (Math.abs(col - emptyTile.col) === 1 && row === emptyTile.row)
    ) {
        console.log("瓦片与空格相邻，可以移动");
        // 找到当前块和空白块
        const currentTile = getTileAt(row, col);
        const emptyTileObj = getTileAt(emptyTile.row, emptyTile.col);
        
        if (!currentTile || !emptyTileObj) {
            console.error("找不到瓦片对象");
            return;
        }
        
        // 交换classList和textContent
        emptyTileObj.element.textContent = currentTile.value;
        currentTile.element.textContent = '';
        
        emptyTileObj.element.classList.remove('empty');
        currentTile.element.classList.add('empty');
        
        // 添加移动动画 - 极简风格
        emptyTileObj.element.classList.add('tile-move');
        setTimeout(() => {
            emptyTileObj.element.classList.remove('tile-move');
        }, 200);
        
        // 更新事件监听器
        const newRow = emptyTile.row;
        const newCol = emptyTile.col;
        
        // 移除先前的事件监听器
        const oldClickListeners = currentTile.element._clickListeners || [];
        oldClickListeners.forEach(listener => {
            currentTile.element.removeEventListener('click', listener);
        });
        
        // 为原本是空格的瓦片添加新的点击事件
        const newClickListener = function() {
            moveTile(newRow, newCol);
        };
        emptyTileObj.element.addEventListener('click', newClickListener);
        
        // 存储新的事件监听器引用
        emptyTileObj.element._clickListeners = emptyTileObj.element._clickListeners || [];
        emptyTileObj.element._clickListeners.push(newClickListener);
        
        // 更新数据
        emptyTileObj.value = currentTile.value;
        emptyTileObj.isEmpty = false;
        
        currentTile.value = '';
        currentTile.isEmpty = true;
        
        // 更新空格位置
        emptyTile = { row, col };
        
        // 增加移动计数
        moves++;
        movesElement.textContent = moves;
        
        // 检查是否完成
        if (checkWin()) {
            gameComplete();
        }
    } else {
        console.log("瓦片与空格不相邻，无法移动");
    }
}

// 根据位置获取拼图块对象
function getTileAt(row, col) {
    return tiles.find(tile => tile.row === row && tile.col === col);
}

// 检查胜利条件
function checkWin() {
    let expectedValue = 1;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // 最后一个格子应该是空的
            if (row === gridSize - 1 && col === gridSize - 1) {
                const tile = getTileAt(row, col);
                if (!tile || !tile.isEmpty) {
                    return false;
                }
            } else {
                const tile = getTileAt(row, col);
                if (!tile || tile.isEmpty || tile.value !== expectedValue) {
                    return false;
                }
                expectedValue++;
            }
        }
    }
    
    console.log("恭喜！拼图完成");
    return true;
}

// 游戏完成
function gameComplete() {
    clearInterval(timerInterval);
    gameActive = false;
    
    const totalTime = Math.floor((Date.now() - startTime) / 1000);
    const timeString = formatTime(totalTime);
    
    // 显示完成效果 - 极简风格
    tiles.forEach(tile => {
        if (!tile.isEmpty) {
            tile.element.classList.add('completed');
            // 添加简洁的完成动画
            setTimeout(() => {
                tile.element.style.transition = "transform 0.3s ease";
                tile.element.style.transform = "scale(0.98)";
                setTimeout(() => {
                    tile.element.style.transform = "scale(1)";
                }, 300);
            }, 100 * Math.random() * 5); // 随机延迟，更自然
        }
    });
    
    // 检查是否是最佳时间
    const isNewRecord = updateBestTime(totalTime);
    
    // 显示完成消息
    setTimeout(() => {
        showCompletionModal(timeString, moves, isNewRecord);
    }, 800);
    
    // 记录游戏状态
    localStorage.setItem('game_puzzle_lastplayed', new Date().toISOString());
}

// 更新计时器
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    timerElement.textContent = formatTime(elapsedTime);
}

// 格式化时间
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// 更新最佳时间
function updateBestTime(time) {
    // 每个难度级别都有自己的最佳时间
    const bestTimeKey = `game_puzzle_besttime_${currentDifficulty}`;
    const currentBest = localStorage.getItem(bestTimeKey);
    
    // 如果没有最佳时间或新时间更好
    if (!currentBest || time < parseInt(currentBest)) {
        localStorage.setItem(bestTimeKey, time);
        bestTimeElement.textContent = formatTime(time);
        
        // 也更新总的最高分（用于主页显示）
        const highScoreKey = 'game_puzzle_highscore';
        const difficulty = { easy: 1, medium: 2, hard: 3 }[currentDifficulty];
        localStorage.setItem(highScoreKey, difficulty * 10000 - time * 10 - moves); // 高难度，低时间，低步数得分高
        
        return true;
    }
    
    return false;
}

// 加载最佳时间
function loadBestTime() {
    const bestTimeKey = `game_puzzle_besttime_${currentDifficulty}`;
    const bestTime = localStorage.getItem(bestTimeKey);
    
    if (bestTime) {
        bestTimeElement.textContent = formatTime(parseInt(bestTime));
    } else {
        bestTimeElement.textContent = '--:--';
    }
}

// 显示解法
function toggleSolution() {
    console.log("切换解法显示");
    if (!gameActive) {
        console.log("游戏未激活，不显示解法");
        return;
    }
    
    if (!showingSolution) {
        console.log("显示解法");
        // 暂停计时器
        clearInterval(timerInterval);
        
        // 保存当前状态
        const currentState = tiles.map(tile => ({
            row: tile.row,
            col: tile.col,
            value: tile.value,
            isEmpty: tile.isEmpty
        }));
        
        // 显示解决方案（按顺序排列）
        let counter = 1;
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                const tile = getTileAt(row, col);
                if (tile) {
                    // 最后一个位置是空的
                    if (row === gridSize - 1 && col === gridSize - 1) {
                        tile.element.textContent = '';
                        tile.element.classList.add('empty');
                        tile.value = '';
                        tile.isEmpty = true;
                    } else {
                        tile.element.textContent = counter++;
                        tile.element.classList.remove('empty');
                        tile.value = counter - 1;
                        tile.isEmpty = false;
                    }
                }
            }
        }
        
        // 设置状态
        showingSolution = true;
        solveButton.textContent = '返回游戏';
        
        // 临时存储当前状态
        localStorage.setItem('puzzle_temp_state', JSON.stringify(currentState));
        
    } else {
        console.log("返回游戏");
        // 恢复原状态
        const savedState = JSON.parse(localStorage.getItem('puzzle_temp_state'));
        if (savedState) {
            tiles.forEach((tile, index) => {
                const savedTile = savedState[index];
                tile.value = savedTile.value;
                tile.isEmpty = savedTile.isEmpty;
                
                if (savedTile.isEmpty) {
                    tile.element.textContent = '';
                    tile.element.classList.add('empty');
                    emptyTile = { row: savedTile.row, col: savedTile.col };
                } else {
                    tile.element.textContent = savedTile.value;
                    tile.element.classList.remove('empty');
                }
            });
        }
        
        // 恢复计时器
        timerInterval = setInterval(updateTimer, 1000);
        
        // 重置状态
        showingSolution = false;
        solveButton.textContent = '查看解法';
    }
}

// 显示完成对话框 - 极简风格
function showCompletionModal(time, movesCount, isNewRecord) {
    // 创建弹窗容器
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';
    
    const modalContainer = document.createElement('div');
    modalContainer.className = 'game-modal';
    
    const modalTitle = document.createElement('h2');
    modalTitle.className = 'modal-header';
    modalTitle.textContent = '恭喜完成!';
    
    const modalMessage = document.createElement('p');
    modalMessage.className = 'modal-score';
    modalMessage.innerHTML = `
        你用了 <strong>${time}</strong> 和 <strong>${movesCount}</strong> 步完成了拼图!
        ${isNewRecord ? '<br><strong>新纪录!</strong>' : ''}
    `;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'modal-buttons';
    
    const restartButton = document.createElement('button');
    restartButton.className = 'game-btn';
    restartButton.textContent = '再玩一次';
    
    restartButton.addEventListener('click', () => {
        document.body.removeChild(modalOverlay);
        resetGame();
        startGame();
    });
    
    const menuButton = document.createElement('button');
    menuButton.className = 'game-btn';
    menuButton.textContent = '返回首页';
    
    menuButton.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
    
    buttonContainer.appendChild(restartButton);
    buttonContainer.appendChild(menuButton);
    
    modalContainer.appendChild(modalTitle);
    modalContainer.appendChild(modalMessage);
    modalContainer.appendChild(buttonContainer);
    modalOverlay.appendChild(modalContainer);
    
    document.body.appendChild(modalOverlay);
}

// 洗牌功能（现在用作重新洗牌的按钮功能）
function shuffleTiles() {
    console.log("洗牌按钮被点击");
    
    if (!gameActive) {
        console.log("游戏未激活，开始新游戏");
        startGame();
        return;
    }
    
    // 已经在游戏中，只重置游戏状态但不重新创建拼图
    moves = 0;
    movesElement.textContent = '0';
    startTime = Date.now();
    clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);
    
    // 使用共享的拼图打乱逻辑
    shuffleTilesDirectly();
} 