async function init() {
	// Get all divs with timesheet entries excluding weekends
	const divs = document.querySelectorAll('div.TimesheetSlat:not(.js-timesheet-showWeekends)');
	// Exclude divs with extra info items most likely to be sick days or holidays
	const filteredDivs = Array.from(divs).filter(x => !x.querySelector('.TimesheetSlat__extraInfoItem'));
	const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
	const inputEvent = new Event('input', {bubbles: true});
	let inputChanged = false;
	for (const x of filteredDivs) {
		const input = x.querySelector('.TimesheetSlat__input');
		// Exclude input if it is disabled or has a value
		if (input && !input.disabled && !input.value) {
			nativeInputValueSetter.call(input, '7,4');
			input.dispatchEvent(inputEvent);
			inputChanged = true;
		}
	}

	if (inputChanged) {
		document.dispatchEvent(new CustomEvent('SiteFooter:open'));
		document.querySelector('button.SiteFooter__action.SiteFooter__action--primary').click();
	}
}

init();
