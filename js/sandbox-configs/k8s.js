/* Kubernetes 실습 샌드박스 설정 */
(function () {
  const shortId = () => Math.random().toString(36).slice(2, 7);
  const pad = (s, n) => (String(s) + ' '.repeat(n)).slice(0, n);

  (window.SBX_CONFIGS = window.SBX_CONFIGS || {}).k8s = {
    title: 'kubectl sandbox — minikube',
    prompt: '$',
    banner: 'kubectl Sandbox — 가상 클러스터입니다. `help` 로 명령어 확인. 네임스페이스는 기본 default.',
    initialState: {
      ns: 'default',
      pods: [
        { name: 'nginx-7d9b-abc12', ns: 'default', ready: '1/1', status: 'Running', restarts: 0, age: '2h', image: 'nginx:1.25', node: 'minikube', owner: 'rs/nginx-7d9b' },
        { name: 'nginx-7d9b-def34', ns: 'default', ready: '1/1', status: 'Running', restarts: 0, age: '2h', image: 'nginx:1.25', node: 'minikube', owner: 'rs/nginx-7d9b' },
        { name: 'redis-0',          ns: 'default', ready: '1/1', status: 'Running', restarts: 1, age: '1d', image: 'redis:7-alpine', node: 'minikube', owner: 'sts/redis' }
      ],
      deployments: [ { name: 'nginx', ns: 'default', ready: '2/2', uptodate: 2, available: 2, age: '2h', image: 'nginx:1.25' } ],
      services: [
        { name: 'kubernetes', ns: 'default', type: 'ClusterIP', clusterIP: '10.96.0.1',   port: '443/TCP', age: '5d' },
        { name: 'nginx',      ns: 'default', type: 'ClusterIP', clusterIP: '10.96.30.12', port: '80/TCP',  age: '2h' }
      ],
      namespaces: ['default', 'kube-system', 'kube-public']
    },

    helpList: [
      'kubectl get nodes | pods | svc | deploy | ns   # 리소스 목록 (축약 가능)',
      'kubectl get pods -A                             # 전 네임스페이스',
      'kubectl get pods -o wide                        # IP/노드까지',
      'kubectl describe pod <name>                     # 상세',
      'kubectl create deployment <n> --image=<img>     # Deployment 생성',
      'kubectl scale deploy <n> --replicas=<N>         # 스케일',
      'kubectl expose deploy <n> --port=<p> --type=<T> # Service 노출',
      'kubectl logs <pod>                              # 로그',
      'kubectl exec <pod> -- <cmd>                     # 컨테이너 명령',
      'kubectl delete pod|deploy|svc <name>            # 삭제',
      'kubectl rollout restart deploy <n>              # 롤링 재시작',
      'kubectl apply -f <file>                         # YAML 적용 (시뮬)',
      'kubectl config current-context                  # 현재 컨텍스트',
      'kubectl version --short                         # 버전'
    ],

    commands: [
      { match: /^kubectl\s+version(\s+--short)?$/, run: () => 'Client Version: v1.30.1\nServer Version: v1.30.1' },
      { match: /^kubectl\s+config\s+current-context$/, run: () => 'minikube' },
      { match: /^kubectl\s+cluster-info$/, run: () => 'Kubernetes control plane is running at https://127.0.0.1:8443\nCoreDNS is running at https://127.0.0.1:8443/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy' },

      { match: /^kubectl\s+get\s+nodes$/, run: () => 'NAME       STATUS   ROLES           AGE   VERSION\nminikube   Ready    control-plane   5d    v1.30.1' },

      { match: /^kubectl\s+get\s+ns$/, run: (ctx) => 'NAME              STATUS   AGE\n' + ctx.state.namespaces.map(n => `${pad(n,17)} Active   5d`).join('\n') },

      { match: /^kubectl\s+get\s+pods?(\s+.+)?$/, run: (ctx, m) => {
        const args = (m[1] || '').trim();
        const allNs = /\s-A\b|\s--all-namespaces\b/.test(args);
        const wide = /\s-o\s+wide\b/.test(args);
        const nsMatch = args.match(/-n\s+(\S+)/); const ns = nsMatch ? nsMatch[1] : ctx.state.ns;
        const rows = (allNs ? ctx.state.pods : ctx.state.pods.filter(p => p.ns === ns));
        if (!rows.length) return `No resources found in ${ns} namespace.`;
        if (allNs) return 'NAMESPACE   NAME                   READY   STATUS    RESTARTS   AGE\n' + rows.map(p => [pad(p.ns,11), pad(p.name,22), pad(p.ready,7), pad(p.status,9), pad(p.restarts,10), p.age].join(' ')).join('\n');
        if (wide) return 'NAME                   READY   STATUS    RESTARTS   AGE   IP           NODE       IMAGE\n' + rows.map(p => [pad(p.name,22), pad(p.ready,7), pad(p.status,9), pad(p.restarts,10), pad(p.age,5), pad('10.244.0.'+(Math.floor(Math.random()*100)+10),12), pad(p.node,10), p.image].join(' ')).join('\n');
        return 'NAME                   READY   STATUS    RESTARTS   AGE\n' + rows.map(p => [pad(p.name,22), pad(p.ready,7), pad(p.status,9), pad(p.restarts,10), p.age].join(' ')).join('\n');
      }, hint: 'kubectl get pods [-A] [-o wide]' },

      { match: /^kubectl\s+get\s+(deploy|deployment|deployments)(\s+.+)?$/, run: (ctx) => {
        const rows = ctx.state.deployments;
        if (!rows.length) return 'No resources found.';
        return 'NAME    READY   UP-TO-DATE   AVAILABLE   AGE\n' + rows.map(d => [pad(d.name,7), pad(d.ready,7), pad(d.uptodate,12), pad(d.available,11), d.age].join(' ')).join('\n');
      }},

      { match: /^kubectl\s+get\s+(svc|service|services)(\s+.+)?$/, run: (ctx) => {
        const rows = ctx.state.services;
        return 'NAME         TYPE        CLUSTER-IP     PORT(S)     AGE\n' + rows.map(s => [pad(s.name,12), pad(s.type,11), pad(s.clusterIP,14), pad(s.port,11), s.age].join(' ')).join('\n');
      }},

      { match: /^kubectl\s+describe\s+pod\s+(\S+)$/, run: (ctx, m) => {
        const p = ctx.state.pods.find(x => x.name === m[1] || x.name.startsWith(m[1]));
        if (!p) return `Error from server (NotFound): pods "${m[1]}" not found`;
        return `Name:         ${p.name}\nNamespace:    ${p.ns}\nNode:         ${p.node}/10.0.0.5\nStatus:       ${p.status}\nIP:           10.244.0.${Math.floor(Math.random()*100)+10}\nControlled By: ${p.owner}\nContainers:\n  app:\n    Image:          ${p.image}\n    State:          Running\n    Ready:          True\n    Restart Count:  ${p.restarts}\nEvents:  (none)`;
      }},

      { match: /^kubectl\s+create\s+deployment\s+(\S+)\s+--image=(\S+)(\s+--replicas=(\d+))?$/, run: (ctx, m) => {
        const name = m[1], img = m[2], reps = +(m[4] || 1);
        if (ctx.state.deployments.some(d => d.name === name)) return `error: deployments.apps "${name}" already exists`;
        ctx.state.deployments.push({ name, ns: ctx.state.ns, ready: `${reps}/${reps}`, uptodate: reps, available: reps, age: 'just now', image: img });
        for (let i = 0; i < reps; i++) ctx.state.pods.push({ name: `${name}-${shortId()}-${shortId().slice(0,5)}`, ns: ctx.state.ns, ready: '1/1', status: 'Running', restarts: 0, age: 'just now', image: img, node: 'minikube', owner: `rs/${name}` });
        return `deployment.apps/${name} created`;
      }, hint: 'kubectl create deployment web --image=nginx:1.25 --replicas=2' },

      { match: /^kubectl\s+scale\s+deploy(ment)?\s+(\S+)\s+--replicas=(\d+)$/, run: (ctx, m) => {
        const name = m[2], want = +m[3];
        const d = ctx.state.deployments.find(x => x.name === name);
        if (!d) return `Error: deployment "${name}" not found`;
        const cur = ctx.state.pods.filter(p => p.name.startsWith(name + '-'));
        if (want > cur.length) { for (let i = 0; i < want - cur.length; i++) ctx.state.pods.push({ name: `${name}-${shortId()}-${shortId().slice(0,5)}`, ns: ctx.state.ns, ready: '1/1', status: 'Running', restarts: 0, age: 'just now', image: d.image, node: 'minikube', owner: `rs/${name}` }); }
        else if (want < cur.length) { const remove = cur.length - want; for (let i = 0; i < remove; i++) ctx.state.pods.splice(ctx.state.pods.indexOf(cur[i]), 1); }
        d.ready = `${want}/${want}`; d.uptodate = want; d.available = want;
        return `deployment.apps/${name} scaled`;
      }, hint: 'kubectl scale deploy web --replicas=5' },

      { match: /^kubectl\s+expose\s+deploy(ment)?\s+(\S+)\s+--port=(\d+)(\s+--type=(\S+))?$/, run: (ctx, m) => {
        const name = m[2], port = m[3], type = m[5] || 'ClusterIP';
        if (ctx.state.services.some(s => s.name === name)) return `error: services "${name}" already exists`;
        ctx.state.services.push({ name, ns: ctx.state.ns, type, clusterIP: '10.96.' + Math.floor(Math.random()*200+10) + '.' + Math.floor(Math.random()*200+10), port: port + '/TCP', age: 'just now' });
        return `service/${name} exposed`;
      }, hint: 'kubectl expose deploy web --port=80 --type=ClusterIP' },

      { match: /^kubectl\s+rollout\s+restart\s+deploy(ment)?\s+(\S+)$/, run: (ctx, m) => {
        const d = ctx.state.deployments.find(x => x.name === m[2]);
        if (!d) return `Error: not found`;
        return `deployment.apps/${m[2]} restarted`;
      }},

      { match: /^kubectl\s+logs\s+(\S+)(\s+-f)?$/, run: (ctx, m) => {
        const p = ctx.state.pods.find(x => x.name === m[1] || x.name.startsWith(m[1]));
        if (!p) return `Error: pod "${m[1]}" not found`;
        if (/nginx/.test(p.image)) return '10.244.0.1 - - "GET / HTTP/1.1" 200 615\n10.244.0.1 - - "GET /favicon.ico HTTP/1.1" 404 153';
        if (/redis/.test(p.image)) return '# Server initialized\n* Ready to accept connections tcp';
        return 'app started';
      }},

      { match: /^kubectl\s+exec\s+(\S+)\s+--\s+(.+)$/, run: (ctx, m) => {
        const p = ctx.state.pods.find(x => x.name === m[1] || x.name.startsWith(m[1]));
        if (!p) return `Error: pod "${m[1]}" not found`;
        const cmd = m[2].trim();
        if (cmd === 'hostname' || cmd === '/bin/hostname') return p.name;
        if (cmd === 'whoami') return 'root';
        if (cmd === 'ls' || cmd === 'ls /') return 'bin  boot  dev  etc  home  lib  proc  root  sys  tmp  usr  var';
        if (/^cat\s+\/etc\/os-release$/.test(cmd)) return 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.19\n';
        return `(시뮬레이터 미지원 명령: ${cmd})`;
      }},

      { match: /^kubectl\s+delete\s+(pod|deploy(ment)?|svc|service)\s+(\S+)$/, run: (ctx, m) => {
        const kind = m[1].startsWith('deploy') ? 'deploy' : (m[1].startsWith('svc') || m[1] === 'service') ? 'svc' : 'pod';
        const name = m[3];
        if (kind === 'pod') { const idx = ctx.state.pods.findIndex(p => p.name === name); if (idx < 0) return `Error: pod "${name}" not found`; ctx.state.pods.splice(idx, 1); return `pod "${name}" deleted`; }
        if (kind === 'deploy') { const idx = ctx.state.deployments.findIndex(d => d.name === name); if (idx < 0) return `Error: deploy "${name}" not found`; ctx.state.deployments.splice(idx, 1); ctx.state.pods = ctx.state.pods.filter(p => !p.name.startsWith(name + '-')); return `deployment.apps "${name}" deleted`; }
        const idx = ctx.state.services.findIndex(s => s.name === name); if (idx < 0) return `Error: svc "${name}" not found`; ctx.state.services.splice(idx, 1); return `service "${name}" deleted`;
      }},

      { match: /^kubectl\s+apply\s+-f\s+(\S+)$/, run: () => 'deployment.apps/example created\nservice/example created\n(시뮬: 실제 파일은 읽지 않음)' },

      { match: /^minikube\s+status$/, run: () => 'minikube\ntype: Control Plane\nhost: Running\nkubelet: Running\napiserver: Running\nkubeconfig: Configured' }
    ],

    challenges: [
      { goal: '1) 클러스터의 모든 네임스페이스에서 파드를 조회하세요.', hint: '`kubectl get pods -A`', answer: /^kubectl\s+get\s+pods?\s+(-A|--all-namespaces)\b.*$/, praise: '-A 는 --all-namespaces 축약.' },
      { goal: '2) `nginx:1.25` 이미지로 Deployment `web` 을 replicas 2 로 생성하세요.', hint: '`kubectl create deployment web --image=nginx:1.25 --replicas=2`', check: (cmd, s) => s.deployments.some(d => d.name === 'web'), praise: 'Deployment는 ReplicaSet을 관리하고, ReplicaSet이 Pod를 관리합니다.' },
      { goal: '3) `web` 을 5개로 스케일하세요.', hint: '`kubectl scale deploy web --replicas=5`', check: (cmd, s) => { const d = s.deployments.find(x => x.name === 'web'); return d && d.uptodate === 5; }, praise: '수평 확장: HPA 를 붙이면 CPU/메모리 기준 자동 스케일링 가능.' },
      { goal: '4) `web` 을 ClusterIP 80 으로 노출하세요.', hint: '`kubectl expose deploy web --port=80 --type=ClusterIP`', check: (cmd, s) => s.services.some(sv => sv.name === 'web' && sv.type === 'ClusterIP'), praise: 'ClusterIP 는 클러스터 내부 전용, 외부는 NodePort/LoadBalancer/Ingress 로.' },
      { goal: '5) `web` 파드 중 하나의 로그를 확인하세요.', hint: 'pod 이름 확인 후 `kubectl logs <이름>`', answer: /^kubectl\s+logs\s+web-\S+$/, praise: '`-f` 를 붙이면 실시간 스트리밍 (시뮬에선 static).' },
      { goal: '6) 마무리로 `web` Deployment 를 삭제하세요.', hint: '`kubectl delete deploy web`', check: (cmd, s) => !s.deployments.some(d => d.name === 'web'), praise: '연관 ReplicaSet·Pod 도 cascade 로 함께 삭제됩니다.' }
    ],

    complete: function (token, line, s) {
      const words = line.trim().split(/\s+/);
      const first = words[0] || '';
      const second = words[1] || '';
      const third = words[2] || '';
      const hasSpaceEnd = /\s$/.test(line);
      const wc = hasSpaceEnd ? words.length + 1 : words.length;
      if (wc <= 1) return ['kubectl','minikube','help','clear','reset','history'];
      if (first === 'kubectl' && wc === 2) return ['get','describe','create','apply','delete','logs','exec','scale','expose','rollout','config','cluster-info','version'];
      if (first === 'minikube' && wc === 2) return ['status','start','stop','dashboard'];
      if (first === 'kubectl' && second === 'get' && wc === 3) return ['pods','pod','deploy','deployments','svc','services','nodes','ns','all','rs','configmap','secret'];
      if (first === 'kubectl' && second === 'describe' && wc === 3) return ['pod','deploy','svc','node'];
      if (first === 'kubectl' && second === 'describe' && third === 'pod' && wc === 4) return (s.pods||[]).map(p=>p.name);
      if (first === 'kubectl' && (second === 'logs' || second === 'exec') && wc === 3) return (s.pods||[]).map(p=>p.name);
      if (first === 'kubectl' && second === 'delete' && wc === 3) return ['pod','deploy','deployment','svc','service'];
      if (first === 'kubectl' && second === 'delete' && third === 'pod' && wc === 4) return (s.pods||[]).map(p=>p.name);
      if (first === 'kubectl' && second === 'delete' && /deploy/.test(third) && wc === 4) return (s.deployments||[]).map(d=>d.name);
      if (first === 'kubectl' && second === 'delete' && /svc|service/.test(third) && wc === 4) return (s.services||[]).map(sv=>sv.name);
      if (first === 'kubectl' && second === 'scale' && wc === 3) return ['deploy','deployment'];
      if (first === 'kubectl' && second === 'scale' && /deploy/.test(third) && wc === 4) return (s.deployments||[]).map(d=>d.name);
      if (first === 'kubectl' && second === 'expose' && wc === 3) return ['deploy','deployment'];
      if (first === 'kubectl' && second === 'expose' && /deploy/.test(third) && wc === 4) return (s.deployments||[]).map(d=>d.name);
      if (first === 'kubectl' && second === 'rollout' && wc === 3) return ['restart','status','undo'];
      if (first === 'kubectl' && second === 'rollout' && wc === 4) return ['deploy','deployment'];
      if (first === 'kubectl' && second === 'rollout' && wc === 5) return (s.deployments||[]).map(d=>d.name);
      if (first === 'kubectl' && second === 'config' && wc === 3) return ['current-context','get-contexts','use-context'];
      if (first === 'kubectl' && second === 'apply' && wc === 3) return ['-f'];
      if (token.startsWith('--')) return ['--image=','--replicas=','--port=','--type=','--namespace=','--all-namespaces'];
      if (token === '-' || token.startsWith('-')) return ['-A','-o','-n','-f','--image=','--replicas=','--port=','--type='];
      return [];
    },

    links: [
      { name: 'Killercoda — Kubernetes', href: 'https://killercoda.com/kubernetes', desc: '브라우저 실제 K8s 실습' },
      { name: 'Play with Kubernetes', href: 'https://labs.play-with-k8s.com/', desc: '4시간 무료 클러스터' },
      { name: 'Minikube 공식 가이드', href: 'https://minikube.sigs.k8s.io/docs/start/', desc: '로컬 1노드 클러스터' }
    ]
  };
})();
