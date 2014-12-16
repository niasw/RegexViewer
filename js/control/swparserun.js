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
 Context.ParsePro.parser.ready();
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump()));
}
Context.ParsePro.step=function() {
 Draw.drawdiffm(Context.ParsePro.parser.step());
 Draw.drawgraph(Model.nodes_links(Context.ParsePro.parser.highdump()));
 Draw.drawstate(Context.ParsePro.parser.hightext());
}
