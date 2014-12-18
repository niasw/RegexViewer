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
indexOf2idx = function(array,e){ // search for 3rd element's index coupling
 for(var i=0; i<array.length; i+=1){
  if(array[i][2]&&array[i][2].idx==e){return i;}
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
  *   bktStack: save ['{','o','}'], '{' indicates upper level bracket, '}' is only used for '|'
  *   bktUsing: save ['(','n',')'], current level bracket, used for '+'
  *   'o' and 'n' are temp nodes.
  */
 var tmpo=this.graph.entry.enew();
 var tmpn=tmpo.enew();
 this.graph.nodes[tmpo.idx]=tmpo;
 this.graph.nodes[tmpn.idx]=tmpn;
 this.bktStack = [[this.graph.entry,tmpo,undefined]]; // { ( "" )
 this.bktUsing = [tmpo,tmpn,tmpn];
}

ENFAbuilder.prototype = {
 clean:function() {
  if (this.graph) {for (it in this.graph.nodes) {
   SWNode.unregister(this.graph.nodes[it].idx);
  }}
  this.bktStack=[];this.bktUsing=[undefined,undefined,undefined];
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
   if (pos!=-1) {ret[num].marks.push('o');}
   pos=indexOf2idx(this.bktStack,this.graph.nodes[it].idx);
   if (pos!=-1) {ret[num].marks.push('}');}
   if (this.bktUsing[0]&&this.graph.nodes[it].idx==this.bktUsing[0].idx) {ret[num].marks.push('(');}
   if (this.bktUsing[1]&&this.graph.nodes[it].idx==this.bktUsing[1].idx) {ret[num].marks.push('n');}
   if (this.bktUsing[2]&&this.graph.nodes[it].idx==this.bktUsing[2].idx) {ret[num].marks.push(')');}
  }
  return ret;
 },

 dump:function() { // return graph of current ENFA
  var ret={};
  ret.entry=this.graph.entry;
  ret.nodes=this.graph.nodes;
  ret.final=this.graph.final;
  return ret; // block member editing of this.graph
 },

 aux_dealchar(char,ret) { // aux method to extrude node with character (only used in this.steponce)
  ret=ret+"e()"+this.bktUsing[2].idx+';'; // smooth add node with non-char transition
  var tmpNod=this.aux_enew(this.bktUsing[2]);
  this.bktUsing[0]=this.bktUsing[2];
  ret=ret+"e("+char+")"+tmpNod.idx+';'; // smooth add node with char transition
  this.bktUsing[2]=this.aux_enew(tmpNod,char);
  ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
  this.aux_sdel(this.bktUsing[1]);
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
   this.bktUsing[0]=this.aux_enew(this.bktUsing[2]);
   this.bktStack.push([this.bktUsing[2],this.bktUsing[0],undefined]);
   ret=ret+"e()"+this.bktUsing[0].idx+';'; // smooth add node with non-char transition
   this.bktUsing[2]=this.aux_enew(this.bktUsing[0]);
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.aux_sdel(this.bktUsing[1]);
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
   this.aux_sdel(this.bktUsing[1]);
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
    tmpBkt[2]=this.aux_enew(this.bktUsing[2]);
   }
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.aux_sdel(this.bktUsing[1]);
   this.bktUsing[0]=tmpBkt[1];
   ret=ret+"e()"+this.bktUsing[0].idx+';'; // smooth add node with non-char transition
   this.bktUsing[2]=this.bktUsing[1]=this.aux_enew(this.bktUsing[0]);
   this.bktStack.push(tmpBkt);
   break;
  case '+': // {o..{o..(np) => {o..{o..(np+)
   ret=ret+"E()"+this.bktUsing[1].idx+';'; // smooth add node with non-char transition
   var tmpNod=this.aux_snew(this.bktUsing[1]);
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
   var tmpNod=this.aux_snew(this.bktUsing[1]);
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
   this.aux_fin(this.bktUsing[2],true); // set final
   this.pos+=1;
   while (this.bktStack.length>0) { // clear all uncoupled brackets
    this.steponce(')');
   }
   ret=ret+"D"+this.bktUsing[1].idx+';'; // smooth remove temp node
   this.aux_sdel(this.bktUsing[1]);
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
  return this.dump();
 }
}
