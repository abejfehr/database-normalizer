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
