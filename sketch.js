var gravity;
var target;
var targetR = 40;

var population;

function setup() {
  createCanvas(900, 600);
  gravity = createVector(0, .1);
  population = new Population();
  target = createVector(700, 200);
}

function draw() {
  background(0);
  ellipse(target.x, target.y, targetR);

  if(population.run() == population.popSize) {
    population.evaluate();
    population = new Population();
  }
}


function Population() {
  this.rockets = [];
  this.popSize = 50;

  for(var i = 0; i < this.popSize; i++) {
    this.rockets[i] = new Rocket();
  }

  this.run = function() {
    var count = 0;
    for(var i = 0; i < this.popSize; i++) {
      this.rockets[i].update();
      this.rockets[i].show();
      if(this.rockets[i].finished) count++;
    }
    return count;
  }

  this.evaluate = function() {
    var maxFit = 0;
    for(var i = 0; i < this.popSize; i++) {
      if(this.rockets[i].fitness > maxFit) maxFit = this.rockets[i].fitness;
    }
    for(var i = 0; i < this.popSize; i++) {
      this.rockets[i].fitness /= maxFit;
    }
  }
}


function Rocket() {
  this.pos = createVector(10, height);
  this.dna = new DNA();
  this.vel = this.dna.genes[0];
  this.vel.setMag(this.dna.genes[1]);
  this.fitness = 0;
  this.startTime = millis();

  this.finished = false;
  this.minDist = height * width;


  this.update = function() {
    if(!this.finished) {
      this.vel.add(gravity);
      this.pos.add(this.vel);

      this.getMinDist();
      if(this.pos.y > height) {
        this.finished = true;
        this.calcFitness();
      }
    }
  }

  this.show = function() {
    push();
    noStroke();
    fill(255);
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    rectMode(CENTER);
    rect(0, 0, 30, 5);
    pop();
  }

  this.getMinDist = function() {
    this.dist = dist(this.pos.x, this.pos.y, target.x, target.y);
    if(this.minDist < this.dist) {
      this.minDist = this.dist;
    }
  }

  this.calcFitness = function() {
    this.fitness = 1 / this.minDist;
    this.duration = millis() - this.startTime;
    this.fitness *= 1 / this.duration;
  }



}


function DNA() {
  this.genes = [];
  this.genes[0] = p5.Vector.random2D();
  this.genes[1] = random(5, 15);
}
