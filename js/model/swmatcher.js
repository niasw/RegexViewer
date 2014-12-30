/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** SWmatcher, parallel search **/
/**  dependency: kernel/swnodes.js **/
/**  dependency: kernel/swparse.js **/
/**  dependency: kernel/swmatch.js **/
/**  dependency: model/swmodel.js **/
Model.SWmatcher=function(graph,content,strategy) {
 content=content||''; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||{"start":"last","final":"first"}; // default: irreducible matches
 this.title="SWmatcher";
 this.content=content;
 this.ENFAmatcher=new ENFAmatcher(graph,content,strategy);
};
Model.SWmatcher.prototype = {
 reset:function() {this.ENFAmatcher.reset();},
 clean:function() {this.ENFAmatcher.clean();},

 snapshot:function(mark) { // return snapshot of current Graph
  mark=mark||false;
  var ret=mark?this.ENFAmatcher.dumpsort(true):this.ENFAmatcher.dump(true); // mark:sort ID, true:show mapping
  var map=ret.mapping;
  ret=ret.graph; // already have edge phase
  return [Model.graph2dict(ret,false)]; // phase on
 },

 highdump:function(mark) { // return snapshot with active ID
  mark=mark||false;
  var ret=mark?this.ENFAmatcher.dumpsort(true):this.ENFAmatcher.dump(true); // mark:sort ID, true:show mapping
  var map=ret.mapping;
  ret=ret.graph; // already have edge phase
  var hgh=this.ENFAmatcher.high(); // highlight
  var tmp; // node, link list
  for (it in ret.nodes) {
   tmp=ret.nodes[it];tmp["phase"]=hgh[it]?((ret.final.indexOf(it)!=-1)?2:1):0;
  }
  return [Model.graph2dict(ret,true)]; // phase on
 },

 hightext:function() { // return text with highlighted positions
  var ret=[];
  var pos=this.ENFAmatcher.pos;
  var ctt=this.ENFAmatcher.ctt;
  if (pos>0&&ctt.length>0) {ret.push({"txt":ctt.substr(0,pos),"phase":0});}
  if (ctt.length>0) {ret.push({"txt":ctt[pos],"phase":1});}
  if (ctt.length>0&&pos<ctt.length-1) {ret.push({"txt":ctt.substr(pos+1),"phase":0});}
  return ret;
 },

 step:function() { // iter
  return this.ENFAmatcher.step();
 },

 is_end:function() { // fully evolved or not
  return this.ENFAmatcher.is_end();
 },

 run:function() { // keep stepping until end
  this.ENFAmatcher.run();
  return this.snapshot();
 },

 result:function() { // return matched results
  return this.ENFAmatcher.result();
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
 }
};
