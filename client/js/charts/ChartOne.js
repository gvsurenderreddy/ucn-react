var d3 = require('../lib/d3.min');
var fn = require('../utils/fn');
var ActionCreators = require('../actions/ActionCreators');



ChartOne = function(){

};

ChartOne.prototype.initialise = function(data, node, opts){

  var self = this;


  this.x  = d3.time.scale().range([0,opts.width]);
	this.y  = d3.scale.linear().range([opts.height,0]);

  var  colours = ["#7bb6a4","#e5cf58","#cd804a","#445662","#d35a51", "#3f3b3c"];
  var colourcount = 0;
  this.colourchart = {};

  this.colour = function(host){
      this.colourchart[host] = this.colourchart[host] || colours[(colourcount++) % colours.length]
      console.log("returning"  + this.colourchart[host] + " for " + host)
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

  this.svg.append("g")
          .attr("class", "chart");

  this.update(data);
  this._addListeners();
};

ChartOne.prototype.update = function(data){
    var self = this;
    //guard against empty data;
    if (!data || !data.timerange || !data.timerange.from)
      return

    var cdata = data.keys.map(function(d){
          return d;
    });


    var bins = data.browsing.reduce(function(acc, item){
        acc[item.host] =  acc[item.host]  || {};
        acc[item.host][item.bin] = item.total;
        return acc;
    },{});

    this.hosts = Object.keys(bins);
    //create browswers as:
    //[{name:hostname, values:[{date:javascriptts, y:number},..], name:hostname2, values:[{date:javascriptts, y:number}]];

    var browsers = this.stack(this.hosts.map(function(host){
      //
      return {
        name:host,
        //do a data.keys map here and give 0 if no sorresponding entry in data.hosts!
        values: cdata.map(function(d){
            //console.log("looking up key " + (d) + " for host " + host);
            return {
              date: d*1000,
              y: bins[host][d] ? +(bins[host][d]) : 0
            }
        })
      };
    }));

    this.x.domain(d3.extent(cdata, function(d){return d*1000}));

    this.y.domain([0, d3.max(browsers, function(c){
        return d3.max(c.values, function(d) {return d.y0 +d.y});
    })]);

    var chart = this.svg.selectAll("g.chart");

    var browser = chart.selectAll("browser")
                       .data(browsers)
                       .enter()
                       .append("g")
                       .attr("class", "browser")

    browser.append("path")
      .attr("class", "area")
      .attr("d", function(d) {return self.area(d.values);})
      .style("fill", function(d){return self.colour(d.name)})
      .style("fill-opacity", 0.2)
      .style("stroke", function(d){return self.colour(d.name)})
      .style("stroke-opacity", 1.0)

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
