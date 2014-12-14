/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** Key Settings **/
/**  dependency: index.html(DOM) **/
/**  dependency: control/swinput.js **/
/**  dependency: control/swparserun.js **/
/**  dependency: control/swmatchrun.js **/
var KeySet=function() {}
KeySet.keypress=function(event) {
 if (event.keyCode==13||event.keyCode==39) {
  switch (Context.mode) {
  case "parse":
   Context.ParsePro.step();
   break;
  case "match":
   Context.MatchPro.step();
   break;
  default:
  }
 }
 if (document.activeElement!=document.getElementById("ptnTxtEdt")&&document.activeElement!=document.getElementById("strTxtEdt")) {
  event.preventDefault(); // non-IE
  event.returnValue=false; // IE
 }
}
