var gravity;
var target;

var population;

function setup() {
  createCanvas(900, 600);
  gravity = createVector(0, .1);
  population = new Population();
  target = new Target(700, 200);
}

function draw() {
  background(0);
  target.show();

  if(population.run() == population.popSize) {
    population.evaluate();
    population.populate();
    population.select();
  }
}

function Target(x, y) {
  this.r = 40;
  this.pos = createVector(x, y);

  this.show = function() {
    push();
    noStroke();
    fill(255, 0, 0, 150);
    ellipse(this.pos.x, this.pos.y, this.r);
    pop();
  }
}


function Population() {
  this.rockets = [];
  this.popSize = 50;
  this.matingPool = [];

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

  this.populate = function() {
    this.matingPool = [];
    for(var i = 0; i < this.popSize; i++) {
      var n = floor(this.rockets[i].fitness * 100);
      for(var j = 0; j < n; j++) {
        this.matingPool.push(this.rockets[i]);
      }

    }
  }

  this.select = function() {
    for(var i = 0; i < this.popSize; i++) {
      var a = floor(random(this.matingPool.length));
      var b = floor(random(this.matingPool.length));
      var dnaA = this.matingPool[a].dna;
      var dnaB =   this.matingPool[b].dna;
      var dnaChild =  dnaA.crossover(dnaB);
      this.rockets[i] = new Rocket(dnaChild);
    }
  }
}


function Rocket(dna) {
  this.pos = createVector(10, height);
  if(dna) this.dna = dna;
  else  this.dna = new DNA();
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
      if(this.pos.y > height || this.pos.x > width) {
        this.finished = true;
        this.calcFitness();
      }
      if(this.pos.x < 0) {
        this.finished = true;
        this.calcFitness();
        this.fitness /= 1000;
      }
      if(dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y) < target.r) {
        this.finished = true;
        this.calcFitness();
        this.fitness *= 10000;
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
    this.dist = dist(this.pos.x, this.pos.y, target.pos.x, target.pos.y);
    if(this.minDist < this.dist) {
      this.minDist = this.dist;
    }
  }

  this.calcFitness = function() {
    this.fitness = 1 / this.minDist;
    this.fitness *= this.fitness;
    // this.duration = millis() - this.startTime;
    // this.fitness *= this.duration;
  }



}


function DNA(gene) {
  if(gene) this.genes = gene;
  else {
    this.genes = [];
    this.genes[0] = p5.Vector.random2D();
    this.genes[1] = random(5, 15);
  }

  this.crossover = function(partner) {
    var newGenes = [];
    for(var i = 0; i < this.genes.length; i++) {
      if(random(1) < 0.5) newGenes[i] = this.genes[i];
      else newGenes[i] = partner.genes[i];
    }

    if(random(1) < .1) newGenes[0] = p5.Vector.random2D();
    if(random(1) < .1) newGenes[1] = random(5, 15);

    return new DNA(newGenes);
  }
}
