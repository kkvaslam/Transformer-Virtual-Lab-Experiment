// Main orchestrator – initializes handlers and default state
window.addEventListener('DOMContentLoaded', () => {
  UI.init();
  Wiring.init();
  TransformerModel.init({
    Vp: parseFloat(document.getElementById('vpInput').value),
    k: parseFloat(document.getElementById('kInput').value),
    Rp: parseFloat(document.getElementById('rpInput').value),
    Rs: parseFloat(document.getElementById('rsInput').value),
    Pcore: parseFloat(document.getElementById('pcoreInput').value)
  });
  UI.updateAllReads(TransformerModel.zero());
});


