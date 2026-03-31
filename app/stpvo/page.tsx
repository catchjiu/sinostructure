import STPVOBuilder from '@/components/STPVOBuilder';

export default function STPVOPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">STPVO Challenge</h1>
        <p className="text-slate-500 text-sm mt-1">
          Arrange the word tiles in the correct Subject · Time · Place · Verb · Object order
        </p>
      </div>
      <STPVOBuilder />
    </div>
  );
}
