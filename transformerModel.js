// Non-ideal transformer model (RMS quantities)
// k = Ns/Np (turns ratio)
// Primary series resistance Rp, secondary Rs, constant core loss Pcore (W)

const TransformerModel = (() => {
  let params = { Vp: 5, k: 2.5, Rp: 0.8, Rs: 0.6, Pcore: 0.5 };

  function init(p){ params = { ...params, ...p }; }

  function compute(Rload){
    const { Vp, k, Rp, Rs, Pcore } = params;
    const RL = Math.max(0.001, Rload);

    // Refer secondary elements to primary
    const Rs_prime = Rs / (k*k);     // Rs' = Rs * (Np/Ns)^2 = Rs/k^2
    const RL_prime = RL / (k*k);     // RL' = RL/k^2

    const Rtotal_p = Rp + Rs_prime + RL_prime; // simple series model
    const Ip = Vp / Rtotal_p;                   // primary current (A)

    const Is = Ip / k;                          // ideal relation Is = Ip * (Np/Ns) = Ip/k
    const Vs_drop_sec = Is * Rs;                // copper drop in secondary
    const Vs_open = Vp * k;                     // open-circuit secondary ideal
    // Approx secondary terminal voltage (Thevenin-esque)
    const Vs = (RL / (RL + Rs)) * Vs_open;      // voltage division with Rs

    const Pin = Vp * Ip + Pcore;                // input power with core loss
    const Pout = (Vs*Vs) / RL;                  // load power
    const eta = (Pin > 0) ? (Pout / Pin) : 0;   // efficiency

    // Primary terminal voltage reading equals source setting (ideal source)
    const Vp_read = Vp;

    return {
      Vp: Vp_read,
      Ip,
      Vs,
      Is,
      Pin,
      Pout,
      eta
    };
  }

  function setParam(key, val){ params[key] = parseFloat(val); }
  function getParams(){ return { ...params }; }
  function zero(){ return { Vp:0, Ip:0, Vs:0, Is:0, Pin:0, Pout:0, eta:0}; }

  return { init, compute, setParam, getParams, zero };
})();


