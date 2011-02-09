// ==UserScript==
// @name           radiatr
// @namespace      me.fabiopereira
// @include        file:///*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @require   http://ajax.googleapis.com/ajax/libs/jqueryui/1.5.2/jquery-ui.min.js
// @require   http://timeago.yarp.com/jquery.timeago.js
// @require   jquery.fitTextToHeight.js

// ==/UserScript==
//

refresh();

function refresh() {
  ping();
  hudson();
  hudsonFull();
  userFeedback();
  scale();
  setTimeout(refresh, 3000);
}

function scale() {
	var importantItems = $('.failure .subject').length + $('.building .subject').length;
	var boringItems = $('.success .subject').length;
	var windowHeight = $(window).height();
	
	//percentage of screen to devote to Building and Failed builds:
	var sizer = 0.2;
	var precedence = 0.65;
	var subjectScaleMultiplier = 4;
	var statusScaleMultiplier = 2;
	var commentScaleMultiplier = 3;
	var itemParts = subjectScaleMultiplier + 
					statusScaleMultiplier +
					commentScaleMultiplier;
	
	
	if (importantItems !== 0) {
		var pixelsPerImportant = (windowHeight / (importantItems + boringItems)) * (1 + sizer);
		var pixelsPerBoring = (windowHeight - (importantItems * pixelsPerImportant)) / boringItems;

		var importantScale = pixelsPerImportant / itemParts;
		var boringScale = pixelsPerBoring / itemParts;

						
		$('.success .subject').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (boringScale * subjectScaleMultiplier), fontAdjustIncrement: 1});
		$('.success .statusInWords').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (boringScale * statusScaleMultiplier), fontAdjustIncrement: 1});
		$('.success .changeSetComment').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (boringScale * commentScaleMultiplier), fontAdjustIncrement: 1});

					
		$('.failure .subject').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * subjectScaleMultiplier), fontAdjustIncrement: 1});
		$('.failure .statusInWords').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * statusScaleMultiplier), fontAdjustIncrement: 1});
		$('.failure .changeSetComment').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * commentScaleMultiplier), fontAdjustIncrement: 1});

					
		$('.building .subject').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * subjectScaleMultiplier), fontAdjustIncrement: 1});
		$('.building .statusInWords').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * statusScaleMultiplier), fontAdjustIncrement: 1});
		$('.building .changeSetComment').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (importantScale * commentScaleMultiplier), fontAdjustIncrement: 1});
		
		
		$('.building').filter(':not(:animated)').effect("pulsate", {times: 1}, 2000);		
	
	} else {
		
		pixelsPerItem = (windowHeight) / boringItems;
		itemScale = pixelsPerItem / itemParts;

		$('.success .subject').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (itemScale * subjectScaleMultiplier), fontAdjustIncrement: 1});
		$('.success .statusInWords').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (itemScale * statusScaleMultiplier), fontAdjustIncrement: 1});
		$('.success .changeSetComment').fitTextToHeight({verticallyCentered: false, maxScrollHeight: (itemScale * commentScaleMultiplier), fontAdjustIncrement: 1});
	}
}



function ping() {
  $('.ping').each(function () {
    GM_xmlhttpRequest({
      method: 'GET',
      url: $('#' + $(this).attr('id') + ' a').attr('href'),
      id: $(this).attr('id'),
      onload: function(response) {
          if (response.status == 200) {
              $('#' + this.id).addClass('success').removeClass('failure');
              $('#' + this.id + ' span.statusInWords').text('is Online');
          }
          else {
              $('#' + this.id).addClass('failure').removeClass('success');
              $('#' + this.id + ' span.statusInWords').text('is Offline');
          }
      }
    });
   }
  );
}
 
function getClaimObject(json) {
  for(var i = 0, n = json.actions.length; i < n; i++) {
	 if(json.actions[i].claimed) {
		return json.actions[i];
	 }
  }
  return null;
}

function hudson() {
  $('.hudson').each(function () {
    GM_xmlhttpRequest({
     method: 'GET',
     url: $('#' + $(this).attr('id') + ' a').attr('href') + '/lastBuild/api/json',
     baseUrl: $('#' + $(this).attr('id') + ' a').attr('href'),
     id: '#' + $(this).attr('id'),
     onload: function(response) {
	   var status = JSON.parse(response.responseText);
	  
	   updateClass(status, $(this.id))
	   
			   
	  
	 	   
		var statusInWords = message(status) + '&nbsp;' + duration(status, this.id) + differentialTime(status.timestamp);
       $(this.id + ' span.statusInWords').html(statusInWords);
	    var changeSetComment = status.changeSet.items.length > 0 ? status.changeSet.items[0].comment : "Missing Comment!";
       $(this.id + " span.changeSetComment").html(changeSetComment.substring(0, 140));
       var claim = getClaimObject(status);
       if(claim)
       {
         $(this.id + " span.claim").html("Claimed by " + claim.claimedBy + " because " + claim.reason);
       }
	   if(!claim)
	   {
		 $(this.id + " span.claim").css('display', 'hidden');

	   }
    }
   });
  });
}

function hudsonFull() {
  $('.hudson').each(function () {
    GM_xmlhttpRequest({
     method: 'GET',
     url: $('#' + $(this).attr('id') + ' a').attr('href') + 'api/json',
     baseUrl: $('#' + $(this).attr('id') + ' a').attr('href'),
     id: '#' + $(this).attr('id'),
     onload: function(response) {
	    var status = JSON.parse(response.responseText);
		if(status.healthReport) {
			$(this.id + ' span.healthScore').html( status.healthReport[0].score );
			$(this.id + ' span.healthScore').css("opacity", (status.healthReport[0].score / 100 ));
			$(this.id + ' span.healthScore').css("font-size", $(this.id + ' span.statusInWords').css("font-size") );
		}
	 }
   });
  });
}

function updateClass(status, id) {
	if (status.building) {
		if(!id.hasClass('building')) {
			appendBuilding(id);
		}
		return;
	}
	clearClasses(id, status);
    id.addClass(classToUpdate(status));	
	return;
}
function appendBuilding(id) {
	id.addClass('building');
	
}

function classToUpdate(status, url) {
	if (isSuccess(status)) {
        return 'success';
    } else {
        return 'failure';
    }
}

function clearClasses(id, status) {
  id.removeClass('building').
     removeClass('failure').
     removeClass('success').
     removeClass('buildingFromFailedBuild');
}

function isSuccess(status) {
  return status.result == 'SUCCESS';
}

function message(status) {
  if (status.building) {
      return ' started building';
  } else if (isSuccess(status)) {
      return ' passed';
  } else {
      return numberOfFailures(status) + ' failed';
  }
}

function numberOfFailures(status) {
  var failCount = '0';
  $.each(status.actions, function(i,item){
              if (item.failCount){
           failCount = item.failCount;
    }
  });
  return failCount;
}

function duration(status, idPrefix) {
  if (status.building) {
      return '';
  }
  var duration = Math.round((status.duration / 1000 / 60));
  return 'after ' + duration + ' minutes &nbsp;-&nbsp;';

}

function userFeedback() {
  $('.userFeedback').each(function () {
  });
}

function differentialTime(date) {

  timezoneFix = 0 * 60 * 60 * 1000;
  now = new Date()
  diff = now - date + timezoneFix
  millisecondsInDay = 24 * 60 * 60 * 1000
  millisecondsInHour = 60 * 60 * 1000
  millisecondsInMinute = 60 * 1000
  days = 0;
  hours = 0;
  minutes = 0;
  if (diff > millisecondsInDay) {
    days = Math.floor(diff / millisecondsInDay)
    diff = diff - days * millisecondsInDay
  }
  if (diff > millisecondsInHour) {
      hours = Math.floor(diff / millisecondsInHour)
      diff = diff - hours * millisecondsInHour
  }
  if (diff > millisecondsInMinute) {
      minutes = Math.floor(diff / millisecondsInMinute)
  }
  var s = ""
  if (days > 0) {
      s = ", " + days + " day" + (days > 1 ? "s" : "")
  }
  if (hours > 0) {
      s += ", " + hours + " hour" + (hours > 1 ? "s" : "")
  }
  if (minutes > 0 && days == 0) {
      //s += ", " + minutes + " minutes" + (minutes>1 ? "s" : "")
      s += ", " + minutes + " min"
  }
  if (s == "") {
      s = "less than 1 minute ago"
  } else {
      s = s.substring(2) + " ago"
  }
  return s;
}

 
