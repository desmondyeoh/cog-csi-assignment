
var DELAY = 700;
var SHOT_PER_PIC = 3;

var sessID = '';
var numPics = 16;
var ary = [];
var ary_copy = [];
var interval = null;
var counter = 0;
var counter2 = 0;
var interval2 = 0;
var snapshots = [];

var base_url = 'https://emo-eat.herokuapp.com/emo/'

$(document).ready(function() {
	hinit([2,3]);
	setupWebcam();

	$('#ready-btn').click(function() {
		$('#ready-btn').hide()
		start();
	});


});

function guid() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
}

function start() {
	sw(1,2);

	ary = Array.apply(null, Array(numPics)).map( (_, i )=> i+1);
	ary = shuffle(ary);
	ary_copy = ary.slice();
	console.log(ary);

	counter = 0;
	$('#food-img').show();
	$('#results').hide();
	// $('#food-img').attr("src", "img/f{0}.jpg".format(ary.pop()));
	$('#results').html('');
	snapshots = [];

	sessID = guid()
	fetch(base_url + 'init', {
		body: JSON.stringify({id: sessID, ss: SHOT_PER_PIC, tt: numPics}),
		headers: {'content-type': 'application/json'},
		method: 'POST'
	}).then(()=> {
		$('#waiting-init').hide();
		interval = setInterval(playImg, DELAY);
	});
	
}


function playImg() {
	// console.log(counter + " " + ary.length);
	if (ary.length <= 0 && counter % (SHOT_PER_PIC + 2) == 0) {
		console.log("Finish!");
		clearInterval(interval);
		finishPlayImg();
	} else {

		if (counter % (SHOT_PER_PIC + 2) == 0) {
			console.log(counter + "Chg!");
			var imgIndex = ary.pop();
			$('#food-img').attr("src", "{0}img/f{1}.jpg".format(static_url, imgIndex));
			console.log("STATICCC " + static_url)
			$('#results').append(
				$('<br/><img src="{0}img/f{1}.jpg"/>'.format(static_url, imgIndex))
			);

		} else if (counter % (SHOT_PER_PIC + 2) == 1) {

			console.log("Wait");
			
		} else {
			console.log("Snap!");
			take_snapshot();
		}

		counter ++;
	}
}



function finishPlayImg() {
	sw(2,3);
	$('#results').hide();
	$('#food-img').hide();		
	$('#done-loading').hide();

	var resLength = 0;
	var resAry = [];

	var getResInterval = setInterval(function() {
		if (resLength < numPics) {	
			fetch(base_url + 'result', {
				body: JSON.stringify({ 
					id: sessID
				}),
				headers: {
					'content-type': 'application/json'
				},
				method: 'POST'
			}).then(res => res.json())
			.then(res => { 
				resLength = res.result.length;
				resAry = res.result;
				console.log(res.result); 

			});
		} else {
			clearInterval(getResInterval);
			$('#loading-thing').hide();
			$('#results').show();
			$('#done-loading').show();
			showApiResults(resAry);
		}
	}, 1000);
}

function showApiResults(resultAry) {
	ary_copy = ary_copy.reverse();
	console.log(resultAry);
	console.log(ary_copy);
	$('#api-results').html("");
	for (var i = 0; i < resultAry.length; i ++) {
		$('#api-results').append(
			$('<li><br/><img src="{0}img/f{1}.jpg"/></li>'.format(static_url, ary_copy[resultAry[i]]))
		);
	}
}

function setupWebcam() {
	Webcam.set({
		width: 240,
		height: 180,
		image_format: 'jpeg',
		jpeg_quality: 90
	});
	Webcam.attach('#my-camera');
}


function take_snapshot() {
	Webcam.snap( function (data_uri) {
		snapshots.push(data_uri);
		$('#results').append(
			$("<img src=\"" + data_uri + "\"/>")
		);
	})
	fetch(base_url + 'upload', {
		body: JSON.stringify({
			ses: sessID,
			spp: SHOT_PER_PIC,
			lbl: snapshots.length - 1,
			img: snapshots[snapshots.length - 1]
		}),
		headers: {
			'content-type': 'application/json'
		},
		method: 'POST'
	});
}


$('#next-btn').click(function() {
	if (ary.length > 0) {
		$('#food-img').attr("src", "img/f{0}.jpg".format(ary.pop()));
	} else {
		$('#next-btn').css('display', 'none');
		$('#food-img').css('display', 'none');
	}
});


function hinit(arr) {
	for (var i = 0; i < arr.length; i++){
		$('#scn' + arr[i]).hide();
	}
}


function sw(frm, to) {
	$('#scn' + frm).hide();
	$('#scn' + to).show();
}


function begEnd() {
	// var pick_tmp = `
	// 	<div class="form-check">
	// 	  <input class="form-check-input" type="radio" name="{0}" id="{0}{1}" value="{2}">
	// 	  <label class="form-check-label" for="{0}{1}">
	// 	    {2}
	// 	  </label>
	// 	</div>
	// `;
	var pick_tmp = `
		<div class="form-group">
			<select class="form-control" name="{0}" id="{0}">
				{1}
			</select>
		</div>
	`;

	var opt_tmp = `
		<option>{0}</option>
	`;
	var all = '<div>';
	var citynames = Object.keys(cities['cities']);

	all += '<h4>Beginning city:</h4>';
	var inside = "";
	for (var i = 0; i < citynames.length; i++) {
		inside += opt_tmp.format(citynames[i]);
	}
	all += pick_tmp.format('begin-city', inside);


	all += '<h4>Ending city:</h4>';
	var inside = "";
	for (var i = 0; i < citynames.length; i++) {
		inside += opt_tmp.format(citynames[i]);
	}
	all += pick_tmp.format('end-city', inside);

	all += '</div>';
	$("#scn2body").append($(all));
}


function predict(){
	console.log('change!')
	$that = $(this);
	console.log($that)
	$.get(loc.format($that.val()), function(data) {
		console.log('data!')
		var placedesc = data['predictions'][0]['description'];
		var placeid = data['predictions'][0]['place_id'];
		var index = $that.attr('id').substring(4);
		$('#city{0}-cr'.format(index)).html(placedesc);
		$('#city{0}-cr'.format(index)).data("placeid", placeid);
	});
}


function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


String.prototype.format = function () {
    var a = this;
    for (var k in arguments) {
        a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
    }
    return a
}