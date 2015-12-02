var ActionCreators = require('../actions/ActionCreators');
var d3 = require('../lib/d3.min');
var d3tip = require('../lib/d3.tip')(d3);
var Colours = require('../utils/Colours');
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
                      ActionCreators.rangechange([xrange[0].getTime(), xrange[1].getTime()]);
                  }.bind(this))
                  .on("brush", function(){
                     
                  });

  this.colour = function(host){
     return Colours.colourFor(host);
  };

  this.stack = d3.layout.stack()
                 .offset("zero")
                 .values(function(d) {return d.values;})
                 .x(function(d){return this.x(d.date);}.bind(this))
                 .y(function(d){return d.y;});

  this.area = d3.svg.area()
                .interpolate("basis")
                .x(function(d) {
                	return this.x(d.date);
                }.bind(this))
                .y0(function(d) {
                	return this.y(0);//d.y0);
                }.bind(this))
                .y1(function(d) {
                	return this.y(/*d.y0 +*/ d.y);
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
          .attr("class","locationoverlay");
  
  this.svg.append("g")
          .attr("class","historyoverlay");

  //this.update(data);
};

Zoom.prototype.update = function(data){
  var self = this;
  
  //guard against empty data;
  if (!data || !data.browsing){
    return;
  }
  
  /*
  //if this is fresh data, reset the brush
  if (data.reset){
 	this.brush.extent([0,0]);
    this.svg.select(".brush").select("rect.extent").attr("width",0);
  }*/
  
  //stack relies on y.domain, and y.domain relies on stack (d.y0!);
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
      .attr("class", "zoomarea");
      

  //update
  zoom.selectAll("path.zoomarea")
  	  .style("fill", function(d){
  	  	return self.colour(d.name);
  	  })
      .style("fill-opacity", 0.6)
      .style("stroke", function(d){return self.colour(d.name);})
      .style("stroke-opacity", 1.0)
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
  }else{
    this.urlhistory([]);
  }
 
  if (data.locations){
    this.locations(data.locations);
  }
  //exit!
  zoom.exit()
      .remove();
};

Zoom.prototype.locations = function(locations){
 	var self = this;
 	var overlay = this.svg.select("g.locationoverlay");
 	overlay.call(this.locationtip)
 	
	var height = this.opts.height;
	
	var zones = overlay.selectAll("g.zone")
					   .data(locations, function(d){return d.enter + ""+ d.exit});
	
	//enter			   					   						    
	var zone = zones.enter()
		 			.append("g").attr("class", "zone");
		 			
	zone.append("rect")
		 .attr("class", "key")
		 .attr("height", 10)
		 .attr("y", 15)		
		 .style("fill", function(d,i,j){return this.colour(d.name)}.bind(this))	
		 .style("fill-opacity", 1.0)	
		 .style("stroke", "none")
		 .on('mouseover', function(d){
		 	this.locationtip.show(d);
		 	ActionCreators.locationhighlighted([d.lat, d.lng]);
		 }.bind(this))
		 .on('mouseout', this.locationtip.hide)
		 .on('click', function(d){
		 	ActionCreators.locationselected([d.lat, d.lng]);
		 });
	
	zone.append("rect")
		 .attr("class", "zone")
		 .attr("height", height-15)
		 .attr("y", 15)		
		 .style("fill", function(d,i,j){return this.colour(d.name)}.bind(this))	
		 .style("fill-opacity", function(d){return 0.1})	
		 .style("stroke", "none")
		 .on('mouseover', function(d){
		 	self.locationtip.show(d);
		 	d3.select(this).style("fill-opacity", 0.5);
		 	ActionCreators.locationhighlighted([d.lat, d.lng]);
		 })
		 .on('mouseout', function(){
		 		self.locationtip.hide();
		 		d3.select(this).style("fill-opacity", 0.1);
		 })
		 .on('click', function(d){
		 	ActionCreators.locationselected([d.lat, d.lng]);
		 });
		 
	//update
	zones.selectAll("rect.key")
		.transition()
		.duration(1000)
		.attr("x", function(d){return this.x(d.enter*1000)}.bind(this))
		.attr("width" , function(d){return this.x(d.exit*1000) - this.x(d.enter*1000)}.bind(this))
	
	zones.selectAll("rect.zone")
		.transition()
		.duration(1000)
		.attr("x", function(d){return this.x(d.enter*1000)}.bind(this))
		.attr("width" , function(d){return this.x(d.exit*1000) - this.x(d.enter*1000)}.bind(this))	 
			 
	//exit
	zones.exit().remove();		
};

Zoom.prototype.locationtip = d3tip().attr('class', 'd3-tip')
										.offset([-10,0])
										.html(function(d){
											return "<strong>" + d['name'] + "</strong>";
										});

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
