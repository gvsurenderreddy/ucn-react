var d3 = require('../lib/d3.min');
var fn = require('../utils/fn');
var ActionCreators = require('../actions/ActionCreators');

var ANIMATION_DURATION = 2000;

Browsing = function(){

};

Browsing.prototype.initialise = function(data, node, opts){

  var self = this;


  this.x  = d3.time.scale().range([0,opts.width]);
	this.y  = d3.scale.linear().range([opts.height,0]);

  this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left");

  var  colours = ["#7bb6a4","#e5cf58","#cd804a","#445662","#d35a51", "#3f3b3c"];

  var colourcount = 0;

  this.colourchart = {};

  this.colour = function(host){
      this.colourchart[host] = this.colourchart[host] || colours[(colourcount++) % colours.length]
      return this.colourchart[host];
  }

  this.stack = d3.layout.stack()
                 .offset("zero")
                 .values(function(d) {return d.values})
                 .x(function(d){return self.x(d.date)})
                 .y(function(d){return d.y});

  this.area = d3.svg.area()
                .interpolate("basis")
                .x(function(d) {return self.x(d.date)})
                .y0(function(d) {return self.y(d.y0)})
                .y1(function(d) {return self.y(d.y0 + d.y);}),

  this.svg = d3.select(node).append('svg')
              .attr('width', opts.width + opts.margin.left + opts.margin.right)
              .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');

  //mask to prevent areas goind past lhs yscale, clipath is defined in style.

  this.svg.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", opts.width)
                .attr("height", opts.height);

  this.svg.append("g")
          .attr("class", "chart");

  this.svg.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + opts.height + ")")
             .call(this.xAxis);

  this.svg.append("g")
             .attr("class", "y axis")
             .call(this.yAxis);

  this.update(data);
  this._addListeners();
};

Browsing.prototype.update = function(data){


    var self = this;
    //guard against empty data;
    if (!data || !data.browsing){
      console.log("no data yet..");
      return;
    }

    var browsers = this.stack(data.browsing);

    console.log("rnage is ");
    console.log(data.range);

    this.x.domain(data.range);

    this.y.domain([0, d3.max(browsers, function(c){
        return d3.max(c.values.filter(function(item){return item.date >= data.range[0] && item.date <= data.range[1]}), function(d) {return d.y0 +d.y});
    })]);

    //update the scales
    this.xAxis.scale(this.x);
    this.yAxis.scale(this.y);

    var chart = this.svg.selectAll("g.chart");

    //need to add exit!
    var browser = chart.selectAll("g.browser")
                       .data(browsers, function(d){return d.name});
    //enter
    browser.enter()
           .append("g")
           .attr("class", "browser")
           .append("path")
           .attr("class", "area")
           .style("fill", function(d){return self.colour(d.name)})
           .style("fill-opacity", 0.6)
           .style("stroke", function(d){return self.colour(d.name)})
           .style("stroke-opacity", 1.0)


    //update
    browser.selectAll("path.area")
          .transition()
          .duration(ANIMATION_DURATION)
          .attr("d", function(d) {return self.area(d.values);})

    //update axes

    this.svg.select(".x.axis")
            .transition()
            .duration(ANIMATION_DURATION)
            .call(this.xAxis);

    this.svg.select(".y.axis")
            .transition()
            .duration(ANIMATION_DURATION)
            .call(this.yAxis);

    //exit
    browser
          .exit()
          .remove();
};

Browsing.prototype._addListeners = function(){

};

Browsing.prototype._removeListeners = function(){

};

_onMouseOver = function(options){

}

_onMouseOut = function(){

};

module.exports = Browsing;
