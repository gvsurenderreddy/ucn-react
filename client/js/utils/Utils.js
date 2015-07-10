module.exports ={

  binkeys: function(bin, fromts, maxts){
    var keys = [];
    fromts = Math.floor(fromts/bin) * bin;
    maxts   = Math.floor(maxts/bin) * bin;

    while (fromts <= maxts+bin){
      keys.push(fromts);
      fromts = fromts + bin;
    }

    return keys;
  }
}
