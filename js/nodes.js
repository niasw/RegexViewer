/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
if (!Array.prototype.indexOf) { // for old javascript
 Array.prototype.indexOf = function(e){
  for(var i=0; i<this.length; i+=1){
    if(this[i]==e){return i;}
  }
  return -1;
 }
}
indexOf0 = function(array,e){ // search for 1st element
 for(var i=0; i<array.length; i+=1){
  if(array[i][0]==e){return i;}
 }
 return -1;
}
var Node = function() {} // pre-declaration of Node class
Node.clearAll=function() {
 Node.allStates=[]; // set Q
 Node.objStates=[]; // data of Q
 Node.finStates=[]; // acceptable states F
}
Node.clearAll();
Node.getNullID=function() {
 for (var it=0;it<Node.allStates.length;it+=1) {
  if (Node.allStates.indexOf(it)==-1) {return it;}
 }
 return Node.allStates.length;
}
Node.prototype = { // obj property
 init:function(fin=false) {
  this.idx=Node.getNullID(); // index or identity number
  this.lk2=[]; // this links to ...
  this.lkf=[]; // this links from ...
  this.fin=fin; // acceptable or not
  Node.allStates.push(this.idx);
  Node.objStates[this.idx]=this;
  if (fin) {Node.finStates.push(this.idx);}
  return this;
 },
 lk:function(target,chr=undefined) { // link (target ID, character) character=undefined for non-operation transition
 /* It is necessary introduce non-operation transition for the monodirect property we need here. e.g. for 'a*b*', having b should be different from no b state since no more a can be appended. */
  this.lk2.push([target,chr]);
  Node.objStates[target].lkf.push([this.idx,chr]);
  return this;
 },
 rm:function() { // remove
  var thsPos;
  for (it in this.lkf) {
   thsPos=indexOf2(Node.objStates[this.lkf[it][1]].lk2,this.idx);
   if (thsPos>-1) {Node.objStates[this.lkf[it][1]].lk2.splice(thsPos,1);} // kick it out from array
  }
  for (it in this.lk2) {
   thsPos=indexOf2(Node.objStates[this.lkf[it][1]].lk2,this.idx);
   if (thsPos>-1) {Node.objStates[this.lkf[it][1]].lk2.splice(thsPos,1);} // kick it out from array
  }
  thsPos=Node.allStates.indexOf(this.idx);
  if (thsPos>-1) {Node.allStates.splice(thsPos,1);}
  Node.objStates[this.idx]=undefined;
  return this.idx; // break chains
 },
 smrm:function() { // smooth remove: without breaking chains (warning: self-linking will be lost)
  var thsPos;
  for (it in this.lkf) {
   thsPos=indexOf0(Node.objStates[this.lkf[it][0]].lk2,this.idx);
   if (thsPos>-1) {Node.objStates[this.lkf[it][0]].lk2.splice(thsPos,1);} // kick it out from array
  }
  for (it in this.lk2) {
   thsPos=indexOf0(Node.objStates[this.lkf[it][0]].lk2,this.idx);
   if (thsPos>-1) {Node.objStates[this.lkf[it][0]].lk2.splice(thsPos,1);} // kick it out from array
  }
  for (itf in this.lkf) { for (it2 in this.lk2) {
   Node.objStates[this.lkf[itf][0]].lk(this.lk2[it2][0],this.lkf[itf][1]);
  }}
  thsPos=Node.allStates.indexOf(this.idx);
  if (thsPos>-1) {Node.allStates.splice(thsPos,1);}
  Node.objStates[this.idx]=undefined;
  return this.idx; // break chains
 },
 setFinal:function(fin=true) {
  if (fin!=this.fin) {
   if (fin) {
    this.fin=true;
    Node.finStates.push(this.idx);
   } else {
    this.fin=false;
    var thsPos=Node.finStates.indexOf(this.idx);
    if (thsPos>-1) {Node.finStates.splice(thsPos,1);}
   }
  }
  return this;
 }
}
