Array.prototype.set = function() {
  var arr = this;
  return this.sort().filter(function(item, pos) {
    return !pos || item != arr[pos - 1];
  });
};

Array.prototype.containsAll = function(otherArr) {
  var commonSet = [];
  for(var i=0;i<otherArr.length;++i) {
    if(this.indexOf(otherArr[i]) > -1) {
      commonSet.push(otherArr[i]);
    }
  }
  return (commonSet.length === otherArr.length);
};

Array.prototype.copy = function() {
  return this.slice();
};

// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
        return false;

    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;
        }
        else if (this[i] != array[i]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }
    return true;
};

Array.prototype.isEmpty = function() {
  return (this.length === 0);
};

Array.prototype.remove = function(element) {
  var index = this.indexOf(element);
  if (index > -1) {
    this.splice(index, 1);
  }
};

Array.prototype.closure = function(F) {
  /*Compute and return the closure of an attribute set with respect to a set of functional
   * dependencies F
   * The closure are all those attributes that are implied by this wrt. F using
   * Armstrong's axioms
   */

  var previous = [];

  var current = this.copy();	//reflexive rule
  while(!current.equals(previous)){
    previous = current.copy();
    current = current.copy();
    for(var i=0;i<F.elements.length;++i) {
      var fd = F.elements[i];
      if(current.containsAll(fd.lhs)) {
        current = current.concat(fd.rhs).set();
      }
    }
  }

  return current;
};