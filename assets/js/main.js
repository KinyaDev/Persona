// const inputElement = document.querySelector('input[type="file"]');

// const pond = FilePond.create(inputElement, {
//   labelIdle: `Drag & Drop your picture or <span class="filepond--label-action">Browse</span>`,
//   imagePreviewHeight: 170,
//   imageCropAspectRatio: "1:1",
//   imageResizeTargetWidth: 200,
//   imageResizeTargetHeight: 200,
//   stylePanelLayout: "compact circle",
//   styleLoadIndicatorPosition: "center bottom",
//   styleProgressIndicatorPosition: "right bottom",
//   styleButtonRemoveItemPosition: "left bottom",
//   styleButtonProcessItemPosition: "right bottom",
// });

let loggedText = document.querySelector(".logged-text");
let token = Cookies.get("token");

if (token) {
  (async () => {
    let response = await fetch("/api/users/me");
    let json = await response.json();

    loggedText.textContent = `Welcome ${json.username}`;
    console.log(json);
  })();
}

let links = document.querySelector(".navbar > .links");

if (!token) {
  links.innerHTML += `<a href="/login">Login</a>`;
  links.innerHTML += `<a href="/register">Register</a>`;
} else {
  links.innerHTML += `<a href="/add">Add a character</a>`;
  links.innerHTML += `<a href="/disconnect">Disconnect</a>`;
  links.innerHTML += `<a href="/myself">My Profile</a>`;
}
