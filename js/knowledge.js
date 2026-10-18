/* ============================================================
   ЗАНЯТИЕ 7. jQuery UI + EmailJS
   ЗАДАНИЕ 6. Bootstrap Progress вместо jQuery UI Progressbar
   ============================================================ */

$(function () {

  /* ===== EmailJS инициализация ===== */
  emailjs.init('_ERnXmZ8oVcu3LsRR');

  const SERVICE_ID  = 'service_kwbfmf4';
  const TEMPLATE_ID = 'template_7s557ji';

  /* ===== Задание 2. Datepicker ===== */
  $('#check-date').datepicker({
    dateFormat: 'dd.mm.yy',
    firstDay: 1,
    monthNames: ['Январь','Февраль','Март','Апрель','Май','Июнь',
                 'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    dayNamesMin: ['Вс','Пн','Вт','Ср','Чт','Пт','Сб']
  });

  /* ===== Задание 3. Accordion ===== */
  $('#questions-accordion').accordion({
    collapsible: true,
    heightStyle: 'content',
    active: 0
  });

  /* ===== Задание 4. Slider ===== */
  $('#self-assessment-slider').slider({
    range: 'min',
    min: 1,
    max: 10,
    value: 5,
    slide: function (event, ui) {
      $('#slider-value').text(ui.value);
    }
  });

  const totalQuestions = 10;

  /* ============================================================
     Задание 6. Bootstrap Progress вместо jQuery UI Progressbar
     ============================================================ */
  function updateProgress() {
    let answered = 0;
    for (let i = 1; i <= totalQuestions; i++) {
      if ($('input[name="q' + i + '"]:checked').length > 0) {
        answered++;
      }
    }
    const percent = Math.round((answered / totalQuestions) * 100);

    const $bar = $('#quiz-progressbar-fill');
    if ($bar.length) {
      $bar.css('width', percent + '%');
      $bar.parent().attr('aria-valuenow', percent);
    }

    $('#progress-text').text(answered + ' из ' + totalQuestions + ' (' + percent + '%)');
  }

  $(document).on('change', 'input[type="radio"]', updateProgress);

  /* ===== Задание 5. Sortable ===== */
  $('#sortable-steps').sortable({
    placeholder: 'ui-state-highlight',
    cursor: 'grabbing',
    opacity: 0.8
  });
  $('#sortable-steps').disableSelection();

  $('#check-order-btn').on('click', function () {
    let isCorrect = true;
    $('#sortable-steps .sortable-item').each(function (index) {
      const expected = index + 1;
      const actual = parseInt($(this).attr('data-step'), 10);
      if (actual !== expected) isCorrect = false;
    });

    const $result = $('#sort-result');
    if (isCorrect) {
      $result.css('color', '#16a34a').text('Верно! Шаги расставлены в правильной последовательности.');
    } else {
      $result.css('color', '#dc2626').text('Есть ошибки. Попробуйте переставить шаги иначе.');
    }
  });

  /* ===== Задание 6. Dialog ===== */
  $('#result-dialog').dialog({
    autoOpen: false,
    modal: true,
    width: 520,
    resizable: false,
    show: { effect: 'fade', duration: 250 },
    buttons: {
      'Закрыть': function () { $(this).dialog('close'); }
    }
  });

  /* ===== Задание 8. Подсчёт результатов ===== */
  const correctAnswers = {
    q1: 'b', q2: 'b', q3: 'a',
    q4: 'a', q5: 'b', q6: 'c',
    q7: 'a', q8: 'b', q9: 'c', q10: 'a'
  };

  $('#check-all-results-btn').on('click', function () {
    let score = 0;
    for (let i = 1; i <= totalQuestions; i++) {
      const val = $('input[name="q' + i + '"]:checked').val();
      if (val && val === correctAnswers['q' + i]) score++;
    }

    const percent = Math.round((score / totalQuestions) * 100);

    let level, levelColor;
    if (percent >= 80)      { level = 'Высокий';            levelColor = '#16a34a'; }
    else if (percent >= 50) { level = 'Удовлетворительный'; levelColor = '#d97706'; }
    else                    { level = 'Низкий';             levelColor = '#dc2626'; }

    const selfAssessment = $('#self-assessment-slider').slider('value');

    let isSortCorrect = true;
    $('#sortable-steps .sortable-item').each(function (index) {
      if (parseInt($(this).attr('data-step'), 10) !== index + 1) isSortCorrect = false;
    });

    const html =
      '<p><strong>1. Результаты теста:</strong><br>' +
      'Правильных ответов: <strong>' + score + ' из ' + totalQuestions + '</strong><br>' +
      'Процент выполнения: <strong>' + percent + '%</strong><br>' +
      'Уровень: <span style="color: ' + levelColor + '; font-weight: 700;">' + level + '</span></p>' +
      '<p style="margin-top: 12px;"><strong>2. Порядок шагов:</strong> ' +
        (isSortCorrect
          ? '<span style="color: #16a34a; font-weight: 600;">Верно</span>'
          : '<span style="color: #dc2626; font-weight: 600;">Есть ошибки</span>') + '</p>' +
      '<p style="margin-top: 12px;"><strong>3. Самооценка:</strong> ' + selfAssessment + ' из 10</p>';

    $('#dialog-content-text').html(html);
    $('#result-dialog').dialog('open');
  });

  /* ===== Задание 7. Валидация ===== */
  function validateField($input, errorId, condition) {
  const $error = $('#' + errorId);
  if (condition) {
    $input.removeClass('is-invalid').addClass('is-valid');
    $error.hide();
    return true;
  } else {
    $input.removeClass('is-valid').addClass('is-invalid');
    $error.show();
    return false;
  }
}

  $('#student-name').on('input blur', function () {
    const val = $(this).val().trim();
    const nameRegex = /^[А-Яа-яЁёA-Za-z\s\-]+$/;
    const isValid = val.length >= 2 && nameRegex.test(val);
    validateField($(this), 'error-student-name', isValid);
  });

  $('#student-group').on('input blur', function () {
    const val = $(this).val().trim();
    const groupRegex = /^[А-Яа-яЁёA-Za-z0-9\-]+$/;
    const isValid = val.length > 0 && groupRegex.test(val);
    validateField($(this), 'error-student-group', isValid);
  });

  $('#check-date').on('change blur', function () {
    validateField($(this), 'error-check-date', $(this).val().trim().length > 0);
  });

  $('#check-number').on('input blur', function () {
    const val = parseInt($(this).val(), 10);
    validateField($(this), 'error-check-number', !isNaN(val) && val >= 1 && val <= 10);
  });

  $('#student-email').on('input blur', function () {
    const val = $(this).val().trim();
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    validateField($(this), 'error-student-email', regex.test(val));
  });

  /* ===== Задание 9. Submit + EmailJS ===== */
  $('#knowledge-form').on('submit', function (e) {
    e.preventDefault();

    const nameVal  = $('#student-name').val().trim();
    const groupVal = $('#student-group').val().trim();
    const dateVal  = $('#check-date').val().trim();
    const numVal   = parseInt($('#check-number').val(), 10);
    const emailVal = $('#student-email').val().trim();
    const emailRe  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let valid = true;
    const nameRegex = /^[А-Яа-яЁёA-Za-z\s\-]+$/;
    const groupRegex = /^[А-Яа-яЁёA-Za-z0-9\-]+$/;

    if (nameVal.length < 2 || !nameRegex.test(nameVal)) {
      validateField($('#student-name'), 'error-student-name', false);
      valid = false;
    } else {
      validateField($('#student-name'), 'error-student-name', true);
    }

    if (groupVal.length === 0 || !groupRegex.test(groupVal)) {
      validateField($('#student-group'), 'error-student-group', false);
      valid = false;
    } else {
      validateField($('#student-group'), 'error-student-group', true);
    }

    if (dateVal.length === 0) {
      validateField($('#check-date'), 'error-check-date', false);
      valid = false;
    } else {
      validateField($('#check-date'), 'error-check-date', true);
    }

    if (isNaN(numVal) || numVal < 1 || numVal > 10) {
      validateField($('#check-number'), 'error-check-number', false);
      valid = false;
    } else {
      validateField($('#check-number'), 'error-check-number', true);
    }

    if (!emailRe.test(emailVal)) {
      validateField($('#student-email'), 'error-student-email', false);
      valid = false;
    } else {
      validateField($('#student-email'), 'error-student-email', true);
    }

    if (!valid) {
      alert('Пожалуйста, исправьте ошибки в полях формы.');
      return;
    }

    const selfAssessment = $('#self-assessment-slider').slider('value');

    const result = {
      studentName: nameVal,
      studentGroup: groupVal,
      checkDate: dateVal,
      checkNumber: numVal,
      studentEmail: emailVal,
      selfAssessment: selfAssessment,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem('knowledge_result', JSON.stringify(result));
    } catch (err) {
      console.error('Ошибка сохранения в localStorage:', err);
    }

    const submitBtn = $(this).find('button[type="submit"]');
    const originalText = submitBtn.text();
    submitBtn.prop('disabled', true).text('Отправка...');

    emailjs.send(SERVICE_ID, TEMPLATE_ID, {
      student_name:   nameVal,
      student_group:  groupVal,
      check_date:     dateVal,
      check_number:   numVal,
      student_email:  emailVal,
      self_assessment: selfAssessment
    })
    .then(function () {
      alert('Форма успешно сохранена и отправлена на почту!');
      submitBtn.prop('disabled', false).text(originalText);
    })
    .catch(function (error) {
      console.error('Ошибка EmailJS:', error);
      alert('Форма сохранена, но письмо не отправилось. Проверьте настройки EmailJS.');
      submitBtn.prop('disabled', false).text(originalText);
    });
  });

});