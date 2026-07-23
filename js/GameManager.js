// --- HÀM GIẢI MÃ CÂU HỎI (Base64 UTF-8 -> Tiếng Việt) ---
function decodeQuestion(base64Str) {
    try {
        return decodeURIComponent(
            atob(base64Str)
                .split('')
                .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
    } catch (e) {
        return base64Str; // Nếu không giải mã được Base64 thì trả lại chuỗi gốc
    }
}

class GameManager {
    constructor(canvas, player, images, sounds) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = player;
        this.images = images;
        this.sounds = sounds;
        this.obstacles = [];
        
        this.score = 0;
        this.baseSpeed = 5;
        this.maxSpeed = 18;
        this.speed = this.baseSpeed;
        
        this.frames = 0;
        this.nextSpawnFrame = 0;
        this.isGameOver = false;
        this.isPaused = false;
        
        // --- DANH SÁCH MANH MỐI (Đã linh hoạt hỗ trợ cả Ảnh & Chữ/Base64) ---
        this.clues = {
            100: "MzUgTMOgIGNvbiBnw6w/",
            200: "TmjDs20gbcOhdSBuw6BvIMSRxrDhu6NjIGfhu41pIGzDoCAibmjDs20gbcOhdSBjaHV5w6puIGNobyIgdsOsIGPDsyB0aOG7gyB0cnV54buBbiBjaG8gaOG6p3UgaOG6v3QgY8OhYyBuaMOzbSBtw6F1IGtow6FjPw==",
            300: "VHJvbmcgQuG6o25nIHR14bqnbiBob8OgbiBjw6FjIG5ndXnDqm4gdOG7kSBow7NhIGjhu41jLCBrw70gaGnhu4d1IGPhu6dhIG5ndXnDqm4gdOG7kSBJLeG7kXQgbMOgIGfDrD8=",
            400: "TuG7kXQgbmjhuqFjIExhIHRyb25nIGjhu4cgdGjhu5FuZyBrw70gaGnhu4d1IMOibSBuaOG6oWMgcXXhu5FjIHThur8gKEEsIEIsIEMsIEQsIEUsIEYsIEcpIHTGsMahbmcg4bupbmcgduG7m2kgY2jhu68gY8OhaSBuw6BvPw==",
            500: "VHJvbmcgY8OhYyBjw7RuZyB0aOG7qWMgVuG6rXQgbMO9IHTDrW5oIGNodXnhu4NuIMSR4buZbmcsIGNo4buvIGPDoWkgbsOgbyDEkcaw4bujYyBkw7luZyBsw6BtIGvDvSBoaeG7h3UgY2h14bqpbiBjaG8gVuG6rXQgdOG7kWM/",
            600: "Q0jDiCBDSFXhu5BJID0gPw==",
            700: { type: 'image', src: "img/H.png" }, // Khuyên dùng dạng object cho ảnh
            800: "Học ăn học nói học gói học mở",
            900: "Chớ thấy sóng cả mà ngã tay chèo",
            1000: "Học thầy không tày học bạn",
            1100: "Có chí thì nên",
            1200: "Học thầy không tày học bạn",
            1300: "Ăn quả nhớ kẻ trồng cây",
            1400: "Có công mài sắt có ngày nên kim",
            1500: { type: 'image', src: "img/i.jpg" }
        };
        this.unlockedClues = new Set();
        
        // --- DOM ELEMENTS (Đã đưa clueImgEl vào đúng trong Constructor) ---
        this.scoreEl = document.getElementById('score');
        this.gameOverEl = document.getElementById('game-over');
        this.clueOverlayEl = document.getElementById('clue-overlay');
        this.clueTextEl = document.getElementById('clue-text');
        this.clueImgEl = document.getElementById('clue-img'); // <-- ĐƯA VÀO ĐÂY
        
        this.scheduleNextSpawn();
    }

    scheduleNextSpawn() {
        const minGap = Math.floor(45 + (this.speed * 2.0));
        const maxGap = Math.floor(105 + (this.speed * 3.5));
        const randomGap = Math.floor(Math.random() * (maxGap - minGap + 1)) + minGap;
        this.nextSpawnFrame = this.frames + randomGap;
    }

    spawnObstacle() {
        if (this.frames >= this.nextSpawnFrame) {
            let type, img, count = 1;
            const spawnBird = (this.score > 80) && (Math.random() < 0.30);

            if (spawnBird) {
                type = 'BIRD';
                img = this.images.bird;
            } else {
                const isSmall = Math.random() > 0.45;
                type = isSmall ? 'SMALL' : 'LARGE';
                img = isSmall ? this.images.cactusSmall : this.images.cactusLarge;

                let maxCount = 1;
                if (this.score > 80) maxCount = 2;
                if (this.score > 200) maxCount = 3;
                
                count = Math.floor(Math.random() * maxCount) + 1;
            }

            this.obstacles.push(new Obstacle(this.canvas, this.speed, type, count, img));
            this.scheduleNextSpawn();
        }
    }

    checkCollision(obs) {
        const hitboxPadding = 8;
        return (
            this.player.x + hitboxPadding < obs.x + obs.width &&
            this.player.x + this.player.width - hitboxPadding > obs.x &&
            this.player.y + hitboxPadding < obs.y + obs.height &&
            this.player.y + this.player.height - hitboxPadding > obs.y
        );
    }

    checkClues() {
        let currentScore = Math.floor(this.score);
        if (this.clues[currentScore] && !this.unlockedClues.has(currentScore)) {
            this.unlockedClues.add(currentScore);
            
            const clueData = this.clues[currentScore];
            this.showClue(clueData);
        }
    }

    showClue(clue) {
        this.isPaused = true;
        let isImage = false;
        let imgSrc = '';
        let textContent = '';

        // 1. Kiểm tra nếu là Object { type: 'image', src: '...' }
        if (typeof clue === 'object' && clue !== null) {
            if (clue.type === 'image') {
                isImage = true;
                imgSrc = clue.src;
            } else {
                textContent = clue.content || '';
            }
        } 
        // 2. Kiểm tra nếu là Chuỗi (String)
        else if (typeof clue === 'string') {
            // Tự động phát hiện nếu chuỗi là đuôi ảnh (.png, .jpg...) hoặc bắt đầu bằng img/
            if (clue.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) || clue.startsWith('img/') || clue.startsWith('../')) {
                isImage = true;
                imgSrc = clue;
            } else {
                textContent = clue;
            }
        }

        // --- HIỂN THỊ LÊN MAN HÌNH ---
        if (isImage) {
            if (this.clueImgEl) {
                this.clueImgEl.src = imgSrc;
                this.clueImgEl.classList.remove('hidden');
            }
            if (this.clueTextEl) {
                this.clueTextEl.classList.add('hidden');
            }
        } else {
            // Nếu là chữ thì tiến hành giải mã Base64
            textContent = decodeQuestion(textContent);

            if (this.clueTextEl) {
                this.clueTextEl.innerText = textContent;
                this.clueTextEl.classList.remove('hidden');
            }
            if (this.clueImgEl) {
                this.clueImgEl.classList.add('hidden');
            }
        }

        if (this.clueOverlayEl) {
            this.clueOverlayEl.classList.remove('hidden');
        }
    }

    resumeGame() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.clueOverlayEl.classList.add('hidden');
        this.update();
    }

    reset() {
        this.obstacles = [];
        this.score = 0;
        this.speed = this.baseSpeed;
        this.frames = 0;
        this.isGameOver = false;
        this.isPaused = false;
        this.unlockedClues.clear();
        this.gameOverEl.classList.add('hidden');
        this.clueOverlayEl.classList.add('hidden');
        this.scheduleNextSpawn();
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.player.update();
        this.player.draw();

        this.spawnObstacle();

        for (let i = 0; i < this.obstacles.length; i++) {
            let obs = this.obstacles[i];
            obs.update();
            obs.draw();

            if (this.checkCollision(obs)) {
                this.isGameOver = true;
                this.gameOverEl.classList.remove('hidden');
                
                if (this.sounds && this.sounds.die) {
                    this.sounds.die.currentTime = 0;
                    this.sounds.die.play().catch(() => {});
                }
                return;
            }
        }

        this.obstacles = this.obstacles.filter(obs => obs.x + obs.width > 0);

        this.score += 0.12;
        this.speed = Math.min(this.maxSpeed, this.baseSpeed + (this.score * 0.012));
        
        this.frames++;
        if (this.scoreEl) {
            this.scoreEl.innerText = `Điểm: ${Math.floor(this.score)}`;
        }
        
        this.checkClues();

        requestAnimationFrame(() => this.update());
    }
}

// Chống F12 & Chuột phải
document.addEventListener('contextmenu', e => e.preventDefault());

document.addEventListener('keydown', function(e) {
    if (
        e.key === "F12" || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
    ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
});

setInterval(function() {
    const startTime = performance.now();
    (function() {}.constructor("debugger")());
    const endTime = performance.now();
    if (endTime - startTime > 100) {
        window.location.reload(); 
    }
}, 500);