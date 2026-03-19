'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, Save, Loader2, Play, Code, Layers, Layout, 
    Terminal, XCircle, Trash2, Maximize2, Minimize2, Download,
    Columns, X, GripVertical, ImagePlus, CheckCircle, AlertCircle, Upload, Rows
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import Image from 'next/image';

// ─── Tab Button ────────────────────────────────────────────────────────────────
function TabButton({ active, onClick, icon: Icon, label, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-5 h-full border-b-2 transition-colors whitespace-nowrap ${active
                ? 'border-indigo-500 bg-white/5 text-white'
                : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className={`w-4 h-4 ${active ? color : 'text-gray-500'}`} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}

// ─── Thumbnail Uploader ─────────────────────────────────────────────────────────
function ThumbnailUploader({
    currentUrl,
    onUploaded
}: {
    currentUrl: string;
    onUploaded: (url: string) => void;
}) {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed.');
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError('File must be under 5 MB.');
            return;
        }

        setError('');
        setSuccess(false);
        setUploading(true);

        try {
            // 1. Get presigned URL
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Failed to get upload URL');
            }

            const { uploadUrl, publicUrl } = await res.json();

            // 2. PUT file directly to S3
            const uploadRes = await fetch(uploadUrl, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            if (!uploadRes.ok) {
                throw new Error('Upload to S3 failed');
            }

            // 3. Delete old thumbnail from S3 if replacing
            if (currentUrl) {
                try {
                    await fetch('/api/admin/upload', {
                        method: 'DELETE',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ url: currentUrl })
                    });
                } catch (delErr) {
                    console.error('Failed to delete old thumbnail:', delErr);
                }
            }

            onUploaded(publicUrl);
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            {/* Preview */}
            <div
                className="group relative w-full aspect-video bg-zinc-900 border border-white/10 overflow-hidden flex items-center justify-center cursor-pointer hover:border-indigo-500/40 transition-colors"
                onClick={() => inputRef.current?.click()}
            >
                {currentUrl ? (
                    <>
                        <img
                            src={currentUrl}
                            alt="Effect thumbnail"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                            <Upload className="w-6 h-6 text-white" />
                            <span className="text-sm text-white font-medium">Replace Image</span>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3 text-zinc-500">
                        <ImagePlus className="w-8 h-8" />
                        <div className="text-center">
                            <p className="text-sm font-medium text-zinc-400">Click to upload thumbnail</p>
                            <p className="text-xs mt-1">PNG, JPG, WebP · max 5 MB</p>
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="w-7 h-7 text-indigo-400 animate-spin" />
                    </div>
                )}
            </div>

            {/* Hidden input */}
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />

            {/* Status */}
            {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}
            {success && (
                <div className="flex items-center gap-2 text-green-400 text-xs">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    Thumbnail uploaded successfully
                </div>
            )}

            {/* URL display */}
            {currentUrl && (
                <div className="flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-2">
                    <span className="text-xs text-zinc-500 truncate flex-1">{currentUrl}</span>
                    <button
                        onClick={async () => { 
                            try {
                                await fetch('/api/admin/upload', {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ url: currentUrl })
                                });
                            } catch (err) {
                                console.error('Failed to delete thumbnail:', err);
                            }
                            onUploaded(''); 
                            setSuccess(false); 
                        }}
                        className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                        title="Remove"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminEffectEditor() {
    const params = useParams();
    const router = useRouter();
    const isNew = params.id === 'new';

    const [loading, setLoading] = useState(!isNew);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');

    // ── Meta State ──────────────────────────────────────────────────────────────
    const [effectId, setEffectId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [keywords, setKeywords] = useState('');
    const [isPublished, setIsPublished] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [metaTab, setMetaTab] = useState<'basic' | 'seo' | 'thumbnail'>('basic');

    // ── Code State ──────────────────────────────────────────────────────────────
    const [htmlCode, setHtmlCode] = useState('');
    const [cssCode, setCssCode] = useState('');
    const [jsCode, setJsCode] = useState('');
    const [reactCode, setReactCode] = useState('');
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'react' | 'next'>('html');

    // ── Layout State ────────────────────────────────────────────────────────────
    const [layout, setLayout] = useState<'split' | 'preview' | 'editor'>('split');
    const [splitOrientation, setSplitOrientation] = useState<'row' | 'col'>('row');
    const [panelOpen, setPanelOpen] = useState(true);
    const [splitPosition, setSplitPosition] = useState(50);
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // ── Settings Slider State ───────────────────────────────────────────────────
    const [settingsHeight, setSettingsHeight] = useState(30);
    const [isDraggingSettings, setIsDraggingSettings] = useState(false);
    const mainContainerRef = useRef<HTMLDivElement>(null);

    // ── Console State ───────────────────────────────────────────────────────────
    const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; message: string }[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'html' | 'react' | 'next'>('react');

    const [srcDoc, setSrcDoc] = useState('');

    // ── Fetch ───────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isNew) fetchEffect();
    }, [isNew, params.id]);

    const fetchEffect = async () => {
        try {
            const res = await fetch(`/api/admin/effects/${params.id}`);
            if (res.ok) {
                const data = await res.json();
                const eff = data.effect;
                setEffectId(eff.id);
                setTitle(eff.title);
                setDescription(eff.description);
                setTags(eff.tags.join(', '));
                setKeywords(eff.keywords.join(', '));
                setHtmlCode(eff.code?.html || '');
                setCssCode(eff.code?.css || '');
                setJsCode(eff.code?.js || '');
                setReactCode(eff.code?.react || '');
                setIsPublished(eff.isPublished || false);
                setPreviewImage(eff.previewImage || '');
            } else {
                alert('Effect not found');
                router.push('/admin/dashboard/effects');
            }
        } catch (err) {
            console.error('Failed to load effect', err);
        } finally {
            setLoading(false);
        }
    };

    // ── Draggable Resizer ───────────────────────────────────────────────────────
    const startDragging = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        e.preventDefault();
    }, []);

    const stopDragging = useCallback(() => setIsDragging(false), []);

    const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;
        if (e.cancelable) e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 1024;
        const isRow = isDesktop && splitOrientation === 'row';
        if (isRow) {
            const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            setSplitPosition(Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 20), 80));
        } else {
            const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            setSplitPosition(Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 20), 80));
        }
    }, [isDragging, splitOrientation]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', stopDragging);
            window.addEventListener('touchmove', onDrag, { passive: false });
            window.addEventListener('touchend', stopDragging);
        } else {
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', onDrag);
            window.removeEventListener('touchend', stopDragging);
        }
        return () => {
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDragging);
            window.removeEventListener('touchmove', onDrag);
            window.removeEventListener('touchend', stopDragging);
        };
    }, [isDragging, onDrag, stopDragging]);

    // ── Settings Resizer ────────────────────────────────────────────────────────
    const startDraggingSettings = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setIsDraggingSettings(true);
        e.preventDefault();
    }, []);

    const stopDraggingSettings = useCallback(() => setIsDraggingSettings(false), []);

    const onDragSettings = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDraggingSettings || !mainContainerRef.current) return;
        if (e.cancelable) e.preventDefault();
        const rect = mainContainerRef.current.getBoundingClientRect();
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
        setSettingsHeight(Math.min(Math.max(((clientY - rect.top) / rect.height) * 100, 10), 80));
    }, [isDraggingSettings]);

    useEffect(() => {
        if (isDraggingSettings) {
            window.addEventListener('mousemove', onDragSettings);
            window.addEventListener('mouseup', stopDraggingSettings);
            window.addEventListener('touchmove', onDragSettings, { passive: false });
            window.addEventListener('touchend', stopDraggingSettings);
        } else {
            window.removeEventListener('mousemove', onDragSettings);
            window.removeEventListener('mouseup', stopDraggingSettings);
            window.removeEventListener('touchmove', onDragSettings);
            window.removeEventListener('touchend', stopDraggingSettings);
        }
        return () => {
            window.removeEventListener('mousemove', onDragSettings);
            window.removeEventListener('mouseup', stopDraggingSettings);
            window.removeEventListener('touchmove', onDragSettings);
            window.removeEventListener('touchend', stopDraggingSettings);
        };
    }, [isDraggingSettings, onDragSettings, stopDraggingSettings]);

    // ── Code Generation ─────────────────────────────────────────────────────────
    const generateCode = useCallback((format: 'html' | 'react' | 'next') => {
        try {
            const componentName =
                effectId?.replace(/-./g, x => x[1].toUpperCase()).replace(/^./, x => x.toUpperCase()) || 'EffectComponent';

            if (format === 'html') {
                return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title || 'Effect'}</title>
<style>
body { margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#0e0e0e; }
${cssCode}
</style>
</head>
<body>
${htmlCode}
<script>${jsCode}</script>
</body>
</html>`;
            }

            let jsxHtml = htmlCode.replace(/class=/g, 'className=');
            ['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'].forEach(tag => {
                jsxHtml = jsxHtml.replace(new RegExp(`<${tag}([^>]*?)(?<!/)>`, 'gi'), `<${tag}$1 />`);
            });
            const scopedJS = jsCode
                .replace(/document\.getElementById/g, 'container.querySelector')
                .replace(/document\.querySelector(?!All)/g, 'container.querySelector')
                .replace(/document\.querySelectorAll/g, 'container.querySelectorAll');

            const component = `
import React, { useEffect, useRef } from "react";

export default function ${componentName}() {
  const containerRef = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cleanups = [];
    const originalRAF = window.requestAnimationFrame;
    const rafIds = [];
    window.requestAnimationFrame = (cb) => { const id = originalRAF(cb); rafIds.push(id); return id; };
    try {
${scopedJS}
    } catch(err) { console.error("Effect error:", err); }
    return () => { cleanups.forEach(fn => fn()); rafIds.forEach(id => cancelAnimationFrame(id)); window.requestAnimationFrame = originalRAF; };
  }, []);
  return (<><style>{\`${cssCode}\`}</style><div ref={containerRef}>${jsxHtml}</div></>);
}`;

            return format === 'next' ? `"use client";\n${component}` : component;
        } catch {
            return '// Error generating component';
        }
    }, [effectId, title, htmlCode, cssCode, jsCode]);

    // ── Export ──────────────────────────────────────────────────────────────────
    const handleDownload = () => {
        const code = generateCode(exportFormat);
        const ext = exportFormat === 'html' ? 'html' : exportFormat === 'react' ? 'jsx' : 'tsx';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `${effectId || 'effect'}.${ext}`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportModal(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode(exportFormat));
        setShowExportModal(false);
    };

    // ── Console Listener ────────────────────────────────────────────────────────
    useEffect(() => {
        const handleMessage = (e: MessageEvent) => {
            if (e.data?.type === 'console-message') {
                setLogs(prev => [...prev, { type: e.data.level, message: e.data.args.join(' ') }]);
                if (e.data.level === 'error') setShowConsole(true);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // ── Live Preview Debounce ───────────────────────────────────────────────────
    useEffect(() => {
        setLogs(prev => [...prev, { type: 'log', message: '--- Reloading Preview ---' }]);
        const timeout = setTimeout(() => {
            setSrcDoc(`<html><head><style>
body{background:transparent;color:white;font-family:sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;overflow:hidden;}
${cssCode}
</style></head><body>${htmlCode}
<script>(function(){const l=console.log,w=console.warn,e=console.error;
console.log=(...a)=>{parent.postMessage({type:'console-message',level:'log',args:a.map(String)},'*');l(...a)};
console.warn=(...a)=>{parent.postMessage({type:'console-message',level:'warn',args:a.map(String)},'*');w(...a)};
console.error=(...a)=>{parent.postMessage({type:'console-message',level:'error',args:a.map(String)},'*');e(...a)};
window.onerror=(m)=>{parent.postMessage({type:'console-message',level:'error',args:['Error: '+m]},'*');return false};
})();</script>
<script>${jsCode}</script></body></html>`);
        }, 800);
        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    // ── Save ────────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        setSaving(true);
        setSaveStatus('idle');
        const url = isNew ? '/api/admin/effects' : `/api/admin/effects/${params.id}`;
        const method = isNew ? 'POST' : 'PUT';
        const payload = {
            id: effectId.trim(), title: title.trim(), description: description.trim(),
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
            keywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
            code: { html: htmlCode, css: cssCode, js: jsCode, react: reactCode },
            isPublished, previewImage
        };
        try {
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (res.ok) {
                setSaveStatus('saved');
                if (isNew) router.push(`/admin/dashboard/effects/${data.effect._id}`);
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('error');
                alert(data.message || 'Error saving effect');
            }
        } catch {
            setSaveStatus('error');
            alert('Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
        );
    }

    const editorValue =
        activeTab === 'html' ? htmlCode :
        activeTab === 'css'  ? cssCode  :
        activeTab === 'js'   ? jsCode   :
        activeTab === 'react'? generateCode('react') :
        generateCode('next');

    const editorLanguage =
        activeTab === 'css'  ? 'css'  :
        activeTab === 'html' ? 'html' :
        'javascript';

    // ── Render ──────────────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col -mx-6 lg:-mx-10 -mt-6 lg:-mt-10 overflow-hidden" style={{ height: 'calc(100vh - 4rem)' }}>

            {/* ═══════════════════════════════ TOP BAR ═══════════════════════════ */}
            <div className="h-14 bg-[#080808] border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30">
                <div className="flex items-center gap-3 min-w-0">
                    <button onClick={() => router.push('/admin/dashboard/effects')}
                        className="p-2 hover:bg-white/5 text-gray-400 hover:text-white transition-colors shrink-0" title="Back">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div className="h-4 w-px bg-white/10 shrink-0" />
                    <span className="font-semibold text-sm text-white truncate hidden md:block">
                        {isNew ? 'New Effect' : (title || 'Edit Effect')}
                    </span>
                    <span className={`text-xs px-2 py-0.5 border font-medium shrink-0 ${isPublished
                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'}`}>
                        {isPublished ? 'Published' : 'Draft'}
                    </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    <label className="hidden sm:flex items-center gap-2 cursor-pointer border-r border-white/10 pr-3">
                        <span className="text-xs font-medium text-zinc-400">Publish</span>
                        <div className={`relative w-8 h-4 rounded-full transition-colors ${isPublished ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                            onClick={() => setIsPublished(v => !v)}>
                            <div className={`absolute top-[2px] left-[2px] w-3 h-3 rounded-full bg-white shadow transition-transform ${isPublished ? 'translate-x-4' : ''}`} />
                        </div>
                    </label>

                    <button
                        onClick={() => setPanelOpen(v => !v)}
                        className={`hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-medium border transition-colors ${panelOpen
                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                            : 'border-transparent text-gray-400 hover:bg-white/5'}`}
                    >
                        {panelOpen ? 'Hide Settings' : 'Show Settings'}
                    </button>

                    {saveStatus === 'saved' && (
                        <span className="flex items-center gap-1.5 text-xs text-green-400">
                            <CheckCircle className="w-4 h-4" /> Saved
                        </span>
                    )}
                    {saveStatus === 'error' && (
                        <span className="flex items-center gap-1.5 text-xs text-red-400">
                            <AlertCircle className="w-4 h-4" /> Error
                        </span>
                    )}

                    <button onClick={handleSave} disabled={saving}
                        className="flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-50">
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save
                    </button>
                </div>
            </div>

            {/* ═══════════════════════════ MAIN CONTENT AREA ════════════════════ */}
            <div ref={mainContainerRef} className="flex-1 flex flex-col min-h-0 relative">

                {/* ═══════════════════════════ SETTINGS PANEL ═══════════════════════ */}
                {panelOpen && (
                    <>
                        <div style={{ height: `${settingsHeight}%` }} className="flex flex-col shrink-0 bg-[#060606] overflow-y-auto">
                    {/* Panel Tabs */}
                    <div className="flex border-b border-white/5 px-4">
                        {(['basic', 'seo', 'thumbnail'] as const).map(tab => (
                            <button key={tab} onClick={() => setMetaTab(tab)}
                                className={`px-5 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-colors -mb-px ${metaTab === tab
                                    ? 'border-indigo-500 text-white'
                                    : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                            >
                                {tab === 'basic' ? 'Basic Info' : tab === 'seo' ? 'SEO & Tags' : 'Thumbnail'}
                            </button>
                        ))}
                    </div>

                    {/* Basic Info Tab */}
                    {metaTab === 'basic' && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Effect ID (Slug)</label>
                                <input type="text" disabled={!isNew} value={effectId}
                                    onChange={e => setEffectId(e.target.value)}
                                    placeholder="e.g. realistic-3d-earth"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 disabled:opacity-40 outline-none transition-colors"
                                />
                                {isNew && <p className="text-xs text-zinc-600">Slug must be unique (letters and dashes only). Cannot be changed later.</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Title</label>
                                <input type="text" value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="e.g. 3D Earth Day and Night Theme"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition-colors"
                                />
                            </div>

                            <div className="space-y-1.5 md:col-span-2">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Description</label>
                                <textarea rows={3} value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Describe what this effect does, what it looks like, and interesting technical details..."
                                    className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none resize-none transition-colors"
                                />
                            </div>

                        </div>
                    )}

                    {/* SEO & Tags Tab */}
                    {metaTab === 'seo' && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tags</label>
                                <input type="text" value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="HTML5 Canvas, Interactive, 3D, CSS"
                                    className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition-colors"
                                />
                                <p className="text-xs text-zinc-600">Comma-separated tags. Used for filtering in the effects catalogue.</p>

                                {/* Tag preview pills */}
                                {tags && (
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {tags.split(',').map((t, i) => t.trim() && (
                                            <span key={i} className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">
                                                {t.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Keywords</label>
                                <textarea rows={4} value={keywords}
                                    onChange={e => setKeywords(e.target.value)}
                                    placeholder="javascript animation, css particle, webgl particles, 3d globe, interactive background..."
                                    className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none resize-none transition-colors"
                                />
                                <p className="text-xs text-zinc-600">Comma-separated. Used by Algolia for full-text search indexing.</p>
                            </div>
                        </div>
                    )}

                    {/* Thumbnail Tab */}
                    {metaTab === 'thumbnail' && (
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Effect Thumbnail</label>
                                <ThumbnailUploader currentUrl={previewImage} onUploaded={setPreviewImage} />
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Thumbnail Guidelines</label>
                                <div className="bg-black/30 border border-white/5 p-4 space-y-3 text-xs text-zinc-400">
                                    <p className="font-medium text-zinc-300">Recommended specs:</p>
                                    <ul className="space-y-1.5 list-none">
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />Aspect ratio: <strong className="text-white">16:9</strong></li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />Min size: <strong className="text-white">1280 × 720 px</strong></li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />Formats: <strong className="text-white">PNG, JPG, WebP</strong></li>
                                        <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />Max file size: <strong className="text-white">5 MB</strong></li>
                                    </ul>
                                    <div className="border-t border-white/5 pt-3 text-zinc-500">
                                        Images are stored in AWS S3 and served via CDN. The public URL is saved to the effect record.
                                    </div>
                                </div>

                                {previewImage && (
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">Or paste URL</label>
                                        <input type="text" value={previewImage}
                                            onChange={e => setPreviewImage(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 outline-none transition-colors"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                {/* ════════════════════════ SETTINGS RESIZER ═════════════════════ */}
                <div
                    className="z-50 flex items-center justify-center bg-[#0a0a0a] hover:bg-white/5 transition-colors cursor-row-resize touch-none select-none w-full h-3 border-b border-white/5 shrink-0"
                    onMouseDown={startDraggingSettings} onTouchStart={startDraggingSettings}
                >
                    <div className="flex gap-1 opacity-50">
                        {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-500" />)}
                    </div>
                </div>
                </>
            )}

            {/* ═══════════════════════════ SPLIT EDITOR ═══════════════════════ */}
            <div ref={containerRef} className={`flex-1 flex min-h-0 relative ${splitOrientation === 'row' ? 'flex-col lg:flex-row' : 'flex-col'}`}>

                {/* LEFT: Preview */}
                <div
                    className={`flex flex-col bg-[#050505] border-r border-white/5 relative ${layout === 'editor' ? 'hidden' : 'flex-initial'}`}
                    style={layout === 'split' ? { flexBasis: `${splitPosition}%`, flexGrow: 0, flexShrink: 0 } : { flexGrow: 1 }}
                >
                    {/* Preview Toolbar */}
                    <div className="h-12 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center bg-white/5 p-1 border border-white/5">
                                <button onClick={() => setLayout('preview')} title="Full Preview"
                                    className={`p-1.5 transition-colors ${layout === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => { setLayout('split'); setSplitOrientation('row'); }} title="Split Side-by-Side"
                                    className={`p-1.5 transition-colors ${layout === 'split' && splitOrientation === 'row' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    <Columns className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => { setLayout('split'); setSplitOrientation('col'); }} title="Split Top-and-Bottom"
                                    className={`p-1.5 transition-colors ${layout === 'split' && splitOrientation === 'col' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}>
                                    <Rows className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="h-4 w-px bg-white/10 mx-1" />
                            <button onClick={() => setShowConsole(!showConsole)}
                                className={`p-2 transition-colors flex items-center gap-2 text-xs font-medium border ${showConsole ? 'bg-white/10 text-white border-white/10' : 'text-gray-400 border-transparent hover:bg-white/5'}`}>
                                <Terminal className="w-4 h-4" />
                                <span className="hidden md:inline">Console</span>
                            </button>
                        </div>
                        <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs border border-green-500/20 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                            <span className="hidden md:inline">Live</span>
                        </div>
                    </div>

                    {/* iframe */}
                    <div className="flex-1 min-h-0 relative bg-[radial-gradient(circle_at_top_left,#1f1545,#0d0b1a_70%)] flex flex-col">
                        <iframe
                            key={srcDoc}
                            srcDoc={srcDoc}
                            className={`w-full flex-1 min-h-0 z-10 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                            title="preview"
                            sandbox="allow-scripts"
                        />

                        {/* Console */}
                        {showConsole && (
                            <div className="z-20 h-48 bg-[#0a0a0a] border-t border-white/10 flex flex-col shrink-0 animate-in slide-in-from-bottom-5 duration-200">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-xs font-mono text-gray-400">Console</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setLogs([])} className="p-1 text-gray-500 hover:text-white transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setShowConsole(false)} className="p-1 text-gray-500 hover:text-white transition-colors"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs space-y-1">
                                    {logs.length === 0
                                        ? <div className="text-gray-600 italic px-2">No logs yet...</div>
                                        : logs.map((log, idx) => (
                                            <div key={idx} className={`px-2 py-0.5 border-b border-white/5 ${log.type === 'error' ? 'text-red-400 bg-red-500/5' : log.type === 'warn' ? 'text-yellow-400 bg-yellow-500/5' : 'text-gray-300'}`}>
                                                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                                {log.type === 'error' && <XCircle className="w-3 h-3 inline mr-1" />}
                                                {log.message}
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RESIZER */}
                {layout === 'split' && (
                    <div
                        className={`z-50 flex items-center justify-center bg-[#0a0a0a] hover:bg-white/5 transition-colors touch-none select-none ${splitOrientation === 'row' ? 'cursor-row-resize lg:cursor-col-resize w-full h-4 lg:w-4 lg:h-full border-y border-white/5 lg:border-x lg:border-y-0' : 'cursor-row-resize w-full h-4 border-y border-white/5'}`}
                        onMouseDown={startDragging} onTouchStart={startDragging}
                    >
                        <div className="flex items-center justify-center opacity-50">
                            {splitOrientation === 'row' ? (
                                <>
                                    <GripVertical className="hidden lg:block w-4 h-4 text-gray-400" />
                                    <div className="lg:hidden flex gap-1">
                                        {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-500" />)}
                                    </div>
                                </>
                            ) : (
                                <div className="flex gap-1">
                                    {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-gray-500" />)}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* RIGHT: Code Editor */}
                <div className={`flex flex-col bg-[#0f0f0f] ${layout === 'preview' ? 'hidden' : 'flex-initial'}`} style={{ flexGrow: 1 }}>
                    <div className="h-12 border-b border-white/5 flex items-center justify-between px-2 bg-[#0a0a0a] shrink-0">
                        <div className="flex h-full overflow-x-auto">
                            <TabButton active={activeTab === 'html'} onClick={() => setActiveTab('html')} icon={Code}   label="HTML"    color="text-orange-400" />
                            <TabButton active={activeTab === 'css'}  onClick={() => setActiveTab('css')}  icon={Layers} label="CSS"     color="text-blue-400" />
                            <TabButton active={activeTab === 'js'}   onClick={() => setActiveTab('js')}   icon={Play}   label="JS"      color="text-yellow-400" />
                            <div className="w-px h-6 bg-white/10 mx-2 self-center shrink-0" />
                            <TabButton active={activeTab === 'react'} onClick={() => setActiveTab('react')} icon={Code}   label="React"   color="text-cyan-400" />
                            <TabButton active={activeTab === 'next'}  onClick={() => setActiveTab('next')}  icon={Layout} label="Next.js" color="text-white" />
                        </div>
                        <div className="flex items-center gap-2 pr-2 shrink-0">
                            <button onClick={() => setShowExportModal(true)} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 transition-colors" title="Export">
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setLayout(layout === 'editor' ? 'split' : 'editor')}
                                className={`p-2 transition-colors ${layout === 'editor' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                title={layout === 'editor' ? 'Exit Fullscreen' : 'Fullscreen Editor'}
                            >
                                {layout === 'editor' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative min-h-0">
                        <div className="absolute inset-0">
                            <Editor
                                key={activeTab}
                                height="100%"
                                language={editorLanguage}
                                theme="vs-dark"
                                value={editorValue}
                                onChange={(value: string | undefined) => {
                                    if (activeTab === 'html')  setHtmlCode(value || '');
                                    else if (activeTab === 'css')   setCssCode(value || '');
                                    else if (activeTab === 'js')    setJsCode(value || '');
                                    else if (activeTab === 'react') setReactCode(value || '');
                                }}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineHeight: 21,
                                    padding: { top: 16 },
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    tabSize: 4,
                                    fontFamily: "'Geist Mono', monospace",
                                    readOnly: activeTab === 'next',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            </div> {/* END MAIN CONTENT AREA */}

            {/* ═══════════════════════════ EXPORT MODAL ════════════════════════ */}
            {showExportModal && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-white">Export Effect</h2>
                            <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="flex gap-2 mb-6 bg-white/5 p-1">
                            {(['html', 'react', 'next'] as const).map(fmt => (
                                <button key={fmt} onClick={() => setExportFormat(fmt)}
                                    className={`flex-1 py-2 px-3 text-sm font-medium transition-all ${exportFormat === fmt ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                                    {fmt === 'html' ? 'HTML / JS' : fmt === 'react' ? 'React' : 'Next.js'}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-3">
                            <button onClick={handleDownload}
                                className="w-full py-3 bg-white text-black font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                <Download className="w-4 h-4" /> Download File
                            </button>
                            <button onClick={handleCopy}
                                className="w-full py-3 bg-white/10 text-white font-medium hover:bg-white/20 transition-colors border border-white/5">
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
