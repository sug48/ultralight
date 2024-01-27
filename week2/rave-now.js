//today's date
const now = Date();
const nowISO = new Date(now).toISOString();
console.log(now); //your Date object for the current day/time

const body = document.body;

/*---------------------------------------------------
RAVE NOW  displays a flyer for the rave when, and only when, that rave is happening by querying time on the client side. 

It treats an Are.na channel like a database, making a FETCH request to to that channel via Are.na's API. To minimize data, the call will only return the 20 latest-added items based on the position parameter.

This parse's the blocks title to get the event name, start date-time, and end date-time. It also takes advtanve of Are.na's API returning a block's description text as formatted HTML. You can use Github-flavored Markdown in those descriptions, which will give you control over the presented text on this site.

Block titles must be formatted with "from" and "to" using the template:

Event Name from YYYY/MM/DD 24:00 to YYYY/MM/DD 24:00

---------------------------------------------------*/

// Channel slug is the part of the URL after `https://are.na/username/`
let channelSlug = "rave-now-test";

//rave data
let ravesNow = [];
let raveNow = false;
let howManyRavesNow;

// API call
async function getCollection() {
	const endpoint = "https://api.are.na/v2/channels/" + channelSlug + "/contents?page=1&per=20&sort=positiont&direction=desc";

	const response = await fetch(endpoint);
	let flyers = await response.json();
	console.log("returned ", Object.keys(flyers).length);
	console.log(Object.keys(flyers.contents).length, " flyers in ", flyers.contents);

	flyers = flyers.contents;
	console.log(flyers);

	for ( const flyer of Object.keys(flyers) ) {
		const thisFlyer = flyers[flyer];

		//split block title into date-time pairs
		const blockTitle = thisFlyer.title;
		let titleSplit = blockTitle.split(": ");
		const raveTitle = titleSplit[0].toString();
		console.log(raveTitle);
		const raveTime = titleSplit[1].toString();
		console.log(raveTime);
		titleSplit = raveTime.split(" to ");
		console.log(titleSplit);
		const raveStats = {
			"title": raveTitle,
			"start": titleSplit[0],
			"startISO": new Date(titleSplit[0]).toISOString(),
			"end": titleSplit[1],
			"endISO": new Date(titleSplit[1]).toISOString(),
		}

		//if rave is happening now, report it and log data
		if ( raveStats.startISO <= nowISO && raveStats.endISO >= nowISO) {
			raveNow = true;

			howManyRavesNow = ravesNow.push({
				"title": raveStats.title,
				"start": raveStats.startISO,
				"end": raveStats.endISO,
				"info": thisFlyer.description,
				"img": thisFlyer.image.original.url,
			});
		};

		if ( raveNow != true) {
			howManyRavesNow = ravesNow.push({
				"title": "",
				"start": "",
				"end": "",
				"info": "",
				"img": "/",
			});
		}
	}

	//check if Rave
	updateRave( raveNow );
	console.log('ran update', raveNow);

	// //add our data into HTML placeholders
	displayData( ravesNow );
	console.log('logged data', ravesNow);

	console.log('done');
	return {howManyRavesNow, ravesNow, raveNow};
}


/*---------------------------------------------------
Our functions for using the data with our HTML elements
------------------------------------------------------*/
function displayData(ravesNow){
	ravesNow = ravesNow[0];

	// let nowDiv = document.getElementById('now');
	// nowDiv.innerText = formatDate( now );
	//if (raveNow == true){
		let flyerImg = document.getElementById('flyerImg');
		flyerImg.src = ravesNow.img;
		flyerImg.alt = ravesNow.title;
	
		let raveInfoDiv = document.getElementById('raveInfo');
		raveInfoDiv.innerText = ravesNow.info;
	
		let raveTitleDiv = document.getElementById('raveTitle');
		raveTitleDiv.innerText = ravesNow.title;
	//}


	// let raveStart = document.getElementById('raveStart');
	// raveStart.innerText = ravesNow.start.toString();

	// let raveEnd = document.getElementById('raveEnd');
	// raveEnd.innerText = ravesNow.end.toString();

	// let sunriseTimeReport = document.getElementById('sunriseTime');
	// sunriseTimeReport.innerText = sunriseTime;
}

function updateRave( raveNow ){
	const statusDiv = document.getElementById('status');
	if( raveNow == true ){
		body.dataset.rave = "open";
		statusDiv.innerText = "You can rave now";
	}else {
		body.dataset.rave = "closed";
		statusDiv.innerText = "No";
	}

	const statusDetailDiv = document.getElementById('statusDetail');
	if( raveNow == true ){
		body.dataset.rave = "open";
		statusDetailDiv.innerText = "";
	}else {
		body.dataset.rave = "closed";
		statusDetailDiv.innerText = "Check back soon :)";
	}
}

function updateDayMode(now, sunriseTime, sunsetTime){
	if( now < sunriseTime ){
		body.dataset.mode = "beforedawn";
	}else if( now > sunriseTime && now < sunsetTime ){
		body.dataset.mode = "day";
	}else{
		body.dataset.mode = "afterdusk";
	}
}

/*---------------------------------------------------
Utility functions that help us calculate things
---------------------------------------------------*/
// function hoursToMS( hours ){
// 	// given a number of hours, returns the equivalent milliseconds
// 	// hours * 60 min/hour * 60sec/min * 1000ms/sec
// 	return hours * 60 * 60 * 1000;
// }

function formatDate( date ){
	// see this reference for formatting options:
	// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat#options
	return new Date(date).toLocaleTimeString('default', { timeStyle: 'short' });
}