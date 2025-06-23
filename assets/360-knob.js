const knob = document.getElementById("knob");
const sliderArea = document.getElementById("sliderArea");

let totalFrames = document.querySelector(".slider-track").getAttribute("data-total-frames");
let currentPercent = 50;
let lastStep = null; 


function updateKnobPosition(percent) {
  const sliderRect = sliderArea.getBoundingClientRect();
  const knobWidth = knob.offsetWidth;
  const maxLeft = sliderRect.width - knobWidth;
  const left = (percent / 100) * maxLeft;
  knob.style.left = `${left}px`;
  const step = Math.floor((percent / 100) * totalFrames );
  let bottom = 5;
  const windowWidth = window.innerWidth;
  if (percent > 50) {
    bottom = windowWidth > 500 ? 5 + (percent - 65) * 0.25 : 9 + (percent - 65) * 0.2;
  } else {
    const updatedPercent = 100 - percent;
    bottom = windowWidth > 500 ? 5 + (updatedPercent - 65) * 0.25 : 9 + (updatedPercent - 65) * 0.2;
  }
  knob.style.bottom = `${bottom}px`;
  // Update Flickity slider position
  if (window.Flickity) {
    const flkty = window.perspectiveSlider;
    if (flkty) {
      // Debounce the slider selection to prevent rapid updates
      clearTimeout(window.sliderDebounce);
      window.sliderDebounce = setTimeout(() => {
        flkty.select(step);
      }, 50);
    }
  }
}

function getPercentFromX(x) {
  const rect = sliderArea.getBoundingClientRect();
  const clampedX = Math.max(0, Math.min(x - rect.left, rect.width));
  const percent = (clampedX / rect.width) * 100;
  return Math.max(0, Math.min(100, percent));
}

function startDrag(e) {
  e.preventDefault();

  const moveHandler = (eMove) => {
    const clientX = eMove.touches ? eMove.touches[0].clientX : eMove.clientX;
    currentPercent = getPercentFromX(clientX);
    updateKnobPosition(currentPercent);
  };

  const endHandler = () => {
    window.removeEventListener("mousemove", moveHandler);
    window.removeEventListener("touchmove", moveHandler);
    window.removeEventListener("mouseup", endHandler);
    window.removeEventListener("touchend", endHandler);
  };

  window.addEventListener("mousemove", moveHandler);
  window.addEventListener("touchmove", moveHandler);
  window.addEventListener("mouseup", endHandler);
  window.addEventListener("touchend", endHandler);
}

function initSliderKnob() {
  const images = document.querySelectorAll(".angle-image");
  if (images.length) {
    totalFrames = images.length;
  }

  updateKnobPosition(currentPercent);

  window.addEventListener("resize", () => {
    updateKnobPosition(currentPercent);
  });

  knob.addEventListener("mousedown", startDrag);
  knob.addEventListener("touchstart", startDrag, { passive: false });

  sliderArea.addEventListener("click", (e) => {
    const percent = getPercentFromX(e.clientX);
    currentPercent = percent;
    updateKnobPosition(currentPercent);
  });
}

initSliderKnob();
