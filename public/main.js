const messageDiv = document.querySelector("#message");

const deleteGif = (objID) => {
  console.log(objID);
  fetch(`/deleteGifs/${objID}`, {
    method: "delete",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
  })
    .then((res) => {
      if (res.ok) return res.json();
    })
    .then((response) => {
      if (response === "GIF not found") {
        messageDiv.textContent = "GIF not found";
      }
      // else {
      //   window.location.reload(true);
      // }
    })
    .catch((error) => console.log(error));
};
