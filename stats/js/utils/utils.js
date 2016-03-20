let colours = ["#d50000","#c51162", "#aa00ff", "#6200ea", "#304ffe", "#2962ff", "#01579b", "#006064", "#004d40", "#1b5e20", "#33691e", "#827717", "#f57f17", "#ffd600","#e65100","#3e2723", "#21221", "#37474f"];
let allocated = {};
let index = 0;

export function colour(name){
	
	if (allocated[name]){
		return allocated[name];
	}
	
	if (colours.length <= 0){
		return "#000";
	}
	index = (index + 1) % colours.length;
	allocated[name] = colours[index];
	return allocated[name];
	/*let hash = name.split("").reduce((a,b)=>{
		a =((a<<5)-a)+b.charCodeAt(0);
		return a&a;
	},0);
	var index = hash % colours.length;
	allocated[name] = colours[index];
	colours.splice(index,1);
	return allocated[name];*/
}