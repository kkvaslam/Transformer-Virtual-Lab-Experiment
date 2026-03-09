// Updates the on-screen meter LCDs (simple formatting and clamping)

const Meters = (() => {
  const fmt = {
    V: v => (Math.abs(v) < 10 ? v.toFixed(2) : v.toFixed(1)),
    A: a => (Math.abs(a) < 1  ? a.toFixed(3) : a.toFixed(2))
  };

  function update({Vp, Ip, Vs, Is}){
    document.getElementById('voltmeterPDisplay').textContent = `${fmt.V(Vp)} V`;
    document.getElementById('ammeterPDisplay').textContent   = `${fmt.A(Ip)} A`;
    document.getElementById('voltmeterSDisplay').textContent = `${fmt.V(Vs)} V`;
    document.getElementById('ammeterSDisplay').textContent   = `${fmt.A(Is)} A`;
  }

  return { update };
})();


