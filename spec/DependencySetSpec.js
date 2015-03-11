describe("copying a DependencySet", function() {

  it("retains elements when copied", function() {
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    var someDependencySet = new DependencySet();
    someDependencySet.add(someDependency);
    var someCopy = someDependencySet.copy();
    expect(someCopy.elements.length).toBeGreaterThan(0);
  });

  it("copies the elements as FunctionalDependencies", function() {
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    var someDependencySet = new DependencySet();
    someDependencySet.add(someDependency);
    var someCopy = someDependencySet.copy();
    expect(someCopy.elements[0].constructor).toBe(FunctionalDependency);
  });

  it("can be copied so changes don't affect each other", function() {
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    var someDependencySet = new DependencySet();
    someDependencySet.add(someDependency);
    var someCopy = someDependencySet.copy();
    someCopy.elements[0].lhs = [];
    expect(someCopy.elements[0].lhs).not.toEqual(someDependencySet.elements[0].lhs);
  });

});

describe("various attributes of a DependencySet", function() {

  it("contains elements", function() {
    var someDependencySet = new DependencySet();
    expect(someDependencySet.elements).not.toBeNull();
  });

  it("can add elements", function() {
    var someDependencySet = new DependencySet();
    var oldSize = someDependencySet.elements.length;
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    var newSize = someDependencySet.elements.length;
    expect(newSize).toBe(oldSize+1);
  });

  it("doesn't add two of the same elements though", function() {
    var someDependencySet = new DependencySet();
    var oldSize = someDependencySet.elements.length;
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    var duplicateDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(duplicateDependency);
    var newSize = someDependencySet.elements.length;
    expect(newSize).toBe(oldSize+1);
  });

  it("can add an entire DependencySet", function() {
    // Create our first set
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    var someSize = someDependencySet.elements.length;

    // Create our second set
    var anotherDependencySet = new DependencySet();
    var anotherDependency = new FunctionalDependency(['a','d'],['n']);
    anotherDependencySet.add(anotherDependency);
    var anotherSize = anotherDependencySet.elements.length;

    // Finally, add them together
    someDependencySet.addAll(anotherDependencySet);

    expect(someDependencySet.elements.length).toBe(someSize + anotherSize);
  });

  it("can remove equivalent Functional Dependencies from the DependencySet", function() {
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    var dependencyToRemove = new FunctionalDependency(['a','b','c'],['a','n']);
    var anotherDependency = new FunctionalDependency(['a','n'],['b']);
    someDependencySet.add(someDependency);
    someDependencySet.add(anotherDependency);
    var oldLength = someDependencySet.elements.length;
    someDependencySet.remove(dependencyToRemove);
    var newLength = someDependencySet.elements.length;
    expect(newLength).toBe(oldLength-1);
  });

  it("can check if it's empty", function() {
    var someDependencySet = new DependencySet();
    expect(someDependencySet.isEmpty()).toBeTruthy();
  });

  it("knows if it's not empty", function() {
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    expect(someDependencySet.isEmpty()).toBeFalsy();
  });

  it("can clear it's own contents", function() {
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    someDependencySet.clear();
    expect(someDependencySet.isEmpty()).toBeTruthy();
  });

  it("can check equality against other DependencySets based on closures", function() {
    var someDependencySet = new DependencySet();
    var someDependency = new FunctionalDependency(['a','b','c'],['a','n']);
    someDependencySet.add(someDependency);
    var anotherDependencySet = new DependencySet();
    var anotherDependency = new FunctionalDependency(['a','b','c'],['n']);
    anotherDependencySet.add(anotherDependency);
    expect(someDependencySet.equals(anotherDependencySet)).toBeTruthy();
  });

});
describe("the computational abilities of a DependencySet", function() {

  it("can remove it's own redundant left hand side attributes", function() {
    var someDependencySet = new DependencySet();
    someDependencySet.add(new FunctionalDependency(['SSN'],['Salary']));
    someDependencySet.add(new FunctionalDependency(['SSN'],['Phone']));
    someDependencySet.add(new FunctionalDependency(['SSN'],['Dno']));
    someDependencySet.add(new FunctionalDependency(['Pno'],['Pname']));
    someDependencySet.add(new FunctionalDependency(['Pno'],['Plocation']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Salary']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Phone']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Dno']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Dname']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Plocation']));

    while(someDependencySet.removeRedundantLeftHandAttributes(someDependencySet) > 0) { }

    expect(someDependencySet.elements.length).toBe(5); // Very specific for this test case // TODO: check if this is even true. I'm so sure it must not be
//    REPLACE: SSN,Pno -> Salary with SSN -> Salary
//    REPLACE: SSN,Pno -> Phone with SSN -> Phone
//    REPLACE: SSN,Pno -> Dno with SSN -> Dno
//    REPLACE: SSN,Pno -> Pname with Pno -> Pname
//    REPLACE: SSN,Pno -> Plocation with Pno -> Plocation
//    SSN -> Salary
//    SSN -> Phone
//    SSN -> Dno
//    Pno -> Pname
//    Pno -> Plocation
  });

  it("can find it's own minimal cover", function() {

    var someDependencySet = new DependencySet();
    someDependencySet.add(new FunctionalDependency(['SSN'],['Salary']));
    someDependencySet.add(new FunctionalDependency(['SSN'],['Phone']));
    someDependencySet.add(new FunctionalDependency(['SSN'],['Dno']));
    someDependencySet.add(new FunctionalDependency(['Pno'],['Pname']));
    someDependencySet.add(new FunctionalDependency(['Pno'],['Plocation']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Salary']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Phone']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Dno']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Dname']));
    someDependencySet.add(new FunctionalDependency(['SSN','Pno'],['Plocation']));

    var minCover = someDependencySet.minCover();

    expect(minCover.elements.length).toBe(5); // Very specific for this test case // TODO: check if this is even true. I'm so sure it must not be

//SSN -> Salary
//SSN -> Phone
//SSN -> Dno
//Pno -> Pname
//Pno -> Plocation
  });


});