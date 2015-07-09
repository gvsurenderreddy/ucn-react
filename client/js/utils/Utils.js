module.exports ={

  binkeys: function(bin, fromts, maxts){
    var keys = [];
    while (fromts < maxts+bin){
      keys.push(Math.floor(fromts/bin)*bin);
      fromts = fromts + bin;
    }
    return keys;
  }
}
