/**
 * CPU Scheduling Algorithms
 * Each function takes an array of processes: { pid, arrivalTime, burstTime, color }
 * and returns:
 *   {
 *     timeline: [{ pid, start, end }],   // Gantt chart segments, in chronological order
 *     metrics: [{ pid, arrivalTime, burstTime, completionTime, turnaroundTime, waitingTime }],
 *     averages: { avgWaitingTime, avgTurnaroundTime }
 *   }
 */

function cloneProcesses(processes) {
  return processes.map((p) => ({ ...p, remaining: p.burstTime }));
}

function buildMetrics(processes, completionTimes) {
  const metrics = processes.map((p) => {
    const completionTime = completionTimes[p.pid];
    const turnaroundTime = completionTime - p.arrivalTime;
    const waitingTime = turnaroundTime - p.burstTime;
    return {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      completionTime,
      turnaroundTime,
      waitingTime,
    };
  });

  const avgWaitingTime =
    metrics.reduce((sum, m) => sum + m.waitingTime, 0) / metrics.length;
  const avgTurnaroundTime =
    metrics.reduce((sum, m) => sum + m.turnaroundTime, 0) / metrics.length;

  return {
    metrics,
    averages: {
      avgWaitingTime: Number(avgWaitingTime.toFixed(2)),
      avgTurnaroundTime: Number(avgTurnaroundTime.toFixed(2)),
    },
  };
}

// Merge consecutive timeline entries for the same pid into one block
function mergeTimeline(timeline) {
  const merged = [];
  for (const seg of timeline) {
    const last = merged[merged.length - 1];
    if (last && last.pid === seg.pid && last.end === seg.start) {
      last.end = seg.end;
    } else {
      merged.push({ ...seg });
    }
  }
  return merged;
}

function fcfs(processesInput) {
  const processes = [...processesInput].sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );
  let time = 0;
  const timeline = [];
  const completionTimes = {};

  for (const p of processes) {
    if (time < p.arrivalTime) time = p.arrivalTime;
    const start = time;
    time += p.burstTime;
    timeline.push({ pid: p.pid, start, end: time });
    completionTimes[p.pid] = time;
  }

  const { metrics, averages } = buildMetrics(processesInput, completionTimes);
  return { timeline: mergeTimeline(timeline), metrics, averages };
}

function sjfNonPreemptive(processesInput) {
  const processes = cloneProcesses(processesInput);
  const n = processes.length;
  const done = new Set();
  let time = 0;
  const timeline = [];
  const completionTimes = {};

  while (done.size < n) {
    const available = processes.filter(
      (p) => !done.has(p.pid) && p.arrivalTime <= time
    );

    if (available.length === 0) {
      // Jump to the next arrival
      const next = processes
        .filter((p) => !done.has(p.pid))
        .sort((a, b) => a.arrivalTime - b.arrivalTime)[0];
      time = next.arrivalTime;
      continue;
    }

    available.sort((a, b) => a.burstTime - b.burstTime || a.arrivalTime - b.arrivalTime);
    const p = available[0];
    const start = time;
    time += p.burstTime;
    timeline.push({ pid: p.pid, start, end: time });
    completionTimes[p.pid] = time;
    done.add(p.pid);
  }

  const { metrics, averages } = buildMetrics(processesInput, completionTimes);
  return { timeline: mergeTimeline(timeline), metrics, averages };
}

function srtf(processesInput) {
  const processes = cloneProcesses(processesInput);
  const n = processes.length;
  let time = Math.min(...processes.map((p) => p.arrivalTime));
  let completed = 0;
  const timeline = [];
  const completionTimes = {};

  // Safety cap in case of malformed input
  const maxTime = processes.reduce((s, p) => s + p.burstTime, time) + 1000;

  while (completed < n && time <= maxTime) {
    const available = processes.filter(
      (p) => p.arrivalTime <= time && p.remaining > 0
    );

    if (available.length === 0) {
      time++;
      continue;
    }

    available.sort(
      (a, b) => a.remaining - b.remaining || a.arrivalTime - b.arrivalTime
    );
    const p = available[0];

    timeline.push({ pid: p.pid, start: time, end: time + 1 });
    p.remaining -= 1;
    time += 1;

    if (p.remaining === 0) {
      completionTimes[p.pid] = time;
      completed++;
    }
  }

  const { metrics, averages } = buildMetrics(processesInput, completionTimes);
  return { timeline: mergeTimeline(timeline), metrics, averages };
}

function roundRobin(processesInput, quantum = 2) {
  const processes = cloneProcesses(processesInput).sort(
    (a, b) => a.arrivalTime - b.arrivalTime
  );
  const n = processes.length;
  const completionTimes = {};
  const timeline = [];
  const queue = [];
  const arrivedIndex = new Set();

  let time = processes[0].arrivalTime;
  let completed = 0;

  // seed queue with anything arriving at time 0 / start time
  processes.forEach((p, idx) => {
    if (p.arrivalTime <= time && !arrivedIndex.has(idx)) {
      queue.push(idx);
      arrivedIndex.add(idx);
    }
  });

  while (completed < n) {
    if (queue.length === 0) {
      // fast-forward to next arrival
      const nextIdx = processes.findIndex(
        (p, idx) => !arrivedIndex.has(idx)
      );
      if (nextIdx === -1) break;
      time = Math.max(time, processes[nextIdx].arrivalTime);
      processes.forEach((p, idx) => {
        if (p.arrivalTime <= time && !arrivedIndex.has(idx)) {
          queue.push(idx);
          arrivedIndex.add(idx);
        }
      });
      continue;
    }

    const idx = queue.shift();
    const p = processes[idx];
    const runTime = Math.min(quantum, p.remaining);
    const start = time;
    time += runTime;
    p.remaining -= runTime;
    timeline.push({ pid: p.pid, start, end: time });

    // enqueue anyone who arrived during this run (before re-adding current process)
    processes.forEach((pp, i) => {
      if (pp.arrivalTime <= time && !arrivedIndex.has(i)) {
        queue.push(i);
        arrivedIndex.add(i);
      }
    });

    if (p.remaining > 0) {
      queue.push(idx);
    } else {
      completionTimes[p.pid] = time;
      completed++;
    }
  }

  const { metrics, averages } = buildMetrics(processesInput, completionTimes);
  return { timeline: mergeTimeline(timeline), metrics, averages };
}

function runAlgorithm(algorithm, processes, quantum) {
  switch (algorithm) {
    case "FCFS":
      return fcfs(processes);
    case "SJF":
      return sjfNonPreemptive(processes);
    case "SRTF":
      return srtf(processes);
    case "RR":
      return roundRobin(processes, quantum || 2);
    default:
      throw new Error(`Unknown algorithm: ${algorithm}`);
  }
}

module.exports = { fcfs, sjfNonPreemptive, srtf, roundRobin, runAlgorithm };
