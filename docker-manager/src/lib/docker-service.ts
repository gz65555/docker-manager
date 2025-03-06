import Docker from 'dockerode';

// Create a singleton Docker instance
let dockerInstance: Docker | null = null;

export function getDockerInstance(): Docker {
  if (!dockerInstance) {
    dockerInstance = new Docker({
      socketPath: '/var/run/docker.sock',
    });
  }
  return dockerInstance;
}

// Container operations
export async function listContainers(all: boolean = true) {
  const docker = getDockerInstance();
  return await docker.listContainers({ all });
}

export async function startContainer(containerId: string) {
  const docker = getDockerInstance();
  const container = docker.getContainer(containerId);
  return await container.start();
}

export async function stopContainer(containerId: string) {
  const docker = getDockerInstance();
  const container = docker.getContainer(containerId);
  return await container.stop();
}

export async function restartContainer(containerId: string) {
  const docker = getDockerInstance();
  const container = docker.getContainer(containerId);
  return await container.restart();
}

export async function removeContainer(containerId: string, options = { force: true, v: true }) {
  const docker = getDockerInstance();
  const container = docker.getContainer(containerId);
  return await container.remove(options);
} 