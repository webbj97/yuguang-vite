type Point = { x: number; y: number };

const pointer = { x: 0, y: 0 };
const OFFSET = 50;

const randomColor = (): string => {
    return `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
    )}, ${Math.floor(Math.random() * 255)})`;
};

// 粒子类
class Particle {
    #w = 0;
    #h = 0;
    circle: Point = { x: 0, y: 0 };
    speed: Point = { x: 0, y: 0 };
    r = 0.8;
    color = randomColor();
    constructor(w: number, h: number) {
        this.#w = w;
        this.#h = h;
        this.circle = {
            x: randomIntBetween(0, this.#w),
            y: randomIntBetween(0, this.#h),
        };
        this.speed = {
            // 方向+速度
            x: Math.random() - 0.5,
            y: Math.random() - 0.5,
        };
    }
    update(ctx: CanvasRenderingContext2D, w: number, h: number) {
        const { circle, r, speed } = this;
        const distance = getBetween(circle, pointer);
        if (
            distance <= OFFSET &&
            pointer.x < w - r &&
            pointer.y < h - r &&
            pointer.x > r &&
            pointer.y > r
        ) {
            if (circle.x !== pointer.x) {
                circle.x = lerp(circle.x, pointer.x);
            }
            if (circle.y !== pointer.y) {
                circle.y = lerp(circle.y, pointer.y);
            }
        } else {
            circle.x += speed.x;
            circle.y += speed.y;

            // 边界碰撞反弹
            if (circle.x > w - r || circle.x < r) {
                speed.x *= -1;
            }
            if (circle.y > h - r || circle.y < r) {
                speed.y *= -1;
            }
        }
        this.draw(ctx);
    }
    draw(ctx: CanvasRenderingContext2D) {
        const { circle, r, color } = this;
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
    }
    lineTo(ctx: CanvasRenderingContext2D, particle: Particle) {
        const { circle } = this;
        const distance = getBetween(circle, particle.circle); // 统计粒子的距离
        if (distance <= OFFSET) {
            ctx.beginPath();
            ctx.moveTo(circle.x, circle.y);
            ctx.lineTo(particle.circle.x, particle.circle.y);
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = `rgba(0, 0, 0, ${(OFFSET - distance) / OFFSET})`; // 利用距离动态线条颜色
            ctx.stroke();
        }
    }
}
// Canvas面板类
class Canvas {
    w = 0;
    h = 0;
    particles: Particle[] = [];
    canvasEle?: HTMLCanvasElement;
    containerEle?: Element;
    selector: string
    constructor(selector: string) {
        this.selector =selector
    }
    rAF: number = 0;
    init() {
        // dom
        this.containerEle = document.querySelector(this.selector) as Element;
        this.canvasEle = document.getElementById("canvas") as HTMLCanvasElement;
        // number
        this.w = this.canvasEle.width = this.containerEle.clientWidth;
        this.h = this.canvasEle.height = this.containerEle.clientHeight;
        // event
        this.canvasEle.addEventListener("mousemove", (e) => {
            pointer.x = e.offsetX;
            pointer.y = e.offsetY;
        });
        this.initParticles();
    }
    initParticles() {
        for (let i = 0; i < 500; i++) {
            this.particles.push(new Particle(this.w, this.h));
        }
    }
    draw() {
        if (!this.canvasEle) {
            return;
        }
        const ctx = this.canvasEle.getContext("2d");
        if (!ctx) {
            return;
        }
        ctx.clearRect(0, 0, this.w, this.h);
        this.particles.forEach((particle, i) => {
            const { speed, circle, r } = particle;
            // 更新粒子
            particle.update(ctx, this.w, this.h);
            // 聚合粒子
            this.particles.slice(i + 1).forEach((particle2) => {
                particle.lineTo(ctx, particle2);
            });
        });

        this.rAF = requestAnimationFrame(() => this.draw());
    }

    cancel() {
        cancelAnimationFrame(this.rAF);
    }
}

function randomIntBetween(min: number, max: number) {
    return Math.floor(Math.random() * (max - min) + min + 1);
}

function getBetween(a: Point, b: Point) {
    const distanceX = Math.abs(a.x - b.x);
    const distanceY = Math.abs(a.y - b.y);
    return Math.sqrt(distanceX ** 2 + distanceY ** 2);
}

function lerp(start: number, end: number) {
    return start + (end - start) * 0.1; // 0.1 = 过渡速率
}

function init() {
    const canvas = new Canvas();
    canvas.init();
    console.log("canvas", canvas);
    canvas.draw();
}

export default Canvas;
