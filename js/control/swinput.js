/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Form Input Settings, here is just a declaration **/
/**  dependency: index.html(DOM) **/
/**  dependency: model/swmodel.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
/**  dependency: model/swmatcher.js (SWmatcher)**/
/**  dependency: model/lymatcher.js (LYmatcher)**/
var Context=function() {}
Context.parser=Model.SWparser; // parsing method
Context.grapht=Model.GRAPH.ENFA; // graph type
Context.mode="parse"; // parsing or matching
Context.matcher=Model.SWmatcher; // matching method
Context.strategy={"start":"last","final":"first"}; // matching strategy
Context.navitype="man"; // navigation type
Context.pattern=document.getElementById("ptnTxtEdt").value;
Context.content=document.getElementById("strTxtEdt").value;
