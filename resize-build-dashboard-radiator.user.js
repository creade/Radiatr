// ==UserScript==
// @name           build-dashboard-radiator
// @namespace      me.fabiopereira
// @include        file:///*
// @require   http://ajax.googleapis.com/ajax/libs/jquery/1.2.6/jquery.js
// @require   http://timeago.yarp.com/jquery.timeago.js
// ==/UserScript==
//

refresh();

function refresh() {
  ping();
  hudson();
  userFeedback();
  scale();
  setTimeout(refresh, 3000);
}

function scale() {
	var importantItems = $('.failure .subject').length + $('.building .subject').length;
	var boringItems = $('.success .subject').length;
	if (importantItems != 0) {

		windowHeight = $(window).height();

		pixelsPerImportant = (windowHeight * (2 / 3)) / importantItems;
		importantScale = pixelsPerImportant / 6;

		pixelsPerBoring = (windowHeight * (1 / 3)) / boringItems;
		boringScale = pixelsPerBoring / 6;




		$('.success .subject').css("font-size", boringScale * 2)
		$('.success .statusInWords ').css("font-size", boringScale)
		$('.success .changeSetComment').css("font-size", boringScale)

					
		$('.failure .subject').css("font-size", Math.min(importantScale * 2, 160))
		$('.failure .statusInWords ').css("font-size", Math.min(importantScale, 80))
		$('.failure .changeSetComment').css("font-size", Math.min(importantScale, 80))

					
		$('.building .subject').css("font-size", Math.min(importantScale * 2, 160))
		$('.building .statusInWords ').css("font-size", Math.min(importantScale, 80))
		$('.building .changeSetComment').css("font-size", Math.min(importantScale, 80))

	} else {
		windowHeight = $(window).height();;

		pixelsPerItem = (windowHeight) / boringItems;
		itemScale = pixelsPerItem / 6;

		$('.success .subject').css("font-size", itemScale * 2)
		$('.success .statusInWords ').css("font-size", itemScale)
		$('.success .changeSetComment').css("font-size", itemScale)
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
       var status = eval('(' + response.responseText + ')');
       clearClasses($(this.id), status);
       $(this.id).addClass(classToUpdate(status));               
       var statusInWords = message(status) + '&nbsp;' + duration(status, this.id) + differentialTime(status.timestamp);
       $(this.id + ' span.statusInWords').html(statusInWords);
	    var changeSetComment = status.changeSet.items.length > 0 ? status.changeSet.items[0].comment : "Missing Comment!";
       $(this.id + " span.changeSetComment").html(changeSetComment.substring(0, 140));
       var claim = getClaimObject(status);
       if(claim)
       {
         $(this.id + " span.claim").html("Claimed by " + claim.claimedBy + " because " + claim.reason);
       }
    }
   });
  });
}

function classToUpdate(status, url) {
    if (status.building) {
        return 'building';
    } else if (isSuccess(status)) {
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

 
