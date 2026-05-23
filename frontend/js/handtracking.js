/**
 * HandTracking 模块 - 手势识别
 * 使用MediaPipe Hands进行手势识别
 */

class HandTracker {
    constructor(options = {}) {
        this.videoElement = document.getElementById('cameraVideo');
        this.canvasElement = document.getElementById('handCanvas');
        this.canvasCtx = this.canvasElement.getContext('2d');
        
        this.hands = null;
        this.camera = null;
        this.isReady = false;
        this.isRunning = false;
        
        // 手势回调
        this.onGesture = options.onGesture || (() => {});
        this.onStatusChange = options.onStatusChange || (() => {});
        
        // 手势检测状态
        this.gestureCooldown = {}; // 手势冷却时间
        this.cooldownDuration = 1500; // 1.5秒冷却
        
        // 上一次检测到的手势
        this.lastGesture = null;
        this.lastGestureTime = 0;
        this.gestureHoldTime = 500; // 手势保持500ms才算有效
        
        // 手势连续检测计数
        this.gestureCounts = {
            heart: 0,
            wave: 0,
            ok: 0,
            fist: 0
        };
        this.requiredFrames = 3; // 连续检测3帧才算有效
        
        // 挥手检测
        this.waveHistory = [];
        this.waveThreshold = 5;
        
        // 初始化
        this.init();
    }
    
    /**
     * 初始化MediaPipe Hands
     */
    async init() {
        try {
            this.onStatusChange('正在加载手势识别模型...');
            
            // 加载MediaPipe Hands
            this.hands = new Hands({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1675469240/${file}`;
                }
            });
            
            // 配置参数
            this.hands.setOptions({
                maxNumHands: 1,
                modelComplexity: 1, // 0: Lite, 1: Full
                minDetectionConfidence: 0.7,
                minTrackingConfidence: 0.5
            });
            
            // 结果回调
            this.hands.onResults((results) => this.onResults(results));
            
            this.onStatusChange('手势识别模型加载完成');
            this.isReady = true;
            
        } catch (error) {
            console.error('[HandTracker] 初始化失败:', error);
            this.onStatusChange('手势识别加载失败，请刷新重试');
        }
    }
    
    /**
     * 启动摄像头和手势识别
     */
    async start() {
        if (!this.isReady) {
            console.error('[HandTracker] 尚未初始化完成');
            return false;
        }
        
        try {
            this.onStatusChange('正在请求摄像头权限...');
            
            // 请求摄像头权限
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user', // 前置摄像头
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            });
            
            this.videoElement.srcObject = stream;
            await this.videoElement.play();
            
            // 设置画布大小
            this.canvasElement.width = this.videoElement.videoWidth;
            this.canvasElement.height = this.videoElement.videoHeight;
            
            this.onStatusChange('正在启动手势识别...');
            
            // 启动摄像头处理
            this.camera = new Camera(this.videoElement, {
                onFrame: async () => {
                    await this.hands.send({ image: this.videoElement });
                },
                width: this.videoElement.videoWidth,
                height: this.videoElement.videoHeight
            });
            
            await this.camera.start();
            
            this.isRunning = true;
            this.onStatusChange('手势识别已启动');
            
            return true;
            
        } catch (error) {
            console.error('[HandTracker] 启动失败:', error);
            
            if (error.name === 'NotAllowedError') {
                this.onStatusChange('请允许访问摄像头');
            } else if (error.name === 'NotFoundError') {
                this.onStatusChange('未找到前置摄像头');
            } else {
                this.onStatusChange('摄像头启动失败');
            }
            
            return false;
        }
    }
    
    /**
     * 处理识别结果
     */
    onResults(results) {
        // 清除画布
        this.canvasCtx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // 绘制手势骨架
            this.drawHandLandmarks(landmarks);
            
            // 检测手势
            const gesture = this.detectGestures(landmarks);
            
            if (gesture) {
                this.onGesture(gesture, this.getHandCenter(landmarks));
            }
        } else {
            // 没有检测到手，清空手势计数
            this.resetGestureCounts();
            this.waveHistory = [];
        }
    }
    
    /**
     * 绘制手部骨架
     */
    drawHandLandmarks(landmarks) {
        // 绘制连接线
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // 拇指
            [0, 5], [5, 6], [6, 7], [7, 8], // 食指
            [0, 9], [9, 10], [10, 11], [11, 12], // 中指
            [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
            [0, 17], [17, 18], [18, 19], [19, 20], // 小指
            [5, 9], [9, 13], [13, 17] // 手掌
        ];
        
        this.canvasCtx.strokeStyle = '#FF6B9D';
        this.canvasCtx.lineWidth = 3;
        
        for (const [start, end] of connections) {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.canvasCtx.beginPath();
            this.canvasCtx.moveTo(startPoint.x * this.canvasElement.width, startPoint.y * this.canvasElement.height);
            this.canvasCtx.lineTo(endPoint.x * this.canvasElement.width, endPoint.y * this.canvasElement.height);
            this.canvasCtx.stroke();
        }
        
        // 绘制关节点
        for (const landmark of landmarks) {
            this.canvasCtx.beginPath();
            this.canvasCtx.arc(
                landmark.x * this.canvasElement.width,
                landmark.y * this.canvasElement.height,
                5,
                0,
                2 * Math.PI
            );
            this.canvasCtx.fillStyle = '#FFB347';
            this.canvasCtx.fill();
            this.canvasCtx.strokeStyle = '#FFFFFF';
            this.canvasCtx.lineWidth = 2;
            this.canvasCtx.stroke();
        }
    }
    
    /**
     * 检测手势
     * @param {Array} landmarks - 手部关键点
     * @returns {string|null} 手势类型
     */
    detectGestures(landmarks) {
        // 获取手指状态
        const fingers = this.getFingerStates(landmarks);
        
        // 检测各种手势
        let detectedGesture = null;
        
        // 1. 比心手势 (Heart/Giving Love)
        if (this.isHeartGesture(fingers, landmarks)) {
            this.gestureCounts.heart++;
            if (this.gestureCounts.heart >= this.requiredFrames) {
                if (this.triggerGesture('heart')) {
                    detectedGesture = 'heart';
                }
            }
        } else {
            this.gestureCounts.heart = 0;
        }
        
        // 2. 挥手手势 (Wave)
        if (this.isWaveGesture(landmarks)) {
            this.gestureCounts.wave++;
            if (this.gestureCounts.wave >= this.requiredFrames) {
                if (this.triggerGesture('wave')) {
                    detectedGesture = 'wave';
                }
            }
        } else {
            this.gestureCounts.wave = 0;
        }
        
        // 3. OK手势 (OK)
        if (this.isOkGesture(fingers, landmarks)) {
            this.gestureCounts.ok++;
            if (this.gestureCounts.ok >= this.requiredFrames) {
                if (this.triggerGesture('ok')) {
                    detectedGesture = 'ok';
                }
            }
        } else {
            this.gestureCounts.ok = 0;
        }
        
        // 4. 握拳手势 (Fist)
        if (this.isFistGesture(fingers)) {
            this.gestureCounts.fist++;
            if (this.gestureCounts.fist >= this.requiredFrames) {
                if (this.triggerGesture('fist')) {
                    detectedGesture = 'fist';
                }
            }
        } else {
            this.gestureCounts.fist = 0;
        }
        
        return detectedGesture;
    }
    
    /**
     * 获取手指状态
     * @returns {Object} 手指状态数组
     */
    getFingerStates(landmarks) {
        const fingerTips = [4, 8, 12, 16, 20]; // 指尖索引
        const fingerPips = [3, 6, 10, 14, 18]; // 第二关节索引
        
        const fingers = [];
        
        for (let i = 0; i < 5; i++) {
            const tip = landmarks[fingerTips[i]];
            const pip = landmarks[fingerPips[i]];
            const wrist = landmarks[0];
            
            if (i === 0) {
                // 拇指：比较x坐标
                const isExtended = Math.abs(tip.x - wrist.x) > 0.05;
                fingers.push(isExtended);
            } else {
                // 其他手指：y坐标 tip < pip 表示伸直
                const isExtended = tip.y < pip.y;
                fingers.push(isExtended);
            }
        }
        
        return fingers;
    }
    
    /**
     * 检测比心手势
     * 拇指和食指形成心形，中指无名指小指伸直
     */
    isHeartGesture(fingers, landmarks) {
        // 中指、无名指、小指伸直
        const extended = fingers.slice(2).every(f => f);
        if (!extended) return false;
        
        // 拇指和食指靠近形成心形
        const thumb = landmarks[4];
        const index = landmarks[8];
        const middle = landmarks[12];
        
        // 计算拇指尖和食指尖的距离
        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2)
        );
        
        // 拇指和食指靠近
        return distance < 0.08;
    }
    
    /**
     * 检测挥手手势
     * 检测手部在水平方向上的快速移动
     */
    isWaveGesture(landmarks) {
        const wrist = landmarks[0];
        const currentX = wrist.x;
        const currentY = wrist.y;
        
        // 记录手部位置历史
        this.waveHistory.push({ x: currentX, y: currentY, time: Date.now() });
        
        // 保留最近500ms的数据
        const now = Date.now();
        this.waveHistory = this.waveHistory.filter(h => now - h.time < 500);
        
        if (this.waveHistory.length < 5) return false;
        
        // 计算X方向的变化次数（穿过中线的次数）
        let crossings = 0;
        for (let i = 1; i < this.waveHistory.length; i++) {
            const prev = this.waveHistory[i - 1];
            const curr = this.waveHistory[i];
            
            // 穿过屏幕中线
            if ((prev.x - 0.5) * (curr.x - 0.5) < 0) {
                crossings++;
            }
        }
        
        return crossings >= 2;
    }
    
    /**
     * 检测OK手势
     * 拇指和食指形成圆圈，中指无名指小指伸直
     */
    isOkGesture(fingers, landmarks) {
        // 中指、无名指、小指伸直
        const extended = fingers.slice(2).every(f => f);
        if (!extended) return false;
        
        // 拇指和食指形成圆圈
        const thumb = landmarks[4];
        const index = landmarks[8];
        
        const distance = Math.sqrt(
            Math.pow(thumb.x - index.x, 2) +
            Math.pow(thumb.y - index.y, 2)
        );
        
        // 形成圆圈（距离在特定范围内）
        return distance > 0.03 && distance < 0.08;
    }
    
    /**
     * 检测握拳手势
     * 所有手指都弯曲
     */
    isFistGesture(fingers) {
        // 所有手指都弯曲
        return fingers.every(f => !f);
    }
    
    /**
     * 触发手势（带冷却）
     */
    triggerGesture(gesture) {
        const now = Date.now();
        
        // 检查冷却
        if (this.gestureCooldown[gesture] && now - this.gestureCooldown[gesture] < this.cooldownDuration) {
            return false;
        }
        
        // 检查是否是重复手势
        if (this.lastGesture === gesture && now - this.lastGestureTime < 2000) {
            return false;
        }
        
        // 设置冷却
        this.gestureCooldown[gesture] = now;
        this.lastGesture = gesture;
        this.lastGestureTime = now;
        
        return true;
    }
    
    /**
     * 重置手势计数
     */
    resetGestureCounts() {
        for (const key in this.gestureCounts) {
            this.gestureCounts[key] = 0;
        }
    }
    
    /**
     * 获取手部中心位置
     */
    getHandCenter(landmarks) {
        const wrist = landmarks[0];
        const middle = landmarks[9];
        
        return {
            x: (wrist.x + middle.x) / 2,
            y: (wrist.y + middle.y) / 2
        };
    }
    
    /**
     * 停止识别
     */
    stop() {
        if (this.camera) {
            this.camera.stop();
        }
        
        if (this.videoElement.srcObject) {
            const tracks = this.videoElement.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        }
        
        this.isRunning = false;
        this.onStatusChange('手势识别已停止');
    }
}

// 导出HandTracker类
window.HandTracker = HandTracker;
