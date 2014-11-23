/** Apache License 2.0 Applies for Code Here **/
/** @author Sun Sibai & Liu Yu & Tian Chuang **/
// constant declaration
var wid=700; // width
var hgh=700; // height
var txtsize=14; // text size in pt
var linsize=2; // line width in px
var circler=20; // circle radius
// function declaration
function drawinit() {
 d3.select('body').append('div').attr('class','wrapper').attr('id','canvas')
   .append('svg').attr('class','chart center')
   .attr('width',wid).attr('height',hgh);
}
function delgraph() {
 d3.select('div#canvas').remove();
}
