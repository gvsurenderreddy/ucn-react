var _colours = [
					"#7bb6a4",
					"#e5cf58",
					"#cd804a",
					"#ff7f2a",
					"#d35a51", 
					"#668000", 
					"#164450", 
					"#56aad4", 
					"#8080ff", 
					"#7f2aff", 
					"#ff55dd", 
					"#ff0066", 
					"#55d400", 
					"#5d6c53", 
					"#ffcc52", 
					"#916f6f", 
					"#800000", 
					"#000080", 
					"#800080", 
					"#ff0000",
					"#ff1744",
					"#6a1b9a",
					"#d500f9",
					"#283593",
					"#0277bd", 
					"#00695c", 
					"#558b3f", 
					"#76ff03", 
					"#f9a825", 
					"#ef6c00", 
					"#4e342e", 
					"#455a64", 
					"#c55162", 
					"#311b92", 
					"#1565c0", 
					"#2962ff", 
					"#006064", 
					"#1b5e20", 
					"#827717", 
					"#ff6f00"		
			];
			

var _hash = function(str){
	var hash = 0;
	for (i = 0; i < str.length; i++){
		char = str.charCodeAt(i);
		hash = char + (hash << 6) + (hash << 16) - hash;
	}
	return hash
};

var seen 	= {}
var index 	= 0;

Colours = function(){
};

Colours.colourFor = function(value){
	var hash = index++;//_hash(""+value);
	seen[value] = seen[value] || _colours[hash%_colours.length];
	return seen[value];
};

module.exports = Colours;