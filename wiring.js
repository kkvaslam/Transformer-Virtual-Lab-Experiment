// Handles wiring: terminals, click-to-connect, SVG wires, and correctness checks

const Wiring = (() => {
  const layer = () => document.getElementById('wireLayer');
  const terminals = () => Array.from(document.querySelectorAll('.terminal'));

  // Store connections as pairs of node IDs
  let connections = []; // e.g., [{a:"SUPPLY+", b:"AP+", el: <svgline>}, ...]
  let pending = null;   // currently selected terminal for starting a wire

  // Accepted circuit topology (one correct solution variant)
  // Primary loop: SUPPLY+ -> AP+ -> AP- -> PRI_A -> PRI_E -> SUPPLY-
  // Primary voltmeter across PRI_A and PRI_E (or SUPPLY+, SUPPLY-)
  // Secondary loop: SEC_a -> AS+ -> AS- -> LOAD_L -> LOAD_R -> SEC_e
  // Secondary voltmeter across SEC_a and SEC_e (or LOAD_L, LOAD_R)

  const REQUIRED = {
    seriesPrimary: [
      ["SUPPLY+","AP+"],["AP-","PRI_A"],["PRI_E","SUPPLY-"]
    ],
    seriesSecondary: [
      ["SEC_a","AS+"],["AS-","LOAD_L"],["LOAD_R","SEC_e"]
    ],
    parallelPrimary: [["VP+","PRI_A"],["VP-","PRI_E"]],
    parallelSecondary: [["VS+","SEC_a"],["VS-","SEC_e"]]
  };

  function init(){
    terminals().forEach(t => t.addEventListener('click', onTerminalClick));
    document.getElementById('btnReset').addEventListener('click', reset);
    document.getElementById('btnRun').addEventListener('click', measureIfReady);
    document.getElementById('btnShowSolution').addEventListener('click', showSolution);
    document.getElementById('btnHideSolution').addEventListener('click', hideSolution);
  }

  function onTerminalClick(e){
    const term = e.currentTarget;
    const node = term.dataset.node;

    if(!pending){
      pending = term; term.classList.add('active');
      return;
    }
    const start = pending; const startNode = start.dataset.node;
    const end = term; const endNode = node;

    if(start === end){ start.classList.remove('active'); pending = null; return; }
    if(isConnected(startNode, endNode)){
      start.classList.remove('active'); pending = null; return; // already linked
    }

    // Create SVG wire line between centers
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    const sc = centerOf(start); const ec = centerOf(end);
    line.setAttribute('x1', sc.x); line.setAttribute('y1', sc.y);
    line.setAttribute('x2', ec.x); line.setAttribute('y2', ec.y);
    line.setAttribute('class','wire');
    line.addEventListener('click', () => removeWire(line, startNode, endNode));
    layer().appendChild(line);
    connections.push({ a:startNode, b:endNode, el: line });

    start.classList.remove('active'); pending = null;
    // Update measurements if circuit becomes valid
    measureIfReady();
  }

  function centerOf(el){
    const rect = el.getBoundingClientRect();
    const host = layer().getBoundingClientRect();
    return { x: rect.left - host.left + rect.width/2, y: rect.top - host.top + rect.height/2 };
  }

  function isConnected(a,b){
    return connections.some(c=> (c.a===a && c.b===b) || (c.a===b && c.b===a));
  }

  function removeWire(line,a,b){
    line.remove();
    connections = connections.filter(c=> !(c.el===line));
    UI.flash("Wire removed");
    UI.updateAllReads(TransformerModel.zero());
  }

  function reset(){
    connections.forEach(c=>c.el.remove());
    connections = [];
    document.querySelectorAll('.terminal.active').forEach(t=>t.classList.remove('active'));
    UI.flash("All wires cleared");
    UI.updateAllReads(TransformerModel.zero());
  }

  function hasPair(a,b){ return isConnected(a,b); }
  function hasAll(pairs){ return pairs.every(([a,b]) => hasPair(a,b)); }

  function measureIfReady(){
    const R = parseFloat(document.getElementById('loadSelect').value);

    const primOK = hasAll(REQUIRED.seriesPrimary) && hasAll(REQUIRED.parallelPrimary);
    const secOK  = hasAll(REQUIRED.seriesSecondary) && hasAll(REQUIRED.parallelSecondary);

    if(!(primOK && secOK)){
      UI.flash("Circuit incomplete or incorrect. Check wiring.", true);
      UI.updateAllReads(TransformerModel.zero());
      Meters.update({ Vp:0, Ip:0, Vs:0, Is:0 });
      return;
    }

    const res = TransformerModel.compute(R);
    UI.updateAllReads(res);
    Meters.update({ Vp:res.Vp, Ip:res.Ip, Vs:res.Vs, Is:res.Is });
    UI.captureReading(R, res);
  }

  function showSolution(){
    // Draw hint wires as dashed lines for the correct wiring
    const pairs = [].concat(REQUIRED.seriesPrimary, REQUIRED.seriesSecondary, REQUIRED.parallelPrimary, REQUIRED.parallelSecondary);
    pairs.forEach(([a,b])=>{
      if(isConnected(a,b)) return;
      const aEl = findTerminal(a); const bEl = findTerminal(b);
      const sc = centerOf(aEl); const ec = centerOf(bEl);
      const line = document.createElementNS('http://www.w3.org/2000/svg','line');
      line.setAttribute('x1', sc.x); line.setAttribute('y1', sc.y);
      line.setAttribute('x2', ec.x); line.setAttribute('y2', ec.y);
      line.setAttribute('class','wire hint');
      layer().appendChild(line);
      // auto-remove hints on any action
      setTimeout(()=> line.remove(), 6000);
    });
  }

  function hideSolution(){
    Array.from(layer().querySelectorAll('.wire.hint')).forEach(l=>l.remove());
  }

  function findTerminal(id){ return document.querySelector(`.terminal[data-node="${id}"]`); }

  // Public API
  return { init, reset, measureIfReady };
})();


