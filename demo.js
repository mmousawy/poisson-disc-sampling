class Point {
  constructor(poisson, totalTime)
  {
    const t0 = performance.now();
    const sample = poisson.sample();
    const t1 = performance.now();

    if (sample) {
      this.x = sample[0];
      this.y = sample[1];
      this.radius = poisson.options.radius;
      this.body = document.createElementNS(svgNamespace, 'circle');
      this.draw();
      window.canvas.appendChild(this.body);
    }

    return {
      success: sample,
      time: t1 - t0
    }
  }

  draw()
  {
    utils.setProperties(this.body, {
      cx: this.x,
      cy: this.y,
      'stroke-width': this.radius - 6,
      r: 3,
      fill: 'rgba(74, 109, 255, .9)'
    });
  }
}

class PoissonDemoCanvas
{
  constructor(options)
  {
    this.output = document.createElement('div');
    this.output.classList.add('output');
    document.querySelector('.overlay').appendChild(this.output);
    this.canvas = document.createElementNS(svgNamespace, 'svg');
    this.successfulSamples = 0;
    this.totalTime = 0;
    this.options = {
      samples: options.samples || 100
    };

    this.fastPoisson = new fastPoisson(options.poissonOptions);

    utils.setProperties(this.canvas, {
      width: options.poissonOptions.dimensions.width,
      height: options.poissonOptions.dimensions.height
    });

    document.body.appendChild(this.canvas);

    // Draw grid
    const gridPath = document.createElementNS(svgNamespace, 'path');
    const gridData = [];

    // Vertical lines
    for (let rowIndex = 1; rowIndex < this.fastPoisson.rows; rowIndex++) {
      gridData.push(`M 0,${this.fastPoisson.cellSize * rowIndex}`);
      gridData.push(`L ${this.fastPoisson.options.dimensions.width},${this.fastPoisson.cellSize * rowIndex}`);
    }

    // Horizontal lines
    for (let columnIndex = 1; columnIndex < this.fastPoisson.columns; columnIndex++) {
      gridData.push(`M ${this.fastPoisson.cellSize * columnIndex},0`);
      gridData.push(`L ${this.fastPoisson.cellSize * columnIndex},${this.fastPoisson.options.dimensions.height}`);
    }

    utils.setProperties(gridPath, {
      d: gridData.join(' ')
    });

    this.canvas.appendChild(gridPath);
    window.canvas = this.canvas;

    let samplesCount = this.options.samples;

    while (samplesCount > 0) {
      if (this.addPoint()) {
        this.successfulSamples++;
      }
      samplesCount--;
    }

    this.output.textContent = `${this.successfulSamples}/${this.options.samples} successful samples taken in ${this.totalTime.toFixed(2)} ms`;
  }

  addPoint()
  {
    const point = new Point(this.fastPoisson, this.totalTime);
    this.totalTime += point.time;

    return point.success;
  }
}

class PoissonDemoUtils
{
  setProperties(element, obj)
  {
    for (let prop in obj) {
      element.setAttribute(prop, obj[prop])
    }
  }
}

const svgNamespace = 'http://www.w3.org/2000/svg';
const utils = new PoissonDemoUtils();
const samples = 2000;
const demoCanvas = new PoissonDemoCanvas({
  samples: samples,
  poissonOptions: {
    radius: 30,
    samples: samples,
    dimensions: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
});
