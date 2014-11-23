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
indexOf2 = function(array,e){ // search for 2nd element
 for(var i=0; i<array.length; i+=1){
  if(array[i][1]==e){return i;}
 }
 return -1;
}
var Node = function() {} // pre-declaration of Node class
Node.allStates=[]; // set Q
Node.objStates=[]; // data of Q
Node.finStates=[]; // acceptable states F
Node.getNullID=function() {
 for (var it=0;it<Node.allStates.length;it+=1) {
  if (Node.allStates.indexOf(it)==-1) {return it;}
 }
 return Node.allStates.length;
}
Node.prototype = { // obj property
 init:function(fin=false) {
  this.idx=Node.getNullID(); // index or identity number
console.log("init called:"+this.idx);
  this.lk2=[]; // this links to ...
  this.lkf=[]; // this links from ...
  this.fin=fin; // acceptable or not
  Node.allStates.push(this.idx);
  Node.objStates[this.idx]=this;
  if (fin) {Node.finStates.push(this.idx);}
  return this;
 },
 lk:function(chr,target) { // link (character, target ID)
console.log("lk called");
  this.lk2.push([chr,target]);
  Node.objStates[target].lkf.push([chr,this.idx]);
  return this;
 },
 rm:function() { // remove
  var thsPos;
  for (it in this.lkf) {
   thsPos=indexOf2(Node.objStates[this.lkf[it][1]].lk2,this.idx);
   if (thsPos>-1) {Node.objStates[this.lkf[it][1]].lk2.splice(thsPos,1);} // kick it out from array
  }
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
