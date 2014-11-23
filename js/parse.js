/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
function parseRegex(pattern) {
 Node.clearAll();
 var q0=new Node().init().idx; // start state
 var ptnidx=0; // character index parsing
 var ptnchr; // character parsing
 var domCurPos=document.getElementById("currentPos");
 var bktTree=new TreeNode().init(q0); // (aux tree) to save brackets
 bktTree.lk1(new TreeNode().init(q0));
 bktTree.lk2[0].lk1(new TreeNode().init(q0)); // q0->q0->q0 represents (("") state
 while (ptnidx<pattern.length) {
  ptnchr=pattern[ptnidx];
  domCurPos.textContent=ptnchr.toString(); // domCurPos.setProperty('text',ptnchr.toString());
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
 bktTree.trnvTwigs(undefined,function(node){
  Node.objStates[node.idx].setFinal(true);
 });

// DEBUG USE
 var domRegRes=document.getElementById("regexResult");
 domRegRes.textContent="q0="+q0+"\n"+"allState="+Node.allStates+"\n"+"objState="+Node.objStates+"\n"+"finState="+Node.finStates;
console.log("q0=");console.log(q0);
console.log("allState=");console.log(Node.allStates);
console.log("objState=");console.log(Node.objStates);
console.log("finState=");console.log(Node.finStates);
console.log("auxTree=");console.log(bktTree);
}
