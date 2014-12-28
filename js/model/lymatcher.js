/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/
////////////////////////TODO
/** LYmatcher, cascade search **/
/**  dependency: kernel/swnodes.js **/
/**  dependency: kernel/swparse.js **/
/**  dependency: kernel/swmatch.js **/
/**  dependency: model/swmodel.js **/
/*
Model.LYmatcher=function(graph,content,strategy) {
 content=content||''; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||{"start":"last","final":"first"}; // default: irreducible matches
 this.title="SWmatcher";
 this.content=content;
 this.ENFAmatcher=new ENFAmatcher(graph,content,strategy);
};
Model.SWmatcher.prototype = {
 reset:function() {this.ENFAmatcher.reset();},
 clean:function() {this.ENFAmatcher.clean();},

 snapshot:function() { // return snapshot of current Graph
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
 },

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
 highdump:function() { // return snapshot with bracket info highlighted
  var ret={};
  var dmp=this.ENFAmatcher.dump(); // highlight
  ret["initial"]=dmp.entry.idx;
  ret["accept"]=dmp.final;
  ret["states"]={};
  var nodes=dmp.nodes;
  var tmp,lkl; // node, link list
  var num; // edge phase
  for (it in nodes) {
   tmp={"transit":{},"phase":0};lkl=nodes[it].lkt;
   tmp.phase=dmp.active[it]?((dmp.final.indexOf(it)!=-1)?2:1):0;
   for (it2 in lkl) {
    num=(lkl[it2].length>=3)?lkl[it2][2]:0; // 0 for undefined
    if (lkl[it2][1]) {
     if (!tmp["transit"][lkl[it2][1]]) {tmp["transit"][lkl[it2][1]]={};}
     tmp["transit"][lkl[it2][1]][lkl[it2][0].idx]=num; // in my builder, edges should be highlighted with animation rather than colors
    } else { // undefined => ""
     if (!tmp["transit"][""]) {tmp["transit"][""]={};}
     tmp["transit"][""][lkl[it2][0].idx]=num;
    }
   }
   ret["states"][nodes[it].idx]=tmp;
  }
  return [ret];
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
};*/
