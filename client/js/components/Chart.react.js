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

  shouldComponentUpdate: function(nextProps, nextState){
  	/* can we make more efficient here?  */
  	/* nextProps.locations && nextProps.urlhistory */
  	/* tends to === oldProps.locations and nextProps.urlhistory */
  	/*console.log("-------------");
  	console.log("old props:");
  	console.log(this.props);
  	console.log("new props");
  	console.log(nextProps);
  	console.log("-------------");*/
  	return true;
  },
  
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
    ActionCreators.clicked();
  },

});

module.exports = Chart;
