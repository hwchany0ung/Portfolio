/* Docker 실습 샌드박스 설정 */
(function () {
  const pad = (s, n) => (s + ' '.repeat(n)).slice(0, n);
  const shortId = () => Math.random().toString(16).slice(2, 14);
  const now = () => new Date().toISOString().replace('T', ' ').slice(0, 19);

  function formatPs(list, all) {
    const rows = (all ? list : list.filter(c => c.status.startsWith('Up')));
    if (!rows.length) return 'CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES\n(실행 중인 컨테이너 없음 — `docker run` 으로 시작)';
    const head = 'CONTAINER ID   IMAGE                 COMMAND                  CREATED          STATUS         PORTS                  NAMES';
    return head + '\n' + rows.map(c =>
      [pad(c.id.slice(0, 12), 14), pad(c.image, 21), pad('"' + (c.cmd || '-') + '"', 24), pad(c.created, 16), pad(c.status, 14), pad(c.ports || '-', 22), c.name].join(' ')
    ).join('\n');
  }

  const IMG_DB = {
    'nginx':   { cmd: 'nginx -g daemon off;', default_port: '80/tcp' },
    'alpine':  { cmd: '/bin/sh',               default_port: '-' },
    'redis':   { cmd: 'redis-server',          default_port: '6379/tcp' },
    'postgres':{ cmd: 'postgres',              default_port: '5432/tcp' },
    'mysql':   { cmd: 'mysqld',                default_port: '3306/tcp' },
    'node':    { cmd: 'node',                  default_port: '-' },
    'ubuntu':  { cmd: '/bin/bash',             default_port: '-' }
  };

  (window.SBX_CONFIGS = window.SBX_CONFIGS || {}).docker = {
    title: 'docker-sandbox — user@lab',
    prompt: '$',
    banner: 'Docker Sandbox v1 — 시뮬레이션 환경입니다. `help` 로 명령어 확인, `reset` 으로 초기화.',
    initialState: {
      containers: [
        { id: 'a1b2c3d4e5f6', name: 'web',   image: 'nginx:latest',      cmd: 'nginx -g daemon off;', created: '2 hours ago',  status: 'Up 2 hours',  ports: '0.0.0.0:8080->80/tcp' },
        { id: 'f6e5d4c3b2a1', name: 'cache', image: 'redis:7-alpine',    cmd: 'redis-server',          created: '3 hours ago',  status: 'Up 3 hours',  ports: '6379/tcp' }
      ],
      images: [
        { repo: 'nginx',      tag: 'latest',     id: 'a8b7f6e5d4c3', size: '142MB',  created: '2 weeks ago' },
        { repo: 'redis',      tag: '7-alpine',   id: 'b9a8c7d6e5f4', size: '40.2MB', created: '10 days ago' },
        { repo: 'alpine',     tag: 'latest',     id: 'c1d2e3f4a5b6', size: '7.8MB',  created: '1 month ago' },
        { repo: 'postgres',   tag: '16-alpine',  id: 'd2e3f4a5b6c7', size: '245MB',  created: '1 week ago' },
        { repo: 'node',       tag: '20-alpine',  id: 'e3f4a5b6c7d8', size: '178MB',  created: '3 days ago' }
      ],
      networks: [
        { id: 'n0001bridge01', name: 'bridge',  driver: 'bridge', scope: 'local' },
        { id: 'n0002host0001', name: 'host',    driver: 'host',   scope: 'local' },
        { id: 'n0003none0001', name: 'none',    driver: 'null',   scope: 'local' }
      ],
      volumes: [
        { name: 'pgdata',     driver: 'local' },
        { name: 'redis_data', driver: 'local' }
      ]
    },

    helpList: [
      'docker ps [-a]                           # 컨테이너 목록 (-a: 중지된 것 포함)',
      'docker images                            # 이미지 목록',
      'docker run [-d] [-p H:C] [--name N] IMG  # 컨테이너 실행 (예: docker run -d -p 80:80 nginx)',
      'docker stop <id|name>                    # 컨테이너 중지',
      'docker start <id|name>                   # 중지된 컨테이너 기동',
      'docker rm [-f] <id|name>                 # 컨테이너 삭제',
      'docker rmi <image>                       # 이미지 삭제',
      'docker logs <id|name>                    # 컨테이너 로그',
      'docker exec -it <id|name> <cmd>          # 컨테이너 내부 명령',
      'docker pull <image>[:tag]                # 이미지 받기',
      'docker network ls | create <name>        # 네트워크 목록/생성',
      'docker volume ls  | create <name>        # 볼륨 목록/생성',
      'docker build -t <name> .                 # 이미지 빌드 (가상)',
      'docker inspect <id|name>                 # 상세 정보',
      'docker system prune -f                   # 미사용 정리',
      'docker-compose up [-d] | down            # Compose 기동/종료'
    ],

    commands: [
      { match: /^docker\s+version$/, run: () => 'Client: Docker Engine - Community\n Version: 26.0.0\n API version: 1.45\nServer: Docker Engine - Community\n Engine: 26.0.0 (simulated)\n containerd: 1.7.14\n runc: 1.1.12' },
      { match: /^docker\s+info$/, run: (ctx) => `Containers: ${ctx.state.containers.length}\n Running: ${ctx.state.containers.filter(c=>c.status.startsWith('Up')).length}\n Stopped: ${ctx.state.containers.filter(c=>!c.status.startsWith('Up')).length}\nImages: ${ctx.state.images.length}\nServer Version: 26.0.0\nStorage Driver: overlay2\nKernel Version: 6.8.0-sim (simulated)` },

      { match: /^docker\s+ps(\s+-a)?$/, run: (ctx, m) => formatPs(ctx.state.containers, !!m[1]) },

      { match: /^docker\s+images$/, run: (ctx) => {
        const h = 'REPOSITORY       TAG          IMAGE ID       CREATED          SIZE';
        return h + '\n' + ctx.state.images.map(i => [pad(i.repo, 16), pad(i.tag, 12), pad(i.id, 14), pad(i.created, 16), i.size].join(' ')).join('\n');
      }},

      { match: /^docker\s+pull\s+([\w\-.\/]+)(:[\w.\-]+)?$/, run: (ctx, m) => {
        const repo = m[1]; const tag = (m[2] || ':latest').slice(1);
        if (ctx.state.images.some(i => i.repo === repo && i.tag === tag)) return `${tag}: Pulling from library/${repo}\nDigest: sha256:${shortId()}${shortId()}\nStatus: Image is up to date for ${repo}:${tag}`;
        ctx.state.images.push({ repo, tag, id: shortId(), size: '100MB', created: 'just now' });
        return `${tag}: Pulling from library/${repo}\n${shortId().slice(0,12)}: Pull complete\n${shortId().slice(0,12)}: Pull complete\nDigest: sha256:${shortId()}${shortId()}\nStatus: Downloaded newer image for ${repo}:${tag}`;
      }},

      { match: /^docker\s+run\s+(.+)$/, run: (ctx, m) => {
        const tokens = m[1].split(/\s+/);
        let detach = false, name = null, ports = null, image = null;
        for (let i = 0; i < tokens.length; i++) {
          const t = tokens[i];
          if (t === '-d' || t === '--detach') detach = true;
          else if (t === '-it' || t === '-ti' || t === '-i' || t === '-t') {}
          else if (t === '--name') name = tokens[++i];
          else if (t === '-p' || t === '--publish') ports = tokens[++i];
          else if (t.startsWith('-')) {}
          else if (!image) { image = t; break; }
        }
        if (!image) throw new Error('docker: "run" requires at least 1 argument.');
        const [repoRaw, tag] = image.split(':');
        const meta = IMG_DB[repoRaw] || { cmd: '-', default_port: '-' };
        const id = shortId();
        name = name || repoRaw + '_' + id.slice(0, 4);
        const portStr = ports ? `0.0.0.0:${ports.split(':')[0]}->${ports.split(':')[1]}/tcp` : (meta.default_port !== '-' ? meta.default_port : '-');
        ctx.state.containers.push({ id, name, image: image.includes(':') ? image : image + ':latest', cmd: meta.cmd, created: 'just now', status: 'Up just now', ports: portStr });
        return detach ? id : `[+] Running ${image}\n(컨테이너가 포그라운드로 기동되었다고 가정 · 종료하려면 Ctrl+C — 시뮬레이션)\nContainer ID: ${id}`;
      }, hint: 'docker run -d -p 80:80 --name web nginx' },

      { match: /^docker\s+stop\s+(\S+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error(`Error: No such container: ${m[1]}`);
        c.status = 'Exited (0) just now';
        return m[1];
      }},
      { match: /^docker\s+start\s+(\S+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error(`Error: No such container: ${m[1]}`);
        c.status = 'Up just now';
        return m[1];
      }},
      { match: /^docker\s+restart\s+(\S+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error(`Error: No such container: ${m[1]}`);
        c.status = 'Up just now (restarted)';
        return m[1];
      }},

      { match: /^docker\s+rm\s+(-f\s+)?(\S+)$/, run: (ctx, m) => {
        const force = !!m[1]; const key = m[2];
        const idx = ctx.state.containers.findIndex(x => x.id.startsWith(key) || x.name === key);
        if (idx < 0) throw new Error(`Error: No such container: ${key}`);
        const c = ctx.state.containers[idx];
        if (c.status.startsWith('Up') && !force) throw new Error('Error: cannot remove a running container (use -f)');
        ctx.state.containers.splice(idx, 1);
        return key;
      }},

      { match: /^docker\s+rmi\s+(\S+)$/, run: (ctx, m) => {
        const [r, t = 'latest'] = m[1].split(':');
        const idx = ctx.state.images.findIndex(i => i.repo === r && i.tag === t);
        if (idx < 0) throw new Error(`Error: No such image: ${m[1]}`);
        ctx.state.images.splice(idx, 1);
        return `Untagged: ${r}:${t}\nDeleted: sha256:${shortId()}${shortId()}`;
      }},

      { match: /^docker\s+logs\s+(\S+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error(`Error: No such container: ${m[1]}`);
        if (c.image.startsWith('nginx')) return `${now()} [notice] start worker processes\n${now()} [notice] start worker process 29\n${now()} 172.17.0.1 - - "GET / HTTP/1.1" 200 615 "-" "curl/8.0"`;
        if (c.image.startsWith('redis')) return `${now()} # Server initialized\n${now()} * Ready to accept connections tcp`;
        return `${now()} starting ${c.image}\n${now()} ready`;
      }},

      { match: /^docker\s+exec\s+-?i?t?\s*(\S+)\s+(.+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error(`Error: No such container: ${m[1]}`);
        const cmd = m[2].trim();
        if (cmd === 'ls' || cmd === 'ls /') return 'bin\nboot\ndev\netc\nhome\nlib\nproc\nroot\nsys\ntmp\nusr\nvar';
        if (/^ls\s+\/etc/.test(cmd)) return 'hostname\nhosts\nnginx\npasswd\nresolv.conf';
        if (cmd === 'hostname') return c.id.slice(0, 12);
        if (cmd === 'whoami') return 'root';
        if (cmd === 'uname -a') return `Linux ${c.id.slice(0,12)} 6.8.0-sim #1 SMP x86_64 GNU/Linux`;
        if (/^cat\s+\/etc\/os-release$/.test(cmd)) return 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.19\n';
        if (/^ps/.test(cmd)) return 'PID   USER     COMMAND\n1     root     ' + c.cmd;
        if (cmd === 'bash' || cmd === 'sh' || cmd === '/bin/bash' || cmd === '/bin/sh') return '(시뮬레이터는 인터랙티브 쉘 진입을 지원하지 않아요. 개별 명령으로 exec 하세요: `docker exec <c> ls`)';
        return `sh: ${cmd.split(' ')[0]}: not found (시뮬레이터 미지원)`;
      }},

      { match: /^docker\s+network\s+ls$/, run: (ctx) => 'NETWORK ID     NAME      DRIVER    SCOPE\n' + ctx.state.networks.map(n => [pad(n.id.slice(0,12),14), pad(n.name,9), pad(n.driver,9), n.scope].join(' ')).join('\n') },
      { match: /^docker\s+network\s+create\s+(\S+)$/, run: (ctx, m) => {
        if (ctx.state.networks.some(n => n.name === m[1])) throw new Error('Error: network with name ' + m[1] + ' already exists');
        const id = shortId();
        ctx.state.networks.push({ id, name: m[1], driver: 'bridge', scope: 'local' });
        return id;
      }},
      { match: /^docker\s+network\s+inspect\s+(\S+)$/, run: (ctx, m) => {
        const n = ctx.state.networks.find(x => x.name === m[1]);
        if (!n) throw new Error('Error: No such network: ' + m[1]);
        return JSON.stringify([{ Name: n.name, Driver: n.driver, Scope: n.scope, IPAM: { Config: [{ Subnet: '172.18.0.0/16', Gateway: '172.18.0.1' }] }, Containers: {} }], null, 2);
      }},

      { match: /^docker\s+volume\s+ls$/, run: (ctx) => 'DRIVER    VOLUME NAME\n' + ctx.state.volumes.map(v => pad(v.driver, 10) + v.name).join('\n') },
      { match: /^docker\s+volume\s+create\s+(\S+)$/, run: (ctx, m) => {
        if (ctx.state.volumes.some(v => v.name === m[1])) throw new Error('Error: volume exists');
        ctx.state.volumes.push({ name: m[1], driver: 'local' });
        return m[1];
      }},

      { match: /^docker\s+build\s+(.+)$/, run: (ctx, m) => {
        const tMatch = m[1].match(/-t\s+(\S+)/);
        const tag = tMatch ? tMatch[1] : 'app:latest';
        const [r, t = 'latest'] = tag.split(':');
        ctx.state.images.push({ repo: r, tag: t, id: shortId(), size: '120MB', created: 'just now' });
        return `[+] Building 0.8s (12/12) FINISHED\n => [internal] load build definition\n => [1/5] FROM node:20-alpine\n => [2/5] WORKDIR /app\n => [3/5] COPY package*.json ./\n => [4/5] RUN npm ci\n => [5/5] COPY . .\n => exporting to image\n => => writing image sha256:${shortId()}\n => => naming to docker.io/library/${tag}\nSuccessfully built.`;
      }, hint: 'docker build -t myapp:1.0 .' },

      { match: /^docker\s+inspect\s+(\S+)$/, run: (ctx, m) => {
        const c = ctx.state.containers.find(x => x.id.startsWith(m[1]) || x.name === m[1]);
        if (!c) throw new Error('Error: No such object: ' + m[1]);
        return JSON.stringify([{ Id: c.id, Name: '/' + c.name, Image: c.image, State: { Status: c.status.startsWith('Up') ? 'running' : 'exited' }, NetworkSettings: { IPAddress: '172.17.0.' + (Math.floor(Math.random()*100)+2) } }], null, 2);
      }},

      { match: /^docker\s+system\s+prune(\s+-f)?$/, run: (ctx) => {
        const removed = ctx.state.containers.filter(c => !c.status.startsWith('Up'));
        ctx.state.containers = ctx.state.containers.filter(c => c.status.startsWith('Up'));
        return `Deleted Containers: ${removed.length}\nTotal reclaimed space: ${removed.length * 40}MB`;
      }},

      { match: /^docker-compose\s+up(\s+-d)?$/, run: (ctx) => {
        ['web', 'db', 'cache'].forEach(n => {
          if (!ctx.state.containers.some(c => c.name === 'app_' + n)) {
            ctx.state.containers.push({ id: shortId(), name: 'app_' + n, image: n === 'web' ? 'nginx:alpine' : n === 'db' ? 'postgres:16-alpine' : 'redis:7-alpine', cmd: '-', created: 'just now', status: 'Up just now', ports: n === 'web' ? '0.0.0.0:80->80/tcp' : '-' });
          }
        });
        return '[+] Running 3/3\n ✔ Container app_db     Started\n ✔ Container app_cache  Started\n ✔ Container app_web    Started';
      }},
      { match: /^docker-compose\s+down$/, run: (ctx) => {
        const before = ctx.state.containers.length;
        ctx.state.containers = ctx.state.containers.filter(c => !c.name.startsWith('app_'));
        return `[+] Running ${before - ctx.state.containers.length}/${before - ctx.state.containers.length}\n ✔ Container app_web     Removed\n ✔ Container app_cache   Removed\n ✔ Container app_db      Removed`;
      }},

      { match: /^kubectl\b/, run: () => 'kubectl 은 상단 탭에서 Kubernetes 로 전환하세요 🙂' }
    ],

    challenges: [
      { goal: '1) `docker ps` 로 현재 실행 중인 컨테이너 목록을 확인하세요.', hint: '그대로 `docker ps` 를 입력합니다.', answer: /^docker\s+ps\s*$/, praise: '실행 중인 컨테이너만 뜨고, -a 옵션을 주면 중지된 것도 포함됩니다.' },
      { goal: '2) nginx 이미지를 80:80 으로 백그라운드 실행하세요. 이름은 `demo` 로.', hint: '`docker run -d -p 80:80 --name demo nginx`', check: (cmd, s) => s.containers.some(c => c.name === 'demo' && /nginx/.test(c.image) && /80->80/.test(c.ports || '')), praise: '-d 는 detach, -p 는 publish(host:container), --name 으로 이름 지정.' },
      { goal: '3) 방금 만든 `demo` 컨테이너를 중지한 뒤 삭제하세요.', hint: '먼저 `docker stop demo` 그 다음 `docker rm demo`. 한 번에 하려면 `docker rm -f demo`.', check: (cmd, s) => !s.containers.some(c => c.name === 'demo'), praise: '실행 중 컨테이너는 -f 없이는 rm 불가 — 안전장치!' },
      { goal: '4) `app-net` 이라는 사용자 정의 브리지 네트워크를 생성하세요.', hint: '`docker network create app-net`', check: (cmd, s) => s.networks.some(n => n.name === 'app-net'), praise: '사용자 정의 브리지는 기본 bridge와 달리 컨테이너 이름 DNS가 자동입니다.' },
      { goal: '5) `myapp:1.0` 이미지를 빌드(시뮬)하고 `docker images` 로 확인하세요.', hint: '`docker build -t myapp:1.0 .` → `docker images`', check: (cmd, s) => s.images.some(i => i.repo === 'myapp' && i.tag === '1.0'), praise: '이미지 태깅은 `repo:tag` 규칙. 운영에서는 digest 핀닝을 권장합니다.' },
      { goal: '6) `docker-compose up -d` 로 스택을 기동하고, `docker ps` 로 3개(web/db/cache) 가 뜨는지 확인하세요.', hint: '`docker-compose up -d`', check: (cmd, s) => ['app_web','app_db','app_cache'].every(n => s.containers.some(c => c.name === n)), praise: 'Compose는 서비스명이 DNS로 해석됩니다 — web → db:5432 로 바로 연결 가능!' }
    ],

    complete: function (token, line, s) {
      const words = line.trim().split(/\s+/);
      const first = words[0] || '';
      const second = words[1] || '';
      const hasSpaceEnd = /\s$/.test(line);
      const wc = hasSpaceEnd ? words.length + 1 : words.length;
      if (wc <= 1) return ['docker', 'docker-compose', 'help', 'clear', 'reset', 'history'];
      if (first === 'docker' && wc === 2) return ['ps','images','run','stop','start','restart','rm','rmi','pull','logs','exec','build','network','volume','inspect','system','version','info'];
      if (first === 'docker-compose' && wc === 2) return ['up','down','ps','logs','restart'];
      if (first === 'docker' && second === 'network' && wc === 3) return ['ls','create','inspect','rm'];
      if (first === 'docker' && second === 'volume' && wc === 3) return ['ls','create','inspect','rm'];
      if (first === 'docker' && second === 'system' && wc === 3) return ['prune','df','info'];
      if (first === 'docker' && ['stop','start','restart','rm','logs','inspect','exec'].includes(second) && wc === 3) return (s.containers||[]).map(c=>c.name).concat((s.containers||[]).map(c=>c.id.slice(0,12)));
      if (first === 'docker' && second === 'rmi' && wc === 3) return (s.images||[]).map(i=>`${i.repo}:${i.tag}`);
      if (first === 'docker' && second === 'pull' && wc === 3) return ['nginx','alpine','redis','postgres','mysql','node','ubuntu','python','golang'];
      if (first === 'docker' && second === 'run') {
        if (token.startsWith('-')) return ['-d','-it','-p','--name','--rm','--network','--env','-v'];
        return ['nginx','alpine','redis','postgres','mysql','node','ubuntu'];
      }
      return [];
    },

    links: [
      { name: 'Play with Docker', href: 'https://labs.play-with-docker.com/', desc: '무료 4시간 Docker 환경 (로그인 필요)' },
      { name: 'Killercoda — Docker', href: 'https://killercoda.com/docker', desc: '브라우저 인터랙티브 실습' },
      { name: 'Docker Official Tutorial', href: 'https://docs.docker.com/get-started/', desc: '공식 Getting Started 가이드' }
    ]
  };
})();
