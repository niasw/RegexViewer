/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
var TreeNode = function() {} // pre-declaration of TreeNode class
TreeNode.prototype = { // obj property
 init:function(idx=undefined) {
  this.idx=idx; // node referred to
  this.lk2=[]; // children
  this.lkf=[]; // parent
  return this;
 },
 index:function(idx) {
  this.idx=idx;
 },
 lk1:function(childnode) { // add child
  this.lk2.push(childnode);
  childnode.lkf.push(this);
  return this;
 },
 lk:function(nodeArray) { // add children
  this.lk2.concat(nodeArray);
  for (var it in nodeArray) {nodeArray[it].lkf.push(this);}
  return this;
 },
 rm:function() { // remove node. pass children to parent
  var thsPos;
  for (var it in this.lk2) {
   thsPos=this.lk2[it].lkf.indexOf(this);
   if (thsPos>-1) {this.lk2[it].lkf.splice(thsPos,1);}
  }
  if (lkf.length>0) {
   thsPos=this.lkf[0].lk2.indexOf(this);
   if (thsPos>-1) {this.lkf[0].lk2.splice(thsPos,1);}
   this.lkf[0].lk(this.lk2);
  }
 },
 brk:function() { // remove node. lose connection to children
  var thsPos;
  if (lkf.length>0) {
   thsPos=this.lkf[0].lk2.indexOf(this);
   if (thsPos>-1) {this.lkf[0].lk2.splice(thsPos,1);}
  }
 },
 trnvTwigs:function(twigFunc,leafFunc=undefined) { // special algorithm for strict balanced tree. traversal child tree twigs. Twigs are above a level from leaves.
  var nextLevel = function(auxArr) {
   var newArr = [];
   for (var it in auxArr) {
console.log("auxArr:");console.log(auxArr[it]);
    newArr.concat(auxArr[it].lk2);
console.log("newArr:");console.log(newArr);
   }
   return newArr;
  }
  var auxArr1=[this];
  var auxArr2=nextLevel(auxArr1);
console.log("auxArr2:");console.log(auxArr2);
  if (auxArr2.length<=0) return false; // failed
  else {
   while (auxArr2[0].lk2.length>0) { // watchout: strict balanced tree only
    auxArr1=auxArr2;
    auxArr2=nextLevel(auxArr1);
   }
   if (twigFunc) {
    for (var it in auxArr1) {
     twigFunc(auxArr1[it]);
    }
   }
console.log("trnvTwigs called");console.log(leafFunc);
   if (leafFunc) {
    for (var it in auxArr2) {
     leafFunc(auxArr2[it]);
    }
   }
  }
  return true; // succeeded
 },
 brkTwigs:function(twigFunc,brchFunc=undefined) { // special algorithm for strict balanced tree. traversal child tree twig branches. Twig branches are above a level from twigs.
  var nextLevel = function(auxArr) {
   var newArr = [];
   for (var it in auxArr) {
    newArr.concat(auxArr[it].lk2);
   }
   return newArr;
  }
  var auxArr0=[this];
  var auxArr1=nextLevel(auxArr0);
  var auxArr2=nextLevel(auxArr1);
  auxArr2=nextLevel(auxArr1);
  if (auxArr2.length<=0) return false; // failed
  else {
   while (auxArr2[0].lk2.length>0) { // watchout: strict balanced tree only
    auxArr0=auxArr1;
    auxArr1=auxArr2;
    auxArr2=nextLevel(auxArr2);
   }
   if (twigFunc) {
    for (var it in auxArr1) {
     twigFunc(auxArr1[it]);
    }
   }
   if (brchFunc) {
    for (var it in auxArr2) {
     brchFunc(auxArr0[it]);
    }
   }
  }
  return true; // succeeded
 }
}
