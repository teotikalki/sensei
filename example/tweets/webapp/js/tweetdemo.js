var host="localhost";
var port=8080;

var tweeterSel={"values":[]};
var hashtagSel={"values":[]};
var timeRangeSel={"values":[]};

var selmap = {"timeRange":timeRangeSel,"tweeter":tweeterSel,"hashtags":hashtagSel};

var valmap = {"timeRange":{"000000100":"Last Minute","000010000":"Last Hour","001000000":"Last Day"}}

var senseiReq = {};

senseiReq.fetchStored = true;

senseiReq.sort = [{"time":"desc"},"_score"];

senseiReq.selections = [
{
  "terms":{
    "timeRange":timeRangeSel
  }
},
{
  "terms":{
    "tweeter":tweeterSel
  }
},
{
  "terms":{
    "hashtags":hashtagSel
  }
}
];

senseiReq.facets = {};

senseiReq.facets.timeRange={"expand":true};

senseiReq.facets.tweeter={"expand":true};

senseiReq.facets.hashtags={"expand":true};

setSenseiQueryString(senseiReq,"");

var repVal = function(arr,s){
  var found =false;
  for (var i=0;i<arr.length;++i){
    if (s==arr[i]){
        arr.splice(i,1);
        found = true;
        break;
    }
  }
  if (!found){
    arr.push(s);
  }
}

function handleSelected(name,facetVal){
	var sel = selmap[name];
	var valArray = sel["values"];
	repVal(valArray,facetVal.value);
	doSearch();
}

function renderFacet(name,facet){
	var node = $("#"+name);
	if (node != null){
		node.empty();
		for (var i=0;i<facet.length;++i){
			var html;
			var facetVal = facet[i].value;
			var val = valmap[name];
			if (val !== undefined){
			  facetVal = val[facetVal]
			}

			html = '<input type="checkbox"> '+facetVal+' ('+facet[i].count+')</input>';
			node.append(html);
			var obj = node.children().last().get(0);
			obj._name = name;
			obj._facetVal = facet[i];
			if (facet[i].selected){
				obj.checked ="checked";
			}
			node.children().last().click(function(e){
				handleSelected(this._name,this._facetVal);
			});

			node.append('<br/>');
		}
	}
}

function renderHits(hits){
	$('#results').empty();
	for (var i=0;i<hits.length;++i){
		var html = '<div class="row">';
    	var hit = hits[i];

		html += '<div class="span3">'+hit._uid+"</div>"

		html += '<div class="span3">'+hit._score+"</div>"

    var date = new Date(hit.time*1000);
		html += '<div class="span3">'+date+'</div>'

    var srcdata = extractSrcData(hit);
    
    var tweet = srcdata.tweet;
    var user = tweet.user;
    var imgUrl = user.profile_image_url_https;
    var text = tweet.text;


    var tweeter = srcdata.tweeter;

    html += '<div class="span3"><a href="'+imgUrl+'"><img src="'+imgUrl+'"/></a></div>';

    html += '<div class="span6">'+tweeter+'<br/>'+text+'</div>';
		html += '</div>';
    $('#results').append(html);
    console.log(srcdata.tweet);
  }
}

function renderPage(senseiResult){
	console.log(senseiResult.numhits)

	$("#numhits").empty();
	$("#numhits").append(senseiResult.numhits);


	$("#totaldocs").empty();
	$("#totaldocs").append(senseiResult.totaldocs);

	var facets = senseiResult.facets;

	for (var name in facets){
		renderFacet(name,facets[name])
	}

  renderHits(senseiResult.hits);
    
}

function doSearch(){
  console.log("req: "+senseiReq);
	executeSenseiReq(host,port,senseiReq,renderPage);
}


function updateTextQuery(){
	var q = $('#qbox').val();
	setSenseiQueryString(senseiReq,q);
	doSearch();
}

function resetAll(){
	$('#qbox').val("");
  senseiReq.selections = [];
  setSenseiQueryString(senseiReq,"");
  doSearch();
}
