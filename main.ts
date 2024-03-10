let scores: Array<number> = [0, 0 ,0]

function load_scores() {
	let result = document.cookie.match(new RegExp('scores=([^;]+)'));
	if (result) {
		scores = JSON.parse(result[1])
	}
}

function save_scores() {
	document.cookie = `scores=${JSON.stringify(scores)}; path=/`;
}

function update_scores(new_score: number) {
	let fbuffer: number = new_score;
	let sbuffer: number = new_score;

	for (let i = 0; i < 3; i++) {
		if (scores[i] < fbuffer) {
			sbuffer = scores[i];
			scores[i] = fbuffer;
			fbuffer = sbuffer;
		}
	}
}

function set_scores() {
	let score1: HTMLDivElement | null = document.querySelector("#score1");
	let score2: HTMLDivElement | null = document.querySelector("#score2");
	let score3: HTMLDivElement | null = document.querySelector("#score3");

	if (score1) score1.innerHTML = scores[0].toString();
	if (score2) score2.innerHTML = scores[1].toString();
	if (score3) score3.innerHTML = scores[2].toString();
}

class Vector2d {
	x: number;
	y: number;

	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
}

enum FieldCellType {
	Empty,
	Snake,
	Food,
	Wall,
}

class Palette {
	public snake_color: string;
	public food_color: string;
	public wall_color: string;
	public back_colors: Array<string>;

	constructor(
		snake_color: string,
		food_color: string,
		wall_color: string,
		back_colors: Array<string>
	) {
		this.snake_color = snake_color;
		this.food_color = food_color;
		this.wall_color = wall_color;
		this.back_colors = back_colors;
	}
}

class SnakePart {
	position: Vector2d;
	next: SnakePart | null;

	constructor(position: Vector2d) {
		this.position = position;
		this.next = null;
	}

	public move(to: Vector2d) {
		if (this.next !== null) {
			this.next.move(this.position);
		}
		this.position = to;
	}
}

class Snake {
	head: SnakePart;
	direction: Vector2d;

	public constructor(position: Vector2d, direction: Vector2d) {
		this.head = new SnakePart(position);
		this.direction = direction;
	}

	public move(to: Vector2d) {
		this.head.move(to);
	}
	public grow(to: Vector2d) {
		let new_head = new SnakePart(to);
		new_head.next = this.head;
		this.head = new_head;
	}
	public redirect(new_direction: Vector2d) {
		this.direction = new_direction;
	}

	public reborn() {
		this.head = new SnakePart(new Vector2d(0, 0));
		this.direction = new Vector2d(1, 0);
	}
}

class SnakeCanvasPainter {
	public size: Vector2d;
	public scale: Vector2d;

	public palette: Palette;

	public canvas: HTMLCanvasElement;
	private context: CanvasRenderingContext2D;

	public constructor(canvas: HTMLCanvasElement, size: Vector2d, scale: Vector2d, palette: Palette) {
		this.canvas = canvas;

		this.canvas.width = size.x * scale.x;
		this.canvas.height = size.y * scale.y;

		this.palette = palette;

		let maybe_context = this.canvas.getContext("2d");
		if (maybe_context === null) {
			throw "wtf";
		}

		this.context = maybe_context;

		this.size = size;
		this.scale = scale;
	}

	public draw(where: Vector2d, what: FieldCellType): void {
		switch (what) {
			case FieldCellType.Empty:
				this.draw_emptyness(where);
				break;
			case FieldCellType.Snake:
				this.draw_snake(where);
				break;
			case FieldCellType.Food:
				this.draw_food(where);
				break;
			case FieldCellType.Wall:
				this.draw_wall(where);
				break; 
		}
	}

	private get_back_color(at: Vector2d): string {
		if (this.palette.back_colors.length == 1) {
			return this.palette.back_colors[0];
		}
		return "#000000";
	}
	private draw_emptyness(where: Vector2d): void {
		this.context.beginPath();

		this.context.rect(
			where.x * this.scale.x,
			where.y * this.scale.y,
			this.scale.x,
			this.scale.y
		);
		this.context.fillStyle = this.get_back_color(where);
		this.context.fill();

		this.context.closePath();
	}
	private draw_snake(where: Vector2d): void {
		this.context.beginPath();

		this.context.rect(
			where.x * this.scale.x,
			where.y * this.scale.y,
			this.scale.x,
			this.scale.y
		);
		this.context.fillStyle = this.palette.snake_color;
		this.context.fill();

		this.context.closePath();
	}
	private draw_food(where: Vector2d): void {
		this.draw_emptyness(where);

		this.context.beginPath();

		this.context.arc(
			where.x * this.scale.x + this.scale.x / 2,
			where.y * this.scale.y + this.scale.y / 2,
			this.scale.x / 3,
			0,
			100
		);
		this.context.fillStyle = this.palette.food_color;
		this.context.fill();

		this.context.closePath();
	}
	private draw_wall(where: Vector2d): void {
		this.context.beginPath();

		this.context.rect(
			where.x * this.scale.x,
			where.y * this.scale.y,
			this.scale.x,
			this.scale.y
		);
		this.context.fillStyle = this.palette.wall_color;
		this.context.fill();

		this.context.closePath();
	}
}

class SnakeGame {
	public snake: Snake;
	private painter: SnakeCanvasPainter;
	
	private food_position: Vector2d | null;

	private next_direction: Vector2d | null;
	private next_next_direction: Vector2d | null;

	public is_paused: boolean;
	public is_dead: boolean;
	public button: HTMLButtonElement | null;

	private score: number;
	private score_element: HTMLDivElement | null;

	constructor(
		snake: Snake,
		painter: SnakeCanvasPainter,
		score_element: HTMLDivElement | null,
		button: HTMLButtonElement | null,
	) {
		this.snake = snake;
		this.painter = painter;

		this.food_position = null;

		this.next_direction = null;
		this.next_next_direction = null;

		this.is_paused = false;
		this.is_dead = false;
		this.button = button;

		this.score = 0;
		this.score_element = score_element;
	}

	public tick() {
		if (this.is_paused || this.is_dead) {
			return;
		}

		if (this.next_direction != null) {
			this.snake.direction = this.next_direction;
			this.next_direction = this.next_next_direction;
			this.next_next_direction = null;
		}

		let future_pos = new Vector2d(0, 0);
		future_pos.x += this.snake.head.position.x + this.snake.direction.x;
		future_pos.y += this.snake.head.position.y + this.snake.direction.y;

		switch (this.cell_type(future_pos)) {
			case FieldCellType.Empty:
				this.move(future_pos);
				break;
			case FieldCellType.Food:
				this.eat(future_pos);
				break;
			case FieldCellType.Snake:
			case FieldCellType.Wall:
				this.die();
				break;
		}

		this.draw();
		this.update_score();
	}
	public draw() {
		let vector = new Vector2d(0, 0);

		for (vector.y = 0; vector.y < this.painter.size.y; vector.y++) {
			for (vector.x = 0; vector.x < this.painter.size.x; vector.x++) {
				this.painter.draw(vector, this.cell_type(vector));
			}
		}
	}
	
	public redirect(direction: Vector2d) {
		if (this.is_paused) {
			if (this.button) this.button.innerHTML = "pause";
			this.is_paused = false;
		}

		if (
			(
				this.snake.direction.y == 0 &&
				direction.y != 0
			) || (
				this.snake.direction.x == 0 &&
				direction.x != 0 
			)
		) {
			this.next_direction = direction;
			return;
		}
		
		if (
			(
				(
					this.snake.direction.y == 0 &&
					direction.y == 0
				) || (
					this.snake.direction.x == 0 &&
					direction.x == 0
				)
			) && this.next_direction !== null
		) {
			this.next_next_direction = direction;
			return;
		}

		console.log(`declined`);
	}

	public pause_resume() {
		this.is_paused = !this.is_paused;

		if (!this.button) return;
		if (game.is_paused) {
			this.button.innerHTML = "resume";
		}
		else {
			this.button.innerHTML = "pause";
		}
	}
	public cell_type(at: Vector2d): FieldCellType {
		if (at.x < 0 ||
			at.y < 0 ||
			at.x >= this.painter.size.x ||
			at.y >= this.painter.size.y
		) {
			return FieldCellType.Wall;
		}
		if (this.food_position !== null &&
			this.food_position.x == at.x &&
			this.food_position.y == at.y
		) {
			return FieldCellType.Food;
		}

		let part: SnakePart | null = this.snake.head;
		while (part !== null) {
			if (part.position.x == at.x &&
				part.position.y == at.y
			) {
				return FieldCellType.Snake;
			}
			part = part.next;
		}

		return FieldCellType.Empty;
	}

	private move(to: Vector2d) {
		this.snake.move(to);
	}
	private grow(to: Vector2d) {
		this.score++;
		this.update_score();
		this.snake.grow(to);
	}
	private eat(where: Vector2d) {
		this.delete_food();
		this.grow(where);
		this.create_food();
	}
	private die() {
		console.log(`dying`);
		
		this.is_dead = true;
		if (this.button) this.button.innerHTML = "restart";

		update_scores(this.score);
		set_scores();
		save_scores();
	}

	public create_food() {
		if (this.food_position !== null) {
			this.delete_food();
		}

		let new_food_position = new Vector2d(0, 0);
		new_food_position.x = Math.floor(Math.random() * this.painter.size.x);
		new_food_position.y = Math.floor(Math.random() * this.painter.size.y);

		if (this.cell_type(new_food_position) != FieldCellType.Empty) {
			this.create_food();
			return;
		}

		this.food_position = new_food_position;
	}
	private delete_food() {
		this.food_position = null;
	}

	private update_score() {
		if (this.score_element !== null)
			this.score_element.innerHTML = this.score.toString();
	}
}

let main_canvas = document.querySelector("#main-canvas") as HTMLCanvasElement;
let speed_canvas = document.querySelector("#speed-preview-canvas") as HTMLCanvasElement;

let main_snake = new Snake(new Vector2d(0, 0), new Vector2d(1, 0));
let speed_snake = new Snake(new Vector2d(0, 0), new Vector2d(1, 0));

let palette = new Palette(
	"#EB4C42",
	"#50C878",
	"#F0EAD6",
	["#353535"]
);

let main_painter = new SnakeCanvasPainter(
	main_canvas,
	new Vector2d(32, 32),
	new Vector2d(24, 24),
	palette
);

let score_element: HTMLDivElement | null = document.querySelector("#score");
let button_element: HTMLButtonElement | null = document.querySelector("#pause-button");

let game = new SnakeGame(main_snake, main_painter, score_element, button_element);

load_scores();
set_scores();

game.create_food();
game.draw();
game.is_paused = true;

setInterval(async () => {
	game.tick();
}, 150);

function on_key_down(event: KeyboardEvent) {
	let new_direction = new Vector2d(0, 0);
	console.log(event);
	
	if (event.key == 'w') {
		new_direction.y = -1;
	}
	else if (event.key == 'a') {
		new_direction.x = -1;
	}
	else if (event.key == 's') {
		new_direction.y = 1;
	}
	else if (event.key == 'd') {
		new_direction.x = 1;
	}
	else if (event.key == 'r') {
		window.location.reload();
	}
	else {
		return;
	}

	game.redirect(new_direction);
}

let start_button: HTMLButtonElement | null = document.querySelector("#start-button");
if (start_button === null) {
	console.log("start button is null");
}

start_button?.addEventListener("click", () => {
	game.is_paused = false;
});

if (button_element !== null) {
	button_element.addEventListener("click", () => {
		if (button_element !== null) {
			if (game.is_dead) {
				window.location.reload();
				return;
			}
	
			game.pause_resume();
		}
	});
}
else {
	console.log("pause_button is null");
}
