var React = require('react');
var DefaultStore = require('../stores/DefaultStore');
var ActionCreators = require('../actions/ActionCreators');
var Chart = require('./Chart.react');
var BrowsingDataStore = require('../stores/BrowsingDataStore');


function getStateFromStores() {
    return {
      clicked: DefaultStore.clickCount(),
      data: BrowsingDataStore.data(),
      filtered: BrowsingDataStore.filtered(),
    }
};

var Main = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    DefaultStore.addChangeListener(this._onChange);
    BrowsingDataStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    DefaultStore.removeChangeListener(this._onChange);
    BrowsingDataStore.removeChangeListener(this._onChange);
  },

  render: function(){

   var browsingoptions = {
                    height: 300,
                    width: 1000,
                    xaxis:{orientation:'bottom'},
                    yaxis:{orientation:'left'},
                    margin:{left: 10, right:10, top:10, bottom:10}
                };

  var zoomoptions = {
                   height: 150,
                   width: 1000,
                   xaxis:{orientation:'bottom'},
                   yaxis:{orientation:'left'},
                   margin:{left: 10, right:10, top:10, bottom:10}
               };

   return <div>
              <h3 onClick={this._handleClick}>Main</h3>
              <div>{this.state.clicked}</div>
              <Chart type="Zoom" data={this.state.data} options={zoomoptions}/>
              <Chart type="Browsing" data={this.state.filtered} options={browsingoptions}/>
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
