$(document).ready(function() {
    const $onlyMismatch = $('#registry-only-mismatch');
    const jsonPath = 'assets/data/records.json';
    const $tbody = $('#registry-tbody');
    const $countValue = $('#count-value');
    const $emptyState = $('#registry-empty');
    const $tableWrap = $('.table-wrap');

    const $searchInput = $('#registry-search');
    const $sectionFilter = $('#registry-section-filter');
    const $sortSelect = $('#registry-sort');

    // ==== ЗАЩИТА: если на странице нет каталога — выходим ====
    if (!$searchInput.length || !$sectionFilter.length || !$sortSelect.length) {
        return;
    }

    if (!$('#registry-loading').length) {
        $tableWrap.before('<div id="registry-loading" style="text-align: center; padding: 30px; font-weight: 500; color: #475569;">Загрузка данных каталога...</div>');
    }
    const $loadingIndicator = $('#registry-loading');

    let allRecords = [];

    function highlightText(text, query) {
        if (!query) return text;
        const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp('(' + escaped + ')', 'gi');
        return text.replace(regex, '<mark style="background: #ffd200; padding: 0 2px; border-radius: 2px;">$1</mark>');
    }

    function initAsyncStats(records) {
        const $loading = $('#stats-loading');
        const $content = $('#stats-content');
        const $sectionsContainer = $('#stats-sections');
        const $categoriesContainer = $('#stats-categories');

        $loading.text('Запуск имитации асинхронной обработки данных...');

        let step = 0;
        const intervalId = setInterval(function() {
            step++;
            if (step === 1) {
                $loading.text('Сбор данных по разделам и категориям...');
            } else if (step === 2) {
                $loading.text('Анализ параметров записей...');
            } else if (step >= 3) {
                clearInterval(intervalId);
                $loading.hide(); $content.show();

                const sectionCounts = {};
                const categoryCounts = {};

                records.forEach(function(item) {
                    const sec = item.section || 'Без раздела';
                    const cat = item.category || 'Без категории';
                    sectionCounts[sec] = (sectionCounts[sec] || 0) + 1;
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
                });

                function renderHistogram(dataObj, $container, totalRecords) {
                    $container.empty(); $.each(dataObj, function(label, count) {
                        const percent = Math.round((count / totalRecords) * 100);

                        const $wrapper = $('<div class="histogram-bar-wrapper">');
                        const $info = $(`
                            <div class="histogram-label-info">
                                <span>${label}</span>
                                <span><b>${count}</b> (${percent}%)</span>
                            </div>
                        `);
                        const $track = $('<div class="histogram-track">');
                        const $fill = $('<div class="histogram-fill">');

                        $track.append($fill); $wrapper.append($info, $track);
                        $container.append($wrapper);

                        setTimeout(function() {
                            $fill.css('width', percent + '%');
                        }, 100);
                    });
                }

                renderHistogram(sectionCounts, $sectionsContainer, records.length);
                renderHistogram(categoryCounts, $categoriesContainer, records.length);
            }
        }, 400);
    }

    function filterAndRender() {
        const query = $searchInput.val().trim().toLowerCase();
        const selectedSection = $sectionFilter.val();
        const sortValue = $sortSelect.val();

        const onlyMismatch = $onlyMismatch.length ? $onlyMismatch.is(':checked') : false;

const filtered = allRecords.filter(function(item) {
    const matchSection = (selectedSection === 'all' || item.section === selectedSection);
    const matchSearch = query === '' ||
        item.name.toLowerCase().includes(query) ||
        item.annotation.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query);

    // Переключатель: оставляем только записи без «Соответствует»
    const matchMismatch = !onlyMismatch
        || (item.category && item.category !== 'Соответствует');

    return matchSection && matchSearch && matchMismatch;
});

        filtered.sort(function(a, b) {
            if (sortValue === 'name-asc') {
                return a.name.localeCompare(b.name);
            } else if (sortValue === 'name-desc') {
                return b.name.localeCompare(a.name);
            } else if (sortValue === 'date-desc') {
                return new Date(b.date) - new Date(a.date);
            } else if (sortValue === 'date-asc') {
                return new Date(a.date) - new Date(b.date);
            }
            return 0;
        });

        $tbody.empty();

        if (filtered.length === 0) {
            $tableWrap.hide();
            $emptyState.show(); $countValue.text('0');
            return;
        }

        $tableWrap.show();
        $emptyState.hide(); $countValue.text(filtered.length);

        $.each(filtered, function(index, item) {
            const highlightedName = highlightText(item.name, query);
            const highlightedAnnotation = highlightText(item.annotation, query);

            const $row = $('<tr>').append(
                $('<td>').text(index + 1), $('<td>').html(highlightedName),
                $('<td>').text(item.category), $('<td>').text(item.date),
                $('<td>').text(item.section), $('<td>').html(highlightedAnnotation)
            );

            $row.css({ opacity: 0 }); $tbody.append($row); $row.delay(index * 40).animate({ opacity: 1 }, 350);
        });

        $tbody.find('tr').hover(
            function() {
                $(this).css({
                    'background-color': '#eef2fb',
                    'transition': 'background-color 0.2s ease'
                });
            },
            function() {
                const rowIndex = $(this).index();
                const defaultBg = (rowIndex % 2 === 0) ? '#f8faff' : '#ffffff';
                $(this).css('background-color', defaultBg);
            }
        );
    }

    $.getJSON(jsonPath)
        .done(function(data) {
            $loadingIndicator.hide();
            if (!Array.isArray(data) || data.length === 0) {
                $tableWrap.hide();
                $emptyState.text('Файл данных пуст или имеет неверный формат.').show();

                /* ==== Уведомление: каталог пуст (Задание 6) ==== */
                if (typeof showToast === 'function') {
                    showToast('Каталог пуст или повреждён', 'warning');
                }
                return;
            }
            allRecords = data;
            filterAndRender();
            initAsyncStats(allRecords);
        })
        .fail(function(jqxhr, textStatus, error) {
            $loadingIndicator.hide();
            $tableWrap.hide();
            $emptyState.html(`
                <div style="color: #dc2626; font-weight: 600; margin-bottom: 8px;">⚠ Ошибка загрузки данных каталога</div>
                <div style="font-size: 14px; color: #64748b;">Не удалось загрузить файл с записями (${jsonPath}). Проверьте наличие файла или запуск сайта через локальный сервер.</div>
            `).show();

            /* ==== Уведомление об ошибке загрузки (Задание 6) ==== */
            if (typeof showToast === 'function') {
                showToast('Не удалось загрузить данные каталога', 'error');
            }
        });

    $searchInput.on('input', function() {
        filterAndRender();
    });

    $sectionFilter.on('change', function() {
        filterAndRender();
    });

    $sortSelect.on('change', function() {
        filterAndRender();
    });

    $('#registry-reset').on('click', function() {
        $searchInput.val('');
        $sectionFilter.val('all'); $sortSelect.val('default');
        filterAndRender();
    });
    $onlyMismatch.on('change', function() {
    filterAndRender();
});
});