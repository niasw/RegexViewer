/** Apache License 2.0 Applies for Scripts here, see NOTICE and LICENSE **/
/** @author Sun Sibai & Liu Yu & Tian Chuang & Zhuo Junbao & Zhai Aonan **/

/** View **/
/**   dependency: ui/swconst.js **/
/**   dependency: model/swnodes.js (indexOfkey)**/
/**   dependency: /lib/d3.min.js **/
var Draw={};
var  bilinks = [];
var newlinks=[];
var Tnodes=[], Tlinks=[];

// force layout
Draw.canvas=d3.select('div#canvas').append('div').attr('id','svg').append('svg').attr('class','chart center')
 .attr('width',Const.wid).attr('height',Const.hgh);
Draw.links=Draw.canvas.selectAll(".links"); // later will use .data instead
Draw.nodes=Draw.canvas.selectAll(".nodes");
Draw.auxnf=Draw.canvas.selectAll(".auxnf"); // aux lines to mark entry and final
Draw.auxns=Draw.canvas.selectAll(".auxns");
Draw.ndtxt=Draw.canvas.selectAll(".ndtxt"); // share data with nodes
Draw.lktxt=Draw.canvas.selectAll(".lktxt"); // share data with links
Draw.tick=function() {
    //Draw.links=Tlinks;
    //Draw.nodes=Tnodes;
 Draw.links .attr("d",function(d){
 var ret="M" + d.xy[0].x + "," + d.xy[0].y+"S";
 for(var it=1;it<d.xy.length-1;it+=1){
 ret=ret+d.xy[it].x + "," + d.xy[it].y +" ";
 }ret=ret+d.xy[d.xy.length-1].x + "," + d.xy[d.xy.length-1].y;
         return ret;
     });
 Draw.nodes.attr("transform", function(d) {
     return "translate(" + d.x + "," + d.y + ")";
 });
 var tmpl=Draw.layout.links();
 Draw.lktxt
  .attr("x", function(d,i) {return (tmpl[i+1])?d.x*0.4+(tmpl[i].source.x+tmpl[i+1].target.x)*0.3:undefined;})
  .attr("y", function(d,i) {return (tmpl[i+1])?d.y*0.4+(tmpl[i].source.y+tmpl[i+1].target.y)*0.3+0.4*Const.txtsize:undefined;});
 Draw.ndtxt
  .attr("x", function(d) {return d.x;})
  .attr("y", function(d) {return d.y+0.4*Const.txtsize;});
 Draw.auxnf
  .attr("cx", function(d) {return d.x;})
  .attr("cy", function(d) {return d.y;});
 Draw.auxns
  .attr("cx", function(d) {return d.x;})
  .attr("cy", function(d) {return d.y;});
}
Draw.layout=d3.layout.force().size([Const.wid, Const.hgh]).nodes([]).linkDistance(Const.noddist).charge(Const.strngth).on("tick",Draw.tick);

// mouse cursor
Draw.mouse=[-100,-100];
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
 Draw.mouse=d3.mouse(this);
 Draw.cursor.attr("transform","translate("+Draw.mouse+")");
}
Draw.canvas.on("mousemove",Draw.mousemove);
Draw.mousedown=function() { // use d3 interface, pa da ~
 Draw.mouse=d3.mouse(this);
 Draw.cursor.attr("transform","translate("+[Draw.mouse[0],Draw.mouse[1]+3]+")");
 Draw.refresh();
}
Draw.canvas.on("mousedown",Draw.mousedown);
Draw.canvas.on("mouseup",Draw.mousemove);

// link color
Draw.linkcolor=d3.interpolateLab("#f0f0ff","#7f7faf"); // Gradient Ref: https://gist.github.com/mbostock/4163057 , Arrow Ref: http://blog.csdn.net/lzhlzz/article/details/41808231

// node color
Draw.nodecolor=function(phase) {
 if (phase<0) {return (d3.interpolateLab("#ffffff","#7f7faf"))(phase);}
 else if (phase<1) {return (d3.interpolateLab("#7f7faf","#af7f7f"))(phase);}
 else if (phase<2) {return (d3.interpolateLab("#af7f7f","#7faf7f"))(phase-1);}
 else {return (d3.interpolateLab("#7faf7f","#af7f7f"))(phase-2);}
}

Draw.defs = Draw.canvas.append("defs").selectAll("marker")
    .data(["licensing"])
    .enter().append("svg:marker")
    .attr("id", "licensing")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 35)
    .attr("refY", 1)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("svg:path")
    .attr("style","stroke-width:1pt")
    .attr("d", "M0,-5L10,0L0,5");

// nodes initialize
Draw.refresh=function() {
 Draw.links=Draw.links.data(bilinks,function(d) {return d.id;});
 Draw.links.enter().insert('path','.nodes').attr('class','links').style('opacity',0).style('stroke',function(d) {return Draw.linkcolor(d.phase);}).transition().duration(Const.deltime).style('opacity',1).style('stroke',function(d) {return Draw.linkcolor(0);})
     .attr("marker-end","url(#licensing)");
 Draw.links.exit().transition().duration(Const.deltime).style('opacity',0).remove();
 Draw.lktxt=Draw.lktxt.data(newlinks).text(function(d) {return d.char;});
 Draw.lktxt.enter().insert('text','.lktxt').attr('class','lktxt').text(function(d) {return d.char;}).style('opacity',0).transition().duration(Const.deltime).style('opacity',1);
 Draw.lktxt.exit().transition().duration(Const.deltime).style('opacity',0).remove();
 Draw.nodes=Draw.nodes.data(Tnodes,function(d) {return d.id;}).style('fill',function(d) {return Draw.nodecolor(d.phase);});
 Draw.nodes.enter().insert('circle','.nodes').attr('class','nodes').style('fill',function(d) {return Draw.nodecolor(d.phase);}).attr('r',0).transition().duration(Const.deltime).attr('r',Const.circler);
 Draw.nodes.exit().transition().duration(Const.deltime).attr("r",0).remove();
 Draw.nodes.call(Draw.layout.drag);
 Draw.ndtxt=Draw.ndtxt.data(Tnodes,function(d) {return d.id;}).text(function(d) {return d.id;});
 Draw.ndtxt.enter().insert('text','.ndtxt').attr('class','ndtxt').text(function(d) {return d.id;}).style('opacity',0).transition().duration(Const.deltime).style('opacity',1);
 Draw.ndtxt.exit().transition().duration(Const.deltime).attr("r",0).remove();
 
 Draw.auxnf=Draw.auxnf.data(Tnodes,function(d) {return d.id;});
 Draw.auxnf.style('opacity',function(d){return d.final?1:0;});
 Draw.auxnf.enter().insert('circle','.auxnf').attr('class','auxnf').style('opacity',function(d){return d.final?1:0;}).style('fill','none').style('stroke','#ffffff').attr('r',0).transition().duration(Const.deltime).attr('r',Const.circler*0.75);
 Draw.auxnf.exit().transition().duration(Const.deltime).attr("r",0).remove();
 Draw.auxns=Draw.auxns.data(Tnodes,function(d) {return d.id;});
 Draw.auxns.style('opacity',function(d){return d.entry?1:0;});
 Draw.auxns.enter().insert('circle','.auxns').attr('class','auxns').style('opacity',function(d){return d.entry?1:0;}).style('fill','#ffffff').attr('r',0).transition().duration(Const.deltime).attr('r',Const.circler*0.5);
 Draw.auxns.exit().transition().duration(Const.deltime).attr("r",0).remove();
 Draw.layout.start();
}
Draw.refresh();
var links = [];var nodes=[];
Draw.drawgraph=function(nodesAndLinks) { // FIXME: should acquire variation instead of whole graph.
 for (it in nodesAndLinks.nodes) {
  var tmp1=indexOfkey(Draw.layout.nodes(),nodesAndLinks.nodes[it].id,'id');
  var tmp2=nodesAndLinks.nodes[it];
  if (tmp1==-1) {
   tmp2.x=Draw.mouse[0]+Math.random(20)-10;tmp2.y=Draw.mouse[1]+Math.random(20)-10;
  } else {
   tmp2.x=Draw.layout.nodes()[tmp1].x;tmp2.y=Draw.layout.nodes()[tmp1].y;
  }
 }




    Tnodes = nodesAndLinks.nodes;
    Tlinks=nodesAndLinks.links;

     nodes= nodesAndLinks.nodes.slice(),

    bilinks=[];
    links = [];
	newlinks=[];
    nodesAndLinks.links.forEach(function(link) {
        var s = nodes[link.source],
            t = nodes[link.target],
            i = {'id':link.id}, // intermediate node
			tmp1=indexOfkey(Draw.layout.nodes(),i.id,'id');
            if (tmp1==-1) {
             i.x=Draw.mouse[0]+Math.random(20)-10;i.y=Draw.mouse[1]+Math.random(20)-10;
            } else {
             i.x=Draw.layout.nodes()[tmp1].x;i.y=Draw.layout.nodes()[tmp1].y;
            }
        i.char=link.char;
        if(link.target==link.source)
        {
            var tt = {'id':"aux1L"+link.id},t2 = {'id':"aux2L"+link.id}; // intermediate node
			tmp1=indexOfkey(Draw.layout.nodes(),tt.id,'id');tmp2=indexOfkey(Draw.layout.nodes(),t2.id,'id');
            if (tmp1==-1) {
             tt.x=Draw.mouse[0]+Math.random(20)-10;tt.y=Draw.mouse[1]+Math.random(20)-10;
            } else {
             tt.x=Draw.layout.nodes()[tmp1].x;tt.y=Draw.layout.nodes()[tmp1].y;
            }
            if (tmp2==-1) {
             t2.x=Draw.mouse[0]+Math.random(20)-10;t2.y=Draw.mouse[1]+Math.random(20)-10;
            } else {
             t2.x=Draw.layout.nodes()[tmp2].x;t2.y=Draw.layout.nodes()[tmp2].y;
            }
            nodes.push(tt,i,t2);
            links.push({source: s, target: tt},{source: tt, target: i},{source: i, target: t2},{source: t2, target: t});
			newlinks.push({},i,{},{});
            bilinks.push({'xy':[s,tt,i,t2,t],'id':link.id});

        }
        else
        {
            nodes.push(i);
            links.push({source: s, target: i}, {source: i, target: t});
			newlinks.push(i,{});
            bilinks.push({'xy':[s, i, t],'id':link.id});
        }
    });

    //Draw.layout.nodes(Tnodes);
    //Tnodes=Draw.layout.nodes();
    for (it in nodesAndLinks.links) {
        nodesAndLinks.links[it].source=nodesAndLinks.nodes[nodesAndLinks.links[it].source]; // convert id into node
        nodesAndLinks.links[it].target=nodesAndLinks.nodes[nodesAndLinks.links[it].target];
    }
    //Tnodes = nodesAndLinks.nodes;
    //Draw.layout.links(nodesAndLinks.links);
    //Tlinks=Draw.layout.links();
    //Draw.layout.nodes(nodesAndLinks.nodes);

    Draw.layout.nodes(nodes,function(d){return d.id;});
 Draw.layout.links(links);
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
Draw.drawmsges=function(difmsg,pattern,matchresult) {
/* differ message: show difference of graph, report errors besides
 * pattern: the pattern
 * match result: matched result
 */
 var tp;
 var txt=d3.select('div#difMessage');
 txt.selectAll('p').remove();
 if (difmsg) {
  tp=txt.append('p');
  tp.attr('class','pre');
  tp.attr('style','display:inline;');
  tp.node().text=difmsg;
  tp.node().textContent=difmsg;
 }
 var ptn=d3.select('div#regexResult');
 ptn.selectAll('p').remove();
 if (pattern) {
  tp=ptn.append('p');
  tp.attr('class','pre');
  tp.attr('style','display:inline;');
  tp.node().text=pattern;
  tp.node().textContent=pattern;
 }
 var mch=d3.select('div#matchResult');
 mch.selectAll('p').remove();
 if (matchresult) {
  for (it in matchresult) {
   tp=mch.append('p');
   tp.attr('class','pre');
   tp.node().text=matchresult[it];
   tp.node().textContent=matchresult[it];
  }
 }
}

function points(d) {

    var a = [d.source.x, d.source.y];
    var b = [d.target.x, d.target.y];
    var r = [];
    var len = Math.sqrt(Math.pow(a[0]-b[0],2)+Math.pow(a[1]-b[1],2));
    var s = Math.sign(a[0]-b[0]);
    r[0] = a;
    r[2] = b;
    if (b[0] == a[0]) {
        r[1] = [a[0] + len/2, (a[1] + b[1]) / 2];
    }
    else {
        var k = (b[1] - a[1]) / (b[0] - a[0]);
        if(k==0)
            r[1] = [(a[0]+b[0])/2-len/2,a[1]];
        else
            r[1]=[(a[0]+b[0])/2+len*k/2/(Math.sqrt(1+k*k))*s,(a[1]+b[1])/2-1/k*len*k*s/2/(Math.sqrt(1+k*k))];
    }
    return r;
}
