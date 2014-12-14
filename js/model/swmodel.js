/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** make all engines compatible **/
var Model={}
Model.GRAPH={
 ENFA:{"value":0,"title":'ENFA',"depend":[]},
 NFA:{"value":1,"title":'NFA',"depend":[]},
 DFA:{"value":2,"title":'DFA',"depend":[]}
};
Model.GRAPH.NFA["depend"]=[Model.GRAPH.ENFA];
Model.GRAPH.DFA["depend"]=[Model.GRAPH.NFA];
