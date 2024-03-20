chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "meineOption",
    title: "Meine Option",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "meineOption") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: logMessage,
    });
  }
});

function logMessage() {
  console.log("Meine Option wurde ausgewählt.");
}
