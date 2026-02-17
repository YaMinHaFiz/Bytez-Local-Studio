/**
 * MarkdownRenderer Component
 *
 * Isolated, robust Markdown renderer with:
 * - Syntax-highlighted fenced code blocks (oneDark theme)
 * - Dark code-block header with language label + Copy button
 * - GFM support (tables, strikethrough, task lists)
 * - Math equation support (LaTeX via KaTeX)
 * - Styled inline code, links, lists, headings
 * - Error boundary fallback for syntax highlighter failures
 */

import { useState, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import clsx from 'clsx';

/* ── Copy Button ── */
function CopyButton({ text }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Fallback for insecure contexts
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [text]);

    return (
        <button
            onClick={handleCopy}
            className={clsx(
                'flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all duration-200',
                copied
                    ? 'text-green-400'
                    : 'text-zinc-500 hover:text-zinc-300'
            )}
            title={copied ? 'Copied!' : 'Copy code'}
        >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied' : 'Copy'}
        </button>
    );
}

/* ── Code Block with Header ── */
function CodeBlock({ language, children }) {
    const code = String(children).replace(/\n$/, '');
    const lang = language?.replace(/^language-/, '') || '';

    return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50">
            {/* Header bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    {/* Decorative dots */}
                    <div className="flex gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                    </div>
                    {lang && (
                        <span className="text-xs font-mono text-zinc-500 ml-2">
                            {lang}
                        </span>
                    )}
                </div>
                <CopyButton text={code} />
            </div>
            {/* Code body */}
            <div className="overflow-x-auto">
                <SyntaxHighlighter
                    language={lang || 'text'}
                    style={oneDark}
                    customStyle={{
                        margin: 0,
                        padding: '1rem 1.25rem',
                        background: 'transparent',
                        fontSize: '0.8125rem',
                        lineHeight: '1.6',
                    }}
                    codeTagProps={{
                        style: { fontFamily: "'Fira Code', 'JetBrains Mono', Consolas, monospace" },
                    }}
                    wrapLongLines={false}
                    PreTag="div"
                >
                    {code}
                </SyntaxHighlighter>
            </div>
        </div>
    );
}

/* ── Fallback Code Block (if highlighter fails) ── */
function FallbackCodeBlock({ children }) {
    const code = String(children).replace(/\n$/, '');
    return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-end px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <CopyButton text={code} />
            </div>
            <pre className="p-4 overflow-x-auto text-sm text-zinc-300 font-mono leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

/* ── Table Block with Copy Button ── */
function TableBlock({ children }) {
    const extractTableText = (node) => {
        if (!node) return '';
        if (typeof node === 'string') return node;
        if (Array.isArray(node)) return node.map(extractTableText).join('');
        if (node.props?.children) {
            const text = extractTableText(node.props.children);
            // Add tab between cells, newline between rows
            if (node.type === 'td' || node.type === 'th') return text + '\t';
            if (node.type === 'tr') return text + '\n';
            return text;
        }
        return '';
    };

    const tableText = extractTableText(children).trim();

    return (
        <div className="my-4 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
                <span className="text-xs font-mono text-zinc-500">table</span>
                <CopyButton text={tableText} />
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    {children}
                </table>
            </div>
        </div>
    );
}

/* ── Custom Components Map ── */
const markdownComponents = {
    code({ className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || '');
        const isBlock = match || (typeof children === 'string' && children.includes('\n'));

        if (isBlock) {
            try {
                return <CodeBlock language={className}>{children}</CodeBlock>;
            } catch {
                return <FallbackCodeBlock>{children}</FallbackCodeBlock>;
            }
        }

        // Inline code
        return (
            <code
                className="px-1.5 py-0.5 rounded bg-zinc-800/50 text-zinc-200 font-mono text-[0.8125rem]"
                {...props}
            >
                {children}
            </code>
        );
    },

    pre({ children }) {
        // The <pre> wrapper is handled by our CodeBlock, so just pass children through
        return <>{children}</>;
    },

    a({ href, children, ...props }) {
        return (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
                {...props}
            >
                {children}
            </a>
        );
    },

    table({ children }) {
        return <TableBlock>{children}</TableBlock>;
    },

    thead({ children, ...props }) {
        return (
            <thead className="bg-zinc-800/50 text-zinc-300" {...props}>
                {children}
            </thead>
        );
    },

    th({ children, ...props }) {
        return (
            <th className="px-4 py-2.5 text-left font-semibold border-b border-zinc-700" {...props}>
                {children}
            </th>
        );
    },

    td({ children, ...props }) {
        return (
            <td className="px-4 py-2 border-b border-zinc-800/50" {...props}>
                {children}
            </td>
        );
    },

    tr({ children, ...props }) {
        return (
            <tr className="hover:bg-zinc-800/30 transition-colors" {...props}>
                {children}
            </tr>
        );
    },

    ul({ children, ...props }) {
        return (
            <ul className="my-2 ml-5 list-disc space-y-1 text-zinc-300" {...props}>
                {children}
            </ul>
        );
    },

    ol({ children, ...props }) {
        return (
            <ol className="my-2 ml-5 list-decimal space-y-1 text-zinc-300" {...props}>
                {children}
            </ol>
        );
    },

    li({ children, ...props }) {
        return (
            <li className="leading-relaxed" {...props}>
                {children}
            </li>
        );
    },

    blockquote({ children, ...props }) {
        return (
            <blockquote
                className="my-3 pl-4 border-l-2 border-zinc-600 text-zinc-400 italic"
                {...props}
            >
                {children}
            </blockquote>
        );
    },

    h1({ children, ...props }) {
        return <h1 className="text-xl font-bold text-zinc-100 mt-6 mb-3" {...props}>{children}</h1>;
    },
    h2({ children, ...props }) {
        return <h2 className="text-lg font-semibold text-zinc-100 mt-5 mb-2" {...props}>{children}</h2>;
    },
    h3({ children, ...props }) {
        return <h3 className="text-base font-semibold text-zinc-100 mt-4 mb-2" {...props}>{children}</h3>;
    },

    p({ children, ...props }) {
        return <p className="my-2 leading-relaxed text-zinc-300" {...props}>{children}</p>;
    },

    hr({ ...props }) {
        return <hr className="my-6 border-zinc-800" {...props} />;
    },

    strong({ children, ...props }) {
        return <strong className="font-semibold text-zinc-100" {...props}>{children}</strong>;
    },

    em({ children, ...props }) {
        return <em className="italic text-zinc-400" {...props}>{children}</em>;
    },
};

/* ── Main Component ── */
function MarkdownRenderer({ content }) {
    if (!content) return null;

    // Strip stray <br> / <br/> tags that break table rendering
    const cleaned = content.replace(/<br\s*\/?>/gi, '\n');

    return (
        <div className="markdown-body text-sm leading-relaxed">
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
            >
                {cleaned}
            </ReactMarkdown>
        </div>
    );
}

export default memo(MarkdownRenderer);
