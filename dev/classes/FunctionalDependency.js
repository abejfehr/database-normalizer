/**
 * A class that represents a functional dependency with a list of attributes in
 * the left-hand-side(LHS) and the right-hand-side(RHS)
 */
function FunctionalDependency(lhs, rhs) {

  this.lhs = lhs.copy();
  this.rhs = rhs.copy();

  this.getAttributeSet = function() {
    var allAttributes = lhs.concat(rhs);
    return allAttributes.sort().filter(function(item, pos) {
      return !pos || item != allAttributes[pos - 1];
    });
  };

  /**
   * Checks whether this Functional Dependency is trivial
   * (eg. X->Y is trivial if Y is a subset of X)
   */
  this.isTrivial = function() {
    if(rhs.length === 0)
      return true;
    return lhs.containsAll(rhs);
  };

  /**
   * Checks the equality of this Functional Dependency against another by first
   * checking the length, then checking the contents of both sides of each FD
   */
  this.equals = function(fd) {
    if(this.lhs.length !== fd.lhs.length || this.rhs.length !== fd.rhs.length)
      return false;

    for(var i=0;i<this.lhs.length;++i)
      if(this.lhs[i] != fd.lhs[i])
        return false;
    for(var j=0;j<this.rhs.length;++j)
      if(this.rhs[j] != fd.rhs[j])
        return false;

    return true;
  };

  /* Prints them in a pretty way, like: A → B, C */
  this.toString = function() {
    return this.lhs.join(', ') + ' \u2192 ' + this.rhs.join(', ');
  };

  /* Useful for debugging */
  this.print = function() {
    console.log(this);
  };

}