var CategoryActionCreators = require('../actions/CategoryActionCreators');
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
};

Categories.prototype.reset = function(){

  var toggleAll = function(d){

    if (d.children) {
      d.children.forEach(toggleAll);
      this.toggle(d);
    }
  }.bind(this);

  //collapse everything to begin with
  if(this.root.children){
    this.root.children.forEach(function(d){
      if (d.children) {
        d.children.forEach(toggleAll);
        this.toggle(d);
      }
    }.bind(this));
  }
};

Categories.prototype.collapse = function(d){
  
  if (d.children) {
    d._children = d.children;
    d.children = null;
  }
};

Categories.prototype.expandpath = function(path, tree){
	
  var top = path.shift();
  
  var subtree = tree.filter(function(item){
    return item.name === top;
  }).reduce(function(acc, item){
    return item;
  },{});

  if (subtree._children){
    subtree.children = subtree._children;
    subtree._children = null;
  }

  if (path.length > 0 && subtree.children){
    this.expandpath(path, subtree.children);
  }
};

Categories.prototype.collapseAll = function(){

  var collapseChildren = function(d){
    if (d.children) {
      d.children.forEach(collapseChildren);
      this.collapse(d);
    }
    if (d._children) {
       d._children.forEach(collapseChildren);
    }
  }.bind(this);

  if(this.root.children){
    
    this.root.children.forEach(function(d){
      if (d.children) {
        d.children.forEach(collapseChildren);
        this.collapse(d);
      }
      if (d._children) {
        d._children.forEach(collapseChildren);
      }
    }.bind(this));
    
    this.collapse(this.root);
  }
};

Categories.prototype.initialise = function(data, node, opts){
 
  var self = this;
  this.root = data.categories;
  
  this.classifications = Object.keys(data.expanded.map(function(item){
      return item.classification;
  }).reduce(function(acc, key){
      acc[key] = key;
      return acc;
  },{}));

  this.opts = opts;
  this._selected = {},
  this._found = [],
  this.tree = d3.layout.tree().size([opts.height, opts.width]),

  this.parentfor = {},
  this.nodefor = {},
  this.diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });

  this.svg = d3.select(node).append('svg')
              .attr('width', opts.width + opts.margin.left + opts.margin.right)
              .attr('height', opts.height + opts.margin.top + opts.margin.bottom)
              .append('g')
              .attr('transform', 'translate(' + opts.margin.left + ',' + opts.margin.top + ')');
 
  this.root.x0 = opts.height / 2;
  this.root.y0 = 0;
  
  

  this.reset();
  this.generate(this.root);
};

Categories.prototype.selectnode = function(node){
      _selected = node;
};


Categories.prototype.pathfound = function(path){
  return this.classifications.indexOf("/"+path) != -1;
};

Categories.prototype.nodeselected = function(node){
  return this._selected.name ? this._selected.name == node.name : false;
};


Categories.prototype.update = function(data){

	
	
	if (!('x0' in data.categories)){
	  this.root = data.categories;
	  this._selected = {},
	  this._found = [],
  
 
	  this.classifications = Object.keys(data.expanded.map(function(item){
		  return item.classification;
	  }).reduce(function(acc, key){
		  acc[key] = key;
		  return acc;
	  },{}));
  
	  this.root.x0 = this.opts.height / 2;
	  this.root.y0 = 0;
	  this.reset();
	  this.generate(this.root);
	}
	else if (data.expanded && data.expanded.length > 0){
    	
		this.classifications = Object.keys(data.expanded.map(function(item){
		  return item.classification;
		}).reduce(function(acc, key){
		  acc[key] = key;
		  return acc;
		},{}));
	
		this.collapseAll();
		
				
		var find = function(tree){
		  if (tree._children){
			tree._children.forEach(function(child){
			
			  if (this.classifications.indexOf("/"+child.path) !== -1){
				
				this.expandpath(child.path.split("/"), this.root._children);
			  }
			  if (child._children){
				find(child);
			  }
			}.bind(this));
		  }
		}.bind(this);
		
	
		
		find(this.root);
		this.root.children = this.root._children;
		this.root._children = null;
		this.generate(this.root);
	}
};

//need to check enter/exit, or could lookup urls when node is clicked rather than have them attached to node.

Categories.prototype.generate = function(data){
  
  var self = this;
  var duration = d3.event && d3.event.altKey ? 5000 : 500;

  // Compute the new tree layout.
  var nodes = this.tree.nodes(this.root).reverse();
  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 180; });

console.log("OK NODES RAE");
console.log(nodes);
  // Update the nodes…
  //need to d3 to know this node is new if the number of associated urls changes?
  //perhaps better to llokup urls in Category store...when category actuon creators fires.
  var node = this.svg.selectAll("g.node")
      .data(nodes, function(d) {  
      		var suffix = d.urls ? d.urls.length : "";
      		d.id = d.id || ++i;
      		return d.id + "_" + suffix;
       });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("svg:g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + data.y0 + "," + data.x0 + ")"; })
      .on("click", function(d) { 
      		if (this.root.name !== d.name){
      			
            	this.toggle(d);
            	this.selectnode(d); 
            	this.generate(d);  
            	CategoryActionCreators.nodeselected({ts: d.ts, urls: d.urls, name: d.name, path:d.path});
            }
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
      .attr("r", function(d) { return Math.max(3,(d.size/self.root.size) * 20);})
      .style("fill", function(d) { 
            if (self.nodeselected(d)){
              return  "#ff0000";
            }else if (d.path && self.pathfound(d.path)){
              return "#00ff00";
            }
            else if (d._children){
              return "lightsteelblue";
            }else{
              return "#fff"; 
            }
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
