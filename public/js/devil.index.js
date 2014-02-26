$(document).ready(function() {
  var cityId;
  var currentTurn = 0;
  var isBattle = false;

  var $battleLog = $('#battleLog');
  var $gameLog = $('#gameLog');
  var $timer = $('#timer');

  $('#dungeonIntruder').on('click', function () {
    if ( !confirm('던전 침입 테스트는 현재 1~5명의 영웅이 랜덤하게 침임하도록 만들어졌습니다. 계속하시겠습니까?') ) {
      return;
    }

    $.ajax({
      type: 'POST',
      url: '/devil/monster/intrude',
      // data: { 'monster_id': $(this).data('id') },
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          alert(data.err_msg);
          return;
        }

        for ( var i in data.logs ) {
          $p = $('<p></p>').text(data.logs[i]);
          $gameLog.append($p);
        }

        updateDevil(data.devil);
        // window.location = '/devil';
        return;
      },
      error: function (error) {
        alert(error.err_msg);
        console.log('error:', error);
        return;
      }
    });
  });

  $('buildup').on('click', function () {
    $.ajax({
      type: 'POST',
      url: '/devil/monster/buildup',
      data: { 'monster_id': $(this).data('id') },
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          alert(data.err_msg);
          return;
        }

        console.log('data:', data);
        // window.location = '/devil';
        return;
      },
      error: function (error) {
        alert(error.err_msg);
        console.log('error:', error);
        return;
      }
    });
  });

  $('delete').on('click', function () {
    $.ajax({
      type: 'POST',
      url: '/devil/monster/delete',
      data: { 'monster_id': $(this).data('id') },
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          alert(data.err_msg);
          return;
        }

        window.location = '/devil';
        return;
      },
      error: function (error) {
        alert(error.err_msg);
        console.log('error:', error);
        return;
      }
    });
  });

  $('train').on('click', function () {
    $.ajax({
      type: 'POST',
      url: '/devil/monster/purchase',
      data: { 'monster_id': $(this).data('id') },
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          alert(data.err_msg);
          return;
        }

        window.location = '/devil';
        return;
      },
      error: function (error) {
        alert(error.err_msg);
        console.log('error:', error);
        return;
      }
    });
  });

  $('collect').on('click', function () {
    $.ajax({
      type: 'POST',
      url: '/devil/collect',
      data: { 'colony_id': $(this).data('id') },
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          alert(data.err_msg);
          return;
        }

        window.location = '/devil';
        return;
      },
      error: function (error) {
        console.log('error:', error);
        return;
      }
    });
  });

  var updateDevil = function (data) {
    var curentHp = Number($('#hp').text().split(':')[1].split('/')[0]);
    var curentAp = Number($('#ap').text().split(':')[1].split('/')[0]);

    if ( data.current_health_point !== data.health_point && curentHp !== data.current_health_point ) {
      $p = $('<p></p>').text('HP가 ' + data.current_health_point + '으로 회복되었습니다.');
      $gameLog.append($p);
    }

    if ( data.current_action_point !== data.action_point && curentAp !== data.current_action_point ) {
      $p = $('<p></p>').text('AP가 ' + data.current_action_point + '으로 회복되었습니다.');
      $gameLog.append($p);
    }

    var hp = {
      'percent': ((data.current_health_point/data.health_point)*100) + '%',
      'text': 'HP:' + data.current_health_point + '/' + data.health_point
    };
    var ap = {
      'percent': ((data.current_action_point/data.action_point)*100) + '%',
      'text': 'AP:' + data.current_action_point + '/' + data.action_point
    };

    $('#hp').css('width', hp.percent);
    $('#hp').text(hp.text);
    $('#ap').css('width', ap.percent);
    $('#ap').text(ap.text);
  };

  var updateMonsters = function (monsters) {
    for ( var i in monsters ) {
      var $monster = $('[data-id="monster-hp-'+monsters[i]._id+'"]');
      var $monsterText = $('[data-id="monster-hp-text-'+monsters[i]._id+'"]');

      var text = monsters[i].current_health_point + '/' + monsters[i].health_point;
      var percentage = monsters[i].current_health_point/monsters[i].health_point*100;

      $monster.css('width', (percentage+'%'));
      $monsterText.text(text);
    }
  };

  var trainingCheck = function () {
    $('remainSecondsTraining').each(function () {
      var number = Number($(this).text());
      if ( number !== 0 ) {
        number--;
        $(this).text(number);
      } else {
        $(this).parent().replaceWith( $('<button class="btn btn-block btn-success">훈련완료 (새로고침 필요)</button>') );
      }
    });
  };

  var colonyCheck = function () {
    $('remainSecondsColony').each(function () {
      var number = Number($(this).text());
      if ( number !== 0 && !isNaN(number) ) {
        number--;
        $(this).text(number);
      } else {
        $(this).html( $('<button class="btn btn-xs btn-success">징수가능</button>') );
      }
    });
  };

  var globalTurn = setInterval(function () {
    if ( isBattle ) {
      console.log('전투중');
      return;
    }

    trainingCheck();
    colonyCheck();

    currentTurn++;
    if ( currentTurn >= 60 ) {
      currentTurn = 0;
    }
    $timer.text('TIMER: ' + currentTurn);

    $.ajax({
      type: 'POST',
      url: '/devil/status',
      success: function (data, status) {
        if ( data.result !== 'success' ) {
          return;
        }

        if ( data.devil ) {
          updateDevil(data.devil);

          if ( data.devil.level_up_available ) {
            $('#levelup').removeClass('disabled btn-default').addClass('btn-success').text('레벨업 가능');
          } else {
            $('#levelup').removeClass('btn-success').addClass('disabled btn-default').text('레벨업 불가');
          }
        }

        if ( data.monsters.length !== 0 ) {
          updateMonsters(data.monsters);
        }

        return;
      },
      error: function (error) {
        console.log('error:', error);
        return;
      }
    });
  }, 1000);

  $('#clearLog').on('click', function () {
    $('#gameLog').html('');
    return;
  });

  $('#closeBattle').on('click', function () {
    window.location = '/devil';
    return;
  });

  $(document).on('click', 'attack', function () {
    var isModalOpenButton = ( $(this).data('toggle') ) ? true : false;

    if ( isModalOpenButton ) {
      cityId = $(this).data('city');
      console.log('cityId:', cityId);
      return;
    }

    $p = $('<p></p>').text('전투시작');
    $battleLog.html('').append($p);

    var battleTurn = setInterval(function () {
      isBattle = true;

      $.ajax({
        type: 'POST',
        url: '/devil/attack',
        data: { 'city_id': cityId },
        success: function (data, status) {
          console.log('data:', data);
          if ( data.result === 'error' || data.result === 'fail' ) {
            alert(data.err_msg);
            $('#battleModal').modal('hide');
            window.location = '/devil';
            return;
          }

          for ( var i in data.logs ) {
            $p = $('<p></p>').text(data.logs[i]);
            $battleLog.append($p);
          }

          if ( data.conclusion ) {
            clearInterval(battleTurn);
            $p = $('<p></p>').text('전투종료');
            $battleLog.append($p);
            isBattle = false;
          }
        },
        error: function (error) {
          console.log('error:', error);
          isBattle = false;
          alert('오류');
        }
      });
    }, 1000);
  });

  var updatePosition = function (event, ui) {
    var floor = $(this).data('floor');
    var monster_id = ui.item.data('id');

    $.ajax({
      type: 'POST',
      url: '/devil/monster/position',
      data: { 'monster_id': monster_id, 'floor': floor },
      success: function (data, status) {
        if ( data.result === 'success' ) {
          return;
        }

        alert(data.err_msg);
        return;
      },
      error: function (error) {
        console.log('error:', error);
      }
    });
  };

  $('.space').sortable({
    connectWith: '.space',
    placeholder: "placeholder btn btn-block",
    receive: updatePosition
  });

  $monsters = $('[data-type="monster"]');
  $monsters.sortable({
    connectWith: '.space',
    placeholder: "placeholder btn btn-block",
    receive: updatePosition
  });


  // 소켓
  var socket = io.connect('http://localhost:3000');
  var defenders = {};

  $('#socketBattle').on('click', function () {
    socket.emit('BattleBegin', { 'cityId': cityId });
  });

  $(document).on('click', 'defender', function () {
    var defender_id = $(this).data('id');
    socket.emit('attackBegin', { 'defender_id': defender_id });
  });

  socket.on('attackPlayer', function (data) {
    console.log('attacked');

    var $battleDevil = $('#battleDevil');
    var devil = data.devil;

    var healthPercent = ( (devil.current_health_point / devil.health_point)*100 )+'%';
    var healthText;

    console.log('healthPercent:', healthPercent);

    if ( devil.current_health_point <= 0 ) {
      healthText = '패배';
    } else {
      healthText = devil.current_health_point+'/'+devil.health_point;
    }

    $battleDevil.find('.health').css('width', healthPercent).text(healthText);
    $battleDevil.removeClass('btn-default').addClass('btn-danger disabled');

    for ( var i in data.logs ) {
      $p = $('<p></p>').text(data.logs[i]);
      $battleLog.append($p);
    }

    return;
  });

  socket.on('attackDone', function (data) {
    var defender = data.soldier;
    var $thisDefender = $('[data-id="'+defender._id+'"]');

    var healthPercent = ( (defender.current_health_point / defender.health_point)*100 )+'%';
    var healthText;

    if ( defender.current_health_point <= 0 ) {
      delete defenders[defender._id];
      console.log('defenders:', defenders);
      healthText = '패배';
    } else {
      healthText = defender.current_health_point+'/'+defender.health_point;
    }
    $thisDefender.find('.health').css('width', healthPercent).text(healthText);

    if ( defender.current_health_point <= 0 ) {
      $thisDefender.appendTo($thisDefender.parent()).removeClass('btn-default').addClass('btn-danger disabled');
    }

    for ( var i in data.logs ) {
      $p = $('<p></p>').text(data.logs[i]);
      $battleLog.append($p);
    }

    return;
  });

  socket.on('battleReady', function (data) {
    var devil = data.devil;

    for ( var i in data.defenders ) {
      defenders[data.defenders[i]._id] = data.defenders[i];
    }

    for ( i in data.defenders ) {
      var defender = data.defenders[i];

      var $defender = $('<defender data-id="'+defender._id+'" class="btn btn-default">'+defender.name+'<br /></defender>');
      var $img = $('<img src="http://lorempixel.com/100/100/people">');
      var $healthGauge = $('<div class="health" style="background-color: green;">HP: '+defender.current_health_point+'/'+defender.health_point+'</div>');
      var healthPercent = ((defender.current_health_point / defender.health_point)*100)+'%';

      $healthGauge.css('width', healthPercent);
      $defender.append($img).append($healthGauge);
      // $defender.on(});

      $('#battleGround').append($defender);
    }
  });

});