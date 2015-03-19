/**
 * Overrides or adds a number of methods to the built-in Array type in
 * JavaScript to make it behave more like an Attribute Set
 */

/* Returns a proper set of the elements in the Array */
Array.prototype.set = function() {
  var arr = this;
  return this.sort().filter(function(item, pos) {
    return !pos || JSON.stringify(item) != JSON.stringify(arr[pos - 1]);
  });
};

/**
 * Returns a boolean of whether or not all the elements in the argument are
 * contained in this Array
 */
Array.prototype.containsAll = function(otherArr) {
  var commonSet = [];
  for(var i=0;i<otherArr.length;++i)
    if(this.indexOf(otherArr[i]) > -1)
      commonSet.push(otherArr[i]);
  return (commonSet.length === otherArr.length);
};

/* Returns an exact copy of this Array */
Array.prototype.copy = function() {
  return this.slice();
};

/* Checks if another Array is equal to this one */
Array.prototype.equals = function (array) {
  /* First, discount equality based on falsy arrays or inconsistent lengths */
  if (!array)
    return false;
  if (this.length != array.length)
    return false;

  /* Go through and check all the elements */
  for (var i = 0, l=this.length; i < l; i++) {
    /* Nested Arrays */
    if (this[i] instanceof Array && array[i] instanceof Array) {
      /* Recurse */
      if (!this[i].equals(array[i]))
        return false;
    }
    else if (this[i] != array[i])
      return false;
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

/**
 * Compute and return the closure of an attribute set with respect to a set of
 * Functional Dependencies F. The closure are all those attributes that are
 * implied by this with regards to F using Armstrong's axioms
 */
Array.prototype.closure = function(F) {

  var previous = [];

  var current = this.copy();	//reflexive rule
  while(!current.equals(previous)){
    previous = current.copy();
    current = current.copy();
    for(var i=0;i<F.elements.length;++i) {
      var fd = F.elements[i];
      if(current.containsAll(fd.lhs))
        current = current.concat(fd.rhs).set();
    }
  }

  return current;
};

Array.prototype.findCandidateKey = function(theFDs) {
  var candidateKey = this.copy();
  for(var i=0;i<this.length;++i) {
    var a = this[i];
    var tryCandidate = candidateKey.copy();
    tryCandidate.remove(a);
    if(tryCandidate.closure(theFDs).containsAll(this))
      candidateKey = tryCandidate;
  }

  return candidateKey;
};

/*
 * Return a Set of all the minimal candidate keys of a relation consisting of theAttributes
 * with respect to the functional dependencies: theFDs
 *
 * Approach:
 * Start with the complete set of attributes as a super key and recursively
 * decompose it leaving only minimal keys.
 */
Array.prototype.allCandidateKeys = function(theFDs){

  var MAX_NUMBER_OF_ATTRIBUTES_FOR_ALL_KEYS_FIND = 10;

  var initialSuperKeys = [];
  var key = this.copy();
  initialSuperKeys.push(key);

  if(this.length <= MAX_NUMBER_OF_ATTRIBUTES_FOR_ALL_KEYS_FIND)
    return this.candidateKeys(initialSuperKeys, theFDs);
  else{
    Console.log("WARNING: Too many attributes to find all possible keys, RETURNING NULL");
    return null;
  }
};


/*
 * Answers a Set of all the minimal candidate keys the a relation consisting of
 * attributes: theAttrubutes
 * with respect to a set of functional dependencies: theFDs
 * given an initial set of super keys: superkeys.
 *
 * WARNING: this is a computationally expensive recursion (exponential time)
 * It is intended for only small attributes sets.
 * For large sets use the candidateKey() method that only finds one
 * candidate key

 * theAttributes: the attributes defining the relation
 * theFDs: the functional dependencies that apply to the relation
 * superkeys: a Set of superkeys of the relation wrt the functional dependencies.
 *
 * Approach:
 * recursively try to minimize all the superkeys until only minimal keys are
 * left and return that set
 */
Array.prototype.candidateKeys = function(superkeys, theFDs) {

  /* Base case */
  if(superkeys.isEmpty()) return superkeys; // Return an empty set

  /* Recursive cases */
  var aSuperkey = superkeys[0];

  superkeys.remove(aSuperkey);


  if(aSuperkey.length == 1){
    // Can't make it any smaller
    var candidateKeys = [];
    candidateKeys.push(aSuperkey);
    candidateKeys = candidateKeys.concat(candidateKeys(superkeys, theFDs));
    return candidateKeys;

  }

  /* Try removing an attribute to minimize the superkey */
  var attributesToRemove = aSuperkey.copy();
  var newCandidates = [];

  for(var i=0;i<attributesToRemove.length;++i) {
    var a = attributesToRemove[i];
    var newPossibleKey = aSuperkey.copy();
    newPossibleKey.remove(a);
    if(newPossibleKey.closure(theFDs).containsAll(this))
      newCandidates.push(newPossibleKey);
  }

  if(newCandidates.isEmpty()){
    var candidateKeys2 = [];
    candidateKeys2.push(aSuperkey);
    candidateKeys2 = candidateKeys2.concat(this.candidateKeys(superkeys, theFDs));
    return candidateKeys2;
  }
  else {
    var candidateKeys3 = [];
    for(var j=0;j<newCandidates.length;++j) {
      var candidate = newCandidates[j];
      var candidateKeyAsSet = [];
      candidateKeyAsSet.push(candidate);
      candidateKeys3 = candidateKeys3.concat(this.candidateKeys(candidateKeyAsSet, theFDs));
    }
    candidateKeys3 = candidateKeys3.concat(this.candidateKeys(superkeys, theFDs));
    return candidateKeys3;
  }

};
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
/**
 * Relation between functional dependencies
 *
 * The constructor for this class only takes one argument, which is either a
 * Functional Dependency or a list of Attributes
 */
function Relation(argument) {

  this.attributes = []; //attributes or columns of the table
  this.primaryKey = []; //designated primary key

  /* Constructor for when the argument is a Functional Dependency */
  this.constructWithFunctionalDependency = function(FD) {

    if(FD === null)
      console.log("ERROR: Cannot create table out of null dependency");
    if(FD.lhs.isEmpty() || FD.rhs.isEmpty())
      console.log("ERROR: Cannot create table out of empty dependency");

    this.attributes = [];
    this.attributes = this.attributes.concat(FD.lhs);
    this.attributes = this.attributes.concat(FD.rhs);

    this.primaryKey = [];
    this.primaryKey = this.primaryKey.concat(FD.lhs);

  };

  /* Constructor for when the argument is a set of Attributes */
  this.constructWithAttributes = function(theAttributes) {

    var key = theAttributes.copy();

    if(theAttributes === null) {
      console.log("ERROR: Attribute set cannot be null");
    }

    if(theAttributes.isEmpty()) {
      console.log("ERROR: EMPTY ATTRITBUTE SET");
    }

    if(key !== null && !theAttributes.containsAll(key)) {
      console.log("ERROR: PRIMARY KEY MUST BE A SUBSET OF THE ATTRIBUTES");
    }

    this.attributes = [];
    this.attributes = this.attributes.concat(theAttributes);

    if(key !== null){
      this.primaryKey = [];
      this.primaryKey = this.primaryKey.concat(key);
    }

  };

  this.containsAll = function(r) {
    return this.attributes.containsAll(r.attributes);
  };


  /**
   * Prints out the Relation in the form: [ <keys> | <non-key attributes> ]
   *
   * Alternatively, if there are no non-key attributes then the relation will be
   * printed without the pipe, like this: [ <keys> ]
   */
  this.toString = function() {
    var returnString = "[";

    var keys = [];
    for(var i=0;i<this.attributes.length;++i) {
      var a = this.attributes[i];
      if(this.primaryKey.indexOf(a) >= 0) { keys.push(a); }
    }
    returnString += keys.join(', ');

    var values = [];
    for(var j=0;j<this.attributes.length;++j) {
      var a1 = this.attributes[j];
      if(this.primaryKey.indexOf(a1) < 0) { values.push(a1); }
    }

    if(values.length > 0)
      returnString = returnString + " | ";

    returnString += values.join(', ');
    returnString = returnString + "]";

    return returnString;
  };

  /* Decides which constructor to call based on the type of the argument */
  if(argument.constructor === Array) {
    this.constructWithAttributes(argument);
  } else {
    this.constructWithFunctionalDependency(argument);
  }

}
/**
 * Takes an array of strings that represent functional dependencies and returns
 * them as an array of objects containing functionaldependency objects.
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

      /* Trim all the individual attributes */
      for(var j=0;j<lhs.length;++j)
        lhs[j] = lhs[j].trim();
      for(var k=0;k<rhs.length;++k)
        rhs[k] = rhs[k].trim();

      /* Make sure they're nonzero and add them to the list */
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

  /* The default text in the box */
  $scope.rawInput = 'SSN -> Salary\nSSN -> Phone\nSSN -> Dno\nPno -> Pname\nPno -> Plocation\nSSN,Pno -> Salary\nSSN,Pno -> Phone\nSSN,Pno -> Dno\nSSN,Pno -> Pname\nSSN,Pno -> Plocation';

  /* The places where each of the results will be stored separately */
  $scope.functionalDependencies = null;
  $scope.singleRightHandSides = null;
  $scope.removedLHSAttributes = null;
  $scope.removedRedundantDependencies = null;
  $scope.minCover = null;
  $scope.minCoverMergedLHS = null;
  $scope.candidateKey = null;
  $scope.allCandidateKeys = null;
  $scope.dependencyPreserving3NFTables = null;
  $scope.losslessJoinDependencyPreserving3NFTables = null;

  /* The main action of the application */
  $scope.normalize = function() {

    /* Forget everything we already know */
    $scope.reset();

    /* Show the results panel and hide the placeholder */
    document.getElementById("results").style.display = "block";
    document.getElementById("noResults").style.display = "none";

    /* The first thing that we do is sanitize the input that we have */
    var lines = $scope.rawInput;

    /* Parse the input */
    $scope.functionalDependencies = parseInput(lines);

    /*
     * List of things to display
     * ✓ attributes
     * ✓ functional dependencies
     * - min cover
     *   - single right-hand sides
     *   - removal of redundant LHS attributes
     *   - removal of redundatn dependencies
     * - min cover
     * - min cover with merged LHS
     * - candidate key for all attributes
     * - all candidate keys
     * - DP 3NF Tables
     * - LJ DP 3NF Tables
     */

     /* This single calaculation will populate the min cover and it's 3 substeps */
     $scope.minCover = $scope.functionalDependencies.minCover($scope);


     /* Calculates the Minimal Cover with the Merged LHS */
    /* Merge all the functional dependencies in the minimal cover that have the
     * same left-hand-side.
     * e.g. replace X -> Y, X -> Z with X -> Y, Z */
    $scope.minCoverMergedLHS = $scope.minCover.copy();
    var toMerge = $scope.minCoverMergedLHS.copy();
    var newMinCover = new DependencySet();

    while(!toMerge.isEmpty()){
      var fd = toMerge.elements[0];
      toMerge.remove(fd);
      $scope.minCoverMergedLHS.remove(fd);
      newMinCover.add(fd);
      for(var i=0;i<toMerge.elements.length;++i) {
        var fd2 = toMerge.elements[i];
        if(fd.lhs.equals(fd2.lhs)) {
          fd.rhs = fd.rhs.concat(fd2.rhs);
          $scope.minCoverMergedLHS.remove(fd2);
        }
      }
      toMerge = $scope.minCoverMergedLHS.copy();
    }
    $scope.minCoverMergedLHS = newMinCover;




    /* The following is for the candidate key */
    var allAttributes = $scope.functionalDependencies.attributeSet();

    /**
     * Find all the candidate keys of a table consisting of all the attributes
     * with respect to the functional dependencies
     */
    var candidateKey = allAttributes.findCandidateKey($scope.minCoverMergedLHS);
    $scope.candidateKey = candidateKey;

    var candidateKeys = allAttributes.allCandidateKeys($scope.minCoverMergedLHS);
    $scope.allCandidateKeys = candidateKeys.set();




    /* Dependency-preserving, 3NF tables */
    var database_3nf_dep_preserving = [];
    for(var k=0;k<$scope.minCoverMergedLHS.elements.length;++k) {
      var fdX = $scope.minCoverMergedLHS.elements[k];
      var table = new Relation(fdX);
      database_3nf_dep_preserving.push(table);
    }
    var minCoverAttributes = $scope.minCoverMergedLHS.attributeSet();
    var leftOverAttributes = [];
    for(var l=0;l<allAttributes.length;++l) {
      var a=allAttributes[l];
      if(minCoverAttributes.indexOf(a) < 0) {
        leftOverAttributes.push(a);
      }
    }
    if(!leftOverAttributes.isEmpty()) {
      var tableOfLeftOverAttributes = new Relation(leftOverAttributes,leftOverAttributes);
      database_3nf_dep_preserving.push(tableOfLeftOverAttributes);
    }

    /* Save it to show it to the user */
    $scope.dependencyPreserving3NFTables = database_3nf_dep_preserving;


    /* Lossless join version of the previous tables */

    var findRedundantTable = function(database) {

      /**
       * Find and return any relation within: database whose attributes are all
       * contained within another table
       */
      for(var i=0;i<database.length;++i) {
        var r = database[i];
        for(var j=0;j<database.length;++j) {
          var r2 = database[j];
          if(r != r2 && r2.containsAll(r))
            return r;
        }
      }

      return null;
    };

    var database_3nf_lossless_join_dep_preserving = [];
    for(var n=0;n<$scope.minCoverMergedLHS.elements.length;++n) {
      var fdY = $scope.minCoverMergedLHS.elements[n];
      var tableY = new Relation(fdY);
      database_3nf_lossless_join_dep_preserving.push(tableY);
    }

    /**
     * Ensure decomposition contains a key for an imaginary table consisting of
     * all the attributes
     */
    var keyFound = false;
    for(var o=0;o<database_3nf_lossless_join_dep_preserving.length;++o) {
      var tableZ = database_3nf_lossless_join_dep_preserving[o];
      var columns = tableZ.attributes.set();
      if(columns.containsAll(candidateKey)) {
        keyFound = true;
        break;
      }
    }
    if(!keyFound)
      database_3nf_lossless_join_dep_preserving.push(new Relation(candidateKey,candidateKey));

    /**
     * Remove any redundant tables a table is redundant if all of its attributes
     * appears in some other table.
     */
    var redundantTable = null;
    while((redundantTable = findRedundantTable(database_3nf_lossless_join_dep_preserving)) !== null){
      database_3nf_lossless_join_dep_preserving.remove(redundantTable);
      console.log("Removing Redundant table: " + redundantTable);
    }

    $scope.losslessJoinDependencyPreserving3NFTables = database_3nf_lossless_join_dep_preserving;

  };

  /* Clears all of the stored information we have about any FDs */
  $scope.reset = function() {
    $scope.functionalDependencies = null;
    $scope.singleRightHandSides = null;
    $scope.removedLHSAttributes = null;
    $scope.removedRedundantDependencies = null;
    $scope.minCover = null;
    $scope.minCoverMergedLHS = null;
    $scope.candidateKey = null;
    $scope.allCandidateKeys = null;
    $scope.dependencyPreserving3NFTables = null;
    $scope.losslessJoinDependencyPreserving3NFTables = null;
  };
}]);
