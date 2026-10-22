import { requirementRefs, validateDesign, type EvaluationInput, type QuestionDetailDTO, type UserDTO, type ValidationResult } from '@arch-arena/shared';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import { WifiOff } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { OfflineBanner } from '@/app/AppLayout';
import { LanguageToggle } from '@/components/LanguageToggle';
import { ButtonLink } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Drawer } from '@/components/ui/Drawer';
import { EmptyState } from '@/components/ui/misc';
import { PageSpinner } from '@/components/ui/Spinner';
import { errorMessage, isNetworkError } from '@/lib/api';
import { cn } from '@/lib/cn';
import { useOnlineStatus } from '@/lib/pwa';
import { useEvaluate, useMe, useQuestion } from '@/lib/queries';
import { useIsDark } from '@/stores/preferences';
import { toast } from '@/stores/toast';
import { HintsPanel } from '../question/HintsPanel';
import { Canvas } from './Canvas';
import { ComponentLibrary } from './ComponentLibrary';
import { ConflictDialog, ShortcutsDialog, SignInDialog } from './Dialogs';
import { FinalSubmitDialog } from './FinalSubmitDialog';
import { NODE_SIZE } from './model';
import { PropertiesPanel } from './PropertiesPanel';
import { useEditor, type Highlight } from './store';
import { Toolbar } from './Toolbar';
import { useDraftPersistence } from './useDraftPersistence';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { ValidationPanel } from './ValidationPanel';
import { Walkthrough } from './Walkthrough';

function useCoarsePointer(): boolean {
  const [coarse] = useState(() => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches);
  return coarse;
}

function Playground({ question, user, userLoading }: { question: QuestionDetailDTO; user: UserDTO | null | undefined; userLoading: boolean }) {
  const persistence = useDraftPersistence(question, user, userLoading);
  const input: EvaluationInput = useMemo(
    () => ({
      questionId: question.id,
      difficulty: question.difficulty,
      rubricVersion: question.rubricVersion,
      rubric: question.rubric,
      requirements: requirementRefs(question),
    }),
    [question],
  );
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [propsOpen, setPropsOpen] = useState(false);
  const [hintsOpen, setHintsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [signIn, setSignIn] = useState<string | null>(null);
  const [finalOpen, setFinalOpen] = useState(false);
  const evaluate = useEvaluate();
  const online = useOnlineStatus();
  const navigate = useNavigate();
  const dark = useIsDark();
  const coarse = useCoarsePointer();
  const rf = useReactFlow();
  const canvasRef = useRef<HTMLDivElement>(null);
  const addComponent = useEditor((s) => s.addComponent);
  const addNote = useEditor((s) => s.addNote);
  const hasSelection = useEditor((s) => s.nodes.some((n) => n.selected) || s.edges.some((e) => e.selected));

  useEffect(() => {
    document.body.dataset.activeQuestion = question.id;
    return () => {
      delete document.body.dataset.activeQuestion;
    };
  }, [question.id]);

  useEffect(() => {
    if (!persistence.loaded) return;
    const t = setTimeout(() => void rf.fitView({ padding: 0.3, maxZoom: 1.1 }), 60);
    return () => clearTimeout(t);
  }, [persistence.loaded, rf]);

  const runValidation = useCallback(
    (mark: boolean) => {
      const r = validateDesign(useEditor.getState().snapshot(), input);
      setValidation(r);
      setShowValidation(true);
      const h: Record<string, Highlight> = {};
      for (const issue of r.issues) {
        if (issue.severity === 'info') continue;
        for (const id of [...issue.nodeIds, ...issue.edgeIds]) {
          if (h[id] !== 'error') h[id] = issue.severity === 'error' ? 'error' : 'warning';
        }
      }
      useEditor.getState().setHighlights(h);
      if (mark) useEditor.getState().markAction('validate');
    },
    [input],
  );

  // Keep validation results live while the panel is open.
  useEffect(() => {
    if (!showValidation) return;
    return useEditor.subscribe((s, prev) => {
      if (s.version !== prev.version) runValidation(false);
    });
  }, [showValidation, runValidation]);

  const closeValidation = () => {
    setShowValidation(false);
    useEditor.getState().setHighlights({});
  };

  const onEvaluate = async () => {
    if (!user) return setSignIn('evaluate your design');
    if (!online) {
      toast.warning('Evaluation needs a connection', 'Your draft is saved on this device. Evaluate again when you are back online.');
      return;
    }
    await persistence.flush();
    try {
      const attempt = await evaluate.mutateAsync({ questionId: question.id, diagram: useEditor.getState().snapshot() });
      navigate(`/challenges/${question.slug}/attempts/${attempt.id}`);
    } catch (err) {
      if (isNetworkError(err)) toast.warning('You appear to be offline', 'Nothing was evaluated. Try again when you are back online.');
      else toast.error('Evaluation failed', errorMessage(err));
    }
  };

  const onFinalSubmit = () => {
    if (!user) return setSignIn('make a final submission');
    if (!online) {
      toast.warning('Final submission needs a connection', 'Your draft is saved on this device.');
      return;
    }
    setFinalOpen(true);
  };

  const centerPosition = () => {
    const rect = canvasRef.current?.getBoundingClientRect();
    const p = rect ? rf.screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }) : { x: 200, y: 200 };
    const jitter = () => Math.round((Math.random() - 0.5) * 80);
    return { x: p.x - NODE_SIZE.component.width / 2 + jitter(), y: p.y - NODE_SIZE.component.height / 2 + jitter() };
  };

  const onAdd = (type: string) => {
    addComponent(type, centerPosition());
    setLibraryOpen(false);
  };

  useKeyboardShortcuts({
    onSave: useCallback(() => void persistence.flush().then(() => toast.success('Saved')), [persistence]),
    onHelp: useCallback(() => setShortcutsOpen(true), []),
  });

  const library = <ComponentLibrary suggested={question.suggestedCategories} onAdd={onAdd} />;
  const properties = <PropertiesPanel question={question} validation={validation} />;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-slate-50 dark:bg-slate-950">
      <Toolbar
        question={question}
        status={persistence.status}
        lastSavedAt={persistence.lastSavedAt}
        onValidate={() => runValidation(true)}
        onEvaluate={() => void onEvaluate()}
        onFinalSubmit={onFinalSubmit}
        onHints={() => setHintsOpen(true)}
        onShortcuts={() => setShortcutsOpen(true)}
        onAddNote={() => addNote(centerPosition())}
        onToggleLibrary={() => setLibraryOpen((o) => !o)}
        onToggleProperties={() => setPropsOpen((o) => !o)}
        evaluating={evaluate.isPending}
        hasSelection={hasSelection}
      />
      <OfflineBanner />
      <div className="relative flex min-h-0 flex-1">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 lg:block" aria-label="Component library">
          {library}
        </aside>
        <Drawer open={libraryOpen} onClose={() => setLibraryOpen(false)} side="left" label="Component library">
          {library}
        </Drawer>
        <div ref={canvasRef} className={cn('relative min-w-0 flex-1', coarse && 'touch-handles')}>
          {persistence.loaded ? <Canvas dark={dark} onNodeDoubleClick={() => setPropsOpen(true)} /> : <PageSpinner label="Loading your draft…" />}
          {showValidation && validation && <ValidationPanel result={validation} onClose={closeValidation} />}
          {persistence.loaded && <Walkthrough initialComponents={question.starter.length} />}
        </div>
        <aside className="hidden w-80 shrink-0 border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 xl:block" aria-label="Properties">
          {properties}
        </aside>
        <Drawer open={propsOpen} onClose={() => setPropsOpen(false)} side="right" label="Properties">
          {properties}
        </Drawer>
      </div>

      <Dialog open={hintsOpen} onClose={() => setHintsOpen(false)} title="Hints" size="md">
        <div className="mb-3">
          <LanguageToggle size="xs" />
        </div>
        <HintsPanel question={question} />
      </Dialog>
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <SignInDialog open={!!signIn} onClose={() => setSignIn(null)} action={signIn ?? ''} />
      {user && <FinalSubmitDialog open={finalOpen} onClose={() => setFinalOpen(false)} question={question} input={input} flush={persistence.flush} />}
      <ConflictDialog conflict={persistence.conflict} onResolve={(c) => void persistence.resolveConflict(c)} />
    </div>
  );
}

export default function PlaygroundPage() {
  const { slug } = useParams();
  const { data: question, isLoading, error } = useQuestion(slug);
  const { data: user, isLoading: userLoading } = useMe();
  if (isLoading) return <PageSpinner label="Loading challenge…" />;
  if (!question) {
    return (
      <div className="mx-auto max-w-lg p-6 pt-20">
        <EmptyState
          icon={<WifiOff className="h-8 w-8" />}
          title={isNetworkError(error) ? 'This challenge is not available offline yet' : 'Challenge not found'}
          description={isNetworkError(error) ? 'Open it once while online and it will stay available offline.' : 'It may have been renamed or removed.'}
          action={<ButtonLink to="/challenges">Browse challenges</ButtonLink>}
        />
      </div>
    );
  }
  return (
    <ReactFlowProvider>
      <Playground question={question} user={user} userLoading={userLoading} />
    </ReactFlowProvider>
  );
}
