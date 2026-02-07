import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { AssistPersonal } from '@/types';

interface SupabaseNewsItem {
    id: string;
    source_platform: string;
    title: string;
    url: string;
    author_or_channel: string;
    summary_points: string[] | null;
    status: string;
    published_at: string;
    notes?: string;
}

function mapNewsItemToKnowledgeItem(item: SupabaseNewsItem): AssistPersonal.KnowledgeItem {
    const categoryMap: Record<string, AssistPersonal.Category> = {
        youtube: 'youtube',
        reddit: 'reddit',
        github: 'github',
        note: 'ideas',
        prompt: 'tools',
    };

    return {
        id: item.id,
        url: item.url,
        title: item.title,
        description: item.summary_points?.join(' ') || '',
        category: categoryMap[item.source_platform] || 'uncategorized',
        source: (item.source_platform as 'youtube' | 'reddit' | 'github') || 'custom',
        addedAt: new Date(item.published_at),
        tags: [],
        isFavorite: item.status === 'done',
        notes: item.notes,
    };
}

export function useSupabaseSync() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setIsLoading(true);
                const { data, error: supabaseError } = await supabase
                    .from('news_items')
                    .select('*')
                    .order('published_at', { ascending: false });

                if (supabaseError) throw supabaseError;

                if (data) {
                    const knowledgeItems = data.map(mapNewsItemToKnowledgeItem);
                    useStore.setState((state) => ({
                        assist: {
                            ...state.assist,
                            knowledgeItems,
                        },
                    }));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                console.error('Supabase sync error:', err);
            } finally {
                setIsLoading(false);
            }
        }

        fetchData();
    }, []);

    return { isLoading, error };
}

export async function updateItemStatus(id: string, status: string) {
    const { error } = await supabase
        .from('news_items')
        .update({ status })
        .eq('id', id);

    if (error) {
        console.error('Failed to update status:', error);
        throw error;
    }
}

export async function deleteItem(id: string) {
    const { error } = await supabase
        .from('news_items')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Failed to delete item:', error);
        throw error;
    }
}

export async function fetchSources() {
    const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map((s) => ({
        id: s.id,
        name: s.name,
        url: s.identifier || '',
        type: s.platform as 'youtube' | 'reddit' | 'github' | 'rss' | 'custom',
        isActive: true,
    })) || [];
}
