let gameManager = null; // Khai báo toàn cục để handleTouchStart truy cập an toàn

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
    let isGameInitialized = false;

    let imagesLoaded = 0;
    const totalImages = Object.keys(imageUrls).length;

    const checkInit = () => {
        if (!isGameInitialized) {
            isGameInitialized = true;
            initGame(images, sounds);
        }
    };

    // Preload Hình ảnh
    for (let key in imageUrls) {
        images[key] = new Image();
        images[key].src = imageUrls[key];
        images[key].onload = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) checkInit();
        };
        images[key].onerror = () => {
            imagesLoaded++;
            if (imagesLoaded === totalImages) checkInit();
        };
    }

    // Preload Âm thanh
    for (let key in soundUrls) {
        sounds[key] = new Audio(soundUrls[key]);
        sounds[key].preload = 'auto';
    }

    // Thời gian chờ tối đa 1.2s đề phòng trình duyệt mobile chặn load audio
    setTimeout(() => {
        checkInit();
    }, 1200);

    function initGame(loadedImages, loadedSounds) {
        const player = new Player(canvas, loadedImages, loadedSounds);
        gameManager = new GameManager(canvas, player, loadedImages, loadedSounds);

        // Bắt phím Space / Mũi tên lên trên PC
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault();
                handleUserAction();
            }
        });

        // Bấm nút "Tiếp tục" trong Popup Manh Mối
        const clueBtn = document.getElementById('clue-btn');
        if (clueBtn) {
            clueBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                gameManager.resumeGame();
            });
        }

        // Bấm ra nền tối để đóng Popup
        const clueOverlay = document.getElementById('clue-overlay');
        if (clueOverlay) {
            clueOverlay.addEventListener('click', (e) => {
                if (e.target.id === 'clue-overlay') {
                    gameManager.resumeGame();
                }
            });
        }

        // Chạy game
        gameManager.update();
    }
});

// --- XỬ LÝ HÀNH ĐỘNG CHUNG (PC & Mobile) ---
function handleUserAction() {
    if (!gameManager) return;

    // Mở khóa âm thanh trên điện thoại ở lần bấm/chạm đầu tiên
    if (gameManager.sounds) {
        Object.values(gameManager.sounds).forEach(sound => {
            if (sound && sound.paused) {
                sound.play().then(() => sound.pause()).catch(() => {});
            }
        });
    }

    if (gameManager.isGameOver) {
        gameManager.reset();
        gameManager.update();
    } else if (gameManager.isPaused) {
        gameManager.resumeGame();
    } else {
        if (gameManager.player && typeof gameManager.player.jump === 'function') {
            gameManager.player.jump();
        }
    }
}

// --- CẢM ỨNG CHẠM MÀN HÌNH DI ĐỘNG ---
function handleTouchStart(e) {
    if (e.target.tagName === 'BUTTON') return;
    if (e.cancelable) e.preventDefault();
    handleUserAction();
}

window.addEventListener('touchstart', handleTouchStart, { passive: false });

// --- BẢO VỆ CHỐNG F12 & CHUỘT PHẢI & DEBUGGER ---
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