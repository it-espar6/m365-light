"use client"

import { Toast as ToastPrimitive } from "@base-ui/react/toast"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

function ToastProvider({
  children,
  ...props
}: ToastPrimitive.Provider.Props) {
  return (
    <ToastPrimitive.Provider {...props}>
      {children}
    </ToastPrimitive.Provider>
  )
}

const ToastViewport = ({
  className,
  ...props
}: ToastPrimitive.Viewport.Props) => {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(
        "fixed top-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-[420px]",
        className
      )}
      {...props}
    />
  )
}

const ToastRoot = ({
  className,
  ...props
}: ToastPrimitive.Root.Props) => {
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between gap-2 rounded-lg border bg-background p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[ending]:opacity-0 data-[starting]:fade-in-0 data-[starting]:slide-in-from-right-full data-[starting]:sm:slide-in-from-bottom-full",
        className
      )}
      {...props}
    />
  )
}

const ToastContent = ({
  className,
  ...props
}: ToastPrimitive.Content.Props) => {
  return (
    <ToastPrimitive.Content
      data-slot="toast-content"
      className={cn("flex flex-col gap-0.5", className)}
      {...props}
    />
  )
}

const ToastTitle = ({
  className,
  ...props
}: ToastPrimitive.Title.Props) => {
  return (
    <ToastPrimitive.Title
      data-slot="toast-title"
      className={cn("text-sm font-semibold", className)}
      {...props}
    />
  )
}

const ToastDescription = ({
  className,
  ...props
}: ToastPrimitive.Description.Props) => {
  return (
    <ToastPrimitive.Description
      data-slot="toast-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

const ToastClose = ({
  className,
  ...props
}: ToastPrimitive.Close.Props) => {
  return (
    <ToastPrimitive.Close
      data-slot="toast-close"
      className={cn(
        "absolute top-2 right-2 rounded-xs p-0.5 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    >
      <XIcon className="size-4" />
    </ToastPrimitive.Close>
  )
}

function Toaster() {
  const { toasts, close } = ToastPrimitive.useToastManager()

  return (
    <ToastViewport>
      {toasts.map((toast) => (
        <ToastRoot key={toast.id} toast={toast}>
          <ToastContent>
            {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
            {toast.description && (
              <ToastDescription>{toast.description}</ToastDescription>
            )}
          </ToastContent>
          <ToastClose onClick={() => close(toast.id)} />
        </ToastRoot>
      ))}
    </ToastViewport>
  )
}

function useToast() {
  const { add, close, update, promise, toasts } = ToastPrimitive.useToastManager()

  function toast(props: {
    title?: React.ReactNode
    description?: React.ReactNode
    type?: string
    timeout?: number
    id?: string
  }) {
    return add(props)
  }

  return { toast, close, update, promise, toasts }
}

export { ToastProvider, ToastViewport, Toaster, useToast }
export {
  ToastRoot as Toast,
  ToastContent,
  ToastTitle,
  ToastDescription,
  ToastClose,
}
