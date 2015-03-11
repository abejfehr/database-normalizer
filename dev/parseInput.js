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