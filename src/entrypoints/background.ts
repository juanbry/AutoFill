export default defineBackground(() => {
	browser.runtime.onInstalled.addListener(() => {
		console.info("job-autofill instalado");
	});
});
