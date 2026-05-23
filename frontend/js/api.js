/**
 * API 模块 - 与后端通信
 * 管理宠物属性数据的获取和保存
 */

const API = {
    // 后端API基础URL - 可根据实际部署环境修改
    baseURL: 'https://api.example.com', // TODO: 替换为实际后端地址
    
    // 用户标识（通常从登录态获取，这里使用本地存储）
    userId: null,
    
    /**
     * 初始化API模块
     */
    init() {
        // 生成或获取用户ID
        this.userId = localStorage.getItem('petUserId');
        if (!this.userId) {
            this.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('petUserId', this.userId);
        }
        
        console.log('[API] 已初始化，用户ID:', this.userId);
    },
    
    /**
     * 获取宠物属性
     * @returns {Promise<Object>} 宠物属性对象
     */
    async getPetAttributes() {
        try {
            // 尝试从后端获取
            const response = await fetch(`${this.baseURL}/pet/${this.userId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('[API] 获取属性成功:', data);
                return data;
            }
        } catch (error) {
            console.log('[API] 后端不可用，使用本地存储');
        }
        
        // 后端不可用时使用本地存储
        return this.getLocalAttributes();
    },
    
    /**
     * 保存宠物属性到后端
     * @param {Object} attributes - 宠物属性
     */
    async savePetAttributes(attributes) {
        // 同时保存到本地
        this.saveLocalAttributes(attributes);
        
        try {
            const response = await fetch(`${this.baseURL}/pet/${this.userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: this.userId,
                    ...attributes,
                    updatedAt: new Date().toISOString()
                })
            });
            
            if (response.ok) {
                console.log('[API] 保存属性成功');
                return true;
            }
        } catch (error) {
            console.log('[API] 后端不可用，数据已本地保存');
        }
        
        return false;
    },
    
    /**
     * 更新单个属性
     * @param {string} key - 属性名 (hunger/happiness/love)
     * @param {number} value - 属性值
     */
    async updateAttribute(key, value) {
        const attributes = await this.getPetAttributes();
        
        // 确保数值在有效范围内
        if (key === 'hunger' || key === 'happiness' || key === 'love') {
            attributes[key] = Math.max(0, Math.min(100, value));
        }
        
        return this.savePetAttributes(attributes);
    },
    
    /**
     * 从本地存储获取属性
     */
    getLocalAttributes() {
        const stored = localStorage.getItem('petAttributes');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                // 检查是否需要重置（跨天）
                const lastDate = data.lastDate;
                const today = new Date().toDateString();
                
                if (lastDate !== today) {
                    // 新的一天，轻微减少属性（模拟离线时间）
                    const hoursSinceLastUpdate = lastDate ? 
                        (new Date() - new Date(lastDate)) / (1000 * 60 * 60) : 0;
                    const reduction = Math.min(hoursSinceLastUpdate * 0.5, 20);
                    
                    data.hunger = Math.max(20, (data.hunger || 80) - reduction);
                    data.happiness = Math.max(20, (data.happiness || 80) - reduction * 0.5);
                    data.love = Math.max(20, (data.love || 80) - reduction * 0.3);
                }
                
                return data;
            } catch (e) {
                console.error('[API] 解析本地数据失败:', e);
            }
        }
        
        // 默认属性
        return {
            hunger: 80,
            happiness: 80,
            love: 80,
            lastDate: new Date().toDateString()
        };
    },
    
    /**
     * 保存属性到本地存储
     * @param {Object} attributes - 宠物属性
     */
    saveLocalAttributes(attributes) {
        const data = {
            ...attributes,
            lastDate: new Date().toDateString()
        };
        localStorage.setItem('petAttributes', JSON.stringify(data));
    },
    
    /**
     * 重置宠物属性（用于测试或用户请求）
     */
    resetAttributes() {
        const defaultAttributes = {
            hunger: 80,
            happiness: 80,
            love: 80,
            lastDate: new Date().toDateString()
        };
        this.saveLocalAttributes(defaultAttributes);
        return defaultAttributes;
    }
};

// 初始化API模块
API.init();
