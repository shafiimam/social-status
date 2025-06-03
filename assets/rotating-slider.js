document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  //rotating-slider.js
  (function ($) {
    $.fn.rotatingSlider = function (options) {
      var rotatingSlider = {
        init: function (el) {
          this.$slider = $(el);
          this.$slidesContainer = this.$slider.children("ul.slides");
          this.$slides = this.$slidesContainer.children("li");
          this.directionAction = "clockwise";
          this.$clipPath;
          this.$directionControls;
          this.$currentSlide;
          this.$nextSlide;
          this.$previousSlide;
          this.settings = $.extend(
            {
              autoRotate: !0,
              autoRotateInterval: 6000,
              draggable: !0,
              directionControls: !0,
              directionLeftText: "&lsaquo;",
              directionRightText: "&rsaquo;",
              rotationSpeed: 750,
              slideHeight: 600,
              slideHeightMobile: 400,
              slideWidth: 350,
              beforeRotationStart: function () {},
              afterRotationStart: function () {},
              beforeRotationEnd: function () {},
              afterRotationEnd: function () {},
            },
            options
          );
          this.slideAngle = 35 / this.$slides.length;
          this.middleSlideIndex = Math.floor(this.$slides.length / 2);
          this.currentRotationAngle = -(
            this.middleSlideIndex * this.slideAngle
          );
          this.autoRotateIntervalId = !1;
          this.rotateTimoutId = !1;
          this.currentlyRotating = !1;
          this.readyToDrag = !1;
          this.dragStartPoint;
          this.dragStartAngle;
          this.currentlyDragging = !1;
          this.markupIsValid = !1;
          this.left_arrow = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 26 26" fill="none">
                                <path d="M8.82035 14.2718L19.4224 10.4353C19.5737 10.3805 19.7405 10.3881 19.8862 10.4564C20.0319 10.5246 20.1445 10.648 20.1992 10.7993C20.254 10.9506 20.2464 11.1174 20.1781 11.2631C20.1099 11.4088 19.9865 11.5214 19.8352 11.5761L9.23319 15.4127L14.8991 18.0666C15.045 18.135 15.1578 18.2585 15.2126 18.41C15.2674 18.5614 15.2598 18.7285 15.1914 18.8744C15.1231 19.0202 14.9996 19.133 14.8481 19.1878C14.6966 19.2426 14.5296 19.235 14.3837 19.1666L7.39203 15.8906C7.31974 15.8568 7.25481 15.8091 7.20097 15.7502C7.14714 15.6913 7.10545 15.6224 7.0783 15.5473C7.05115 15.4723 7.03907 15.3927 7.04275 15.3129C7.04642 15.2332 7.06579 15.155 7.09974 15.0828L10.3758 8.09115C10.4442 7.94528 10.5677 7.83253 10.7192 7.77772C10.8706 7.7229 11.0377 7.73051 11.1836 7.79886C11.3294 7.86721 11.4422 7.99071 11.497 8.14219C11.5518 8.29367 11.5442 8.46072 11.4759 8.60659L8.82035 14.2718Z" fill="white"/>
                              </svg>`;
          this.right_arrow = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 25 26" fill="none">
                                <path d="M16.9753 14.2718L6.37327 10.4353C6.22198 10.3805 6.05514 10.3881 5.90945 10.4564C5.76376 10.5246 5.65116 10.648 5.59641 10.7993C5.54167 10.9506 5.54926 11.1174 5.61753 11.2631C5.68579 11.4088 5.80913 11.5214 5.96042 11.5761L16.5625 15.4127L10.8965 18.0666C10.7506 18.135 10.6379 18.2585 10.5831 18.41C10.5283 18.5614 10.5359 18.7285 10.6042 18.8744C10.6726 19.0202 10.7961 19.133 10.9475 19.1878C11.099 19.2426 11.2661 19.235 11.4119 19.1666L18.4036 15.8906C18.4759 15.8568 18.5408 15.8091 18.5947 15.7502C18.6485 15.6913 18.6902 15.6224 18.7174 15.5473C18.7445 15.4723 18.7566 15.3927 18.7529 15.3129C18.7492 15.2332 18.7299 15.155 18.6959 15.0828L15.4198 8.09115C15.3515 7.94528 15.228 7.83253 15.0765 7.77772C14.925 7.7229 14.758 7.73051 14.6121 7.79886C14.4662 7.86721 14.3535 7.99071 14.2987 8.14219C14.2438 8.29367 14.2515 8.46072 14.3198 8.60659L16.9753 14.2718Z" fill="white"/>
                              </svg>`;
          this.validateMarkup();
          if (this.markupIsValid) {
            this.renderSlider();
            this.setCurrentSlide();
            this.bindEvents();
            if (this.settings.autoRotate) {
              this.startAutoRotate();
            }
          }
          console.log("Rotating Slider initialized", this);
        },
        bindEvents: function () {
          if (this.settings.draggable) {
            this.$slidesContainer.on(
              "mousedown touchstart",
              this.handleDragStart.bind(this)
            );
            this.$slidesContainer.on(
              "mousemove touchmove",
              this.handleDragMove.bind(this)
            );
            this.$slidesContainer.on(
              "mouseup mouseleave touchend",
              this.handleDragEnd.bind(this)
            );
          }
          if (this.settings.directionControls) {
            this.$slider
              .find("ul.direction-controls .left-arrow button")
              .click(this.handleLeftDirectionClick.bind(this));
            this.$slider
              .find("ul.direction-controls .right-arrow button")
              .click(this.handleRightDirectionClick.bind(this));
          }
        },
        handleDragStart: function (e) {
          this.readyToDrag = !0;
          this.dragStartPoint =
            e.type === "mousedown" ? e.pageX : e.originalEvent.touches[0].pageX;
        },
        handleDragMove: function (e) {
          if (this.readyToDrag) {
            var pageX =
              e.type === "mousemove"
                ? e.pageX
                : e.originalEvent.touches[0].pageX;
            if (
              this.currentlyDragging === !1 &&
              this.currentlyRotating === !1 &&
              (this.dragStartPoint - pageX > 10 ||
                this.dragStartPoint - pageX < -10)
            ) {
              this.stopAutoRotate();
              if (this.settings.directionControls) {
                this.$directionControls.css("pointer-events", "none");
              }
              window.getSelection().removeAllRanges();
              this.currentlyDragging = !0;
              this.dragStartAngle = this.currentRotationAngle;
            }
            if (this.currentlyDragging) {
              this.currentRotationAngle =
                this.dragStartAngle -
                ((this.dragStartPoint - pageX) / this.settings.slideWidth) *
                  this.slideAngle;
              this.$slidesContainer.css(
                "transform",
                "translateX(-50%) rotate(" + this.currentRotationAngle + "deg)"
              );
            }
          }
        },
        handleDragEnd: function (e) {
          this.readyToDrag = !1;
          if (this.currentlyDragging) {
            this.currentlyDragging = !1;
            this.currentRotationAngle =
              Math.round(this.currentRotationAngle / this.slideAngle) *
              this.slideAngle;
            this.rotate();
            if (this.settings.directionControls) {
              this.$directionControls.css("pointer-events", "");
            }
          }
        },
        handleLeftDirectionClick: function (e) {
          e.preventDefault();
          this.stopAutoRotate();
          this.directionAction = "clockwise";
          this.rotateClockwise();
        },
        handleRightDirectionClick: function (e) {
          e.preventDefault();
          this.stopAutoRotate();
          this.directionAction = "counter-clockwise";
          this.rotateCounterClockwise();
        },
        renderSlider: function () {
          console.log("rendering Slider", this);
          var halfAngleRadian = ((this.slideAngle / 2) * Math.PI) / 180;
          console.log("halfAngleRadian", halfAngleRadian);
          var activeSlideWidth = this.settings.slideWidth;
          var innerRadius =
            ((1 / Math.tan(halfAngleRadian)) * activeSlideWidth) / 2;
          var outerRadius = Math.sqrt(
            Math.pow(innerRadius + this.settings.slideHeight, 2) +
              Math.pow(activeSlideWidth / 2, 2)
          );
          var upperArcHeight =
            outerRadius - (innerRadius + this.settings.slideHeight);
          var lowerArcHeight =
            innerRadius - innerRadius * Math.cos(halfAngleRadian);
          this.$slider.css("height", this.settings.slideHeight + "px");
          this.$slider.css("width", 100 + "%");
          this.$slidesContainer.css("height", outerRadius * 2 + "px");
          this.$slidesContainer.css("width", outerRadius * 2 + "px");
          this.$slidesContainer.css(
            "transform",
            "translateX(-50%) rotate(" + this.currentRotationAngle + "deg)"
          );
          this.$slidesContainer.css("top", "-" + upperArcHeight + "px");
          this.$slides.each(
            function (i, el) {
              var $slide = $(el);
              const transformOrigin =
                "center " + (innerRadius + this.settings.slideHeight) + "px";
              const top = upperArcHeight + "px";
              let transform;
              if (i === this.middleSlideIndex) {
                transform =
                  "translateX(-50%) rotate(" +
                  this.slideAngle * i +
                  "deg) translateY(0)";
              } else {
                transform =
                  "translateX(-50%) rotate(" +
                  this.slideAngle * i +
                  "deg) translateY(180px)";
              }
              $slide.css("width", this.settings.slideWidth + "px");
              $slide.css("transform-origin", transformOrigin);
              $slide.css("top", top);
              $slide.css("transform", transform);
            }.bind(this)
          );

          if (this.settings.directionControls) {
            var directionArrowsHTML = '<ul class="direction-controls">';
            directionArrowsHTML +=
              '<li class="left-arrow"><button>' +
              this.left_arrow +
              "</button></li>";
            directionArrowsHTML +=
              '<li class="right-arrow"><button>' +
              this.right_arrow +
              "</button></li>";
            directionArrowsHTML += "</ul>";
            this.$slider.append(directionArrowsHTML);
            this.$directionControls = this.$slider.find(
              "ul.direction-controls"
            );
          }
        },
        rotateClockwise: function () {
          this.currentRotationAngle =
            this.currentRotationAngle + this.slideAngle;
          this.rotate();
        },
        rotateCounterClockwise: function () {
          this.currentRotationAngle =
            this.currentRotationAngle - this.slideAngle;
          this.rotate();
        },
        rotate: function () {
          this.beforeRotationStart();

          const previousCurrentSlide = this.$currentSlide;
          const previousCurrentSlideIndex = previousCurrentSlide.index();
          previousCurrentSlide.css(
            "transform",
            "translateX(-50%) rotate(" +
              this.slideAngle * previousCurrentSlideIndex +
              "deg) translateY(180px)"
          );

          this.currentlyRotating = !0;
          this.$slider.addClass("currently-rotating");
          this.setCurrentSlide();
          if (this.rotateTimeoutId) {
            clearTimeout(this.rotateTimeoutId);
            this.rotateTimeoutId = !1;
          }
          this.$slidesContainer.css(
            "transition",
            "transform " + this.settings.rotationSpeed / 1000 + "s ease-in-out"
          );
          this.$slidesContainer.css(
            "transform",
            "translateX(-50%) rotate(" + this.currentRotationAngle + "deg)"
          );
          this.afterRotationStart();

          this.rotateTimeoutId = setTimeout(
            function () {
              this.beforeRotationEnd();
              this.currentlyRotating = !1;
              this.$slider.removeClass("currently-rotating");
              this.$slidesContainer.css("transition", "none");
              if (
                this.currentRotationAngle >= 360 ||
                this.currentRotationAngle <= -360
              ) {
                this.currentRotationAngle =
                  this.currentRotationAngle >= 360
                    ? this.currentRotationAngle - 360
                    : this.currentRotationAngle + 360;
                this.$slidesContainer.css(
                  "transform",
                  "translateX(-50%) rotate(" +
                    this.currentRotationAngle +
                    "deg)"
                );
              }
              this.afterRotationEnd();
            }.bind(this),
            this.settings.rotationSpeed
          );
          const currentSlide = this.$currentSlide;
          const currentSlideIndex = currentSlide.index();
          const totalSlides = this.$slides.length;

          if (
            previousCurrentSlideIndex === totalSlides - 2 &&
            this.directionAction === "counter-clockwise"
          ) {
            console.log("last slide reached");
            this.$directionControls
              .find(".right-arrow")
              .css("pointer-events", "none");
            currentSlide.css(
              "transform",
              "translateX(-50%) rotate(" +
                this.slideAngle * currentSlideIndex +
                "deg) translateY(0px)"
            );
          } else if (
            previousCurrentSlideIndex === 1 &&
            this.directionAction === "clockwise"
          ) {
            console.log("first slide reached");
            this.$directionControls
              .find(".left-arrow")
              .css("pointer-events", "none");
            currentSlide.css(
              "transform",
              "translateX(-50%) rotate(" +
                this.slideAngle * currentSlideIndex +
                "deg) translateY(0px)"
            );
          } else {
            this.$directionControls
              .find(".left-arrow")
              .css("pointer-events", "");
            this.$directionControls
              .find(".right-arrow")
              .css("pointer-events", "");
            currentSlide.css(
              "transform",
              "translateX(-50%) rotate(" +
                this.slideAngle * currentSlideIndex +
                "deg) translateY(0px)"
            );
          }
        },
        setCurrentSlide: function () {
          var currAngle = this.currentRotationAngle;
          if (
            this.currentRotationAngle >= 360 ||
            this.currentRotationAngle <= -360
          ) {
            currAngle = currAngle >= 360 ? currAngle - 360 : currAngle + 360;
          }
          this.$currentSlide = this.$slides.eq(-currAngle / this.slideAngle);
          this.$nextSlide = this.$currentSlide.is(":last-child")
            ? this.$slides.first()
            : this.$currentSlide.next();
          this.$previousSlide = this.$currentSlide.is(":first-child")
            ? this.$slides.last()
            : this.$currentSlide.prev();
          this.$slides.removeClass("active-slide");
          this.$slides.removeClass("next-slide");
          this.$slides.removeClass("previous-slide");
          this.$currentSlide.addClass("active-slide");
          this.$nextSlide.addClass("next-slide");
          this.$previousSlide.addClass("previous-slide");
          const currentSlideTransform = this.$currentSlide.css("transform");
        },
        startAutoRotate: function () {
          this.autoRotateIntervalId = setInterval(
            function () {
              this.rotateCounterClockwise();
            }.bind(this),
            this.settings.autoRotateInterval
          );
        },
        stopAutoRotate: function () {
          if (this.autoRotateIntervalId) {
            clearInterval(this.autoRotateIntervalId);
            this.autoRotateIntervalId = !1;
          }
        },
        validateMarkup: function () {
          if (
            this.$slider.hasClass("rotating-slider") &&
            this.$slidesContainer.length === 1 &&
            this.$slides.length >= 2
          ) {
            this.markupIsValid = !0;
          } else {
            this.$slider.css("display", "none");
            console.log("Markup for Rotating Slider is invalid.");
          }
        },
        beforeRotationStart: function () {
          this.settings.beforeRotationStart();
        },
        afterRotationStart: function () {
          this.settings.afterRotationStart();
        },
        beforeRotationEnd: function () {
          this.settings.beforeRotationEnd();
        },
        afterRotationEnd: function () {
          this.settings.afterRotationEnd();
        },
      };
      return this.each(function () {
        rotatingSlider.init(this);
      });
    };
  })($);

  $(function () {
    $(".rotating-slider").rotatingSlider({
      slideHeight: 600,
      slideWidth: Math.min(350, window.innerWidth - 100),
      autoRotate: false,
      draggable: false,
      afterRotationStart: function () {
        console.log(
          "Rotating to slide " +
            ($(".rotating-slider .active-slide").index() + 1)
        );
      },
      afterRotationEnd: function () {
        console.log("slider rotated", this);
      },
    });
  });
});
