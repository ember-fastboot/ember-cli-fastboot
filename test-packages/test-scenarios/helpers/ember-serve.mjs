import { execaNode } from 'execa';

export default async function emberServe(app) {
  return new Promise((resolve, reject) => {
    const process = execaNode('node_modules/ember-cli/bin/ember', ['serve', '-p', '0'], { cwd: app.dir });

    process.stdout.on('data', (value) => {
      const line = value.toString();
      const match = /Serving on http:\/\/localhost:(\d+)\//.exec(line);
      if (match) {
        resolve({
          port: match[1],
          stop() {
            return process.kill();
          },
        });
      }
    });
  });
}
