/* global React, ReactDOM, DesignCanvas, DCSection, DCArtboard, PainterDefs, PaperBg,
   CelConfetti, CelStamp, CelMultiply, CelBalloons, CelRainbow, CelPlusOne, CelFireworks,
   ScorePlant, ScoreWorld, PlantStage, WorldStage,
   TransPageFlip, TransCrumple, TransSketch, TransSpring, TransMagnifier,
   ShellGame,
   useAutoplay, useReplay, ReplayBtn, WordCard, speakPraise, ScoreBump
*/

const { useState: mUseState, useEffect: mUseEffect } = React;

/* ---------- Layout tokens — keep the page on a grid ---------- */
const HERO_W = 520;
const HERO_H = 680;

const DETAIL_W = 520;   // score-treatment closeups, matched to hero width
const DETAIL_H = 440;

const FX_W = 280;       // celebration / transition / incorrect cards
const FX_H = 340;

const FX_W_WIDE = 320;  // milestone fireworks needs a touch more room
const FX_H_TALL = 340;

/* ---------- Demo wrappers ---------- */

function AutoCel({ ms = 2800, render }) {
  const [k, setK] = mUseState(0);
  mUseEffect(() => {
    const id = setInterval(() => setK((x) => x + 1), ms);
    return () => clearInterval(id);
  }, [ms]);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {render(k)}
      <div className="replay-row">
        <button className="tinybtn accent" onClick={() => setK((x) => x + 1)}>↻ Replay</button>
      </div>
    </div>
  );
}

function InteractiveScore({ children, initial = 0, max = 30 }) {
  const [s, setS] = mUseState(initial);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {React.cloneElement(children, { score: s })}
      <div className="replay-row">
        <button className="tinybtn" onClick={() => setS(0)}>Reset</button>
        <button className="tinybtn accent" onClick={() => setS((x) => Math.min(max, x + 1))}>+1 punkt</button>
      </div>
    </div>
  );
}

function Cap({ text, sub }) {
  return (
    <div className="caption">
      <b>{text}</b>{sub ? <span> · {sub}</span> : null}
    </div>
  );
}

function IncorrectNudge() {
  const [k, setK] = mUseState(0);
  mUseEffect(() => {
    const id = setInterval(() => setK((x) => x + 1), 2200);
    return () => clearInterval(id);
  }, []);
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <div key={k} style={{ animation: 'nudge 0.5s ease' }}>
        <WordCard word={{ polish: 'kot', image: '🐱' }} size={140} />
      </div>
      <div style={{
        position: 'absolute', bottom: 30,
        fontFamily: 'var(--f-marker)', color: 'var(--ink-soft)', fontSize: 16,
      }}>
        Hmm… spróbuj jeszcze raz
      </div>
      <div className="replay-row">
        <button className="tinybtn accent" onClick={() => setK((x) => x + 1)}>↻ Replay</button>
      </div>
    </div>
  );
}

function VoiceDemo() {
  return (
    <div style={{ width: '100%', height: '100%', padding: 16, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ fontFamily: 'var(--f-big)', fontSize: 28, color: 'var(--ink)' }}>Brawo!</div>
      <div style={{ fontFamily: 'var(--f-marker)', fontSize: 14, color: 'var(--ink-soft)', textAlign: 'center', maxWidth: 220 }}>
        Stuknij, aby usłyszeć przykładowe pochwały po polsku.
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 240 }}>
        {['Brawo!', 'Super!', 'Świetnie!', 'Tak jest!', 'Wspaniale!', 'Pięknie!'].map((p) => (
          <button key={p} className="tinybtn" onClick={() => speakPraise(p)}>🔊 {p}</button>
        ))}
      </div>
    </div>
  );
}

function ScorePlantWrap(props) { return <ScorePlant {...props} />; }
function ScoreWorldWrap(props) { return <ScoreWorld {...props} />; }

function App() {
  return (
    <React.Fragment>
    <PainterDefs />
    <DesignCanvas
      title="Lang Game — UI Explorations"
      subtitle="Cut-paper pop-up book · Polish learners (3–7). Hero game screen on top, supporting close-ups below, event motifs in uniform rows beneath."
      bg="#E8D7B2"
    >
      {/* ───── 1 · HERO — Final game screen ───── */}
      <DCSection
        id="ui"
        title="1 · Final game screen"
        subtitle="Speech-bubble prompt, paper word card, paper chain progress, plant or paper landscape beneath. Each paper tone in rotation."
      >
        <DCArtboard id="ui-kraft" label="Kraft paper · plant" width={HERO_W} height={HERO_H}>
          <ShellGame tone="kraft" treatment="plant" initialScore={4} />
        </DCArtboard>
        <DCArtboard id="ui-sage" label="Sage paper · world" width={HERO_W} height={HERO_H}>
          <ShellGame tone="sage" treatment="world" initialScore={7} />
        </DCArtboard>
        <DCArtboard id="ui-peach" label="Peach paper · plant" width={HERO_W} height={HERO_H}>
          <ShellGame tone="peach" treatment="plant" initialScore={12} />
        </DCArtboard>
        <DCArtboard id="ui-sky" label="Sky paper · world" width={HERO_W} height={HERO_H}>
          <ShellGame tone="sky" treatment="world" initialScore={18} />
        </DCArtboard>
      </DCSection>

      {/* ───── 2 · Score treatments — close-ups ───── */}
      <DCSection
        id="score"
        title="2 · Score treatments"
        subtitle="The two motifs beneath the word. Plant levels every 5 pts; landscape adds an element each milestone. Tap +1 to drive them."
      >
        <DCArtboard id="sc-plant" label="Plant — grows every 5 pts" width={DETAIL_W} height={DETAIL_H}>
          <PaperBg tone="cream"><InteractiveScore initial={4}><ScorePlantWrap /></InteractiveScore></PaperBg>
        </DCArtboard>
        <DCArtboard id="sc-world" label="Landscape — builds up" width={DETAIL_W} height={DETAIL_H}>
          <PaperBg tone="kraft"><InteractiveScore initial={4}><ScoreWorldWrap /></InteractiveScore></PaperBg>
        </DCArtboard>
      </DCSection>

      {/* ───── 3 · Correct answer — celebrations ───── */}
      <DCSection
        id="cel"
        title="3 · Correct-answer celebrations"
        subtitle="Cycled randomly so the reaction never feels repetitive."
      >
        <DCArtboard id="c-confetti" label="Confetti pop" width={FX_W} height={FX_H}>
          <PaperBg tone="ivory"><Cap text="Confetti pop" sub="emoji bits + Brawo!" />
          <AutoCel render={(k) => <CelConfetti playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="c-stamp" label="Sticker stamp" width={FX_W} height={FX_H}>
          <PaperBg tone="cream"><Cap text="+1 sticker stamp" sub="slams in, dust puffs" />
          <AutoCel render={(k) => <CelStamp playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="c-multiply" label="Emoji multiply" width={FX_W} height={FX_H}>
          <PaperBg tone="peach"><Cap text="Emoji multiplies" sub="copies fly off-screen" />
          <AutoCel render={(k) => <CelMultiply playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="c-balloons" label="Praise balloons" width={FX_W} height={FX_H}>
          <PaperBg tone="rose"><Cap text="Praise balloons" sub="Brawo / Super / Tak float up" />
          <AutoCel render={(k) => <CelBalloons playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="c-rainbow" label="Rainbow sweep" width={FX_W} height={FX_H}>
          <PaperBg tone="sky"><Cap text="Rainbow" sub="arcs draw across; stars sparkle" />
          <AutoCel render={(k) => <CelRainbow playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="c-plusone" label="Drumroll +1" width={FX_W} height={FX_H}>
          <PaperBg tone="buttery"><Cap text="Drumroll +1" sub="three dots → big +1 lands" />
          <AutoCel render={(k) => <CelPlusOne playKey={k} />} /></PaperBg>
        </DCArtboard>
      </DCSection>

      {/* ───── 4 · Milestone — every 5 points ───── */}
      <DCSection
        id="milestone"
        title="4 · Milestone (every 5 pts)"
        subtitle="Bigger payoff at 5, 10, 15… — fireworks plus a spoken Polish praise phrase."
      >
        <DCArtboard id="m-fireworks" label="Milestone fireworks" width={FX_W_WIDE} height={FX_H_TALL}>
          <PaperBg tone="cream"><Cap text="Milestone" sub="fires at 5, 10, 15…" />
          <AutoCel ms={3600} render={(k) => <CelFireworks playKey={k} />} /></PaperBg>
        </DCArtboard>
        <DCArtboard id="m-voice" label="Polish voice praise" width={FX_W_WIDE} height={FX_H_TALL}>
          <PaperBg tone="ivory"><Cap text="Voice praise" sub="varied phrases" />
          <VoiceDemo /></PaperBg>
        </DCArtboard>
      </DCSection>

      {/* ───── 5 · Incorrect — barely noticeable ───── */}
      <DCSection
        id="incorrect"
        title="5 · Incorrect — barely noticeable"
        subtitle="Soft nudge, no shame. Word stays put; a small message offers a retry."
      >
        <DCArtboard id="i-nudge" label="Gentle nudge" width={FX_W} height={FX_H}>
          <PaperBg tone="cream"><Cap text="Nudge + retry" /><IncorrectNudge /></PaperBg>
        </DCArtboard>
      </DCSection>

      {/* ───── 6 · Word-to-word transitions ───── */}
      <DCSection
        id="trans"
        title="6 · Word-to-word transitions"
        subtitle="Cycled randomly between cards so the flow stays fresh."
      >
        <DCArtboard id="t-flip" label="Page flip" width={FX_W} height={FX_H}>
          <PaperBg tone="cream"><Cap text="Page flip" /><TransPageFlip /></PaperBg>
        </DCArtboard>
        <DCArtboard id="t-crumple" label="Crumple toss" width={FX_W} height={FX_H}>
          <PaperBg tone="buttery"><Cap text="Crumple toss" sub="flies in from off-screen" /><TransCrumple /></PaperBg>
        </DCArtboard>
        <DCArtboard id="t-sketch" label="Pencil sketch" width={FX_W} height={FX_H}>
          <PaperBg tone="ivory"><Cap text="Pencil sketches in" /><TransSketch /></PaperBg>
        </DCArtboard>
        <DCArtboard id="t-spring" label="Bouncy drop" width={FX_W} height={FX_H}>
          <PaperBg tone="rose"><Cap text="Springy drop" /><TransSpring /></PaperBg>
        </DCArtboard>
        <DCArtboard id="t-magnifier" label="Magnifier" width={FX_W} height={FX_H}>
          <PaperBg tone="peach"><Cap text="Magnifier zoom" /><TransMagnifier /></PaperBg>
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
