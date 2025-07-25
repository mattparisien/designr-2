import { Element as CanvasElement } from "../../lib/types/canvas";
import { CopyIcon, LockIcon, TrashIcon } from 'lucide-react';
import { forwardRef, ForwardRefRenderFunction } from 'react';
import { Toolbar, ToolbarButton } from '../Toolbar';

type ActionBarPosition = 'top' | 'bottom' | 'left' | 'right';

interface ElementActionBarProps {
    element: CanvasElement;
    position: {
        left: number;
        top: number;
    };
    placement: ActionBarPosition;
    onLock: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}

const ElementActionBarComponent: ForwardRefRenderFunction<HTMLDivElement, ElementActionBarProps> = ({
    element,
    position,
    placement,
    onLock,
    onDuplicate,
    onDelete
}, ref) => {
    const isVertical = placement === 'left' || placement === 'right';

    return (

        <Toolbar
            ref={ref}
            className={`fixed bg-white/95 rounded-2xl flex items-center p-1 border border-gray-100 pointer-events-auto ${isVertical ? 'flex-col space-y-0.5' : 'space-x-0.5'
                }`}
            onClick={(e) => e.stopPropagation()}
            style={{
                left: `${position.left}px`,
                top: `${position.top}px`,
                transform: 'translateX(50%)',
                zIndex: 1000,
            }}
        >
            <ToolbarButton onClick={onLock} title={element.locked ? "Unlock" : "Lock"} isActive={element.locked}>
                <LockIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={onDuplicate} title="Duplicate">
                <CopyIcon className="w-4 h-4" />
            </ToolbarButton>

            <ToolbarButton onClick={onDelete} title="Delete">
                <TrashIcon className='w-4 h-4' />
            </ToolbarButton>
        </Toolbar>
    );
};

export const ElementActionBar = forwardRef(ElementActionBarComponent);