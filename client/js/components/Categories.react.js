var React = require('react');
var ActionCreators = require('../actions/ActionCreators');
var CategoryStore = require('../stores/CategoryStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var Chart = require('./Chart.react');
var Classifier = require('./Classifier.react');

function getStateFromStores() {
    return {
      categories: CategoryStore.data()
    };
}

var Categories = React.createClass({

  getInitialState: function() {
    return getStateFromStores();
  },

  componentDidMount: function(){
    CategoryStore.addChangeListener(this._onChange);
    WebAPIUtils.fetch_category_data();
  },

  componentWillUnmount: function(){
    CategoryStore.removeChangeListener(this._onChange);
  },

  render: function(){
    var options =    {
                        height: 500,
                        width: 1000,
                        margin:{left: 100, right:10, top:10, bottom:60}
                      };

    
    var chart = <h5> ..waiting for data </h5>;

    if (this.state.categories.children){
      chart = <Chart type="Categories" data={this.state.categories} options={options}/>;
    } 
    
    return <div className="row fullWidth">
              <div className="small-9 columns" style={{overflowY:'auto'}}>
                {chart}
              </div>
               <div className="small-3 columns" style={{overflowY:'auto'}}>
                <Classifier />
              </div>
           </div>;

  },

  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

module.exports = Categories;
