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
indexOf0idx = function(array,e){ // search for 1st element's index coupling
 for(var i=0; i<array.length; i+=1){
  if(array[i][0]&&array[i][0].idx==e){return i;}
 }
 return -1;
}

// class SWNode
var SWNode = function() {} // pre-declaration of SWNode class

SWNode.clearAll=function() { // remove all SWNodes
 SWNode.register={}; // (register list: to allocate id)
}
SWNode.clearAll(); // initializing static var
SWNode.unregister=function(id) { // remove 1 SWNodes
 delete SWNode.register[id];
}

SWNode.getNewID=function() { // find gap in SWNode.register
 for (var it=0;true;it+=1) {
  if (!SWNode.register[it]) {return it;}
 }
}

SWNode.prototype = {
 init:function(fin=false) {
  this.idx=SWNode.getNewID(); // ID (index)
  this.lkt=[]; // this links to ... (children)
  this.lkf=[]; // this links from ... (parents)
  this.fin=fin; // acceptable or not (boolean)
  SWNode.register[this.idx]=true; // use dict as set
  return this;
 },

 lk:function(target,chr=undefined) { // link (target SWNode, character) character=undefined for non-operation transition
 /* It is necessary introduce non-operation transition for the monodirect property we need here. e.g. for 'a*b*', having b should be different from no b state since no more a can be appended. */
  this.lkt.push([target,chr]);
  target.lkf.push([this,chr]);
  return this;
 },

 rm:function() { // remove (warning: chain break will happen)
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOf0idx(this.lkf[it][0].lkt,this.idx);
   if (pos>-1) {this.lkf[it][0].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOf0idx(this.lkt[it][0].lkf,this.idx);
   if (pos>-1) {this.lkt[it][0].lkf.splice(pos,1);} // kick it out from array
  }
  SWNode.unregister(this.idx);
  return this.idx;
 },

 smrm:function() { // smooth remove: without breaking chains (warning: self-linking will be lost, and only non-operation transition can cause inherit transition
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOf0idx(this.lkf[it][0].lkt,this.idx);
   if (pos>-1) {this.lkf[it][0].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOf0idx(this.lkt[it][0].lkf,this.idx);
   if (pos>-1) {this.lkt[it][0].lkf.splice(pos,1);} // kick it out from array
  }
  for (itf in this.lkf) { for (itt in this.lkt) {
   if (!this.lkf[itf][1]) {this.lkf[itf][0].lk(this.lkt[itt][0],this.lkt[itt][1]);} // non + c = c
   else if (!this.lkt[itt][1]) {this.lkf[itf][0].lk(this.lkt[itt][0],this.lkf[itf][1]);} // c + non = c
  }}
  SWNode.unregister(this.idx);
  return this.idx;
 },

 enew:function(char=undefined) { // extrude node: creating new branch
  var nnd=new SWNode().init();
  this.lk(nnd,char);
  return nnd;
 },

 snew:function(char=undefined) { // smooth add node: without creating new branch
  var nnd=new SWNode().init();
  nnd.lkt=this.lkt;
  this.lkt=[];
  this.lk(nnd,char);
  var pos; // position temp var
  for (it in nnd.lkt) {
   pos=indexOf0idx(nnd.lkt[it][0].lkf,this.idx);
   if (pos>-1) {nnd.lkt[it][0].lkf[pos][0]=nnd;} // replace this with nnd
  }
  return nnd;
 },

 setFinal:function(fin=true) {
  this.fin=fin;
  return this;
 }
}
