/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Transfer snapshot into nodes and links for drawing **/
/**  dependency: model/swmodel.js **/
/**  dependency: kernel/swnodes.js **/
/**  related js: kernel/fa.js **/

Model.nodes_links=function(snapshot) {
 var nodes=[];
 var links=[]; // warning: "source" and "target" are just index of array nodes. not the "id" in the dict
 var pos;
 var num=0;
 for (it0 in snapshot) { // may have many graphs, deal with nodes
  if (snapshot[it0].initial!=undefined) { // dict form
   for (it1 in snapshot[it0].states) {
    nodes.push({"id":it1,"entry":false,"final":false,"phase":snapshot[it0].states[it1].phase});
   }
  } else if (snapshot[it0].entry!=undefined) { // graph form
   for (it1 in snapshot[it0].nodes) {
    nodes.push({"id":it1,"entry":false,"final":false,"phase":snapshot[it0].nodes[it1].phase});
   }
  }
 }
 for (it0 in snapshot) { // may have many graphs, deal with links
  if (snapshot[it0].initial!=undefined) { // dict form
   for (it1 in snapshot[it0].states) {
    for (it2 in snapshot[it0].states[it1].transit) {
     for (it3 in snapshot[it0].states[it1].transit[it2]) {
      links.push({"id":it1+"t"+it3+"c"+it2,"source":indexOfkey(nodes,it1),"target":indexOfkey(nodes,it3),"char":it2,"phase":snapshot[it0].states[it1].transit[it2][it3]}); // warning: src and tgt are idx of nodes. not the "index" in the dict
     }
    }
   }
   pos=indexOfkey(nodes,snapshot[it0].initial);
   if (pos!=-1) {nodes[pos].entry=true;}
   for (it1 in snapshot[it0].accept) {
    pos=indexOfkey(nodes,snapshot[it0].accept[it1]);
    if (pos!=-1) {nodes[pos].final=true;}
   }
  } else if (snapshot[it0].entry!=undefined) { // graph form
   for (it1 in snapshot[it0].nodes) {
    for (it2 in snapshot[it0].nodes[it1].lkt) {
     links.push({"id":it1+"t"+snapshot[it0].nodes[it1].lkt[it2].node.idx+"c"+snapshot[it0].nodes[it1].lkt[it2].char,"source":indexOfkey(nodes,it1),"target":indexOfkey(nodes,snapshot[it0].nodes[it1].lkt[it2].node.idx),"char":snapshot[it0].nodes[it1].lkt[it2].char,"phase":snapshot[it0].nodes[it1].lkt[it2].phase}); // warning: src and tgt are idx of nodes. not the "index" in the dict
    }
   }
  }
 }
 return {"nodes":nodes,"links":links};
};

