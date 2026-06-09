export default function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1.5 items-center">
        <div className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-brand-400 typing-dot" />
      </div>
      <span className="text-slate-500 text-xs ml-2 font-body">AI is thinking...</span>
    </div>
  );
}
