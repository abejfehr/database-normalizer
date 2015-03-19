/**
 * A set of Functional Dependencies
 */
function DependencySet() {

  this.elements = [];

  /* Adds a Functional Dependency to the DependencySet */
  this.add = function(fd) {
    /* Make sure the FD is unique */
    for(var i=0;i<this.elements.length;++i)
      if(this.elements[i].equals(fd))
        return;
    this.elements.push(fd);
  };

  /* Adds a list of Functional Dependencies to this one */
  this.addAll = function(ds) {
    //this.elements = (this.elements.concat(ds.elements)); -> Maybe this still works?
    for(var i=0;i<ds.elements.length;++i) {
      var toAdd = new FunctionalDependency(ds.elements[i].lhs.copy(),ds.elements[i].rhs.copy());
      this.add(toAdd);
    }
  };

  /* Removes a functional Dependency */
  this.remove = function(fd) {
    for(var i=0;i<this.elements.length;++i) {
      if(this.elements[i].equals(fd)) {
        this.elements.splice(i, 1);
        return;
      }
    }
  };

  /**
   * Finds the first dependency in F that has a redundant left hand attribute
   * and replace it in F with one that has the redundant attribute removed
   * - returns the number of replacements done
   * - returns 0 if no changes (improvement) have been made
   */
  this.removeRedundantLeftHandAttributes = function(F) {
    for(var i=0;i<F.copy().elements.length;++i) {
      var fd = F.elements[i];
      if(fd.lhs.length > 1) {

        var leftAttributesToCheck = fd.lhs.copy();

        for(var j=0;j<leftAttributesToCheck.length;++j) {
          var a = leftAttributesToCheck[j];
          var newLHS = fd.lhs.copy();
          newLHS.remove(a);
          var newFD = new FunctionalDependency(newLHS, fd.rhs);
          var Fcopy = F.copy();
          Fcopy.remove(fd);
          Fcopy.add(newFD);
          if(Fcopy.equals(F)) {
            F.remove(fd);
            F.add(newFD);
            console.log("REPLACE: " + fd + " with " +  newFD.lhs + "->" + newFD.rhs);
            return 1; // Made one modification
          }
        }
      }
    }
    return 0; // No modifications found
  };

  /**
   * Converts dependencies with compound right had sides to ones with single
   * attribute right hand side and remove any obvious duplicates.
   *
   * (eg. In A, B -> A, C, D => A, B -> C, A, B -> D
   * A, B -> A eliminated because it is trivial)
   */
  this.minCover = function($scope) {
    var minCoverSoFar = null;

    var singleRightHandSides = new DependencySet();
    for(var i=0;i<this.elements.length; ++i) {
      var fd = this.elements[i];
      if(fd.isTrivial()) { /* don't add it */ }
      else if(fd.rhs.length == 1)
        singleRightHandSides.add(new FunctionalDependency(fd.lhs, fd.rhs));
      else {
        // Create a separate FD for each right hand side attribute
        for(var j=0;j<fd.rhs.length;++j) {
          var a = fd.rhs;
          var newFD = new FunctionalDependency(fd.lhs, a.copy());
          if(!newFD.isTrivial()) {
            singleRightHandSides.add(newFD);
          }
        }
      }
    }

    minCoverSoFar = singleRightHandSides;
    /* If the $scope was passed in, we can store these results somewhere */
    if($scope)
      $scope.singleRightHandSides = singleRightHandSides;

    /*
     * Remove any redundant attributes from the left hand side of dependencies
     * Replace dependencies with redundant left hand sides with ones with the
     * redundancy removed
     */
    while(this.removeRedundantLeftHandAttributes(minCoverSoFar) > 0) { }
    if($scope)
      $scope.removedLHSAttributes = minCoverSoFar.copy();

    /*
     * Remove any unnecessary dependencies
     *
     * eg. A dependency X->Y is unnecessary in F if X+ with respect to
     * F - (X -> Y) yields Y
     */
    for(var k=0;k<minCoverSoFar.copy().elements.length;++k) {
      var fd = minCoverSoFar.copy().elements[k];
      minCoverSoFar.remove(fd);
      if(!fd.lhs.closure(minCoverSoFar).containsAll(fd.rhs))
        minCoverSoFar.add(fd);
    }

    var minCover = minCoverSoFar;
    /* Store the final result somewhere */
    if($scope)
      $scope.removedRedundantDependencies = minCoverSoFar.copy();

    return minCover;
  };

  this.attributeSet = function() {
    /* Populate all of the attributes */
    var allAttributes = [];
    for(var i=0;i<this.elements.length;++i) {
      allAttributes = allAttributes.concat(this.elements[i].lhs.set());
      allAttributes = allAttributes.concat(this.elements[i].rhs.set());
    }
    return allAttributes.set();
  };

  /* Returns a shallow copy of the Dependency Set */
  this.copy = function() {
    var theCopy = new DependencySet();
    theCopy.addAll(this);
    return theCopy;
  };

  this.isEmpty = function() {
    return (this.elements.length === 0);
  };

  /* Checks equality by ensuring that the closure of both sets */
  this.equals = function(otherDS) {
    for(var i=0;i<this.elements.length;++i) {
      var fd = this.elements[i];
      var closure = fd.lhs.closure(otherDS);
      if(!closure.containsAll(fd.rhs))
        return false;
    }
    for(var i=0;i<otherDS.elements.length;++i) {
      var fd = otherDS.elements[i];
      var closure = fd.lhs.closure(this);
      if(!closure.containsAll(fd.rhs))
        return false;
    }

    return true;
  };

  /* Clears the Dependency Set */
  this.clear = function() {
    this.elements = [];
  };

  /* Useful for debugging */
  this.print = function() {
    for(var i=0;i<this.elements.length;++i)
      this.elements[i].print();
  };
}