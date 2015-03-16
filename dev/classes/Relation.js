function Relation(argument) {
  /* create a relation out of the functional dependency FD
   * The left hand side becomes the primary key
   */

  this.attributes = []; //attributes or columns of the table
  this.primaryKey = []; //designated primary key

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

    // Don't show the bar if there aren't any non-key elements
    if(values.length > 0)
      returnString = returnString + " | ";

    returnString += values.join(', ');
    returnString = returnString + "]";

    return returnString;
  };

  // The argument can either be an AttributeSet(array) or a FunctionalDependency
  if(argument.constructor === Array) {
    this.constructWithAttributes(argument);
  } else {
    this.constructWithFunctionalDependency(argument);
  }

}