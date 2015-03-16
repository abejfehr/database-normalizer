function FunctionalDependency(lhs, rhs) {
  this.lhs = lhs.copy();//.sort();
  this.rhs = rhs.copy();//.sort();
  this.getAttributeSet = function() {
    var allAttributes = lhs.concat(rhs);
    return allAttributes.sort().filter(function(item, pos) {
      return !pos || item != allAttributes[pos - 1];
    });
  };
  this.isTrivial = function() {
    //Answer whether this functional dependency is trivial.
    //A dependency X->Y is trivial is Y is a subset of X
    if(rhs.length === 0) return true;
    return lhs.containsAll(rhs);
  };
  this.equals = function(fd) {
    if(this.lhs.length !== fd.lhs.length || this.rhs.length !== fd.rhs.length) {
      return false;
    }
    // First make sure the lhs is the same
    for(var i=0;i<this.lhs.length;++i) {
      if(this.lhs[i] != fd.lhs[i]) {
        return false;
      }
    }
    // Next check the rhs
    for(var j=0;j<this.rhs.length;++j) {
      if(this.rhs[j] != fd.rhs[j]) {
        return false;
      }
    }
    return true;
  };

  this.toString = function() {
    return this.lhs.join(', ') + ' \u2192 ' + this.rhs.join(', ');
  };

  this.print = function() {
    console.log(this);
  };

}