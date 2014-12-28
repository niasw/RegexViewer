/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** parsing regex without grammar analysis **/
/**  dependency: kernel/swgraph.js **/
/**  dependency: kernel/swnodes.js (dump) **/

//var reg2ptn = function(regex) { // transfer modern regex into minimal regex
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
 //return regex.replace(/\./g,"\\.");
//}

// SWParser
var ENFAbuilder = function(pattern) { // Nondeterminal Finite Automaton with none-char transition
 pattern=pattern||""; // for Chrome compatibility (only Firefox supports default parameter feature)
/*
 * graph network:
 *   entry = start state,
 *   nodes = states set Q (sub-list of SWNode.all)
 *   final = accept set F (sub-list of SWNode.allfin)
 */
 this.graph = new SWGraph().init();
 /*
  * ptn: pattern string
  * pos: position of char in pattern we are dealing with
  */
 this.ptn = pattern;
 this.pos = 0;
 /*
  * aux bracket system
  *   bktStack: save ['{','o','}'], '{' indicates upper level bracket, '}' is only used for '|'
  *   bktUsing: save ['(','n',')'], current level bracket, used for '+'
  *   'o' and 'n' are temp nodes.
  */
 var tmpo=this.graph.enew(this.graph.entry);
 var tmpn=this.graph.enew(tmpo);
 this.bktStack = [[this.graph.entry,tmpo,undefined]]; // { ( "" )
 this.bktUsing = [tmpo,tmpn,tmpn];
}

ENFAbuilder.prototype = {
 clean:function() { // reuse label
  if (this.graph) {this.graph.unregister();}
  this.bktStack=[];this.bktUsing=[undefined,undefined,undefined];
  delete this.graph;
  this.graph=undefined;
 },

 high:function() { // return nodes with bracket info highlighted {idx:marks}
  var ret={}; // return
  var pos;
  for (it in this.graph.nodes) {
   ret[it]=[];
   pos=indexOfcomp(this.bktStack,this.graph.nodes[it].idx);
   if (pos!=-1) {ret[it].push('{');}
   pos=indexOfcomp(this.bktStack,this.graph.nodes[it].idx,undefined,1);
   if (pos!=-1) {ret[it].push('o');}
   pos=indexOfcomp(this.bktStack,this.graph.nodes[it].idx,undefined,2);
   if (pos!=-1) {ret[it].push('}');}
   if (this.bktUsing[0]&&this.graph.nodes[it].idx==this.bktUsing[0].idx) {ret[it].push('(');}
   if (this.bktUsing[1]&&this.graph.nodes[it].idx==this.bktUsing[1].idx) {ret[it].push('n');}
   if (this.bktUsing[2]&&this.graph.nodes[it].idx==this.bktUsing[2].idx) {ret[it].push(')');}
  }
  return ret;
 },

 dump:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  ret=this.graph.clone(showMap);
  SWNode.register=reglist; // restore
  return ret;
 },
 dumpsort:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  ret=this.graph.copy(showMap);
  SWNode.register=reglist; // restore
  return ret;
 },
 dumpauto:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  if (this.is_end()) {
   ret=this.graph.copy(showMap);
  } else {
   ret=this.graph.clone(showMap);
  }
  SWNode.register=reglist; // restore
  return ret;
 },

 aux_dealchar(char,ret) { // aux method to extrude node with character (only used in this.steponce)
  ret=ret+"e()"+this.bktUsing[2].idx+';'; // smooth add node with non-char transition
  var tmpNod=this.graph.enew(this.bktUsing[2]);
  this.bktUsing[0]=this.bktUsing[2];
  ret=ret+"e("+char+")"+tmpNod.idx+';'; // smooth add node with char transition
  this.bktUsing[2]=this.graph.enew(tmpNod,char);
  ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
  this.graph.sdel(this.bktUsing[1]);
  this.bktUsing[1]=tmpNod;
  return ret;
 },
 steponce:function(char) { // return variation
  char=char||this.ptn[this.pos]; // for Chrome compatibility (only Firefox supports default parameter feature)
  var ret=""; // return graph variation
  switch (char) {
  /* minimal operations */
  case '(': // {o..{o..(np) => {o..{o...p{o(n)
   ret=ret+"e()"+this.bktUsing[2].idx+';'; // smooth add node with non-char transition
   this.bktUsing[0]=this.graph.enew(this.bktUsing[2]);
   this.bktStack.push([this.bktUsing[2],this.bktUsing[0],undefined]);
   ret=ret+"e()"+this.bktUsing[0].idx+';'; // smooth add node with non-char transition
   this.bktUsing[2]=this.graph.enew(this.bktUsing[0]);
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.graph.sdel(this.bktUsing[1]);
   this.bktUsing[1]=this.bktUsing[2];
   break;
  case ')': // {o..{o..(np) => {o..(n...p)
   var tmpBkt=this.bktStack.pop();
   if (!tmpBkt) {ret="Pattern Error: uncoupled ')'.";return ret;}
   if (tmpBkt[2]) {
    ret=ret+"L()"+this.bktUsing[2].idx+","+tmpBkt[2].idx+';'; // link with non-char transition
    this.bktUsing[2].lk(tmpBkt[2]);
    this.bktUsing[2]=tmpBkt[2];
   }
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.graph.sdel(this.bktUsing[1]);
   this.bktUsing[0]=tmpBkt[0];
   this.bktUsing[1]=tmpBkt[1];
   break;
  case '|': // {o..{o..(np) => {o..{o...p|(n)
   var tmpBkt=this.bktStack.pop();
   if (!tmpBkt) {ret="Pattern Error: uncoupled ')'.";return ret;}
   if (tmpBkt[2]) {
    ret=ret+"L"+this.bktUsing[2].idx+","+tmpBkt[2].idx+';'; // link with non-char transition
    this.bktUsing[2].lk(tmpBkt[2]);
   } else {
    ret=ret+"e()"+this.bktUsing[2].idx+';'; // extrude with non-char transition
    tmpBkt[2]=this.graph.enew(this.bktUsing[2]);
   }
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.graph.sdel(this.bktUsing[1]);
   this.bktUsing[0]=tmpBkt[1];
   ret=ret+"e()"+this.bktUsing[0].idx+';'; // smooth add node with non-char transition
   this.bktUsing[2]=this.bktUsing[1]=this.graph.enew(this.bktUsing[0]);
   this.bktStack.push(tmpBkt);
   break;
  case '+': // {o..{o..(np) => {o..{o..(np+)
   ret=ret+"E()"+this.bktUsing[1].idx+';'; // smooth add node with non-char transition
   var tmpNod=this.graph.snew(this.bktUsing[1]);
   ret=ret+"L"+this.bktUsing[2].idx+","+tmpNod.idx+';'; // link with non-char transition
   this.bktUsing[2].lk(tmpNod);
   break;
  /* extend operations */
  case '?': // {o..{o..(np) => {o..{o..(np|)
   ret=ret+"L"+this.bktUsing[1].idx+","+this.bktUsing[2].idx+';'; // link with non-char transition
   this.bktUsing[1].lk(this.bktUsing[2]);
   break;
  case '*': // {...{...(p) => {...{...(p|)+
   ret=ret+"E()"+this.bktUsing[1].idx+';'; // smooth add node with non-char transition
   var tmpNod=this.graph.snew(this.bktUsing[1]);
   ret=ret+"L"+this.bktUsing[2].idx+","+tmpNod.idx+';'; // link with non-char transition
   this.bktUsing[2].lk(tmpNod);
   ret=ret+"L"+tmpNod.idx+","+this.bktUsing[2].idx+';'; // link with non-char transition
   tmpNod.lk(this.bktUsing[2]);
   break;
  case ' ': // show space
   char='[ ]';
   ret=this.aux_dealchar(char,ret);
   break;
  case '\\': // special char
   this.pos+=1;
   char=char+this.ptn[this.pos];
   ret=this.aux_dealchar(char,ret);
   break;
  case '[': // character set
   this.pos+=1;
   while (this.ptn[this.pos]!=']') {
    char=char+this.ptn[this.pos];
    this.pos+=1;
    if (this.pos>=this.ptn.length) {ret="Pattern Error: uncoupled '['.";return ret;}
   }
   char=char+this.ptn[this.pos];
   ret=this.aux_dealchar(char,ret);
   break;
  /* word character */
  default: // {o..{o..(np) => {o..{o...p(nc)
   ret=this.aux_dealchar(char,ret);
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
   this.graph.fin(this.bktUsing[2],true); // set final
   this.pos+=1;
   while (this.bktStack.length>0) { // clear all uncoupled brackets
    this.steponce(')');
   }
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.graph.sdel(this.bktUsing[1]);
   this.bktStack=[];
   this.bktUsing=[];
   return ret+"F"; // end with 'F'
  }
 },

 is_end:function() { // fully evolved or not
  return this.pos>this.ptn.length;
 },

 run:function() { // keep stepping until end
  while (this.pos<=this.ptn.length) {
   this.step();
  }
 }
}
