/**
 * Pet 模块 - 3D猫咪渲染
 * 使用Three.js渲染一只可爱的毛茸茸风格猫咪
 */

class Pet {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.cat = null;
        this.animations = {
            idle: [],
            happy: [],
            eating: [],
            purring: []
        };
        this.currentAnimation = 'idle';
        this.particles = [];
        this.clock = new THREE.Clock();
        
        this.init();
    }
    
    /**
     * 初始化Three.js场景
     */
    init() {
        const canvas = document.getElementById('threeCanvas');
        
        // 创建场景
        this.scene = new THREE.Scene();
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 5);
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.setClearColor(0x000000, 0);
        
        // 添加光照
        this.setupLights();
        
        // 创建猫咪
        this.createCat();
        
        // 添加粒子系统
        this.createParticleSystem();
        
        // 监听窗口大小变化
        window.addEventListener('resize', () => this.onResize());
        
        // 开始动画循环
        this.animate();
    }
    
    /**
     * 设置光照
     */
    setupLights() {
        // 环境光
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        // 主光源
        const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
        mainLight.position.set(5, 5, 5);
        this.scene.add(mainLight);
        
        // 补光
        const fillLight = new THREE.DirectionalLight(0xFFE4EC, 0.4);
        fillLight.position.set(-5, 3, -5);
        this.scene.add(fillLight);
        
        // 底部反光
        const bottomLight = new THREE.DirectionalLight(0xFFF5F8, 0.3);
        bottomLight.position.set(0, -5, 3);
        this.scene.add(bottomLight);
    }
    
    /**
     * 创建猫咪模型
     */
    createCat() {
        this.cat = new THREE.Group();
        
        // 材质 - 毛茸茸效果（使用较软的材质）
        const catMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFB347, // 橙黄色猫咪
            roughness: 0.9,
            metalness: 0.0
        });
        
        const whiteMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFFAF0, // 米白色
            roughness: 0.9,
            metalness: 0.0
        });
        
        const darkMaterial = new THREE.MeshStandardMaterial({
            color: 0x4A4A4A, // 深灰色（眼睛鼻子）
            roughness: 0.5,
            metalness: 0.1
        });
        
        const pinkMaterial = new THREE.MeshStandardMaterial({
            color: 0xFFB6C1, // 粉色（耳朵内壁、腮红）
            roughness: 0.8,
            metalness: 0.0
        });
        
        // ===== 身体 =====
        const bodyGeometry = new THREE.SphereGeometry(0.6, 32, 32);
        bodyGeometry.scale(1, 0.85, 0.9);
        const body = new THREE.Mesh(bodyGeometry, catMaterial);
        body.position.y = -0.3;
        this.cat.add(body);
        
        // ===== 头部 =====
        const headGeometry = new THREE.SphereGeometry(0.5, 32, 32);
        headGeometry.scale(1, 0.95, 0.9);
        const head = new THREE.Mesh(headGeometry, catMaterial);
        head.position.y = 0.55;
        this.cat.add(head);
        
        // ===== 耳朵（左）=====
        const earGeometry = new THREE.ConeGeometry(0.18, 0.3, 4);
        const leftEar = new THREE.Mesh(earGeometry, catMaterial);
        leftEar.position.set(-0.28, 0.95, 0);
        leftEar.rotation.z = -0.3;
        this.cat.add(leftEar);
        
        // 耳朵内壁（左）
        const earInnerGeometry = new THREE.ConeGeometry(0.1, 0.2, 4);
        const leftEarInner = new THREE.Mesh(earInnerGeometry, pinkMaterial);
        leftEarInner.position.set(-0.28, 0.92, 0.02);
        leftEarInner.rotation.z = -0.3;
        this.cat.add(leftEarInner);
        
        // ===== 耳朵（右）=====
        const rightEar = new THREE.Mesh(earGeometry, catMaterial);
        rightEar.position.set(0.28, 0.95, 0);
        rightEar.rotation.z = 0.3;
        this.cat.add(rightEar);
        
        // 耳朵内壁（右）
        const rightEarInner = new THREE.Mesh(earInnerGeometry, pinkMaterial);
        rightEarInner.position.set(0.28, 0.92, 0.02);
        rightEarInner.rotation.z = 0.3;
        this.cat.add(rightEarInner);
        
        // ===== 眼睛（左）=====
        const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
        const leftEyeWhite = new THREE.Mesh(eyeGeometry, whiteMaterial);
        leftEyeWhite.position.set(-0.18, 0.6, 0.42);
        this.cat.add(leftEyeWhite);
        
        const leftEyePupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 16, 16),
            darkMaterial
        );
        leftEyePupil.position.set(-0.18, 0.6, 0.48);
        this.cat.add(leftEyePupil);
        
        // 眼睛高光
        const highlightGeometry = new THREE.SphereGeometry(0.02, 8, 8);
        const highlightMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
        const leftHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        leftHighlight.position.set(-0.2, 0.62, 0.52);
        this.cat.add(leftHighlight);
        
        // ===== 眼睛（右）=====
        const rightEyeWhite = new THREE.Mesh(eyeGeometry, whiteMaterial);
        rightEyeWhite.position.set(0.18, 0.6, 0.42);
        this.cat.add(rightEyeWhite);
        
        const rightEyePupil = new THREE.Mesh(
            new THREE.SphereGeometry(0.06, 16, 16),
            darkMaterial
        );
        rightEyePupil.position.set(0.18, 0.6, 0.48);
        this.cat.add(rightEyePupil);
        
        // 眼睛高光
        const rightHighlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
        rightHighlight.position.set(0.16, 0.62, 0.52);
        this.cat.add(rightHighlight);
        
        // ===== 鼻子 =====
        const noseGeometry = new THREE.SphereGeometry(0.05, 16, 16);
        noseGeometry.scale(1.2, 0.8, 0.8);
        const nose = new THREE.Mesh(noseGeometry, pinkMaterial);
        nose.position.set(0, 0.45, 0.48);
        this.cat.add(nose);
        
        // ===== 嘴巴 =====
        const mouthGeometry = new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI);
        const mouth = new THREE.Mesh(mouthGeometry, darkMaterial);
        mouth.position.set(0, 0.38, 0.46);
        mouth.rotation.x = Math.PI / 2;
        this.cat.add(mouth);
        
        // ===== 腮红（左）=====
        const blushGeometry = new THREE.CircleGeometry(0.08, 16);
        const leftBlush = new THREE.Mesh(blushGeometry, pinkMaterial);
        leftBlush.position.set(-0.35, 0.48, 0.4);
        leftBlush.rotation.y = 0.3;
        this.cat.add(leftBlush);
        
        // ===== 腮红（右）=====
        const rightBlush = new THREE.Mesh(blushGeometry, pinkMaterial);
        rightBlush.position.set(0.35, 0.48, 0.4);
        rightBlush.rotation.y = -0.3;
        this.cat.add(rightBlush);
        
        // ===== 前爪（左）=====
        const pawGeometry = new THREE.SphereGeometry(0.12, 16, 16);
        pawGeometry.scale(1, 0.6, 1.2);
        const leftFrontPaw = new THREE.Mesh(pawGeometry, catMaterial);
        leftFrontPaw.position.set(-0.35, -0.55, 0.35);
        this.cat.add(leftFrontPaw);
        
        const rightFrontPaw = new THREE.Mesh(pawGeometry, catMaterial);
        rightFrontPaw.position.set(0.35, -0.55, 0.35);
        this.cat.add(rightFrontPaw);
        
        // ===== 后爪（左）=====
        const leftBackPaw = new THREE.Mesh(pawGeometry, catMaterial);
        leftBackPaw.position.set(-0.3, -0.65, -0.25);
        this.cat.add(leftBackPaw);
        
        const rightBackPaw = new THREE.Mesh(pawGeometry, catMaterial);
        rightBackPaw.position.set(0.3, -0.65, -0.25);
        this.cat.add(rightBackPaw);
        
        // ===== 尾巴 =====
        const tailGroup = new THREE.Group();
        const tailSegments = 5;
        for (let i = 0; i < tailSegments; i++) {
            const segmentGeometry = new THREE.SphereGeometry(0.08 - i * 0.01, 12, 12);
            const segment = new THREE.Mesh(segmentGeometry, catMaterial);
            segment.position.set(0, i * 0.15, 0);
            tailGroup.add(segment);
        }
        tailGroup.position.set(0, -0.45, -0.6);
        tailGroup.rotation.x = -0.8;
        this.cat.add(tailGroup);
        this.tailGroup = tailGroup;
        
        // 存储身体部件引用用于动画
        this.cat.userData = {
            head: head,
            body: body,
            leftFrontPaw: leftFrontPaw,
            rightFrontPaw: rightFrontPaw,
            tailGroup: tailGroup
        };
        
        // 设置猫咪位置
        this.cat.position.set(0, -0.5, 0);
        this.cat.scale.setScalar(1.3);
        
        this.scene.add(this.cat);
    }
    
    /**
     * 创建粒子系统
     */
    createParticleSystem() {
        const particleCount = 50;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 4;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2;
            
            // 随机颜色（粉色系）
            const color = new THREE.Color();
            color.setHSL(0.95 + Math.random() * 0.08, 0.8, 0.7);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 0.08,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        this.particles = new THREE.Points(geometry, material);
        this.scene.add(this.particles);
    }
    
    /**
     * 播放特效
     * @param {string} type - 特效类型 (heart/fish/star/pet)
     * @param {number} x - X坐标（屏幕百分比）
     * @param {number} y - Y坐标（屏幕百分比）
     */
    playEffect(type, x, y) {
        const container = document.getElementById('effectContainer');
        const element = document.createElement('div');
        element.className = `effect-${type}`;
        
        // 转换屏幕坐标
        const screenX = (x || 0.5) * window.innerWidth;
        const screenY = (y || 0.5) * window.innerHeight;
        
        element.style.left = `${screenX}px`;
        element.style.top = `${screenY}px`;
        
        switch (type) {
            case 'heart':
                element.textContent = ['💖', '💗', '💕', '❤️'][Math.floor(Math.random() * 4)];
                break;
            case 'fish':
                element.textContent = ['🐟', '🐠', '🍣'][Math.floor(Math.random() * 3)];
                break;
            case 'star':
                element.textContent = ['⭐', '✨', '💫'][Math.floor(Math.random() * 3)];
                break;
            case 'pet':
                element.innerHTML = '';
                break;
        }
        
        container.appendChild(element);
        
        // 移除特效元素
        setTimeout(() => {
            element.remove();
        }, 2500);
        
        // 触发猫咪反应动画
        this.triggerReaction(type);
    }
    
    /**
     * 触发猫咪反应动画
     * @param {string} type - 反应类型
     */
    triggerReaction(type) {
        const { head, body, leftFrontPaw, rightFrontPaw, tailGroup } = this.cat.userData;
        const originalRotation = { x: head.rotation.x, y: head.rotation.y };
        
        switch (type) {
            case 'heart': // 开心 - 眼睛眯起，尾巴摇摆
                this.animateHappy();
                break;
            case 'fish': // 吃东西 - 张嘴
                this.animateEating();
                break;
            case 'star': // 蹭手 - 头偏向手的方向
                this.animateNuzzle();
                break;
            case 'pet': // 被抚摸 - 眯眼享受
                this.animatePetting();
                break;
        }
    }
    
    /**
     * 开心动画
     */
    animateHappy() {
        const { head, tailGroup } = this.cat.userData;
        const startTime = this.clock.getElapsedTime();
        const duration = 2;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            if (elapsed > duration) {
                this.resetToIdle();
                return;
            }
            
            const progress = elapsed / duration;
            const bounce = Math.sin(elapsed * 8) * 0.1 * (1 - progress);
            
            head.position.y = 0.55 + bounce;
            head.rotation.z = Math.sin(elapsed * 6) * 0.1;
            
            // 尾巴摇摆
            this.tailGroup.rotation.y = Math.sin(elapsed * 4) * 0.5;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 吃东西动画
     */
    animateEating() {
        const { head, body } = this.cat.userData;
        const startTime = this.clock.getElapsedTime();
        const duration = 1.5;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            if (elapsed > duration) {
                this.resetToIdle();
                return;
            }
            
            // 头部上下移动（咀嚼动作）
            head.position.y = 0.55 + Math.abs(Math.sin(elapsed * 12)) * 0.1;
            head.rotation.x = Math.sin(elapsed * 8) * 0.05;
            
            // 身体微微前倾
            body.rotation.x = Math.sin(elapsed * 8) * 0.02;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 蹭蹭动画
     */
    animateNuzzle() {
        const { head, leftFrontPaw, rightFrontPaw } = this.cat.userData;
        const startTime = this.clock.getElapsedTime();
        const duration = 2;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            if (elapsed > duration) {
                this.resetToIdle();
                return;
            }
            
            const progress = elapsed / duration;
            const wave = Math.sin(elapsed * 5) * 0.2;
            
            // 头偏向一侧
            head.rotation.y = wave;
            head.rotation.z = wave * 0.5;
            
            // 爪子伸出
            const pawExtend = Math.sin(elapsed * 3) * 0.1;
            leftFrontPaw.position.x = -0.35 - pawExtend;
            rightFrontPaw.position.x = 0.35 + pawExtend;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 抚摸动画
     */
    animatePetting() {
        const { head, body } = this.cat.userData;
        const startTime = this.clock.getElapsedTime();
        const duration = 2.5;
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            if (elapsed > duration) {
                this.resetToIdle();
                return;
            }
            
            // 眯眼效果（缩小头部）
            const squint = Math.sin(elapsed * 2) * 0.02;
            head.scale.y = 0.95 + squint;
            
            // 身体微微下沉（享受）
            body.position.y = -0.3 + Math.sin(elapsed * 1.5) * 0.02;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    /**
     * 重置为待机状态
     */
    resetToIdle() {
        const { head, body, leftFrontPaw, rightFrontPaw } = this.cat.userData;
        
        // 平滑恢复
        const startValues = {
            headY: head.position.y,
            headRotX: head.rotation.x,
            headRotY: head.rotation.y,
            headRotZ: head.rotation.z,
            headScaleY: head.scale.y,
            bodyRotX: body.rotation.x,
            bodyY: body.position.y,
            leftPawX: leftFrontPaw.position.x,
            rightPawX: rightFrontPaw.position.x
        };
        
        const duration = 0.5;
        const startTime = this.clock.getElapsedTime();
        
        const animate = () => {
            const elapsed = this.clock.getElapsedTime() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out
            
            head.position.y = THREE.MathUtils.lerp(startValues.headY, 0.55, eased);
            head.rotation.x = THREE.MathUtils.lerp(startValues.headRotX, 0, eased);
            head.rotation.y = THREE.MathUtils.lerp(startValues.headRotY, 0, eased);
            head.rotation.z = THREE.MathUtils.lerp(startValues.headRotZ, 0, eased);
            head.scale.y = THREE.MathUtils.lerp(startValues.headScaleY, 0.95, eased);
            body.rotation.x = THREE.MathUtils.lerp(startValues.bodyRotX, 0, eased);
            body.position.y = THREE.MathUtils.lerp(startValues.bodyY, -0.3, eased);
            leftFrontPaw.position.x = THREE.MathUtils.lerp(startValues.leftPawX, -0.35, eased);
            rightFrontPaw.position.x = THREE.MathUtils.lerp(startValues.rightPawX, 0.35, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    /**
     * 主动画循环
     */
    animate() {
        requestAnimationFrame(() => this.animate());
        
        const elapsed = this.clock.getElapsedTime();
        
        // 待机动画
        const breathe = Math.sin(elapsed * 1.5) * 0.02;
        const sway = Math.sin(elapsed * 0.8) * 0.03;
        
        if (this.cat) {
            this.cat.position.y = -0.5 + breathe;
            this.cat.rotation.y = sway;
        }
        
        // 尾巴缓慢摇摆
        if (this.tailGroup) {
            this.tailGroup.rotation.y = Math.sin(elapsed * 1.2) * 0.3;
        }
        
        // 粒子漂浮
        if (this.particles) {
            const positions = this.particles.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(elapsed + i) * 0.002;
                
                // 循环移动
                if (positions[i + 1] > 2) {
                    positions[i + 1] = -2;
                }
            }
            this.particles.geometry.attributes.position.needsUpdate = true;
            
            // 粒子旋转
            this.particles.rotation.y = elapsed * 0.05;
        }
        
        // 渲染
        this.renderer.render(this.scene, this.camera);
    }
    
    /**
     * 窗口大小变化处理
     */
    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// 导出Pet类
window.Pet = Pet;
