module.exports ={
  binned: function(bin, values){
    return values.reduce(function(acc, obj){
        var key = Math.floor(obj.ts/bin)*bin;
        acc[key] =  acc[key] ? acc[key]+1 : 1;
        return acc;
    },{});
  }
}
