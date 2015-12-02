var React = require('react');
var fn = require('../utils/fn');
var ChartFactory = require('../utils/ChartFactory');

var Chart = React.createClass({

  propTypes:{
    type: React.PropTypes.string.isRequired,
    options: React.PropTypes.object
  },

  componentDidMount: function(){
    this._chart = new ChartFactory(
      this.props.type,
      this.props.data,
      this.getDOMNode(),
      this.props.options
    );
  },
  
  
  /*shouldComponentUpdate: function(nextProps, nextState){
  
  	if (this.props.type === "Zoom"){
  	
  		if (!this.props.data.keys){
  			return true;
  		}
  		
  		if (this.props.data.reset != nextProps.data.reset){
  			return true;
  		}
  		
  		if (this.props.data.locations && !nextProps.data.locations){
  			return true;
  		}
  		
  		if (nextProps.data.locations && !this.props.data.locations){
  			return true;
  		}
  		
  		if (this.props.data.urlhistory || nextProps.data.urlhistory){
  			return true;
  		}
  		if (nextProps.data.urlhistory && !this.props.data.urlhistory){
  			return true;
  		}
  		if (!nextProps.data.urlhistory && this.props.data.urlhistory){
  			return true;
  		}
  		
  		return this.props.data.keys.length != nextProps.data.keys.length;
  	}
  	return true;
  },*/

  
  componentDidUpdate: function(){
  	this._chart.update(this.props.data);
  },

  componentWillUnmount: function(){
      //this._chart.remove();
  },

  render: function(){
   return (
    <div className={'chart ' + fn.dasherize(this.props.type)}></div>
   );
  },

  _handleClick: function(){
    //ActionCreators.clicked();
  },

});

module.exports = Chart;
