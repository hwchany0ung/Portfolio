/* ========================
   GitHub Commit Heatmap
   - Uses GitHub public events API (no token required for public repos)
   - Renders a 90-day contribution calendar
   - Graceful fallback if API fails
   ======================== */

(function () {
  'use strict';

  const GITHUB_USERNAME = 'hwchany0ung';
  const DAYS_TO_SHOW = 91; // ~13 weeks
  const MAX_PAGES = 3; // Max API pages to fetch (30 events per page)

  /**
   * Fetch public events from GitHub API (no auth required).
   * GitHub Events API returns last 90 days of public events.
   */
  async function fetchGitHubEvents() {
    const events = [];

    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100&page=${page}`
        );

        if (!res.ok) {
          console.warn(`GitHub API returned ${res.status}`);
          break;
        }

        const data = await res.json();
        if (!data.length) break;

        events.push(...data);
      } catch (err) {
        console.warn('GitHub API fetch error:', err);
        break;
      }
    }

    return events;
  }

  /**
   * Process events into a date-count map.
   * Only count PushEvent, CreateEvent, PullRequestEvent, IssuesEvent.
   */
  function processEvents(events) {
    const countMap = {};
    const contributionTypes = [
      'PushEvent',
      'CreateEvent',
      'PullRequestEvent',
      'IssuesEvent',
      'PullRequestReviewEvent',
    ];

    events.forEach((event) => {
      if (!contributionTypes.includes(event.type)) return;

      const date = event.created_at.split('T')[0]; // YYYY-MM-DD

      if (event.type === 'PushEvent') {
        // Count individual commits within push
        const commitCount = event.payload?.commits?.length || 1;
        countMap[date] = (countMap[date] || 0) + commitCount;
      } else {
        countMap[date] = (countMap[date] || 0) + 1;
      }
    });

    return countMap;
  }

  /**
   * Get contribution level (0-4) based on count.
   */
  function getLevel(count) {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  }

  /**
   * Generate array of dates for the last N days, aligned to start on Sunday.
   */
  function generateDateRange(days) {
    const dates = [];
    const today = new Date();

    // Find the next Saturday (end of week) from today
    const endDay = new Date(today);

    // Go back to find the start: enough weeks to cover `days`
    const startDay = new Date(today);
    startDay.setDate(startDay.getDate() - days);

    // Align to Sunday
    while (startDay.getDay() !== 0) {
      startDay.setDate(startDay.getDate() - 1);
    }

    const current = new Date(startDay);
    while (current <= today) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return dates;
  }

  /**
   * Format date for tooltip.
   */
  function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return `${y}-${m}-${d} (${dayNames[date.getDay()]})`;
  }

  function toDateKey(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Render the heatmap grid.
   */
  function renderHeatmap(container, countMap) {
    const dates = generateDateRange(DAYS_TO_SHOW);

    // Calculate stats
    let totalContributions = 0;
    let activeDays = 0;
    let currentStreak = 0;
    let maxStreak = 0;

    const today = new Date();
    const todayKey = toDateKey(today);

    // Calculate streaks (from today backwards)
    let streakDate = new Date(today);
    let counting = true;

    while (counting) {
      const key = toDateKey(streakDate);
      if (countMap[key] && countMap[key] > 0) {
        currentStreak++;
        streakDate.setDate(streakDate.getDate() - 1);
      } else if (key === todayKey) {
        // Today might not have contributions yet, check yesterday
        streakDate.setDate(streakDate.getDate() - 1);
      } else {
        counting = false;
      }
    }

    dates.forEach((date) => {
      const key = toDateKey(date);
      const count = countMap[key] || 0;
      totalContributions += count;
      if (count > 0) activeDays++;
    });

    // Update stats
    const statsHTML = `
      <div class="heatmap-stat">
        <div class="heatmap-stat-num">${totalContributions}</div>
        <div class="heatmap-stat-label">contributions</div>
      </div>
      <div class="heatmap-stat">
        <div class="heatmap-stat-num">${activeDays}</div>
        <div class="heatmap-stat-label">active days</div>
      </div>
      <div class="heatmap-stat">
        <div class="heatmap-stat-num">${currentStreak}</div>
        <div class="heatmap-stat-label">current streak</div>
      </div>
    `;

    const statsEl = container.querySelector('.heatmap-stats');
    if (statsEl) statsEl.innerHTML = statsHTML;

    // Group dates by week
    const weeks = [];
    let currentWeek = [];

    dates.forEach((date) => {
      if (date.getDay() === 0 && currentWeek.length > 0) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(date);
    });
    if (currentWeek.length > 0) weeks.push(currentWeek);

    // Build month labels
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];
    let monthsHTML = '<div class="heatmap-months">';
    let lastMonth = -1;
    const weekWidth = 15; // 12px cell + 3px gap

    weeks.forEach((week) => {
      const firstDay = week[0];
      const month = firstDay.getMonth();
      if (month !== lastMonth) {
        monthsHTML += `<span class="heatmap-month-label" style="width:${weekWidth}px;">${monthNames[month]}</span>`;
        lastMonth = month;
      } else {
        monthsHTML += `<span class="heatmap-month-label" style="width:${weekWidth}px;"></span>`;
      }
    });
    monthsHTML += '</div>';

    // Build day labels
    const dayLabelsHTML = `
      <div class="heatmap-day-labels">
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Mon</div>
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Wed</div>
        <div class="heatmap-day-label"></div>
        <div class="heatmap-day-label">Fri</div>
        <div class="heatmap-day-label"></div>
      </div>
    `;

    // Build grid
    let gridHTML = '<div class="heatmap-grid">';

    weeks.forEach((week) => {
      gridHTML += '<div class="heatmap-week">';

      // Pad start of first week if needed
      if (week[0].getDay() > 0 && weeks.indexOf(week) === 0) {
        for (let i = 0; i < week[0].getDay(); i++) {
          gridHTML += '<div class="heatmap-day" style="visibility:hidden;"></div>';
        }
      }

      week.forEach((date) => {
        const key = toDateKey(date);
        const count = countMap[key] || 0;
        const level = getLevel(count);
        const tooltip = `${formatDate(date)}: ${count} contribution${count !== 1 ? 's' : ''}`;

        gridHTML += `<div class="heatmap-day" data-level="${level}" data-tooltip="${tooltip}" data-date="${key}"></div>`;
      });

      gridHTML += '</div>';
    });

    gridHTML += '</div>';

    // Legend
    const legendHTML = `
      <div class="heatmap-legend">
        <span class="heatmap-legend-label">Less</span>
        <div class="heatmap-legend-cell heatmap-day" data-level="0"></div>
        <div class="heatmap-legend-cell heatmap-day" data-level="1"></div>
        <div class="heatmap-legend-cell heatmap-day" data-level="2"></div>
        <div class="heatmap-legend-cell heatmap-day" data-level="3"></div>
        <div class="heatmap-legend-cell heatmap-day" data-level="4"></div>
        <span class="heatmap-legend-label">More</span>
      </div>
    `;

    const bodyEl = container.querySelector('.heatmap-body');
    if (bodyEl) {
      bodyEl.innerHTML = dayLabelsHTML + '<div>' + monthsHTML + gridHTML + '</div>';
    }

    const legendContainer = container.querySelector('.heatmap-legend-container');
    if (legendContainer) {
      legendContainer.innerHTML = legendHTML;
    }
  }

  /**
   * Show fallback if API fails.
   */
  function showFallback(container) {
    const body = container.querySelector('.heatmap-body');
    if (body) {
      body.innerHTML = `
        <div class="heatmap-fallback">
          GitHub API rate limit reached. Visit
          <a href="https://github.com/${GITHUB_USERNAME}" target="_blank">@${GITHUB_USERNAME}</a>
          to see activity.
        </div>
      `;
    }
  }

  /**
   * Initialize heatmap.
   */
  async function initHeatmap() {
    const container = document.getElementById('github-heatmap');
    if (!container) return;

    try {
      const events = await fetchGitHubEvents();

      if (events.length === 0) {
        // No events — might be rate limited, show with empty data
        renderHeatmap(container, {});
        return;
      }

      const countMap = processEvents(events);
      renderHeatmap(container, countMap);
    } catch (err) {
      console.warn('Heatmap initialization failed:', err);
      showFallback(container);
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeatmap);
  } else {
    initHeatmap();
  }
})();
