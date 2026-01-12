import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import type { Components } from 'react-markdown';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
    content,
    className = ""
}) => {
    const [copiedBlockId, setCopiedBlockId] = useState<string | null>(null);

    const copyToClipboard = async (text: string, blockId: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedBlockId(blockId);
            setTimeout(() => setCopiedBlockId(null), 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const components: Components = {
        h2: ({ node, ...props }) => (
            <h2 className="text-xl font-semibold mt-6 mb-3 text-gray-900 dark:text-gray-100" {...props} />
        ),
        h3: ({ node, ...props }) => (
            <h3 className="text-lg font-medium mt-4 mb-2 text-gray-800 dark:text-gray-200" {...props} />
        ),
        p: ({ node, ...props }) => (
            <p className="mb-3 text-gray-700 dark:text-gray-300 leading-relaxed" {...props} />
        ),
        ul: ({ node, ...props }) => (
            <ul className="list-disc list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />
        ),
        ol: ({ node, ...props }) => (
            <ol className="list-decimal list-inside mb-3 space-y-1 text-gray-700 dark:text-gray-300" {...props} />
        ),
        li: ({ node, ...props }) => (
            <li className="ml-2" {...props} />
        ),
        strong: ({ node, ...props }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100" {...props} />
        ),
        code: ({ node, className, ...props }) => {
            const isInline = !className || !className.startsWith('language-');
            return isInline ? (
                <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm text-gray-800 dark:text-gray-200" {...props} />
            ) : (
                <code className="block bg-gray-900 dark:bg-gray-950 p-4 rounded-lg text-sm overflow-x-auto" {...props} />
            );
        },
        pre: ({ children, ...props }) => {
            const codeContent = String(children).replace(/\n$/, '');
            const blockId = Math.random().toString(36).substring(7);
            const isCopied = copiedBlockId === blockId;
            
            return (
                <div className="relative mb-3 group">
                    <div className="absolute top-2 right-2 z-10">
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-7 px-2 text-xs bg-card/80 backdrop-blur-sm border-border/50 hover:bg-muted"
                            onClick={() => copyToClipboard(codeContent, blockId)}
                        >
                            {isCopied ? (
                                <>
                                    <Check className="w-3 h-3 mr-1" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>
                    <pre className="bg-gray-900 dark:bg-gray-950 p-4 rounded-lg overflow-x-auto mb-4" {...props}>
                        {children}
                    </pre>
                </div>
            );
        },
        blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-blue-500 pl-4 my-4 italic text-gray-600 dark:text-gray-400" {...props} />
        ),
    };

    return (
        <div className={`prose prose-sm dark:prose-invert max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                    rehypeSlug,
                    [rehypeAutolinkHeadings, { behavior: 'wrap' }],
                    rehypeHighlight
                ]}
                components={components}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
};
