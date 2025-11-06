"use client";
import type { VariantProps } from "@gluestack-ui/nativewind-utils";
import { tva } from "@gluestack-ui/nativewind-utils/tva";
import { 
    Arrow,
    Backdrop,
    Body,
    Content,createPopover, 
    Footer,
    Header,
    Root,} from "@gluestack-ui/popover";
import React from "react";

const popoverStyle = tva({
    base: "group/popover w-full h-full justify-center items-center web:pointer-events-none",
});

const popoverArrowStyle = tva({
    base: "bg-background-0 absolute h-3.5 w-3.5 z-[-1]",
});

const popoverBackdropStyle = tva({
    base: "absolute left-0 top-0 right-0 bottom-0 web:cursor-default bg-background-dark web:pointer-events-auto opacity-40",
});

const popoverContentStyle = tva({
    base: "bg-background-0 rounded-lg overflow-hidden web:pointer-events-auto shadow-hard-5",
    variants: {
        size: {
            xs: "w-60 p-3.5",
            sm: "w-80 p-3.5",
            md: "w-96 p-4",
            lg: "w-[448px] p-4",
            full: "w-full p-4",
        },
    },
});

const popoverBodyStyle = tva({
    base: "p-0",
});

const popoverFooterStyle = tva({
    base: "p-0 flex-row justify-end items-center flex-wrap",
});

const popoverHeaderStyle = tva({
    base: "p-0",
});

type IPopoverProps = React.ComponentProps<typeof UIPopover> & {
    className?: string;
};

type IPopoverArrowProps = React.ComponentProps<typeof UIPopover.Arrow> & {
    className?: string;
};

type IPopoverBackdropProps = React.ComponentProps<typeof UIPopover.Backdrop> & {
    className?: string;
};

type IPopoverBodyProps = React.ComponentProps<typeof UIPopover.Body> & {
    className?: string;
};

type IPopoverContentProps = React.ComponentProps<typeof UIPopover.Content> &
    VariantProps<typeof popoverContentStyle> & {
        className?: string;
    };

type IPopoverFooterProps = React.ComponentProps<typeof UIPopover.Footer> & {
    className?: string;
};

type IPopoverHeaderProps = React.ComponentProps<typeof UIPopover.Header> & {
    className?: string;
};

const UIPopover = createPopover({
    Root,
    Arrow,
    Backdrop,
    Body,
    Content,
    Footer,
    Header,
});

const Popover = React.forwardRef<
    React.ElementRef<typeof UIPopover>,
    IPopoverProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover
            ref={ref}
            {...props}
            className={popoverStyle({ class: className })}
            pointerEvents="box-none"
        />
    );
});

const PopoverArrow = React.forwardRef<
    React.ElementRef<typeof UIPopover.Arrow>,
    IPopoverArrowProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover.Arrow
            className={popoverArrowStyle({ class: className })}
            {...props}
            ref={ref}
        />
    );
});

const PopoverBackdrop = React.forwardRef<
    React.ElementRef<typeof UIPopover.Backdrop>,
    IPopoverBackdropProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover.Backdrop
            ref={ref}
            {...props}
            className={popoverBackdropStyle({
                class: className,
            })}
        />
    );
});

const PopoverBody = React.forwardRef<
    React.ElementRef<typeof UIPopover.Body>,
    IPopoverBodyProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover.Body
            {...props}
            className={popoverBodyStyle({
                class: className,
            })}
            ref={ref}
        />
    );
});

const PopoverContent = React.forwardRef<
    React.ElementRef<typeof UIPopover.Content>,
    IPopoverContentProps
>(({ className, size = "md", ...props }, ref) => {
    return (
        <UIPopover.Content
            {...props}
            className={popoverContentStyle({
                class: className,
                size,
            })}
            ref={ref}
        />
    );
});

const PopoverFooter = React.forwardRef<
    React.ElementRef<typeof UIPopover.Footer>,
    IPopoverFooterProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover.Footer
            {...props}
            className={popoverFooterStyle({
                class: className,
            })}
            ref={ref}
        />
    );
});

const PopoverHeader = React.forwardRef<
    React.ElementRef<typeof UIPopover.Header>,
    IPopoverHeaderProps
>(({ className, ...props }, ref) => {
    return (
        <UIPopover.Header
            {...props}
            className={popoverHeaderStyle({
                class: className,
            })}
            ref={ref}
        />
    );
});

Popover.displayName = "Popover";
PopoverArrow.displayName = "PopoverArrow";
PopoverBackdrop.displayName = "PopoverBackdrop";
PopoverBody.displayName = "PopoverBody";
PopoverContent.displayName = "PopoverContent";
PopoverFooter.displayName = "PopoverFooter";
PopoverHeader.displayName = "PopoverHeader";

export {
    Popover,
    PopoverArrow,
    PopoverBackdrop,
    PopoverBody,
    PopoverContent,
    PopoverFooter,
    PopoverHeader,
};