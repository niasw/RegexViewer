/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
var dynaInterval;
function clearpaths() { // FIXME: Should be Deprecated
 d3.selectAll('.sline').remove();
}
function clearmarks() { // FIXME: Should be Deprecated
 d3.selectAll('.marks').remove();
}
function clearfinal() { // FIXME: Should be Deprecated
 d3.selectAll('.final').remove();
}
function updateLocation() {
 var v={'x':0,'y':0},v2={'x':0,'y':0}; // v: this node velocity, v2: link node velocity
 var dp={'x':0,'y':0}; // x-x2
 var dd=0; // |dp|
 var ratio=30/(Node.allStates.length+1); // general repulsion to spread nodes
 var dispn=0.35; // ratio to shrink linking distance
 for (var itn in Node.allStates) {
  for (var itl=parseInt(itn)+1;itl<Node.allStates.length;itl+=1) { // general repulsion to spread nodes
   dp.x=ndp[Node.allStates[itn]].x-ndp[Node.allStates[itl]].x;
   dp.y=ndp[Node.allStates[itn]].y-ndp[Node.allStates[itl]].y;
   dd=Math.sqrt(dp.x*dp.x+dp.y*dp.y)+0.1;
   v.x=strngth*dp.x/dd*ratio;
   v.y=strngth*dp.y/dd*ratio;
   v2.x=-strngth*dp.x/dd*ratio;
   v2.y=-strngth*dp.y/dd*ratio;
   ndp[Node.allStates[itn]].x+=v.x/viscsty;ndp[Node.allStates[itn]].y+=v.y/viscsty;
   ndp[Node.allStates[itl]].x+=v2.x/viscsty;ndp[Node.allStates[itl]].y+=v2.y/viscsty;
  }
  var tmpArr=Node.objStates[Node.allStates[itn]].lk2;
  for (var itl in tmpArr) { // linking attraction to sort nodes
   if (tmpArr[itl][1]&&Node.allStates[itn]!=Node.allStates[tmpArr[itl][1]]) {
    dp.x=ndp[Node.allStates[itn]].x-ndp[Node.allStates[tmpArr[itl][1]]].x;
    dp.y=ndp[Node.allStates[itn]].y-ndp[Node.allStates[tmpArr[itl][1]]].y;
    dd=Math.sqrt(dp.x*dp.x+dp.y*dp.y)+0.1;
    v.x=-strngth*dp.x/dd*(1-noddist/dd*dispn);
    v.y=-strngth*dp.y/dd*(1-noddist/dd*dispn);
    v2.x=strngth*dp.x/dd*(1-noddist/dd*dispn);
    v2.y=strngth*dp.y/dd*(1-noddist/dd*dispn);
    ndp[Node.allStates[itn]].x+=v.x/viscsty;ndp[Node.allStates[itn]].y+=v.y/viscsty;
    ndp[Node.allStates[tmpArr[itl][1]]].x+=v2.x/viscsty;ndp[Node.allStates[tmpArr[itl][1]]].y+=v2.y/viscsty;
   } else { // TODO: handle the angle. currently fixed a=M_PI/4
   }
  }
  // centroid attraction
  ndp[Node.allStates[itn]].x+=central*(wid/2-ndp[Node.allStates[itn]].x)/viscsty;
  ndp[Node.allStates[itn]].y+=central*(hgh/2-ndp[Node.allStates[itn]].y)/viscsty;
 }
 // modify nodes
 modifynodes();
 // modify marks
 modifymarks();
 // modify links
 modifylinks();
if (ptnidx>ptnstr.length) {clearfinal();drawfinal();} else {clearmarks();drawinitmarks();} // FIXME: Oh! This complex step slowdown the animation!!!
clearpaths();drawinitlinks(); // FIXME: Oh! This complex step slowdown the animation!!!
}
function animeNodes() {
 if (dynaInterval) {
  clearInterval(dynaInterval);
  dynaInterval=null;
 } else {
  dynaInterval=setInterval('updateLocation();',150);
 }
}
