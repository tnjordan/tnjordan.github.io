// Pong - Classic arcade game implementation
// Controls: Use UP and DOWN arrow keys to control your paddle

const PongGame = {
    canvas: null,
    ctx: null,
    isRunning: false,
    isPaused: false,
    animationId: null,
    
    // Game objects
    paddle1: { x: 20, y: 200, width: 15, height: 80, speed: 5 },
    paddle2: { x: 765, y: 200, width: 15, height: 80, speed: 4 },
    ball: { x: 400, y: 200, width: 15, height: 15, speedX: 4, speedY: 3 },
    
    // Game state
    score: { player: 0, computer: 0 },
    maxScore: 3,
    ballOffScreen: false,
    
    // Input handling
    keys: {},
    
    init() {
        this.canvas = document.getElementById('pongCanvas');
        if (!this.canvas) return; // Exit if canvas not found
        
        this.ctx = this.canvas.getContext('2d');
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize game state
        this.resetGame();
        this.updateMessage('Click Start to begin playing! Use ↑ and ↓ arrow keys to move your paddle.');
    },
    
    setupEventListeners() {
        // Button event listeners
        const startBtn = document.getElementById('pongStartBtn');
        const pauseBtn = document.getElementById('pongPauseBtn');
        const resetBtn = document.getElementById('pongResetBtn');
        
        if (startBtn) startBtn.addEventListener('click', () => this.start());
        if (pauseBtn) pauseBtn.addEventListener('click', () => this.togglePause());
        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        
        // Keyboard event listeners
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            // Handle game controls only when pong tab is active
            if (document.getElementById('pong')?.classList.contains('active')) {
                if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                    e.preventDefault();
                }
                
                // Space bar to start/pause
                if (e.key === ' ') {
                    e.preventDefault();
                    if (!this.isRunning) {
                        this.start();
                    } else {
                        this.togglePause();
                    }
                }
                
                // R key to reset
                if (e.key.toLowerCase() === 'r') {
                    e.preventDefault();
                    this.reset();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
    },
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            this.updateMessage('Game Started! First to 3 points wins!');
            this.gameLoop();
        }
    },
    
    togglePause() {
        if (this.isRunning) {
            this.isPaused = !this.isPaused;
            if (this.isPaused) {
                this.updateMessage('Game Paused - Click Resume or press Space to continue');
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                }
            } else {
                this.updateMessage('Game Resumed!');
                this.gameLoop();
            }
        }
    },
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        this.resetGame();
        this.updateMessage('Click Start to begin playing! Use ↑ and ↓ arrow keys to move your paddle.');
    },
    
    resetGame() {
        // Reset positions
        this.paddle1.y = (this.canvas.height - this.paddle1.height) / 2;
        this.paddle2.y = (this.canvas.height - this.paddle2.height) / 2;
        this.ball.x = this.canvas.width / 2 - this.ball.width / 2;
        this.ball.y = this.canvas.height / 2 - this.ball.height / 2;
        
        // Reset ball speed with random direction
        const direction = Math.random() > 0.5 ? 1 : -1;
        this.ball.speedX = 4 * direction;
        this.ball.speedY = (Math.random() * 4 - 2);
        
        // Reset scores and flags
        this.score.player = 0;
        this.score.computer = 0;
        this.ballOffScreen = false;
        this.updateScore();
        
        this.draw();
    },
    
    gameLoop() {
        if (!this.isRunning || this.isPaused) return;
        
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    },
    
    update() {
        // Player paddle movement with smooth controls
        const paddleSpeed = this.paddle1.speed;
        if (this.keys['ArrowUp'] && this.paddle1.y > 0) {
            this.paddle1.y -= paddleSpeed;
        }
        if (this.keys['ArrowDown'] && this.paddle1.y < this.canvas.height - this.paddle1.height) {
            this.paddle1.y += paddleSpeed;
        }
        
        // Keep player paddle in bounds
        if (this.paddle1.y < 0) this.paddle1.y = 0;
        if (this.paddle1.y > this.canvas.height - this.paddle1.height) {
            this.paddle1.y = this.canvas.height - this.paddle1.height;
        }
        
        // Computer paddle AI with improved difficulty
        const ballCenterY = this.ball.y + this.ball.height / 2;
        const paddleCenterY = this.paddle2.y + this.paddle2.height / 2;
        const difficulty = 35; // Higher number = easier AI
        
        if (paddleCenterY < ballCenterY - difficulty) {
            this.paddle2.y += this.paddle2.speed;
        } else if (paddleCenterY > ballCenterY + difficulty) {
            this.paddle2.y -= this.paddle2.speed;
        }
        
        // Keep computer paddle in bounds
        if (this.paddle2.y < 0) this.paddle2.y = 0;
        if (this.paddle2.y > this.canvas.height - this.paddle2.height) {
            this.paddle2.y = this.canvas.height - this.paddle2.height;
        }
        
        // Ball movement
        this.ball.x += this.ball.speedX;
        this.ball.y += this.ball.speedY;
        
        // Ball collision with top/bottom walls
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height - this.ball.height) {
            this.ball.speedY = -this.ball.speedY;
            this.ball.y = this.ball.y <= 0 ? 0 : this.canvas.height - this.ball.height;
        }
        
        // Ball collision with paddles
        if (this.ballCollidesWithPaddle(this.ball, this.paddle1)) {
            this.ball.speedX = Math.abs(this.ball.speedX); // Always go right
            this.ball.x = this.paddle1.x + this.paddle1.width;
            
            // Add spin based on where ball hits paddle
            const hitPos = (this.ball.y + this.ball.height/2) - (this.paddle1.y + this.paddle1.height/2);
            this.ball.speedY = hitPos * 0.1;
            
        } else if (this.ballCollidesWithPaddle(this.ball, this.paddle2)) {
            this.ball.speedX = -Math.abs(this.ball.speedX); // Always go left
            this.ball.x = this.paddle2.x - this.ball.width;
            
            // Add spin based on where ball hits paddle
            const hitPos = (this.ball.y + this.ball.height/2) - (this.paddle2.y + this.paddle2.height/2);
            this.ball.speedY = hitPos * 0.1;
        }
        
        // Limit ball speed
        const maxSpeed = 8;
        if (Math.abs(this.ball.speedY) > maxSpeed) {
            this.ball.speedY = this.ball.speedY > 0 ? maxSpeed : -maxSpeed;
        }
        if (Math.abs(this.ball.speedX) > maxSpeed) {
            this.ball.speedX = this.ball.speedX > 0 ? maxSpeed : -maxSpeed;
        }
        
        // Scoring
        if (this.ball.x < -this.ball.width && !this.ballOffScreen) {
            this.ballOffScreen = true;
            this.score.computer++;
            console.log('Computer scored! New score:', this.score);
            this.updateScore();
            this.updateMessage(`Computer scores! ${this.score.player} - ${this.score.computer}`);
            this.resetBall();
            this.checkWin();
        } else if (this.ball.x > this.canvas.width && !this.ballOffScreen) {
            this.ballOffScreen = true;
            this.score.player++;
            console.log('Player scored! New score:', this.score);
            this.updateScore();
            this.updateMessage(`You score! ${this.score.player} - ${this.score.computer}`);
            this.resetBall();
            this.checkWin();
        }
    },
    
    ballCollidesWithPaddle(ball, paddle) {
        return ball.x < paddle.x + paddle.width &&
               ball.x + ball.width > paddle.x &&
               ball.y < paddle.y + paddle.height &&
               ball.y + ball.height > paddle.y;
    },
    
    resetBall() {
        // Brief pause when ball resets
        setTimeout(() => {
            this.ball.x = this.canvas.width / 2 - this.ball.width / 2;
            this.ball.y = this.canvas.height / 2 - this.ball.height / 2;
            
            // Random direction but not too vertical
            const direction = Math.random() > 0.5 ? 1 : -1;
            this.ball.speedX = (3 + Math.random() * 2) * direction;
            this.ball.speedY = (Math.random() * 3 - 1.5);
            
            // Reset the off-screen flag
            this.ballOffScreen = false;
        }, 500);
    },
    
    checkWin() {
        if (this.score.player >= this.maxScore) {
            this.updateMessage(`🎉 YOU WIN! Final Score: ${this.score.player} - ${this.score.computer} 🎉`);
            this.endGame();
        } else if (this.score.computer >= this.maxScore) {
            this.updateMessage(`💻 Computer Wins! Final Score: ${this.score.player} - ${this.score.computer}`);
            this.endGame();
        }
    },
    
    endGame() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Show play again message
        setTimeout(() => {
            this.updateMessage(`Game Over! Click Reset to play again. Final Score: ${this.score.player} - ${this.score.computer}`);
        }, 2000);
    },
    
    draw() {
        // Clear canvas with dark background
        this.ctx.fillStyle = '#0a0a0f';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.strokeStyle = '#00ffff';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Set up glow effect
        this.ctx.shadowBlur = 15;
        
        // Draw player paddle (left) - cyan glow
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(this.paddle1.x, this.paddle1.y, this.paddle1.width, this.paddle1.height);
        
        // Draw computer paddle (right) - purple glow  
        this.ctx.shadowColor = '#8b00ff';
        this.ctx.fillStyle = '#8b00ff';
        this.ctx.fillRect(this.paddle2.x, this.paddle2.y, this.paddle2.width, this.paddle2.height);
        
        // Draw ball - pink glow
        this.ctx.shadowColor = '#ff007f';
        this.ctx.fillStyle = '#ff007f';
        this.ctx.fillRect(this.ball.x, this.ball.y, this.ball.width, this.ball.height);
        
        // Reset shadow for clean rendering
        this.ctx.shadowBlur = 0;
        this.ctx.shadowColor = 'transparent';
        
        // Draw score in top corners
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = 'bold 24px Orbitron, monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(this.score.player.toString(), 50, 40);
        
        this.ctx.textAlign = 'right';
        this.ctx.fillText(this.score.computer.toString(), this.canvas.width - 50, 40);
        
        // Draw "FIRST TO 3" text only when game is not running
        if (!this.isRunning) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.font = 'bold 20px Orbitron, monospace';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('FIRST TO 3 WINS', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.shadowColor = '#00ffff';
            this.ctx.shadowBlur = 15;
            this.ctx.fillText('FIRST TO 3 WINS', this.canvas.width / 2, this.canvas.height / 2 + 50);
            this.ctx.shadowBlur = 0;
            this.ctx.shadowColor = 'transparent';
        }
    },
    
    updateScore() {
        const playerScoreEl = document.getElementById('playerScore');
        const computerScoreEl = document.getElementById('computerScore');
        
        if (playerScoreEl) playerScoreEl.textContent = this.score.player;
        if (computerScoreEl) computerScoreEl.textContent = this.score.computer;
    },
    
    updateMessage(message) {
        const messageEl = document.getElementById('pongMessage');
        if (messageEl) messageEl.textContent = message;
    }
};

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on a page with the pong canvas
    if (document.getElementById('pongCanvas')) {
        PongGame.init();
    }
});

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PongGame;
}
