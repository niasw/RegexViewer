/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** parsing regex without grammar analysis **/
/**  dependency: ./swnodes.js **/
indexOf1 = function(array,e){ // search for 2nd element
 for(var i=0; i<array.length; i+=1){
  if(array[i][1]==e){return i;}
 }
 return -1;
}

var reg2ptn = function(regex) { // transfer modern regex into minimal regex
 /*
  *   '(p)?' => '(|p)'
  *   '(p)*' => '(|p+)'
  *   '[abc]' => '(a|b|c)'
  *   '[A-Z]' => '\[A-Z\]' lkt[it][1]="AZ"
  *   '\n' => '\n' lkt[it][1]="\n"
  *   '.' => '\.'
  *   '\\' => '\\' lkt[it][1]='\'
  *   '(p){3,5}' => '(ppp(|pp))'
  */
 return regex.replace(/\./g,"\\.");
 // TODO
}

var ENFAbuilder = function(pattern="") { // Nondeterminal Finite Automaton with none-char transition
 /*
  * graph network:
  *   entry = start state,
  *   nodes = states set Q (sub-list of Node.all)
  *   final = accept set F (sub-list of Node.allfin)
  */
 this.graph = {
  "entry": undefined,
  "nodes": [],
  "final": []
 };
 this.graph.entry = new SWNode().init().idx;
 this.graph.nodes=[this.graph.entry];
 /*
  * ptn: pattern string
  * pos: position of char in pattern we are dealing with
  */
 this.ptn = pattern;
 this.pos = 0;
 /*
  * aux bracket system
  *   bktStack: save ['{','}'], '{' indicates upper level bracket, '}' is only used for '|'
  *   bktUsing: save ['(',')'], current level bracket, used for '+'
  */
 this.bktStack = [[this.graph.entry,undefined]]; // { ( "" )
 var tmpnode=new SWNode().init().idx;
 this.graph.nodes.push(tmpnode);
 SWNode.obj[this.graph.entry].lk(tmpnode);
 this.bktUsing = [this.graph.entry,tmpnode];
}

ENFAbuilder.prototype = {
 bye:function() { // release all allocated space, assume this network is independent with others
  for (it in this.graph.nodes) {
   var pos=SWNode.all.indexOf(this.graph.nodes[it]);
   if (pos>-1) {SWNode.all.splice(pos,1);}
   if (SWNode.obj[this.graph.nodes[it]].fin) {
    pos=SWNode.allfin.indexOf(this.idx);
    if (pos>-1) {SWNode.allfin.splice(pos,1);}
   }
   SWNode.obj[this.graph.nodes[it]]=undefined;
  }
 },

 aux_del:function(nodeID) { // aux method to remove node from register list
  SWNode.obj[nodeID].smrm();
  var pos=this.graph.nodes.indexOf(nodeID);
  if (pos>-1) {this.graph.nodes.splice(pos,1);}
 },
 aux_new:function() { // aux method to add node into register list
  var ret=new SWNode().init().idx;
  this.graph.nodes.push(ret);
  return ret;
 },
 aux_fin:function(nodeID,isfinal) { // aux method to add node into register list
  if (SWNode.obj[nodeID].fin!=isfinal) {
   SWNode.obj[nodeID].setFinal(isfinal);
   if (isfinal) {
    this.graph.final.push(nodeID);
   } else {
    var pos=this.graph.final.indexOf(nodeID);
    if (pos>-1) {this.graph.final.splice(pos,1);}
   }
  }
 },

 high:function() { // return nodes with bracket info highlighted
  var ret=[]; // return
  var pos;
  for (it in this.graph.nodes) {
   ret.push({"index":this.graph.nodes[it],"marks":[]});
   pos=indexOf0(this.bktStack,this.graph.nodes[it]);
   if (pos!=-1) {ret[it].marks.push('{');}
   pos=indexOf1(this.bktStack,this.graph.nodes[it]);
   if (pos!=-1) {ret[it].marks.push('}');}
   if (this.graph.nodes[it]==this.bktUsing[0]) {ret[it].marks.push('(');}
   if (this.graph.nodes[it]==this.bktUsing[1]) {ret[it].marks.push(')');}
  }
  return ret;
 },

 dump:function() { // return graph of current ENFA
  var ret={};
  ret.entry=this.graph.entry;
  ret.nodes=this.graph.nodes;
  ret.final=this.graph.final;
  ret.store=SWNode.obj;
  return ret;
 },

 steponce:function(char=this.ptn[this.pos]) { // return variation
//var ret=""; // return graph variation
  switch (char) {
  case '(': // {...{...(p) => {...{....p.{("")
   if (SWNode.obj[this.bktUsing[0]].lkt[0][0]!=this.bktUsing[1]) {
//  ret=ret+"D"+SWNode.obj[bktUsing[0]].lkt[0][0]; // delete aux node
    this.aux_del(SWNode.obj[this.bktUsing[0]].lkt[0][0]);
   }
   this.bktStack.push([this.bktUsing[0],undefined]);
   this.bktUsing[0]=this.bktUsing[1];
// ret=ret+"E"+this.bktUsing[0];  // extrude with non-char transition
   this.bktUsing[1]=this.aux_new();
   SWNode.obj[this.bktUsing[0]].lk(this.bktUsing[1]);
   break;
  case ')': // {...{...(p) => {...(....p.)
   var tmpBkt=this.bktStack.pop();
   this.bktUsing[0]=tmpBkt[0];
   if (tmpBkt[1]) {
//  ret=ret+"L"+this.bktUsing[1]+","+tmpBkt[1]; // link with non-char transition
    SWNode.obj[this.bktUsing[1]].lk(tmpBkt[1]);
    this.bktUsing[1]=tmpBkt[1];
   }
   break;
  case '|': // {...{...(p) => {...{....p.|("")
   var tmpBkt=this.bktStack.pop();
   if (!tmpBkt[1]) {
//  ret=ret+"E"+this.bktUsing[1]; // extrude with non-char transition
    tmpBkt[1]=this.aux_new();
   }
   else {ret=ret+"L"+this.bktUsing[1]+","+tmpBkt[1];} // link with non-char transition
   SWNode.obj[this.bktUsing[1]].lk(tmpBkt[1]);
   this.bktUsing[1]=SWNode.obj[tmpBkt[0]].lkt[0][0];
   this.bktStack.push(tmpBkt);
   break;
  case '+': // {...{...(p) => {...{...(p+)
// ret=ret+"L"+this.bktUsing[1]+","+SWNode.obj[this.bktUsing[0]].lkt[0][0]; // link with non-char transition
   SWNode.obj[this.bktUsing[1]].lk(SWNode.obj[this.bktUsing[0]].lkt[0][0]); // link back
   break;
  case '\\': // special char
   // TODO
  default: // {...{...(p) => {...{....p.(c)
   var tmpnode;
   if (SWNode.obj[this.bktUsing[0]].lkt[0][0]!=this.bktUsing[1]) {
//  ret=ret+"D"+SWNode.obj[this.bktUsing[0]].lkt[0][0]; // delete aux node
    this.aux_del(SWNode.obj[this.bktUsing[0]].lkt[0][0]);
    this.bktUsing[0]=this.bktUsing[1];
//  ret=ret+"E"+this.bktUsing[0]; // extrude with non-char transition
    tmpnode=this.aux_new();
    SWNode.obj[this.bktUsing[0]].lk(tmpnode);
   } else {tmpnode=this.bktUsing[1];}
// ret=ret+"E("+char+")"+this.bktUsing[0]; // extrude with char transition
   this.bktUsing[1]=this.aux_new();
   SWNode.obj[tmpnode].lk(this.bktUsing[1],char);
  }
  this.pos+=1;
//return ret;
 },

 step:function() { // try to step
//var ret="";
  if (this.pos<this.ptn.length) {
   this.steponce(); // ret=ret+this.steponce();
// return ret;
  } else if (this.pos==this.ptn.length) {
// ret=ret+"D"+SWNode.obj[bktUsing[0]].lkt[0][0]; // delete aux node
   this.aux_del(SWNode.obj[this.bktUsing[0]].lkt[0][0]);
   this.aux_fin(this.bktUsing[1],true);
   this.pos+=1;
   this.bktStack=[];
   this.bktUsing=[];
// return ret+"F"; // final
  }
 },

 run:function() { // keep stepping until end
  while (this.pos<=this.ptn.length) {
   this.step();
  }
//return this.dump();
 }
}
