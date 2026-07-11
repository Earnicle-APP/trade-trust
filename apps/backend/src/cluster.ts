import cluster from 'node:cluster';
import os from 'node:os';
import process from 'node:process';

const numCpus = os.availableParallelism();

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);
  console.log(`Forking ${numCpus} workers...`);

  for (let i = 0; i < numCpus; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.warn(
      `Worker ${worker.process.pid} died (code: ${code}, signal: ${signal}). Restarting...`,
    );
    cluster.fork();
  });
} else {
  import('./main.js');
}
