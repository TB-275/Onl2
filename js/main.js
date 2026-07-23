let highScore = localStorage.getItem('matThuHighScore') || 0;
document.getElementById('high-score').innerText = highScore;
let currentScore = Math.floor(this.score); 

if (currentScore > highScore) {
    highScore = currentScore;
    localStorage.setItem('matThuHighScore', highScore);
    document.getElementById('high-score').innerText = highScore;
}
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');

    const imageUrls = {
        run1: 'img/khunglong.png',
        run2: 'img/khunglong.png',
        jump: 'img/khunglong.png',
        cactusSmall: 'img/cactus_s.png',
        cactusLarge: 'img/cactus.png',
        bird: 'img/bird.png'
    };

    const soundUrls = {
        jump: 'audio/jump.mp3',
        die: 'audio/die.mp3'
    };

    const images = {};
    const sounds = {};
    let assetsLoaded = 0;
    const totalAssets = Object.keys(imageUrls).length + Object.keys(soundUrls).length;

    const checkAllLoaded = () => {
        assetsLoaded++;
        if (assetsLoaded === totalAssets) {
            initGame(images, sounds);
        }
    };

    for (let key in imageUrls) {
        images[key] = new Image();
        images[key].src = imageUrls[key];
        images[key].onload = checkAllLoaded;
        images[key].onerror = checkAllLoaded; // Vẫn chạy game dù lỗi load ảnh
    }

    // Tải âm thanh
    for (let key in soundUrls) {
        sounds[key] = new Audio(soundUrls[key]);
        sounds[key].addEventListener('canplaythrough', checkAllLoaded, { once: true });
        sounds[key].onerror = checkAllLoaded; // Vẫn chạy game dù thiếu file mp3
    }

    // 2. Khởi chạy Game Loop
    function initGame(loadedImages, loadedSounds) {
        const player = new Player(canvas, loadedImages, loadedSounds);
        const gameManager = new GameManager(canvas, player, loadedImages, loadedSounds);

        // Xử lý Input chung (Phím hoặc Touch)
        const handleAction = () => {
            // NẾU POPUP MANH MỐI ĐANG MỞ -> NÚT NHẢY SẼ ĐÓNG POPUP
            if (gameManager.isPaused) {
                gameManager.resumeGame();
                return;
            }

            // NẾU GAME OVER -> CHƠI LẠI
            if (gameManager.isGameOver) {
                gameManager.reset();
                gameManager.update();
            } 
            // NẾU ĐANG CHƠI -> NHẢY
            else {
                player.jump();
            }
        };

        // Bắt phím Space hoặc ArrowUp trên PC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleAction();
            }
        });

        // Bắt thao tác chạm trên Mobile (chạm vào canvas)
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleAction();
        }, { passive: false });

        // Tắt popup khi bấm vào nút "Tiếp tục hành trình"
        document.getElementById('clue-btn').addEventListener('click', () => {
            gameManager.resumeGame();
        });

        // TẮT POPUP KHI BẤM RA KHỎI VÙNG (Bấm vào vùng nền tối #clue-overlay)
        document.getElementById('clue-overlay').addEventListener('click', (e) => {
            // Chỉ đóng khi click chuột chính xác vào vùng overlay (không phải click vào hộp nội dung bên trong)
            if (e.target.id === 'clue-overlay') {
                gameManager.resumeGame();
            }
        });

        // Bắt đầu game
        gameManager.update();
    }
});