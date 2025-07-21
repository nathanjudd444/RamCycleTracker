let interval = 0;
let targetCycles = 0;
let cyclesCompleted = 0;
let startTime = null;
let pausedDuration = 0;
let pauseStart = null;
let logData = [];
let activeOrder = '';
let positionMap = {
  rubber: { name: "Rubber Machine Operator", interval: 0.75, target: 640 },
  plastic: { name: "Plastic Machine Operator", interval: 2, target: 240 },
  diecast: { name: "Diecast Operator", interval: 1, target: 480 },
  powdercoat: { name: "Powdercoat Operator", interval: 20, target: 24 }
};

document.getElementById('positionSelect').addEventListener('change', function() {
  const pos = this.value;
  if (positionMap[pos]) {
    interval = positionMap[pos].interval * 60;
    targetCycles = positionMap[pos].target;
    document.getElementById('intervalDisplay').textContent = 
      `Interval: ${interval / 60} min, Target Cycles: ${targetCycles}`;
  }
});

document.getElementById('orderId').addEventListener('input', function () {
  const newOrder = this.value.trim();
  if (newOrder && newOrder !== activeOrder) {
    const now = new Date().toLocaleString();
    if (activeOrder) log(`[${now}] Order Switched: ${activeOrder} ➝ ${newOrder}`);
    else log(`[${now}] Order Started: ${newOrder}`);
    activeOrder = newOrder;
    document.getElementById('currentOrderDisplay').textContent = `Current Order: ${activeOrder}`;
  }
});

function log(message) {
  logData.push(message);
  document.getElementById('log').textContent = logData.join('\n');
}

function start() {
  if (!startTime) {
    startTime = new Date();
    pausedDuration = 0;
  }
  const now = new Date().toLocaleString();
  log(`[${now}] Start Pressed${activeOrder ? " for Order " + activeOrder : ""}`);
}

function pause() {
  pauseStart = new Date();
  const now = new Date().toLocaleString();
  log(`[${now}] Pause Pressed`);
}

function resume() {
  if (pauseStart) {
    pausedDuration += (new Date() - pauseStart);
    pauseStart = null;
  }
  const now = new Date().toLocaleString();
  log(`[${now}] Resume Pressed`);
}

function stop() {
  const now = new Date().toLocaleString();
  log(`[${now}] Stop Pressed`);
}

function copyLog() {
  const allText = logData.join('\n');
  navigator.clipboard.writeText(allText).then(() => alert('Log copied to clipboard!'));
}

setInterval(() => {
  if (startTime) {
    const now = new Date();
    const workTimeMs = now - startTime - pausedDuration;
    const totalSeconds = workTimeMs / 1000;
    const expectedCycles = Math.floor(totalSeconds / interval);
    const diff = cyclesCompleted - expectedCycles;
    let status = '';
    if (Math.abs(diff) <= 2) status = '🟢 On Schedule';
    else if (diff > 2) status = '🟩 Ahead';
    else status = '🔴 Behind';
    document.getElementById('cycleStatus').textContent = 
      `Completed: ${cyclesCompleted} | Expected: ${expectedCycles} → ${status}`;
  }
}, 60000);

// Daily log clear
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 3 && now.getMinutes() === 0) {
    logData = [];
    document.getElementById('log').textContent = '';
  }
}, 60000);
