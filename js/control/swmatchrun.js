/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Matching Process **/
/**  dependency: index.html(DOM) **/
/**  dependency: control/swinput.js **/
/**  dependency: control/swparserun.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
/**  dependency: model/swmatcher.js (SWmatcher)**/
/**  dependency: model/lymatcher.js (LYmatcher)**/
/**  dependency: model/swgraph.js **/
/**  dependency: view/swdraw.js **/
Context.MatchPro={};
Context.MatchPro.init=function(content,strategy) {
 content=content||Context.content; // for Chrome compatibility (only Firefox supports default parameter feature)
 strategy=strategy||Context.strategy; // for Chrome compatibility (only Firefox supports default parameter feature)
 if (Context.ParsePro.parser) {Context.ParsePro.init();Context.ParsePro.run();}
 Context.mode="match";
 if (Context.MatchPro.matcher) {Context.MatchPro.matcher.clean();}
 Context.MatchPro.matcher=new Context.matcher(Context.ParsePro.parser.dumpgraph(),content,Context.strategy);
 Draw.drawgraph(Model.nodes_links(Context.MatchPro.matcher.highdump()));
}
Context.MatchPro.step=function() {
 if (!Context.MatchPro.matcher) {Context.MatchPro.init();}
 Draw.drawdiffm(Context.MatchPro.matcher.step());
 Draw.drawgraph(Model.nodes_links(Context.MatchPro.matcher.highdump()));
 Draw.drawstate(Context.MatchPro.matcher.hightext());
}
Context.MatchPro.is_end=function() {
 return Context.MatchPro.matcher ? Context.MatchPro.matcher.is_end() : false; // if not initialized, means to be runned
}
Context.MatchPro.run=function() {
 if (!Context.MatchPro.is_end()) {
  if (!Context.MatchPro.matcher) {Context.ParsePro.init();}
  Context.MatchPro.matcher.run();
 }
 Context.MatchPro.step(); // call drawing functions
}
