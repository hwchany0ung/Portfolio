/* Linux 실습 샌드박스 설정 */
(function () {
  const HOME = '/home/chany';
  const FS = {
    '/': ['bin','boot','dev','etc','home','lib','opt','proc','root','sbin','tmp','usr','var'],
    '/home': ['chany'],
    '/home/chany': ['.bashrc','.profile','.ssh','projects','notes.txt','todo.md'],
    '/home/chany/projects': ['portfolio','sandbox.c'],
    '/home/chany/.ssh': ['authorized_keys','id_rsa','id_rsa.pub','known_hosts'],
    '/etc': ['passwd','group','shadow','hostname','hosts','resolv.conf','fstab','ssh'],
    '/etc/ssh': ['sshd_config','ssh_config'],
    '/var': ['log','www','spool'],
    '/var/log': ['messages','secure','cron','dmesg'],
    '/proc': ['cpuinfo','meminfo','mounts','version']
  };
  const FILES = {
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nchany:x:1000:1000:chany:/home/chany:/bin/bash\nsshd:x:74:74:sshd:/var/empty/sshd:/sbin/nologin',
    '/etc/hostname': 'lab',
    '/etc/hosts': '127.0.0.1   localhost\n10.0.0.10   lab',
    '/etc/resolv.conf': 'nameserver 8.8.8.8\nnameserver 1.1.1.1',
    '/etc/fstab': '# <device>         <mnt>   <type>  <opt>          <dump> <pass>\nUUID=abcd-1234     /       ext4    defaults        1  1\nUUID=efgh-5678     /home   xfs     defaults        1  2\ntmpfs             /tmp    tmpfs   defaults,size=1G 0  0',
    '/etc/ssh/sshd_config': 'Port 22\nPermitRootLogin no\nPasswordAuthentication no\nPubkeyAuthentication yes',
    '/proc/cpuinfo': 'processor\t: 0\nmodel name\t: Intel(R) Xeon(R) (simulated)\ncpu MHz\t\t: 2400.000',
    '/proc/meminfo': 'MemTotal:        8048324 kB\nMemFree:         5123456 kB\nMemAvailable:    6212345 kB',
    '/proc/version': 'Linux version 6.8.0-sim (gcc 13.2.0) #1 SMP (simulated)',
    '/home/chany/notes.txt': 'Linux 실습 메모\n- SSH 키 퍼미션 확인\n- systemctl status sshd',
    '/home/chany/todo.md': '# TODO\n- [x] 포트폴리오 AWS 페이지\n- [ ] Docker 이미지 멀티스테이지'
  };
  const norm = (cwd, p) => {
    if (!p) return cwd;
    if (p === '~' || p === '~/') return HOME;
    if (p.startsWith('~/')) p = HOME + p.slice(1);
    let abs = p.startsWith('/') ? p : cwd.replace(/\/$/, '') + '/' + p;
    const parts = []; abs.split('/').forEach(s => { if (s === '' || s === '.') return; if (s === '..') parts.pop(); else parts.push(s); });
    return '/' + parts.join('/');
  };
  function modeStr(oct) {
    const v = String(oct).padStart(3, '0').slice(-3);
    const bits = ['---','--x','-w-','-wx','r--','r-x','rw-','rwx'];
    return bits[+v[0]] + bits[+v[1]] + bits[+v[2]];
  }

  (window.SBX_CONFIGS = window.SBX_CONFIGS || {}).linux = {
    title: 'chany@lab:~$',
    prompt: 'chany@lab:~$',
    banner: 'Linux Sandbox v1 — 가상 파일시스템입니다. `help` 로 명령어 확인, `reset` 으로 초기화.',
    initialState: {
      cwd: HOME,
      users: ['root','chany','sshd'],
      services: { sshd: 'active (running)', httpd: 'inactive (dead)', firewalld: 'active (running)', crond: 'active (running)' },
      perms: { '/home/chany/.ssh/id_rsa': '600', '/home/chany/.ssh/authorized_keys': '644', '/home/chany/.ssh': '700' }
    },
    helpList: [
      'pwd                  # 현재 경로',
      'ls [-l] [path]       # 목록 (-l: 자세히)',
      'cd <path>            # 이동 (~ 홈, .. 상위)',
      'cat <file>           # 파일 내용',
      'echo "text"          # 출력',
      'whoami | id | hostname',
      'ps | ps aux          # 프로세스',
      'uname -a             # 커널',
      'free -h | df -h | uptime',
      'ip a | ip route      # 네트워크',
      'systemctl status <svc>  # 서비스 상태 (sshd/httpd/firewalld/crond)',
      'systemctl start/stop/restart <svc>',
      'useradd <name> | userdel <name> | passwd <name>',
      'chmod <mode> <file>  # 권한 변경 (예: chmod 600 ~/.ssh/id_rsa)',
      'mkdir <d> | touch <f> | rm [-rf] <path>',
      'grep <pat> <file>    # (간이)',
      'history              # 명령 히스토리'
    ],
    commands: [
      { match: /^pwd$/, run: (ctx) => ctx.state.cwd },
      { match: /^whoami$/, run: () => 'chany' },
      { match: /^id$/, run: () => 'uid=1000(chany) gid=1000(chany) groups=1000(chany),10(wheel)' },
      { match: /^hostname$/, run: () => 'lab' },
      { match: /^uname\s+-a$/, run: () => 'Linux lab 6.8.0-sim #1 SMP x86_64 GNU/Linux' },
      { match: /^uptime$/, run: () => ' 09:42:13 up 3 days,  2:14,  1 user,  load average: 0.05, 0.04, 0.08' },
      { match: /^free\s+-h$/, run: () => '              total        used        free      shared  buff/cache   available\nMem:           7.7G        1.8G        4.9G        88M        1.0G        5.7G\nSwap:          2.0G          0B        2.0G' },
      { match: /^df\s+-h$/, run: () => 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   12G   36G  26% /\n/dev/sdb1       100G   40G   56G  42% /home\ntmpfs           3.9G     0  3.9G   0% /dev/shm\ntmpfs           1.0G   28M  997M   3% /tmp' },
      { match: /^ip\s+a(ddr)?$/, run: () => '1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 10.0.0.10/24 brd 10.0.0.255 scope global eth0\n    inet6 fe80::a00:27ff:fe00:10/64 scope link' },
      { match: /^ip\s+route$/, run: () => 'default via 10.0.0.1 dev eth0\n10.0.0.0/24 dev eth0 proto kernel scope link src 10.0.0.10' },

      { match: /^ls(\s+.*)?$/, run: (ctx, m) => {
        const args = (m[1] || '').trim().split(/\s+/).filter(Boolean);
        const long = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const path = args.filter(a => !a.startsWith('-'))[0] || ctx.state.cwd;
        const abs = norm(ctx.state.cwd, path);
        const list = FS[abs];
        if (!list) return `ls: cannot access '${path}': No such file or directory`;
        if (!long) return list.join('  ');
        return list.map(name => {
          const full = abs.replace(/\/$/, '') + '/' + name;
          const isDir = !!FS[full];
          const mode = ctx.state.perms[full] || (isDir ? '755' : '644');
          const perm = (isDir ? 'd' : '-') + modeStr(mode);
          const size = isDir ? 4096 : (FILES[full] ? FILES[full].length : 0);
          return `${perm} 1 chany chany ${String(size).padStart(5)} Apr 10 09:00 ${name}`;
        }).join('\n');
      }},

      { match: /^cd(\s+.+)?$/, run: (ctx, m) => {
        const target = (m[1] || ' ~').trim();
        const abs = norm(ctx.state.cwd, target);
        if (!FS[abs]) return `cd: ${target}: No such file or directory`;
        ctx.state.cwd = abs; return '';
      }},

      { match: /^cat\s+(.+)$/, run: (ctx, m) => {
        const abs = norm(ctx.state.cwd, m[1].trim());
        if (FS[abs]) return `cat: ${m[1]}: Is a directory`;
        if (FILES[abs] == null) return `cat: ${m[1]}: No such file or directory`;
        return FILES[abs];
      }},

      { match: /^echo\s+(.+)$/, run: (ctx, m) => m[1].replace(/^['"]|['"]$/g, '') },
      { match: /^mkdir\s+(.+)$/, run: (ctx, m) => { const abs = norm(ctx.state.cwd, m[1].trim()); if (FS[abs]) return `mkdir: ${m[1]}: exists`; FS[abs]=[]; const p = abs.split('/').slice(0,-1).join('/')||'/'; if (FS[p]) FS[p].push(abs.split('/').pop()); return ''; }},
      { match: /^touch\s+(.+)$/, run: (ctx, m) => { const abs = norm(ctx.state.cwd, m[1].trim()); if (FILES[abs] == null) FILES[abs]=''; const p = abs.split('/').slice(0,-1).join('/')||'/'; const name = abs.split('/').pop(); if (FS[p] && !FS[p].includes(name)) FS[p].push(name); return ''; }},
      { match: /^rm\s+(-rf?\s+)?(.+)$/, run: (ctx, m) => {
        const abs = norm(ctx.state.cwd, m[2].trim());
        if (FS[abs] && !m[1]) return `rm: ${m[2]}: is a directory (use -r)`;
        const p = abs.split('/').slice(0,-1).join('/')||'/'; const name = abs.split('/').pop();
        delete FILES[abs]; delete FS[abs];
        if (FS[p]) FS[p] = FS[p].filter(n => n !== name);
        return '';
      }},

      { match: /^ps(\s+aux)?$/, run: (ctx, m) => {
        const full = !!m[1];
        const rows = [
          { pid: 1, u:'root', cmd:'/sbin/init' },
          { pid: 523, u:'root', cmd:'/usr/sbin/sshd -D' },
          { pid: 612, u:'root', cmd:'/usr/sbin/crond -n' },
          { pid: 1420, u:'chany', cmd:'-bash' },
          { pid: 2210, u:'chany', cmd:'ps' + (full ? ' aux':'') }
        ];
        if (!full) return 'PID  TTY      TIME     CMD\n' + rows.filter(r=>r.u==='chany').map(r => `${String(r.pid).padStart(4)}  pts/0    00:00:00 ${r.cmd.replace(/^-/, '')}`).join('\n');
        return 'USER       PID %CPU %MEM     VSZ    RSS TTY    STAT START   TIME COMMAND\n' + rows.map(r => `${r.u.padEnd(10)} ${String(r.pid).padStart(3)}  0.0  0.1  22456   3210 ?      Ss   09:00   0:00 ${r.cmd}`).join('\n');
      }},

      { match: /^systemctl\s+status\s+(\S+)$/, run: (ctx, m) => {
        const s = ctx.state.services[m[1]];
        if (!s) return `Unit ${m[1]}.service could not be found.`;
        return `● ${m[1]}.service - ${m[1]} daemon\n   Loaded: loaded (/usr/lib/systemd/system/${m[1]}.service; enabled)\n   Active: ${s} since Mon 2026-04-15 10:00:00`;
      }},
      { match: /^systemctl\s+(start|stop|restart|reload)\s+(\S+)$/, run: (ctx, m) => {
        if (!(m[2] in ctx.state.services)) return `Unit ${m[2]}.service could not be found.`;
        ctx.state.services[m[2]] = (m[1] === 'stop') ? 'inactive (dead)' : 'active (running)';
        return '';
      }},
      { match: /^systemctl\s+list-units\s+--type=service$/, run: (ctx) => 'UNIT              LOAD   ACTIVE SUB     DESCRIPTION\n' + Object.keys(ctx.state.services).map(k => `${(k+'.service').padEnd(18)} loaded ${ctx.state.services[k].padEnd(8)} ${k} daemon`).join('\n') },

      { match: /^useradd\s+(\S+)$/, run: (ctx, m) => { if (ctx.state.users.includes(m[1])) return `useradd: user '${m[1]}' already exists`; ctx.state.users.push(m[1]); return ''; }},
      { match: /^userdel\s+(\S+)$/, run: (ctx, m) => { const i = ctx.state.users.indexOf(m[1]); if (i<0) return `userdel: user '${m[1]}' does not exist`; ctx.state.users.splice(i,1); return ''; }},
      { match: /^passwd\s+(\S+)$/, run: (ctx, m) => ctx.state.users.includes(m[1]) ? `(${m[1]} 비밀번호 변경 — 시뮬)` : `passwd: Unknown user ${m[1]}` },
      { match: /^cat\s+\/etc\/passwd$/i, run: () => FILES['/etc/passwd'] },

      { match: /^chmod\s+(\d{3,4})\s+(.+)$/, run: (ctx, m) => { const abs = norm(ctx.state.cwd, m[2]); ctx.state.perms[abs] = m[1]; return ''; }},
      { match: /^chown\s+(\S+)\s+(.+)$/, run: () => '' },
      { match: /^grep\s+(\S+)\s+(.+)$/, run: (ctx, m) => {
        const abs = norm(ctx.state.cwd, m[2]);
        if (FILES[abs] == null) return `grep: ${m[2]}: No such file`;
        return FILES[abs].split('\n').filter(l => l.includes(m[1])).join('\n') || '';
      }},
      { match: /^nslookup\s+(\S+)$/, run: (ctx, m) => `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nName:\t${m[1]}\nAddress: 93.184.216.34` },
      { match: /^ping(\s+-c\s+\d+)?\s+(\S+)$/, run: (ctx, m) => `PING ${m[2]} 56(84) bytes of data.\n64 bytes from ${m[2]}: icmp_seq=1 ttl=54 time=12.3 ms\n--- ${m[2]} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss` }
    ],

    challenges: [
      { goal: '1) 현재 디렉토리를 출력하고 홈 디렉토리 내용을 자세히(`-l`) 보세요.', hint: '`pwd` 후 `ls -l ~`', answer: /^ls\s+-l.*$/, praise: 'ls -l은 퍼미션·소유자·크기·시각을 함께 보여줍니다.' },
      { goal: '2) `~/.ssh/id_rsa` 의 권한을 600으로 변경하세요.', hint: '`chmod 600 ~/.ssh/id_rsa`', check: (cmd, s) => s.perms['/home/chany/.ssh/id_rsa'] === '600', praise: 'SSH 개인키는 반드시 600. 이보다 열려있으면 sshd가 거부합니다.' },
      { goal: '3) sshd 서비스의 상태를 확인하세요.', hint: '`systemctl status sshd`', answer: /^systemctl\s+status\s+sshd$/, praise: 'Loaded/Active 라인이 핵심. enabled=재부팅 후 자동 시작.' },
      { goal: '4) `dev1` 이라는 사용자를 추가하세요.', hint: '`useradd dev1`', check: (cmd, s) => s.users.includes('dev1'), praise: '기본은 /etc/default/useradd 의 정책을 따릅니다.' },
      { goal: '5) 디스크 사용량과 메모리를 사람이 읽기 쉽게 확인하세요.', hint: '`df -h` 그리고 `free -h`', answer: /^(df|free)\s+-h$/, praise: '-h 는 human-readable. MB/GB 단위로 표시됩니다.' }
    ],

    complete: function (token, line, s) {
      const words = line.trim().split(/\s+/);
      const first = words[0] || '';
      const hasSpaceEnd = /\s$/.test(line);
      const wc = hasSpaceEnd ? words.length + 1 : words.length;
      if (wc <= 1) return ['pwd','ls','cd','cat','echo','whoami','id','hostname','uname','uptime','free','df','ip','ps','systemctl','useradd','userdel','passwd','chmod','chown','mkdir','touch','rm','grep','nslookup','ping','history','help','clear','reset'];
      if (first === 'systemctl' && wc === 2) return ['status','start','stop','restart','reload','list-units'];
      if (first === 'systemctl' && wc >= 3) return Object.keys(s.services || {});
      if (first === 'passwd' || first === 'userdel' || first === 'chown') return (s.users || []);
      if (['cd','ls','cat','rm','chmod','touch','mkdir','grep'].includes(first)) {
        const tok = token;
        const slashIdx = tok.lastIndexOf('/');
        const partial = slashIdx >= 0 ? tok.slice(slashIdx + 1) : tok;
        return ['/etc/','/home/chany/','/home/chany/.ssh/','/var/log/','/proc/','passwd','hosts','hostname','resolv.conf','fstab','id_rsa','authorized_keys','notes.txt','todo.md'].filter(p => p.startsWith(partial) || p.startsWith(tok));
      }
      if (first === 'ip' && wc === 2) return ['a','addr','route','link'];
      if (first === 'free' && token.startsWith('-')) return ['-h','-m','-g'];
      if (first === 'df' && token.startsWith('-')) return ['-h','-T','-i'];
      return [];
    },

    links: [
      { name: 'Killercoda — Linux', href: 'https://killercoda.com/playgrounds/scenario/ubuntu', desc: '무료 Ubuntu 샌드박스' },
      { name: 'OverTheWire: Bandit', href: 'https://overthewire.org/wargames/bandit/', desc: 'Linux 쉘 CTF로 실전 학습' },
      { name: 'Linux Journey', href: 'https://linuxjourney.com/', desc: '체계적 Linux 커리큘럼' }
    ]
  };
})();
