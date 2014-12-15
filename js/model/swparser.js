/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** SWparser, Direct Parsing **/
/**  dependency: kernel/swnodes.js **/
/**  dependency: kernel/swparse.js **/
/**  dependency: kernel/fa.js **/
/**  dependency: model/swmodel.js **/
Model.SWparser=function(pattern) {
 pattern=pattern||''; // for Chrome compatibility (only Firefox supports default parameter feature)
 this.title="SWparser";
 this.pattern=pattern;
 this.mode=Model.GRAPH.ENFA;
 this.ENFAbuilder=new ENFAbuilder(pattern);
 this.NFAbuilder=undefined; // in beginning, not available yet
 this.DFAbuilder=undefined; // in beginning, not available yet
};
Model.SWparser.prototype = {
 clean:function() {this.ENFAbuilder.clean();}, // release unused space

 snapshot:function(mode) { // return snapshot of current Graph
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 switch (mode.value) {
 case 0:
  var ret={};
  ret["initial"]=this.ENFAbuilder.graph.entry.idx;
  ret["accept"]=this.ENFAbuilder.graph.final;
  ret["states"]={};
  var nodes=this.ENFAbuilder.graph.nodes;
  var tmp,lkl; // node, link list
  for (it in nodes) {
   tmp={"transit":{}};lkl=nodes[it].lkt;
   for (it2 in lkl) {
    if (lkl[it2][1]) {
     if (!tmp["transit"][lkl[it2][1]]) {tmp["transit"][lkl[it2][1]]={};}
     tmp["transit"][lkl[it2][1]][lkl[it2][0].idx]=0; // set structure: replace 'true' with '0'
    } else { // undefined => ""
     if (!tmp["transit"][""]) {tmp["transit"][""]={};}
     tmp["transit"][""][lkl[it2][0].idx]=0; // set structure: replace 'true' with '0'
    }
   }
   ret["states"][nodes[it].idx]=tmp;
  }
  return [ret];
 case 1:
  return this.NFAbuilder.get_snapshot();
 case 2:
  return this.DFAbuilder.get_snapshot();
 default:
 }},

 highdump:function(mode) { // return snapshot with bracket info highlighted
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 switch (mode.value) {
 case 0:
  var ret={};
  var hgh=this.ENFAbuilder.high(); // highlight
  ret["initial"]=this.ENFAbuilder.graph.entry.idx;
  ret["accept"]=this.ENFAbuilder.graph.final;
  ret["states"]={};
  var nodes=this.ENFAbuilder.graph.nodes;
  var tmp,lkl; // node, link list
  var num=-1;
  for (it in nodes) {
   num+=1;
   tmp={"transit":{},"phase":0};lkl=nodes[it].lkt;
   for (it1 in hgh[num]["marks"]) {
    switch (hgh[num]["marks"][it1]) {
    case '(': tmp["phase"]+=1;break;
    case ')': tmp["phase"]+=2;break;
    case '}': tmp["phase"]+=4;break;
    case '{': tmp["phase"]+=8;break;
    default:
    }
   }
   for (it2 in lkl) {
    if (lkl[it2][1]) {
     if (!tmp["transit"][lkl[it2][1]]) {tmp["transit"][lkl[it2][1]]={};}
     tmp["transit"][lkl[it2][1]][lkl[it2][0].idx]=0; // in my builder, edges should be highlighted with animation rather than colors
    } else { // undefined => ""
     if (!tmp["transit"][""]) {tmp["transit"][""]={};}
     tmp["transit"][""][lkl[it2][0].idx]=0;
    }
   }
   ret["states"][nodes[it].idx]=tmp;
  }
  return [ret];
 case 1:
  return this.NFAbuilder.get_snapshot();
 case 2:
  return this.DFAbuilder.get_snapshot();
 default:
 }},

 hightext:function() { // return text with highlighted positions
  var ret=[];
  var pos=this.ENFAbuilder.pos;
  var ptn=this.ENFAbuilder.ptn;
  if (pos>0&&ptn.length>0) {ret.push({"txt":ptn.substr(0,pos),"phase":0});}
  if (ptn.length>0) {ret.push({"txt":ptn[pos],"phase":1});}
  if (ptn.length>0&&pos<ptn.length-1) {ret.push({"txt":ptn.substr(pos+1),"phase":0});}
  return ret;
 },

 ready:function() { // run until ready for the mode
  if (this.mode.value>=1) { // dependency
   this.ENFAbuilder.run();
   this.NFAbuilder=new nfa_maker(this.snapshot(Model.GRAPH.ENFA)); // share the same algorithm, no need for a copy
   this.NFAbuilder.run=function() {
    while (!this.NFAbuilder.is_end()) {
     this.NFAbuilder.iter();
    }
   }
  }
  if (this.mode.value>=2) { // dependency
   this.NFAbuilder.run();
   this.DFAbuilder=new dfa_maker(this.snapshot(Model.GRAPH.NFA)); // share the same algorithm, no need for a copy
   this.DFAbuilder.run=function() {
    while (!this.DFAbuilder.is_end()) {
     this.DFAbuilder.iter();
    }
   }
  }
 },

 step:function() { // no null-ptr protection here. "try {step()} catch() {ready()}" please.
  switch (this.mode.value) {
  case 0: return this.ENFAbuilder.step();break;
  case 1: return this.NFAbuilder.iter();break;
  case 2: return this.DFAbuilder.iter();break;
  default:
  }
 },

 refresh:function() { // update all
  this.ENFAbuilder=new ENFAbuilder(this.pattern);
  this.NFAbuilder=undefined;
  this.DFAbuilder=undefined;
  this.ready();
 },

 setMode:function(mode) { // set graph type
  this.mode=mode;
  this.ready();
 },

 setPattern:function(pattern) { // new pattern
  if (this.pattern!=pattern) {this.pattern=pattern;this.refresh();}
 }
};
