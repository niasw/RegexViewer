/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** LYmatcher, cascade search **/
/**  dependency: model/swmodel.js **/
/**  dependency: kernel/swfmswitch.js **/

Model.LYmatcher=function(graph,content,strategy,mode) {
 content=content||''; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||{"start":"strict","final":"strict"}; // default: strict matches
 mode=mode||'tom'; // tom for noBackTrace, bt for BackTrace. Liu Yu didnot write NFABackTraceMatcher & ENFAnoBackTraceMatcher ... That will be the problem.
 this.title="LYmatcher";
 this.content=content;
 this.mode=mode;
 if (graph.initial!=undefined) {this.graph=graph;}
 else if (graph.entry!=undefined) {this.graph=Model.graph2dict(graph);}
 else {console.log("ENFAmatcher init: invalid graph!");}
 this.ENFABackTraceMatcher=new bt_nfae_matcher(this.graph);
 this.ENFABackTraceMatcher.init(content);
 this.NFAnoBackTraceMatcher=new tom_nfa_matcher(this.graph);
 this.NFAnoBackTraceMatcher.init(content);
};
Model.LYmatcher.prototype = {
 reset:function() {this.ENFABackTraceMatcher.init(this.content);this.NFAnoBackTraceMatcher.init(this.content);},
 clean:function() {}, // there is a garbage collector in fa.js & utils.js
//TODO: currently only strict match supported

 snapshot:function() { // return snapshot of current Graph
  switch (this.mode) {
  case 'bt':
   return [this.ENFABackTraceMatcher.get_snapshot().nfae];
  case 'tom':
   return [this.NFAnoBackTraceMatcher.get_snapshot().nfa];
  }
 },
 highdump:function(mark) { // return snapshot with active ID
  switch (this.mode) {
  case 'bt':
   return [this.ENFABackTraceMatcher.get_snapshot().nfae];
  case 'tom':
   return [this.NFAnoBackTraceMatcher.get_snapshot().nfa];
  }
 },

 hightext:function() { // return text with highlighted positions
  switch (this.mode) {
  case 'bt':
   return [this.ENFABackTraceMatcher.get_snapshot().str];
  case 'tom':
   return [this.NFAnoBackTraceMatcher.get_snapshot().str];
  }
 },

 step:function() { // iter
  switch (this.mode) {
  case 'bt':
   this.ENFABackTraceMatcher.iter();
   break;
  case 'tom':
   this.NFAnoBackTraceMatcher.iter();
   break;
  }
 },

 is_end:function() { // fully evolved or not
  switch (this.mode) {
  case 'bt':
   return this.ENFABackTraceMatcher.is_end();
  case 'tom':
   return this.NFAnoBackTraceMatcher.is_end();
  }
 },

 run:function() { // keep stepping until end
  while (!this.is_end()) {this.step();}
  return this.snapshot();
 },

 result:function() { // return matched results
  switch (this.mode) {
  case 'bt':
   return this.ENFABackTraceMatcher.is_match();
  case 'tom':
   return this.NFAnoBackTraceMatcher.is_match();
  }
 },

 refresh:function() { // reset all
  this.reset();
 },

 setStrategy:function(strategy) { // set strategy
  this.strategy=strategy;
  this.reset();
 },

 setContent:function(content) { // new content
  if (this.content!=content) {this.content=content;this.reset();}
 },

 setMode:function(mode) { // new mode (bt | tom)
  if (this.mode!=mode) {this.mode=mode;this.reset();}
 }
};
