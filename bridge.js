class Bridge {
    constructor (num, radius, length){
        this.bodies = []; 
        this.num = num; 
        this.radius = radius; 
        this.length = length;

        this.initialize();

    }

    initialize (){
    for (let i=0; i<this.num; i++) {
        let x = width/2 + i * 20;
        let y = random(10, 40);
    
        this.bodies[i] = Bodies.circle(x, y, this.radius);
    }
    
    this.chains = Composite.create();
    Composite.add(this.chains, this.bodies);
    let options = {
        stiffness: 1,
        length: this.length
    }
    Composites.chain(this.chains, 0, 0, 0, 0, options);
    
    Composite.add(engine.world, [this.chains]);
        }

    display (){
        stroke (0);
        strokeWeight(2);
        for (let i=0; i<this.bodies.length; i++) {
            let x1 = this.bodies[i].position.x;
            let y1 = this.bodies[i].position.y;
            ellipse(x1, y1, this.radius*2, this.radius*2);
            
            let x2, y2;
            if (i < this.bodies.length - 1) {
              x2 = this.bodies[i + 1].position.x;
              y2 = this.bodies[i + 1].position.y;
              line(x1, y1, x2, y2);
            }    
          }
    }
}