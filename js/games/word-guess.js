// 文字猜谜游戏

// 游戏数据
const wordDatabase = {
    动物: [
        {word: '熊猫', hint: '中国的国宝，黑白相间'},
        {word: '长颈鹿', hint: '脖子很长的非洲动物'},
        {word: '猫头鹰', hint: '夜间活动的猛禽'},
        {word: '袋鼠', hint: '澳大利亚有袋类动物'},
        {word: '北极熊', hint: '生活在北极的大型食肉动物'}
    ],
    水果: [
        {word: '西瓜', hint: '夏季的大型水果，红色果肉'},
        {word: '菠萝', hint: '表面有鳞片状的热带水果'},
        {word: '草莓', hint: '小型红色浆果，表面有小籽'},
        {word: '柚子', hint: '大型柑橘类水果，果肉酸甜'},
        {word: '火龙果', hint: '外表鲜艳的热带水果'}
    ],
    职业: [
        {word: '医生', hint: '治疗疾病的专业人士'},
        {word: '工程师', hint: '设计和建造的专业人员'},
        {word: '教师', hint: '传授知识的职业'},
        {word: '厨师', hint: '烹饪美食的专业人士'},
        {word: '宇航员', hint: '前往太空的专业人员'}
    ],
    城市: [
        {word: '北京', hint: '中国的首都'},
        {word: '上海', hint: '中国最大的经济中心'},
        {word: '广州', hint: '中国南方的大城市'},
        {word: '杭州', hint: '有西湖的城市'},
        {word: '成都', hint: '四川省会，有熊猫基地'}
    ],
    运动: [
        {word: '足球', hint: '全球最受欢迎的球类运动'},
        {word: '篮球', hint: '需要投篮得分的运动'},
        {word: '羽毛球', hint: '使用羽毛制成的球和拍的运动'},
        {word: '乒乓球', hint: '中国的国球'},
        {word: '游泳', hint: '在水中进行的运动'}
    ]
};

// 游戏变量
let currentWord = '';
let currentHint = '';
let guessedLetters = [];
let wrongGuesses = 0;
let gameActive = false;
const maxWrongGuesses = 6;
let highScore = localStorage.getItem('game_wordguess_highscore') || 0;
let currentScore = 0;
let currentCategory = '';

// DOM 元素
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    createKeyboard();
    
    // 添加类别选择功能
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            currentCategory = button.dataset.category;
            resetGame();
            startGame();
        });
    });
    
    // 监听开始按钮
    document.getElementById('start-btn').addEventListener('click', () => {
        if (!gameActive) {
            if (!currentCategory) {
                // 如果没有选择类别，随机选择一个
                const categories = Object.keys(wordDatabase);
                currentCategory = categories[Math.floor(Math.random() * categories.length)];
            }
            startGame();
        }
    });
    
    // 监听重置按钮
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // 监听输入字段
    document.getElementById('letter-input').addEventListener('keyup', handleInput);
    
    // 显示高分
    document.getElementById('high-score').textContent = highScore;
});

// 初始化游戏
function initializeGame() {
    // 初始化游戏状态显示
    document.getElementById('game-status').textContent = '选择一个类别或直接点击开始';
    document.getElementById('hint').textContent = '提示将在这里显示';
    document.getElementById('score').textContent = '0';
}

// 创建虚拟键盘
function createKeyboard() {
    const keyboard = document.getElementById('keyboard');
    if (!keyboard) return;
    
    // 清空键盘
    keyboard.innerHTML = '';
    
    // 创建行容器
    const row1 = document.createElement('div');
    const row2 = document.createElement('div');
    const row3 = document.createElement('div');
    const row4 = document.createElement('div');
    
    row1.className = 'keyboard-row';
    row2.className = 'keyboard-row';
    row3.className = 'keyboard-row';
    row4.className = 'keyboard-row';
    
    // 定义汉字常用拼音首字母
    const keys1 = 'QWERTYUIOP';
    const keys2 = 'ASDFGHJKL';
    const keys3 = 'ZXCVBNM';
    
    // 为每一行添加按键
    for (let key of keys1) {
        addKeyButton(row1, key);
    }
    
    for (let key of keys2) {
        addKeyButton(row2, key);
    }
    
    for (let key of keys3) {
        addKeyButton(row3, key);
    }
    
    // 添加中文常用字符（仅示例，可根据需要调整）
    const cnChars = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感';
    for (let i = 0; i < cnChars.length; i += 10) {
        const rowCn = document.createElement('div');
        rowCn.className = 'keyboard-row cn-chars';
        for (let j = i; j < i + 10 && j < cnChars.length; j++) {
            addKeyButton(rowCn, cnChars[j]);
        }
        keyboard.appendChild(rowCn);
    }
    
    // 添加空格和退格功能键
    const spaceBtn = document.createElement('button');
    spaceBtn.className = 'keyboard-key space-key';
    spaceBtn.textContent = '空格';
    spaceBtn.addEventListener('click', () => handleGuess(' '));
    
    const backspaceBtn = document.createElement('button');
    backspaceBtn.className = 'keyboard-key backspace-key';
    backspaceBtn.textContent = '退格';
    backspaceBtn.addEventListener('click', () => {
        const input = document.getElementById('letter-input');
        input.value = input.value.slice(0, -1);
    });
    
    row4.appendChild(spaceBtn);
    row4.appendChild(backspaceBtn);
    
    // 将所有行添加到键盘
    keyboard.appendChild(row1);
    keyboard.appendChild(row2);
    keyboard.appendChild(row3);
    keyboard.appendChild(row4);
    
    // 显示/隐藏中文字符按钮
    const toggleCnBtn = document.createElement('button');
    toggleCnBtn.className = 'keyboard-key toggle-cn-btn';
    toggleCnBtn.textContent = '显示/隐藏中文字符';
    toggleCnBtn.addEventListener('click', () => {
        const cnRows = document.querySelectorAll('.cn-chars');
        cnRows.forEach(row => {
            row.style.display = row.style.display === 'none' ? 'flex' : 'none';
        });
    });
    
    const toggleRow = document.createElement('div');
    toggleRow.className = 'keyboard-row';
    toggleRow.appendChild(toggleCnBtn);
    keyboard.appendChild(toggleRow);
    
    // 初始隐藏中文字符行
    document.querySelectorAll('.cn-chars').forEach(row => {
        row.style.display = 'none';
    });
}

// 添加键盘按钮
function addKeyButton(row, key) {
    const button = document.createElement('button');
    button.className = 'keyboard-key';
    button.textContent = key;
    button.addEventListener('click', () => {
        // 将按键添加到输入框
        const input = document.getElementById('letter-input');
        input.value += key.toLowerCase();
        // 自动提交如果是单个字符
        if (key.length === 1) {
            handleGuess(key.toLowerCase());
        }
    });
    row.appendChild(button);
}

// 开始游戏
function startGame() {
    if (gameActive) return;
    
    gameActive = true;
    wrongGuesses = 0;
    guessedLetters = [];
    currentScore = 0;
    
    // 从所选类别中随机选择一个词
    const wordsInCategory = wordDatabase[currentCategory];
    const randomIndex = Math.floor(Math.random() * wordsInCategory.length);
    currentWord = wordsInCategory[randomIndex].word;
    currentHint = wordsInCategory[randomIndex].hint;
    
    // 更新UI
    updateWordDisplay();
    updateHangmanDisplay();
    document.getElementById('hint').textContent = `提示: ${currentHint}`;
    document.getElementById('game-status').textContent = `游戏进行中 - 类别: ${currentCategory}`;
    document.getElementById('score').textContent = currentScore;
    
    // 启用输入
    document.getElementById('letter-input').disabled = false;
    document.getElementById('letter-input').focus();
    
    // 更新键盘状态
    updateKeyboardState();
    
    // 保存游戏记录
    localStorage.setItem('game_wordguess_lastplayed', new Date().toISOString());
}

// 重置游戏
function resetGame() {
    gameActive = false;
    wrongGuesses = 0;
    guessedLetters = [];
    currentWord = '';
    currentHint = '';
    
    // 更新UI
    document.getElementById('word-display').textContent = '';
    document.getElementById('hint').textContent = '提示将在这里显示';
    document.getElementById('game-status').textContent = '选择一个类别或点击开始';
    document.getElementById('score').textContent = '0';
    
    // 重置输入
    document.getElementById('letter-input').value = '';
    document.getElementById('letter-input').disabled = true;
    
    // 重置图形
    updateHangmanDisplay();
    
    // 重置键盘
    updateKeyboardState();
}

// 处理输入
function handleInput(event) {
    if (!gameActive) return;
    
    if (event.key === 'Enter') {
        const input = document.getElementById('letter-input');
        const guess = input.value.trim().toLowerCase();
        
        if (guess) {
            handleGuess(guess);
            input.value = '';
        }
    }
}

// 处理猜测
function handleGuess(guess) {
    if (!gameActive || guessedLetters.includes(guess)) return;
    
    guessedLetters.push(guess);
    
    // 检查猜测是否正确
    if (currentWord.toLowerCase().includes(guess)) {
        // 正确猜测
        updateWordDisplay();
        
        // 检查是否赢得游戏
        if (checkWin()) {
            endGame(true);
        }
    } else {
        // 错误猜测
        wrongGuesses++;
        updateHangmanDisplay();
        
        // 检查是否失败
        if (wrongGuesses >= maxWrongGuesses) {
            endGame(false);
        }
    }
    
    updateKeyboardState();
}

// 更新单词显示
function updateWordDisplay() {
    const wordDisplay = document.getElementById('word-display');
    let display = '';
    let allLettersGuessed = true;
    
    // 这里我们需要特殊处理中文字符
    for (let i = 0; i < currentWord.length; i++) {
        const char = currentWord[i].toLowerCase();
        if (guessedLetters.includes(char) || char === ' ') {
            display += currentWord[i] + ' ';
        } else {
            display += '_ ';
            allLettersGuessed = false;
        }
    }
    
    wordDisplay.textContent = display;
    return allLettersGuessed;
}

// 检查是否赢得游戏
function checkWin() {
    // 中文每个字符独立检查
    for (let i = 0; i < currentWord.length; i++) {
        const char = currentWord[i].toLowerCase();
        if (char !== ' ' && !guessedLetters.includes(char)) {
            return false;
        }
    }
    return true;
}

// 更新吊人图形
function updateHangmanDisplay() {
    const hangmanImg = document.getElementById('hangman-image');
    hangmanImg.src = `../images/hangman/hangman${wrongGuesses}.svg`;
}

// 更新键盘状态
function updateKeyboardState() {
    const keys = document.querySelectorAll('.keyboard-key');
    keys.forEach(key => {
        const letter = key.textContent.toLowerCase();
        if (guessedLetters.includes(letter)) {
            if (currentWord.toLowerCase().includes(letter)) {
                key.classList.add('correct');
            } else {
                key.classList.add('wrong');
            }
            key.disabled = true;
        } else {
            key.classList.remove('correct', 'wrong');
            key.disabled = false;
        }
    });
}

// 结束游戏
function endGame(isWin) {
    gameActive = false;
    
    if (isWin) {
        document.getElementById('game-status').textContent = '恭喜你赢了！';
        currentScore = calculateScore();
        document.getElementById('score').textContent = currentScore;
        
        // 更新高分
        if (currentScore > highScore) {
            highScore = currentScore;
            document.getElementById('high-score').textContent = highScore;
            localStorage.setItem('game_wordguess_highscore', highScore);
        }
        
        // 保存游戏记录
        localStorage.setItem('game_wordguess_bestscore', currentScore);
    } else {
        document.getElementById('game-status').textContent = `游戏结束！答案是: ${currentWord}`;
    }
    
    // 禁用输入
    document.getElementById('letter-input').disabled = true;
    
    // 显示完整单词
    document.getElementById('word-display').textContent = currentWord.split('').join(' ');
}

// 计算分数
function calculateScore() {
    // 基础分100，每次错误猜测减10分
    return Math.max(100 - (wrongGuesses * 10), 10);
}

// 显示提示
function showHint() {
    document.getElementById('hint').classList.add('highlight');
    setTimeout(() => {
        document.getElementById('hint').classList.remove('highlight');
    }, 1000);
}

// 监听键盘输入（用于直接输入中文字符）
document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('letter-input');
    
    inputField.addEventListener('compositionend', (e) => {
        // 处理中文输入法完成输入事件
        if (gameActive) {
            const inputValue = e.data;
            if (inputValue && inputValue.length === 1) {
                handleGuess(inputValue.toLowerCase());
                inputField.value = '';
            }
        }
    });
    
    // 提交按钮
    document.getElementById('submit-btn').addEventListener('click', () => {
        if (gameActive) {
            const guess = inputField.value.trim().toLowerCase();
            if (guess) {
                handleGuess(guess);
                inputField.value = '';
            }
        }
    });
}); 