(function() {
 var re = "a(b*c*|c*b*)?d", str = "abcd";

 var ast = parser.parse(re);
 console.log('ast');
 dbg2(ast);

 document.write("\n");
 var maker1 = new nfae_maker(ast), nfae;
 while (true) {
  var result = maker1.iter();
  console.log('fmt_ast(result["ast"])');
  dbg2(fmt_ast(result["ast"]));
  console.log('result["fas"]');
  dbg2(result["fas"]);
  if (maker1.is_end()) {
   nfae = result["fas"][0];
   break;
  }
 }

 document.write("\n");
 var maker2 = new nfa_maker(nfae), nfa;
 while (true) {
  var result = maker2.iter();
  dbg2(result["nfae"]);
  dbg2(result["nfa"]);
  if (maker2.is_end()) {
   nfa = result["nfa"];
   break;
  }
 }

 document.write("\n");
 var maker3 = new dfa_maker(nfa), dfa;
 while (true) {
  var result = maker3.iter();
  dbg2(result["nfa"]);
  dbg2(result["dfa"]);
  if (maker3.is_end()) {
   dfa = result["dfa"];
   break;
  }
 }

 document.write("\n");
 var matcher1 = new bt_nfae_matcher(nfae);
 matcher1.init(str);
 while (true) {
  var result = matcher1.iter();
  dbg2([result["str"], result["status"]]);
  dbg2(result["nfae"]);
  if (matcher1.is_end()) break;
 }

 document.write("\n");
 var matcher2 = new tom_nfa_matcher(nfa);
 matcher2.init(str);
 while (true) {
  var result = matcher2.iter();
  dbg2([result["str"], result["status"]]);
  dbg2(result["nfa"]);
  if (matcher2.is_end()) break;
 }

 document.write("\n");
 var matcher3 = new tom_nfa_matcher(dfa);
 matcher3.init(str);
 while (true) {
  var result = matcher3.iter();
  dbg2([result["str"], result["status"]]);
  dbg2(result["nfa"]);
  if (matcher3.is_end()) break;
 }
})();

// -*- indent-tabs-mode: nil -*- vim:et:ts=1:sw=1
