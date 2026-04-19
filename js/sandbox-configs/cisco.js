/* Cisco IOS 실습 샌드박스 설정 */
(function () {
  const render = (s) => {
    let base = s.hostname;
    if (s.mode === 'user') return base + '>';
    if (s.mode === 'priv') return base + '#';
    if (s.mode === 'global') return base + '(config)#';
    if (s.mode === 'if') return base + '(config-if)#';
    if (s.mode === 'vlan') return base + '(config-vlan)#';
    return base + '#';
  };
  const info = (s) => `[현재 모드: ${s.mode}]  다음 프롬프트: ${render(s)}`;

  (window.SBX_CONFIGS = window.SBX_CONFIGS || {}).cisco = {
    title: 'Cisco IOS — Switch/Router simulator',
    prompt: 'Switch>',
    banner: 'Cisco IOS Sandbox — User EXEC 모드에서 시작합니다. `enable` 로 Privileged EXEC 진입, `configure terminal` 로 Global Config 진입.\n도움말은 `help` — 지원: hostname / enable / disable / conf t / exit / end / interface / ip address / no shutdown / vlan / switchport mode / show ...',
    initialState: {
      hostname: 'Switch',
      mode: 'user',
      currentIf: null,
      currentVlan: null,
      interfaces: {
        'fa0/1': { ip: null, mask: null, desc: '', shut: true, vlan: 1, mode: 'access' },
        'fa0/2': { ip: null, mask: null, desc: '', shut: true, vlan: 1, mode: 'access' },
        'gi0/0': { ip: null, mask: null, desc: '', shut: true, vlan: null, mode: 'routed' }
      },
      vlans: { 1: { name: 'default' } },
      running: ['!', 'version 15.2', 'hostname Switch', '!', 'no ip routing', '!', 'end']
    },
    helpList: [
      'enable                        # User → Privileged',
      'disable                       # Privileged → User',
      'configure terminal            # Global Config 진입',
      'hostname <name>               # 호스트명 변경',
      'interface fa0/1 | gi0/0       # 인터페이스 설정 진입',
      'ip address <ip> <mask>        # 인터페이스에 IP 지정',
      'description <text>            # 인터페이스 설명',
      'no shutdown                   # 인터페이스 UP',
      'shutdown                      # 인터페이스 DOWN',
      'exit                          # 한 단계 상위 모드',
      'end                           # Privileged로 즉시 복귀',
      'vlan 10                       # VLAN 10 생성/진입',
      'name <text>                   # VLAN 이름',
      'switchport mode access/trunk  # L2 포트 모드',
      'switchport access vlan 10     # 액세스 VLAN 할당',
      'show running-config           # 현재 설정',
      'show ip interface brief       # 인터페이스 요약',
      'show vlan brief               # VLAN 목록',
      'show version                  # 장비 정보',
      'ping <ip>                     # 간이 핑'
    ],

    commands: [
      { match: /^enable$/, run: (ctx) => { if (ctx.state.mode !== 'user') return info(ctx.state); ctx.state.mode = 'priv'; return info(ctx.state); }},
      { match: /^disable$/, run: (ctx) => { ctx.state.mode = 'user'; return info(ctx.state); }},
      { match: /^(conf(igure)?\s+t(erminal)?|conf\s+t)$/, run: (ctx) => {
        if (ctx.state.mode === 'user') return '% Invalid input — 먼저 enable 로 Privileged 모드로.';
        ctx.state.mode = 'global'; return info(ctx.state);
      }},
      { match: /^exit$/, run: (ctx) => {
        const s = ctx.state;
        if (s.mode === 'if' || s.mode === 'vlan') { s.mode = 'global'; s.currentIf = null; s.currentVlan = null; }
        else if (s.mode === 'global') s.mode = 'priv';
        else if (s.mode === 'priv') s.mode = 'user';
        return info(s);
      }},
      { match: /^end$/, run: (ctx) => { ctx.state.mode = 'priv'; ctx.state.currentIf = null; ctx.state.currentVlan = null; return info(ctx.state); }},

      { match: /^hostname\s+(\S+)$/, run: (ctx, m) => {
        if (ctx.state.mode !== 'global') return '% 이 명령은 Global Config 에서 실행하세요.';
        ctx.state.hostname = m[1]; return info(ctx.state);
      }},

      { match: /^interface\s+(\S+)$/i, run: (ctx, m) => {
        if (ctx.state.mode !== 'global') return '% Global Config 에서 실행하세요.';
        const key = m[1].toLowerCase().replace(/^fastethernet/, 'fa').replace(/^gigabitethernet/, 'gi');
        if (!ctx.state.interfaces[key]) return `% Invalid interface: ${m[1]}`;
        ctx.state.mode = 'if'; ctx.state.currentIf = key;
        return info(ctx.state);
      }},
      { match: /^ip\s+address\s+(\d+\.\d+\.\d+\.\d+)\s+(\d+\.\d+\.\d+\.\d+)$/, run: (ctx, m) => {
        if (ctx.state.mode !== 'if') return '% 인터페이스 모드(config-if)에서 실행하세요.';
        const ifc = ctx.state.interfaces[ctx.state.currentIf];
        ifc.ip = m[1]; ifc.mask = m[2];
        return '';
      }},
      { match: /^description\s+(.+)$/, run: (ctx, m) => { if (ctx.state.mode !== 'if') return '% if 모드 필요'; ctx.state.interfaces[ctx.state.currentIf].desc = m[1]; return ''; }},
      { match: /^no\s+shutdown$/, run: (ctx) => { if (ctx.state.mode !== 'if') return '% if 모드 필요'; ctx.state.interfaces[ctx.state.currentIf].shut = false; return `%LINK-3-UPDOWN: Interface ${ctx.state.currentIf}, changed state to up`; }},
      { match: /^shutdown$/, run: (ctx) => { if (ctx.state.mode !== 'if') return '% if 모드 필요'; ctx.state.interfaces[ctx.state.currentIf].shut = true; return `%LINK-3-UPDOWN: Interface ${ctx.state.currentIf}, changed state to administratively down`; }},
      { match: /^switchport\s+mode\s+(access|trunk)$/, run: (ctx, m) => { if (ctx.state.mode !== 'if') return '% if 모드 필요'; ctx.state.interfaces[ctx.state.currentIf].mode = m[1]; return ''; }},
      { match: /^switchport\s+access\s+vlan\s+(\d+)$/, run: (ctx, m) => {
        if (ctx.state.mode !== 'if') return '% if 모드 필요';
        const v = +m[1]; if (!ctx.state.vlans[v]) ctx.state.vlans[v] = { name: `VLAN${String(v).padStart(4,'0')}` };
        ctx.state.interfaces[ctx.state.currentIf].vlan = v; return '';
      }},

      { match: /^vlan\s+(\d+)$/, run: (ctx, m) => {
        if (ctx.state.mode !== 'global') return '% Global Config 에서 실행하세요.';
        const v = +m[1]; if (!ctx.state.vlans[v]) ctx.state.vlans[v] = { name: `VLAN${String(v).padStart(4,'0')}` };
        ctx.state.mode = 'vlan'; ctx.state.currentVlan = v; return info(ctx.state);
      }},
      { match: /^name\s+(\S+)$/, run: (ctx, m) => { if (ctx.state.mode !== 'vlan') return '% vlan 모드 필요'; ctx.state.vlans[ctx.state.currentVlan].name = m[1]; return ''; }},

      { match: /^show\s+running-config$/, run: (ctx) => {
        const s = ctx.state;
        const lines = ['!', 'version 15.2', '!', 'hostname ' + s.hostname, '!'];
        Object.keys(s.vlans).forEach(v => { if (+v !== 1) lines.push(`vlan ${v}`, ` name ${s.vlans[v].name}`, '!'); });
        Object.keys(s.interfaces).forEach(k => {
          const i = s.interfaces[k];
          lines.push('interface ' + k);
          if (i.desc) lines.push(' description ' + i.desc);
          if (i.mode === 'access') lines.push(' switchport mode access');
          if (i.mode === 'trunk')  lines.push(' switchport mode trunk');
          if (i.vlan && i.vlan !== 1 && i.mode === 'access') lines.push(' switchport access vlan ' + i.vlan);
          if (i.ip) lines.push(` ip address ${i.ip} ${i.mask}`);
          lines.push(i.shut ? ' shutdown' : ' no shutdown');
          lines.push('!');
        });
        lines.push('end');
        return lines.join('\n');
      }},

      { match: /^show\s+ip\s+interface\s+brief$/, run: (ctx) => {
        const rows = Object.entries(ctx.state.interfaces).map(([k,i]) => [
          k.padEnd(22), (i.ip || 'unassigned').padEnd(16), 'YES', 'manual', (i.shut ? 'administratively down' : 'up').padEnd(22), i.shut ? 'down' : 'up'
        ].join(' '));
        return 'Interface              IP-Address      OK? Method Status                Protocol\n' + rows.join('\n');
      }},

      { match: /^show\s+vlan(\s+brief)?$/, run: (ctx) => {
        const ports = (vid) => Object.entries(ctx.state.interfaces).filter(([k,i]) => i.vlan === +vid && i.mode === 'access').map(([k]) => k).join(', ') || '';
        const rows = Object.entries(ctx.state.vlans).map(([v, info]) => `${v.padEnd(5)} ${info.name.padEnd(22)} active    ${ports(v)}`);
        return 'VLAN  Name                   Status    Ports\n----- ---------------------- --------- ------------------\n' + rows.join('\n');
      }},

      { match: /^show\s+version$/, run: (ctx) => `Cisco IOS Software (simulated), C2960 Software Version 15.2(2)E\nSystem uptime is 2 hours\nModel: Catalyst 2960 · hostname ${ctx.state.hostname}` },

      { match: /^write(\s+memory)?$|^copy\s+run\s+start$/, run: () => 'Building configuration...\n[OK]' },
      { match: /^ping\s+(\d+\.\d+\.\d+\.\d+)$/, run: (ctx, m) => {
        const anyUp = Object.values(ctx.state.interfaces).some(i => !i.shut && i.ip);
        if (!anyUp) return 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + m[1] + '\n.....\nSuccess rate is 0 percent (0/5)';
        return 'Type escape sequence to abort.\nSending 5, 100-byte ICMP Echos to ' + m[1] + '\n!!!!!\nSuccess rate is 100 percent (5/5), round-trip min/avg/max = 1/2/4 ms';
      }},

      { match: /^\?$/, run: () => '`?` 대신 `help` 를 사용하세요. (시뮬레이터 제약)' }
    ],

    challenges: [
      { goal: '1) 호스트명을 `R1` 으로 변경하세요. (enable → conf t → hostname)', hint: '`enable` → `configure terminal` → `hostname R1`', check: (cmd, s) => s.hostname === 'R1', praise: 'Global Config 에서만 적용됩니다.' },
      { goal: '2) `fa0/1` 인터페이스에 IP `192.168.1.1 255.255.255.0` 을 설정하고 UP 시키세요.', hint: 'conf t → interface fa0/1 → ip address 192.168.1.1 255.255.255.0 → no shutdown', check: (cmd, s) => { const i = s.interfaces['fa0/1']; return i.ip === '192.168.1.1' && i.mask === '255.255.255.0' && i.shut === false; }, praise: 'Cisco IP는 와일드카드 마스크가 아닌 서브넷 마스크로 적습니다.' },
      { goal: '3) VLAN 10 을 만들고 이름을 `SALES` 로, fa0/2 를 이 VLAN 의 access 포트로 지정하세요.', hint: 'vlan 10 → name SALES → exit → interface fa0/2 → switchport mode access → switchport access vlan 10', check: (cmd, s) => s.vlans[10] && s.vlans[10].name === 'SALES' && s.interfaces['fa0/2'].vlan === 10, praise: 'Access 포트는 단일 VLAN, Trunk 는 다중 VLAN 을 dot1Q 태깅으로 운반합니다.' },
      { goal: '4) 현재 실행 설정을 확인하세요.', hint: '`end` 로 Privileged 복귀 후 `show running-config`', answer: /^show\s+running-config$/, praise: '저장하지 않으면 재부팅 시 사라집니다 — `copy run start` 필요.' },
      { goal: '5) 인터페이스 상태 요약을 확인하세요.', hint: '`show ip interface brief`', answer: /^show\s+ip\s+interface\s+brief$/, praise: '실무에서 가장 자주 치는 확인 명령입니다.' }
    ],

    complete: function (token, line, s) {
      const words = line.trim().split(/\s+/);
      const first = words[0] || '';
      const second = words[1] || '';
      const hasSpaceEnd = /\s$/.test(line);
      const wc = hasSpaceEnd ? words.length + 1 : words.length;

      if (wc <= 1) {
        const base = ['help','clear','reset','history'];
        if (s.mode === 'user') return [...base,'enable','show','ping','exit'];
        if (s.mode === 'priv') return [...base,'configure','disable','show','write','copy','ping'];
        if (s.mode === 'global') return [...base,'hostname','interface','vlan','no','exit','end'];
        if (s.mode === 'if' || s.mode === 'vlan') return [...base,'ip','description','no','shutdown','switchport','name','exit','end'];
        return base;
      }
      if (first === 'configure' && wc === 2) return ['terminal'];
      if (first === 'show' && wc === 2) return ['running-config','ip','vlan','version','interface'];
      if (first === 'show' && second === 'ip' && wc === 3) return ['interface'];
      if (first === 'show' && second === 'ip' && words[2] === 'interface' && wc === 4) return ['brief'];
      if (first === 'show' && second === 'vlan' && wc === 3) return ['brief'];
      if (first === 'interface' && wc === 2) return Object.keys(s.interfaces || {}).concat(['FastEthernet0/1','GigabitEthernet0/0']);
      if (first === 'switchport' && wc === 2) return ['mode','access','trunk'];
      if (first === 'switchport' && second === 'mode' && wc === 3) return ['access','trunk'];
      if (first === 'switchport' && second === 'access' && wc === 3) return ['vlan'];
      if (first === 'no' && wc === 2) return ['shutdown'];
      if (first === 'vlan' && wc === 2) return ['10','20','30','100'];
      if (first === 'ip' && wc === 2) return ['address'];
      if (first === 'copy' && wc === 2) return ['run'];
      if (first === 'copy' && second === 'run' && wc === 3) return ['start'];
      return [];
    },

    links: [
      { name: 'Cisco Packet Tracer', href: 'https://www.netacad.com/cisco-packet-tracer', desc: '공식 시뮬레이터 (NetAcad 가입 무료)' },
      { name: 'GNS3', href: 'https://www.gns3.com/', desc: '실제 IOS 이미지 구동 에뮬레이터' },
      { name: 'Boson NetSim Lite', href: 'https://www.boson.com/netsim-cisco-network-simulator', desc: '자격증 대비 랩' }
    ]
  };
})();
