// when html is Loaded
document.addEventListener("DOMContentLoaded", () => {
  // get all image tags
  let elements = document.querySelectorAll("img");
  for (let i = 0; i < elements.length; i++) {
    // if image is from our domain
    if (elements[i].src.startsWith("http://localhost:4000/img/")) {
      // add screen width to the URL
      elements[i].src = elements[i].src + "?width=" + screen.width;
    }
  }
});
