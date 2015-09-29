var _colours = ["#7bb6a4","#e5cf58","#cd804a","#ff7f2a","#d35a51", "#668000", "#164450", "#56aad4", "#8080ff", "#7f2aff", "#ff55dd", "#ff0066", "#55d400", "#5d6c53", "#ffcc52", "#916f6f", "#800000", "#000080", "#800080", "ff0000"];

var _hash = function(str){
	var hash = 0;
	for (i = 0; i < str.length; i++){
		char = str.charCodeAt(i);
		hash = char + (hash << 6) + (hash << 16) - hash;
	}
	return hash
};

Colours = function(){
};

Colours.colourFor = function(value){
	var hash = _hash(value);
	return _colours[hash%_colours.length];
};

module.exports = Colours;