"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Play, Code, Layers, RefreshCw, Terminal, XCircle, Trash2, Maximize2, Minimize2, Download, Layout, Columns, Square, X, GripVertical } from "lucide-react";
import Link from "next/link";
import Editor from "@monaco-editor/react";

export default function ClientEditor({ initialEffect }: { initialEffect: any }) {
    const params = useParams();
    const router = useRouter();
    const effectId = params.id as string;

    const effect = initialEffect;

    // Editor State
    const [htmlCode, setHtmlCode] = useState("");
    const [cssCode, setCssCode] = useState("");
    const [jsCode, setJsCode] = useState("");
    const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'react' | 'next'>('html');

    // Layout State
    const [layout, setLayout] = useState<'split' | 'preview' | 'editor'>('split');
    const [splitPosition, setSplitPosition] = useState(50); // Percentage
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Console State
    const [logs, setLogs] = useState<{ type: 'log' | 'error' | 'warn'; message: string }[]>([]);
    const [showConsole, setShowConsole] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState<'html' | 'react' | 'next'>('react');

    // Use srcDoc for rendering
    const [srcDoc, setSrcDoc] = useState("");

    // Initialize state
    useEffect(() => {
        if (effect) {
            setHtmlCode(effect.code.html);
            setCssCode(effect.code.css);
            setJsCode(effect.code.js || "");
        }
    }, [effect]);

    // Handle Dragging
    const startDragging = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        e.preventDefault(); // Prevent text selection
    }, []);

    const stopDragging = useCallback(() => {
        setIsDragging(false);
    }, []);

    const onDrag = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging || !containerRef.current) return;

        // Prevent scrolling on mobile while dragging
        if (e.cancelable) e.preventDefault();

        const containerRect = containerRef.current.getBoundingClientRect();
        const isDesktop = window.innerWidth >= 1024; // lg breakpoint matches Tailwind

        let clientPos = 0;
        let containerSize = 0;

        if (isDesktop) {
            clientPos = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
            containerSize = containerRect.width;
            const newPos = ((clientPos - containerRect.left) / containerSize) * 100;
            setSplitPosition(Math.min(Math.max(newPos, 20), 80)); // Clamp between 20% and 80%
        } else {
            clientPos = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
            containerSize = containerRect.height;
            const newPos = ((clientPos - containerRect.top) / containerSize) * 100;
            setSplitPosition(Math.min(Math.max(newPos, 20), 80));
        }
    }, [isDragging]);

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



    // Export Functionality
    const generateCode = (format: "html" | "react" | "next") => {
        try {
            const componentName =
                effectId
                    ?.replace(/-./g, x => x[1].toUpperCase())
                    .replace(/^./, x => x.toUpperCase()) || "EffectComponent";

            if (format === "html") {
                return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${effect?.title || "Effect"}</title>
<style>
body {
  margin:0;
  display:flex;
  justify-content:center;
  align-items:center;
  min-height:100vh;
  background:#0e0e0e;
}
${cssCode}
</style>
</head>
<body>
${htmlCode}
<script>
${jsCode}
</script>
</body>
</html>`;
            }

            // ---- SANITIZE HTML TO JSX ----
            let jsxHtml = htmlCode.replace(/class=/g, "className=");

            const voidTags = [
                "area", "base", "br", "col", "embed", "hr", "img",
                "input", "link", "meta", "param", "source", "track", "wbr"
            ];

            voidTags.forEach(tag => {
                const regex = new RegExp(`<${tag}([^>]*?)(?<!/)>`, "gi");
                jsxHtml = jsxHtml.replace(regex, `<${tag}$1 />`);
            });

            // ---- AUTO-SCOPE USER JS ----
            let scopedJS = jsCode
                .replace(/document\.getElementById/g, "container.querySelector")
                .replace(/document\.querySelector/g, "container.querySelector")
                .replace(/document\.querySelectorAll/g, "container.querySelectorAll");

            // ---- FULL REACT COMPONENT ----
            const component = `
import React, { useEffect, useRef } from "react";

export default function ${componentName}() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cleanups = [];

    const safeAddEvent = (target, type, handler, options) => {
      target.addEventListener(type, handler, options);
      cleanups.push(() => target.removeEventListener(type, handler));
    };

    const originalRAF = window.requestAnimationFrame;
    const rafIds = [];
    window.requestAnimationFrame = (cb) => {
      const id = originalRAF(cb);
      rafIds.push(id);
      return id;
    };

    try {
${scopedJS}
    } catch (err) {
      console.error("Effect runtime error:", err);
    }

    return () => {
      cleanups.forEach(fn => fn());
      rafIds.forEach(id => cancelAnimationFrame(id));
      window.requestAnimationFrame = originalRAF;
    };
  }, []);

  return (
    <>
      <style>{\`
${cssCode}
      \`}</style>
      <div ref={containerRef}>
${jsxHtml}
      </div>
    </>
  );
}
`;

            if (format === "next") {
                return `"use client";

${component}`;
            }

            return component;
        } catch (err) {
            console.error(err);
            return "// Error generating component";
        }
    };


    const handleDownload = () => {
        const code = generateCode(exportFormat);
        const extension =
            exportFormat === "html"
                ? "html"
                : exportFormat === "react"
                    ? "jsx"
                    : "tsx";

        const mime = exportFormat === 'html' ? 'text/html' : 'text/plain';

        const blob = new Blob([code], { type: mime });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${effectId || 'effect'}.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setShowExportModal(false);
    };

    const handleCopy = () => {
        const code = generateCode(exportFormat);
        navigator.clipboard.writeText(code);
        alert("Code copied to clipboard!"); // Replace with toast in real app
        setShowExportModal(false);
    };

    // Listen for console messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === 'console-message') {
                setLogs(prev => [...prev, { type: event.data.level, message: event.data.args.join(' ') }]);
                // Auto-open console on error if not open
                if (event.data.level === 'error') setShowConsole(true);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Update Preview
    useEffect(() => {
        // Add a separator to indicate code change/reload
        setLogs(prev => [...prev, { type: 'log', message: '--- Reloading Preview ---' }]);

        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <head>
                        <style>
                            body {
                                background-color: transparent;
                                color: white;
                                font-family: sans-serif;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                overflow: hidden;
                            }
                            ${cssCode}
                        </style>
                    </head>
                    <body>
                        ${htmlCode}
                        <script>
                            // Infrastructure: Override console & handlers
                            (function() {
                                const originalLog = console.log;
                                const originalWarn = console.warn;
                                const originalError = console.error;

                                console.log = (...args) => {
                                    window.parent.postMessage({ type: 'console-message', level: 'log', args: args.map(String) }, '*');
                                    originalLog.apply(console, args);
                                };
                                console.warn = (...args) => {
                                    window.parent.postMessage({ type: 'console-message', level: 'warn', args: args.map(String) }, '*');
                                    originalWarn.apply(console, args);
                                };
                                console.error = (...args) => {
                                    window.parent.postMessage({ type: 'console-message', level: 'error', args: args.map(String) }, '*');
                                    originalError.apply(console, args);
                                };

                                window.onerror = function(message, source, lineno, colno, error) {
                                    window.parent.postMessage({
                                        type: 'console-message',
                                        level: 'error',
                                        args: ['Error: ' + message]
                                    }, '*');
                                    return false;
                                };

                                window.onunhandledrejection = function(event) {
                                    window.parent.postMessage({
                                        type: 'console-message',
                                        level: 'error',
                                        args: ['Uncaught (in promise): ' + event.reason]
                                    }, '*');
                                };
                            })();
                        </script>
                        <script>
                            // User Code
                            ${jsCode}
                        </script>
                    </body>
                </html>
            `);
        }, 800); // 800ms Debounce

        return () => clearTimeout(timeout);
    }, [htmlCode, cssCode, jsCode]);

    if (!effect) {
        return (
            <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Effect Not Found</h1>
                    <Link href="/effects" className="text-pink-400 hover:underline">Back to Effects</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="h-dvh bg-[#030014] text-white font-sans flex flex-col overflow-hidden">
            {/* Minimal Editor Strip */}
            <div className="h-6 bg-[#020202] border-b border-white/5 flex items-center justify-center shrink-0 z-50">
                <span className="text-[10px] font-medium text-white/20 tracking-[0.2em] uppercase select-none">Codophile Editor</span>
            </div>

            <div
                ref={containerRef}
                className="flex-1 flex flex-col lg:flex-row min-h-0 relative"
            >

                {/* LEFT SIDE: PREVIEW */}
                <div
                    className={`flex flex-col bg-[#050505] border-r border-white/5 relative ${layout === 'editor' ? 'hidden' : 'flex-initial'
                        }`}
                    style={layout === 'split' ? { flexBasis: `${splitPosition}%`, flexGrow: 0, flexShrink: 0 } : { flexGrow: 1 }}
                >
                    {/* Toolbar */}
                    <div className="h-14 border-b border-white/5 bg-[#0a0a0a] flex items-center justify-between px-4 shrink-0">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                                title="Go Back"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <span className="font-semibold text-sm hidden md:block">{effect.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Layout Toggle (Mobile/Desktop) */}
                            <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
                                <button
                                    onClick={() => setLayout('preview')}
                                    className={`p-1.5 rounded ${layout === 'preview' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                    title="Full Preview"
                                >
                                    <Maximize2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setLayout('split')}
                                    className={`p-1.5 rounded ${layout === 'split' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}`}
                                    title="Split View"
                                >
                                    <Columns className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            <div className="h-4 w-px bg-white/10 mx-1" />

                            <button
                                onClick={() => setShowConsole(!showConsole)}
                                className={`p-2 rounded-md transition-colors flex items-center gap-2 text-xs font-medium border ${showConsole ? 'bg-white/10 text-white border-white/10' : 'text-gray-400 border-transparent hover:bg-white/5'}`}
                            >
                                <Terminal className="w-4 h-4" /> <span className="hidden md:inline">Console</span>
                            </button>

                            <div className="h-4 w-px bg-white/10 mx-1" />

                            <div className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded border border-green-500/20 flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> <span className="hidden md:inline">Live</span>
                            </div>
                        </div>
                    </div>

                    {/* Iframe Container */}
                    <div className="flex-1 min-h-0 relative bg-[radial-gradient(circle_at_top_left,#1f1545,#0d0b1a_70%)] flex flex-col">
                        <iframe
                            key={srcDoc}
                            srcDoc={srcDoc}
                            className={`w-full flex-1 min-h-0 relative z-10 border-0 ${isDragging ? 'pointer-events-none' : ''}`}
                            title="preview"
                            sandbox="allow-scripts"
                        />

                        {/* Console Panel */}
                        {showConsole && (
                            <div className="relative z-20 h-48 bg-[#0a0a0a] border-t border-white/10 flex flex-col animate-in slide-in-from-bottom-5 duration-200 shrink-0">
                                <div className="flex items-center justify-between px-3 py-1.5 bg-[#111] border-b border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Terminal className="w-3.5 h-3.5 text-gray-500" />
                                        <span className="text-xs font-mono text-gray-400">Console</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setLogs([])} className="p-1 text-gray-500 hover:text-white transition-colors" title="Clear Console">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button onClick={() => setShowConsole(false)} className="p-1 text-gray-500 hover:text-white transition-colors" title="Close Console">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 font-mono text-xs custom-scrollbar space-y-1">
                                    {logs.length === 0 ? (
                                        <div className="text-gray-600 italic px-2">No logs yet...</div>
                                    ) : (
                                        logs.map((log, idx) => (
                                            <div key={idx} className={`px-2 py-0.5 border-b border-white/5 ${log.type === 'error' ? 'text-red-400 bg-red-500/5' :
                                                log.type === 'warn' ? 'text-yellow-400 bg-yellow-500/5' :
                                                    'text-gray-300'
                                                }`}>
                                                <span className="opacity-50 mr-2">[{new Date().toLocaleTimeString()}]</span>
                                                {log.type === 'error' && <XCircle className="w-3 h-3 inline mr-1" />}
                                                {log.message}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* RESIZER HANDLE */}
                {layout === 'split' && (
                    <div
                        className={`z-50 flex items-center justify-center bg-[#0a0a0a] hover:bg-white/5 transition-colors 
                            cursor-row-resize lg:cursor-col-resize touch-none select-none
                            w-full h-4 lg:w-4 lg:h-full
                            border-y border-white/5 lg:border-x lg:border-y-0
                        `}
                        onMouseDown={startDragging}
                        onTouchStart={startDragging}
                    >
                        {/* Visual Grip Indicator */}
                        <div className="flex items-center justify-center opacity-50">
                            <GripVertical className="hidden lg:block w-4 h-4 text-gray-400" />
                            {/* Horizontal Grip for Mobile */}
                            <div className="lg:hidden flex gap-1">
                                <div className="w-1 h-1 rounded-full bg-gray-500" />
                                <div className="w-1 h-1 rounded-full bg-gray-500" />
                                <div className="w-1 h-1 rounded-full bg-gray-500" />
                            </div>
                        </div>
                    </div>
                )}

                {/* RIGHT SIDE: CODE EDITOR */}
                <div
                    className={`flex flex-col bg-[#0f0f0f] ${layout === 'preview' ? 'hidden' : 'flex-initial'
                        }`}
                    style={{ flexGrow: 1 }}
                >
                    {/* Editor Tabs */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-between px-2 bg-[#0a0a0a] shrink-0">
                        <div className="flex h-full">
                            <TabButton
                                active={activeTab === 'html'}
                                onClick={() => setActiveTab('html')}
                                icon={Code}
                                label="HTML"
                                color="text-orange-400"
                            />
                            <TabButton
                                active={activeTab === 'css'}
                                onClick={() => setActiveTab('css')}
                                icon={Layers}
                                label="CSS"
                                color="text-blue-400"
                            />
                            <TabButton
                                active={activeTab === 'js'}
                                onClick={() => setActiveTab('js')}
                                icon={Play}
                                label="JS"
                                color="text-yellow-400"
                            />
                            <div className="w-px h-6 bg-white/10 mx-2 self-center" />
                            <TabButton
                                active={activeTab === 'react'}
                                onClick={() => setActiveTab('react')}
                                icon={Code}
                                label="React"
                                color="text-cyan-400"
                            />
                            <TabButton
                                active={activeTab === 'next'}
                                onClick={() => setActiveTab('next')}
                                icon={Layout}
                                label="Next.js"
                                color="text-white"
                            />
                        </div>

                        <div className="flex items-center gap-2 pr-2">
                            <button
                                onClick={() => setShowExportModal(true)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors"
                                title="Export Code"
                            >
                                <Download className="w-4 h-4" />
                            </button>

                            <button
                                onClick={() => setLayout(layout === 'editor' ? 'split' : 'editor')}
                                className={`p-2 rounded-md transition-colors ${layout === 'editor' ? 'text-white bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                title={layout === 'editor' ? "Exit Fullscreen" : "Fullscreen Editor"}
                            >
                                {layout === 'editor' ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Editor Input Area */}
                    <div className="flex-1 relative min-h-0 bg-[#0f0f0f]">
                        <div className="absolute inset-0">
                            <Editor
                                key={activeTab}
                                height="100%"
                                language={activeTab === 'js' || activeTab === 'react' || activeTab === 'next' ? 'javascript' : activeTab}
                                theme="vs-dark"
                                value={
                                    activeTab === 'html' ? htmlCode :
                                        activeTab === 'css' ? cssCode :
                                            activeTab === 'js' ? jsCode :
                                                activeTab === 'react' ? generateCode('react') :
                                                    generateCode('next')
                                }
                                onChange={(value: string | undefined) => {
                                    if (activeTab === 'html') setHtmlCode(value || "");
                                    else if (activeTab === 'css') setCssCode(value || "");
                                    else if (activeTab === 'js') setJsCode(value || "");
                                    // React/Next tabs are read-only for now or just don't update state back to source
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
                                    readOnly: activeTab === 'react' || activeTab === 'next', // Read-only for generated views
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* Export Modal */}
            {showExportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-[#111] border border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold">Export Effect</h2>
                            <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6 bg-white/5 p-1 rounded-lg">
                            {(['html', 'react', 'next'] as const).map((format) => (
                                <button
                                    key={format}
                                    onClick={() => setExportFormat(format)}
                                    className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${exportFormat === format
                                        ? 'bg-pink-600 text-white shadow-lg'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {format === 'html' ? 'HTML/JS' : format === 'react' ? 'React' : 'Next.js'}
                                </button>
                            ))}
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={handleDownload}
                                className="w-full py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                            >
                                <Download className="w-4 h-4" /> Download File
                            </button>
                            <button
                                onClick={handleCopy}
                                className="w-full py-3 bg-white/10 text-white font-medium rounded-lg hover:bg-white/20 transition-colors border border-white/5"
                            >
                                Copy to Clipboard
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label, color }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 h-full border-b-2 transition-colors ${active
                ? `border-indigo-500 bg-white/5 text-white`
                : `border-transparent text-gray-400 hover:text-white hover:bg-white/5`
                }`}
        >
            <Icon className={`w-4 h-4 ${active ? color : 'text-gray-500'}`} />
            <span className="text-sm font-medium">{label}</span>
        </button>
    );
}
