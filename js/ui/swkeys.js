/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Key Settings **/
/**  dependency: index.html(DOM) **/
/**  dependency: ui/swconst.js **/
/**  dependency: control/swinput.js **/
/**  dependency: control/swparserun.js **/
/**  dependency: control/swmatchrun.js **/
/**  dependency: control/swrefresh.js **/
var KeySet=function() {}
KeySet.keypress=function(event) {
 if (event.keyCode==13||event.keyCode==39||event.keyCode==34||event.keyCode==40) {
  switch (Context.navitype) {
  case "aut":
   if (!Context.runnerInterval) {
    Context.runnerInterval=setInterval('Context.runner.step();',Const.interval);
   }
   break;
  case "run":
   if (Context.runnerInterval) {
    clearInterval(Context.runnerInterval);
    Context.runnerInterval=undefined;
   }
   Context.runner.run();
   break;
  case "man":
  default:
   if (Context.runnerInterval) {
    clearInterval(Context.runnerInterval);
    Context.runnerInterval=undefined;
   }
   Context.runner.step();
  }
 } else {console.log('key pressed:');console.log(event.keyCode);}
 if (document.activeElement!=document.getElementById("ptnTxtEdt")&&document.activeElement!=document.getElementById("strTxtEdt")) {
  event.preventDefault(); // non-IE
  event.returnValue=false; // IE
 }
}
