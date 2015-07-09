var React = require('react');
var fn = require('../utils/fn');
var ChartFactory = require('../utils/ChartFactory');
var BrowsingDataStore = require('../stores/BrowsingDataStore');

function getStateFromStores() {
  return {
    data: BrowsingDataStore.data()
  }
}

var Chart = React.createClass({

  propTypes:{
    type: React.PropTypes.string.isRequired,
    options: React.PropTypes.object
  },

  getInitialState: function() {
    	return getStateFromStores();
  },

  componentDidMount: function(){
    this._chart = new ChartFactory(
      this.props.type,
      this.state.data,
      this.getDOMNode(),
      this.props.options
    );
    BrowsingDataStore.addChangeListener(this._onChange);
  },

  componentDidUpdate(){
      this._chart.update(this.state.data);
  },

  componentWillUnmount: function(){
      this._chart.remove();
      BrowsingDataStore.removeChangeListener(this._onChange);
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
