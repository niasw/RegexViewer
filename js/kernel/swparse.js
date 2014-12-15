/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** parsing regex without grammar analysis **/
/**  dependency: ./swnodes.js **/
indexOf1idx = function(array,e){ // search for 2nd element's index coupling
 for(var i=0; i<array.length; i+=1){
  if(array[i][1]&&array[i][1].idx==e){return i;}
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

var ENFAbuilder = function(pattern) { // Nondeterminal Finite Automaton with none-char transition
 /*
  * graph network:
  *   entry = start state,
  *   nodes = states set Q (sub-list of Node.all)
  *   final = accept set F (sub-list of Node.allfin)
  */
 pattern=pattern||""; // for Chrome compatibility (only Firefox supports default parameter feature)
 this.graph = {
  "entry": undefined,
  "nodes": {},
  "final": []
 };
 this.graph.entry = new SWNode().init();
 this.graph.nodes[this.graph.entry.idx]=this.graph.entry;
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
 this.bktUsing = [this.graph.entry,this.graph.entry];
}

ENFAbuilder.prototype = {
 clean:function() {
  for (it in this.graph.nodes) {
   SWNode.unregister(this.graph.nodes[it].idx);
  }
  this.bktStack=[];this.bktUsing=[undefined,undefined];
  this.graph.entry=undefined;
  delete this.graph;
 },

 aux_sdel:function(node) { // aux method to smooth remove node
  node.smrm();delete this.graph.nodes[node.idx];
 },
 aux_del:function(node) { // aux method to remove node and break chain
  node.rm();delete this.graph.nodes[node.idx];
 },
 aux_new:function() { // aux method to add node into register list
  var ret=new SWNode().init();
  this.graph.nodes[ret.idx]=ret;
  return ret;
 },
 aux_enew:function(node,char) { // aux method to extrude node
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  var ret=node.enew(char);
  this.graph.nodes[ret.idx]=ret;
  return ret;
 },
 aux_snew:function(node,char) { // aux method to smooth add node
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  var ret=node.snew(char);
  this.graph.nodes[ret.idx]=ret;
  return ret;
 },
 aux_fin:function(node,isfinal) { // aux method to add node into final register list
  if (node.fin!=isfinal) {
   node.setFinal(isfinal);
   if (isfinal) {
    this.graph.final.push(node.idx);
   } else {
    var pos=this.graph.final.indexOf(node.idx);
    if (pos>-1) {this.graph.final.splice(pos,1);}
   }
  }
 },

 high:function() { // return nodes with bracket info highlighted
  var ret=[]; // return
  var pos;
  var num=-1;
  for (it in this.graph.nodes) {
   ret.push({"index":this.graph.nodes[it].idx,"marks":[]});num+=1;
   pos=indexOf0idx(this.bktStack,this.graph.nodes[it].idx);
   if (pos!=-1) {ret[num].marks.push('{');}
   pos=indexOf1idx(this.bktStack,this.graph.nodes[it].idx);
   if (pos!=-1) {ret[num].marks.push('}');}
   if (this.bktUsing[0]&&this.graph.nodes[it].idx==this.bktUsing[0].idx) {ret[num].marks.push('(');}
   if (this.bktUsing[1]&&this.graph.nodes[it].idx==this.bktUsing[1].idx) {ret[num].marks.push(')');}
  }
  return ret;
 },

 dump:function() { // return graph of current ENFA
  var ret={};
  ret.entry=this.graph.entry;
  ret.nodes=this.graph.nodes;
  ret.final=this.graph.final;
  return ret;
 },

 steponce:function(char) { // return variation
  char=char||this.ptn[this.pos]; // for Chrome compatibility (only Firefox supports default parameter feature)
  var ret=""; // return graph variation
  switch (char) {
  case '(': // {...{...(p) => {...{....p.{("")
   this.bktStack.push([this.bktUsing[1],undefined]);
   break;
  case ')': // {...{...(p) => {...(....p.)
   var tmpBkt=this.bktStack.pop();
   this.bktUsing[0]=tmpBkt[0];
   if (tmpBkt[1]) {
    ret=ret+"L()"+this.bktUsing[1].idx+","+tmpBkt[1].idx; // link with non-char transition
    this.bktUsing[1].lk(tmpBkt[1]);
    this.bktUsing[1]=tmpBkt[1];
   }
   break;
  case '|': // {...{...(p) => {...{("")|....p.}
   var tmpBkt=this.bktStack.pop(); // the '}'
   if (!tmpBkt[1]) {
    ret=ret+"e()"+this.bktUsing[1].idx; // extrude with non-char transition
    tmpBkt[1]=this.aux_enew(this.bktUsing[1]);
   }
   else {
    ret=ret+"L"+this.bktUsing[1].idx+","+tmpBkt[1].idx; // link with non-char transition
    this.bktUsing[1].lk(tmpBkt[1]);
   }
   this.bktUsing[0]=tmpBkt[0];
   this.bktUsing[1]=tmpBkt[0];
   this.bktStack.push(tmpBkt);
   break;
  case '+': // {...{...(p) => {...{...(p+)
   ret=ret+"E()"+this.bktUsing[0].idx; // smooth add node with non-char transition
   var tmpNod=this.aux_snew(this.bktUsing[0]);
   ret=ret+"L"+this.bktUsing[1].idx+","+tmpNod.idx; // link with non-char transition
   this.bktUsing[1].lk(tmpNod);
   break;
  case '\\': // special char
   // TODO
  default: // {...{...(p) => {...{....p.(c)
   this.bktUsing[0]=this.bktUsing[1];
   ret=ret+"e("+char+")"+this.bktUsing[1].idx; // smooth add node with non-char transition
   this.bktUsing[1]=this.aux_enew(this.bktUsing[1],char);
  }
  this.pos+=1;
  return ret;
 },

 step:function() { // try to step
  var ret="";
  if (this.pos<this.ptn.length) {
   ret=ret+this.steponce();
   return ret;
  } else if (this.pos==this.ptn.length) {
   this.aux_fin(this.bktUsing[1],true); // set final
   this.pos+=1;
   while (this.bktStack.length>0) { // clear all uncoupled brackets
    this.steponce(')');
   }
   this.bktStack=[];
   this.bktUsing=[];
   return ret+"F"; // end with 'F'
  }
 },

 run:function() { // keep stepping until end
  while (this.pos<=this.ptn.length) {
   this.step();
  }
  return this.dump();
 }
}
