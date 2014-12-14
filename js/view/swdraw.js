/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** View **/
/**   dependency: ui/swconst.js **/
/**   dependency: /lib/d3.min.js **/
var Draw={};

// force layout
Draw.canvas=d3.select('div#canvas').append('div').attr('id','svg').append('svg').attr('class','chart center')
 .attr('width',Const.wid).attr('height',Const.hgh);
Draw.links=Draw.canvas.selectAll(".links"); // later will use .data instead
Draw.nodes=Draw.canvas.selectAll(".nodes");
Draw.ndtxt=Draw.canvas.selectAll(".ndtxt"); // share data with nodes
Draw.lktxt=Draw.canvas.selectAll(".lktxt"); // share data with links
Draw.tick=function() {
 Draw.links
  .attr("x1", function(d) {return d.source.x;})
  .attr("y1", function(d) {return d.source.y;})
  .attr("x2", function(d) {return d.target.x;})
  .attr("y2", function(d) {return d.target.y;});
 Draw.nodes
  .attr("cx", function(d) {return d.x;})
  .attr("cy", function(d) {return d.y;});
 Draw.lktxt
  .attr("x", function(d) {return (d.source.x+d.target.x)/2;})
  .attr("y", function(d) {return (d.source.y+d.target.y)/2+0.4*Const.txtsize;});
 Draw.ndtxt
  .attr("x", function(d) {return d.x;})
  .attr("y", function(d) {return d.y+0.4*Const.txtsize;});
}
Draw.layout=d3.layout.force().size([Const.wid, Const.hgh]).nodes([]).linkDistance(Const.noddist).charge(Const.strngth).on("tick",Draw.tick);

// mouse cursor
Draw.canvas.append("defs").append("radialGradient").attr("id","cursor-grad")
 .attr("gradientUnits","userSpaceOnUse").attr("cx",0).attr("cy",0).attr("fx",0).attr("fy",0).attr("r",30)
 .selectAll("stop").data([
  {offset:"0%",color:"rgba(200,180,250,.7)"},
  {offset:"100%",color:"rgba(200,180,250,.1)"}
 ]).enter().append("stop")
 .attr("offset",function(d) {return d.offset;})
 .attr("stop-color",function(d) {return d.color;});
Draw.cursor=Draw.canvas.append("circle").attr("class","cursor").attr("r",30).attr("transform","translate(-100,-100)").style("fill","url(#cursor-grad)"); // cursor enhance
Draw.mousemove=function() { // use d3 interface, large cursor
 Draw.cursor.attr("transform","translate("+d3.mouse(this)+")");
}
Draw.canvas.on("mousemove",Draw.mousemove);
Draw.mousedown=function() { // use d3 interface, pa da ~
 var pos=d3.mouse(this);
 Draw.cursor.attr("transform","translate("+[pos[0],pos[1]+3]+")");
 Draw.refresh();
}
Draw.canvas.on("mousedown",Draw.mousedown);
Draw.canvas.on("mouseup",Draw.mousemove);

// link color
Draw.linkcolor=d3.interpolateLab("#f0f0ff","#7f7faf"); //https://gist.github.com/mbostock/4163057 , http://blog.csdn.net/lzhlzz/article/details/41808231

// nodes initialize
//TODO: should acquire variation instead of whole graph.
Draw.refresh=function() {
 Draw.links=Draw.links.data(Draw.layout.links());
 Draw.links.enter().insert('line','.nodes').attr('class','links').style('opacity',0).transition().duration(500).style('opacity',1);
 Draw.links.exit().transition().duration(500).style('opacity',0).remove();
 Draw.lktxt=Draw.lktxt.data(Draw.layout.links()).text(function(d) {return d.char;});
 Draw.lktxt.enter().insert('text','.lktxt').attr('class','lktxt').text(function(d) {return d.char;}).style('opacity',0).transition().duration(500).style('opacity',1);
 Draw.lktxt.exit().transition().duration(500).style('opacity',0).remove();
 Draw.nodes=Draw.nodes.data(Draw.layout.nodes()).style('fill',function(d) {return Draw.linkcolor(0.5-Math.sqrt(d.phase)/8);});
 Draw.nodes.enter().insert('circle','.nodes').attr('class','nodes').style('fill',function(d) {return Draw.linkcolor(0.5-Math.sqrt(d.phase)/8);}).attr('r',0).transition().duration(500).attr('r',Const.circler);
 Draw.nodes.exit().transition().duration(500).attr("r",0).remove();
 Draw.nodes.call(Draw.layout.drag);
 Draw.ndtxt=Draw.ndtxt.data(Draw.layout.nodes()).text(function(d) {return d.index;});
 Draw.ndtxt.enter().insert('text','.ndtxt').attr('class','ndtxt').text(function(d) {return d.index;}).style('opacity',0).transition().duration(500).style('opacity',1);
 Draw.ndtxt.exit().transition().duration(500).attr("r",0).remove();
 Draw.layout.start();
}
Draw.refresh();
Draw.drawgraph=function(nodesAndLinks) { // FIXME: should acquire variation instead of whole graph.
 for (it in nodesAndLinks.nodes) {
  nodesAndLinks.nodes[it].x=Const.wid/2+Math.random(100);
  nodesAndLinks.nodes[it].y=Const.hgh/2+Math.random(100);
 }
 Draw.layout.nodes(nodesAndLinks.nodes);
 console.log(nodesAndLinks.nodes);
 for (it in nodesAndLinks.links) {
  nodesAndLinks.links[it].source=nodesAndLinks.nodes[nodesAndLinks.links[it].source];
  nodesAndLinks.links[it].target=nodesAndLinks.nodes[nodesAndLinks.links[it].target];
 }
 Draw.layout.links(nodesAndLinks.links);
 console.log(nodesAndLinks.links);
 Draw.refresh();
}
Draw.drawstate=function(hightext) { // which char are we dealing with
 var txt=d3.select('div#currentPos');
 txt.selectAll('pre').remove();
 for (it in hightext) {
  var tp=txt.append('pre');
  tp.attr('style','color:'+Draw.linkcolor(0.5-hightext[it].phase/2)+';display:inline;');
  tp.node().text=hightext[it].txt;
  tp.node().textContent=hightext[it].txt;
 }
}
