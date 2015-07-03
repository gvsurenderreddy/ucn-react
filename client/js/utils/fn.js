module.exports = {
  dasherize: function( string ) {
    console.log("in dasherise with string " + string);
    return string.replace ( /([^])([A-Z]+)([^$])/g, '$1-$2$3' ). toLowerCase();
  },

  curry: function()
  {
    var method = this, args = Array.prototype.slice.call(arguments);

    return function()
    {
      return method.apply(this, args.concat(Array.prototype.slice.call(arguments)));
    };
  },

  extend : function(obj) {
    Array.prototype.slice.call(arguments, 1).forEach(function(source) {
      for (var prop in source) {
        obj[prop] = source[prop];
      }
    });
    return obj;
  },


}
