var ActionCreators = require('../actions/ActionCreators');
var d3 = require('../lib/d3.min');
var i = 0;

Categories = function(){

};

Categories.prototype.toggle = function(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
},

Categories.prototype.initialise = function(root, node, opts){
  
  
  var self = this;
  this.root = root;
  this.opts = opts;
  this._selected = {},
  this.tree = d3.layout.tree().size([opts.height, opts.width]),

  this.parentfor = {},
  this.nodefor = {},
  this.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });


  this.svg = d3.select(node).append('svg')
              .attr('width', opts.width + opts.margin.left + opts.margin.right)
              .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');
 
  root.x0 = opts.height / 2;
  root.y0 = 0;

  var toggleAll = function(d){
    if (d.children) {
      d.children.forEach(toggleAll);
      self.toggle(d);
    }
  };

  if(root.children){
    root.children.forEach(function(d){
      if (d.children) {
        d.children.forEach(toggleAll);
        self.toggle(d);
      }
    });
  }

  this.update(root);

};

Categories.prototype.selectnode = function(node){
      _selected = node;
};

Categories.prototype.nodeselected = function(node){
  return this._selected.name ? this._selected.name == node.name : false;
};

Categories.prototype.update = function(data){
  

  var self = this;
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = this.tree.nodes(this.root).reverse();
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

  // Update the nodes…
  var node = this.svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + data.y0 + "," + data.x0 + ")"; })
      .on("click", function(d) { 
            this.toggle(d);
            this.selectnode(d); 
            this.update(d);  
            //self.getextrafor(d);
          }.bind(this));

  nodeEnter.append("svg:circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return self.nodeselected(d) ? "#ff0000" : d._children ? "lightsteelblue" : "#fff"; });

  nodeEnter.append("svg:text")
      .attr("x", function(d) { return d.children || d._children ? -10 : 10; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name + " ("  + ((d.size/self.root.size)*100).toFixed(2) + ")"; })
      .style("fill-opacity", 1e-6);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", function(d) { return Math.max(3,(d.size/self.root.size) * 20)})
      .style("fill", function(d) { 
            return self.nodeselected(d) ? "#ff0000" : d._children ? "lightsteelblue" : "#fff"; 
      });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + data.y + "," + data.x + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = this.svg.selectAll("path.link")
      .data(this.tree.links(nodes), function(d) { 
          return d.target.id; 
      });

  // Enter any new links at the parent's previous position.
  link.enter().insert("svg:path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: data.x0, y: data.y0};
        return self.diagonal({source: o, target: o});
      })
    .transition()
      .duration(duration)
      .attr("d", this.diagonal);

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", this.diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: data.x, y: data.y};
        return self.diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });

};

module.exports = Categories;
