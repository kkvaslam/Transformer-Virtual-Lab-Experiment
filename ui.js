// UI helpers: readouts, settings binding, CSV export, toasts

const UI = (() => {
  let log = [];

  function init(){
    document.getElementById('btnExportCSV').addEventListener('click', exportCSV);
    // Bind settings inputs to transformer params
    ['vpInput','kInput','rpInput','rsInput','pcoreInput'].forEach(id => {
      document.getElementById(id).addEventListener('change', (e)=>{
        const map = { vpInput:'Vp', kInput:'k', rpInput:'Rp', rsInput:'Rs', pcoreInput:'Pcore' };
        TransformerModel.setParam(map[id], parseFloat(e.target.value));
        flash('Model parameter updated');
      });
    });
  }

  function updateAllReads(res){
    setText('vpRead', res.Vp, 2);
    setText('ipRead', res.Ip, 3);
    setText('vsRead', res.Vs, 2);
    setText('isRead', res.Is, 3);
    setText('pinRead', res.Pin, 3);
    setText('poutRead', res.Pout, 3);
    setText('etaRead', res.eta*100, 1, '%');
  }

  function setText(id, val, digits=2, suffix=''){
    const n = (isFinite(val)? Number(val):0);
    document.getElementById(id).textContent = `${n.toFixed(digits)}${suffix}`;
  }

  function captureReading(R, res){
    log.push({ R, ...res, ts: new Date().toISOString() });
  }

  function exportCSV(){
    if(log.length===0){ flash('No data to export', true); return; }
    const header = ['timestamp','R','Vp','Ip','Vs','Is','Pin','Pout','eta'];
    const rows = log.map(r=> [r.ts,r.R,r.Vp,r.Ip,r.Vs,r.Is,r.Pin,r.Pout,r.eta]);
    const csv = [header.join(','), ...rows.map(a=>a.join(','))].join('\
');
    const blob = new Blob([csv], {type:'text/csv'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'transformer_part2_readings.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  function flash(msg, warn=false){
    let el = document.createElement('div');
    el.className = 'toast';
    el.style.cssText = `position:fixed;right:16px;bottom:16px;background:${warn?'#b00020':'#0f5132'};color:#fff;padding:10px 12px;border-radius:6px;box-shadow:0 2px 10px rgba(0,0,0,.2);z-index:1000`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 2200);
  }

  return { init, updateAllReads, captureReading, flash };
})();


