
var SHOT_DELAY = 500;
var SHOT_PER_PIC = 3;

var numPics = 16;
var ary = [];
var interval = null;
var counter = 0;
var counter2 = 0;
var interval2 = 0;
var snapshots = [];

$(document).ready(function() {
	setupWebcam();

	$('#ready-btn').click(function() {
		$('#ready-btn').hide()
		start();
	});


});


function start() {

	ary = Array.apply(null, Array(numPics)).map( (_, i )=> i+1);
	ary = shuffle(ary);
	console.log(ary);

	counter = 0;
	$('#food-img').show();
	$('#results').hide();
	// $('#food-img').attr("src", "img/f{0}.jpg".format(ary.pop()));

	interval = setInterval(playImg, SHOT_DELAY);

	
}


function playImg() {
	// console.log(counter + " " + ary.length);
	if (ary.length <= 0 && counter % SHOT_PER_PIC == 0) {
		console.log("Finish!");
		clearInterval(interval);
		finishPlayImg();
	} else {
		if (counter % SHOT_PER_PIC == 0) {
			console.log(counter + "Chg!");
			var imgIndex = ary.pop();
			$('#food-img').attr("src", "img/f{0}.jpg".format(imgIndex));

			$('#results').append(
				$('<img src="img/f{0}.jpg"/>'.format(imgIndex))
			);
		}
		take_snapshot();
		console.log("Snap!")

		counter ++;
	}
}


function finishPlayImg() {
	$('#food-img').hide();
	$('#results').show();
	$('#ready-btn').show();
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
		) ;
	})
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