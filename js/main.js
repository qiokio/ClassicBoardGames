// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 导航链接的平滑滚动效果
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // 减去导航栏的高度
                    behavior: 'smooth'
                });
            }
            
            // 移除所有活动类
            navLinks.forEach(link => link.classList.remove('active'));
            // 添加活动类到当前点击的链接
            this.classList.add('active');
        });
    });
    
    // 游戏卡片动画效果
    const gameCards = document.querySelectorAll('.game-card');
    
    gameCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
    
    // 当前年份更新
    const yearElement = document.createElement('span');
    yearElement.textContent = new Date().getFullYear();
    document.querySelector('footer p').innerHTML = document.querySelector('footer p').innerHTML.replace('2023', yearElement.textContent);

    // 响应式导航栏功能在未来可以在此处添加
    
    // 检查用户的游戏进度（使用localStorage）
    checkGameProgress();
});

// 检查游戏进度的函数
function checkGameProgress() {
    const games = [
        { id: 'snake', name: '贪吃蛇' },
        { id: 'memory', name: '记忆翻牌' },
        { id: 'tictactoe', name: '井字棋' },
        { id: 'hangman', name: '猜单词' },
        { id: 'puzzle', name: '数字拼图' },
        { id: 'whackamole', name: '打地鼠' }
    ];
    
    games.forEach(game => {
        const highScore = localStorage.getItem(`game_${game.id}_highscore`);
        const lastPlayed = localStorage.getItem(`game_${game.id}_lastplayed`);
        
        const gameCard = document.getElementById(`game-${game.id}`);
        if (gameCard && highScore) {
            // 创建高分标签
            const scoreElement = document.createElement('div');
            scoreElement.classList.add('high-score-badge');
            scoreElement.textContent = `最高分: ${highScore}`;
            scoreElement.style.position = 'absolute';
            scoreElement.style.top = '10px';
            scoreElement.style.right = '10px';
            scoreElement.style.backgroundColor = 'var(--accent-color)';
            scoreElement.style.color = 'white';
            scoreElement.style.padding = '0.2rem 0.5rem';
            scoreElement.style.borderRadius = '3px';
            scoreElement.style.fontSize = '0.8rem';
            
            // 设置相对定位以便放置徽章
            gameCard.style.position = 'relative';
            
            gameCard.appendChild(scoreElement);
        }
    });
} 
