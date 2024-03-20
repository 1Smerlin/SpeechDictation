if (!("webkitSpeechRecognition" in window)) {
  alert("Dein Browser unterstützt die Web Speech API nicht.");
} else {
  let recognition;
  let isRecording = false;

  document.addEventListener("keydown", function (event) {
    if (event.altKey && event.key === "b") {
      event.preventDefault(); // Verhindert Standardaktionen

      if (!isRecording) {
        startSpeechRecognition();
      } else {
        stopSpeechRecognition();
      }
    }
  });

  let lastResultIndex = 0; // Hält den Index des zuletzt verarbeiteten Ergebnisses fest

  function startSpeechRecognition() {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "de-DE";
    recognition.continuous = true; // Kontinuierliche Aufnahme
    recognition.interimResults = false; // Nur finale Ergebnisse

    recognition.onstart = function () {
      console.log("Spracherkennung gestartet.");
      isRecording = true;
      updateFloatingUI(true);
      lastResultIndex = 0; // Zurücksetzen des Indexes beim Start der Aufnahme
    };

    recognition.onerror = function (event) {
      console.error("Spracherkennungsfehler:", event.error);
    };

    recognition.onresult = function (event) {
      let transcript = "";
      for (let i = lastResultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      lastResultIndex = event.results.length; // Aktualisiere den Index des zuletzt verarbeiteten Ergebnisses
      insertTextIntoFocusedField(transcript);
      console.log("Erkannter Text:", transcript);
    };

    recognition.onend = function () {
      if (isRecording) {
        recognition.start(); // Automatischer Neustart, wenn noch aufgenommen wird
      } else {
        console.log("Spracherkennung gestoppt.");
        updateFloatingUI(false);
      }
    };

    recognition.start();
  }

  function stopSpeechRecognition() {
    isRecording = false;
    recognition.stop(); // Beendet die Spracherkennung
  }

  function updateFloatingUI(isRecording) {
    let floatingUI = document.getElementById("speech-recording-status");
    if (!floatingUI) {
      floatingUI = document.createElement("div");
      floatingUI.id = "speech-recording-status";
      document.body.appendChild(floatingUI);
      floatingUI.style = "position: fixed; bottom: 20px; right: 20px; background-color: red; color: white; padding: 8px; border-radius: 8px; opacity: 0.8; z-index: 1000;";
    }
    floatingUI.textContent = isRecording ? "Aufnahme..." : "";
    floatingUI.style.display = isRecording ? "block" : "none";
  }
  function insertTextIntoFocusedField(text) {
    let activeElement = document.activeElement;
    if (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA") {
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;
      const beforeText = activeElement.value.substring(0, startPos);
      const afterText = activeElement.value.substring(endPos);

      // Entferne automatisch hinzugefügte Satzzeichen am Ende
      const trimmedText = text.replace(/[.!?]$/, "");

      // Überprüfe, ob vor der Einfügestelle ein Leerzeichen oder der Anfang des Feldes ist
      const spaceBefore = startPos === 0 || beforeText.endsWith(" ") ? "" : " ";

      // Füge den bereinigten Text an der Cursorposition ein, mit einem Leerzeichen davor, falls nötig
      activeElement.value = beforeText + spaceBefore + trimmedText + afterText;

      // Verschiebe den Cursor hinter den eingefügten Text
      const newPos = startPos + spaceBefore.length + trimmedText.length;
      activeElement.setSelectionRange(newPos, newPos);

      // Triggere das input-Event, um Änderungen mitzuteilen
      activeElement.dispatchEvent(new Event("input", { bubbles: true }));
    } else {
      console.log("Das fokussierte Element ist kein Textfeld.");
    }
  }
}
