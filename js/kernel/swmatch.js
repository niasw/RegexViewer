/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** matching content string parallelly **/
/**  dependency: kernel/swgraph.js **/
/**  dependency: kernel/swfmswitch.js **/

// SWMatcher
var ENFAmatcher = function(graph, content, strategy) { // Matcher for ENFA is compatible for NFA and DFA, so once we accomplished ENFA Matcher, NFA and DFA Matchers are already here.
 content=content||""; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||{"start":"last","final":"first"}; // default: irreducible matches
 /*
  * graph network:
  *   entry = start state,
  *   nodes = states set Q (sub-list of Node.all)
  *   final = accept set F (sub-list of Node.allfin)
  *   active = active states (new!)
  */
 if (graph.entry!=undefined) {this.graph=graph;}
 else if (graph.initial!=undefined) {this.graph=Model.dict2graph(graph);}
 else {console.log("ENFAmatcher init: invalid graph!");}
 /*
  * ctt: content string
  * pos: position of char in content we are dealing with
  */
 this.ctt=content;
 this.pos=0;
 /*
  * active nodes: stimulated by transition process, nodes become active. if a final node is active, it matches.
  * active order: for non-strict start matching, entry node is stimulated on each character receiving step. in order to obtain the start position of the matching part, stimulations should be distinguishable by order. besides, when two stimulation collide, usually it means a substring of a matching string is also matching. There are four strategies: 
  *   0. 'strict' start: only order=0 happens. (identical to pattern begins with '^')
  *   1. 'first' stimuation predominated strategy: only keep the lesser order stimulation.
  *   2. 'last'  stimuation predominated strategy: only keep the larger order stimulation.
  *   3. keep 'all' strategy: keep all the orders. this returns results identical to cascade matching process.
  * Usually 1('first') and 2('last') are commonly used since we usually don't need redundant matches.
  * Strategy 'first' usually tells us the largest matches, which is usually used in text searching and replacing procedures.
  * Strategy 'last' usually tells us the irreducible matches, which is usually used in xml grasping and data retrieving.
  * Here is the start position part. Notice that the final position part should be related.
  */
 this.strategy=strategy;
 this.graph.active={};
 if (this.graph&&this.graph.entry) {
  this.graph.active[this.graph.entry.idx]={};
  this.graph.active[this.graph.entry.idx][this.pos]=true; // use dict as set
 }
 this.matches=[]; // matched string
 var actlen=-1,tmpindex;
 while (Object.keys(this.graph.active).length!=actlen) { // recursive check non-char transit update
  actlen=Object.keys(this.graph.active).length;
  for (it1 in this.graph.active) {
   for (it2 in this.graph.active[it1]) {
    for (it3 in this.graph.nodes[it1].lkt) {
     tmpindex=this.graph.nodes[it1].lkt[it3].node.idx;
     if (!this.graph.nodes[it1].lkt[it3].char) { // non-char trans
      if (!this.graph.active[tmpindex]) {this.graph.active[tmpindex]={};}
      this.graph.active[tmpindex][this.pos]=true;
      this.graph.nodes[it1].lkt[it3].phase=1;
     }
    }
   }
  }
 }
}

ENFAmatcher.prototype = {
 aux_addact(index,order,active,strategy) { // update active list, warning: modify active
  var tmp;
  switch (strategy.start) {
  case 'strict':
  case 'all':
   if (!active[index]) {active[index]={};}
   active[index][order]=true;
   break;
  case 'first':
   tmp={};
   if (!active[index]||active[index][Object.keys(active[index])[0]]>order) {tmp[order]=true;active[index]=tmp;}
   break;
  case 'last':
   tmp={};
   if (!active[index]||active[index][Object.keys(active[index])[0]]<order) {tmp[order]=true;active[index]=tmp;}
   break;
  default:
  }
  return active;
 },
 aux_updateNonCharTrans:function(actList,strategy) { // check NonCharTransit effect on active states
  strategy=strategy||this.strategy; // for Chrome compatibility (only Firefox supports default parameter feature)
  var actlen=-1;
  while (Object.keys(actList).length!=actlen) { // recursive check
   actlen=Object.keys(actList).length;
   for (it1 in actList) {
    for (it2 in actList[it1]) {
     for (it3 in this.graph.nodes[it1].lkt) {
      if (!this.graph.nodes[it1].lkt[it3].char) {
       newact=this.aux_addact(this.graph.nodes[it1].lkt[it3].node.idx,it2,actList,strategy);
       this.graph.nodes[it1].lkt[it3].phase=1;
      }
     }
    }
   }
  }
 },
 reset:function() { // clear all active states
  this.graph.active={};
  if (this.graph&&this.graph.entry) {
   this.graph.active[this.graph.entry.idx]=[this.pos];
  }
  this.matches=[];
  this.aux_updateNonCharTrans(this.graph.active);
 },
 clean:function() { // free all space
  if (this.graph&&this.graph.nodes) {
   for (it in this.graph.nodes) {SWNode.unregister(it);}
  }
 },

 high:function() { // return nodes with active order
  var ret={}; // return
  for (it in this.graph.active) {
   if (this.graph.active[it]) {ret[it]=this.graph.active[it];}
  }
  return ret;
 },

 aux_copy_active(graph,map) { // add active info which left when cloning, warning: modify graph
  graph['active']={};
  for (it in this.graph.active) { // nodes
   graph.active[map[it]]={};
   for (it1 in this.graph.active[it]) {
    graph.active[map[it]][it1]=this.graph.active[it][it1];
   }
  }
  for (it in this.graph.nodes) { // links
   for (it1 in this.graph.nodes[it].lkt) {
    graph.nodes[map[it]].lkt[it1].phase=this.graph.nodes[it].lkt[it1].phase;
   }
  }
  return {'graph':graph,'mapping':map};
 },
 dump:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  ret=this.graph.clone(true);
  SWNode.register=reglist; // restore
  ret=this.aux_copy_active(ret.graph,ret.mapping)
  return showMap?ret:ret.graph;
 },
 dumpsort:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  ret=this.graph.copy(true);
  SWNode.register=reglist; // restore
  ret=this.aux_copy_active(ret.graph,ret.mapping)
  return showMap?ret:ret.graph;
 },
 dumpauto:function(showMap) { // return graph of current ENFA
  showMap=showMap||false;
  var ret,reglist=SWNode.register; // backup
  SWNode.clearAll();
  if (this.is_end()) {
   ret=this.graph.copy(true);
  } else {
   ret=this.graph.clone(true);
  }
  SWNode.register=reglist; // restore
  ret=this.aux_copy_active(ret.graph,ret.mapping)
  return showMap?ret:ret.graph;
 },

 aux_checkmatch(final,order,active,strategy) { // check if there are any matches should be reported
  var ret=[];
  switch (strategy.final) {
 /* There are also 4 strategies for final check:
  *   0. 'strict' final: only check when the whole string was read over. (identical to pattern begins with '$')
  *   1. 'first' stimuation predominated strategy: return on any final state being activated.
  *   2. 'last'  stimuation predominated strategy: return on any final state fading.
  *   3. keep 'all' strategy: keep all the orders. this returns results identical to cascade matching process.
  * Same with start strategy, usually 1('first') and 2('last') are commonly used since we usually don't need redundant matches.
  * Strategy 'last' usually tells us the largest matches, which is usually used in text searching and replacing procedures.
  * Strategy 'first' usually tells us the irreducible matches, which is usually used in xml grasping and data retrieving.
  * Here is the final position part. Notice that the start position part should be related.
  */
  case 'all':
   if (this.pos<this.ctt.length) { for (it in final) {
    if (active[final[it]]) {
     for (it1 in active[final[it]]) {
      ret.push(this.ctt.substr(it1,this.pos+1));
     }
    }
   }}
   break;
  case 'last':
   for (it in final) {
    if (this.graph.active[final[it]]) {
     for (it1 in this.graph.active[final[it]]) {
      if (!active[final[it]]||!active[final[it]][it1]) { // on exit
       ret.push(this.ctt.substr(active[final[it]][it1],this.pos));
      }
//      if (this.pos>=this.ctt.length&&!active[final[it]]) {ret.push(this.ctt.substr(active[final[it]][it1],this.pos));}
     }
    }
   }
   break;
  case 'first':
   for (it in final) {
    if (active[final[it]]) {
     for (it1 in active[final[it]]) {
      if (!this.graph.active[final[it]]||!this.graph.active[final[it]][it1]) { // on enter
       ret.push(this.ctt.substr(this.graph.active[final[it]][it1],this.pos+1));
      }
     }
    }
   }
   break;
  case 'strict':
   if (this.pos==this.ctt.length) { for (it in final) {
    if (active[final[it]]) {
     for (it1 in active[final[it]]) {
      ret.push(this.ctt.substr(it1,this.pos));
     }
    }
   }}
   break;
  }
  return ret;
 },
 steponce:function(char,strategy) {
 strategy=strategy||this.strategy; // for Chrome compatibility (only Firefox supports default parameter feature)
 char=char||this.ctt[this.pos]; // for Chrome compatibility (only Firefox supports default parameter feature)
 var newact={}; // new active list
 var regex; // transition character
  for (it1 in this.graph.nodes) {
   for (it2 in this.graph.nodes[it1].lkt) {
    this.graph.nodes[it1].lkt[it2].phase=0;
   }
  }
  for (it1 in this.graph.active) {
   for (it2 in this.graph.active[it1]) {
    for (it3 in this.graph.nodes[it1].lkt) {
     if (!this.graph.nodes[it1].lkt[it3].char) continue; // skip non-char transit
     regex=new RegExp(this.graph.nodes[it1].lkt[it3].char);
     if (regex.test(char)) {
      newact=this.aux_addact(this.graph.nodes[it1].lkt[it3].node.idx,it2,newact,strategy);
      this.graph.nodes[it1].lkt[it3].phase=1;
     }
    }
   }
  }
  if (strategy.start!='strict') {newact=this.aux_addact(this.graph.entry.idx,this.pos,newact,strategy);}
  this.aux_updateNonCharTrans(newact);
  this.matches=this.matches.concat(this.aux_checkmatch(this.graph.final,this.pos,newact,strategy)); // using this.graph.active as old active states list, so it should be put before this.graph.active=newact;
  if (this.pos<this.ctt.length) this.graph.active=newact;
  this.pos+=1;
 },

 is_end:function() { // fully evolved or not
  if (this.strategy.start=='strict'&&this.pos>0&&Object.keys(this.graph.active).length==0) {return true;}
  return this.pos>this.ctt.length;
 },

 step:function() { // try to step
  if (!this.is_end()) {this.steponce();}
 },

 result:function() { // return matched results
  return this.matches;
 },

 run:function() { // keep stepping until end
  while (this.pos<this.ctt.length) {
   this.step();
  }
  return this.dump();
 }
}
