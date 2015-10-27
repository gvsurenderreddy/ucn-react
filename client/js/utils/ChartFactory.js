var fn = require("./fn");
var Browsing = require('../charts/Browsing');
var Zoom = require('../charts/Zoom');
var BrowsingBar = require('../charts/BrowsingBar');
var Categories = require('../charts/Categories');
var d3 = require('../lib/d3.min');

var ChartFactory = function(type, data, node, options){
  var newChart;

  //check the chart is a function and that ut has an update function
  if (typeof ChartFactory[type] !== 'function' || typeof ChartFactory[type].prototype.update !== 'function'){
    throw new Error(type + " is not a valid chart!");
  }

  //copy over shared prototype methods to the child chart prototype
  if (!ChartFactory[type].prototype.initialise){
    fn.extend(ChartFactory[type].prototype, ChartFactory.prototype);
  }

 //this will invoke the attached properties (see below later)
  newChart = new ChartFactory[type]();
  newChart.initialise(data, node, options);
  return newChart;
};

ChartFactory.prototype.initialise = function(data, node, opts){
  var options = opts;

  this.height = options.height - (options.margin.top + options.margin.bottom);
  this.width = options.width - (options.margin.right + options.margin.left);
  this.xAxis = d3.svg.axis().orient(options.xaxis.orientation);
  this.yAxis = d3.svg.axis().orient(options.yaxis.orientation);

  this.svg = d3.select(node).append('svg')
              .attr('width', this.width + options.margin.left + options.margin.right)
              .attr('height', this.height + options.margin.top + options.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + options.margin.left + ',' + options.margin.top + ')');

  this.svg.append('g').attr('class', 'x axis')
          .attr('transform', 'translate(0, ' + this.height +')');

  this.svg.append('g').attr('class', 'y axis')
                  .attr('transform', 'rotate(-90)');

  this.update(data);

}

//attach all chart types as static properties
ChartFactory.Browsing = Browsing;
ChartFactory.BrowsingBar = BrowsingBar;
ChartFactory.Zoom = Zoom;
ChartFactory.Categories = Categories;

module.exports = ChartFactory;
