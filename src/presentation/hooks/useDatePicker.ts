import { useCallback, useState } from "react";

interface UseDatePickerReturn {
	isVisible: boolean;
	show: () => void;
	hide: () => void;
}

export const useDatePicker = (): UseDatePickerReturn => {
	const [isVisible, setIsVisible] = useState(false);

	const show = useCallback(() => {
		setIsVisible(true);
	}, []);

	const hide = useCallback(() => {
		setIsVisible(false);
	}, []);

	return {
		isVisible,
		show,
		hide,
	};
};
