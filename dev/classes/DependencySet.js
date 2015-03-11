function DependencySet() {
  this.elements = [];
  this.add = function(fd) {
    // Go through and make sure there's none in there like that first
    for(var i=0;i<this.elements.length;++i) {
      if(this.elements[i].equals(fd)) {
        return;
      }
    }
    this.elements.push(fd);
  };
  this.addAll = function(ds) {
    //this.elements = (this.elements.concat(ds.elements));
    for(var i=0;i<ds.elements.length;++i) {
      this.add(new FunctionalDependency(ds.elements[i].lhs.copy(),ds.elements[i].rhs.copy()));
    }
  };
  this.remove = function(fd) {
    for(var i=0;i<this.elements.length;++i) {
      if(this.elements[i].equals(fd)) {
        this.elements.splice(i, 1);
        return;
      }
    }
  };
  this.removeRedundantLeftHandAttributes = function(F) {
    //find the first dependency in F that has a redundant left hand attribute and
    //replace it in F with one that has the redundant attribute removed
    //return the number of replacements done
    //return 0 if no change (improvement) has been made
    //console.log(F.copy().elements.length);
    for(var i=0;i<F.copy().elements.length;++i) {
      var fd = F.elements[i];
      if(fd.lhs.length > 1) {
        //compound left hand side.

        var leftAttributesToCheck = fd.lhs.copy();

        for(var j=0;j<leftAttributesToCheck.length;++j) {
          var a = leftAttributesToCheck[j];
          //console.log(a);
          var newLHS = fd.lhs.copy();
          //console.log(newLHS);
          newLHS.remove(a);
          //console.log(newLHS);
          var newFD = new FunctionalDependency(newLHS,fd.rhs);
          var Fcopy = F.copy();
          Fcopy.remove(fd);
          //console.log('Fcopy was asked to remove ' + fd.lhs + '->' + fd.rhs);
          Fcopy.add(newFD);
          //console.log('Fcopy was asked to add ' + newFD.lhs + '->' + newFD.rhs);
          //console.log('Fcopy');
          //Fcopy.print();
          //console.log('Fcopy was printed');
          //console.log('last F');
          //F.print();
          //console.log('last F was printed');
          if(Fcopy.equals(F)) {
            F.remove(fd);
            F.add(newFD);
            console.log("REPLACE: " + fd + " with " +  newFD.lhs + "->" + newFD.rhs);
            return 1; //made one modification
          }
        }
      }
    }
    return 0; //no modifications found
  };
  this.minCover = function($scope) {
    var minCoverSoFar = null;

    /*convert dependencies with compound right had sides to
     *ones with single attribute right hand side and remove
     *any obvious duplicates.
     *E.g. A,B->A,C,D => A,B->C, A,B->D (A,B->A eliminated because it is trivial)
     *
     */

    var singleRightHandSides = new DependencySet();
    for(var i=0;i<this.elements.length; ++i) {
      var fd = this.elements[i];
      if(fd.isTrivial()) { /*don' add it*/ }
      else if(fd.rhs.length == 1) {
        singleRightHandSides.add(new FunctionalDependency(fd.lhs, fd.rhs));
      } else {
        //create a separate FD for each right hand side attribute
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
    if($scope)
      $scope.singleRightHandSides = singleRightHandSides;

    /*
     * Remove any redundant attributes from the left hand side of dependencies
     * Replace dependencies with redundant left hand sides with ones with the
     * redundancy removed
     */

    while(this.removeRedundantLeftHandAttributes(minCoverSoFar) > 0) { }


    /*
     * Remove any unnecessary dependencies
     * A dependency X->Y is unnecessary in F if
     * X+ with respect to F-(X->Y) yields Y
     */

    for(var k=0;k<minCoverSoFar.copy().elements.length;++k) {
      var fdN = minCoverSoFar.copy().elements[k];
      minCoverSoFar.remove(fdN);
      if(!fdN.lhs.closure(minCoverSoFar).containsAll(fdN.rhs)) { minCoverSoFar.add(fdN); }
    }

    var minCover = minCoverSoFar;

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
  this.copy = function() {
    //return a shallow copy of this dependency set
    var theCopy = new DependencySet();
    theCopy.addAll(this);
    return theCopy;
  };
  this.isEmpty = function() {
    return (this.elements.length === 0);
  };
  this.equals = function(otherDS) {
    for(var i=0;i<this.elements.length;++i) {
      var fd = this.elements[i];
      var closure = fd.lhs.closure(otherDS);
      if(!closure.containsAll(fd.rhs)) {
        return false;
      }
    }
    for(var j=0;j<this.elements.length;++j) {
      var fdX = this.elements[j];
      var closureX = fdX.lhs.closure(this);
      if(!closureX.containsAll(fdX.rhs)) {
        return false;
      }

    }

    return true;

    // Go through and make sure each set is the same
    //if(this.elements.length !== otherDS.elements.length) { return false; }
    //for(var i=0;i<this.elements.length;++i) {
    //  if(this.elements[i].lhs != otherDS.elements[i].lhs || this.elements[i].rhs != otherDS.elements[i].rhs) {
    //    return false;
    //  }
    //}
    //return true;
  };
  this.clear = function() {
    this.elements = [];
  };
  this.print = function() {
    for(var i=0;i<this.elements.length;++i) {
      this.elements[i].print();
    }
  };
}