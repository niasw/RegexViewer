/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
// constant declaration
var wid=700; // width
var hgh=700; // height
var txtsize=14; // text size in pt
var linsize=2; // line width in px
var circler=20; // circle radius
var strngth=1; // dynamic simulation (force)
var viscsty=1; // dynamic simulation (viscosity)
var noddist=500; // balance distance for a single link
var central=0.1; // central attraction to prevent drifting away
// function declaration
function drawinit() {
 d3.select('div#canvas').append('div').attr('id','svg')
   .append('svg').attr('class','chart center')
   .attr('width',wid).attr('height',hgh);
}
function delgraph() {
 d3.select('div#svg').remove();
}
