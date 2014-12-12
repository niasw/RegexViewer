/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
var ndp=[]; // [{'x':x of node, 'y':y of node},...]
//var lks=[]; // [{'c':char of link, 'f':from, 't':to}]
var linefun=d3.svg.line().x(function(d) {return d.x;}).y(function(d) {return d.y;}).interpolate('linear'); // polygonal lines
var linefunc=d3.svg.line().x(function(d) {return d.x;}).y(function(d) {return d.y;}).interpolate('basis'); // B-spline curve
var M_PI=3.14159265358979;
function setdrawpara() {
 noddist=1600/Math.sqrt(Node.allStates.length+1);
 if (Node.allStates.length>50) {
  circler=20/Math.sqrt(Node.allStates.length-50);
  txtsize=Math.round(circler*0.75);
 }
}
function linkTri(co1,co2,wd) { /** return coordinates of link triangle, (x1,y1) --- (x2,y2) triangle-width=wd **/
 var x1=co1.x,y1=co1.y;
 var x2=co2.x,y2=co2.y;
 var dx=y1-y2,dy=x2-x1;
 var Dy=y2-y1,Dx=x2-x1;
 var dd=Math.sqrt(dx*dx+dy*dy);
 dx=dx/dd;dy=dy/dd;Dx=Dx/dd;Dy=Dy/dd;
 return [{'x':x1+dx*wd/2+Dx*circler,'y':y1+dy*wd/2+Dy*circler},{'x':x2,'y':y2},{'x':x1-dx*wd/2+Dx*circler,'y':y1-dy*wd/2+Dy*circler}];
}
function linkCrv(co,dr,a,wd) { /** return coordinates of link curve, to oneself **/
 var wa=wd/circler;
 return [{'x':co.x+circler*Math.cos(a+M_PI/6-wa),'y':co.y+circler*Math.sin(a+M_PI/6-wa)},{'x':co.x+(circler+dr)*Math.cos(a+M_PI/6-wa/2),'y':co.y+(circler+dr)*Math.sin(a+M_PI/6-wa/2)},{'x':co.x+(circler+2*dr-wd/2)*Math.cos(a),'y':co.y+(circler+2*dr-wd/2)*Math.sin(a)},{'x':co.x+(circler+dr)*Math.cos(a-M_PI/6),'y':co.y+(circler+dr)*Math.sin(a-M_PI/6)},{'x':co.x+circler*Math.cos(a-M_PI/6),'y':co.y+circler*Math.sin(a-M_PI/6)},{'x':co.x+(circler+dr)*Math.cos(a-M_PI/6),'y':co.y+(circler+dr)*Math.sin(a-M_PI/6)},{'x':co.x+(circler+2*dr+wd/2)*Math.cos(a),'y':co.y+(circler+2*dr+wd/2)*Math.sin(a)},{'x':co.x+(circler+dr)*Math.cos(a+M_PI/6+wa/2),'y':co.y+(circler+dr)*Math.sin(a+M_PI/6+wa/2)},{'x':co.x+circler*Math.cos(a+M_PI/6+wa),'y':co.y+circler*Math.sin(a+M_PI/6+wa)}];
}
function linkCrv2(co1,co2,ds,wd) { /** return coordinates of link curve, ds: shift **/
 var x1=co1.x,y1=co1.y;
 var x2=co2.x,y2=co2.y;
 var dx=y1-y2,dy=x2-x1;
 var Dy=y2-y1,Dx=x2-x1;
 var dd=Math.sqrt(dx*dx+dy*dy);
 dx=dx/dd;dy=dy/dd;Dx=Dx/dd;Dy=Dy/dd;
 var wa=wd/circler;
 return [{'x':x1+dx*wd+Dx*circler,'y':y1+dy*wd+Dy*circler},{'x':(x1+x2)/2+dx*(ds+wd/2),'y':(y1+y2)/2+dy*(ds+wd/2)},{'x':x2+dx*wd/2,'y':y2+dy*wd/2},{'x':(x1+x2)/2+dx*ds,'y':(y1+y2)/2+dy*ds},{'x':x1+Dx*circler,'y':y1+Dy*circler}];
}
function drawinitnodes() { // first drawing nodes
 ndp=new Array(Node.objStates.length);
 for (var it=0;it<Node.objStates.length;it+=1) {
  ndp[it]={'x':(it*2-ndp.length)*circler*1.2+wid/2,'y':-Math.pow(it*2-ndp.length,2)*circler/80+hgh/2};
 }
 d3.select('svg').selectAll('circle.nodes').data(Node.allStates).enter() // add all states
  .append('circle').attr('class','nodes').attr('cx',function(d){return ndp[d].x;}).attr('cy',function(d){return ndp[d].y;}).attr('r',circler);
 d3.select('svg').selectAll('circle.erase').data(Node.allStates).enter()
  .append('circle').attr('class','erase').attr('cx',function(d){return ndp[d].x;}).attr('cy',function(d){return ndp[d].y;}).attr('r',circler);
 d3.select('svg').selectAll('text.nodes').data(Node.allStates).enter()
  .append('text').attr('class','nodes').attr('x',function(d){return ndp[d].x;}).attr('y',function(d){return ndp[d].y+0.4*txtsize;}).text(function(d){return d;});
}
function drawinitlinks() { // first drawing links
 for (var itn in Node.allStates) {
  var tmpArr=Node.objStates[Node.allStates[itn]].lk2;
  for (var itl in tmpArr) {
   if (Node.allStates[itn]!=tmpArr[itl][1]) {
    if (indexOf0(Node.objStates[tmpArr[itl][1]].lk2,Node.allStates[itn])==-1) { // no direct loop
     d3.select('svg').insert('path',':first-child').attr('class','sline').attr('d',linefun(linkTri(ndp[Node.allStates[itn]],ndp[tmpArr[itl][1]],circler/2)));
     d3.select('svg').insert('text',':first-child').attr('class','sline').attr('x',(ndp[Node.allStates[itn]].x+ndp[tmpArr[itl][1]].x)/2).attr('y',(ndp[Node.allStates[itn]].y+ndp[tmpArr[itl][1]].y)/2).text(tmpArr[itl][0]);
    } else { // direct loop
     var pts=linkCrv2(ndp[Node.allStates[itn]],ndp[tmpArr[itl][1]],circler*2,circler/4);
     d3.select('svg').insert('path',':first-child').attr('class','sline').attr('d',linefunc(pts));
     d3.select('svg').insert('text',':first-child').attr('class','sline').attr('x',pts[1].x).attr('y',pts[1].y+0.4*txtsize).text(tmpArr[itl][0]);
    }
   } else { // self loop
    var pts=linkCrv(ndp[Node.allStates[itn]],circler,M_PI/4,circler/4);
    d3.select('svg').insert('path',':first-child').attr('class','sline').attr('d',linefunc(pts));
    d3.select('svg').insert('text',':first-child').attr('class','sline').attr('x',pts[2].x).attr('y',pts[2].y+0.4*txtsize).text(tmpArr[itl][0]);
   }
  }
 }
}
function drawinitmarks() { // first drawing braket marks
 d3.select('svg').selectAll('text.markBBL').data(bktStack).enter()
   .append('text').attr('class','markBBL').attr('x',function(d){return ndp[d[0]].x-txtsize*1.2;}).attr('y',function(d){return ndp[d[0]].y+txtsize/2.7;}).text('{');
 d3.select('svg').selectAll('text.markBBR').data(bktStack).enter()
   .append('text').attr('class','markBBR').attr('x',function(d){return ndp[d[1]].x+txtsize*1.2;}).attr('y',function(d){return ndp[d[1]].y+txtsize/2.7;}).text('}');
 d3.select('svg').append('text').attr('class','markBL').attr('x',ndp[bktUsing[0]].x-txtsize*1.2).attr('y',ndp[bktUsing[0]].y+txtsize/2.7).text('(');
 d3.select('svg').append('text').attr('class','markBR').attr('x',ndp[bktUsing[1]].x+txtsize*1.2).attr('y',ndp[bktUsing[1]].y+txtsize/2.7).text(')');
}
function drawfinal() { // first marking final states
 d3.select('svg').selectAll('circle.final').data(Node.finStates).enter() // add final marks
  .append('circle').attr('class','final').attr('cx',function(d){return ndp[d].x;}).attr('cy',function(d){return ndp[Node.allStates[d]].y;}).attr('r',circler*1.3);
}
function modifynodes() { // modify nodes location
 d3.select('svg').selectAll('circle.nodes').data(Node.allStates).attr('cx',function(d){return ndp[d].x;}).attr('cy',function(d){return ndp[d].y;});
 d3.select('svg').selectAll('circle.erase').data(Node.allStates).attr('cx',function(d){return ndp[d].x;}).attr('cy',function(d){return ndp[d].y;});
 d3.select('svg').selectAll('text.nodes').data(Node.allStates).attr('x',function(d){return ndp[d].x;}).attr('y',function(d){return ndp[d].y+0.4*txtsize;});
 d3.select('svg').selectAll('circle.final').data(Node.finStates).attr('cx',function(d){return ndp[Node.allStates[d]].x;}).attr('cy',function(d){return ndp[Node.allStates[d]].y;});
}
function modifymarks() { // modify braket marks
}
function modifylinks() { // modify links location
}
function drawinittrees() { // first drawing trees
console.log("drawtree");
console.log(bktTree);
}
