const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const labels={planning:'Lên kế hoạch',todo:'Cần làm',doing:'Đang thực hiện',review:'Đang xem xét',done:'Hoàn thành',high:'Cao',medium:'Trung bình',low:'Thấp'};
let data=Store.load(),page='dashboard',cloud={scriptUrl:'',token:'',autoSync:true,...Store.cloud()},syncTimer=null;
const clean=v=>String(v??'').replace(/[<>&"]/g,m=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;'}[m]));
const id=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,7);
const code=(p,l)=>p+String(Math.max(0,...l.map(x=>+String(x.code||'').replace(p,'')).filter(Number.isFinite))+1).padStart(3,'0');
const money=v=>(+v||0).toLocaleString('vi-VN')+' đ';
const compact=v=>v>=1e9?(v/1e9).toFixed(1).replace('.0','')+' tỷ':v>=1e6?(v/1e6).toFixed(1).replace('.0','')+'tr':money(v);
const fdate=s=>s?new Date(s+'T00:00:00').toLocaleDateString('vi-VN'):'-';
const today=()=>{const d=new Date();d.setHours(0,0,0,0);return d};
const member=id=>data.members.find(x=>x.id===id)||{}; const project=id=>data.projects.find(x=>x.id===id)||{};
const mname=id=>member(id).name||'Chưa chọn', pname=id=>project(id).name||'Chưa chọn';
const init=n=>String(n||'?').trim().split(/\s+/).filter(Boolean).slice(-2).map(x=>x[0]).join('').toUpperCase()||'?';
const overdue=t=>t.due&&t.status!=='done'&&new Date(t.due+'T00:00:00')<today();
const soon=t=>{if(!t.due||t.status==='done')return false;const a=today(),b=new Date(a);b.setDate(b.getDate()+7);const d=new Date(t.due+'T00:00:00');return d>=a&&d<=b};
function toast(x){const t=$('#toast');t.textContent=x;t.classList.add('show');clearTimeout(window.tt);window.tt=setTimeout(()=>t.classList.remove('show'),2400)}
function activity(x){data.activities.unshift({id:id('a'),text:x,time:new Date().toISOString()});data.activities=data.activities.slice(0,120)}
function persist(msg,skip=false){if(msg)activity(msg);Store.save(data);render();if(msg)toast(msg);if(!skip)debouncedPush()}
function avg(){return data.projects.length?Math.round(data.projects.reduce((s,p)=>s+(+p.progress||0),0)/data.projects.length):0}
function opts(){const po='<option value="all">Tất cả dự án</option>'+data.projects.map(p=>`<option value="${p.id}">${clean(p.name)}</option>`).join('');$('#kanbanProject').innerHTML=po;$('#taskProjectFilter').innerHTML=po;$('#tproject').innerHTML=data.projects.map(p=>`<option value="${p.id}">${clean(p.name)}</option>`).join('');const mo=data.members.map(m=>`<option value="${m.id}">${clean(m.name)}</option>`).join('');$('#pleader').innerHTML=mo;$('#tassignee').innerHTML=mo}
function stat(){const done=data.tasks.filter(t=>t.status==='done').length,budget=data.projects.reduce((s,p)=>s+(+p.budget||0),0);$('#stats').innerHTML=[['01',data.projects.length,'Tổng dự án'],['02',`${done}/${data.tasks.length}`,'Công việc hoàn thành'],['03',avg()+'%','Tiến độ trung bình'],['04',compact(budget),'Tổng ngân sách']].map(x=>`<article class="stat"><i>${x[0]}</i><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('');$('#avgText').textContent=avg()+'%';$('#ring').style.setProperty('--p',avg()*3.6+'deg')}
function chart(){const g={};data.members.forEach(m=>g[m.id]={todo:0,doing:0,done:0,total:0});data.tasks.forEach(t=>{g[t.assigneeId]??={todo:0,doing:0,done:0,total:0};if(t.status==='done')g[t.assigneeId].done++;else if(t.status==='doing'||t.status==='review')g[t.assigneeId].doing++;else g[t.assigneeId].todo++;g[t.assigneeId].total++});const rows=data.members.map(m=>({m,...(g[m.id]||{todo:0,doing:0,done:0,total:0})})).sort((a,b)=>b.total-a.total||a.m.name.localeCompare(b.m.name)).slice(0,8);const max=Math.max(1,...rows.map(x=>x.total));$('#workloadCount').textContent=data.tasks.length;$('#chart').innerHTML=rows.length?rows.map(x=>{const total=x.total||0;const width=Math.max(total?((total/max)*100):8,8);const todoW=total?(x.todo/total*100):0;const doingW=total?(x.doing/total*100):0;const doneW=total?(x.done/total*100):0;return `<div class="work-row"><div class="work-head"><div class="work-person"><span class="mini-avatar">${init(x.m.name)}</span><div><strong>${clean(x.m.name)}</strong><small>${clean(x.m.role||'Thành viên')}</small></div></div><div class="work-total">${total} việc</div></div><div class="work-track"><div class="work-fill" style="width:${width}%">${x.todo?`<span class="seg todo" style="width:${todoW}%"></span>`:''}${x.doing?`<span class="seg doing" style="width:${doingW}%"></span>`:''}${x.done?`<span class="seg done" style="width:${doneW}%"></span>`:''}</div></div><div class="work-stats"><span>${x.todo} cần làm</span><span>${x.doing} đang làm</span><span>${x.done} hoàn thành</span></div></div>`}).join(''):'<div class="empty">Chưa có dữ liệu công việc</div>'}
function progress(){let arr=[...data.projects].sort((a,b)=>(+b.progress||0)-(+a.progress||0));$('#projectCount').textContent=arr.length;$('#progressList').innerHTML=arr.map(p=>`<div class="progress-item"><div class="progress-top"><b>${clean(p.name)}</b><span>${p.progress||0}%</span></div><div class="track"><div class="fill ${p.progress>=100?'done':p.status==='planning'?'planning':''}" style="width:${p.progress||0}%"></div></div><span class="badge ${p.status}">${labels[p.status]}</span></div>`).join('')||'<div class="empty">Chưa có dự án</div>'}
function mini(t,isSoon=false){return `<div class="mini"><div class="mini-icon ${isSoon?'soon':''}">${isSoon?'⌛':'!'}</div><div><h4>${clean(t.title)}</h4><p>${clean(mname(t.assigneeId))} · ${clean(pname(t.projectId))}</p><small>Hạn: ${fdate(t.due)}</small></div></div>`}
function dues(){const o=data.tasks.filter(overdue),s=data.tasks.filter(soon);$('#overdueCount').textContent=o.length;$('#soonCount').textContent=s.length;$('#overdue').innerHTML=o.length?o.map(t=>mini(t)).join(''):'<div class="empty">Không có công việc quá hạn</div>';$('#soon').innerHTML=s.length?s.map(t=>mini(t,true)).join(''):'<div class="empty">Không có công việc sắp đến hạn</div>'}
function projectTable(){const q=$('#projectSearch').value.toLowerCase(),st=$('#projectStatus').value,doneCount=data.projects.filter(p=>p.status==='done').length,totalBudget=data.projects.reduce((s,p)=>s+(+p.budget||0),0);if($('#projectTotal'))$('#projectTotal').textContent=data.projects.length;if($('#projectDone'))$('#projectDone').textContent=doneCount;if($('#projectBudget'))$('#projectBudget').textContent=compact(totalBudget);const rows=data.projects.filter(p=>(`${p.code} ${p.name} ${p.description}`.toLowerCase().includes(q))&&(st==='all'||p.status===st));$('#projectsTable').innerHTML=rows.map(p=>`<tr><td class="code">${p.code}</td><td><div class="title-link">${clean(p.name)}</div><span class="desc">${clean(p.description)}</span></td><td><span class="badge ${p.status}">${labels[p.status]}</span></td><td><span class="badge ${p.priority}">${labels[p.priority]}</span></td><td>${money(p.budget)}</td><td><span class="assignee"><span class="mini-avatar">${init(mname(p.leaderId))}</span>${clean(mname(p.leaderId))}</span></td><td><div class="small-progress"><div class="track"><div class="fill ${p.progress>=100?'done':''}" style="width:${p.progress||0}%"></div></div><span>${p.progress||0}%</span></div></td><td><div class="row-actions"><button class="tiny" onclick="openProject('${p.id}')">✎</button><button class="tiny d" onclick="delProject('${p.id}')">⌫</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty table-empty"><strong>Chưa có dự án phù hợp</strong><span>Hãy thử từ khóa khác hoặc tạo dự án mới.</span></div></td></tr>'}
function taskTable(){const q=$('#taskSearch').value.toLowerCase(),pf=$('#taskProjectFilter').value,sf=$('#taskStatusFilter').value,overCount=data.tasks.filter(overdue).length,soonCount=data.tasks.filter(soon).length;if($('#taskTotal'))$('#taskTotal').textContent=data.tasks.length;if($('#taskOverdue'))$('#taskOverdue').textContent=overCount;if($('#taskSoon'))$('#taskSoon').textContent=soonCount;const rows=data.tasks.filter(t=>(`${t.code} ${t.title} ${t.description} ${pname(t.projectId)}`.toLowerCase().includes(q))&&(pf==='all'||t.projectId===pf)&&(sf==='all'||t.status===sf));$('#tasksTable').innerHTML=rows.map(t=>`<tr><td class="code">${t.code}</td><td><div class="title-link">${clean(t.title)}</div><span class="desc">${(t.tags||[]).map(x=>`<span class="tag">${clean(x)}</span>`).join(' ')}</span></td><td>${clean(pname(t.projectId))}</td><td><span class="assignee"><span class="mini-avatar">${init(mname(t.assigneeId))}</span>${clean(mname(t.assigneeId))}</span></td><td><span class="badge ${t.status}">${labels[t.status]}</span></td><td><span class="badge ${t.priority}">${labels[t.priority]}</span></td><td style="color:${overdue(t)?'var(--red)':'#119b68'};font-weight:950">${fdate(t.due)} ${overdue(t)?'▲':''}</td><td><div class="row-actions"><button class="tiny" onclick="openTask('${t.id}')">✎</button><button class="tiny d" onclick="delTask('${t.id}')">⌫</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty table-empty"><strong>Chưa có công việc phù hợp</strong><span>Hãy đổi bộ lọc hoặc thêm công việc mới.</span></div></td></tr>'}
function kanban(){const q=$('#kanbanSearch').value.toLowerCase(),pf=$('#kanbanProject').value;const ts=data.tasks.filter(t=>(`${t.title} ${t.description} ${pname(t.projectId)}`.toLowerCase().includes(q))&&(pf==='all'||t.projectId===pf));const cols=[['todo','Cần làm'],['doing','Đang làm'],['review','Xem xét'],['done','Hoàn thành']];if($('#kanbanTodo'))$('#kanbanTodo').textContent=ts.filter(t=>t.status==='todo').length;if($('#kanbanDoing'))$('#kanbanDoing').textContent=ts.filter(t=>t.status==='doing').length;if($('#kanbanDone'))$('#kanbanDone').textContent=ts.filter(t=>t.status==='done').length;$('#kanban').innerHTML=cols.map(c=>{const l=ts.filter(t=>t.status===c[0]);return `<section class="kanban-col ${c[0]}"><div class="kanban-head ${c[0]}"><span>${c[1]}</span><span class="count">${l.length}</span></div><div class="kanban-body">${l.map(card).join('')||'<div class="empty">Trống</div>'}</div></section>`}).join('')}
function card(t){return `<article class="task-card"><span class="badge ${t.priority}">${labels[t.priority]}</span><h4>${clean(t.title)}</h4><div class="meta"><span>${clean(pname(t.projectId))}</span><span>•</span><span>${fdate(t.due)}</span></div><div class="tags">${(t.tags||[]).map(x=>`<span class="tag">${clean(x)}</span>`).join('')}</div><div class="task-foot"><span class="assignee"><span class="mini-avatar">${init(mname(t.assigneeId))}</span>${clean(mname(t.assigneeId))}</span><button class="tiny" onclick="openTask('${t.id}')">✎</button></div></article>`}
function members(){ if($('#memberTotal'))$('#memberTotal').textContent=data.members.length;$('#members').innerHTML=data.members.map(m=>{const assigned=data.tasks.filter(t=>t.assigneeId===m.id).length,leading=data.projects.filter(p=>p.leaderId===m.id).length;return `<article class="member"><div class="member-top"><div class="avatar">${init(m.name)}</div><button class="tiny d member-delete" title="Xóa thành viên" onclick="delMember('${m.id}')">⌫</button></div><h3>${clean(m.name)}</h3><p>${clean(m.role||'Thành viên')}</p><div class="member-meta"><span>${assigned} việc</span><span>${leading} dự án</span></div></article>`}).join('')||'<div class="empty">Chưa có thành viên</div>'}
function openDayModal(iso){
  const date=new Date(iso+'T00:00:00');
  const ts=data.tasks.filter(t=>t.due===iso).sort((a,b)=>{
    const order={high:0,medium:1,low:2};
    return (order[a.priority]??9)-(order[b.priority]??9) || a.title.localeCompare(b.title,'vi');
  });
  $('#dayModalTitle').textContent='Deadline ngày '+date.toLocaleDateString('vi-VN',{weekday:'long',day:'2-digit',month:'2-digit',year:'numeric'});
  $('#dayModalMeta').textContent=ts.length?`${ts.length} deadline trong ngày này`:'Không có deadline trong ngày này';
  $('#dayModalList').innerHTML=ts.length?ts.map(t=>`<article class="day-modal-item">
      <div class="day-modal-top">
        <div>
          <h4>${clean(t.title)}</h4>
          <p>${clean(pname(t.projectId))} · ${clean(mname(t.assigneeId))}</p>
        </div>
        <div class="day-modal-badges">
          <span class="tag ${t.status}">${clean(labels[t.status]||t.status)}</span>
          <span class="tag ${t.priority}">${clean(labels[t.priority]||t.priority)}</span>
        </div>
      </div>
      ${t.description?`<div class="day-modal-desc">${clean(t.description)}</div>`:''}
    </article>`).join(''):'<div class="empty">Không có deadline trong ngày này</div>';
  openModal('dayModal');
}
function calendar(){
  const a=today(),todayIso=a.toISOString().slice(0,10),days=Array.from({length:14},(_,i)=>{const d=new Date(a);d.setDate(a.getDate()+i);return d});
  $('#calendar').innerHTML=days.map(d=>{
    const iso=d.toISOString().slice(0,10);
    const ts=data.tasks.filter(t=>t.due===iso).sort((a,b)=>{
      const order={high:0,medium:1,low:2};
      return (order[a.priority]??9)-(order[b.priority]??9) || a.title.localeCompare(b.title,'vi');
    });
    const preview=ts.slice(0,4);
    const more=ts.length-preview.length;
    return `<button type="button" class="day ${iso===todayIso?'today':''} ${ts.length?'has-items':''}" onclick="openDayModal('${iso}')">
      <div class="day-top">
        <div class="day-date">
          <small>${d.toLocaleDateString('vi-VN',{weekday:'short'})}</small>
          <b>${d.toLocaleDateString('vi-VN',{day:'2-digit',month:'2-digit'})}</b>
        </div>
        <span class="day-count">${ts.length}</span>
      </div>
      <div class="day-list">
        ${preview.length?preview.map(t=>`<div class="day-task ${clean(t.priority)}">
          <span class="day-task-title">${clean(t.title)}</span>
          <small>${clean(pname(t.projectId))}</small>
        </div>`).join(''):'<div class="day-empty">Trống</div>'}
        ${more>0?`<div class="day-more">+${more} deadline khác</div>`:''}
      </div>
    </button>`;
  }).join('');
}
function activityList(){ $('#activity').innerHTML=data.activities.slice(0,28).map(a=>`<div class="timeline-item"><h4>${clean(a.text)}</h4><p>${new Date(a.time).toLocaleString('vi-VN')}</p></div>`).join('')||'<div class="empty">Chưa có hoạt động</div>' }
function render(){opts();stat();chart();progress();dues();projectTable();taskTable();kanban();members();calendar();activityList();cloudStatus()}
function setPage(p){page=p;$$('.page').forEach(x=>x.classList.toggle('active',x.id==='page-'+p));$$('#nav button').forEach(b=>b.classList.toggle('active',b.dataset.page===p));const label=$(`#nav button[data-page="${p}"] span`).textContent;$('#title').textContent=label;$('#crumb').textContent=label;if(innerWidth<940)$('#sidebar').classList.remove('open');render()}
function openModal(id){$('#'+id).classList.add('show')}function closeModals(){$$('.modal-bg').forEach(m=>m.classList.remove('show'))}
function syncProjectEndDate(){const s=$('#pstart'),e=$('#pend');if(!s||!e)return;if(s.value){e.min=s.value;if(!e.value||e.value<s.value)e.value=s.value}else e.removeAttribute('min')}
function openProject(pid=''){const p=data.projects.find(x=>x.id===pid)||{};$('#projectModalTitle').textContent=pid?'Sửa dự án':'Tạo dự án';$('#pid').value=p.id||'';$('#pname').value=p.name||'';$('#pstatus').value=p.status||'planning';$('#pdesc').value=p.description||'';$('#ppriority').value=p.priority||'medium';$('#pbudget').value=p.budget||0;$('#pstart').value=p.start||new Date().toISOString().slice(0,10);$('#pend').value=p.end||'';syncProjectEndDate();$('#pleader').value=p.leaderId||data.members[0]?.id||'';$('#pprogress').value=p.progress||0;$('#pProgressText').textContent=(p.progress||0)+'%';openModal('projectModal')}
function saveProject(e){e.preventDefault();syncProjectEndDate();const old=data.projects.find(p=>p.id===$('#pid').value),p={id:$('#pid').value||id('p'),code:old?.code||code('DA',data.projects),name:$('#pname').value.trim(),status:$('#pstatus').value,description:$('#pdesc').value.trim(),priority:$('#ppriority').value,budget:+$('#pbudget').value||0,start:$('#pstart').value,end:$('#pend').value,leaderId:$('#pleader').value,progress:+$('#pprogress').value||0};data.projects=old?data.projects.map(x=>x.id===old.id?p:x):[p,...data.projects];closeModals();persist(old?`Đã cập nhật dự án: ${p.name}`:`Đã tạo dự án: ${p.name}`)}
function delProject(pid){const p=project(pid);if(!p.id)return;if(confirm(`Xóa dự án "${p.name}"? Công việc thuộc dự án này cũng sẽ bị xóa.`)){data.projects=data.projects.filter(x=>x.id!==pid);data.tasks=data.tasks.filter(x=>x.projectId!==pid);persist(`Đã xóa dự án: ${p.name}`)}}
function openTask(tid=''){const t=data.tasks.find(x=>x.id===tid)||{};$('#taskModalTitle').textContent=tid?'Sửa công việc':'Tạo công việc';$('#tid').value=t.id||'';$('#ttitle').value=t.title||'';$('#tdesc').value=t.description||'';$('#tproject').value=t.projectId||data.projects[0]?.id||'';$('#tassignee').value=t.assigneeId||data.members[0]?.id||'';$('#tstatus').value=t.status||'todo';$('#tpriority').value=t.priority||'medium';$('#tstart').value=t.start||new Date().toISOString().slice(0,10);$('#tdue').value=t.due||'';$('#ttags').value=(t.tags||[]).join(', ');openModal('taskModal')}
function saveTask(e){e.preventDefault();const old=data.tasks.find(t=>t.id===$('#tid').value),t={id:$('#tid').value||id('t'),code:old?.code||code('CV',data.tasks),title:$('#ttitle').value.trim(),description:$('#tdesc').value.trim(),projectId:$('#tproject').value,assigneeId:$('#tassignee').value,status:$('#tstatus').value,priority:$('#tpriority').value,start:$('#tstart').value,due:$('#tdue').value,tags:$('#ttags').value.split(',').map(x=>x.trim()).filter(Boolean)};data.tasks=old?data.tasks.map(x=>x.id===old.id?t:x):[t,...data.tasks];updateProject(t.projectId);closeModals();persist(old?`Đã cập nhật công việc: ${t.title}`:`Đã tạo công việc: ${t.title}`)}
function delTask(tid){const t=data.tasks.find(x=>x.id===tid);if(!t)return;if(confirm(`Xóa công việc "${t.title}"?`)){data.tasks=data.tasks.filter(x=>x.id!==tid);updateProject(t.projectId);persist(`Đã xóa công việc: ${t.title}`)}}
function updateProject(pid){const ts=data.tasks.filter(t=>t.projectId===pid),p=data.projects.find(p=>p.id===pid);if(!p||!ts.length)return;const score=ts.reduce((s,t)=>s+(t.status==='done'?1:t.status==='review'?0.72:t.status==='doing'?0.45:0),0);p.progress=Math.round(score/ts.length*100);if(p.progress===100)p.status='done';else if(p.progress>0&&p.status==='planning')p.status='doing';else if(p.status==='done')p.status='doing'}
function saveMember(e){e.preventDefault();const m={id:id('m'),name:$('#mname').value.trim(),role:$('#mrole').value.trim()||'Thành viên'};data.members.push(m);closeModals();persist(`Đã thêm thành viên: ${m.name}`)}
function delMember(mid){const m=member(mid);if(!m.id)return;if(data.members.length<=1){toast('Cần giữ ít nhất 1 thành viên');return}const next=data.members.find(x=>x.id!==mid);const assigned=data.tasks.filter(t=>t.assigneeId===mid).length,leading=data.projects.filter(p=>p.leaderId===mid).length;const extra=assigned||leading?` ${assigned} công việc và ${leading} dự án sẽ chuyển sang ${next.name}.`:'';if(confirm(`Xóa thành viên "${m.name}"?${extra}`)){data.tasks.forEach(t=>{if(t.assigneeId===mid)t.assigneeId=next.id});data.projects.forEach(p=>{if(p.leaderId===mid)p.leaderId=next.id});data.members=data.members.filter(x=>x.id!==mid);persist(`Đã xóa thành viên: ${m.name}`)}}
function cloudOK(){return cloud.scriptUrl&&cloud.token&&!String(cloud.scriptUrl).includes('PASTE_APPS_SCRIPT')&&!String(cloud.token).includes('PASTE_SYNC_KEY')}function cloudStatus(mode=''){const pill=$('#syncPill'),txt=$('#syncText'),mini=$('#cloudMini');pill.classList.remove('online','error');if(!cloudOK()){pill.classList.add('error');txt.textContent='Cloud chưa cấu hình';mini.textContent='Cần cấu hình Sheet';return}if(mode==='error'){pill.classList.add('error');txt.textContent='Sync lỗi';mini.textContent='Sync lỗi';return}if(mode==='saving'){txt.textContent='Đang sync...';mini.textContent='Đang sync...';return}pill.classList.add('online');txt.textContent='Google Sheet';mini.textContent='Đang lưu online'}
function jsonpRequest(url,timeout=12000){
  return new Promise((resolve,reject)=>{
    const cb='jsonp_'+Date.now().toString(36)+Math.random().toString(36).slice(2);
    const script=document.createElement('script');
    const cleanup=()=>{clearTimeout(timer);delete window[cb];script.remove()};
    const timer=setTimeout(()=>{cleanup();reject(Error('jsonp_timeout'))},timeout);
    window[cb]=payload=>{cleanup();resolve(payload)};
    script.onerror=()=>{cleanup();reject(Error('jsonp_error'))};
    const u=new URL(url);
    u.searchParams.set('callback',cb);
    script.src=u.toString();
    document.head.appendChild(script);
  });
}
async function pushCloud(silent=false){
  if(!cloudOK()){cloudStatus('error');if(!silent)toast('Chưa cấu hình Google Sheet trong js/config.js');return}
  try{
    cloudStatus('saving');
    const payload={token:cloud.token,data:{...data,updatedAt:new Date().toISOString()}};
    await fetch(cloud.scriptUrl,{
      method:'POST',
      mode:'no-cors',
      headers:{'Content-Type':'text/plain;charset=utf-8'},
      body:JSON.stringify(payload),
      keepalive:false
    });
    cloudStatus();
    if(!silent)toast('Đã gửi dữ liệu lên Google Sheet');
  }catch(e){
    console.error(e);
    cloudStatus('error');
    if(!silent)toast('Không gửi được dữ liệu lên Google Sheet');
  }
}
function pullCloud(silent=false){
  if(!cloudOK()){cloudStatus('error');if(!silent)toast('Chưa cấu hình Google Sheet trong js/config.js');return}
  try{
    cloudStatus('saving');
    const u=new URL(cloud.scriptUrl);
    u.searchParams.set('token',cloud.token);
    u.searchParams.set('mode','json');
    jsonpRequest(u.toString()).then(j=>{
      if(!j.ok)throw Error(j.error||'pull failed');
      if(j.data?.projects&&j.data?.tasks&&j.data?.members){
        data=j.data;
        render();
        if(!silent)toast('Đã tải dữ liệu từ Google Sheet');
      }else if(!silent){
        toast('Google Sheet đang trống');
      }
      cloudStatus();
    }).catch(e=>{
      console.error(e);
      cloudStatus('error');
      if(!silent)toast('Không tải được dữ liệu từ Google Sheet');
    });
  }catch(e){
    console.error(e);
    cloudStatus('error');
    if(!silent)toast('Không tải được dữ liệu từ Google Sheet');
  }
}
function debouncedPush(){if(!cloudOK())return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>pushCloud(true),cloud.syncDebounceMs||700)}
function saveCloud(){cloud={...cloud,scriptUrl:$('#cloudUrl').value.trim(),token:$('#cloudKey').value.trim(),autoSync:true};Store.saveCloud(cloud);cloudStatus();toast('Đã lưu cấu hình Google Sheet Sync')}
function importJson(e){const f=e.target.files?.[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const x=JSON.parse(r.result);if(!x.projects||!x.tasks||!x.members)throw Error();data=x;render();persist('Đã nhập dữ liệu JSON')}catch{alert('Không nhập được JSON. Kiểm tra lại định dạng.')}finally{e.target.value=''}};r.readAsText(f)}
document.addEventListener('DOMContentLoaded',()=>{if($('#cloudUrl'))$('#cloudUrl').value=cloud.scriptUrl||'';if($('#cloudKey'))$('#cloudKey').value=cloud.token||'';$('#nav').onclick=e=>{const b=e.target.closest('button[data-page]');if(b)setPage(b.dataset.page)};$('#hamb').onclick=()=>$('#sidebar').classList.toggle('open');document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModals()});$$('[data-close]').forEach(b=>b.onclick=closeModals);$$('.modal-bg').forEach(m=>m.onclick=e=>{if(e.target===m)closeModals()});$('#heroProject').onclick=$('#addProject').onclick=()=>openProject();$('#heroTask').onclick=$('#addTask').onclick=$('#addTaskK').onclick=()=>openTask();$('#addMember').onclick=()=>{$('#mname').value='';$('#mrole').value='';openModal('memberModal')};$('#quickAdd').onclick=()=>page==='projects'?openProject():page==='members'?$('#addMember').click():openTask();$('#projectForm').onsubmit=saveProject;$('#taskForm').onsubmit=saveTask;$('#memberForm').onsubmit=saveMember;$('#pprogress').oninput=e=>$('#pProgressText').textContent=e.target.value+'%';$('#pstart').oninput=$('#pstart').onchange=syncProjectEndDate;$('#pend').onchange=syncProjectEndDate;['projectSearch','projectStatus'].forEach(x=>$('#'+x).oninput=projectTable);['taskSearch','taskProjectFilter','taskStatusFilter'].forEach(x=>$('#'+x).oninput=taskTable);['kanbanSearch','kanbanProject'].forEach(x=>$('#'+x).oninput=kanban);if($('#exportBtn'))$('#exportBtn').onclick=()=>Store.export(data);if($('#importBtn'))$('#importBtn').onclick=()=>$('#jsonFile').click();if($('#jsonFile'))$('#jsonFile').onchange=importJson;if($('#saveCloud'))$('#saveCloud').onclick=saveCloud;if($('#pushCloud'))$('#pushCloud').onclick=()=>pushCloud();if($('#pullCloud'))$('#pullCloud').onclick=()=>pullCloud();if($('#clearCloud'))$('#clearCloud').onclick=()=>{toast('Cloud Sync đã được ẩn. Hãy sửa js/config.js nếu cần đổi cấu hình.')};render();if(cloudOK())pullCloud(true)});
