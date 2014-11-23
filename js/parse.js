/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
function parseRegex(pattern) {
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
      Node.objStates[statenode.lkf[it][1]].rm();
     }
    }
    node.brk();
   });
   bktTree.trnvTwigs(undefined,function(node){
    node.lk1(new TreeNode().init(node.idx));
   });
   break;
  default: // (...(...(p) => (...(......(c)
console.log("default called");
   bktTree.trnvTwigs(function(node){node.rm();},function(node){
console.log("leafFunc called");
    var newket = new Node().init().idx;
    Node.objStates[node.idx].lk(ptnchr,newket);
    node.lk1(new TreeNode().init(newket));
   });
  }
  ptnidx+=1;
 }
console.log("q0=");console.log(q0);
console.log("allState=");console.log(Node.allStates);
console.log("objState=");console.log(Node.objStates);
console.log("finState=");console.log(Node.finStates);
}
parseRegex('a');
