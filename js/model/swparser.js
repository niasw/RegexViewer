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
    case '(': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case 'n': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case ')': tmp["phase"]=(tmp["phase"]==0)?1:(tmp["phase"]+1)/2;break;
    case '}': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
    case 'o': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
    case '{': tmp["phase"]=(tmp["phase"]==0)?2:(tmp["phase"]+2)/2;break;
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
  var icicle=this.snapshot()[0]; // only one graph can be dealed with
  var graph={'entry':undefined,'nodes':{},'final':[]};
  var mapping={};
  var tmp;
  for (it in icicle.states) { // carry nodes
   tmp=new SWNode().init();
   graph.nodes[tmp.idx]=tmp;
   mapping[it]=tmp.idx;
  }
  graph.entry=graph.nodes[mapping[icicle.initial]];
  for (it in icicle.accept) { // carry final
   graph.final.push(mapping[icicle.accept[it]]);
  }
  for (it in icicle.states) { // carry links
   for (it1 in icicle.states[it].transit) {
    for (it2 in icicle.states[it].transit[it1]) {
     graph.nodes[mapping[it]].lk(graph.nodes[mapping[it2]],(it1=="")?undefined:it1);
    }
   }
  }
  return graph;
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
   this.NFAbuilder=new nfa_maker(this.highdump(Model.GRAPH.ENFA)[0]); // share the same algorithm, no need for a copy
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
