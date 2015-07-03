var React = require('react');
var DefaultStore = require('../stores/DefaultStore');
var ActionCreators = require('../actions/ActionCreators');
var Chart = require('./Chart.react');

function getStateFromStores() {
  return {clicked: DefaultStore.clickCount()};
}

var Main = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    DefaultStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    DefaultStore.removeChangeListener(this._onChange);
  },

  render: function(){

   var options ={
                    height: 400,
                    width: 600,
                    xaxis:{orientation:'bottom'},
                    yaxis:{orientation:'left'},
                    margin:{left: 10, right:10, top:10, bottom:10}
                };

   var data = [1,2,3,4,5];

   return <div>
              <h3 onClick={this._handleClick}>Main</h3>
              <div>{this.state.clicked}</div>
              <Chart type="ChartOne" data={data} options={options}/>
         </div>
  },

  _handleClick(){
    ActionCreators.clicked();
  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

module.exports = Main;
