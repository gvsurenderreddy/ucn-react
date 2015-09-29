var React = require('react');
var CategoryActionCreators = require('../actions/CategoryActionCreators');
var CategoryStore = require('../stores/CategoryStore');
var WebAPIUtils = require('../utils/WebAPIUtils');
var ENTER_KEY_CODE = 13;
var cx = require('classnames');
var extend = require('extend');

function getStateFromStores() {
    return {
      urls: CategoryStore.urls(),
      matches: CategoryStore.categorymatches(),
      selectedurls: CategoryStore.selectedurls(),
      selectedcategory: CategoryStore.selectedcategory(),
    };
}

var Classifier = React.createClass({

  getInitialState: function() {
    return extend({categorise:false}, getStateFromStores());
  },

  componentDidMount: function(){
    CategoryStore.addChangeListener(this._onChange);
  },

  componentWillUnmount: function(){
    CategoryStore.removeChangeListener(this._onChange);
  },

  render: function(){
    var simple ={
      textDecoration: 'none',
      fontSize: '10px',
    };

    var matches = this.state.matches.map(function(match){
      var selected = this.state.selectedcategory === match.classification;
      return <li className={cx({active:selected})}><a style={simple} onTouchTap={this._toggleCategory.bind(null, match)}>{match}</a></li>;
    }.bind(this));
    
    //dedup urls
    var urls = Object.keys(this.state.urls.reduce(function(acc, url){
      acc[url] = url;
      return acc;
    },{})).map(function(url){
      var selected = this.state.selectedurls.indexOf(url) != -1;
      return <li className={cx({active:selected})} onTouchTap={this._selectURL.bind(null, url)}>{url}</li>;
    }.bind(this));

	var categorisebtn;
	if (this.state.selectedurls.length > 0){
		
		var className = cx({
			button: true,
			primary: this.state.categorise && this.state.selectedcategory == "",
			alert: this.state.categorise && this.state.selectedcategory !== "",
			small: true,
		}); 
		
		var handler = this.state.selectedcategory != "" ? this._categorise : this._toggleCategorise;
		
		categorisebtn = <div onTouchTap={handler} className={className}>(re)categorise</div>
	}
	
	var selectcategories;
	
	if (this.state.categorise && this.state.selectedurls.length > 0){
		selectcategories =  <div>
								<Typeahead />
								<ul className="no-bullet">{matches}</ul>
							</div>
	}
	//
    return  (<div>
    			<div className="row">
				  <div className="large-12 columns">
					  <ul className="no-bullet">{urls}</ul>
					</div>
				</div>
				
    			<div className="row">
				  <div className="large-12 columns">
				  	{selectcategories}
				  </div>
				</div>
				
				<div className="row">
					<div className="large-12 columns">
						{categorisebtn}
					</div>
				</div>
			</div>);
  },
  
  _categorise: function(){
  	CategoryActionCreators.categorise({urls:this.state.selectedurls,  category:this.state.selectedcategory});
  },
  
  _toggleCategory: function(category){
  	console.log("toggling");
  	console.log(category.classification);
  	CategoryActionCreators.categoryselected(category.classification);
  },
  
  _toggleCategorise: function(){
  	console.log("great - seen a categorise click");
  	this.setState({categorise: !this.state.categorise});
  },
  
  _selectURL: function(url){
  	CategoryActionCreators.urlselected(url);
  },
  
  _onChange: function() {
     this.setState(getStateFromStores());
  }
});

Typeahead = React.createClass({
  
  getInitialState: function() {
    return {text: ''};
  },


  render: function(){
    return (<div>
             
              <div className="row">
                <div className="large-12 columns">
                  <input type="text"  value={this.state.text} onChange={this._onChange} onKeyDown={this._onKeyDown} placeholder="category" />    
                </div>
              </div>
            </div>);
  },

  _onChange: function(event, value) {
    this.setState({text: event.target.value});
    WebAPIUtils.match_categories(event.target.value);
  },

  _onKeyDown: function(event) {
    if (event.keyCode === ENTER_KEY_CODE) {
      event.preventDefault();
      var text = this.state.text.trim();
      if (text) {
        console.log("ENTER PRESSED!!!");
      }
      this.setState({text: ''});
    }
  }

});
module.exports = Classifier;
