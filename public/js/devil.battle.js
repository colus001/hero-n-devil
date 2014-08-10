function mob (object) {
  this.name = object.name;
}

$(document).ready(function() {
  var $battleLog = $('#battleLog');
  var devil;
  var defenders = {};
  var result = {
    'devil': {},
    'defeated': [],
    'experience': 0
  };

  $(document).on('click', 'attack', function () {
    var isModalOpenButton = ( $(this).data('toggle') ) ? true : false;

    if ( isModalOpenButton ) {
      cityId = $(this).data('city');
      console.log('cityId:', cityId);
      return;
    }

    $p = $('<p></p>').text('전투시작');
    $battleLog.html('').append($p);

    $.ajax({
      type: 'POST',
      url: '/devil/battle',
      data: { 'city_id': cityId },
      success: function (data, status) {
        if ( data.result === 'error' || data.result === 'fail' ) {
          alert(data.err_msg);
          $('#battleModal').modal('hide');
          window.location = '/devil';
          return;
        }

        devil = data.devil;

        for ( var j in data.defenders ) {
          defenders[data.defenders[j]._id] = data.defenders[j];
        }

        var count = 0;

        for ( var i in defenders ) {
          var intervalTime = getIntervalFromAtackSpeed(defenders[i].attack_speed_per_sec);
          var random = Math.floor(Math.random()*100+1) / 100;
          console.log('random:', random);
          setTimeout(null, intervalTime*random);
          defenders[i].interval = setInterval(function() {
            console.log(count);
            console.log('defenders['+i+'] attacked');
          }, intervalTime);
          count++;
          var $defender = $('<defender data-id="'+defenders[i]._id+'" class="btn btn-default">'+defenders[i].name+'<br /></defender>');
          var $img = $('<img src="http://lorempixel.com/100/100/people">');
          var $healthGauge = $('<div class="health" style="background-color: green;">HP: '+defenders[i].current_health_point+'/'+defenders[i].health_point+'</div>');
          var healthPercent = ((defenders[i].current_health_point / defenders[i].health_point)*100)+'%';

          $healthGauge.css('width', healthPercent);
          $defender.append($img).append($healthGauge);

          $('#battleGround').append($defender);
        }
      },
      error: function (error) {
        console.log('error:', error);
        isBattle = false;
        alert('오류');
      }
    });

    $(document).on('click', 'defender', function () {
      var $this = $(this);
      var order = $this.data('id');
      var defender = defenders[order];
      var log, healthText, healthPercent;

      attack(devil, defenders[order], $battleLog);
      healthPercent = ( (defenders[order].current_health_point / defenders[order].health_point)*100 )+'%';

      if ( defenders[order].current_health_point <= 0 ) {
        result.defeated.push(defenders[order]);
        result.experience += defenders[order].experience;
        healthText = '패배';
      } else {
        healthText = defenders[order].current_health_point+'/'+defenders[order].health_point;
      }

      $this.find('.health').css('width', healthPercent).text(healthText);

      if ( defenders[order].current_health_point <= 0 ) {
        $this.appendTo($this.parent()).removeClass('btn-default').addClass('btn-danger disabled');
        clearInterval(defenders[order].interval);
        delete defenders[order];
      }

      if ( getObjectLength(defenders) === 0 ) {
        console.log('승리!');
        console.log('result:', result);
      }
    });

  });

});