// INSTALL LIBRARIES:
// - install package manager npm from directory devtools-panel by command 
// npm install
// - install this module for parametrize tests from directory devtools-panel
// ember install ember-cli-qunit-parameterize
// (https://github.com/BBVAEngineering/ember-cli-qunit-parameterize)
// - to fix incompatibility of package versions
// npm audit fix
//
// CREATE SERVICE:
// - create service in directory devtools-panel
// ember g service selector-scss-builder
//
// BUILD:
// - build devtools-panel from directory devtools-panel by command 
// ember build
// - run build webpack from main directory Natu.WebSync.Chrome
// npx webpack
//
// RUN TESTS:
// - run test for certain module and certain group
// ember test -m 'Unit | Service | selector scss builder' -f 'ConvertScssToCss'
//
// OTHER PARAMETERS:
// - in file testem.js in parameter browser_args.args add
// 		'--no-sandbox'
// - rename bower.json to bower.json1

import { moduleFor, test } from 'ember-qunit';
import cases from 'qunit-parameterize';

moduleFor('service:scss-parser', 'Unit | Service | selector scss builder', {
  // Specify the other units that are required for this test.
  // needs: ['service:foo']
});

// // Replace this with your real tests.
// test('it exists', function(assert) {
//   let service = this.subject();
//   assert.ok(service);
// });

cases([
  {scssSelector:"div[~'text']", result: "//div[text()[contains(normalize-space(.),'text')]]"},
  {scssSelector:"div['text']", result: "//div[text()[normalize-space(.)='text']]"},
  {scssSelector:"div[src='1.png']['text']", result: "//div[@src='1.png'][text()[normalize-space(.)='text']]"},
  {scssSelector:"div[src=\"1.png\"]['text']", result: "//div[@src=\"1.png\"][text()[normalize-space(.)='text']]"},
  {scssSelector:".classname#myid['text']", result: "//*[@id='myid'][contains(@class,'classname')][text()[normalize-space(.)='text']]"},
  {scssSelector:".classname['mytext']", result: "//*[contains(@class,'classname')][text()[normalize-space(.)='mytext']]"},
  {scssSelector:"div.classname['mytext']", result: "//div[contains(@class,'classname')][text()[normalize-space(.)='mytext']]"},
  {scssSelector:".classname1.classname2['mytext']",
    result: "//*[contains(@class,'classname1')][contains(@class,'classname2')][text()[normalize-space(.)='mytext']]"},
  {scssSelector:"div.classname1.classname2['mytext']",
    result: "//div[contains(@class,'classname1')][contains(@class,'classname2')][text()[normalize-space(.)='mytext']]"},
  {scssSelector:".classname1['mytext'] .classname2['mytext']",
    result: "//*[contains(@class,'classname1')][text()[normalize-space(.)='mytext']]/descendant::*[contains(@class,'classname2')][text()[normalize-space(.)='mytext']]"
  },
  {scssSelector:"div.classname1['mytext'] div.classname2['mytext']",
    result: "//div[contains(@class,'classname1')][text()[normalize-space(.)='mytext']]/descendant::div[contains(@class,'classname2')][text()[normalize-space(.)='mytext']]"
  },
  {scssSelector:"#myid div['mytext']", result: "//*[@id='myid']/descendant::div[text()[normalize-space(.)='mytext']]"},
  {scssSelector:"div#myid div['mytext']", result: "//div[@id='myid']/descendant::div[text()[normalize-space(.)='mytext']]"},
  {scssSelector:"div#myid.classname div['mytext']",
    result: "//div[@id='myid'][contains(@class,'classname')]/descendant::div[text()[normalize-space(.)='mytext']]"},
  {scssSelector:"div#main-basket-info-div>ul>li['Тариф']>a", result: "//div[@id='main-basket-info-div']/ul/li[text()[normalize-space(.)='Тариф']]/a"},
  {scssSelector:"li[>h5>strong>a['mytext']]", result: "//li[h5/strong/a[text()[normalize-space(.)='mytext']]]"},
  {scssSelector:"li[>a]", result: "//li[a]"},
  {scssSelector:"li[>a[div]]", result: "//li[a[descendant::div]]"},
  {scssSelector:"tr[1]>td[last()]", result: "//tr[1]/td[last()]"},
  {scssSelector:"img[src~'111.png']", result: "//img[contains(@src,'111.png')]"},
  // {scssSelector:"#showThemesPanel,.genre-filter['text']", result: "//*[@id='showThemesPanel']|//*[contains(@class,'genre-filter')][text()[normalize-space(.)='text']]"},
  {scssSelector:">div.toggle-drop>ul>li>span['Вечером']", result: "//child::div[contains(@class,'toggle-drop')]/ul/li/span[text()[normalize-space(.)='Вечером']]"},
  {scssSelector:"li[10]>div.news-block", result: "//li[10]/div[contains(@class,'news-block')]"},
  {scssSelector:"td[h3>span['Категории, на которые вы уже подписаны']]>div>div", result: "//td[descendant::h3/span[text()[normalize-space(.)='Категории, на которые вы уже подписаны']]]/div/div"},
  // {scssSelector:"tr[span.ng-binding[descendant-or-self::*['{0}']]]", result: "tr[descendant::span[contains(@class,'ng-binding')][descendant-or-self::*[normalize-space(text())='{0}'])]]"},
  {scssSelector:"button[.km-icon.km-email-attachments]+ul", result: "//button[descendant::*[contains(@class,'km-icon')][contains(@class,'km-email-attachments')]]/following-sibling::ul"},
  {scssSelector:"[data-toggle='collapse'][1]", result: "//*[@data-toggle='collapse'][1]"},
  {scssSelector:"input[translate(@type, 'B', 'b')='button']", result: "input[translate(@type, 'B', 'b')='button']"},
  {scssSelector:"div>span[not(a)]", result: "//div/span[not(a)]"},
  {scssSelector:"div>span[position() mod 2 = 1 and position() > 1]", result: "//div/span[position() mod 2 = 1 and position() > 1]"}
]).test('Convert scssSelector Only To Xpath"', function(params, assert) {
  let scssBuilder = this.subject();
  let scssSelector = scssBuilder.parse(params.scssSelector);
  assert.equal(scssSelector.xpath, params.result);
  assert.equal(scssSelector.css, null);
});

cases([  
  {scssSelector:"span[data-bind='text: Title']", result: "//span[@data-bind='text: Title']"},
  {scssSelector:"#searchPreferences button[type='submit']", result: "//*[@id='searchPreferences']/descendant::button[@type='submit']"},
  {scssSelector:"label:contains('Law Firm')", result: "//label[text()[contains(normalize-space(.),'Law Firm')]]"}
]).test('Convert Scss To Xpath', function(params, assert){
  let scssBuilder = this.subject();
  let scssSelector = scssBuilder.parse(params.scssSelector);
  assert.equal(scssSelector.xpath, params.result);
  assert.notEqual(scssSelector.css, null);
});

cases([
  {scssSelector:"#myid", result: "#myid"},
  {scssSelector:"div#myid", result: "div#myid"},
  {scssSelector:"div#myid.classname", result: "div#myid.classname"},
  {scssSelector:".classname", result: ".classname"},
  {scssSelector:"div.classname", result: "div.classname"},
  {scssSelector:".classname1.classname2", result: ".classname1.classname2"},
  {scssSelector:"div.classname1.classname2", result: "div.classname1.classname2"},
  {scssSelector:".classname1 .classname2", result: ".classname1 .classname2"},
  {scssSelector:"div.classname1 div.classname2", result: "div.classname1 div.classname2"},
  {scssSelector:"div[src='1.png']", result: "div[src='1.png']"},
  {scssSelector:"div[src=\"1.png\"]", result: "div[src=\"1.png\"]"},
  {scssSelector:".nav-section>.search-bar", result: ".nav-section>.search-bar"},
  {scssSelector:".nav-section>.search-bar ul", result: ".nav-section>.search-bar ul"},
  {scssSelector:"#js-documentContentArea>div>p:nth-child(1)", result: "#js-documentContentArea>div>p:nth-child(1)"},
  // {scssSelector:"#searchQueryInput,#km_id_search_form_search_hint", result: "#searchQueryInput,#km_id_search_form_search_hint"},
  {scssSelector:"label:contains('Law Firm')", result: "label:contains('Law Firm')"},
  {scssSelector:"span:nth-child(2n+1)", result: "span:nth-child(2n+1)"}
]).test('Convert Scss To Css', function(params, assert){
  let scssBuilder = this.subject();
  let scssSelector = scssBuilder.parse(params.scssSelector);
  assert.equal(scssSelector.css, params.result);
  assert.notEqual(scssSelector.xpath, null);
});

cases([
  {scssSelector:"span:nth-child(2n+1)", result: "span:nth-child(2n+1)"}
]).test('Convert Scss Only ToCss', function(params, assert){
  let scssBuilder = this.subject();
  let scssSelector = scssBuilder.parse(params.scssSelector);
  assert.equal(scssSelector.css, params.result);
});

cases([
  {scssSelector:"div>span", result: ["div",">span"]},
  {scssSelector:"div span", result: ["div"," span"]},
  {scssSelector:"div+span", result: ["div","+span"]},
  {scssSelector:"div  span", result: ["div","  span"]},
  {scssSelector:"div  +span", result: ["div","  +span"]},
  {scssSelector:"div  >span", result: ["div","  >span"]},
  {scssSelector:"div +  span", result: ["div"," +  span"]},
  {scssSelector:"div >  span", result: ["div"," >  span"]},
  {scssSelector:">h5>strong", result: [">h5",">strong"]},
]).test('Split CSS style selector to parts ignoring conditions', function(params, assert){
  let scssBuilder = this.subject();
  let parts = scssBuilder.splitScssToParts(params.scssSelector, " ", ">", "+");
  assert.deepEqual(parts, params.result);
});

cases([
  {scssSelector:"div/span", result: ["div","/span"]},
  {scssSelector:"div//span", result: ["div","//span"]},
  {scssSelector:"div  /span", result: ["div","  /span"]},
  {scssSelector:"div  //span", result: ["div","  //span"]},
  {scssSelector:"div /  span", result: ["div"," /  span"]},
  {scssSelector:"div //  span", result: ["div"," //  span"]}
]).test('Split XPATH style selector to parts ignoring conditions', function(params, assert){
  let scssBuilder = this.subject();
  let parts = scssBuilder.splitScssToParts(params.scssSelector, "/", "//");
  assert.deepEqual(params.result, parts);
});

