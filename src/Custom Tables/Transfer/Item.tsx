import React, { forwardRef, HTMLAttributes, CSSProperties } from 'react';
import { Task } from './Types';

export type ItemProps = HTMLAttributes<HTMLDivElement> & {
    withOpacity?: boolean;
    isDragging?: boolean;
    task: Task;
    onSelect?: (event: React.MouseEvent<HTMLDivElement>) => void;
    selected: boolean | undefined;
    count: number;
    isSaved: boolean;
    isOnLeftSide: boolean;
};

const Item = forwardRef<HTMLDivElement, ItemProps>(
    (
        { withOpacity, onSelect, count, isSaved, selected, task, isDragging, isOnLeftSide, style, ...props },
        ref,
    ) => {
        let borderColor = '#d9d9d9'; // Default color for tasks on the left side
        if (isDragging || selected) {
            borderColor = '#1890ff'; // Blue for dragging or selected tasks
        } else if (!isOnLeftSide && !isSaved) {
            borderColor = '#d4b106'; // Yellow for tasks not on the left side
        }

        const inlineStyles: CSSProperties = {
            transform: isDragging ? 'scale(1.05)' : 'scale(1)',
            borderColor: borderColor,
            minWidth: isDragging ? 508 : '',
            ...style,
        };

        return (
            <div
                onClick={onSelect}
                className='filter-item'
                ref={ref}
                style={inlineStyles}
                {...props}
            >
                <img
                    src='https://www.webstaurantstore.com/uploads/images/2024/3/draggableicon.png'
                    alt='Draggable Icon'
                    width={16}
                />
                {task.content}
                {isDragging && count > 1 && (
                    <div className='filter-item__count'>
                        <p>{count}</p>
                    </div>
                )}
            </div>
        );
    },
);

export default Item;
