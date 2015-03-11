describe("Parse Input", function() {
  it("returns a dependency set", function() {
    var someInput = "a,s,d,f->g,h,i";
    var functionalDependencies = parseInput(someInput);
    expect(functionalDependencies.constructor).toEqual(DependencySet);
  });

  it("returns a list of functional dependencies that is the same size as the number of lines in the input", function() {
    var someInputWithMoreThanOneLine = "a,s,d,f->g,h,i\na,b->n";
    var functionalDependencies = parseInput(someInputWithMoreThanOneLine);
    expect(functionalDependencies.elements.length).toBeGreaterThan(1);
  });

  it("returns a list of FunctionalDependency objects", function() {
    var someInput = "a,s,d,f->g,h,i";
    var functionalDependencies = parseInput(someInput);
    expect(functionalDependencies.elements[0].constructor).toBe(FunctionalDependency);
  });

  it("returns a non-empty list when given input with spaces around the sides", function() {
    var someInput = "a,s,d,f  -> g,h,i ";
    var functionalDependencies = parseInput(someInput);
    expect(functionalDependencies.elements.length).toBeGreaterThan(0);
  });

});