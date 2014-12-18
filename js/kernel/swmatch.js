/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** matching content string parallelly **/
/**  dependency: ./swnodes.js **/
/**  dependency: ./swparse.js **/

var ENFAmatcher = function(graph, content, strategy) { // Matcher for ENFA is compatible for NFA and DFA, so once we accomplished ENFA Matcher, NFA and DFA Matchers are already here.
 content=content||""; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||{"start":"last","final":"first"}; // default: irreducible matches
 /*
  * graph network:
  *   entry = start state,
  *   nodes = states set Q (sub-list of Node.all)
  *   final = accept set F (sub-list of Node.allfin)
  *   active = active states
  */
 this.graph=graph;
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
     tmpindex=this.graph.nodes[it1].lkt[it3][0].idx;
     if (!this.graph.nodes[it1].lkt[it3][1]) { // non-char trans
      if (!this.graph.active[tmpindex]) {this.graph.active[tmpindex]={};}
      this.graph.active[tmpindex][this.pos]=true;
      if (this.graph.nodes[it1].lkt[it3].length<3) {this.graph.nodes[it1].lkt[it3].push(1);} // add phase as 3rd element
      else {this.graph.nodes[it1].lkt[it3][2]=1;}
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
      if (!this.graph.nodes[it1].lkt[it3][1]) {
       newact=this.aux_addact(this.graph.nodes[it1].lkt[it3][0].idx,it2,actList,strategy);
       if (this.graph.nodes[it1].lkt[it3].length<3) {this.graph.nodes[it1].lkt[it3].push(1);} // add phase as 3rd element
       else {this.graph.nodes[it1].lkt[it3][2]=1;}
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
  var ret=[]; // return
  var num=-1;
  for (it in this.graph.nodes) {
   ret.push({"index":this.graph.nodes[it].idx,"marks":[]});num+=1;
   if (this.graph.active[this.graph.nodes[it].idx]) {ret[num].marks=this.graph.active[this.graph.nodes[it].idx];}
  }
  return ret;
 },

 dump:function() { // return graph of current ENFA
  return this.graph;
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
   for (it in final) {
    if (active[final[it]]) {
     for (it1 in active[final[it]]) {
      ret.push(this.ctt.substr(it1,this.pos));
     }
    }
   }
   break;
  case 'last':
   for (it in final) {
    if (active[final[it]]) {
     for (it1 in this.graph.active[final[it]]) {
      if (!active[final[it]]||!active[final[it]][it1]) { // on exit
       ret.push(this.ctt.substr(it1,this.pos-1));
      }
     }
    }
   }
   break;
  case 'first':
   for (it in final) {
    if (this.graph.active[final[it]]) {
     for (it1 in active[final[it]]) {
      if (!this.graph.active[final[it]]||!this.graph.active[final[it]][it1]) { // on enter
       ret.push(this.ctt.substr(it1,this.pos));
      }
     }
    }
   }
   break;
  case 'strict':
   if (this.pos==this.ctt.length-1) { for (it in final) {
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
  char=char||this.ctt[this.pos]; // for Chrome compatibility (only Firefox supports default parameter feature)
  strategy=strategy||this.strategy; // for Chrome compatibility (only Firefox supports default parameter feature)
  var newact={}; // new active list
  var regex; // transition character
  for (it1 in this.graph.nodes) {
   for (it2 in this.graph.nodes[it1].lkt) {
    if (this.graph.nodes[it1].lkt[it2].length<3) {this.graph.nodes[it1].lkt[it2].push(0);} // reset phase
    else {this.graph.nodes[it1].lkt[it2][2]=0;}
   }
  }
  for (it1 in this.graph.active) {
   for (it2 in this.graph.active[it1]) {
    for (it3 in this.graph.nodes[it1].lkt) {
     if (!this.graph.nodes[it1].lkt[it3][1]) continue; // skip non-char transit
     regex=new RegExp(this.graph.nodes[it1].lkt[it3][1]);
     if (regex.test(char)) {
      newact=this.aux_addact(this.graph.nodes[it1].lkt[it3][0].idx,it2,newact,strategy);
      if (this.graph.nodes[it1].lkt[it3].length<3) {this.graph.nodes[it1].lkt[it3].push(1);} // add phase as 3rd element
      else {this.graph.nodes[it1].lkt[it3][2]=1;}
     }
    }
   }
  }
  if (strategy.start!='strict') {newact=this.aux_addact(this.graph.entry.idx,this.pos,newact,strategy);}
  this.aux_updateNonCharTrans(newact);
  this.matches=this.matches.concat(this.aux_checkmatch(this.graph.final,this.pos,newact,strategy)); // using this.graph.active as old active states list, so it should be put before this.graph.active=newact;
  this.graph.active=newact;
  this.pos+=1;
 },

 is_end:function() { // fully evolved or not
  if (this.strategy.start=='strict'&&this.pos>0&&Object.keys(this.graph.active).length==0) {return true;}
  return this.pos>=this.ctt.length;
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
