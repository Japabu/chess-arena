import { Component, createSignal, createEffect, onCleanup, JSX, Show } from 'solid-js';

interface ContextMenuProps {
  trigger: JSX.Element;
  children: JSX.Element;
  class?: string;
}

const ContextMenu: Component<ContextMenuProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let menuRef: HTMLDivElement | undefined;
  
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(!isOpen());
  };
  
  const close = () => {
    setIsOpen(false);
  };
  
  const handleClickOutside = (e: MouseEvent) => {
    if (menuRef && !menuRef.contains(e.target as Node)) {
      close();
    }
  };
  
  createEffect(() => {
    if (isOpen()) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    
    onCleanup(() => {
      document.removeEventListener('mousedown', handleClickOutside);
    });
  });
  
  return (
    <div class="relative" ref={el => menuRef = el}>
      <div onClick={(e) => toggle(e as unknown as MouseEvent)}>
        {props.trigger}
      </div>
      
      <Show when={isOpen()}>
        <div class={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-10 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 ${props.class || ''}`}>
          {props.children}
        </div>
      </Show>
    </div>
  );
};

export default ContextMenu; 