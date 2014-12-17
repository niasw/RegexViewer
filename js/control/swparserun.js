/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Parsing Process **/
/**  dependency: index.html(DOM) **/
/**  dependency: control/swinput.js **/
/**  dependency: model/swparser.js (SWparser)**/
/**  dependency: model/lyparser.js (LYparser)**/
/**  dependency: model/swgraph.js **/
/**  dependency: view/swdraw.js **/
Context.ParsePro={};
Context.ParsePro.init=function(pattern) {
 pattern=pattern||Context.pattern; // for Chrome compatibility (only Firefox supports default parameter feature)
 Context.mode="parse";
 if (Context.ParsePro.parser) {Context.ParsePro.parser.clean();}
 Context.ParsePro.parser=new Context.parser(pattern);
 if (Context.ParsePro.parser) {Context.ParsePro.parser.setMode(Context.grapht);}
 Context.ParsePro.parser.ready();
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump(undefined,true)));
}
Context.ParsePro.step=function() {
 if (!Context.ParsePro.parser) {Context.ParsePro.init();}
 Draw.drawdiffm(Context.ParsePro.parser.step());
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump(undefined,true)));
 Draw.drawstate(Context.ParsePro.parser.hightext());
}
Context.ParsePro.is_end=function() {
 return Context.ParsePro.parser ? Context.ParsePro.parser.is_end() : false; // if not initialized, means to be runned
}
Context.ParsePro.run=function() {
 if (!Context.ParsePro.is_end()) {
  if (!Context.ParsePro.parser) {Context.ParsePro.init();}
  Context.ParsePro.parser.run();
 }
 Context.ParsePro.step(); // call drawing functions
}
