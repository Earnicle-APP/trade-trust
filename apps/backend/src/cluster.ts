import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

const numCpus = os.availableParallelism();
const maxRetries = 10;
let retryCount = 0;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${numCpus} workers...`);

  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    if (signal === 'SIGTERM' || signal === 'SIGINT') {
      console.log(`Worker ${worker.process.pid} exited gracefully (${signal})`);
      return;
    }

    if (code === 0) {
      return;
    }

    retryCount++;

    if (retryCount > maxRetries) {
      console.error(
        `Workers crashed ${maxRetries} times — giving up. Restart manually.`,
      );
      process.exit(1);
    }

    console.warn(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting (${retryCount}/${maxRetries})...`,
    );
    cluster.fork();
  });

  process.on('SIGTERM', () => {
    console.log('Primary received SIGTERM — shutting down workers...');
    for (const id in cluster.workers) {
      cluster.workers[id]?.kill('SIGTERM');
    }
    process.exit(0);
  });
} else {
  import('./main.js');
}
