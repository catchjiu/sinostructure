'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCenter, useSensor, useSensors, PointerSensor, TouchSensor } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Volume2, RefreshCw, ChevronRight, Sparkles, X } from 'lucide-react';
import { SentenceTemplate, SentenceComponent, GrammarRole } from '@/types';
import { ROLE_LABELS, SENTENCE_TEMPLATES } from '@/constants/vocab';
import { speakChinese } from '@/lib/audio';
import { useAppStore } from '@/store/useAppStore';
import WordTile from './WordTile';

// ─── Sortable Tile Wrapper ────────────────────────────────────────────────
function SortableTile({ component, isCorrect }: { component: SentenceComponent; isCorrect: boolean | null }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: component.word.id });
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 50 : 'auto', opacity: isDragging ? 0.3 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none">
      <WordTile
        traditional={component.word.traditional}
        pinyin={component.word.pinyin}
        role={component.role}
        isCorrect={isCorrect}
        isDragging={isDragging}
        size="lg"
      />
    </div>
  );
}

// ─── Slot Drop Zone ───────────────────────────────────────────────────────
function SlotZone({
  role,
  filled,
  isCorrect,
}: {
  role: GrammarRole;
  filled?: SentenceComponent;
  isCorrect?: boolean | null;
}) {
  if (!filled) {
    return <WordTile traditional="" role={role} isPlaceholder size="lg" />;
  }
  return (
    <WordTile
      traditional={filled.word.traditional}
      pinyin={filled.word.pinyin}
      role={role}
      showRole
      isCorrect={isCorrect ?? null}
      size="lg"
    />
  );
}

// ─── Role Badge ───────────────────────────────────────────────────────────
const BADGE_COLORS: Record<GrammarRole, string> = {
  S: 'bg-violet-500/10 text-violet-700 ring-violet-200',
  T: 'bg-amber-500/10 text-amber-700 ring-amber-200',
  P: 'bg-sky-500/10 text-sky-700 ring-sky-200',
  V: 'bg-emerald-500/10 text-emerald-700 ring-emerald-200',
  O: 'bg-rose-500/10 text-rose-700 ring-rose-200',
};

function RoleBadge({ role }: { role: GrammarRole }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ring-1 ${BADGE_COLORS[role]}`}>
      {role} · {ROLE_LABELS[role]?.split(' ')[0]}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function STPVOBuilder() {
  const { recordCorrect, recordIncorrect, getWeakWords } = useAppStore();
  const [templateIndex, setTemplateIndex] = useState(0);
  const [shuffled, setShuffled] = useState<SentenceComponent[]>([]);
  const [slots, setSlots] = useState<(SentenceComponent | null)[]>(Array(5).fill(null));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [slotFeedback, setSlotFeedback] = useState<(boolean | null)[]>(Array(5).fill(null));
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const ORDER: GrammarRole[] = ['S', 'T', 'P', 'V', 'O'];

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const loadTemplate = useCallback((idx: number) => {
    const template = SENTENCE_TEMPLATES[idx % SENTENCE_TEMPLATES.length];
    const components = [...template.components];
    // Shuffle
    for (let i = components.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [components[i], components[j]] = [components[j], components[i]];
    }
    setShuffled(components);
    setSlots(Array(5).fill(null));
    setFeedback('idle');
    setSlotFeedback(Array(5).fill(null));
    setAttempts(0);
  }, []);

  useEffect(() => { loadTemplate(templateIndex); }, [templateIndex, loadTemplate]);

  const handleDragStart = (event: DragStartEvent) => setActiveId(String(event.active.id));
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const fromShuffledIdx = shuffled.findIndex(c => c.word.id === active.id);
    const toShuffledIdx = shuffled.findIndex(c => c.word.id === over.id);

    if (fromShuffledIdx !== -1 && toShuffledIdx !== -1) {
      setShuffled(prev => arrayMove(prev, fromShuffledIdx, toShuffledIdx));
    }
  };

  const handleTileClick = (component: SentenceComponent) => {
    if (feedback !== 'idle') return;
    const firstEmpty = slots.findIndex(s => s === null);
    if (firstEmpty === -1) return;
    const newSlots = [...slots];
    newSlots[firstEmpty] = component;
    setSlots(newSlots);
    setShuffled(prev => prev.filter(c => c.word.id !== component.word.id));
  };

  const handleSlotClick = (slotIdx: number) => {
    if (feedback !== 'idle') return;
    const component = slots[slotIdx];
    if (!component) return;
    const newSlots = [...slots];
    newSlots[slotIdx] = null;
    setSlots(newSlots);
    setShuffled(prev => [...prev, component]);
  };

  const checkAnswer = () => {
    const template = SENTENCE_TEMPLATES[templateIndex % SENTENCE_TEMPLATES.length];
    const correct = template.components;
    const newSlotFeedback: (boolean | null)[] = slots.map((slot, i) => {
      if (!slot) return false;
      return slot.word.id === correct[i]?.word.id;
    });
    setSlotFeedback(newSlotFeedback);
    const allCorrect = newSlotFeedback.every(f => f === true) && slots.every(s => s !== null);
    setFeedback(allCorrect ? 'correct' : 'incorrect');
    setAttempts(a => a + 1);

    if (allCorrect) {
      template.components.forEach(c => recordCorrect(c.word.id));
      setIsSpeaking(true);
      speakChinese(template.audioText, () => setIsSpeaking(false));
    } else {
      slots.forEach((slot, i) => {
        if (slot && !newSlotFeedback[i]) recordIncorrect(slot.word.id);
      });
    }
  };

  const nextSentence = () => {
    setTemplateIndex(i => (i + 1) % SENTENCE_TEMPLATES.length);
  };

  const currentTemplate = SENTENCE_TEMPLATES[templateIndex % SENTENCE_TEMPLATES.length];
  const activeComponent = shuffled.find(c => c.word.id === activeId);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Sentence Challenge</h2>
          <p className="text-sm text-slate-500">
            {templateIndex + 1} / {SENTENCE_TEMPLATES.length} · Arrange tiles in STPVO order
          </p>
        </div>
        <button
          onClick={() => loadTemplate(templateIndex)}
          className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* STPVO Legend */}
      <div className="flex flex-wrap gap-2">
        {(ORDER as GrammarRole[]).map(role => (
          <RoleBadge key={role} role={role} />
        ))}
      </div>

      {/* Target Slots */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Build the sentence</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {ORDER.map((role, i) => (
            <div key={role} className="flex flex-col items-center gap-2">
              <div
                onClick={() => handleSlotClick(i)}
                className={slots[i] ? 'cursor-pointer' : 'cursor-default'}
              >
                <SlotZone
                  role={role}
                  filled={slots[i] ?? undefined}
                  isCorrect={slotFeedback[i]}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{role}</span>
            </div>
          ))}
        </div>

        {/* Feedback banner */}
        <AnimatePresence>
          {feedback !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className={`mt-5 rounded-xl p-4 flex items-center justify-between ${
                feedback === 'correct'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-rose-50 border border-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {feedback === 'correct' ? (
                  <>
                    <Sparkles className="w-5 h-5 text-emerald-500 shrink-0" />
                    <div className="space-y-0.5">
                      <p className="font-semibold text-emerald-800 text-sm">完美！ Perfect!</p>
                      <p className="text-emerald-700 text-sm" style={{ fontFamily: "'Noto Sans TC', sans-serif" }}>
                        {currentTemplate.audioText}
                      </p>
                      <p className="text-emerald-600 text-xs italic">{currentTemplate.englishTranslation}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5 text-rose-500" />
                    <div>
                      <p className="font-semibold text-rose-800 text-sm">Not quite — try again!</p>
                      <p className="text-rose-600 text-xs mt-0.5">Tap a slot to remove and try again.</p>
                    </div>
                  </>
                )}
              </div>
              {feedback === 'correct' && (
                <button
                  onClick={() => {
                    setIsSpeaking(true);
                    speakChinese(currentTemplate.audioText, () => setIsSpeaking(false));
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    isSpeaking ? 'bg-emerald-200 text-emerald-800' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                  }`}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Word Bank */}
      {shuffled.length > 0 && (
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mb-4">Word bank — tap to place</p>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={shuffled.map(c => c.word.id)} strategy={horizontalListSortingStrategy}>
              <div className="flex flex-wrap gap-3 justify-center">
                {shuffled.map((component) => (
                  <div key={component.word.id} onClick={() => handleTileClick(component)} className="cursor-pointer">
                    <SortableTile component={component} isCorrect={null} />
                  </div>
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeComponent && (
                <WordTile
                  traditional={activeComponent.word.traditional}
                  pinyin={activeComponent.word.pinyin}
                  role={activeComponent.role}
                  isDragging
                  size="lg"
                />
              )}
            </DragOverlay>
          </DndContext>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 justify-center">
        {feedback === 'idle' ? (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={checkAnswer}
            disabled={slots.some(s => s === null)}
            className="px-8 py-3 bg-slate-800 text-white rounded-xl font-medium text-sm shadow-sm
              disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700 transition-colors"
          >
            Check Answer
          </motion.button>
        ) : (
          <>
            {feedback === 'incorrect' && (
              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setFeedback('idle');
                  setSlotFeedback(Array(5).fill(null));
                  const wrongSlots = slots.map((s, i) => slotFeedback[i] === false ? s : null);
                  const newSlots = [...slots];
                  wrongSlots.forEach((comp, i) => {
                    if (comp) {
                      newSlots[i] = null;
                      setShuffled(prev => [...prev, comp]);
                    }
                  });
                  setSlots(newSlots);
                  setShuffled(prev => {
                    const toReturn = slots.filter((s, i) => s && slotFeedback[i] === false) as SentenceComponent[];
                    const newSlotsFixed = slots.map((s, i) => slotFeedback[i] === false ? null : s);
                    setSlots(newSlotsFixed);
                    return [...prev.filter(c => !toReturn.find(t => t.word.id === c.word.id)), ...toReturn];
                  });
                }}
                className="px-6 py-3 bg-rose-600 text-white rounded-xl font-medium text-sm hover:bg-rose-700 transition-colors"
              >
                Try Again
              </motion.button>
            )}
            <motion.button
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={nextSentence}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium text-sm flex items-center gap-2
                hover:bg-emerald-700 transition-colors shadow-sm"
            >
              Next Sentence <ChevronRight className="w-4 h-4" />
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
