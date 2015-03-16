Array.prototype.set = function() {
  var arr = this;
  return this.sort().filter(function(item, pos) {
    return !pos || JSON.stringify(item) != JSON.stringify(arr[pos - 1]);
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

Array.prototype.findCandidateKey = function(theFDs) {
  var candidateKey = this.copy();
  for(var i=0;i<this.length;++i) {
    var a = this[i];
    var tryCandidate = candidateKey.copy();
    tryCandidate.remove(a);
    if(tryCandidate.closure(theFDs).containsAll(this)) {
      candidateKey = tryCandidate;
    }
  }

  return candidateKey;
};

Array.prototype.allCandidateKeys = function(theFDs){
  /*
   * Return a Set of all the minimal candidate keys of a relation consisting of theAttributes
   * with respect to the functional dependencies: theFDs
   *
   *
   * Approach:
   * Start with the complete set of attributes as a super key and recursively
   * decompose it leaving only minimal keys.
   */

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


Array.prototype.candidateKeys = function(superkeys, theFDs) {
  /*
   * Answer a Set of all the minimal candidate keys the a relation consisting of attributes: theAttrubutes
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
   * recursively try to minimize all the superkeys until only minimal keys are left and
   * return that set
   *
   */

  //basis cases
  if(superkeys.isEmpty()) return superkeys; //return an empty set

  //recursive cases
  var aSuperkey = superkeys[0];

  superkeys.remove(aSuperkey);


  if(aSuperkey.length == 1){
    //can't make it any smaller
    var candidateKeys = [];
    candidateKeys.push(aSuperkey);
    candidateKeys = candidateKeys.concat(candidateKeys(superkeys, theFDs));
    return candidateKeys;

  }

  //try removing an attribute to minimize the superkey
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