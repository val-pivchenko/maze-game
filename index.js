const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

let cellsHorizontal = 14;
let cellsVertical = 7;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes: false,
        width: width,
        height: height
    }
});

Render.run(render);
Runner.run(Runner.create(), engine);


// Walls
const walls = [
    Bodies.rectangle(width / 2, 0, width, 5, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 5, height, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 5, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 5, height, { isStatic: true }),
];

World.add(world, walls);

// Maze generation

const shuffle = (arr) => {
    let counter = arr.length;

    while (counter > 0) {
        const i = Math.floor(Math.random() * counter);
        counter--;
        const temp = arr[counter];
        arr[counter] = arr[i];
        arr[i] = temp;
    }
    return arr;
};

const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, column) => {
    if (grid[row][column]) {
        return;
    }
    grid[row][column] = true;

    const neighbours = shuffle([
        [row - 1, column, 'up'],
        [row, column + 1, 'right'],
        [row + 1, column, 'down'],
        [row, column - 1, 'left']
    ]);

    for (let neighbour of neighbours) {
        const [nextRow, nextColumn, direction] = neighbour;

        if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
            continue;
        }

        if (grid[nextRow][nextColumn]) {
            continue;
        }

        if (direction === 'left') {
            verticals[row][column - 1] = true;
        } else if (direction === 'right') {
            verticals[row][column] = true;
        } else if (direction === 'up') {
            horizontals[row - 1][column] = true;
        } else if (direction === 'down') {
            horizontals[row][column] = true;
        }

        stepThroughCell(nextRow, nextColumn);
    }


};


stepThroughCell(startRow, startColumn);

horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX / 2, rowIndex * unitLengthY + unitLengthY, unitLengthX, 5, {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: 'red'
            }
        }
        );
        World.add(world, wall)
    });
});


verticals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
        if (open) {
            return;
        }
        const wall = Bodies.rectangle(
            columnIndex * unitLengthX + unitLengthX, rowIndex * unitLengthY + unitLengthY / 2, 5, unitLengthY, {
            isStatic: true,
            label: 'wall',
            render: {
                fillStyle: 'red'
            }
        }
        );
        World.add(world, wall)
    });
});


// Goal

const goal = Bodies.rectangle(
    width - unitLengthX / 2, height - unitLengthY / 2, unitLengthX * .6, unitLengthY * .6, {
    isStatic: true,
    label: 'goal',
    render: {
        fillStyle: 'green'
    }
});

World.add(world, goal);

//  Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 3;

const ball = Bodies.circle(
    unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: 'ball', render: {
        fillStyle: 'blue'
    }
},

);
World.add(world, ball);

document.addEventListener('keydown', e => {
    const { x, y } = ball.velocity;
    if (e.code === 'KeyW') {
        Body.setVelocity(ball, { x, y: y - 3 });
    } else if (e.code === 'KeyD') {
        Body.setVelocity(ball, { x: x + 3, y });
    } else if (e.code === 'KeyS') {
        Body.setVelocity(ball, { x, y: y + 3 });
    } else if (e.code === 'KeyA') {
        Body.setVelocity(ball, { x: x - 3, y });
    }
});

// Win Condition

Events.on(engine, 'collisionStart', e => {
    e.pairs.forEach((collision) => {
        const labels = ['ball', 'goal'];
        if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
            document.querySelector('.winner').classList.remove('hidden');
            world.gravity.y = 1;
            world.bodies.forEach(body => {
                if (body.label === 'wall') {
                    Body.setStatic(body, false);
                }
            });
        }
    })
});

const nextLevelFunc = () => {
    location.reload();
}

const nextLevelBtn = document.querySelector('.next-lvl');

nextLevelBtn.addEventListener('click', nextLevelFunc);