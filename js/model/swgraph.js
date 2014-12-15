/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Transfer snapshot into nodes and links for drawing **/
/**  dependency: model/swmodel.js **/
/**  related js: kernel/fa.js **/
indexOfid = function(array,e){ // search for index coupling
 for(var i=0; i<array.length; i+=1){
  if(array[i]&&array[i].id==e){return i;}
 }
 return -1;
}

Model.nodes_links=function(snapshot) {
 var nodes=[];
 var links=[]; // warning: "source" and "target" are just index of array nodes. not the "id" in the dict
 var pos;
 var num=0;
 for (it0 in snapshot) { // may have many graphs
  for (it1 in snapshot[it0].states) {
   nodes.push({"id":it1,"entry":false,"final":false,"phase":snapshot[it0].states[it1].phase});
  }
 }
 for (it0 in snapshot) { // may have many graphs
  for (it1 in snapshot[it0].states) {
   for (it2 in snapshot[it0].states[it1].transit) {
    for (it3 in snapshot[it0].states[it1].transit[it2]) {
     links.push({"source":indexOfid(nodes,it1),"target":indexOfid(nodes,it3),"char":it2,"phase":snapshot[it0].states[it1].transit[it2][it3]}); // warning: src and tgt are idx of nodes. not the "index" in the dict
    }
   }
  }
  pos=indexOfid(nodes,snapshot[it0].initial);
  if (pos!=-1) {nodes[pos].entry=true;}
  for (it1 in snapshot[it0].accept) {
   pos=indexOfid(nodes,snapshot[it0].accept[it1]);
   if (pos!=-1) {nodes[pos].final=true;}
  }
 }
 return {"nodes":nodes,"links":links};
};

