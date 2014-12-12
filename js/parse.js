/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
var ptnidx=0; // treat it as static var limited within this script file please,
var ptnstr=""; // and this one as well.
var bktStack; // aux bracket stack (save ['{','}'])
var bktUsing; // the using bracket (save ['(',')'])
var q0; // starter state
var domCurPos=document.getElementById("currentPos");
function parseStepRegex() {
 if (ptnidx<ptnstr.length) {
  var ptnchr=ptnstr[ptnidx]; // character parsing
  switch (ptnchr) {
  case '(': // {...{...(p) => {...{....p.{("")
   Node.objStates[Node.objStates[bktUsing[0]].lk2[0][0]].smrm();
   bktStack.push([bktUsing[0],undefined]);
   bktUsing[0]=bktUsing[1];
   bktUsing[1]=new Node().init().idx;
   Node.objStates[bktUsing[0]].lk(bktUsing[1]);
   break;
  case ')': // {...{...(p) => {...(....p.)
   var tmpBkt=bktStack.pop();
   bktUsing[0]=tmpBkt[0];
   if (tmpBkt[1]) {
    Node.objStates[bktUsing[1]].lk(tmpBkt[1]);
    bktUsing[1]=tmpBkt[1];
   }
   break;
  case '|': // {...{...(p) => {...{....p.|("")
   var tmpBkt=bktStack.pop();
   if (!tmpBkt[1]) {tmpBkt[1]=new Node().init().idx;}
   Node.objStates[bktUsing[1]].lk(tmpBkt[1]);
   bktUsing[1]=Node.objStates[tmpBkt[0]].lk2[0][0];
   bktStack.push(tmpBkt);
   break;
  case '+': // {...{...(p) => {...{...(p+)
   Node.objStates[bktUsing[1]].lk(Node.objStates[bktUsing[0]].lk2[0][0]); // link back
   break;
  default: // {...{...(p) => {...{....p.(c)
   Node.objStates[Node.objStates[bktUsing[0]].lk2[0][0]].smrm();
   bktUsing[0]=bktUsing[1];
   var tmpNod=new Node().init().idx;
   Node.objStates[bktUsing[0]].lk(tmpNod);
   bktUsing[1]=new Node().init().idx;
   Node.objStates[tmpNod].lk(bktUsing[1]);
  }
  ptnidx+=1;
 }
}
// function parseBackRegex(ptnidx,ptnchr){} // ISSUE: It is impossible to traceback for the case '*',')','|' unless record all the process.
function parseStartRegex(pattern) {
 ptnidx=0; // character index parsing
 ptnstr=pattern; // pattern string to be parsed
 Node.clearAll(); // reset nodes
 q0=new Node().init().idx; // start state
 Node.objStates[q0].lk(new Node().init().idx);
 bktStack=[[q0,undefined]]; // {()
 bktUsing=[q0,Node.objStates[q0].lk2[0][0]];
 delgraph();drawinit(); // rebuild svg
 setdrawpara();drawinitnodes();drawinitmarks();drawinitlinks();
}
function parseFinalRegex() {
 if (ptnidx==ptnstr.length) {
  Node.objStates[bktUsing[1]].setFinal(true);
  domCurPos.textContent="Over~(^u^)";
  ptnidx+=1; // Final Done.
  drawfinal();
  d3.selectAll('.markBL').remove(); // clear marks
  d3.selectAll('.markBR').remove(); // clear marks
  d3.selectAll('.markBBL').remove(); // clear marks
  d3.selectAll('.markBBR').remove(); // clear marks
 }
}
function parseTryStepRegex() {
 if (ptnidx<ptnstr.length) {
  var ptnchr=ptnstr[ptnidx]; // character parsing
  domCurPos.textContent=ptnchr.toString(); // domCurPos.setProperty('text',ptnchr.toString());
  parseStepRegex();
 } else {
  parseFinalRegex();
 }
debugdump(); //FIXME: DEBUG
delgraph();drawinit();setdrawpara();drawinitnodes();drawinitlinks();if (ptnidx>ptnstr.length) {drawfinal();} else {drawinitmarks();} //FIXME: DEBUG
}
// DEBUG USE
function debugdump() {
var domRegRes=document.getElementById("regexResult");
domRegRes.textContent="q0="+q0+"\n"+"#allState="+Node.allStates.length+"\n"+"finState="+Node.finStates;
//console.log("q0=");console.log(q0);
//console.log("allState=");console.log(Node.allStates);
//console.log("objState=");console.log(Node.objStates);
//console.log("finState=");console.log(Node.finStates);
//console.log("auxTree=");console.log(bktTree);
}
