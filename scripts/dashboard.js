const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function movingAverage(values, index, window) {
  const start = Math.max(0, index - window + 1);
  const slice = values.slice(start, index + 1);
  return slice.reduce((sum, value) => sum + value, 0) / slice.length;
}

function rollingSum(values, index, window) {
  const start = Math.max(0, index - window + 1);
  return values.slice(start, index + 1).reduce((sum, value) => sum + value, 0);
}

function correlation(a, b) {
  const n = Math.min(a.length, b.length);
  const avgA = a.reduce((s, v) => s + v, 0) / n;
  const avgB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i += 1) {
    const da = a[i] - avgA;
    const db = b[i] - avgB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  if (!denA || !denB) return 0;
  return num / Math.sqrt(denA * denB);
}

function createLineChart(container, labels, series, options = {}) {
  const width = 580;
  const height = 210;
  const pad = 24;
  const all = series.flatMap((line) => line.values);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const yMin = options.zeroFloor ? Math.min(0, min) : min;
  const yMax = max;
  const ySpan = yMax - yMin || 1;

  const pointsFor = (values) => values.map((value, i) => {
    const x = pad + (i * (width - pad * 2)) / Math.max(1, values.length - 1);
    const y = height - pad - ((value - yMin) * (height - pad * 2)) / ySpan;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const lines = series.map((line) =>
    `<polyline points="${pointsFor(line.values)}" fill="none" stroke="${line.color}" stroke-width="2.5" />`
  ).join('');

  container.innerHTML = `
    <svg viewBox="0 0 ${width} ${height}" class="chart-svg" role="img" aria-label="${options.ariaLabel || 'chart'}">
      <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" class="chart-axis"></line>
      <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" class="chart-axis"></line>
      ${lines}
    </svg>
    <div class="chart-legend">
      ${series.map((line) => `<span><i style="background:${line.color}"></i>${line.label}</span>`).join('')}
    </div>
    <p class="axis-caption">${labels[0]} → ${labels[labels.length - 1]}</p>
  `;
}

function renderCorrelationTable(container, metrics) {
  const names = Object.keys(metrics);
  const rows = names.map((r) => {
    const cells = names.map((c) => {
      const value = correlation(metrics[r], metrics[c]);
      const hue = value >= 0 ? 180 : 0;
      const alpha = Math.abs(value) * 0.55 + 0.1;
      return `<td style="background: hsla(${hue}, 75%, 45%, ${alpha.toFixed(2)});">${value.toFixed(2)}</td>`;
    }).join('');
    return `<tr><th>${r}</th>${cells}</tr>`;
  }).join('');

  container.innerHTML = `
    <table class="corr-table">
      <thead><tr><th></th>${names.map((n) => `<th>${n}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function deriveStatus(latest) {
  if (latest.loadIndex > 72 && latest.readiness < 45) return 'OVERLOADED';
  if (latest.recoveryDebt7d > 8 || latest.readiness < 60) return 'RECOVERING';
  return 'STABLE';
}

async function initDashboard() {
  const response = await fetch('../data/bio_signals_sample.json');
  const raw = await response.json();

  const hrvs = raw.map((r) => r.hrv);
  const restingHrs = raw.map((r) => r.restingHr);
  const sleeps = raw.map((r) => r.sleepHours);

  const points = raw.map((row, index) => {
    const hrvBaseline = movingAverage(hrvs, index, 14);
    const rhrBaseline = movingAverage(restingHrs, index, 14);
    const hrvDeviationPct = ((row.hrv - hrvBaseline) / hrvBaseline) * 100;
    const rhrDeviation = row.restingHr - rhrBaseline;
    const sleepDebt = Math.max(0, 8 - row.sleepHours);
    const recoveryDebt7d = rollingSum(sleeps.map((s) => Math.max(0, 8 - s)), index, 7);

    // Derived metric formulas:
    // loadIndex combines external load (strain) with internal strain proxies (RHR up + HRV down).
    const loadIndex = clamp(
      0.7 * row.strain + 2.5 * Math.max(0, rhrDeviation) + 1.4 * Math.max(0, -hrvDeviationPct),
      0,
      100,
    );

    // readiness increases with positive HRV deviation and low RHR/sleep debt while penalizing high load.
    const readiness = clamp(
      72 + 1.8 * hrvDeviationPct - 4.2 * Math.max(0, rhrDeviation) - 2.1 * recoveryDebt7d - 0.28 * loadIndex,
      0,
      100,
    );

    const dHRV = index === 0 ? 0 : Math.abs(row.hrv - raw[index - 1].hrv);
    const dRHR = index === 0 ? 0 : Math.abs(row.restingHr - raw[index - 1].restingHr);
    const signalStability7d = clamp(100 - 3.8 * movingAverage(raw.map((_, i) => {
      const prev = i === 0 ? raw[i] : raw[i - 1];
      return Math.abs(raw[i].hrv - prev.hrv) + Math.abs(raw[i].restingHr - prev.restingHr);
    }), index, 7), 0, 100);

    return {
      ...row,
      hrvDeviationPct,
      rhrDeviation,
      sleepDebt,
      recoveryDebt7d,
      loadIndex,
      readiness,
      signalStability7d,
      dHRV,
      dRHR,
    };
  });

  const labels = points.map((p) => p.date.slice(5));

  createLineChart(
    document.getElementById('chart-load-recovery'),
    labels,
    [
      { label: 'Load Index', values: points.map((p) => p.loadIndex), color: '#ff8a70' },
      { label: 'Readiness', values: points.map((p) => p.readiness), color: '#66d9ff' },
    ],
    { ariaLabel: 'Load vs recovery timeline', zeroFloor: true },
  );

  createLineChart(
    document.getElementById('chart-deviation'),
    labels,
    [
      { label: 'HRV dev %', values: points.map((p) => p.hrvDeviationPct), color: '#9aff9a' },
      { label: 'RHR dev bpm', values: points.map((p) => p.rhrDeviation), color: '#ffd36e' },
    ],
    { ariaLabel: 'HRV and resting heart rate deviation' },
  );

  createLineChart(
    document.getElementById('chart-sleep-debt'),
    labels,
    [
      { label: 'Recovery Debt 7d', values: points.map((p) => p.recoveryDebt7d), color: '#d0a3ff' },
    ],
    { ariaLabel: 'Sleep debt rolling sum', zeroFloor: true },
  );

  renderCorrelationTable(document.getElementById('chart-correlation'), {
    loadIndex: points.map((p) => p.loadIndex),
    readiness: points.map((p) => p.readiness),
    recoveryDebt7d: points.map((p) => p.recoveryDebt7d),
    signalStability7d: points.map((p) => p.signalStability7d),
  });

  const latest = points[points.length - 1];
  const status = deriveStatus(latest);
  const statusEl = document.getElementById('system-status-pill');
  statusEl.textContent = `Status: ${status}`;
  statusEl.dataset.status = status.toLowerCase();

  document.getElementById('metric-readiness').textContent = latest.readiness.toFixed(1);
  document.getElementById('metric-load-index').textContent = latest.loadIndex.toFixed(1);
  document.getElementById('metric-debt').textContent = latest.recoveryDebt7d.toFixed(1);
  document.getElementById('metric-stability').textContent = latest.signalStability7d.toFixed(1);
}

initDashboard();
