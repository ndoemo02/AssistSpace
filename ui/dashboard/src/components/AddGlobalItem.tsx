
import { useState } from 'react';
import { X, Link, StickyNote, Sparkles, Plus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AddGlobalItemProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (item: any) => void;
}

export const AddGlobalItem = ({ isOpen, onClose, onAdd }: AddGlobalItemProps) => {
    const [type, setType] = useState<'link' | 'note' | 'prompt'>('link');
    const [content, setContent] = useState('');
    const [title, setTitle] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!content.trim()) return;
        setIsSubmitting(true);

        const newItem = {
            title: title || (type === 'note' ? 'New Note' : type === 'prompt' ? 'New Prompt' : 'New Link'),
            url: type === 'link' ? content : '',
            summary_points: type === 'note' || type === 'prompt' ? [content] : [],
            source_platform: type === 'link' ? 'manual_link' : type,
            status: 'inbox',
            published_at: new Date().toISOString(),
            author_or_channel: 'User',
            category: 'Manual',
            id: crypto.randomUUID(), // Optimistic ID
        };

        try {
            const { error } = await supabase.from('news_items').insert([newItem]);
            if (error) throw error;
            onAdd(newItem);
            onClose();
            setContent('');
            setTitle('');
        } catch (e) {
            console.error('Error adding item:', e);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div
                className="w-full max-w-lg bg-zinc-900/90 rounded-3xl border border-zinc-800 p-6 shadow-2xl relative overflow-hidden group"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-purple-500/5 pointer-events-none" />

                <div className="flex justify-between items-center mb-6 relative">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="text-emerald-500" /> Dodaj Element
                    </h3>
                    <button onClick={onClose} className="hover:bg-zinc-800 p-2 rounded-full transition-colors relative z-10">
                        <X size={20} className="text-zinc-500 hover:text-white" />
                    </button>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-black/50 rounded-xl relative z-10">
                    {[
                        { id: 'link', icon: Link, label: 'Link' },
                        { id: 'note', icon: StickyNote, label: 'Notatka' },
                        { id: 'prompt', icon: Sparkles, label: 'Prompt' }
                    ].map(t => (
                        <button
                            key={t.id}
                            onClick={() => setType(t.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${type === t.id
                                ? 'bg-zinc-800 text-white shadow-lg'
                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
                                }`}
                        >
                            <t.icon size={16} className={type === t.id ? 'text-emerald-500' : ''} />
                            {t.label}
                        </button>
                    ))}
                </div>

                <div className="space-y-4 relative z-10">
                    <input
                        type="text"
                        placeholder="Tytuł (opcjonalne)"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/50 border border-zinc-800/50 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                    />

                    {type === 'link' ? (
                        <input
                            type="text"
                            placeholder="Wklej URL tutaj..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full bg-black/50 border border-zinc-800/50 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors"
                            autoFocus
                        />
                    ) : (
                        <textarea
                            placeholder={type === 'prompt' ? "Wpisz swój prompt..." : "Treść notatki..."}
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            className="w-full h-32 bg-black/50 border border-zinc-800/50 rounded-xl p-3 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                            autoFocus
                        />
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !content.trim()}
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-900/20"
                    >
                        {isSubmitting ? 'Zapisywanie...' : 'Dodaj do Tablicy'}
                    </button>
                </div>
            </div>
        </div>
    );
};
