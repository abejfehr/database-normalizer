describe("Functional Dependency", function() {

  it("contains left hand side attributes", function() {
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    expect(someDependency.lhs).not.toBeNull();
  });

  it("contains right hand side attributes", function() {
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    expect(someDependency.rhs).not.toBeNull();
  });

  it("can return a complete attribute set", function() {
    var leftHandAttributes = ['a','b','c'];
    var rightHandAttributes = ['d','e','f'];
    var someDependency = new FunctionalDependency(leftHandAttributes, rightHandAttributes);
    expect(someDependency.getAttributeSet().length).toBe(leftHandAttributes.length + rightHandAttributes.length);
  });

  it("knows when it's trivial", function() {
    var leftHandAttributes = ['a','b','c'];
    var rightHandAttributes = ['a']; // Notice how 'a' is already in the lhs, making this trivial
    var someDependency = new FunctionalDependency(leftHandAttributes, rightHandAttributes);
    expect(someDependency.isTrivial()).toBeTruthy();    

  });

});