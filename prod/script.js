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
    return this.lhs + ' \u2192 ' + this.rhs;
  };

  this.print = function() {
    console.log(this);
  };

}
/**
 * parseInput takes an array of strings that represent functional dependencies
 * and returns them as an array of objects containing functionaldependency
 * objects.
 */
var parseInput = function(lines) {

  lines = lines.split('\n');
  var functionalDependencies = new DependencySet();

  for(var i = 0; i < lines.length; ++i) {
    var line = lines[i];
    var arrowIndex = line.indexOf('->');
    if(arrowIndex >= 0) {
      var lhs = line.substring(0, arrowIndex).trim().split(',');
      var rhs = line.substring(arrowIndex + 2, line.length).trim().split(',');

      // Trim all the individual attributes
      for(var j=0;j<lhs.length;++j)
        lhs[j] = lhs[j].trim();
      for(var k=0;k<rhs.length;++k)
        rhs[k] = rhs[k].trim();

      // Make sure they're nonzero and add them to the list
      if(lhs.length > 0 && rhs.length > 0) {
        var functionalDependency = new FunctionalDependency(lhs, rhs);
        functionalDependencies.add(functionalDependency);
      }
    }
  }

  return functionalDependencies;

};
angular.module('dbNormalizer', [])
.controller('appController', ['$scope', function($scope) {
  $scope.rawInput = 'SSN -> Salary\nSSN -> Phone\nSSN -> Dno\nPno -> Pname\nPno -> Plocation\nSSN,Pno -> Salary\nSSN,Pno -> Phone\nSSN,Pno -> Dno\nSSN,Pno -> Pname\nSSN,Pno -> Plocation';
  $scope.functionalDependencies = null;
  $scope.minCover = null;
  $scope.singleRightHandSides = null;
  $scope.normalize = function() {
    /* The first thing that we do is sanitize the input that we have */
    var lines = $scope.rawInput;

    /* Parse the input */
    $scope.functionalDependencies = parseInput(lines);

    while($scope.functionalDependencies.removeRedundantLeftHandAttributes($scope.functionalDependencies) > 0) { }

    $scope.minCover = $scope.functionalDependencies.minCover($scope);

    //Merge all the functional dependencies in the minimal cover that have the same
    //left hand side.
    // e.g. replace X->Y, X->Z with X->Y,Z

    var toMerge = $scope.minCover.copy();
    var newMinCover = new DependencySet();

    while(!toMerge.isEmpty()){
      var fd = toMerge.elements[0];
      toMerge.remove(fd);
      $scope.minCover.remove(fd);
      newMinCover.add(fd);
      for(var i=0;i<toMerge.elements.length;++i) {
        var fd2 = toMerge.elements[i];
        if(fd.lhs.equals(fd2.lhs)) {
          fd.rhs = fd.rhs.concat(fd2.rhs);
          $scope.minCover.remove(fd2);
        }
      }
      toMerge = $scope.minCover.copy();
    }

    $scope.minCover = newMinCover;

    //Minimal Cover with LHS's merged
    console.log(minCover);

    var allAttributes = functionalDependencies.attributeSet();

    //find all the candidate keys of a table consisting of all
    //the attributes with respect to the functional dependencies
    var candidateKey = findCandidateKey(minCover);
    alert(candidateKey);

    var candidateKeys = allAttributes.allCandidateKeys(minCover);
    if(candidateKeys !== null)
      for(var j=0;j<candidateKeys.elements.length;++j) {
        var aKey = candidateKeys.elements[j];
        alert(aKey);
      }

      // Dependency-preserving, 3NF tables

    //Step 1: already done above
    //Step 2:
    var database_3nf_dep_preserving = [];
    for(var k=0;k<5;++k) {
      var fdX = $scope.minCover.elements;
      var table = new Relation(fdX);
      database_3nf_dep_preserving.add(table);
    }
    //Step 3:
    var minCoverAttributes = minCover.getAllAttributes();
    var leftOverAttributes = [];
    for(var l=0;l<allAttributes.length;++l) {
      if(!minCoverAttributes.contains(a)) {
        leftOverAttributes.add(a);
      }

      if(!leftOverAttributes.isEmpty()){
        var tableOfLeftOverAttributes = new Relation(leftOverAttributes,leftOverAttributes);
        database_3nf_dep_preserving.add(tableOfLeftOverAttributes);
      }

      for(var m=0;m<database_3nf_dep_preserving.length;++m) {
        var r = database_3nf_dep_preserving[m];
        alert(r);
      }
    }
    //System.out.println("\nLossless-Join, Dependency Preserving, 3NF tables");

    //Step 1 & 2
    var database_3nf_lossless_join_dep_preserving = [];
    for(var n=0;n<$scope.minCover.elements.length;++n) {
      var fdY = minCover.elements[n];
      var tableY = new Relation(fdY);
      database_3nf_lossless_join_dep_preserving.add(tableY);
    }

    //Step 3: Ensure decomposition contains a key for an imaginary table
    //        consisting of all the attributes
    var keyFound = false;
      for(var o=0;o<database_3nf_lossless_join_dep_preserving.length;++o) {
        var tableZ = database_3nf_lossless_join_dep_preserving[o];
        var columns = tableZ.getAttributes();
        if(columns.containsAll(candidateKey)) {
          keyFound = true;
          break;
        }

      }
    if(!keyFound)
      database_3nf_lossless_join_dep_preserving.add(new Relation(candidateKey,candidateKey));

    //Step 4: Remove any redundant tables
    //A table is redundant if all of its attributes appears in some other table.

    var redundantTable = null;
    while((redundantTable = findRedundantTable(database_3nf_lossless_join_dep_preserving)) !== null){
      database_3nf_lossless_join_dep_preserving.remove(redundantTable);
      //System.out.println("Removing Redundant table: " + redunantTable);

    }

    for(var p=0;p<database_3nf_lossless_join_dep_preserving.length;++p) {
      var q = database_3nf_lossless_join_dep_preserving[p];
      //System.out.println(q);
    }
  };
}]);
