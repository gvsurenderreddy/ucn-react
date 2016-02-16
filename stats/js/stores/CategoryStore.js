import Store from './Store';
import AppDispatcher from '../dispatcher/AppDispatcher';
import {ActionTypes} from '../constants/AppConstants';

let appState;
let _totalsize;
let _nodefor = {};
let _parentfor = {};

function reset(){
	_totalsize = 0;
	_nodefor = {};
	_parentfor = {};
	appState = {};
}

function _buildtree(data){

     _totalsize = 0;
    var _tree = {};

    data.forEach((node)=>{
    	
        var size = node.size;
        var tld = node.tld;

        _totalsize += size;

       
        var lastkey;
        //can either be a sub of
        node.classification.forEach((key)=>{

            var n = _nodefor[key];

            if (n) { //if this node has been seen before.
                n.size += size;
                n.urls.concat(tld);
            }
            else if (lastkey){ //add as child to previous node if one exists
                _createnewparent(lastkey, key, node.size,/*node.ts,*/ node.tld);
            }
            else{ //this is a brand new node
                _createroot(_tree, key, node.size,/*node.ts,*/ node.tld);
            }
            lastkey = key;
        });
    });

    //now need to turn all children objects into arrays for format required by d3
   
    var arraytree = _convertchildrentoarrays(_tree);

    return {size: _totalsize, children: Object.keys(arraytree).map((key)=>{
      return arraytree[key];
    })};
}

function _createnewparent(parentkey, key, size, tld){
  var parent = _nodefor[parentkey];
  parent.children = parent.children || {};
  parent.children[key] = {name:key, path:parent.path + "/" + key, size: size, urls:tld};
  _parentfor[key] = parent;
  _nodefor[key] = parent.children[key];
}

function _createroot(_tree, key, size, tld){
  _tree[key] = {name:key, path:key, size: size, urls:tld};
  _nodefor[key] = _tree[key];
}

function _convertchildrentoarrays(_tree){
    return Object.keys(_tree).map((key)=>{
         //base case - if no chilren, don't do anything.
        let node = _tree[key];

        if (!node.children){

            return{
              name:node.name,
              path: node.path,
              urls: node.urls,
              size: node.size,
          };
        }

        return {
          name:node.name,
          path:node.path,
          urls: node.urls,
          size: node.size,
          children:  _convertchildrentoarrays(node.children)
        };

    });
}

function _getparentfor(key){
  return _parentfor[key];
};

class CategoryStore extends Store{
	
	constructor(){
		super();
	}
	
	getCategories(){
		return appState;
	}
	
}

let categoryStoreInstance = new CategoryStore();

categoryStoreInstance.dispatchToken = AppDispatcher.register(action => {
	
	switch(action.action.type){
	
		case ActionTypes.CATEGORY_DATA:
			console.log("got new category data!");
			reset();
			
			appState = _buildtree(action.action.data);
			console.log("tree is now");
			console.log(appState);
			break;
		
		default:
			return;		
	}
	
	categoryStoreInstance.emitChange();
	
});

export default categoryStoreInstance;