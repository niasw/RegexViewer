/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Transfer snapshot between graph form (SW) and dict form (LY) **/
/**  dependency: model/swmodel.js **/
/**  related js: kernel/fa.js **/
/**  related js: kernel/swnodes.js **/

Model.graph2dict=function(graph,phaseOn) { // graph form is easier to extend new properties than dict form, but needs larger space and is not easy to print out.
 phaseOn=phaseOn||false;
 var ret={};
 ret["initial"]=graph.entry.idx;
 ret["accept"]=graph.final;
 ret["states"]={};
 var tmp,lkl; // node, link list
 for (it in graph.nodes) {
  tmp={"transit":{}};lkl=graph.nodes[it].lkt;if (phaseOn) {tmp["phase"]=(graph.nodes[it].phase)||0;}
  for (it2 in lkl) {
   if (lkl[it2]['char']) {
    if (!tmp["transit"][lkl[it2]['char']]) {tmp["transit"][lkl[it2]['char']]={};}
    tmp["transit"][lkl[it2]['char']][lkl[it2]['node'].idx]=(phaseOn&&lkl[it2]['phase'])?lkl[it2]['phase']:0; // set structure: replace 'true' with phase
   } else { // undefined => ""
    if (!tmp["transit"][""]) {tmp["transit"][""]={};}
    tmp["transit"][""][lkl[it2]['node'].idx]=(phaseOn&&lkl[it2]['phase'])?lkl[it2]['phase']:0; // set structure: replace 'true' with phase
   }
  }
  ret["states"][graph.nodes[it].idx]=tmp;
 }
 return ret;
};

Model.dict2graph=function(dict,phaseOn) { // dict form is smaller, and easier to print out, but harder to read and harder to extend
 phaseOn=phaseOn||false;
 var ret=new GWGraph().init();
 var map={};ret.del(ret.entry);
 var tmp;
 for (it in dict.states) { // transfer nodes
  tmp=ret.new();
  map[this.nodes[it].idx]=tmp.idx;
 }
 for (it in dict.states) { // transfer links
  for (it1 in dict.states[it].transit) {
   for (it2 in dict.states[it].transit[it1]) {
    tmp=ret.link(map[it],map[it2],(it1=="")?undefined:it1);
    if (phaseOn) {tmp['phase']=dict.states[it].transit[it1][it2];}
   }
  }
 }
 ret.entry=ret.nodes[map[dict.initial]]; // transfer entry
 for (it in dict.accept) { // transfer final
  ret.fin(map[dict.accept[it]],true);
 }
 return ret;
};

