var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
var scores = [0, 0, 0];
function load_scores() {
    var result = document.cookie.match(new RegExp('scores=([^;]+)'));
    if (result) {
        scores = JSON.parse(result[1]);
    }
}
function save_scores() {
    document.cookie = "scores=" + JSON.stringify(scores) + "; path=/";
}
function update_scores(new_score) {
    var fbuffer = new_score;
    var sbuffer = new_score;
    for (var i = 0; i < 3; i++) {
        if (scores[i] < fbuffer) {
            sbuffer = scores[i];
            scores[i] = fbuffer;
            fbuffer = sbuffer;
        }
    }
}
function set_scores() {
    var score1 = document.querySelector("#score1");
    var score2 = document.querySelector("#score2");
    var score3 = document.querySelector("#score3");
    if (score1)
        score1.innerHTML = scores[0].toString();
    if (score2)
        score2.innerHTML = scores[1].toString();
    if (score3)
        score3.innerHTML = scores[2].toString();
}
var Vector2d = /** @class */ (function () {
    function Vector2d(x, y) {
        this.x = x;
        this.y = y;
    }
    return Vector2d;
}());
var FieldCellType;
(function (FieldCellType) {
    FieldCellType[FieldCellType["Empty"] = 0] = "Empty";
    FieldCellType[FieldCellType["Snake"] = 1] = "Snake";
    FieldCellType[FieldCellType["Food"] = 2] = "Food";
    FieldCellType[FieldCellType["Wall"] = 3] = "Wall";
})(FieldCellType || (FieldCellType = {}));
var Palette = /** @class */ (function () {
    function Palette(snake_color, food_color, wall_color, back_colors) {
        this.snake_color = snake_color;
        this.food_color = food_color;
        this.wall_color = wall_color;
        this.back_colors = back_colors;
    }
    return Palette;
}());
var SnakePart = /** @class */ (function () {
    function SnakePart(position) {
        this.position = position;
        this.next = null;
    }
    SnakePart.prototype.move = function (to) {
        if (this.next !== null) {
            this.next.move(this.position);
        }
        this.position = to;
    };
    return SnakePart;
}());
var Snake = /** @class */ (function () {
    function Snake(position, direction) {
        this.head = new SnakePart(position);
        this.direction = direction;
    }
    Snake.prototype.move = function (to) {
        this.head.move(to);
    };
    Snake.prototype.grow = function (to) {
        var new_head = new SnakePart(to);
        new_head.next = this.head;
        this.head = new_head;
    };
    Snake.prototype.redirect = function (new_direction) {
        this.direction = new_direction;
    };
    Snake.prototype.reborn = function () {
        this.head = new SnakePart(new Vector2d(0, 0));
        this.direction = new Vector2d(1, 0);
    };
    return Snake;
}());
var SnakeCanvasPainter = /** @class */ (function () {
    function SnakeCanvasPainter(canvas, size, scale, palette) {
        this.canvas = canvas;
        this.canvas.width = size.x * scale.x;
        this.canvas.height = size.y * scale.y;
        this.palette = palette;
        var maybe_context = this.canvas.getContext("2d");
        if (maybe_context === null) {
            throw "wtf";
        }
        this.context = maybe_context;
        this.size = size;
        this.scale = scale;
    }
    SnakeCanvasPainter.prototype.draw = function (where, what) {
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
    };
    SnakeCanvasPainter.prototype.get_back_color = function (at) {
        if (this.palette.back_colors.length == 1) {
            return this.palette.back_colors[0];
        }
        return "#000000";
    };
    SnakeCanvasPainter.prototype.draw_emptyness = function (where) {
        this.context.beginPath();
        this.context.rect(where.x * this.scale.x, where.y * this.scale.y, this.scale.x, this.scale.y);
        this.context.fillStyle = this.get_back_color(where);
        this.context.fill();
        this.context.closePath();
    };
    SnakeCanvasPainter.prototype.draw_snake = function (where) {
        this.context.beginPath();
        this.context.rect(where.x * this.scale.x, where.y * this.scale.y, this.scale.x, this.scale.y);
        this.context.fillStyle = this.palette.snake_color;
        this.context.fill();
        this.context.closePath();
    };
    SnakeCanvasPainter.prototype.draw_food = function (where) {
        this.draw_emptyness(where);
        this.context.beginPath();
        this.context.arc(where.x * this.scale.x + this.scale.x / 2, where.y * this.scale.y + this.scale.y / 2, this.scale.x / 3, 0, 100);
        this.context.fillStyle = this.palette.food_color;
        this.context.fill();
        this.context.closePath();
    };
    SnakeCanvasPainter.prototype.draw_wall = function (where) {
        this.context.beginPath();
        this.context.rect(where.x * this.scale.x, where.y * this.scale.y, this.scale.x, this.scale.y);
        this.context.fillStyle = this.palette.wall_color;
        this.context.fill();
        this.context.closePath();
    };
    return SnakeCanvasPainter;
}());
var SnakeGame = /** @class */ (function () {
    function SnakeGame(snake, painter, score_element, button) {
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
    SnakeGame.prototype.tick = function () {
        if (this.is_paused || this.is_dead) {
            return;
        }
        if (this.next_direction != null) {
            this.snake.direction = this.next_direction;
            this.next_direction = this.next_next_direction;
            this.next_next_direction = null;
        }
        var future_pos = new Vector2d(0, 0);
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
    };
    SnakeGame.prototype.draw = function () {
        var vector = new Vector2d(0, 0);
        for (vector.y = 0; vector.y < this.painter.size.y; vector.y++) {
            for (vector.x = 0; vector.x < this.painter.size.x; vector.x++) {
                this.painter.draw(vector, this.cell_type(vector));
            }
        }
    };
    SnakeGame.prototype.redirect = function (direction) {
        if (this.is_paused) {
            if (this.button)
                this.button.innerHTML = "pause";
            this.is_paused = false;
        }
        if ((this.snake.direction.y == 0 &&
            direction.y != 0) || (this.snake.direction.x == 0 &&
            direction.x != 0)) {
            this.next_direction = direction;
            return;
        }
        if (((this.snake.direction.y == 0 &&
            direction.y == 0) || (this.snake.direction.x == 0 &&
            direction.x == 0)) && this.next_direction !== null) {
            this.next_next_direction = direction;
            return;
        }
        console.log("declined");
    };
    SnakeGame.prototype.pause_resume = function () {
        this.is_paused = !this.is_paused;
        if (!this.button)
            return;
        if (game.is_paused) {
            this.button.innerHTML = "resume";
        }
        else {
            this.button.innerHTML = "pause";
        }
    };
    SnakeGame.prototype.cell_type = function (at) {
        if (at.x < 0 ||
            at.y < 0 ||
            at.x >= this.painter.size.x ||
            at.y >= this.painter.size.y) {
            return FieldCellType.Wall;
        }
        if (this.food_position !== null &&
            this.food_position.x == at.x &&
            this.food_position.y == at.y) {
            return FieldCellType.Food;
        }
        var part = this.snake.head;
        while (part !== null) {
            if (part.position.x == at.x &&
                part.position.y == at.y) {
                return FieldCellType.Snake;
            }
            part = part.next;
        }
        return FieldCellType.Empty;
    };
    SnakeGame.prototype.move = function (to) {
        this.snake.move(to);
    };
    SnakeGame.prototype.grow = function (to) {
        this.score++;
        this.update_score();
        this.snake.grow(to);
    };
    SnakeGame.prototype.eat = function (where) {
        this.delete_food();
        this.grow(where);
        this.create_food();
    };
    SnakeGame.prototype.die = function () {
        console.log("dying");
        this.is_dead = true;
        if (this.button)
            this.button.innerHTML = "restart";
        update_scores(this.score);
        set_scores();
        save_scores();
    };
    SnakeGame.prototype.create_food = function () {
        if (this.food_position !== null) {
            this.delete_food();
        }
        var new_food_position = new Vector2d(0, 0);
        new_food_position.x = Math.floor(Math.random() * this.painter.size.x);
        new_food_position.y = Math.floor(Math.random() * this.painter.size.y);
        if (this.cell_type(new_food_position) != FieldCellType.Empty) {
            this.create_food();
            return;
        }
        this.food_position = new_food_position;
    };
    SnakeGame.prototype.delete_food = function () {
        this.food_position = null;
    };
    SnakeGame.prototype.update_score = function () {
        if (this.score_element !== null)
            this.score_element.innerHTML = this.score.toString();
    };
    return SnakeGame;
}());
var main_canvas = document.querySelector("#main-canvas");
var speed_canvas = document.querySelector("#speed-preview-canvas");
var main_snake = new Snake(new Vector2d(0, 0), new Vector2d(1, 0));
var speed_snake = new Snake(new Vector2d(0, 0), new Vector2d(1, 0));
var palette = new Palette("#EB4C42", "#50C878", "#F0EAD6", ["#353535"]);
var main_painter = new SnakeCanvasPainter(main_canvas, new Vector2d(32, 32), new Vector2d(24, 24), palette);
var score_element = document.querySelector("#score");
var button_element = document.querySelector("#pause-button");
var game = new SnakeGame(main_snake, main_painter, score_element, button_element);
load_scores();
set_scores();
game.create_food();
game.draw();
game.is_paused = true;
setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        game.tick();
        return [2 /*return*/];
    });
}); }, 150);
function on_key_down(event) {
    var new_direction = new Vector2d(0, 0);
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
var start_button = document.querySelector("#start-button");
if (start_button === null) {
    console.log("start button is null");
}
start_button === null || start_button === void 0 ? void 0 : start_button.addEventListener("click", function () {
    game.is_paused = false;
});
if (button_element !== null) {
    button_element.addEventListener("click", function () {
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
