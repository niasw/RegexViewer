/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Graph Network Node SWNode **/
// declare searching function
if (!Array.prototype.indexOf) { // for old javascript
 Array.prototype.indexOf = function(e){
  for(var i=0; i<this.length; i+=1){
    if(this[i]==e){return i;}
  }
  return -1;
 }
}
indexOfcomp = function(array,e,key,pos){ // search for component element's index coupling
 pos=pos||0;
 key=key||'idx';
 for(var i=0; i<array.length; i+=1){
  if(array[i][pos]&&array[i][pos][key]==e){return i;}
 }
 return -1;
}
indexOfkey = function(array,e,key){ // search for index coupling
 key=key||'id';
 for(var i=0; i<array.length; i+=1){
  if(array[i]&&array[i][key]==e){return i;}
 }
 return -1;
}
indexOfkeyfunc = function(array,e,keyfunc){ // search for index coupling with key-function
 for(var i=0; i<array.length; i+=1){
  if(array[i]&&keyfunc(array[i])==e){return i;}
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
 if (SWNode.register[id]) delete SWNode.register[id];
}

SWNode.getNewID=function() { // find gap in SWNode.register
 for (var it=0;true;it+=1) {
  if (!SWNode.register[it]) {return it;}
 }
}

SWNode.prototype = {
 unregister:function() { // call this if this node is no more needed
  SWNode.unregister(this.idx);
 },

 new:function(fin) { // initial as an independent node
  fin=fin||false; // for Chrome compatibility (only Firefox supports default parameter feature)
  this.idx=SWNode.getNewID(); // ID (index)
  this.lkt=[]; // this links to ... (children)
  this.lkf=[]; // this links from ... (parents)
  this.fin=fin; // acceptable or not (boolean)
  SWNode.register[this.idx]=true; // use dict as set
  return this;
 },
 spnew:function(id,fin) { // initial as an independent node and the ID is given
  fin=fin||false; // for Chrome compatibility (only Firefox supports default parameter feature)
  this.idx=id; // ID (index)
  this.lkt=[]; // this links to ... (children)
  this.lkf=[]; // this links from ... (parents)
  this.fin=fin; // acceptable or not (boolean)
  SWNode.register[this.idx]=true; // use dict as set
  return this;
 },

 lk:function(target,chr) { // link (target SWNode, character) character=undefined for non-operation transition
 /* It is necessary introduce non-operation transition for the monodirect property we need here. e.g. for 'a*b*', having b should be different from no b state since no more a can be appended. */
  chr=chr||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  var srclkt={'node':target,'char':chr};
  var tgtlkf={'node':this,'char':chr};
  this.lkt.push(srclkt);
  target.lkf.push(tgtlkf);
  return {'srclkt':srclkt,'tgtlkf':tgtlkf}; // 'source link to' & 'target link from' objs
 },

 del:function() { // remove (warning: chain break will happen)
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOfkeyfunc(this.lkf[it]['node'].lkt,this.idx,function(d){return d.node.idx;});
   if (pos>-1) {this.lkf[it]['node'].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOfkeyfunc(this.lkt[it]['node'].lkf,this.idx,function(d){return d.node.idx;});
   if (pos>-1) {this.lkt[it]['node'].lkf.splice(pos,1);} // kick it out from array
  }
  SWNode.unregister(this.idx);
  return this.idx;
 },

 sdel:function() { // smooth remove: without breaking chains (warning: self-linking will be lost, and only non-operation transition can cause inherit transition
  var pos; // position temp var
  for (it in this.lkf) {
   pos=indexOfkeyfunc(this.lkf[it]['node'].lkt,this.idx,function(d){return d.node.idx;});
   if (pos>-1) {this.lkf[it]['node'].lkt.splice(pos,1);} // kick it out from array
  }
  for (it in this.lkt) {
   pos=indexOfkeyfunc(this.lkt[it]['node'].lkf,this.idx,function(d){return d.node.idx;});
   if (pos>-1) {this.lkt[it]['node'].lkf.splice(pos,1);} // kick it out from array
  }
  for (itf in this.lkf) { for (itt in this.lkt) {
   if (!this.lkf[itf]['char']) {this.lkf[itf]['node'].lk(this.lkt[itt]['node'],this.lkt[itt]['char']);} // non + c = c
   else if (!this.lkt[itt]['char']) {this.lkf[itf]['node'].lk(this.lkt[itt]['node'],this.lkf[itf]['char']);} // c + non = c
  }}
  SWNode.unregister(this.idx);
  return this.idx;
 },

 enew:function(char) { // extrude node: creating new branch
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  var nnd=new SWNode().new();
  this.lk(nnd,char);
  return nnd;
 },

 snew:function(char) { // smooth add node: without creating new branch
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  var nnd=new SWNode().new();
  nnd.lkt=this.lkt;
  this.lkt=[];
  this.lk(nnd,char);
  var pos; // position temp var
  for (it in nnd.lkt) {
   pos=indexOfcomp(nnd.lkt[it]['node'].lkf,this.idx);
   if (pos>-1) {nnd.lkt[it]['node'].lkf[pos]['node']=nnd;} // replace this with nnd
  }
  return nnd;
 },

 setFinal:function(fin) {
  fin=fin||true; // for Chrome compatibility (only Firefox supports default parameter feature)
  this.fin=fin;
  return this;
 }
}
