/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Finite Automaton State (Graph Network SWNode) **/
// declare searching function
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

// class SWNode
var SWNode = function() {} // pre-declaration of SWNode class

SWNode.clearAll=function() { // remove all SWNodes
 SWNode.all=[]; // set Q (register list)
 SWNode.obj=[]; // data of Q (ID = order)
 SWNode.allfin=[]; // acceptable states F (register list)
}
SWNode.clearAll(); // initializing static var

SWNode.getNewID=function() { // find gap in SWNode.all
 for (var it=0;it<SWNode.all.length;it+=1) {
  if (SWNode.all.indexOf(it)==-1) {return it;}
 }
 return SWNode.all.length;
}

SWNode.prototype = {
 init:function(fin=false) {
  this.idx=SWNode.getNewID(); // ID (index)
  this.lkt=[]; // this links to ... (children)
  this.lkf=[]; // this links from ... (parents)
  this.fin=fin; // acceptable or not (boolean)
  SWNode.all.push(this.idx);
  SWNode.obj[this.idx]=this;
  if (fin) {SWNode.allfin.push(this.idx);}
  return this;
 },

 lk:function(target,chr=undefined) { // link (target ID, character) character=undefined for non-operation transition
 /* It is necessary introduce non-operation transition for the monodirect property we need here. e.g. for 'a*b*', having b should be different from no b state since no more a can be appended. */
  this.lkt.push([target,chr]);
  SWNode.obj[target].lkf.push([this.idx,chr]);
  return this;
 },

 rm:function() { // remove (warning: chain break will happen)
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOf0(SWNode.obj[this.lkf[it][0]].lkt,this.idx);
   if (pos>-1) {SWNode.obj[this.lkf[it][0]].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOf0(SWNode.obj[this.lkt[it][0]].lkf,this.idx);
   if (pos>-1) {SWNode.obj[this.lkt[it][0]].lkf.splice(pos,1);} // kick it out from array
  }
  pos=SWNode.all.indexOf(this.idx);
  if (pos>-1) {SWNode.all.splice(pos,1);}
  if (SWNode.obj[this.idx].fin) {
   pos=SWNode.allfin.indexOf(this.idx);
   if (pos>-1) {SWNode.allfin.splice(pos,1);}
  }
  SWNode.obj[this.idx]=undefined;
  return this.idx;
 },

 smrm:function() { // smooth remove: without breaking chains (warning: self-linking will be lost)
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOf0(SWNode.obj[this.lkf[it][0]].lkt,this.idx);
   if (pos>-1) {SWNode.obj[this.lkf[it][0]].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOf0(SWNode.obj[this.lkt[it][0]].lkf,this.idx);
   if (pos>-1) {SWNode.obj[this.lkt[it][0]].lkf.splice(pos,1);} // kick it out from array
  }
  for (itf in this.lkf) { for (itt in this.lkt) {
   if (this.lkf[itf][1]) {SWNode.obj[this.lkf[itf][0]].lk(this.lkt[itt][0],this.lkf[itf][1]);} // non + c = c
   if (this.lkt[itt][1]) {SWNode.obj[this.lkf[itf][0]].lk(this.lkt[itt][0],this.lkt[itt][1]);} // c1 + c2 = c1 + c2
   if (!this.lkf[itf][1]&&!this.lkt[itt][1]) {SWNode.obj[this.lkf[itf][0]].lk(this.lkt[itt][0],undefined);} // non + non = non
  }}
  pos=SWNode.all.indexOf(this.idx);
  if (pos>-1) {SWNode.all.splice(pos,1);}
  if (SWNode.obj[this.idx].fin) {
   pos=SWNode.allfin.indexOf(this.idx);
   if (pos>-1) {SWNode.allfin.splice(pos,1);}
  }
  SWNode.obj[this.idx]=undefined;
  return this.idx;
 },

 setFinal:function(fin=true) {
  if (fin!=this.fin) {
   if (fin) {
    this.fin=true;
    SWNode.allfin.push(this.idx);
   } else {
    this.fin=false;
    var pos=SWNode.allfin.indexOf(this.idx);
    if (pos>-1) {SWNode.allfin.splice(pos,1);}
   }
  }
  return this;
 }
}
