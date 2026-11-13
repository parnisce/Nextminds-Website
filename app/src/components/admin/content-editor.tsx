import { ArrowCounterClockwise, ArrowSquareOut, FloppyDisk, Plus, Trash } from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";

import { type HomeContent, defaultHome } from "@/lib/content";

import { useAdminData } from "./data";
import { Field, PageHead, useToast } from "./ui";

type Tab = "hero" | "about" | "faqs" | "testimonials" | "cta";

const tabs: { id: Tab; label: string; hint: string }[] = [
  { id: "hero", label: "Hero", hint: "The four scrolling chapters at the very top of the homepage." },
  { id: "about", label: "About", hint: "Who is NextMinds: intro text, the four numbers and the four values." },
  { id: "faqs", label: "FAQ", hint: "Questions and answers. Add, remove or edit as many as you like." },
  { id: "testimonials", label: "Testimonials", hint: "Client quotes in the scrolling marquee." },
  { id: "cta", label: "Call to action", hint: "The “Create a new project with us” block near the bottom." },
];

const heroNames = ["AI Development", "Web Digital", "Real Estate", "Media"];

export function ContentEditor() {
  const { loadHome, saveHome } = useAdminData();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("hero");
  const [draft, setDraft] = useState<HomeContent | null>(null);
  const saved = useRef("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    void loadHome().then((home) => {
      if (!alive) return;
      saved.current = JSON.stringify(home);
      setDraft(home);
    });
    return () => {
      alive = false;
    };
  }, [loadHome]);

  if (!draft) return <p className="ad-empty">Loading homepage content…</p>;

  const dirty = JSON.stringify(draft) !== saved.current;
  const set = (patch: Partial<HomeContent>) => setDraft({ ...draft, ...patch });

  const save = async () => {
    setBusy(true);
    try {
      await saveHome(draft);
      saved.current = JSON.stringify(draft);
      toast("Homepage saved. It is live now.");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save.", "err");
    } finally {
      setBusy(false);
    }
  };

  const resetTab = () => {
    if (tab === "hero") set({ hero: defaultHome.hero });
    if (tab === "about") set({ about: defaultHome.about });
    if (tab === "faqs") set({ faqs: defaultHome.faqs });
    if (tab === "testimonials") set({ testimonials: defaultHome.testimonials });
    if (tab === "cta") set({ cta: defaultHome.cta });
    toast("Section reset to the original text. Save to publish it.");
  };

  const move = <T,>(list: T[], from: number, to: number) => {
    const copy = [...list];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item!);
    return copy;
  };

  return (
    <>
      <PageHead
        actions={
          <>
            <a className="ad-btn" href="/" rel="noreferrer" target="_blank">
              <ArrowSquareOut size={18} /> View site
            </a>
            <button className="ad-btn ad-btn--primary" disabled={!dirty || busy} onClick={() => void save()} type="button">
              <FloppyDisk size={18} /> {busy ? "Saving…" : dirty ? "Save changes" : "Saved"}
            </button>
          </>
        }
        sub="Edit the text on your homepage. Changes go live as soon as you save."
        title="Homepage content"
      />

      <div className="ad-tabs" role="tablist">
        {tabs.map((t) => (
          <button aria-selected={tab === t.id} className={tab === t.id ? "is-active" : ""} key={t.id} onClick={() => setTab(t.id)} role="tab" type="button">
            {t.label}
          </button>
        ))}
      </div>

      <div className="ad-card ad-editor">
        <header className="ad-card__head">
          <div>
            <h2>{tabs.find((t) => t.id === tab)?.label}</h2>
            <p>{tabs.find((t) => t.id === tab)?.hint}</p>
          </div>
          <button className="ad-btn ad-btn--ghost" onClick={resetTab} type="button">
            <ArrowCounterClockwise size={16} /> Reset section
          </button>
        </header>

        {tab === "hero" && (
          <div className="ad-stack">
            {draft.hero.map((h, i) => (
              <fieldset className="ad-group" key={i}>
                <legend>
                  Chapter {i + 1} · {heroNames[i]}
                </legend>
                <Field label="Small label above the title">
                  <input onChange={(e) => set({ hero: draft.hero.map((x, j) => (j === i ? { ...x, kicker: e.target.value } : x)) })} value={h.kicker} />
                </Field>
                <Field label="Headline">
                  <input onChange={(e) => set({ hero: draft.hero.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) })} value={h.title} />
                </Field>
                <Field label="Description">
                  <textarea onChange={(e) => set({ hero: draft.hero.map((x, j) => (j === i ? { ...x, body: e.target.value } : x)) })} rows={3} value={h.body} />
                </Field>
              </fieldset>
            ))}
          </div>
        )}

        {tab === "about" && (
          <div className="ad-stack">
            <fieldset className="ad-group">
              <legend>Intro paragraphs</legend>
              {draft.about.intro.map((p, i) => (
                <Field key={i} label={`Paragraph ${i + 1}`}>
                  <textarea
                    onChange={(e) => set({ about: { ...draft.about, intro: draft.about.intro.map((x, j) => (j === i ? e.target.value : x)) } })}
                    rows={4}
                    value={p}
                  />
                </Field>
              ))}
            </fieldset>
            <fieldset className="ad-group">
              <legend>The four numbers</legend>
              <div className="ad-cols">
                {draft.about.stats.map((s, i) => (
                  <div className="ad-mini" key={i}>
                    <Field label="Number">
                      <input
                        onChange={(e) => set({ about: { ...draft.about, stats: draft.about.stats.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) } })}
                        value={s.value}
                      />
                    </Field>
                    <Field hint="Press Enter for a second line" label="Label">
                      <textarea
                        onChange={(e) => set({ about: { ...draft.about, stats: draft.about.stats.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) } })}
                        rows={2}
                        value={s.label}
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </fieldset>
            <fieldset className="ad-group">
              <legend>The four values (scrolling list)</legend>
              {draft.about.values.map((v, i) => (
                <div className="ad-mini" key={i}>
                  <Field label={`Value ${i + 1} title`}>
                    <input
                      onChange={(e) => set({ about: { ...draft.about, values: draft.about.values.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)) } })}
                      value={v.title}
                    />
                  </Field>
                  <Field label="Text">
                    <textarea
                      onChange={(e) => set({ about: { ...draft.about, values: draft.about.values.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)) } })}
                      rows={3}
                      value={v.text}
                    />
                  </Field>
                </div>
              ))}
            </fieldset>
          </div>
        )}

        {tab === "faqs" && (
          <div className="ad-stack">
            {draft.faqs.map((f, i) => (
              <fieldset className="ad-group" key={i}>
                <legend>Question {i + 1}</legend>
                <Field label="Question">
                  <input onChange={(e) => set({ faqs: draft.faqs.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} value={f.q} />
                </Field>
                <Field label="Answer">
                  <textarea onChange={(e) => set({ faqs: draft.faqs.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)) })} rows={3} value={f.a} />
                </Field>
                <div className="ad-row-actions">
                  <button className="ad-btn ad-btn--ghost" disabled={i === 0} onClick={() => set({ faqs: move(draft.faqs, i, i - 1) })} type="button">
                    Move up
                  </button>
                  <button className="ad-btn ad-btn--ghost" disabled={i === draft.faqs.length - 1} onClick={() => set({ faqs: move(draft.faqs, i, i + 1) })} type="button">
                    Move down
                  </button>
                  <button className="ad-btn ad-btn--ghost ad-btn--red" disabled={draft.faqs.length <= 1} onClick={() => set({ faqs: draft.faqs.filter((_, j) => j !== i) })} type="button">
                    <Trash size={16} /> Remove
                  </button>
                </div>
              </fieldset>
            ))}
            <button className="ad-btn" onClick={() => set({ faqs: [...draft.faqs, { q: "", a: "" }] })} type="button">
              <Plus size={16} weight="bold" /> Add a question
            </button>
          </div>
        )}

        {tab === "testimonials" && (
          <div className="ad-stack">
            {draft.testimonials.map((t, i) => (
              <fieldset className="ad-group" key={i}>
                <legend>Testimonial {i + 1}</legend>
                <Field label="Quote">
                  <textarea onChange={(e) => set({ testimonials: draft.testimonials.map((x, j) => (j === i ? { ...x, quote: e.target.value } : x)) })} rows={3} value={t.quote} />
                </Field>
                <div className="ad-cols ad-cols--2">
                  <Field label="Name">
                    <input onChange={(e) => set({ testimonials: draft.testimonials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} value={t.name} />
                  </Field>
                  <Field label="Role">
                    <input onChange={(e) => set({ testimonials: draft.testimonials.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)) })} value={t.role} />
                  </Field>
                </div>
                <div className="ad-row-actions">
                  <button className="ad-btn ad-btn--ghost ad-btn--red" disabled={draft.testimonials.length <= 1} onClick={() => set({ testimonials: draft.testimonials.filter((_, j) => j !== i) })} type="button">
                    <Trash size={16} /> Remove
                  </button>
                </div>
              </fieldset>
            ))}
            <button className="ad-btn" onClick={() => set({ testimonials: [...draft.testimonials, { quote: "", name: "", role: "" }] })} type="button">
              <Plus size={16} weight="bold" /> Add a testimonial
            </button>
          </div>
        )}

        {tab === "cta" && (
          <div className="ad-stack">
            <Field label="Badge text">
              <input onChange={(e) => set({ cta: { ...draft.cta, badge: e.target.value } })} value={draft.cta.badge} />
            </Field>
            <div className="ad-cols ad-cols--2">
              <Field label="Headline">
                <input onChange={(e) => set({ cta: { ...draft.cta, title: e.target.value } })} value={draft.cta.title} />
              </Field>
              <Field hint="Shown in the accent colour" label="Highlighted words">
                <input onChange={(e) => set({ cta: { ...draft.cta, accent: e.target.value } })} value={draft.cta.accent} />
              </Field>
            </div>
            <Field label="Description">
              <textarea onChange={(e) => set({ cta: { ...draft.cta, lede: e.target.value } })} rows={3} value={draft.cta.lede} />
            </Field>
          </div>
        )}
      </div>

      {dirty ? (
        <div className="ad-savebar" role="status">
          <span>You have unsaved changes</span>
          <button className="ad-btn ad-btn--primary" disabled={busy} onClick={() => void save()} type="button">
            <FloppyDisk size={18} /> {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      ) : null}
    </>
  );
}
