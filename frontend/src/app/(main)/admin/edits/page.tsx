'use client';

import { useEffect, useState, useCallback } from 'react';
import { Check, X, Clock, MessageSquarePlus, User, Smartphone, Info, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth-provider';
import { useRouter } from 'next/navigation';
import { fetchPersonByHandle } from '@/lib/supabase-data';
import type { TreeNode } from '@/lib/tree-layout';

interface Contribution {
    id: string;
    person_id: string;
    contributor_name: string;
    contributor_contact: string;
    contribution_type: 'edit' | 'add_child' | 'add_spouse' | 'add_media';
    proposed_data: Record<string, string | number | boolean | null>;
    evidence_urls: string[];
    status: 'pending' | 'approved' | 'rejected';
    admin_notes: string | null;
    created_at: string;
}

export default function AdminEditsPage() {
    const { isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [peopleData, setPeopleData] = useState<Record<string, TreeNode>>({});
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

    const fetchContributions = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('contributions').select('*').order('created_at', { ascending: false });
        if (filter !== 'all') query = query.eq('status', filter);
        const { data, error } = await query;

        if (error) {
            console.error('Error fetching contributions:', error);
            setLoading(false);
            return;
        }

        const contribs = (data as Contribution[]) || [];
        setContributions(contribs);

        // Fetch corresponding people data for comparison
        const handles = Array.from(new Set(contribs.map(c => c.person_id)));
        const peopleMap: Record<string, TreeNode> = {};

        await Promise.all(handles.map(async (h) => {
            const p = await fetchPersonByHandle(h);
            if (p) peopleMap[h] = p;
        }));

        setPeopleData(peopleMap);
        setLoading(false);
    }, [filter]);

    useEffect(() => {
        if (!authLoading && !isAdmin) {
            router.push('/tree');
            return;
        }
        if (!authLoading && isAdmin) fetchContributions();
    }, [authLoading, isAdmin, fetchContributions, router]);

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        setProcessingId(id);

        const contrib = contributions.find(c => c.id === id);
        if (!contrib) return;

        // If approved, update the person record
        if (action === 'approved') {
            // Convert proposed_data back to DB snake_case for the people table update
            const fieldsToUpdate: Record<string, string | number | boolean | null | undefined> = {};
            const keyMap: Record<string, string> = {
                displayName: 'display_name',
                birthYear: 'birth_year',
                deathYear: 'death_year',
                isLiving: 'is_living',
                phone: 'phone',
                email: 'email',
                currentAddress: 'current_address',
                occupation: 'occupation',
                education: 'education',
                biography: 'biography',
                notes: 'notes'
            };

            Object.entries(contrib.proposed_data).forEach(([key, val]) => {
                const dbKey = keyMap[key] || key;
                fieldsToUpdate[dbKey] = val;
            });
            fieldsToUpdate.updated_at = new Date().toISOString();

            const { error: updateError } = await supabase
                .from('people')
                .update(fieldsToUpdate)
                .eq('handle', contrib.person_id);

            if (updateError) {
                console.error('Failed to update person after approval:', updateError);
                setProcessingId(null);
                return;
            }
        }

        // Update contribution status
        const { error } = await supabase.from('contributions').update({
            status: action,
            admin_notes: adminNotes[id] || null,
            updated_at: new Date().toISOString(),
        }).eq('id', id);

        if (error) console.error('Error updating contribution status:', error);

        setProcessingId(null);
        fetchContributions();
    };

    const statusColors = {
        pending: 'bg-amber-100/50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
        approved: 'bg-emerald-100/50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
        rejected: 'bg-rose-100/50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    };

    const statusLabels = {
        pending: 'Chờ duyệt',
        approved: 'Đã duyệt',
        rejected: 'Từ chối',
    };

    const pendingCount = contributions.filter(c => c.status === 'pending').length;

    if (authLoading) return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4 sm:px-0">
            {/* Header section with Glass design */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-xl">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-primary-500/10 flex items-center justify-center border border-primary-500/20 shadow-lg shadow-primary-500/10">
                        <MessageSquarePlus className="h-8 w-8 text-primary-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-surface-900 dark:text-white tracking-tighter">PHÊ DUYỆT ĐÓNG GÓP</h1>
                        <p className="text-surface-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                            {pendingCount > 0 ? `${pendingCount} yêu cầu đang chờ xử lý` : 'Cơ sở dữ liệu đã nhất quán'}
                        </p>
                    </div>
                </div>

                <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 shadow-inner">
                    {(['pending', 'approved', 'rejected', 'all'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${filter === f ? 'bg-primary-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
                            {f === 'all' ? 'TẤT CẢ' : statusLabels[f]}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-30">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    <span className="font-bold tracking-widest text-[10px] uppercase">Đang đồng bộ dữ liệu...</span>
                </div>
            ) : contributions.length === 0 ? (
                <Card className="glass-card border-dashed border-white/10 rounded-3xl py-24 text-center">
                    <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Check className="h-10 w-10 text-slate-500" />
                    </div>
                    <p className="text-slate-500 font-bold text-lg uppercase tracking-widest">Không có dữ liệu đóng góp</p>
                </Card>
            ) : (
                <div className="space-y-6">
                    {contributions.map(c => {
                        const person = peopleData[c.person_id] as unknown as Record<string, string | number | boolean | null>;
                        const changes = Object.entries(c.proposed_data).filter(([key, val]) => {
                            const oldVal = person ? person[key] : null;
                            return String(val) !== String(oldVal);
                        });

                        return (
                            <Card key={c.id} className={`glass-card rounded-[2rem] border-white/5 shadow-xl transition-all hover:border-white/10 ${c.status === 'pending' ? 'border-amber-500/20 shadow-amber-500/5' : ''}`}>
                                <CardContent className="p-0">
                                    <div className="flex flex-col xl:flex-row">
                                        {/* Left: Contributor & Target Info */}
                                        <div className="xl:w-80 p-8 border-b xl:border-b-0 xl:border-r border-white/5 bg-white/5">
                                            <div className="space-y-6">
                                                <div>
                                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${statusColors[c.status]}`}>
                                                        {statusLabels[c.status]}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-surface-900 dark:bg-white/5 flex items-center justify-center border border-white/10">
                                                        <User className="h-6 w-6 text-primary-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest">ĐỐI TƯỢNG</p>
                                                        <p className="text-base font-black text-surface-900 dark:text-white leading-tight">{person?.displayName || c.person_id}</p>
                                                    </div>
                                                </div>

                                                <div className="pt-6 border-t border-white/5 space-y-4">
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1">NGƯỜI GỬI</p>
                                                        <p className="text-sm font-bold text-surface-700 dark:text-slate-300">{c.contributor_name}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                            <Smartphone className="h-3 w-3" /> LIÊN HỆ
                                                        </p>
                                                        <p className="text-sm font-bold text-surface-700 dark:text-slate-300">{c.contributor_contact}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-surface-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                            <Clock className="h-3 w-3" /> THỜI GIAN
                                                        </p>
                                                        <p className="text-sm font-bold text-surface-700 dark:text-slate-300">
                                                            {new Date(c.created_at).toLocaleString('vi-VN')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: Data Comparison & Actions */}
                                        <div className="flex-1 flex flex-col">
                                            <div className="p-8 flex-1">
                                                <h4 className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                                    <Info className="h-4 w-4" /> SO SÁNH THAY ĐỔI ({changes.length} trường)
                                                </h4>

                                                <div className="grid gap-4">
                                                    {changes.map(([key, newVal]) => {
                                                        const oldVal = person ? (person as any)[key] : '—';
                                                        return (
                                                            <div key={key} className="grid grid-cols-1 md:grid-cols-[1fr,40px,1fr] items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 group/row hover:bg-white/10 transition-colors">
                                                                <div>
                                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">{key}</p>
                                                                    <div className="text-sm text-slate-400 font-medium line-through opacity-50 px-3 py-2 bg-slate-900/30 rounded-lg">
                                                                        {String(oldVal || '—')}
                                                                    </div>
                                                                </div>
                                                                <div className="flex justify-center">
                                                                    <ArrowRight className="h-5 w-5 text-emerald-500 opacity-40 group-hover/row:opacity-100 transition-opacity" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">ĐỀ XUẤT MỚI</p>
                                                                    <div className="text-sm text-white font-bold px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                                                        {String(newVal || '—')}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                {c.admin_notes && (
                                                    <div className="mt-8 p-4 bg-primary-500/5 border border-primary-500/20 rounded-2xl flex gap-3 items-start">
                                                        <Shield className="h-5 w-5 text-primary-500 shrink-0 mt-0.5" />
                                                        <p className="text-sm font-medium text-slate-300 underline underline-offset-4 decoration-primary-500/30">
                                                            Admin Notes: {c.admin_notes}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Action bar for pending */}
                                            {c.status === 'pending' && (
                                                <div className="p-8 border-t border-white/5 bg-slate-950/30 flex flex-col sm:flex-row items-center gap-4">
                                                    <Input
                                                        placeholder="Ghi chú phản hồi (nếu từ chối)..."
                                                        className="flex-1 bg-white/5 border-white/10 rounded-xl h-12 focus:border-primary-500/50"
                                                        value={adminNotes[c.id] || ''}
                                                        onChange={e => setAdminNotes(prev => ({ ...prev, [c.id]: e.target.value }))}
                                                    />
                                                    <div className="flex gap-4 w-full sm:w-auto">
                                                        <Button
                                                            variant="outline"
                                                            className="flex-1 sm:flex-none h-12 rounded-xl px-8 border-rose-500/20 text-rose-500 hover:bg-rose-500/10 font-black uppercase text-[10px] tracking-widest"
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleAction(c.id, 'rejected')}>
                                                            <X className="w-4 h-4 mr-2" /> TỪ CHỐI
                                                        </Button>
                                                        <Button
                                                            className="flex-1 sm:flex-none h-12 rounded-xl px-8 bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 font-black uppercase text-[10px] tracking-widest"
                                                            disabled={processingId === c.id}
                                                            onClick={() => handleAction(c.id, 'approved')}>
                                                            {processingId === c.id ? (
                                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                            ) : (
                                                                <><Check className="w-4 h-4 mr-2" /> PHÊ DUYỆT</>
                                                            )}
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
