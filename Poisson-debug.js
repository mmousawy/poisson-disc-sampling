class Poisson {
  constructor(options)
  {
    this.options = {
      maxSampleIterations: 30,
      radius: options.radius || 50,
      radiusSquare: options.radius * options.radius,
      samples: options.samples || 100,
      dimensions: {
        width: options.dimensions.width || 100,
        height: options.dimensions.height || 100
      }
    };

    this.seed = Math.random();
    this.rows = 0;
    this.columns = 0;
    this.samples = 0;
    this.activeSamples = [];
    this.cellSize = this.options.radius / Math.SQRT2;
    this.PI2 = Math.PI * 2;

    this.generateGrid();
  }

  random()
  {
    let x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  generateGrid()
  {
    this.columns = Math.ceil(this.options.dimensions.width / this.cellSize);
    this.rows = Math.ceil(this.options.dimensions.height / this.cellSize);
    this.gridSize = this.rows * this.columns;

    this.grid = Array(this.gridSize).fill(null);
    console.log(this.grid);
  }

  sample(iteration = 0)
  {
    iteration += 1;

    let coordinate = Array(2).fill(0);
    let originCircle;

    if (!this.activeSamples[0]) {
      coordinate[0] = this.random() * this.options.dimensions.width;
      coordinate[1] = this.random() * this.options.dimensions.height;
    } else {
      const angle = this.random() * this.PI2;

      coordinate[0] = this.activeSamples[0][0] + Math.cos(angle) * (this.options.radius + this.options.radius * this.random());
      coordinate[1] = this.activeSamples[0][1] + Math.sin(angle) * (this.options.radius + this.options.radius * this.random());
    }

    const gridX = Math.floor(coordinate[0] / this.cellSize);
    const gridY = Math.floor(coordinate[1] / this.cellSize);

    const gridPoint = gridX + gridY * this.columns;

    if (gridX >= 0 && gridX < this.columns && gridY >= 0 && gridY < this.rows && !this.grid[gridPoint]) {
      const addedCircle = document.createElementNS(svgNamespace, 'circle');
      utils.setProperties(addedCircle, {
        cx: coordinate[0],
        cy: coordinate[1],
        stroke: 'rgba(255, 100, 20, .1)',
        'stroke-width': this.options.radius - 4,
        r: 2,
        fill: 'rgba(255, 109, 255, .9)'
      });

      if( this.activeSamples[0]) {
        originCircle = document.createElementNS(svgNamespace, 'circle');
        utils.setProperties(originCircle, {
          cx: this.activeSamples[0][0],
          cy: this.activeSamples[0][1],
          stroke: 'rgba(15, 100, 200, .1)',
          'stroke-width': this.options.radius - 4,
          r: 2,
          fill: 'rgba(0, 255, 15, .9)'
        });
        window.canvas.appendChild(originCircle);
      }

      window.canvas.appendChild(addedCircle);

      if (!this.isValid(coordinate, gridX, gridY)) {
        window.canvas.removeChild(addedCircle);
        originCircle && window.canvas.removeChild(originCircle);
        return this.sample(iteration);
      }

      window.canvas.removeChild(addedCircle);
      originCircle && window.canvas.removeChild(originCircle);

      this.grid[gridPoint] = coordinate;
      this.samples++;
      this.activeSamples.push([
        coordinate[0],
        coordinate[1],
        0
      ]);

      return coordinate;
    } else if (this.activeSamples[0]) {
      if (this.activeSamples[0][2] < this.options.maxSampleIterations) {
        this.activeSamples[0][2]++;
      } else {
        this.activeSamples.shift();
      }

      return this.sample(iteration);
    }

    this.samples++;
    return false;
  }

  isValid(coordinate, gridX, gridY)
  {
    const searchStartPoint = [
      Math.max(0, gridX - 2),
      Math.max(0, gridY - 2)
    ];

    const searchEndPoint = [
      Math.min(this.columns, gridX + 3),
      Math.min(this.rows, gridY + 3)
    ];

    const searchArea = document.createElementNS(svgNamespace, 'rect');
    utils.setProperties(searchArea, {
      x: searchStartPoint[0] * this.cellSize,
      y: searchStartPoint[1] * this.cellSize,
      width: (searchEndPoint[0] - searchStartPoint[0]) * this.cellSize,
      height: (searchEndPoint[1] - searchStartPoint[1]) * this.cellSize,
      fill: 'none',
      stroke: 'tomato'
    });
    window.canvas.appendChild(searchArea);
    debugger;
    window.canvas.removeChild(searchArea)

    for (let y = searchStartPoint[1]; y < searchEndPoint[1]; y++) {
      for (let x = searchStartPoint[0]; x < searchEndPoint[0]; x++) {
        const neighborCell = this.grid[x + y * this.columns];

        if (neighborCell) {
          const deltaX = neighborCell[0] - coordinate[0];
          const deltaY = neighborCell[1] - coordinate[1];

          if ((deltaX * deltaX + deltaY * deltaY) < this.options.radiusSquare) {
            return false;
          }
        }
      }
    }

    return true;
  }
}
