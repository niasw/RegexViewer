/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Form Input Settings, here is refresh function **/
/**  dependency: index.html(DOM) **/
/**  dependency: model/swmodel.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
/**  dependency: model/swmatcher.js (SWmatcher)**/
/**  dependency: model/lymatcher.js (LYmatcher)**/
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
 var matcher=document.querySelector('input[name="match"]:checked').value;
 if (matcher!=Context.matcher.title) {
  switch (matcher) {
  case 'SWmatcher':
   Context.matcher=Model.SWmatcher;break;
  case 'LYmatcher':
   Context.matcher=Model.LYmatcher;break;
  default:
  };
 }
 Context.strategy.start=document.querySelector('input[name="stgstart"]:checked').value;
 Context.strategy.final=document.querySelector('input[name="stgfinal"]:checked').value;
 Context.navitype=document.querySelector('input[name="navi"]:checked').value;
 Context.pattern=document.getElementById("ptnTxtEdt").value;
 Context.content=document.getElementById("strTxtEdt").value;
 switch (Context.mode) {
 case "match":
  Context.runner=Context.MatchPro;
  break;
 case "parse":
 default:
  Context.runner=Context.ParsePro;
 }
}
Context.refresh();
