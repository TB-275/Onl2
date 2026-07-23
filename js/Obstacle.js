class Obstacle {
    constructor(canvas, speed, type, count, image) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.speed = speed;
        this.type = type;   // 'SMALL', 'LARGE', hoặc 'BIRD'
        this.count = count;
        this.image = image;

        // XỬ LÝ QUÁI VẬT BAY (CHIM)
        if (this.type === 'BIRD') {
            this.unitWidth = 46; // Chiều rộng sải cánh
            this.height = 38;    // Chiều cao chim
            this.width = this.unitWidth; // Chim bay đơn lẻ, không đi theo cụm
            
            // TĂNG ĐỘ KHÓ: Chim bay nhanh hơn cây cối bên dưới 15%
            this.speed = speed * 1.15;   
            
            // 3 độ cao ngẫu nhiên gây bẫy tâm lý:
            const heightTier = Math.floor(Math.random() * 3);
            if (heightTier === 0) {
                // Tầm thấp: Buộc phải nhảy qua
                this.y = canvas.height - this.height - 8; 
            } else if (heightTier === 1) {
                // Tầm trung (BẪY): Đứng im thì sống, Nhảy lên là đập đầu vào chim chết!
                this.y = canvas.height - this.height - 42; 
            } else {
                // Tầm cao: Bay xẹt qua đầu gây nhiễu
                this.y = canvas.height - this.height - 85; 
            }
        } 
        // XỬ LÝ CÂY XƯƠNG RỒNG (Như cũ)
        else {
            this.unitWidth = this.type === 'SMALL' ? 20 : 28;
            this.height = this.type === 'SMALL' ? 38 : 52;
            this.width = this.unitWidth * this.count;
            this.y = canvas.height - this.height;
        }

        this.x = canvas.width;
    }

    update() {
        this.x -= this.speed;
    }

    draw() {
        if (this.type === 'BIRD') {
            this.ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            for (let i = 0; i < this.count; i++) {
                this.ctx.drawImage(
                    this.image, 
                    this.x + (i * this.unitWidth), 
                    this.y, 
                    this.unitWidth, 
                    this.height
                );
            }
        }
    }
}