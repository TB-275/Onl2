class Player {
    constructor(canvas, images, sounds) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Kích thước bình thường (Khi chạy)
        this.normalWidth = 44;
        this.normalHeight = 47;
        
        // Kích thước mở rộng (Khi nhảy) - Tăng khoảng 15-20%
        this.jumpWidth = 52;
        this.jumpHeight = 56;
        
        this.width = this.normalWidth;
        this.height = this.normalHeight;
        
        this.x = 50;
        this.y = canvas.height - this.height;
        this.yVelocity = 0;
        this.gravity = 0.65;
        this.jumpStrength = -11.5; // Tăng nhẹ lực nhảy vì nhân vật to hơn
        this.isGrounded = false;
        
        this.images = images;
        this.sounds = sounds; // Nhận bộ âm thanh
        this.runFrame = 0;
    }

    jump() {
        if (this.isGrounded) {
            this.yVelocity = this.jumpStrength;
            this.isGrounded = false;
            
            // Phát âm thanh Ting Ting
            if (this.sounds && this.sounds.jump) {
                this.sounds.jump.currentTime = 0; // Reset để nhấp liên tục không bị mất tiếng
                this.sounds.jump.play().catch(() => {}); // Catch lỗi trình duyệt chặn autoplay
            }
        }
    }

  update() {
        this.yVelocity += this.gravity;
        this.y += this.yVelocity;

        // Cập nhật hitbox size theo trạng thái
        if (!this.isGrounded) {
            this.width = this.jumpWidth;
            this.height = this.jumpHeight;
        } else {
            this.width = this.normalWidth;
            this.height = this.normalHeight;
        }

        // Va chạm mặt đất
        if (this.y + this.height >= this.canvas.height) {
            this.y = this.canvas.height - this.height;
            this.yVelocity = 0;
            this.isGrounded = true;
        }
    }

    draw() {
        let currentImg = this.images.jump;

        if (this.isGrounded) {
            this.runFrame++;
            if (this.runFrame % 20 < 10) {
                currentImg = this.images.run1;
            } else {
                currentImg = this.images.run2;
            }
        }

        // Vẽ ảnh theo đúng kích thước động (width/height hiện tại)
        this.ctx.drawImage(currentImg, this.x, this.y, this.width, this.height);
    }
}