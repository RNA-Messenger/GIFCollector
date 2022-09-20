const copyGifUrl = (gifId) => {
  const getGifUrlToCopy = document.getElementById(gifId).src;
  navigator.clipboard.writeText(getGifUrlToCopy);
  alert("GIF UR copied to clipboard! You can now share this GIF.");
};
