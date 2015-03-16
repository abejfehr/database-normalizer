describe("Arrays", function() {

  it("returns a unique set with the added set() function", function() {
    var someArrayWithDuplicates = [1,2,3,4,1,2,1,3,9];
    var originalArrayLength = someArrayWithDuplicates.length;
    var resultArray = someArrayWithDuplicates.set();
    expect(resultArray.length).toBeLessThan(originalArrayLength);
  });

  it("even when the set is made of arrays", function() {
    var someArrayWithDuplicates = [[1,2],[1,2]];
    var originalArrayLength = someArrayWithDuplicates.length;
    var resultArray = someArrayWithDuplicates.set();
    expect(resultArray.length).toBeLessThan(originalArrayLength);
  });

  it("can calculate a closure when given a Dependency Set", function() {
    var someArrayOfAttributes = ['b','c','n'];
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    expect(someArrayOfAttributes.closure(someDependencySet)).toEqual(['b','c','n']);
  });

});