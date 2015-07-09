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
    //guard against empty data;
    if (!data || !data.timerange || !data.timerange.from)
      return

    var cdata = data.keys.map(function(d){
          return d*1000;
    });

    //pull out all hosts
    var browsers = stack(Object.keys(data.hosts).map(function(name){
      return {
        name:name,
        //do a data.keys map here and give 0 if no sorresponding entry in data.hosts!
        values: data.hosts[name].map(function(d, i){
          return {date:cdata[i], y:+d};
        })
      };
    }));
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
