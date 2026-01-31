
import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Youtube, MessageSquare, ExternalLink, ChevronUp, BrainCircuit,
    StickyNote, Sparkles, Link, Edit2, Check, X
} from 'lucide-react';
import ReactPlayer from 'react-player';
import { supabase } from '../lib/supabase';

export const NewsCard = ({ item, onClickExpand, isExpanded, onUpdate }: any) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: item.id,
        data: { type: 'news', item }
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : undefined,
    } : undefined;

    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(item.title);
    const [editSummary, setEditSummary] = useState(item.summary_points?.join('\n') || '');

    const handleSave = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsEditing(false);
        if (editTitle !== item.title || editSummary !== (item.summary_points?.join('\n') || '')) {
            const newSummary = editSummary.split('\n').filter(Boolean);
            const { error } = await supabase
                .from('news_items')
                .update({ title: editTitle, summary_points: newSummary })
                .eq('id', item.id);

            if (!error && onUpdate) {
                onUpdate({ ...item, title: editTitle, summary_points: newSummary });
            }
        }
    };

    const getIcon = () => {
        switch (item.source_platform) {
            case 'youtube': return <Youtube size={14} className="text-red-500" />;
            case 'reddit': return <MessageSquare size={14} className="text-orange-500" />;
            case 'note': return <StickyNote size={14} className="text-yellow-500" />;
            case 'prompt': return <Sparkles size={14} className="text-purple-500" />;
            default: return <Link size={14} className="text-blue-500" />;
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`
                group relative mb-3 rounded-2xl border transition-all duration-300
                ${isDragging ? 'opacity-50 scale-105 shadow-2xl rotate-2' : 'hover:-translate-y-1 hover:shadow-xl'}
                ${item.source_platform === 'note' ? 'bg-yellow-500/10 border-yellow-500/20' :
                    item.source_platform === 'prompt' ? 'bg-purple-500/10 border-purple-500/20' :
                        'bg-zinc-900 border-zinc-800'}
            `}
        >
            <div className="p-4 flex flex-col gap-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                        <div className={`
                            p-1.5 rounded-lg 
                            ${item.source_platform === 'note' ? 'bg-yellow-500/20' :
                                item.source_platform === 'prompt' ? 'bg-purple-500/20' : 'bg-black'}
                        `}>
                            {getIcon()}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider truncate">
                            {item.source_platform}
                        </span>
                    </div>
                    {isEditing ? (
                        <div className="flex gap-1">
                            <button onClick={handleSave} className="p-1 hover:bg-emerald-500/20 rounded text-emerald-500"><Check size={14} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setIsEditing(false); }} className="p-1 hover:bg-red-500/20 rounded text-red-500"><X size={14} /></button>
                        </div>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white"
                        >
                            <Edit2 size={12} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {isEditing ? (
                        <input
                            value={editTitle}
                            onChange={e => setEditTitle(e.target.value)}
                            className="bg-black/50 border border-zinc-700 rounded p-1 text-sm font-bold text-white w-full focus:outline-none focus:border-emerald-500"
                            autoFocus
                            onPointerDown={e => e.stopPropagation()} // Stop drag
                        />
                    ) : (
                        <h4 className="text-sm font-bold text-zinc-200 leading-snug line-clamp-3 group-hover:text-emerald-400 transition-colors">
                            {item.title}
                        </h4>
                    )}

                    <div className="flex items-center gap-2 mt-1">
                        <span className={`
                            text-[10px] uppercase font-bold px-1.5 py-0.5 rounded truncate max-w-[100px]
                            ${item.category ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}
                        `}>
                            {item.category || 'Uncategorized'}
                        </span>
                        <span className="text-[10px] text-zinc-600 ml-auto">
                            {new Date(item.published_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Footer / Expansion */}
            <div className="px-4 pb-3 flex items-center justify-between border-t border-zinc-800/50 pt-2 mt-1">
                <button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onClickExpand}
                    className="text-xs flex items-center gap-1.5 text-zinc-400 hover:text-emerald-400 bg-zinc-800/50 px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-all font-medium"
                >
                    {isExpanded ? <ChevronUp size={14} /> : <BrainCircuit size={14} />}
                    {isExpanded ? 'Ukryj' : 'Analiza AI'}
                </button>

                {item.url && (
                    <a
                        href={item.url}
                        target="_blank"
                        onPointerDown={(e) => e.stopPropagation()}
                        className="text-zinc-500 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                        <ExternalLink size={14} />
                    </a>
                )}
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-black/30 rounded-b-2xl"
                    >
                        <div className="p-4 pt-2 border-t border-zinc-800/50">
                            {item.source_platform === 'youtube' && (
                                <div className="aspect-video mb-3 rounded-lg overflow-hidden ring-1 ring-zinc-800">
                                    {/* @ts-ignore */}
                                    <ReactPlayer url={item.url} width="100%" height="100%" controls light />
                                </div>
                            )}

                            {isEditing ? (
                                <textarea
                                    value={editSummary}
                                    onChange={e => setEditSummary(e.target.value)}
                                    className="w-full h-32 bg-black/50 border border-zinc-700 rounded p-2 text-xs text-zinc-300 focus:outline-none focus:border-emerald-500"
                                    onPointerDown={e => e.stopPropagation()}
                                />
                            ) : (
                                <div className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                                    {item.summary_points?.length ? (
                                        item.summary_points.map((p: string, i: number) => (
                                            <div key={i} className="flex gap-2">
                                                <span className="text-emerald-500 mt-1">●</span>
                                                <span>{p}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="italic text-zinc-600">Brak analizy.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
