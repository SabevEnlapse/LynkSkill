import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    const handleInput = () => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = "auto"; // reset height
        el.style.height = el.scrollHeight + "px"; // set to scrollHeight
    };

    return (
        <textarea
            ref={textareaRef}
            data-slot="textarea"
            className={cn(
                "min-w-0 border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none",
                className
            )}
            onInput={handleInput}
            {...props}
        />
    );
}

export { Textarea };
