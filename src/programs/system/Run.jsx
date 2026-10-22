import { useEffect } from "react";
import { DIALOG, showDialog } from "../../system/WindowManager";

export default function Run({ window, pid }) {
	useEffect(() => {
		if (pm.getPid('run').length > 1) return pm.kill(pid);

		const runDialog = window.add({
			title: 'Run',
			comp: <>
				<form action={(formData) => {
					const program = formData.get('program');
					const error = pm.start(program);
					if (typeof error === 'string') {
						showDialog(window, DIALOG.ERROR, "Error", error);
						runDialog.close();
					}
				}}>
					<label htmlFor='system-run-dialog-input'>Open: </label>
					<input type='text' name='program' id='system-run-dialog-input'></input>
					<button type='submit'>OK</button>
				</form>
			</>
		});

		return runDialog.close;
	}, []);
}
