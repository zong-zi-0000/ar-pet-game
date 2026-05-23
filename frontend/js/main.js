/**
 * Main 模块 - 游戏主入口
 * 协调各个模块，管理游戏状态
 */

class Game {
    constructor() {
        this.pet = null;
        this.handTracker = null;
        this.attributes = {
            hunger: 80,      // 饥饿度
            happiness: 80,    // 开心值
            love: 80          // 亲密度
        };
        
        // 衰减配置
        this.decayRates = {
            hunger: 2,        // 每分钟-2
            happiness: 1,     // 每分钟-1
            love: 0.5         // 每分钟-0.5
        };
        
        this.decayInterval = null;
        this.lastUpdateTime = Date.now();
        
        // UI元素
        this.elements = {};
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化游戏
     */
    init() {
        console.log('[Game] 正在初始化...');
        
        // 缓存UI元素
        this.cacheElements();
        
        // 绑定事件
        this.bindEvents();
        
        // 加载保存的属性
        this.loadAttributes();
        
        console.log('[Game] 初始化完成');
    }
    
    /**
     * 缓存UI元素
     */
    cacheElements() {
        this.elements = {
            permissionModal: document.getElementById('permissionModal'),
            startButton: document.getElementById('startButton'),
            gestureStatus: document.getElementById('gestureStatus'),
            hungerBar: document.getElementById('hungerBar'),
            happyBar: document.getElementById('happyBar'),
            loveBar: document.getElementById('loveBar'),
            hungerValue: document.getElementById('hungerValue'),
            happyValue: document.getElementById('happyValue'),
            loveValue: document.getElementById('loveValue'),
            hintHeart: document.getElementById('hintHeart'),
            hintWave: document.getElementById('hintWave'),
            hintOk: document.getElementById('hintOk'),
            hintFist: document.getElementById('hintFist')
        };
    }
    
    /**
     * 绑定事件
     */
    bindEvents() {
        // 开始按钮
        this.elements.startButton.addEventListener('click', () => this.start());
        
        // 键盘快捷键（用于桌面测试）
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    /**
     * 键盘快捷键处理
     */
    handleKeyboard(e) {
        const keyMap = {
            '1': 'heart',
            '2': 'wave',
            '3': 'ok',
            '4': 'fist'
        };
        
        if (keyMap[e.key]) {
            this.onGestureDetected(keyMap[e.key], { x: 0.5, y: 0.5 });
        }
    }
    
    /**
     * 加载保存的属性
     */
    async loadAttributes() {
        const saved = await API.getPetAttributes();
        
        this.attributes.hunger = saved.hunger ?? 80;
        this.attributes.happiness = saved.happiness ?? 80;
        this.attributes.love = saved.love ?? 80;
        
        this.updateUI();
        console.log('[Game] 已加载属性:', this.attributes);
    }
    
    /**
     * 开始游戏
     */
    async start() {
        // 隐藏权限模态框
        this.elements.permissionModal.classList.add('hidden');
        
        // 初始化3D宠物
        this.initPet();
        
        // 初始化手势追踪
        await this.initHandTracking();
        
        // 开始属性衰减
        this.startDecay();
        
        this.showNotification('游戏开始！用手势和猫咪互动吧~');
    }
    
    /**
     * 初始化3D宠物
     */
    initPet() {
        console.log('[Game] 初始化3D宠物...');
        this.pet = new Pet();
    }
    
    /**
     * 初始化手势追踪
     */
    async initHandTracking() {
        console.log('[Game] 初始化手势追踪...');
        
        this.handTracker = new HandTracker({
            onGesture: (gesture, position) => {
                this.onGestureDetected(gesture, position);
            },
            onStatusChange: (status) => {
                this.updateGestureStatus(status);
            }
        });
        
        // 等待初始化
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 启动摄像头
        const started = await this.handTracker.start();
        
        if (!started) {
            this.elements.gestureStatus.textContent = '摄像头启动失败，请刷新重试';
            this.elements.gestureStatus.classList.add('error');
        }
    }
    
    /**
     * 手势检测回调
     */
    onGestureDetected(gesture, position) {
        console.log('[Game] 检测到手势:', gesture);
        
        // 更新手势提示高亮
        this.highlightHint(gesture);
        
        // 更新状态显示
        this.elements.gestureStatus.textContent = this.getGestureName(gesture);
        this.elements.gestureStatus.classList.add('success');
        setTimeout(() => {
            this.elements.gestureStatus.classList.remove('success');
        }, 500);
        
        // 根据手势类型触发不同效果
        switch (gesture) {
            case 'heart':
                this.handleHeartGesture(position);
                break;
            case 'wave':
                this.handleWaveGesture(position);
                break;
            case 'ok':
                this.handleOkGesture(position);
                break;
            case 'fist':
                this.handleFistGesture(position);
                break;
        }
        
        // 保存属性
        this.saveAttributes();
    }
    
    /**
     * 比心手势 - 开心值+10，播放爱心特效
     */
    handleHeartGesture(position) {
        this.attributes.happiness = Math.min(100, this.attributes.happiness + 10);
        this.updateUI();
        
        // 播放多个爱心特效
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.pet.playEffect('heart', position.x + (Math.random() - 0.5) * 0.3, position.y);
            }, i * 150);
        }
        
        this.showNotification('开心值 +10 💖');
    }
    
    /**
     * 挥手手势 - 亲密度+10，蹭蹭特效
     */
    handleWaveGesture(position) {
        this.attributes.love = Math.min(100, this.attributes.love + 10);
        this.updateUI();
        
        // 播放星星特效
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                this.pet.playEffect('star', position.x + (Math.random() - 0.5) * 0.3, position.y);
            }, i * 100);
        }
        
        this.showNotification('亲密度 +10 ⭐');
    }
    
    /**
     * OK手势 - 饥饿度+15，小鱼干特效
     */
    handleOkGesture(position) {
        this.attributes.hunger = Math.min(100, this.attributes.hunger + 15);
        this.updateUI();
        
        // 播放小鱼特效
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                this.pet.playEffect('fish', position.x + (Math.random() - 0.5) * 0.2, position.y);
            }, i * 200);
        }
        
        this.showNotification('猫咪吃饱啦！🐟');
    }
    
    /**
     * 握拳手势 - 抚摸特效
     */
    handleFistGesture(position) {
        // 握拳不增加属性，但播放抚摸特效
        this.pet.playEffect('pet', position.x, position.y);
        
        this.showNotification('舒服~ 😌');
    }
    
    /**
     * 高亮手势提示
     */
    highlightHint(gesture) {
        const hintMap = {
            'heart': this.elements.hintHeart,
            'wave': this.elements.hintWave,
            'ok': this.elements.hintOk,
            'fist': this.elements.hintFist
        };
        
        const hint = hintMap[gesture];
        if (hint) {
            hint.classList.add('active');
            setTimeout(() => hint.classList.remove('active'), 1000);
        }
    }
    
    /**
     * 获取手势名称
     */
    getGestureName(gesture) {
        const names = {
            'heart': '检测到比心！💖',
            'wave': '检测到挥手！✋',
            'ok': '检测到OK！👌',
            'fist': '检测到握拳！✊'
        };
        return names[gesture] || '未知手势';
    }
    
    /**
     * 更新手势识别状态
     */
    updateGestureStatus(status) {
        this.elements.gestureStatus.textContent = status;
        
        if (status.includes('启动') || status.includes('完成')) {
            this.elements.gestureStatus.classList.add('detecting');
        } else {
            this.elements.gestureStatus.classList.remove('detecting');
        }
    }
    
    /**
     * 更新UI
     */
    updateUI() {
        // 更新进度条
        this.elements.hungerBar.style.width = `${this.attributes.hunger}%`;
        this.elements.happyBar.style.width = `${this.attributes.happiness}%`;
        this.elements.loveBar.style.width = `${this.attributes.love}%`;
        
        // 更新数值
        this.elements.hungerValue.textContent = Math.round(this.attributes.hunger);
        this.elements.happyValue.textContent = Math.round(this.attributes.happiness);
        this.elements.loveValue.textContent = Math.round(this.attributes.love);
    }
    
    /**
     * 开始属性衰减
     */
    startDecay() {
        // 每秒更新一次
        this.decayInterval = setInterval(() => {
            this.updateDecay();
        }, 1000);
    }
    
    /**
     * 更新属性衰减
     */
    updateDecay() {
        const now = Date.now();
        const elapsed = (now - this.lastUpdateTime) / 1000; // 秒
        const minutes = elapsed / 60;
        
        // 计算衰减
        this.attributes.hunger = Math.max(0, this.attributes.hunger - this.decayRates.hunger * minutes);
        this.attributes.happiness = Math.max(0, this.attributes.happiness - this.decayRates.happiness * minutes);
        this.attributes.love = Math.max(0, this.attributes.love - this.decayRates.love * minutes);
        
        this.lastUpdateTime = now;
        
        // 更新UI
        this.updateUI();
        
        // 每30秒保存一次
        if (Math.random() < 0.033) {
            this.saveAttributes();
        }
        
        // 属性过低时提醒
        this.checkLowAttributes();
    }
    
    /**
     * 检查属性是否过低
     */
    checkLowAttributes() {
        if (this.attributes.hunger < 20) {
            this.showNotification('猫咪饿了...😿', 'warning');
        }
        if (this.attributes.happiness < 20) {
            this.showNotification('猫咪不开心...😢', 'warning');
        }
        if (this.attributes.love < 20) {
            this.showNotification('猫咪想你了...🥺', 'warning');
        }
    }
    
    /**
     * 保存属性
     */
    async saveAttributes() {
        await API.savePetAttributes(this.attributes);
    }
    
    /**
     * 显示通知
     */
    showNotification(message, type = 'success') {
        // 移除现有通知
        const existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        
        // 根据类型设置样式
        if (type === 'warning') {
            notification.style.background = 'linear-gradient(135deg, #FFB347, #FF8C42)';
        }
        
        document.body.appendChild(notification);
        
        // 触发动画
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 自动移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 400);
        }, 2500);
    }
}

// 全局游戏实例
let game = null;

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('[Main] 页面加载完成');
    game = new Game();
});
