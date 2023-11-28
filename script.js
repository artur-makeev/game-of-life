import init from "./compute_grid/pkg/compute_grid.js";
await init();
import { compute_next } from "./compute_grid/pkg/compute_grid.js";

class GameOfLife {
	grid;
	nextGrid;
	cols;
	rows;
	cellSize;
	gameRunning;
	frameRate;
	ctx;
	width;
	height;
	canvas;

	heightInputId;
	widthInputId;
	resizeCellInputId;

	constructor({
		gameContainerId,
		generateRandomGridButtonId,
		widthInputId,
		heightInputId,
		resizeCanvasButtonId,
		resizeCellButtonId,
		resizeCellInputId,
		startButtomId,
		stopButtonId,
		messageId,
	}) {
		this.cellSize = 20;
		this.gameRunning = false;
		this.frameRate = 250;
		this.ctx = document.getElementById(gameContainerId).getContext('2d');
		this.canvas = document.getElementById(gameContainerId);
		this.width = document.getElementById(gameContainerId).width;
		this.height = document.getElementById(gameContainerId).height;
		this.ctx.translate(0.5, 0.5);
		this.changedCells = new Set();

		this.heightInputId = heightInputId;
		this.widthInputId = widthInputId;
		this.resizeCellInputId = resizeCellInputId;
		this.message = document.getElementById(messageId);

		document
			.getElementById(generateRandomGridButtonId)
			.addEventListener('click', this.randomGridFill.bind(this));

		document
			.getElementById(resizeCanvasButtonId)
			.addEventListener('click', this.resizeCanvas.bind(this));

		document
			.getElementById(resizeCellButtonId)
			.addEventListener('click', this.resizeCell.bind(this));

		this.canvas.addEventListener(
			'mousedown',
			function (e) {
				this.changeCellStateClick(e);
			}.bind(this),
		);

		document
			.getElementById(startButtomId)
			.addEventListener('click', this.startGame.bind(this));

		document
			.getElementById(stopButtonId)
			.addEventListener('click', this.stopGame.bind(this));
	}

	init() {
		this.cols = this.width / this.cellSize;
		this.rows = this.height / this.cellSize;
		this.grid = this.createEmptyGrid(this.rows, this.cols);
		this.drawCanvasGridLines();
		this.changedCells.clear();
	}

	startGame() {
		this.changedCells.clear();
		this.message.textContent = '';
		this.gameRunning = true;
		this.run();
		this.checkRepeat();
	}

	stopGame() {
		this.gameRunning = false;
	}

	run() {
		this.draw();
		this.grid = this.computeNext(this.grid);
		if (this.gameRunning) {
			setTimeout(() => {
				requestAnimationFrame(() => this.run());
			}, 250);
		}
	}

	createEmptyGrid(rows, cols) {
		return Array.from({ length: rows }, () => Array(cols).fill(0));
	}

	drawCanvasGridLines() {
		this.ctx.beginPath();
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = 'black';

		let offsetX = Math.floor(this.width / this.cols);
		let offsetY = Math.floor(this.height / this.rows);

		for (let x = offsetX; x < this.width; x += offsetX) {
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, this.height);
		}

		for (let y = offsetY; y < this.height; y += offsetY) {
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(this.width, y);
		}

		this.ctx.stroke();

		this.ctx.closePath();
	}

	draw() {
		this.ctx.clearRect(0, 0, this.width, this.height);

		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				let x = j * this.cellSize;
				let y = i * this.cellSize;

				if (this.grid[i][j] === 1) {
					this.ctx.beginPath();
					this.ctx.rect(y, x, this.cellSize, this.cellSize);
					this.ctx.fillStyle = 'black';
					this.ctx.fillRect(x, y, this.cellSize, this.cellSize);
					this.ctx.closePath();
				}
			}
		}
	}

	randomGridFill() {
		this.gameRunning = false;
		this.message.textContent = '';
		this.grid = this.grid.map((row) => {
			return row.map(() => (Math.random() > 0.5 ? 1 : 0));
		});
		this.draw();
	}

	resizeCanvas() {
		this.width = this.ctx.canvas.width = document.getElementById(
			this.widthInputId,
		).value;

		this.height = this.ctx.canvas.height = document.getElementById(
			this.heightInputId,
		).value;

		this.stopGame();
		this.init();
	}

	resizeCell() {
		this.cellSize = document.getElementById(this.resizeCellInputId).value;
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.stopGame();
		this.init();
	}

	hashCell(cell) {
		return (cell.row << 16) ^ cell.col;
	}

	computeNext(grid) {
		return compute_next(grid)
	}

	// countNeighbors(grid, y, x) {
	// 	let sum = 0;

	// 	for (let i = -1; i < 2; i++) {
	// 		for (let j = -1; j < 2; j++) {
	// 			const row = (y + i + this.rows) % this.rows;
	// 			const col = (x + j + this.cols) % this.cols;
	// 			sum += grid[row][col] ? 1 : 0;
	// 		}
	// 	}

	// 	sum = sum - (grid[y][x] ? 1 : 0);

	// 	return sum;
	// }

	changeCellStateClick(event) {
		this.message.textContent = '';
		const rect = this.canvas.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const y = event.clientY - rect.top;
		const row = Math.floor(y / this.cellSize);
		const col = Math.floor(x / this.cellSize);

		this.grid[row][col] = !this.grid[row][col];
		this.draw();
		this.drawCanvasGridLines();
	}

	checkGridEquality(grid1, grid2) {
		for (let i = 0; i < this.rows; i++) {
			for (let j = 0; j < this.cols; j++) {
				if (grid1[i][j] !== grid2[i][j]) {
					return false;
				}
			}
		}
		return true;
	}

	checkRepeat() {
		const interval = setInterval(() => {
			const gridCopy = structuredClone(this.grid);
			const gridNextCopy = this.computeNext(gridCopy);

			if (this.checkGridEquality(gridCopy, gridNextCopy)) {
				this.message.textContent = "Game Ended. Grid doesn't change.";
				clearInterval(interval);
				this.stopGame();
				return;
			}

			const gridAfterNext = this.computeNext(gridNextCopy);

			if (this.checkGridEquality(gridCopy, gridAfterNext)) {
				this.message.textContent = 'Game Ended. Grid had repeated pattern.';
				this.stopGame();
				clearInterval(interval);
			}
		}, 1000);
	}
}

const options = {
	gameContainerId: 'game-container',
	generateRandomGridButtonId: 'populate',
	resizeCanvasButtonId: 'resizeCanvas',
	widthInputId: 'width',
	heightInputId: 'height',
	resizeCellButtonId: 'resizeCell',
	resizeCellInputId: 'cell',
	startButtomId: 'start',
	stopButtonId: 'stop',
	messageId: 'message',
};

const game = new GameOfLife(options);
game.init();
