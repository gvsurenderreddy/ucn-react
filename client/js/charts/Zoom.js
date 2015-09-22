var ActionCreators = require('../actions/ActionCreators');
var d3 = require('../lib/d3.min');

/*
 * This is the overview chart that is used to select areas to zoom in on!
 */
 
Zoom = function(){

};

Zoom.prototype.initialise = function(data, node, opts){

  var self = this;
  this.opts = opts;
  this.x  = d3.time.scale().range([0,opts.width]);
  this.y  = d3.scale.linear().range([opts.height,0]);
  this.xAxis = d3.svg.axis().scale(this.x).orient("bottom");
  this.yAxis = d3.svg.axis().scale(this.y).orient("left");

  this.brush = d3.svg.brush()
                  .x(this.x)
                  .on("brushend", function(){
                      var xrange = this.brush.empty() ? this.x.domain() : this.brush.extent();
                      ActionCreators.rangechange(xrange);
                  }.bind(this))
                  .on("brush", function(){
                      console.log("brush end");
                  });

  var  colours = ["#7bb6a4","#e5cf58","#cd804a","#445662","#d35a51", "#3f3b3c"];
  var colourcount = 0;
  this.colourchart = {};

  this.colour = function(host){
      this.colourchart[host] = this.colourchart[host] || colours[(colourcount++) % colours.length];
      return this.colourchart[host];
  };

  this.stack = d3.layout.stack()
                 .offset("zero")
                 .values(function(d) {return d.values;})
                 .x(function(d){return this.x(d.date);}.bind(this))
                 .y(function(d){return d.y;});

  this.area = d3.svg.area()
                .interpolate("basis")
                .x(function(d) {
                	//console.log("x: for " + d.date + ":" + this.x(d.date));
                	return this.x(d.date);
                }.bind(this))
                .y0(function(d) {
                	//console.log("y0 for " + d.y0 + ": " + this.y(d.y0));
                	return this.y(d.y0);
                }.bind(this))
                .y1(function(d) {
                	//console.log("y1 for " + (d.y0 + d.y) + ": " + this.y(d.y0 + d.y));
                	return this.y(d.y0 + d.y);
                }.bind(this)),

  this.svg = d3.select(node).append('svg')
              .attr('width', opts.width + opts.margin.left + opts.margin.right)
              .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');

  var zoom = this.svg.append("g")
                     .attr("class", "zoom");

  zoom.append("g")
      .attr("class", "x brush")
      .call(self.brush)
      .selectAll("rect")
      .attr("y", -6)
      .attr("height", opts.height + 7);

  this.svg.append("g")
             .attr("class", "x axis")
             .attr("transform", "translate(0," + opts.height + ")")
             .call(this.xAxis);

  this.svg.append("g")
             .attr("class", "y axis")
             .call(this.yAxis);

  this.svg.append("g")
          .attr("class","historyoverlay");

 this.svg.append("g")
          .attr("class","locationoverlay");


  this.update(data);
};

Zoom.prototype.update = function(data){
  var self = this;
  //guard against empty data;
  if (!data || !data.browsing){
    console.log("no data yet..");
    return;
  }

  var browsers = this.stack(data.browsing);

  this.x.domain(data.range);

  this.y.domain([0, d3.max(browsers, function(c){
      return d3.max(c.values, function(d) {return d.y0 +d.y;});
  })]);
  //update the scales
  this.xAxis.scale(this.x);
  this.yAxis.scale(this.y);
	
  var chart = this.svg.selectAll("g.zoom");

  var zoom = chart.selectAll("g.browser")
                     .data(browsers, function(d){
                        return d.name;
                     });
  //enter
  zoom.enter()
      .append("g")
      .attr("class", "browser")
      .append("path")
      .attr("class", "zoomarea")
      .style("fill", function(d){return self.colour(d.name);})
      .style("fill-opacity", 0.6)
      .style("stroke", function(d){return self.colour(d.name);})
      .style("stroke-opacity", 1.0);

  //update
  zoom.selectAll("path.zoomarea")
      .attr("d", function(d) {
      return self.area(d.values);
  });

  //update axes

  this.svg.select(".x.axis")
          .call(this.xAxis);

  this.svg.select(".y.axis")
          .call(this.yAxis);

  if (data.urlhistory){
    this.urlhistory(data.urlhistory);
  }
 
  if (data.locations){
    this.locations(data.locations);
  }
  //exit!
  zoom.exit()
      .remove();
};

Zoom.prototype.locations = function(locations){
 	
 	var overlay = this.svg.select("g.locationoverlay");
	var height = this.opts.height;
	console.log("locations are");
	console.log(locations);
	
	var zones = overlay.selectAll("rect")
					   .data(locations);
					   					   						    
	zones.enter()
		 .append("rect")
		 .attr("x", function(d){return this.x(d.enter*1000)}.bind(this))
		 .attr("y", 0)
		 .attr("width" , function(d){return this.x(d.exit*1000) - this.x(d.enter*1000)}.bind(this))
		 .attr("height", height)		
		 .style("fill", function(d,i,j){return this.colour(d.name)}.bind(this))	
		 .style("fill-opacity", function(d){return 0.2})	
		 .style("stroke", "none")
	
	zones.exit().remove();		
};


Zoom.prototype.urlhistory = function(data){

    var overlay = this.svg.select("g.historyoverlay");

    var timestamps = overlay.selectAll("line.ts")
                            .data(data, function(d){return d;});
    timestamps
          .enter()
          .append("line")
          .attr("class", "ts")
          .style("stroke", function(d){return "#000000";});

    this.svg.selectAll("line.ts")
           .attr("y1", 0)
           .attr("x1", function(d){return this.x(d*1000);}.bind(this))
           .attr("y2", this.opts.height)
           .attr("x2", function(d){return this.x(d*1000);}.bind(this));

    timestamps.exit()
           .remove();
};

module.exports = Zoom;
