/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Form Inputs **/
/**  dependency: index.html(DOM) **/
/**  dependency: model/swmodel.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
var Context=function() {}
Context.parser=Model.SWparser; // parsing method
Context.grapht=Model.GRAPH.ENFA; // graph type
Context.navitype="man"; // navigation type
Context.mode="parse"; // parsing or matching
Context.pattern=document.getElementById("ptnTxtEdt").value;
Context.content=document.getElementById("strTxtEdt").value;
Context.refresh=function() {
 var parser=document.querySelector('input[name="parse"]:checked').value;
 if (parser!=Context.parser.title) {
  switch (parser) {
  case 'SWparser':
   Context.parser=Model.SWparser;break;
  case 'LYparser':
   Context.parser=Model.LYparser;break;
  default:
  };
 }
 switch (document.querySelector('input[name="graph"]:checked').value) {
 case 'ENFA':
  Context.grapht=Model.GRAPH.ENFA;break;
 case 'NFA':
  Context.grapht=Model.GRAPH.NFA;break;
 case 'DFA':
  Context.grapht=Model.GRAPH.DFA;break;
 default:
 };
 Context.navitype=document.querySelector('input[name="navi"]:checked').value;
 Context.pattern=document.getElementById("ptnTxtEdt").value;
 Context.content=document.getElementById("strTxtEdt").value;
}