/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
var ptnidx=0; // treat it as static var limited within this script file please,
var ptnstr=""; // and this one as well.
var bktTree; // aux bracket tree
var q0; // starter state
var domCurPos=document.getElementById("currentPos");
function parseStepRegex() {
 if (ptnidx<ptnstr.length) {
  var ptnchr=ptnstr[ptnidx]; // character parsing
  switch (ptnchr) {
  case '(': // (...(...(p) => (...(......(("")
   bktTree.trnvTwigs(function(node){node.rm();},function(node){
    node.lk1(new TreeNode().init(node.idx));
    node.lk2[0].lk1(new TreeNode().init(node.idx));
   });
   break;
  case ')': // (...(...(p) => (...(......)
   bktTree.trnvTwigs(function(node){node.rm();});
   break;
  case '|': // (...(...(p) => (...(......|("")
   bktTree.brkTwigs(function(node){node.brk();},function(node){
    node.lk1(new TreeNode().init(node.idx));
    node.lk2[0].lk1(new TreeNode().init(node.idx));
   });
   break;
  case '?': // (...(...(p) => (...(...(p?)
   bktTree.trnvTwigs(function(node){
    node.lk1(new TreeNode().init(node.idx));
   });
   break;
  case '*': // (...(...(p) => (...(...(p*)
   bktTree.trnvTwigs(undefined,function(node){
    var sttNdLnkr=Node.objStates[node.idx].lkf; // link ")" to the "(" to make loop
    for (var it in sttNdLnkr) {
     if (node.lkf[0].idx!=node.idx) {
      Node.objStates[sttNdLnkr[it][1]].lk(sttNdLnkr[it][0],node.lkf[0].idx);
      Node.objStates[node.idx].rm();node.rm();
     }
    }
    node.brk();
   });
   bktTree.trnvTwigs(undefined,function(node){
    node.lk1(new TreeNode().init(node.idx));
   });
   break;
  default: // (...(...(p) => (...(......(c)
   bktTree.trnvTwigs(function(node){node.rm();},function(node){
    var newket = new Node().init().idx;
    Node.objStates[node.idx].lk(ptnchr,newket);
    node.lk1(new TreeNode().init(newket));
   });
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
 bktTree=new TreeNode().init(q0); // (aux tree) to save brackets
 bktTree.lk1(new TreeNode().init(q0));
 bktTree.lk2[0].lk1(new TreeNode().init(q0)); // q0->q0->q0 represents (("") state
 delgraph();drawinit(); // rebuild svg
 setdrawpara();drawinitnodes();drawinitmarks();drawinitlinks();
}
function parseFinalRegex() {
 if (ptnidx==ptnstr.length) {
  bktTree.trnvTwigs(undefined,function(node){
   Node.objStates[node.idx].setFinal(true);
  });
  domCurPos.textContent="Over~(^u^)";
  ptnidx+=1; // Final Done.
  drawfinal();
  d3.selectAll('.marks').remove(); // clear marks
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
