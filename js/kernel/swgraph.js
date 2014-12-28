/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Finite Automaton (SWGraph is made of SWnodes) **/
/**  dependency: kernel/swnodes.js **/

// class SWGraph
/*
 * graph network:
 *   entry = start state,
 *   nodes = states set Q (sub-list of SWNode.all)
 *   final = accept set F (sub-list of SWNode.allfin)
 */
var SWGraph = function() {} // pre-declaration of SWGraph class

SWGraph.clearAll=function() { // reset label (warning: if any graph exists in use, they will fail to work.)
 SWNode.clearAll={};
}
SWGraph.unregister=function(graph) { // remove 1 SWGraph
 if (!graph||!graph.nodes) {return ('Error: invalid graph when unregistering.\n graph = '+graph);}
 for (it in graph.nodes) {
  if (graph.nodes[it]&&(graph.nodes[it].idx||graph.nodes[it].idx==0)) {SWNode.unregister(graph.nodes[it].idx);}
 }
}

SWGraph.prototype = {
 unregister:function() { // call if this graph is no more needed
  SWGraph.unregister(this);
 },

 init:function() { // initial as an independent node
  this.entry=new SWNode().new(); // entrance state
  this.final=[]; // acceptive states
  this.nodes={};
  this.nodes[this.entry.idx]=this.entry;
  return this;
 },

 sdel:function(node) { // smooth remove node
  if (!node.idx&&node.idx!=0) {node=this.nodes[node];} // for input compatibility (idx & obj)
  node.sdel();node.unregister();delete this.nodes[node.idx];
 },
 del:function(node) { // remove node and break chain
  if (!node.idx&&node.idx!=0) {node=this.nodes[node];} // for input compatibility (idx & obj)
  node.del();node.unregister();delete this.nodes[node.idx];
 },
 new:function() { // add node into register list
  var ret=new SWNode().new();
  this.nodes[ret.idx]=ret;
  return ret;
 },
 spnew:function(id) { // add given node into register list
  var ret=new SWNode().spnew(id);
  this.nodes[ret.idx]=ret;
  return ret;
 },
 enew:function(node,char) { // extrude node
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  if (!node.idx&&node.idx!=0) {node=this.nodes[node];} // for input compatibility (idx & obj)
  var ret=node.enew(char);
  this.nodes[ret.idx]=ret;
  return ret;
 },
 snew:function(node,char) { // smooth add node
  char=char||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  if (!node.idx&&node.idx!=0) {node=this.nodes[node];} // for input compatibility (idx & obj)
  var ret=node.snew(char);
  this.nodes[ret.idx]=ret;
  return ret;
 },
 fin:function(node,isfinal) { // add node into final register list
  if (!node.idx&&node.idx!=0) {node=this.nodes[node];} // for input compatibility (idx & obj)
  if (node.fin!=isfinal) {
   node.setFinal(isfinal);
   if (isfinal) {
    this.final.push(node.idx);
   } else {
    var pos=this.final.indexOf(node.idx);
    if (pos>-1) {this.final.splice(pos,1);}
   }
  }
 },
 link:function(src,tgt,chr) { // link (source SWNode.idx, target SWNode.idx, character) character=undefined for non-operation transition
  chr=chr||undefined; // for Chrome compatibility (only Firefox supports default parameter feature)
  if (!src.idx&&src.idx!=0) {src=this.nodes[src];}
  if (!tgt.idx&&tgt.idx!=0) {tgt=this.nodes[tgt];}
  return src.lk(tgt,chr);
 },

 clone:function(showMap) { // make a clone of this graph
  showMap=showMap||false;
  var ret=new SWGraph().init();
  var map={};ret.del(ret.entry);
  var tmp;
  for (it in this.nodes) { // transfer nodes
   tmp=ret.spnew(it);
   map[this.nodes[it].idx]=tmp.idx;
  }
  for (it in this.nodes) { // transfer links
   for (it1 in this.nodes[it].lkt) {
    ret.link(map[this.nodes[it].idx],map[this.nodes[it].lkt[it1].node.idx],this.nodes[it].lkt[it1].char);
   }
  }
  ret.entry=ret.nodes[map[this.entry.idx]]; // transfer entry
  for (it in this.final) { // transfer final
   ret.fin(map[this.final[it]],true);
  }
  if (showMap) {return {'graph':ret,'mapping':map};}
  else {return ret;}
 },
 copy:function(showMap) { // make a clone of this graph, but different labels
  showMap=showMap||false;
  var ret=new SWGraph().init();
  var map={};ret.del(ret.entry);
  var tmp;
  for (it in this.nodes) { // transfer nodes
   tmp=ret.new();
   map[this.nodes[it].idx]=tmp.idx;
  }
  for (it in this.nodes) { // transfer links
   for (it1 in this.nodes[it].lkt) {
    ret.link(map[this.nodes[it].idx],map[this.nodes[it].lkt[it1].node.idx],this.nodes[it].lkt[it1].char);
   }
  }
  ret.entry=ret.nodes[map[this.entry.idx]]; // transfer entry
  for (it in this.final) { // transfer final
   ret.fin(map[this.final[it]],true);
  }
  if (showMap) {return {'graph':ret,'mapping':map};}
  else {return ret;}
 },
 rebuild:function() { // usage: g=g.rebuild(); to rebuild this graph, may make labels continuous
  this.unregister();
  return this.copy();
 }
}
