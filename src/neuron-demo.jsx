import React, { useState, useEffect, useRef } from "react";

/* ---- palette: indigo/navy + gold, matching the program theme ---- */
const BG     = "#2e2c6e";   // deep indigo
const BG2    = "#252358";   // darker panel
const POS    = "#fbbf24";   // gold = positive weight / signal on
const NEG    = "#f4766e";   // coral = negative weight / counts for NO
const ZERO   = "#6b70b0";   // muted = zero weight
const OFF    = "#2a2862";   // input switched off (hollow/dark)
const GOLD   = "#fbbf24";
const INK    = "#1c1a47";
const TEXT   = "#e8e9f5";
const MUTE   = "#a5a8d4";

const STARTERS = {
  party: { label: "Go to the party?", inputs: ["Friends are going", "Homework is done", "It's far away"] },
  food:  { label: "Order takeout?",   inputs: ["I'm hungry", "Fridge is empty", "It's expensive"] },
  study: { label: "Study tonight?",   inputs: ["Test is tomorrow", "I feel prepared", "I'm exhausted"] },
};

const STAGES = [
  { key: "inputs",  name: "Inputs",  blurb: "Each factor is either on or off. Tap to switch them." },
  { key: "weights", name: "Weights", blurb: "Each weight decides how much its input counts." },
  { key: "sum",     name: "Sum",     blurb: "Every weighted input adds up into a single score." },
  { key: "output",  name: "Output",  blurb: "An activation function turns the score into the neuron's firing." },
  { key: "test",    name: "Test it", blurb: "Toggle any input and watch the score and output react." },
];

/* ---- neuron config ---- */
const W_RANGE = 5;                          // weights run from -5 … +5
const B_RANGE = 3;                          // bias runs from -3 … +3
const MAX_SCORE = 3 * W_RANGE + B_RANGE;    // largest possible |score|

export default function NeuronJourney() {
  const [phase, setPhase] = useState("setup");
  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState("Go to the party?");
  const [factors, setFactors] = useState(["Friends are going", "Homework is done", "It's far away"]);
  const [values, setValues] = useState([1, 0, 1]);
  const [weights, setWeights] = useState([2, 1, -2]);
  const [bias, setBias] = useState(0);

  const loadStarter = (k) => { setDecision(STARTERS[k].label); setFactors([...STARTERS[k].inputs]); };
  const begin = () => { setValues([1,1,1]); setWeights([1,1,1]); setBias(0); setStage(0); setPhase("play"); };

  if (phase === "setup") {
    const ready = decision.trim() && factors.every((f) => f.trim());
    return (
      <div style={S.page}>
        <FontStyle />
        <NetworkField />
        <div style={S.inner}>
          <div style={S.kicker}>ARTIFICIAL NEURON</div>
          <h1 style={S.h1}>Be the Neuron</h1>
          <p style={S.sub}>
            An artificial neuron weighs a few inputs and makes one yes/no
            decision. You'll build one step by step. Start by giving it
            something real to decide.
          </p>

          <div style={S.glassCard}>
            <div style={S.cardLabel}>THE DECISION</div>
            <input value={decision} onChange={(e) => setDecision(e.target.value)}
              placeholder="A real yes/no choice you make..." style={S.input} />
            <div style={S.starterRow}>
              <span style={S.starterHint}>or start from</span>
              {Object.entries(STARTERS).map(([k, s]) => (
                <button key={k} onClick={() => loadStarter(k)} style={S.starterBtn}>{s.label}</button>
              ))}
            </div>
          </div>

          <div style={S.glassCard}>
            <div style={S.cardLabel}>THREE INPUTS &mdash; THE FACTORS THAT MATTER</div>
            {factors.map((f, i) => (
              <div key={i} style={S.factorRow}>
                <span style={S.factorNum}>{i + 1}</span>
                <input value={f} onChange={(e) => {
                  const n = [...factors]; n[i] = e.target.value; setFactors(n);
                }} placeholder={`Input ${i + 1}`} style={S.input} />
              </div>
            ))}
          </div>

          <button onClick={begin} disabled={!ready}
            style={{ ...S.bigBtn, opacity: ready ? 1 : 0.4 }}>
            Build the neuron &rarr;
          </button>
        </div>
      </div>
    );
  }

  const contribs = weights.map((w, i) => w * values[i]);
  const sum = contribs.reduce((a, b) => a + b, 0) + Number(bias);
  const fires = sum > 0;
  const stageKey = STAGES[stage].key;

  return (
    <div style={S.page}>
      <FontStyle />
      <NetworkField faint />
      <div style={S.inner}>
        <div style={S.rail}>
          {STAGES.map((s, i) => (
            <React.Fragment key={s.key}>
              <button onClick={() => setStage(i)} style={S.railNode}>
                <span style={{
                  ...S.railDot,
                  background: i < stage ? GOLD : i === stage ? GOLD : "rgba(255,255,255,.07)",
                  boxShadow: i === stage ? `0 0 16px ${GOLD}aa` : "none",
                  color: i <= stage ? INK : MUTE,
                  border: i > stage ? "1px solid rgba(255,255,255,.14)" : "none",
                }}>{i < stage ? "\u2713" : i + 1}</span>
                <span style={{ ...S.railName, color: i === stage ? "#fff" : MUTE }}>
                  {s.name}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <span style={{ ...S.railLink,
                  background: i < stage ? GOLD : "rgba(255,255,255,.1)" }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div style={S.stageHead}>
          <h2 style={S.stageTitle}>{STAGES[stage].name}</h2>
          <p style={S.stageBlurb}>{STAGES[stage].blurb}</p>
        </div>

        <NeuronStage
          stageKey={stageKey} factors={factors} values={values} weights={weights}
          bias={bias} sum={sum} fires={fires}
          setValues={setValues} setWeights={setWeights} setBias={setBias}
        />

        <div style={S.navRow}>
          <button onClick={() => stage > 0 ? setStage(stage - 1) : setPhase("setup")}
            style={S.ghostBtn}>
            {stage > 0 ? "Back" : "Redesign"}
          </button>
          {stage < STAGES.length - 1 ? (
            <button onClick={() => setStage(stage + 1)} style={S.nextBtn}>
              Next: {STAGES[stage + 1].name}
            </button>
          ) : (
            <button onClick={() => setStage(0)} style={S.nextBtn}>
              Run again
            </button>
          )}
        </div>

        {stageKey === "test" && (
          <div style={S.reflect}>
            <div style={S.cardLabel}>THE BIG PICTURE</div>
            <p style={S.reflectText}>
              You set these weights by hand. In a real neural network, weights
              aren't set &mdash; they're <b style={{ color: GOLD }}>learned
              through training</b>, adjusting little by little toward better
              predictions. Stack <b>thousands</b> of these neurons in layers,
              where each one's output feeds the next, and the network can
              capture patterns far too complex for any single neuron.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- the neuron diagram ---------- */
function NeuronStage({ stageKey, factors, values, weights, bias, sum, fires, setValues, setWeights, setBias }) {
  const W = 560, H = 430;
  const coreX = 300, coreY = 215, coreR = 60;
  const inTip = [{ x: 70, y: 100 }, { x: 70, y: 215 }, { x: 70, y: 330 }];
  const outX = 532;
  const biasX = coreX, biasY = 84;            // bias enters the core from above
  const wBadge = (i) => ({ x: 196, y: coreY + (i - 1) * 62 });  // weight badge column

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const bumpWeight = (i, d) => {
    const nw = [...weights]; nw[i] = clamp(nw[i] + d, -W_RANGE, W_RANGE); setWeights(nw);
  };

  const focus = {
    inputs:  "translate(110px,0) scale(1.16)",
    weights: "translate(40px,0) scale(1.12)",
    sum:     "translate(0px,0) scale(1.16)",
    output:  "translate(-110px,0) scale(1.14)",
    test:    "translate(0px,0) scale(1)",
  }[stageKey];

  // inputs are interactive on the first stage and the final test stage
  const inputsLive = stageKey === "inputs" || stageKey === "test";

  return (
    <div style={S.stageWrap}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", display: "block",
        transition: "transform .65s cubic-bezier(.4,0,.2,1)", transform: focus }}>
        <defs>
          <radialGradient id="core" cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor={fires ? "#ffd970" : "#4a4790"} />
            <stop offset="100%" stopColor={fires ? "#e0960c" : "#302d6b"} />
          </radialGradient>
          <filter id="soft"><feGaussianBlur stdDeviation="3.5" /></filter>
        </defs>

        {inTip.map((t, i) => {
          const w = weights[i];
          const on = values[i] === 1;
          const live = on && w !== 0;
          const wcol = w === 0 ? ZERO : w > 0 ? POS : NEG;   // weight (line) sign colour
          const thick = stageKey === "inputs" ? 4.5 : 2 + Math.abs(w) * 1.6;
          const dim = (stageKey === "sum" || stageKey === "output") ? 0.45 : 1;
          const showLabel = stageKey === "inputs" || stageKey === "test";
          const b = wBadge(i);
          // straight line from the input node to the neuron's left edge
          const x1 = t.x + 16, y1 = t.y;
          const ang = Math.atan2(coreY - y1, coreX - x1);
          const x2 = coreX - Math.cos(ang) * coreR;
          const y2 = coreY - Math.sin(ang) * coreR;
          const path = `M ${x1} ${y1} L ${x2} ${y2}`;
          return (
            <g key={i} opacity={dim}>
              {/* the connection carries the WEIGHT's sign colour */}
              <path d={path} fill="none" stroke={live ? wcol : "#3b3982"}
                strokeWidth={thick} strokeLinecap="round" opacity={live ? 0.9 : 0.5} />
              {live && (
                <path className="travel" d={path} fill="none" stroke="#fff"
                  strokeWidth={Math.max(1.3, thick - 2.6)} strokeLinecap="round" />
              )}
              <g style={{ cursor: inputsLive ? "pointer" : "default" }}
                onClick={() => {
                  if (!inputsLive) return;
                  const v = [...values]; v[i] = v[i] ? 0 : 1; setValues(v);
                }}>
                {/* the input node shows the SIGNAL: on = gold (positive), off = dark */}
                {on && <circle cx={t.x} cy={t.y} r={24} fill={POS}
                  opacity={0.28} filter="url(#soft)" />}
                <circle cx={t.x} cy={t.y} r={16}
                  fill={on ? POS : OFF}
                  stroke={on ? "#fff" : "#4d52a0"} strokeWidth={2} />
                <text x={t.x} y={t.y + 5} textAnchor="middle" fontSize={14}
                  fontWeight={700} fill={on ? INK : MUTE}
                  style={{ fontFamily: "Poppins, sans-serif" }}>{values[i]}</text>
                {showLabel && (
                  <text x={t.x} y={t.y + 32} textAnchor="middle" fontSize={9.5}
                    fontWeight={600} fill={on ? TEXT : MUTE}
                    style={{ fontFamily: "Poppins, sans-serif" }}>
                    {factors[i].length > 22 ? factors[i].slice(0, 21) + "\u2026" : factors[i]}
                  </text>
                )}
                {/* explicit ON/OFF toggle pill so it's clearly clickable */}
                {stageKey === "inputs" && (
                  <g transform={`translate(${t.x - 22},${t.y + 40})`}>
                    <rect width={44} height={17} rx={8.5}
                      fill={on ? "rgba(251,191,36,.16)" : "rgba(255,255,255,.06)"}
                      stroke={on ? POS : "#4d52a0"} strokeWidth={1} />
                    <circle cx={on ? 35 : 9} cy={8.5} r={5.5} fill={on ? POS : "#7a7fbf"} />
                    <text x={on ? 14 : 27} y={12} textAnchor="middle" fontSize={8}
                      fontWeight={700} fill={on ? POS : MUTE}
                      style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 0.5 }}>
                      {on ? "ON" : "OFF"}</text>
                  </g>
                )}
              </g>
              {/* weight badge sits on the wire; its colour shows the weight's sign */}
              {(stageKey === "weights" || stageKey === "inputs") && (
                <g opacity={stageKey === "weights" ? 1 : 0.5}>
                  <circle cx={b.x} cy={b.y} r={16} fill={wcol} />
                  <text x={b.x} y={b.y + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                    fill={w > 0 ? INK : "#fff"} style={{ fontFamily: "Poppins, sans-serif" }}>
                    {w > 0 ? `+${w}` : w}</text>
                  {/* up / down steppers beside the badge \u2014 adjust the weight on the diagram */}
                  {stageKey === "weights" && (
                    <>
                      <Stepper x={b.x + 26} y={b.y - 12} dir="up"
                        disabled={w >= W_RANGE} onClick={() => bumpWeight(i, +1)} />
                      <Stepper x={b.x + 26} y={b.y + 12} dir="down"
                        disabled={w <= -W_RANGE} onClick={() => bumpWeight(i, -1)} />
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* bias enters the core from above, like another input feeding the sum */}
        {(stageKey === "sum" || stageKey === "output" || stageKey === "test") && (() => {
          const bcol = bias === 0 ? ZERO : bias > 0 ? POS : NEG;
          const live = bias !== 0;
          const thick = 2 + Math.abs(bias) * 1.6;
          const path = `M ${biasX} ${biasY + 18} L ${coreX} ${coreY - coreR}`;
          return (
            <g opacity={stageKey === "sum" ? 1 : 0.5}>
              <path d={path} fill="none" stroke={live ? bcol : "#3b3982"}
                strokeWidth={thick} strokeLinecap="round" opacity={live ? 0.9 : 0.5} />
              {live && stageKey === "sum" && (
                <path className="travel" d={path} fill="none" stroke="#fff"
                  strokeWidth={Math.max(1.3, thick - 2.6)} strokeLinecap="round" />
              )}
              <circle cx={biasX} cy={biasY} r={17} fill={live ? bcol : OFF}
                stroke={live ? "#fff" : "#4d52a0"} strokeWidth={1.5} />
              <text x={biasX} y={biasY + 4} textAnchor="middle" fontSize={12} fontWeight={700}
                fill={bias > 0 ? INK : "#fff"} style={{ fontFamily: "Poppins, sans-serif" }}>
                {bias > 0 ? `+${bias}` : bias}</text>
              <text x={biasX} y={biasY - 26} textAnchor="middle" fontSize={9.5}
                fontWeight={700} fill={MUTE}
                style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 1 }}>BIAS</text>
            </g>
          );
        })()}

        {fires && <circle cx={coreX} cy={coreY} r={coreR + 16}
          fill={GOLD} opacity={0.2} filter="url(#soft)" />}
        <circle cx={coreX} cy={coreY} r={coreR} fill="url(#core)"
          stroke={fires ? GOLD : "#4d52a0"} strokeWidth={2.5} />
        {(stageKey === "sum" || stageKey === "output" || stageKey === "test") ? (
          <>
            <text x={coreX} y={coreY - 10} textAnchor="middle" fontSize={11}
              fontWeight={600} fill={fires ? INK : MUTE}
              style={{ fontFamily: "Poppins, sans-serif", letterSpacing: 0.5 }}>SCORE</text>
            <text key={sum} className="pop" x={coreX} y={coreY + 20}
              textAnchor="middle" fontSize={30} fontWeight={700}
              fill={fires ? INK : "#fff"}
              style={{ fontFamily: "Poppins, sans-serif" }}>{sum}</text>
          </>
        ) : (
          <text x={coreX} y={coreY + 5} textAnchor="middle" fontSize={12}
            fontWeight={600} fill={MUTE}
            style={{ fontFamily: "Poppins, sans-serif" }}>neuron</text>
        )}

        {(() => {
          // straight axon line out of the neuron's right edge
          const path = `M ${coreX + coreR} ${coreY} L ${outX - 4} ${coreY}`;
          // output node grows with how strongly the neuron fires
          const strength = Math.max(0, sum); // nothing passes through if <= 0
          const outR = fires ? 15 + Math.min(strength, 9) * 2.2 : 13;
          const aThick = (stageKey === "output" || stageKey === "test") ? 11 : 8;
          return (
            <g opacity={stageKey === "inputs" || stageKey === "weights" ? 0.45 : 1}>
              {/* wire only carries signal when the neuron fires */}
              <path d={path} fill="none" stroke={fires ? GOLD : "#34326f"}
                strokeWidth={fires ? aThick : 4} strokeLinecap="round"
                opacity={fires ? 0.9 : 0.6} />
              {fires && (
                <path className="travel" d={path} fill="none" stroke="#fff"
                  strokeWidth={4} strokeLinecap="round" />
              )}
              {fires && <circle cx={outX} cy={coreY} r={outR + 12} fill={GOLD}
                opacity={0.22} filter="url(#soft)" />}
              {fires ? (
                <circle cx={outX} cy={coreY} r={outR} fill={GOLD} />
              ) : (
                /* below threshold: hollow, dark — no signal gets through */
                <circle cx={outX} cy={coreY} r={outR} fill="none"
                  stroke="#4d52a0" strokeWidth={2} strokeDasharray="3 3" />
              )}
              <text x={outX} y={coreY + 5} textAnchor="middle" fontSize={12}
                fontWeight={700} fill={fires ? INK : MUTE}
                style={{ fontFamily: "Poppins, sans-serif" }}>{fires ? "YES" : "NO"}</text>
            </g>
          );
        })()}
      </svg>

      <div style={S.deck}>
        {stageKey === "inputs" && factors.map((f, i) => (
          <button key={i} onClick={() => {
              const v = [...values]; v[i] = v[i] ? 0 : 1; setValues(v);
            }}
            style={{ ...S.inChip,
              borderColor: values[i] ? GOLD : "rgba(255,255,255,.12)",
              background: values[i] ? "rgba(251,191,36,.1)" : "rgba(255,255,255,.03)" }}>
            <span style={{ ...S.inDot, background: values[i] ? GOLD : "#4d52a0" }} />
            <span style={S.inText}>{f}</span>
            <span style={{ ...S.inState, color: values[i] ? GOLD : MUTE }}>
              {values[i] ? "ON" : "OFF"}
            </span>
          </button>
        ))}

        {stageKey === "weights" && (
          <>
            {factors.map((f, i) => (
              <div key={i} style={S.wBlock}>
                <div style={S.wTop}>
                  <span style={S.wName}>{f}</span>
                  <span style={{ ...S.wVal,
                    color: weights[i] === 0 ? MUTE : weights[i] > 0 ? GOLD : NEG }}>
                    {weights[i] > 0 ? `+${weights[i]}` : weights[i]}
                  </span>
                </div>
                <Slider value={weights[i]} min={-W_RANGE} max={W_RANGE} onChange={(v) => {
                  const w = [...weights]; w[i] = v; setWeights(w);
                }} leftLabel="counts for NO" rightLabel="counts for YES" />
              </div>
            ))}
            <div style={S.cbHead}>EACH INPUT'S EFFECT &mdash; weight &times; input</div>
            <ContribBars max={W_RANGE}
              items={factors.map((f, i) => ({ label: f, value: weights[i] * values[i] }))} />
            <p style={S.deckNote}>
              Drag the sliders or tap the <b>+ / &minus;</b> arrows on the diagram.
              Toward <b style={{ color: GOLD }}>YES</b> the input pushes the
              neuron to fire; toward <b style={{ color: NEG }}>NO</b> it pushes
              back. The further from zero, the more that input matters &mdash;
              the connection thickens to match. Inputs that are switched off
              contribute nothing, whatever their weight.
            </p>
          </>
        )}

        {stageKey === "sum" && (
          <>
            <div style={S.cbHead}>HOW THE SCORE ADDS UP</div>
            <ContribBars max={W_RANGE}
              items={[
                ...factors.map((f, i) => ({ label: f, value: weights[i] * values[i] })),
                { label: "Bias", value: Number(bias) },
              ]} />
            <div style={S.sumTotal}>
              <span style={S.sumTotalLabel}>SCORE</span>
              <span style={{ ...S.sumTotalVal, color: fires ? GOLD : "#c7caec" }}>{sum}</span>
            </div>
            <div style={S.wBlock}>
              <div style={S.wTop}>
                <span style={S.wName}>Bias &mdash; the neuron's starting lean</span>
                <span style={{ ...S.wVal,
                  color: bias === 0 ? MUTE : bias > 0 ? GOLD : NEG }}>
                  {bias > 0 ? `+${bias}` : bias}
                </span>
              </div>
              <Slider value={bias} min={-B_RANGE} max={B_RANGE} onChange={setBias}
                leftLabel="less likely to fire" rightLabel="more likely to fire" />
            </div>
            <p style={S.deckNote}>
              Bias is its own term in the sum &mdash; it feeds the neuron from
              above (no input required) and tilts the decision before any input
              arrives. Higher bias makes the neuron more likely to fire, lower
              bias less likely.
            </p>
          </>
        )}

        {stageKey === "output" && (
          <>
            <div style={S.gaugeTrack}>
              <div style={{ ...S.gaugeFill,
                width: `${Math.max(0, Math.min(100, ((sum + MAX_SCORE) / (2 * MAX_SCORE)) * 100))}%`,
                background: fires ? GOLD : "#4d52a0" }} />
              <div style={S.gaugeMid} />
            </div>
            <div style={S.gaugeLabels}>
              <span>stays quiet</span>
              <span style={{ fontWeight: 600, color: MUTE }}>threshold</span>
              <span>fires</span>
            </div>
            <div style={{ ...S.verdict,
              background: fires ? "rgba(251,191,36,.12)" : "rgba(124,131,200,.14)",
              color: fires ? GOLD : "#c7caec",
              borderColor: fires ? "rgba(251,191,36,.4)" : "rgba(124,131,200,.35)" }}>
              {fires
                ? `Score ${sum} clears the threshold \u2014 the neuron fires YES`
                : `Score ${sum} is below the threshold \u2014 the neuron stays at NO`}
            </div>
            <p style={S.deckNote}>
              The higher the score, the more strongly the neuron fires and the
              stronger the signal it passes on &mdash; watch the output grow.
              At or below the threshold, no signal passes through at all.
            </p>
            <div style={S.actNote}>
              <span style={S.actTag}>ACTIVATION FUNCTION</span>
              The neuron doesn't pass the raw score straight on &mdash; it runs
              it through an <b style={{ color: GOLD }}>activation function</b>.
              Here that's a <b>step function</b>: clear the threshold and it
              fires (1), otherwise it stays silent (0). Real networks swap in
              smooth activations like <b>sigmoid</b> or <b>ReLU</b>, so the
              output can be shades in between rather than a hard yes/no.
            </div>
          </>
        )}

        {stageKey === "test" && (
          <>
            <p style={{ ...S.deckNote, marginTop: 0, marginBottom: 10 }}>
              Tap an input on or off &mdash; watch the score and output shift.
            </p>
            {factors.map((f, i) => (
              <button key={i} onClick={() => {
                  const v = [...values]; v[i] = v[i] ? 0 : 1; setValues(v);
                }}
                style={{ ...S.inChip,
                  borderColor: values[i] ? GOLD : "rgba(255,255,255,.12)",
                  background: values[i] ? "rgba(251,191,36,.1)" : "rgba(255,255,255,.03)" }}>
                <span style={{ ...S.inDot, background: values[i] ? GOLD : "#4d52a0" }} />
                <span style={S.inText}>{f}</span>
                <span style={S.inWeight}>weight {weights[i] > 0 ? `+${weights[i]}` : weights[i]}</span>
                <span style={{ ...S.inState, color: values[i] ? GOLD : MUTE }}>
                  {values[i] ? "ON" : "OFF"}
                </span>
              </button>
            ))}
            <div style={S.testReadout}>
              <div style={S.testCell}>
                <div style={S.testLabel}>SCORE</div>
                <div style={{ ...S.testValue, color: fires ? GOLD : "#c7caec" }}>{sum}</div>
              </div>
              <div style={S.testArrow}>&rarr;</div>
              <div style={S.testCell}>
                <div style={S.testLabel}>OUTPUT</div>
                <div style={{ ...S.testValue, color: fires ? GOLD : "#c7caec" }}>
                  {fires ? "YES" : "NO"}
                </div>
              </div>
            </div>
            <p style={S.deckNote}>
              {fires
                ? `The neuron fires YES, and a score of ${sum} means it passes on a fairly ${sum >= MAX_SCORE * 0.4 ? "strong" : "modest"} signal.`
                : `The score is ${sum} \u2014 below the threshold, so the neuron stays at NO and passes on nothing.`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- smooth slider ---------- */
function Slider({ value, onChange, leftLabel, rightLabel, min = -3, max = 3 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={S.sliderWrap}>
      <div style={S.sliderEnds}>
        <span style={{ color: NEG }}>{leftLabel}</span>
        <span style={{ color: GOLD }}>{rightLabel}</span>
      </div>
      <div style={S.sliderTrackWrap}>
        <div style={S.sliderGrad} />
        <div style={{ ...S.sliderThumb, left: `${pct}%` }} />
        <input type="range" min={min} max={max} step={1} value={value}
          onChange={(e) => onChange(+e.target.value)} style={S.sliderInput} />
      </div>
    </div>
  );
}

/* ---------- a small +/- stepper drawn inside the SVG ---------- */
function Stepper({ x, y, dir, onClick, disabled, r = 11 }) {
  const t = r * 0.5;
  const pts = dir === "up"
    ? `${x - t},${y + t * 0.55} ${x + t},${y + t * 0.55} ${x},${y - t * 0.7}`
    : `${x - t},${y - t * 0.55} ${x + t},${y - t * 0.55} ${x},${y + t * 0.7}`;
  return (
    <g style={{ cursor: disabled ? "default" : "pointer" }} opacity={disabled ? 0.3 : 1}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}>
      <circle cx={x} cy={y} r={r} fill="rgba(255,255,255,.1)"
        stroke="rgba(255,255,255,.22)" strokeWidth={1} />
      <polygon points={pts} fill="#fff" />
    </g>
  );
}

/* ---------- signed contribution bars (relative effect of each input) ---------- */
function ContribBars({ items, max }) {
  return (
    <div style={S.cbWrap}>
      {items.map((it, i) => {
        const frac = Math.max(-1, Math.min(1, it.value / max));
        const pos = it.value >= 0;
        const col = it.value === 0 ? ZERO : pos ? POS : NEG;
        return (
          <div key={i} style={S.cbRow}>
            <span style={S.cbLabel} title={it.label}>
              {it.label.length > 16 ? it.label.slice(0, 15) + "…" : it.label}
            </span>
            <div style={S.cbTrack}>
              <div style={S.cbAxis} />
              <div style={{ position: "absolute", top: 4, height: 11, borderRadius: 3,
                background: col, transition: "all .25s ease",
                ...(pos ? { left: "50%", width: `${frac * 50}%` }
                        : { right: "50%", width: `${-frac * 50}%` }) }} />
            </div>
            <span style={{ ...S.cbVal, color: it.value === 0 ? MUTE : pos ? GOLD : NEG }}>
              {it.value > 0 ? `+${it.value}` : it.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- animated neural-network background ---------- */
function NetworkField({ faint = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const k = faint ? 0.4 : 1; // dim everything for the play-page version
    let raf, t = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // layered network: 4 layers of nodes
    const build = () => {
      const w = canvas.width, h = canvas.height;
      const layers = [4, 6, 6, 3];
      const nodes = [];
      layers.forEach((count, li) => {
        const x = (w / (layers.length + 1)) * (li + 1);
        for (let n = 0; n < count; n++) {
          const y = (h / (count + 1)) * (n + 1);
          nodes.push({ x, y, li, jitter: Math.random() * 6.28, r: 2.4 + Math.random() * 1.6 });
        }
      });
      const edges = [];
      for (let li = 0; li < layers.length - 1; li++) {
        const a = nodes.filter((n) => n.li === li);
        const b = nodes.filter((n) => n.li === li + 1);
        a.forEach((na) => b.forEach((nb) => {
          if (Math.random() < 0.72)
            edges.push({ a: na, b: nb, phase: Math.random() * 6.28, speed: 0.4 + Math.random() * 0.8 });
        }));
      }
      return { nodes, edges };
    };
    let net = build();

    const draw = () => {
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      t += 0.012;

      // edges
      net.edges.forEach((e) => {
        const ax = e.a.x + Math.sin(t + e.a.jitter) * 4;
        const ay = e.a.y + Math.cos(t + e.a.jitter) * 4;
        const bx = e.b.x + Math.sin(t + e.b.jitter) * 4;
        const by = e.b.y + Math.cos(t + e.b.jitter) * 4;
        ctx.strokeStyle = `rgba(165,168,212,${0.14 * k})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(bx, by);
        ctx.stroke();

        // travelling signal pulse
        const prog = ((t * e.speed + e.phase) % 6.28) / 6.28;
        if (prog < 1) {
          const px = ax + (bx - ax) * prog;
          const py = ay + (by - ay) * prog;
          const fade = Math.sin(prog * Math.PI);
          ctx.fillStyle = `rgba(251,191,36,${fade * 0.85 * k})`;
          ctx.beginPath();
          ctx.arc(px, py, 2.2, 0, 6.28);
          ctx.fill();
        }
      });

      // nodes
      net.nodes.forEach((n) => {
        const nx = n.x + Math.sin(t + n.jitter) * 4;
        const ny = n.y + Math.cos(t + n.jitter) * 4;
        const pulse = 0.6 + Math.sin(t * 1.5 + n.jitter) * 0.4;
        ctx.fillStyle = `rgba(251,191,36,${0.15 * pulse * k})`;
        ctx.beginPath();
        ctx.arc(nx, ny, n.r * 3.5, 0, 6.28);
        ctx.fill();
        ctx.fillStyle = `rgba(232,233,245,${(0.5 + pulse * 0.4) * k})`;
        ctx.beginPath();
        ctx.arc(nx, ny, n.r, 0, 6.28);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };

    const onResize = () => { resize(); net = build(); };
    window.removeEventListener("resize", resize);
    window.addEventListener("resize", onResize);
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, [faint]);

  return (
    <div style={S.netField}>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%" }} />
      <div style={S.netVignette} />
    </div>
  );
}

function FontStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
      @keyframes travelDash { to { stroke-dashoffset: -22; } }
      @keyframes popIn { 0%{transform:scale(.6);opacity:0} 60%{transform:scale(1.12)} 100%{transform:scale(1);opacity:1} }
      .travel { stroke-dasharray: 5 14; animation: travelDash 1s linear infinite; }
      .pop { transform-origin: center; transform-box: fill-box; animation: popIn .35s cubic-bezier(.34,1.56,.64,1) both; }
    `}</style>
  );
}

const FONT = "Poppins, system-ui, sans-serif";
const S = {
  page: { position: "relative", minHeight: "100%", background: BG,
    fontFamily: FONT, overflow: "hidden", color: TEXT },

  netField: { position: "absolute", inset: 0, overflow: "hidden",
    pointerEvents: "none" },
  netVignette: { position: "absolute", inset: 0,
    background: `radial-gradient(ellipse at 50% 42%, transparent 35%, ${BG} 88%)` },

  glowField: { position: "absolute", inset: "-20%", pointerEvents: "none",
    background: `radial-gradient(circle at 50% 36%, rgba(251,191,36,.07), transparent 60%)` },

  inner: { position: "relative", maxWidth: 580, margin: "0 auto",
    padding: "30px 18px 42px" },

  kicker: { fontSize: 11, fontWeight: 700, letterSpacing: 3, color: GOLD,
    textAlign: "center" },
  h1: { fontSize: 36, fontWeight: 600, margin: "8px 0 14px", textAlign: "center",
    color: "#fff", letterSpacing: -0.5 },
  sub: { fontSize: 14, lineHeight: 1.65, color: MUTE, textAlign: "center",
    margin: "0 auto 26px", maxWidth: 440, fontWeight: 400 },

  glassCard: { background: "rgba(255,255,255,.04)",
    border: "1px solid rgba(255,255,255,.09)", borderRadius: 16,
    padding: 20, marginBottom: 14, backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)" },
  cardLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4,
    color: MUTE, marginBottom: 14 },
  input: { width: "100%", boxSizing: "border-box", padding: "12px 14px",
    borderRadius: 11, border: "1px solid rgba(255,255,255,.13)",
    background: "rgba(0,0,0,.22)", color: "#fff", fontSize: 14,
    fontFamily: FONT, fontWeight: 500 },
  starterRow: { display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12,
    alignItems: "center" },
  starterHint: { fontSize: 11.5, color: MUTE, fontWeight: 500 },
  starterBtn: { background: "rgba(255,255,255,.06)",
    border: "1px solid rgba(255,255,255,.12)", color: TEXT,
    borderRadius: 99, padding: "6px 13px", fontSize: 12, cursor: "pointer",
    fontWeight: 500, fontFamily: FONT },
  factorRow: { display: "flex", alignItems: "center", gap: 11, padding: "5px 0" },
  factorNum: { width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
    background: GOLD, color: INK, display: "grid", placeItems: "center",
    fontWeight: 700, fontSize: 13 },
  bigBtn: { width: "100%", border: "none", borderRadius: 13, padding: "15px",
    background: GOLD, color: INK, fontSize: 15, fontWeight: 700,
    cursor: "pointer", fontFamily: FONT, marginTop: 4,
    boxShadow: "0 6px 24px rgba(251,191,36,.25)" },

  rail: { display: "flex", alignItems: "center", marginBottom: 22 },
  railNode: { display: "flex", flexDirection: "column", alignItems: "center",
    gap: 7, background: "none", border: "none", cursor: "pointer", padding: 0 },
  railDot: { width: 32, height: 32, borderRadius: "50%", display: "grid",
    placeItems: "center", fontWeight: 700, fontSize: 13,
    transition: "all .3s ease", boxSizing: "border-box" },
  railName: { fontSize: 11, fontWeight: 600, letterSpacing: 0.2 },
  railLink: { flex: 1, height: 2, margin: "0 6px 18px", borderRadius: 2,
    transition: "background .3s ease" },

  stageHead: { textAlign: "center", marginBottom: 8 },
  stageTitle: { fontSize: 23, fontWeight: 700, color: "#fff", margin: 0 },
  stageBlurb: { fontSize: 13, color: MUTE, margin: "5px 0 0", fontWeight: 400 },

  stageWrap: { background: BG2,
    border: "1px solid rgba(255,255,255,.08)", borderRadius: 18,
    padding: "12px 10px 18px", marginTop: 12, overflow: "hidden",
    boxShadow: "0 12px 40px rgba(10,9,30,.45)" },
  deck: { padding: "6px 12px 0" },

  inChip: { display: "flex", alignItems: "center", gap: 11, width: "100%",
    border: "1.5px solid", borderRadius: 12, padding: "12px 14px",
    marginBottom: 9, cursor: "pointer", fontFamily: FONT,
    transition: "all .18s ease" },
  inDot: { width: 9, height: 9, borderRadius: "50%", flexShrink: 0 },
  inText: { fontSize: 13.5, color: TEXT, flex: 1, textAlign: "left",
    fontWeight: 500 },
  inWeight: { fontSize: 10.5, color: MUTE, fontWeight: 600, marginRight: 10,
    fontVariantNumeric: "tabular-nums" },
  inState: { fontSize: 11, fontWeight: 700, letterSpacing: 0.6 },

  testReadout: { display: "flex", alignItems: "center", justifyContent: "center",
    gap: 14, margin: "14px 0 4px", padding: "12px 0",
    background: "rgba(0,0,0,.18)", borderRadius: 12 },
  testCell: { textAlign: "center", minWidth: 80 },
  testLabel: { fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, color: MUTE,
    marginBottom: 3 },
  testValue: { fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums",
    lineHeight: 1 },
  testArrow: { fontSize: 20, color: MUTE },

  wBlock: { padding: "10px 0" },
  wTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline",
    marginBottom: 9 },
  wName: { fontSize: 13, color: TEXT, fontWeight: 500 },
  wVal: { fontSize: 15, fontWeight: 700, fontVariantNumeric: "tabular-nums" },

  sliderWrap: { width: "100%" },
  sliderEnds: { display: "flex", justifyContent: "space-between", fontSize: 10.5,
    fontWeight: 600, marginBottom: 6, letterSpacing: 0.2 },
  sliderTrackWrap: { position: "relative", height: 22 },
  sliderGrad: { position: "absolute", top: 8, left: 0, right: 0, height: 6,
    borderRadius: 99,
    background: `linear-gradient(90deg, ${NEG}, #4d52a0 50%, ${POS})` },
  sliderThumb: { position: "absolute", top: 1, width: 20, height: 20,
    borderRadius: "50%", background: "#fff", transform: "translateX(-50%)",
    boxShadow: "0 2px 10px rgba(0,0,0,.45)", pointerEvents: "none",
    transition: "left .12s ease", border: `3px solid ${BG}` },
  sliderInput: { position: "absolute", top: 0, left: 0, width: "100%",
    height: 22, margin: 0, opacity: 0, cursor: "pointer" },

  deckNote: { fontSize: 12, color: MUTE, lineHeight: 1.6,
    margin: "10px 0 0", fontWeight: 400 },

  actNote: { marginTop: 14, borderRadius: 12, padding: "13px 15px",
    fontSize: 12.5, lineHeight: 1.6, color: TEXT, fontWeight: 400,
    background: "rgba(251,191,36,.07)",
    border: "1px solid rgba(251,191,36,.22)" },
  actTag: { display: "block", fontSize: 10, fontWeight: 700, letterSpacing: 1.4,
    color: GOLD, marginBottom: 7 },

  cbHead: { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, color: MUTE,
    margin: "4px 0 10px" },
  cbWrap: { display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 },
  cbRow: { display: "flex", alignItems: "center", gap: 9 },
  cbLabel: { flex: "0 0 92px", fontSize: 11.5, color: TEXT, fontWeight: 500,
    textAlign: "right", whiteSpace: "nowrap", overflow: "hidden",
    textOverflow: "ellipsis" },
  cbTrack: { position: "relative", flex: 1, height: 19,
    background: "rgba(255,255,255,.05)", borderRadius: 5 },
  cbAxis: { position: "absolute", left: "50%", top: 1, bottom: 1, width: 1.5,
    background: "rgba(255,255,255,.25)", transform: "translateX(-50%)" },
  cbVal: { flex: "0 0 30px", fontSize: 12.5, fontWeight: 700, textAlign: "left",
    fontVariantNumeric: "tabular-nums" },

  sumTotal: { display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 14px", marginBottom: 4, borderRadius: 11,
    background: "rgba(0,0,0,.2)", border: "1px solid rgba(255,255,255,.08)" },
  sumTotalLabel: { fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: MUTE },
  sumTotalVal: { fontSize: 26, fontWeight: 700, fontVariantNumeric: "tabular-nums",
    lineHeight: 1 },

  gaugeTrack: { position: "relative", height: 18, borderRadius: 99,
    background: "rgba(255,255,255,.08)", overflow: "hidden", marginTop: 6 },
  gaugeFill: { position: "absolute", top: 0, left: 0, height: "100%",
    borderRadius: 99, transition: "width .4s ease, background .3s ease" },
  gaugeMid: { position: "absolute", top: -3, left: "50%", width: 2.5,
    height: 24, background: "#fff", transform: "translateX(-50%)" },
  gaugeLabels: { display: "flex", justifyContent: "space-between",
    fontSize: 10.5, color: MUTE, marginTop: 6, fontWeight: 500 },
  verdict: { marginTop: 14, borderRadius: 11, padding: "12px 14px",
    fontSize: 12.5, fontWeight: 600, textAlign: "center",
    border: "1px solid", lineHeight: 1.5 },

  navRow: { display: "flex", justifyContent: "space-between", gap: 10,
    marginTop: 18 },
  ghostBtn: { background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.15)", color: TEXT,
    borderRadius: 11, padding: "11px 20px", fontSize: 13, fontWeight: 600,
    cursor: "pointer", fontFamily: FONT },
  nextBtn: { background: GOLD, border: "none", color: INK, borderRadius: 11,
    padding: "11px 22px", fontSize: 13, fontWeight: 700, cursor: "pointer",
    fontFamily: FONT, boxShadow: "0 4px 18px rgba(251,191,36,.22)" },

  reflect: { marginTop: 16, background: BG2,
    border: "1px solid rgba(255,255,255,.09)", borderRadius: 16, padding: 20,
    boxShadow: "0 12px 40px rgba(10,9,30,.45)" },
  reflectText: { fontSize: 13.5, lineHeight: 1.7, color: TEXT,
    margin: 0, fontWeight: 400 },
};
