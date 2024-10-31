
window.addEventListener("message", (e) => {
  if (e.data.method == "set") {
    console.log("got message:set", e);
    localStorage.setItem(e.data.key, e.data.value);
  } else if (e.data.method == "get") {
    console.log("got message:get", e);
    let value = localStorage.getItem(e.data.key);
    console.log("response message");
    e.source.postMessage({ method: 'got', key: e.data.key, value: value }, '*')
  }
});

console.log("added Eventlistener to story.html");
