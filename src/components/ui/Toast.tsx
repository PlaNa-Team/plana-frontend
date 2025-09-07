import React, { useEffect } from "react";
import * as Toast from "@radix-ui/react-toast"

interface ToastProps {
    title: string;
    description: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    actionText?: string;
    onAction?: () => void;
    duration?: number; // 단위 : ms
}

const CustomToast: React.FC<ToastProps> = ({
    title,
    description,
    isOpen,
    onOpenChange,
    actionText = "확인",
    onAction,
    duration = 5000
}) => {
    useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onOpenChange(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onOpenChange]);

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
        onOpenChange(false);
    };

    return (
        <Toast.Provider>
            <Toast.Root
                className="ToastRoot"
                open={ isOpen }
                onOpenChange={ onOpenChange }
                duration={ duration }    
            >
                <Toast.Title className="ToastTitle">
                    { title }
                </Toast.Title>
                <Toast.Description className="ToastDescription">
                    { description }
                </Toast.Description>
                <Toast.Action asChild altText={ actionText }>
                    <button 
                        className="Button"
                        type="button"
                        onClick={ handleAction }
                    >
                        { actionText }
                    </button>
                </Toast.Action>
            </Toast.Root>
            <Toast.Viewport className="ToastViewport" />
        </Toast.Provider>
    );
};

export default CustomToast;