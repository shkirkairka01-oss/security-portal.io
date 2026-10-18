$(document).ready(function() {

  /* ============================================================
   ЗАДАНИЕ 6. УВЕДОМЛЕНИЯ (без зависимости от Bootstrap)
   ============================================================ */
function showToast(message, type) {
  const el = document.getElementById('appToast');
  const textEl = document.getElementById('appToastText');
  if (!el) return;

  // Стили контейнера — прямо на элемент, без CSS-файлов
  el.style.position = 'fixed';
  el.style.top = '20px';
  el.style.right = '20px';
  el.style.zIndex = '9999';
  el.style.minWidth = '260px';
  el.style.maxWidth = '360px';
  el.style.padding = '14px 18px';
  el.style.borderRadius = '12px';
  el.style.boxShadow = '0 8px 24px rgba(0,0,0,0.25)';
  el.style.fontFamily = 'Arial, sans-serif';
  el.style.fontSize = '14px';
  el.style.fontWeight = '500';
  el.style.color = '#ffffff';
  el.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
  el.style.opacity = '0';
  el.style.transform = 'translateX(40px)';
  el.style.pointerEvents = 'none';

  // Цвет фона по типу
  if (type === 'success')      el.style.background = '#16a34a';
  else if (type === 'error')   el.style.background = '#dc2626';
  else if (type === 'warning') { el.style.background = '#f59e0b'; el.style.color = '#1b2333'; }
  else                         el.style.background = '#1e3c72';

  if (textEl) textEl.textContent = message;
  else el.textContent = message;

  // Показываем: сначала в DOM, потом меняем opacity — чтобы сработал transition
  requestAnimationFrame(function () {
    el.style.opacity = '1';
    el.style.transform = 'translateX(0)';
    el.style.pointerEvents = 'auto';
  });

  // Автоскрытие
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(function () {
    el.style.opacity = '0';
    el.style.transform = 'translateX(40px)';
    el.style.pointerEvents = 'none';
  }, 3000);
}

window.showToast = showToast;

  /* ============================================================
     0. ТЕМА
     ============================================================ */
  const savedTheme = localStorage.getItem('theme') || 'light';
  $('html').attr('data-theme', savedTheme);

  const $themeToggle = $('.theme-toggle');
  if ($themeToggle.length) {
    $themeToggle.text(savedTheme === 'dark' ? '☀️' : '🌙');
  }

  $(document).on('click', '.theme-toggle', function(e) {
    e.preventDefault();
    const current = $('html').attr('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    $('html').attr('data-theme', next);
    localStorage.setItem('theme', next);

    $('.theme-toggle').text(next === 'dark' ? '☀️' : '🌙');
  });

  /* ============================================================
     1. МОДАЛЬНОЕ ОКНО
     ============================================================ */
  const $modal = $('#modal');
  const $openModalBtn = $('#open-modal');
  let lastFocused = null;

  function openModal() {
    if (!$modal.length) return;
    lastFocused = document.activeElement;
    $modal.removeAttr('hidden');
    const $firstBtn = $modal.find('button').first();
    if ($firstBtn.length) $firstBtn.focus();
  }

  function closeModal() {
    if (!$modal.length) return;
    $modal.attr('hidden', true);
    if (lastFocused) $(lastFocused).focus();
  }

  if ($modal.length && $openModalBtn.length) {
    $openModalBtn.on('click', openModal);

    $modal.on('click', function(e) {
      if ($(e.target).is('[data-close]') || $(e.target).hasClass('modal__backdrop')) {
        closeModal();
      }
    });

    $(document).on('keydown', function(e) {
      if (e.key === 'Escape' && !$modal.attr('hidden')) {
        closeModal();
      }
    });
  }

  /* ============================================================
     2. ЧЕК-ЛИСТ
     ============================================================ */
  const $checklist = $('#checklist');
  if ($checklist.length) {
    const STORAGE_KEY = 'checklist-results';
    const $resultBlock = $('#result');
    const $resultText = $('#result-text');
    const $showResultBtn = $('#show-result');
    const $clearResultBtn = $('#clear-result');

    function saveResults() {
      const data = {};
      $checklist.find('.checklist-item').each(function() {
        const $item = $(this);
        const id = $item.data('id');
        const $selected = $item.find('input[type="radio"]:checked');
        const comment = $item.find('.checklist-comment').val();
        data[id] = {
          value: $selected.length ? $selected.val() : null,
          comment: comment
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function loadResults() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      try {
        const data = JSON.parse(saved);
        $.each(data, function(id, record) {
          const $item = $checklist.find('.checklist-item[data-id="' + id + '"]');
          if (!$item.length) return;
          if (record.value) {
            const $radio = $item.find('input[type="radio"][value="' + record.value + '"]');
            if ($radio.length) {
              $radio.prop('checked', true);
              if (record.value === 'no') {
                $item.addClass('is-fail');
                const $comment = $item.find('.checklist-comment');
                $comment.removeAttr('hidden');
                $comment.val(record.comment || '');
              }
            }
          }
        });
      } catch (e) {
        console.error('Ошибка загрузки сохранения', e);
      }
    }

    $checklist.on('change', 'input[type="radio"]', function() {
      const $radio = $(this);
      const $item = $radio.closest('.checklist-item');
      const $comment = $item.find('.checklist-comment');
      if ($radio.val() === 'no') {
        $item.addClass('is-fail');
        $comment.removeAttr('hidden');
      } else {
        $item.removeClass('is-fail');
        $comment.attr('hidden', true);
        $comment.val('');
      }
      saveResults();
    });

    $checklist.on('input', '.checklist-comment', function() {
      saveResults();
    });

    if ($showResultBtn.length) {
      $showResultBtn.on('click', function() {
        const $items = $checklist.find('.checklist-item');
        let yes = 0;
        let total = 0;
        $items.each(function() {
          const $selected = $(this).find('input[type="radio"]:checked');
          if (!$selected.length) return;
          if ($selected.val() === 'na') return;
          total++;
          if ($selected.val() === 'yes') yes++;
        });
        const percent = total === 0 ? 0 : Math.round((yes / total) * 100);

        let levelText = percent >= 80 ? 'Высокий уровень соответствия'
                       : percent >= 50 ? 'Удовлетворительный уровень соответствия'
                       : 'Низкий уровень соответствия';

        $resultText.html(percent + '% (' + levelText + ')');
        $resultBlock.removeClass('result-high result-mid result-low');
        if (percent >= 80) $resultBlock.addClass('result-high');
        else if (percent >= 50) $resultBlock.addClass('result-mid');
        else $resultBlock.addClass('result-low');

        /* ==== Уведомление о сохранении результатов (Задание 6) ==== */
        showToast('Результаты чек-листа сохранены', 'success');
      });
    }

    if ($clearResultBtn.length) {
      $clearResultBtn.on('click', function() {
        if (confirm('Удалить все ответы?')) {
          localStorage.removeItem(STORAGE_KEY);
          $checklist.find('.checklist-item').each(function() {
            const $item = $(this);
            $item.find('input[type="radio"]').prop('checked', false);
            $item.removeClass('is-fail');
            const $comment = $item.find('.checklist-comment');
            $comment.val('');
            $comment.attr('hidden', true);
          });
          $resultText.text('Оценка не проведена');
          $resultBlock.removeClass('result-high result-mid result-low');

          /* ==== Уведомление об очистке (Задание 6) ==== */
          showToast('Результаты чек-листа очищены', 'warning');
        }
      });
    }

    loadResults();
  }

});