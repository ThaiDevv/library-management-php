import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '../../layouts/MainLayout';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }: ModalProps) => {
  const maxWidthClasses = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
    '2xl': 'sm:max-w-2xl',
    '3xl': 'sm:max-w-3xl',
    '4xl': 'sm:max-w-4xl',
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className={cn("relative transform overflow-hidden rounded-2xl bg-notion-bg border border-notion-border text-left shadow-notion-deep transition-all sm:my-8 w-full", maxWidthClasses[maxWidth])}>
                <div className="bg-notion-bg px-5 pb-5 pt-6 sm:p-6 sm:pb-5">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title as="h3" className="text-[26px] font-bold tracking-notion-h2 leading-tight text-notion-text">
                      {title}
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded bg-transparent text-notion-textMuted hover:text-notion-text hover:bg-black/5 p-1 transition-colors focus:outline-none focus:ring-2 focus:ring-notion-focus"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close</span>
                      <X className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <div>
                    {children}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
