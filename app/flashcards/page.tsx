import FlashCard from '@/components/FlashCard';

export default function FlashcardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Flashcard Mode</h1>
        <p className="text-slate-500 text-sm mt-1">
          Review Traditional Chinese vocabulary · tap cards to flip
        </p>
      </div>
      <FlashCard />
    </div>
  );
}
