import { useRef, useState } from 'react';
import { useStore, BrainstormNote } from '../store/useStore';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';

export function BrainstormView() {
  const { brainstormNotes, addBrainstormNote, updateBrainstormNotePosition, deleteBrainstormNote } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleAddNote = () => {
    addBrainstormNote({
      id: Math.random().toString(36).substr(2, 9),
      content: 'New Idea...',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      color: ['bg-yellow-100', 'bg-blue-100', 'bg-green-100', 'bg-pink-100'][Math.floor(Math.random() * 4)]
    });
  };

  return (
    <div className="h-full flex flex-col relative bg-slate-50 overflow-hidden">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
         <div className="bg-white/90 backdrop-blur shadow-sm border border-slate-200 p-2 rounded-lg">
           <h1 className="text-sm font-bold text-slate-900">Brainstorm Space</h1>
           <p className="text-xs text-slate-500">Drag to move. Double click to edit.</p>
         </div>
         <button 
           onClick={handleAddNote}
           className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg shadow-sm transition-colors"
         >
           <Plus className="h-5 w-5" />
         </button>
      </div>

      <div 
        ref={containerRef} 
        className="flex-1 w-full h-full relative"
        style={{ 
          backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', 
          backgroundSize: '20px 20px' 
        }}
      >
        {brainstormNotes.map((note) => (
          <Note 
            key={note.id} 
            note={note} 
            containerRef={containerRef}
            onDelete={() => deleteBrainstormNote(note.id)}
            onMove={(x, y) => updateBrainstormNotePosition(note.id, x, y)}
          />
        ))}
      </div>
    </div>
  );
}

function Note({ note, containerRef, onDelete, onMove }: { 
  note: BrainstormNote; 
  containerRef: React.RefObject<HTMLDivElement | null>;
  onDelete: () => void;
  onMove: (x: number, y: number) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(note.content);

  return (
    <motion.div
      drag
      dragConstraints={containerRef}
      dragMomentum={false}
      initial={{ x: note.x, y: note.y, scale: 0.8, opacity: 0 }}
      animate={{ x: note.x, y: note.y, scale: 1, opacity: 1 }}
      onDragEnd={(_, info) => {
         // Use the onMove prop to avoid the unused variable error
         onMove(info.point.x, info.point.y); 
      }}
      className={`absolute w-64 p-4 rounded-xl shadow-md border border-black/5 ${note.color} cursor-grab active:cursor-grabbing group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="w-2 h-2 rounded-full bg-black/10" />
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-500 transition-opacity"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {isEditing ? (
        <textarea
          autoFocus
          className="w-full h-32 bg-transparent resize-none outline-none text-slate-800 font-medium"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => setIsEditing(false)}
          onKeyDown={(e) => { if(e.key === 'Enter' && !e.shiftKey) setIsEditing(false); }}
        />
      ) : (
        <div 
          onDoubleClick={() => setIsEditing(true)}
          className="min-h-[8rem] text-slate-800 font-medium whitespace-pre-wrap"
        >
          {text}
        </div>
      )}
    </motion.div>
  );
}
