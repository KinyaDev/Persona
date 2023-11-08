let btn = document.querySelector("button[type=submit]");
let msgcontainer = document.querySelector(".msg-container");

btn.addEventListener("click", (ev) => {
  btn.classList.add("pressed");

  setTimeout(() => {
    btn.classList.remove("pressed");
  }, 300);
});

let form = document.querySelector("form");

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();

  const data = new URLSearchParams(new FormData(ev.target));
  let response = await fetch(form.action, { method: form.method, body: data });
  let json = await response.json();

  if (response.status !== 200) {
    let el = document.createElement("p");
    el.innerHTML = json.message;
    el.classList.add("error");
    msgcontainer.innerHTML = "";
    msgcontainer.appendChild(el);

    let inputs = document.querySelectorAll("input");

    for (let inp of inputs) {
      inp.value = "";
    }

    return;
  }

  document.location = "/";
});
