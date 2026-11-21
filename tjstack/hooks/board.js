// The metrics board: one self-contained HTML page (inline CSS, SVG and script, no network).
// Names reach the page only as text (textContent), never as HTML.

const fmtMs = ms => {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${s % 60}s`
  return `${Math.floor(s / 3600)}h ${Math.floor((s % 3600) / 60)}m`
}
const fmtTokens = n => (n < 1000 ? `${n}` : n < 1e6 ? `${+(n / 1e3).toFixed(1)}k` : `${+(n / 1e6).toFixed(1)}M`)
const totalTokens = t => (t ? t.input + t.output + t.cacheRead + t.cacheWrite : 0)

// Only what the page draws, so file paths and transcripts never land in the HTML.
const row = s => ({
  host: s.host, project: s.project, name: s.name, model: s.model, started: s.started, updated: s.updated,
  turns: s.turns, agentMs: s.agentMs, cost: s.cost, tokens: s.tokens ? totalTokens(s.tokens) : null,
  tests: s.tests, files: (s.files || []).length,
})

const CSS = `:root{color-scheme:dark;--bg:#111110;--panel:#1a1a19;--line:#2b2b29;--text:#ecebe6;--muted:#9a988f;--faint:#6b6a64;--bar:#3987e5;--ok:#6abf69;--bad:#ef6a5a;--warn:#e3a03d}
@media (prefers-color-scheme:light){:root{color-scheme:light;--bg:#f5f5f3;--panel:#fcfcfb;--line:#e4e3de;--text:#1d1c1a;--muted:#6b6a64;--faint:#9a988f;--bar:#2a78d6;--ok:#2e7d32;--bad:#c62828;--warn:#a86400}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif}
main{max-width:1200px;margin:0 auto;padding:28px 24px 48px}
header{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:20px}
h1{margin:0;font-size:24px;font-weight:650}header p{margin:2px 0 0;color:var(--muted)}
.filters{display:flex;gap:10px;flex-wrap:wrap}
select,.seg button{font:inherit;font-size:13px;color:var(--text);background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:6px 10px}
.seg{display:inline-flex;gap:4px}.seg button{cursor:pointer;color:var(--muted)}.seg button[aria-pressed=true]{color:var(--text);border-color:var(--muted)}
.num{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums}
.kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:12px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px 18px}
.kpi .label{color:var(--muted);font-size:13px}.kpi .value{font-size:28px;margin-top:2px}.kpi .note{color:var(--faint);font-size:12px}
.chart h2,.list h2{margin:0 0 10px;font-size:15px;font-weight:600}
#chart{display:block;width:100%;height:200px}#chart .axis{fill:var(--faint);font:11px ui-monospace,monospace}#chart .base{stroke:var(--line)}
#chart .bar{fill:var(--bar)}#chart g:hover .bar{opacity:.75}#chart rect.hit{fill:transparent}
.tip{position:fixed;pointer-events:none;background:var(--text);color:var(--bg);border-radius:8px;padding:5px 9px;font-size:12px;display:none;white-space:nowrap}
.list{margin-top:12px;overflow-x:auto}table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;font-weight:400;color:var(--faint);font-size:12px;padding:0 8px 8px;white-space:nowrap}
td{padding:9px 8px;border-top:1px solid var(--line);white-space:nowrap}td.name{white-space:normal;min-width:220px}.r{text-align:right}
.sub{color:var(--faint);font-size:12px}.host{font-size:11px;padding:2px 7px;border-radius:99px;border:1px solid var(--line);color:var(--muted)}
.ok{color:var(--ok)}.bad{color:var(--bad)}.warn{color:var(--warn)}td.empty{text-align:center;color:var(--faint);padding:28px}
@media (max-width:800px){.kpis{grid-template-columns:repeat(2,minmax(0,1fr))}}`

const APP = `(function(){
var D=JSON.parse(document.getElementById('data').textContent),DAY=86400000,NS='http://www.w3.org/2000/svg'
var st={host:'',project:''}
function $(id){return document.getElementById(id)}
function el(t,c,x){var e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
function sv(t,a,p){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);if(p)p.append(e);return e}
function ms(v){var s=Math.round(v/1000);return s<60?s+'s':s<3600?Math.floor(s/60)+'m '+s%60+'s':Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'m'}
function tok(n){return n<1000?''+n:n<1e6?+(n/1e3).toFixed(1)+'k':+(n/1e6).toFixed(1)+'M'}
function usd(n){return n==null?'\\u2013':'$'+n.toFixed(2)}
function day(t){var d=new Date(t);return d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-'+('0'+d.getDate()).slice(-2)}
var projects=[...new Set(D.sessions.map(function(s){return s.project}).filter(Boolean))].sort()
projects.forEach(function(p){var o=el('option','',p);o.value=p;$('project').append(o)})
$('project').onchange=function(){st.project=this.value;draw()}
document.querySelectorAll('.seg button').forEach(function(b){b.onclick=function(){st.host=b.dataset.host;document.querySelectorAll('.seg button').forEach(function(x){x.setAttribute('aria-pressed',x===b)});draw()}})
function draw(){
  var rows=D.sessions.filter(function(s){return(!st.host||s.host===st.host)&&(!st.project||s.project===st.project)}).sort(function(a,b){return b.updated-a.updated})
  var sum=function(f){return rows.reduce(function(a,s){return a+(f(s)||0)},0)}
  var priced=rows.filter(function(s){return s.cost!=null})
  $('k-sessions').textContent=rows.length;$('k-turns').textContent=sum(function(s){return s.turns})+' turns'
  $('k-time').textContent=ms(sum(function(s){return s.agentMs}));$('k-time-n').textContent=rows.length?'\\u2300 '+ms(sum(function(s){return s.agentMs})/rows.length)+' / session':''
  $('k-cost').textContent=usd(priced.length?sum(function(s){return s.cost}):null);$('k-cost-n').textContent=priced.length+' of '+rows.length+' sessions priced'
  $('k-tokens').textContent=tok(sum(function(s){return s.tokens}));$('k-tokens-n').textContent='Claude transcripts only'
  // Agent time per day, last 14 days.
  var svg=$('chart');svg.textContent='';var W=svg.clientWidth||900,H=200,L=8,B=22,days=[]
  for(var i=13;i>=0;i--){var k=day(D.now-i*DAY);days.push({k:k,v:0})}
  rows.forEach(function(s){var d=days.find(function(x){return x.k===day(s.started)});if(d)d.v+=s.agentMs})
  var max=Math.max.apply(null,days.map(function(d){return d.v}))||1,bw=(W-L*2)/days.length
  sv('line',{class:'base',x1:L,x2:W-L,y1:H-B+.5,y2:H-B+.5},svg)
  days.forEach(function(d,i){
    var g=sv('g',{},svg),h=d.v?Math.max(4,(d.v/max)*(H-B-12)):0,x=L+i*bw
    if(h){var w=Math.min(36,bw-8),r=Math.min(4,w/2),x0=x+(bw-w)/2,y=H-B-h
      sv('path',{class:'bar',d:'M'+x0+','+(H-B)+'V'+(y+r)+'Q'+x0+','+y+' '+(x0+r)+','+y+'H'+(x0+w-r)+'Q'+(x0+w)+','+y+' '+(x0+w)+','+(y+r)+'V'+(H-B)+'Z'},g)}
    sv('rect',{class:'hit',x:x,y:0,width:bw,height:H},g)
    if(i%2===0||days.length<8){var t=sv('text',{class:'axis',x:x+bw/2,y:H-6,'text-anchor':'middle'},svg);t.textContent=d.k.slice(5)}
    g.onmousemove=function(ev){var tip=$('tip');tip.textContent=d.k+' \\u00b7 '+ms(d.v)+' agent time';tip.style.display='block';tip.style.left=(ev.clientX+12+tip.offsetWidth>innerWidth?ev.clientX-12-tip.offsetWidth:ev.clientX+12)+'px';tip.style.top=ev.clientY-30+'px'}
    g.onmouseleave=function(){$('tip').style.display='none'}
  })
  var tb=$('rows');tb.textContent=''
  if(!rows.length){var tr=el('tr'),td=el('td','empty','No sessions yet. Work in Claude Code or Cursor with tjstack installed, then refresh.');td.colSpan=8;tr.append(td);tb.append(tr)}
  rows.forEach(function(s){
    var tr=el('tr'),n=el('td','name');n.append(el('div','',s.name||'Untitled session'),el('div','sub',(s.project||'\\u2013')+' \\u00b7 '+(s.model||'model?')))
    var h=el('td');h.append(el('span','host',s.host))
    var t=s.tests||{},tt=t.state==='pass'?'\\u2713 '+(t.passed!=null?t.passed+' passed':'passed'):t.state==='fail'?'\\u2717 '+(t.failed!=null?t.failed+' failed':'failed'):t.state==='stale'?'stale':'\\u2013'
    tr.append(n,h,el('td','sub',day(s.started)),el('td','r num',usd(s.cost)),el('td','r num',s.tokens==null?'\\u2013':tok(s.tokens)),el('td','r num',ms(s.agentMs)),el('td','r num',''+s.turns),el('td',t.state==='pass'?'ok':t.state==='fail'?'bad':t.state==='stale'?'warn':'sub',tt))
    tb.append(tr)
  })
}
draw();addEventListener('resize',draw)
})()`

function boardHtml(sessions, now) {
  const data = JSON.stringify({ now, sessions: sessions.map(row) }).replace(/</g, '\\u003c')
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>tjstack board</title><style>${CSS}</style></head>
<body><main>
<header><div><h1>tjstack board</h1><p>Session metrics from Claude Code and Cursor, rebuilt after every turn.</p></div>
<div class="filters"><div class="seg" role="group" aria-label="Host"><button data-host="" aria-pressed="true">All</button><button data-host="claude" aria-pressed="false">Claude Code</button><button data-host="cursor" aria-pressed="false">Cursor</button></div>
<select id="project" aria-label="Project"><option value="">All projects</option></select></div></header>
<section class="kpis">
<div class="card kpi"><div class="label">Sessions</div><div class="value num" id="k-sessions"></div><div class="note" id="k-turns"></div></div>
<div class="card kpi"><div class="label">Agent time</div><div class="value num" id="k-time"></div><div class="note" id="k-time-n"></div></div>
<div class="card kpi"><div class="label">Cost (estimate)</div><div class="value num" id="k-cost"></div><div class="note" id="k-cost-n"></div></div>
<div class="card kpi"><div class="label">Tokens</div><div class="value num" id="k-tokens"></div><div class="note" id="k-tokens-n"></div></div>
</section>
<section class="card chart"><h2>Agent time per day</h2><svg id="chart" role="img" aria-label="Agent time per day, last 14 days"></svg></section>
<section class="card list"><h2>Sessions</h2><table><thead><tr><th>Task</th><th>Host</th><th>Started</th><th class="r">Cost</th><th class="r">Tokens</th><th class="r">Agent time</th><th class="r">Turns</th><th>Tests</th></tr></thead><tbody id="rows"></tbody></table></section>
<div class="tip" id="tip"></div>
</main>
<script type="application/json" id="data">${data}</script>
<script>${APP}</script>
</body></html>
`
}

module.exports = { boardHtml, fmtMs, fmtTokens, totalTokens }
