/**
 * Native iOS-style bottom sheet built on vaul (Drawer).
 * Supports drag-to-dismiss, rounded top corners, backdrop blur,
 * safe-area-aware bottom padding, and dark mode.
 */
import React from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

export function BottomSheet({ open, onOpenChange, children, snapPoints, title }) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={snapPoints}
      noBodyStyles
    >
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col outline-none',
            'rounded-t-[24px]'
          )}
          style={{
            backgroundColor: 'var(--color-bg-subtle, #F8F3ED)',
            paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 8px)',
            maxHeight: '92dvh',
          }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
            <div
              className="w-10 h-1 rounded-full"
              style={{ backgroundColor: 'var(--color-text-muted)', opacity: 0.3 }}
            />
          </div>

          {title && (
            <div
              className="px-5 pb-3 pt-1 flex-shrink-0 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <h2 className="text-base font-semibold text-center" style={{ color: 'var(--color-text-primary)' }}>
                {title}
              </h2>
            </div>
          )}

          <div className="overflow-y-auto flex-1">
            {children}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

/** A single action row inside a BottomSheet */
export function BottomSheetAction({ icon: Icon, label, onPress, destructive, active, rightContent }) {
  return (
    <button
      onClick={onPress}
      className="w-full flex items-center gap-4 px-5 py-4 active:opacity-60 transition-opacity text-left"
      style={{
        color: destructive ? '#EF4444' : active ? 'var(--color-accent)' : 'var(--color-text-primary)',
      }}
    >
      {Icon && ( // Icon is passed as a prop component

        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            backgroundColor: destructive
              ? 'rgba(239,68,68,0.1)'
              : active
              ? 'rgba(200,134,10,0.12)'
              : 'var(--color-bg-subtle)',
          }}
        >
          <Icon className="w-4 h-4" />
        </div>
      )}
      <span className="text-[15px] font-medium flex-1">{label}</span>
      {rightContent}
    </button>
  );
}

/** Divider between groups in a sheet */
export function BottomSheetDivider() {
  return <div className="h-px mx-5 my-1" style={{ backgroundColor: 'var(--color-border)' }} />;
}