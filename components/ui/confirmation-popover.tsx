'use client';

import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ConfirmationPopoverProps {
    trigger: ReactNode;
    title: string;
    description?: string;
    confirmLabel: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    destructive?: boolean;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'right' | 'bottom' | 'left';
    className?: string;
}

export function ConfirmationPopover({
    trigger,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    destructive = true,
    align = 'end',
    side = 'bottom',
    className,
}: ConfirmationPopoverProps) {
    const [open, setOpen] = useState(false);

    const handleConfirm = async () => {
        await Promise.resolve(onConfirm());
        setOpen(false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{trigger}</PopoverTrigger>
            <PopoverContent align={align} side={side} className={className ?? 'w-80'}>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <h4 className="font-semibold text-sm">{title}</h4>
                        {description && <p className="text-xs text-muted-foreground">{description}</p>}
                    </div>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                            {cancelLabel}
                        </Button>
                        <Button
                            size="sm"
                            variant={destructive ? 'destructive' : 'default'}
                            onClick={handleConfirm}
                            className="flex-1"
                        >
                            {confirmLabel}
                        </Button>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}