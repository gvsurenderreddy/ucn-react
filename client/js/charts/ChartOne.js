var d3 = require('../lib/d3.min');
var fn = require('../utils/fn');
var ActionCreators = require('../actions/ActionCreators');

ChartOne = function(){

};

ChartOne.prototype.initialise = function(data, node, opts){

  this.svg = d3.select(node).append('svg')
              .attr('width', opts.width + opts.margin.left + opts.margin.right)
              .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');

  this.update(data);
  this._addListeners();
};

ChartOne.prototype.update = function(data){

  var circles = this.svg.selectAll("circle")
      .data(data);

  //create new
  circles.enter()
         .append("circle")
         .style("fill", "red")
         .on("click", ActionCreators.clicked);

  //update current
  circles.transition()
         .duration(1000)
         .attr("cx", function(d){return d.x})
         .attr("cy", function(d){return d.y})
         .attr("r", 20)

  //remove old
  circles.exit()
         .remove();
};

ChartOne.prototype._addListeners = function(){

};

ChartOne.prototype._removeListeners = function(){

};

_onMouseOver = function(options){

}

_onMouseOut = function(){

};

module.exports = ChartOne;
