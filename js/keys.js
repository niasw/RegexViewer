/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
function keypress(event) {
 if (event.keyCode==13||event.keyCode==39) {
  parseTryStepRegex();
 }
 if (document.activeElement!=document.getElementById("pattern")&&document.activeElement!=document.getElementById("content")) {
  event.preventDefault(); // non-IE
  event.returnValue=false; // IE
 }
}
