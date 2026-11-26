let circleStartSize = 1;
let maxCircleSize = 200;

let maxGrowthRate = 2;

let numCircles = 10

let circles = [];

let canvasWidth = 800;
let canvasHeight = 600;

class Circle {
    constructor(x, y, diameter, growthRate, maxSize, color) {
        this.x = x;
        this.y = y;
        this.diameter = diameter;
        this.growthRate = growthRate;
        this.maxSize = maxSize;
        this.color = color;
    }
}


function setup() {
    createCanvas(canvasWidth, canvasHeight);

    for (let i = 0; i < numCircles; i++) {
        let x = Math.random() * canvasWidth;
        let y = Math.random() * canvasHeight;
        let growthRate = Math.random() * maxGrowthRate;
        let maxSize = Math.random() * maxCircleSize;
        let circleColor = randomColor();
        let size = circleStartSize;
        circles.push(
            new Circle(x, y, size, growthRate, maxCircleSize, circleColor)
        );
    }

}

function draw() {
    background(220);

    circles.forEach((c => {
        
        fill(c.color[0], c.color[1], c.color[2], 100);
        circle(c.x, c.y, c.diameter)
        c.diameter = (c.diameter + c.growthRate);

        if (c.diameter >= c.maxSize) {

           // Reincarnate this circle
           let x = Math.random() * canvasWidth; 
           let y = Math.random() * canvasHeight;
           c.x = x;
           c.y = y;
           c.diameter=circleStartSize;
        }
        

    }));

    // circle(200, 200, circleSize);
    // circle(400, 200, circleSize);
    // circle(400, 600, circleSize);
    // circleSize = (++circleSize % 100)

}

function randomColor() {
    return [Math.random()*255, Math.random()*255, Math.random()*255];
}

function circleDestruct(c) {
    return;
}