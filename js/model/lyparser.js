/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** LYparser, Direct Parsing **/
/**  dependency: kernel/parse.js **/
/**  dependency: kernel/fa.js **/
/**  dependency: model/swmodel.js **/
/**  dependency: model/swfmswitch.js **/
Model.LYparser=function(pattern) {
 pattern=pattern||''; // for Chrome compatibility (only Firefox supports default parameter feature)
 this.title="LYparser";
 this.pattern=pattern;
 this.mode=Model.GRAPH.ENFA;
 this.ENFAbuilder=new nfae_maker(parser.parse(pattern));
 this.ENFAbuilder.run=function() {
  while (!this.is_end()) {
   this.iter();
  }
 }
 this.NFAbuilder=undefined; // in beginning, not available yet
 this.DFAbuilder=undefined; // in beginning, not available yet
};
Model.LYparser.prototype = {
 clean:function() {},

 snapshot:function(mode) { // return snapshot of current Graph
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 switch (mode.value) {
 case 0:
  return this.ENFAbuilder.get_snapshot()['fas'];
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
 highdump:function(mode,mark) { // return snapshot of current Graph
 mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
 mark=mark||false; // mark=true: add prefix tags to different graph nodes to avoid ID conflict
 switch (mode.value) {
 case 0:
  return this.ENFAbuilder.get_snapshot()['fas'];
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

 dumpgraph:function(mode) { // return graph
  mode=mode||this.mode; // for Chrome compatibility (only Firefox supports default parameter feature)
  return Model.dict2graph(this.snapshot(mode)[0]);
 },

 hightext:function() { // return text with highlighted positions
  return fmt_ast(this.ENFAbuilder.get_snapshot()['ast']);
 },

 ready:function() { // run until ready for the mode
  if (this.mode.value>=1) { // dependency
   this.ENFAbuilder.run();
   this.NFAbuilder=new nfa_maker(this.highdump(Model.GRAPH.ENFA)[0]);
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
  case 0: this.ENFAbuilder.iter();break;
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
  while (!this.is_end()) {this.step();}
  return this.snapshot();
 },

 refresh:function() { // update all
  this.clean();
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
