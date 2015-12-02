var d3 = require('../lib/d3.min');
var d3tip = require('../lib/d3.tip')(d3);
var fn = require('../utils/fn');
var ActionCreators = require('../actions/ActionCreators');
var Colours = require('../utils/Colours');

var ANIMATION_DURATION = 1000;

BrowsingBar = function(){};

BrowsingBar.prototype.initialise = function(data, node, opts){
 
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
                      
                      //check the range is sane - can't go back more than 2 years, and range
                      //must be greater than a minute.
                      
                      var from = xrange[0].getTime();
                      var to = xrange[1].getTime();
                      var earliest = Date.now() - (2 * 365 * 24 * 60 * 60 * 1000);
          
                      if ( (from > earliest && to <= Date.now()) && (to-from) > 60000){
                      	ActionCreators.rangechange([from,to]);
                      	this.brush.extent([0,0]);
                      	this.svg.select(".brush")
                              .select("rect.extent")
                              .attr("width",0);
                      
                      }else{
                      	this.svg.selectAll(".brush").call(this.brush.clear());
                      }
                  }.bind(this))

  this.colour = function(host){
     return Colours.colourFor(host);
  };

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

  //placeholders for overlays..
  this.svg.append("g")
         .attr("class","historyoverlay");

   this.svg.append("g")
         .attr("class","locationoverlay");
};

BrowsingBar.prototype.update = function(data){

    var self = this;
    //guard against empty data;
    if (!data || !data.browsing){
      console.log("no data yet..");
      return;
    }
 
 	//update the ranges
 	this.x.domain([data.browsing.timerange.from*1000, data.browsing.timerange.to*1000]);
 
    this.y.domain([0, d3.max(data.browsing.binned, function(c){
        return parseInt(c.total);
    })]);

	
    //update the scales
    this.xAxis.scale(this.x);
    this.yAxis.scale(this.y);

    var chart = this.svg.selectAll("g.chart");
                    
    var browsing = chart.selectAll("rect.url")
                       .data(data.browsing.binned, function(d){return d.bin+d.host;});
   	
   	
    var delta = parseInt(data.browsing.timerange.from) + parseInt(data.browsing.bin);
   	var width = this.x(delta*1000) - this.x(data.browsing.timerange.from*1000);
   
   	browsing.enter()
   			.append("rect")
    		.attr("class", "url")
    		.style("fill", function(d){
  				return this.colour(d.host)
  			}.bind(this));
    
    //update
    browsing
    		.transition()
    		.duration(ANIMATION_DURATION)
    		.attr("x", function(d){
    			return this.x(parseInt(d.bin)*1000);
    		}.bind(this))
    		.attr("y", function(d){
    			return this.y(parseInt(d.total));
    		}.bind(this))
    		.attr("width", function(d){
    			return width
    		})
    		.attr("height", function(d){
    			return this.opts.height-this.y(parseInt(d.total));
    		}.bind(this))
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
    browsing
          .exit()
          .remove();
    
    //handle overlays!
          
	if (data.urlhistory){
        this.urlhistory(data.urlhistory);
	}else{
		this.urlhistory([]);
	}
	if (data.locations){
	  this.locations(data.locations);
	}    
};

BrowsingBar.prototype.locations = function(locations){
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

BrowsingBar.prototype.locationtip = d3tip().attr('class', 'd3-tip')
										.offset([-10,0])
										.html(function(d){
											return "<strong>" + d['name'] + "</strong>";
										});


BrowsingBar.prototype.urlhistory = function(data){

    var overlay = this.svg.select("g.historyoverlay");

    var timestamps = overlay.selectAll("line.ts")
                            .data(data, function(d){return d;});
    //enter
    timestamps
          .enter()
          .append("line")
          .attr("class", "ts")
          .style("stroke", function(d){return "#000000";})
          .style("stroke-opacity", 0.4);

   //update and new
   this.svg.selectAll("line.ts")
          .attr("y1", 0)
          .attr("x1", function(d){return this.x(d*1000);}.bind(this))
          .attr("y2", this.opts.height)
          .attr("x2", function(d){return this.x(d*1000);}.bind(this));


    timestamps.exit()
           .remove();
};

module.exports = BrowsingBar;
