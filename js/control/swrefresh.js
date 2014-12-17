/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Form Input Settings, here is refresh function **/
/**  dependency: index.html(DOM) **/
/**  dependency: model/swmodel.js **/
/**  dependency: control/swinput.js **/
/**  dependency: control/swparserun.js (Context.ParsePro)**/
/**  dependency: control/swmatchrun.js (Context.MatchPro)**/
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
 if (Context.ParsePro.parser) {Context.ParsePro.parser.setMode(Context.grapht);}
 else {Context.ParsePro.init();}
 Context.pattern=document.getElementById("ptnTxtEdt").value;
 Context.content=document.getElementById("strTxtEdt").value;
}
Context.refresh();
