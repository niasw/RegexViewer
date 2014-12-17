/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Matching Process **/
/**  dependency: index.html(DOM) **/
/**  dependency: control/swinput.js **/
/**  dependency: control/swparserun.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
/**  dependency: model/swgraph.js **/
/**  dependency: view/swdraw.js **/
Context.MatchPro={};
Context.MatchPro.init=function(content) {
 content=content||Context.content; // for Chrome compatibility (only Firefox supports default parameter feature)
 if (Context.ParsePro.parser) {Context.ParsePro.init();Context.ParsePro.run();}
 Context.mode="match";
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump()));
}
Context.ParsePro.step=function() {
 if (!Context.ParsePro.parser) {Context.ParsePro.init();}
 Draw.drawdiffm(Context.ParsePro.parser.step());
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump()));
 Draw.drawstate(Context.ParsePro.parser.hightext());
}
