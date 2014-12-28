/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** SWparser, Direct Parsing **/
/**  dependency: kernel/swparse.js (for ENFA) **/
/**  dependency: kernel/fa.js (for NFA,DFA) **/
/**  dependency: model/swfmswitch.js **/
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
  return [Model.graph2dict(this.ENFAbuilder.graph)];
 case 1:
  if (!this.NFAbuilder) {this.ready();}
  var tmp=this.NFAbuilder.get_snapshot();
  return [tmp.nfa];
 case 2:
  if (!this.DFAbuilder) {this.ready();}
  var tmp=this.DFAbuilder.get_snapshot();
  return [tmp.dfa];
 default:
 }},

 aux_addPrefix:function(graph,char) { // modify id tags to avoid ID conflict
  var ret={};
  ret.initial=char+graph.initial;
  ret.accept=[];
  for (it in graph.accept) {ret.accept.push(char+graph.accept[it]);}
  ret.states={};
  var tmpnode,tmpchar;
  for (it1 in graph.states) {
   tmpnode={'phase':graph.states[it1].phase,'transit':{}};
   for (it2 in graph.states[it1].transit) {
    tmpchar={};
    for (it3 in graph.states[it1].transit[it2]) {
     tmpchar[char+it3]=graph.states[it1].transit[it2][it3];
    }
    tmpnode.transit[it2]=tmpchar;
   }
   ret.states[char+it1]=tmpnode;
  }
  return ret;
 },
 highdump:function(mode,mark) { // return snapshot with bracket info highlighted
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 mark=mark||false; // mark=true: add prefix tags to different graph nodes to avoid ID conflict
 switch (mode.value) {
 case 0:
  var ret=mark?this.ENFAbuilder.dumpsort(true):this.ENFAbuilder.dump(true); // mark:sort ID, true:show mapping
  var map=ret.mapping;
  ret=ret.graph;
  var hgh=this.ENFAbuilder.high(); // highlight
  var tmp,lkl; // node, link list
  for (it in ret.nodes) {
   tmp=ret.nodes[it];tmp["phase"]=0;
   for (it1 in hgh[it]) {
    switch (hgh[it][it1]) {
    case '(': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case 'n': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case ')': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case '}': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
    case 'o': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
    case '{': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
    default:
    }
   }
  }
  return [Model.graph2dict(ret,true)]; // phase on
 case 1:
  if (!this.NFAbuilder) {this.ready();}
  var tmp=this.NFAbuilder.get_snapshot();
  if (this.NFAbuilder.is_end()) {return [mark ? this.aux_addPrefix(tmp.nfa,'N') : tmp.nfa];}
  else {return [mark ? this.aux_addPrefix(tmp.nfa,'N') : tmp.nfa, tmp.nfae];}
 case 2:
  if (!this.DFAbuilder) {this.ready();}
  var tmp=this.DFAbuilder.get_snapshot();
  if (this.DFAbuilder.is_end()) {return [mark ? this.aux_addPrefix(tmp.dfa,'D') : tmp.dfa];}
  else {return [mark ? this.aux_addPrefix(tmp.dfa,'D') : tmp.dfa, mark ? this.aux_addPrefix(tmp.nfa,'N') : tmp.nfa];}
 default:
 }},

 dumpgraph:function(mode) { // return graph, warning: ID will be re-allocated.
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 switch (mode.value) {
 case 0:
  return this.ENFAbuilder?this.ENFAbuilder.dump():undefined;
 case 1:
 case 2:
  return Model.dict2graph(this.snapshot()[0]); // only one graph can be dealed with
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
   this.NFAbuilder=new nfa_maker(this.highdump(Model.GRAPH.ENFA,true)[0]); // NFA: share the same algorithm, no need for a copy, true:sort ID
   this.NFAbuilder.run=function() {
    while (!this.is_end()) {
     this.iter();
    }
   }
  }
  if (this.mode.value>=2) { // dependency
   this.NFAbuilder.run();
   this.DFAbuilder=new dfa_maker(this.highdump(Model.GRAPH.NFA)[0]);
   this.DFAbuilder.run=function() {
    while (!this.is_end()) {
     this.iter();
    }
   }
  }
 },

 step:function() { // no null-ptr protection here. "try {step()} catch() {ready()}" please.
  switch (this.mode.value) {
  case 0: return this.ENFAbuilder.step();break;
  case 1: this.NFAbuilder.iter();break;
  case 2: this.DFAbuilder.iter();break;
  default:
  }
 },

 is_end:function() { // fully evolved or not
  switch (this.mode.value) {
  case 0: return this.ENFAbuilder.is_end();break;
  case 1: return this.NFAbuilder.is_end();break;
  case 2: return this.DFAbuilder.is_end();break;
  default:
  }
 },

 run:function() { // keep stepping until end
  if (this.mode.value==0) {this.ENFAbuilder.run();} // faster
  else {while (!this.is_end()) {this.step();}}
  return this.snapshot();
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
