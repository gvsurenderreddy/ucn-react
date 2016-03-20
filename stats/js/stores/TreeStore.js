import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';
import CategoryStore from './CategoryStore';
import d3 from 'd3';

let root;
let width = 1000, height = 500;
let nodes;
let paths;
let urls = [];
let selected = {};
let tree = d3.layout.tree().size([height, width]);	
let diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });
let total;


function _cleartree(){
	root = {};
	selected = {};
	total = 0;
	urls = [];
	paths = [];
	nodes = [];
}

function toggle(d){
	if (d.children) {
    	d._children = d.children;
    	d.children = null;
  	} else {
    	d.children = d._children;
   	 	d._children = null;
  	}
}

function reset(){

  var toggleAll = function(d){
    if (d.children) {
      d.children.forEach(toggleAll);
      toggle(d);
    }
  }

  //collapse everything to begin with
  if(root.children){
    root.children.forEach(function(d){
      if (d.children) {
        d.children.forEach(toggleAll);
        toggle(d);
      }
    });
  }
}

function _selected(node){
	selected = node;
}

function _update_urls(data){
	urls = data;
}

function _create_nodes(data){
	
	
	console.log("creating nodes from");
	console.log(data);
	console.log("-----");
	
	root = data;
	root.x0 = height / 2;
  	root.y0 = 0;
  	total   = data.size;  
  	
  	reset(root);
	
	let _treenodes = tree.nodes(root).reverse();
  	
  	console.log("treenodes are");
  	console.log(_treenodes);
  	  	
  	// Normalize for fixed-depth.
  	_treenodes.forEach((d)=>{ d.y = d.depth * 180; });
  	
  	nodes = _treenodes.map((item,i)=>{
  		item.x0 = root.x0;
  		item.y0 = root.y0;
  		item.r  = Math.max(3,(item.size/total) * 20);
  		item.text =  item.name ? `${item.name}(${((item.size/total)*100).toFixed(2)})` : "";
  		return item;
  	});
  	
  	paths = _treenodes.map((item, i)=>{
  		let s = {x: root.x0, y: root.y0};
  		let t = {x: item.x, y: item.y}; 
  		return {d: diagonal({source: s, target: t})}
  	});
  	
}	

function _update_tree(){

	let _treenodes = tree.nodes(root).reverse();
  	
  	// Normalize for fixed-depth.
  	_treenodes.forEach((d)=>{ d.y = d.depth * 180; });
  	
  	nodes = _treenodes.map((item,i)=>{
  		item.x0 = root.x0;
  		item.y0 = root.y0;
  		item.r  = Math.max(3,(item.size/total) * 20);
  		item.text =  item.name ? `${item.name}(${((item.size/total)*100).toFixed(2)})` : "";
  		return item;
  	});
  	
  	paths = _treenodes.map((item, i)=>{
		let s = {x: item.parent ? item.parent.x : item.x, y: item.parent ? item.parent.y : item.y}
  		let t = {x: item.x, y: item.y}; 
  		return {d: diagonal({source: s, target: t})}
  	});
}

class TreeStore extends Store{
	
	constructor(){
		super();
	}
	
	nodes(){
		return nodes;
	}
	
	paths(){
		return paths;
	}
	
	urls(){
		return urls;
	}
	
	selected(){
		return selected;
	}
}

let treeStoreInstance = new TreeStore();

treeStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.CATEGORY_DATA:
			AppDispatcher.waitFor([CategoryStore.dispatchToken])
			_create_nodes(CategoryStore.getCategories());
			
			break;
		
		case ActionTypes.NODE_SELECTED:
			toggle(action.action.node);
			_update_tree(action.action.node);
			_update_urls(action.action.node.urls);
			_selected(action.action.node);
			break;
		
		case ActionTypes.DEVICE_SELECTED:
			_cleartree();
			break;	
		

		default:
			return;
			
	}
	
	treeStoreInstance.emitChange();
	
});

export default treeStoreInstance;