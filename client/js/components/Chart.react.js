var React = require('react');
var fn = require('../utils/fn');
var ChartFactory = require('../utils/ChartFactory');

var Chart = React.createClass({

  propTypes:{
    type: React.PropTypes.string.isRequired,
    data: React.PropTypes.array.isRequired,
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

  componentDidUpdate(){
      this._chart.update(this.props.data);
  },

  componentWillUnmount: function(){
      this._chart.remove();
  },

  render: function(){
   return (
    <div className={'chart ' + fn.dasherize(this.props.type)}></div>
   )
  },

  _handleClick(){
    ActionCreators.clicked();
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

module.exports = Chart;
