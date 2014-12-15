/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** LYparser, Direct Parsing **/
/**  dependency: kernel/parse.js **/
/**  dependency: kernel/fa.js **/
/**  dependency: model/swmodel.js **/
Model.LYparser=function(pattern='') {
 this.title="LYparser";
 this.pattern=pattern;
 this.mode=Model.GRAPH.ENFA;
 this.ENFAbuilder=new nfae_maker(parser.parse(pattern));
 this.ENFAbuilder.run=function() {
  while (!this.ENFAbuilder.is_end()) {
   this.ENFAbuilder.iter();
  }
 }
 this.NFAbuilder=undefined; // in beginning, not available yet
 this.DFAbuilder=undefined; // in beginning, not available yet
};
Model.LYparser.prototype = {
 bye:function() {},

 snapshot:function(mode=this.mode) { // return snapshot of current Graph
 switch (mode.value) {
 case 0:
  return this.ENFAbuilder.get_snapshot()['fas'];
 case 1:
  return this.NFAbuilder.get_snapshot();
 case 2:
  return this.DFAbuilder.get_snapshot();
 default:
 }},

 highdump:function(mode=this.mode) { // return snapshot of current Graph
 switch (mode.value) {
 case 0:
  return this.ENFAbuilder.get_snapshot()['fas'];
 case 1:
  return this.NFAbuilder.get_snapshot();
 case 2:
  return this.DFAbuilder.get_snapshot();
 default:
 }},

 hightext:function() { // return text with highlighted positions
  return fmt_ast(this.ENFAbuilder.get_snapshot()['ast']);
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
  case 0: this.ENFAbuilder.iter();break;
  case 1: this.NFAbuilder.iter();break;
  case 2: this.DFAbuilder.iter();break;
  default:
  }
 },

 refresh:function() { // update all
  this.bye();
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
