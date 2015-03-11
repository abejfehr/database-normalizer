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
