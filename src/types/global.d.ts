/**
 * Global type declarations for the WordPress environment.
 */

/** Data passed from PHP via wp_localize_script. */
interface JeecData {
	readonly restUrl: string;
	readonly restNonce: string;
	readonly adminUrl: string;
}

/** WordPress media frame attachment. */
interface WPMediaAttachment {
	id: number;
	url: string;
	sizes?: {
		thumbnail?: { url: string };
		medium?: { url: string };
		full?: { url: string };
	};
}

/** WordPress media frame selection. */
interface WPMediaSelection {
	first(): { toJSON(): WPMediaAttachment };
}

/** WordPress media frame state. */
interface WPMediaState {
	get(key: 'selection'): WPMediaSelection;
}

/** WordPress media frame instance. */
interface WPMediaFrame {
	on(event: string, callback: () => void): void;
	open(): void;
	state(): WPMediaState;
}

/** WordPress media frame options. */
interface WPMediaOptions {
	title: string;
	multiple: boolean;
	library: { type: string };
	button: { text: string };
}

declare global {
	interface Window {
		jeecData: JeecData;
	}

	/** WordPress global `wp` object (subset we use). */
	const wp: {
		media(options: WPMediaOptions): WPMediaFrame;
	};
}

export {};
