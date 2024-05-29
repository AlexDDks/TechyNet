const swiper = new Swiper('.swiper', {
    // Optional parameters
    loop: true,
    autoplay: {
        delay: 7000, // 7 seconds delay
        disableOnInteraction: false,
    },

    // If we need pagination
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    // Events to control video playback
    on: {
        init: function () {
            handleSlideChange(this);
        },
        slideChange: function () {
            handleSlideChange(this);
        }
    }
});

function handleSlideChange(swiper) {
    // Pause and reset all videos
    swiper.slides.forEach(function (slide) {
        const video = slide.querySelector('video');
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.removeEventListener('ended', onVideoEnded); // Remove previous event listener
        }
    });

    // Handle active slide video
    const activeSlide = swiper.slides[swiper.activeIndex];
    const activeVideo = activeSlide.querySelector('video');
    if (activeVideo) {
        swiper.autoplay.stop(); // Stop autoplay while video is playing
        activeVideo.play();
        activeVideo.addEventListener('ended', onVideoEnded);
    } else {
        swiper.autoplay.start(); // Ensure autoplay starts if there's no video
    }
}

function onVideoEnded() {
    swiper.params.autoplay.delay = 100; // Set delay to a very short period
    swiper.autoplay.start(); // Start autoplay to move to the next slide immediately
    setTimeout(() => {
        swiper.params.autoplay.delay = 7000; // Restore the original delay
    }, 200); // Restore the delay after 200ms to ensure smooth transition
}

// Ensure the video starts playing when the Swiper is initialized
document.addEventListener('DOMContentLoaded', function () {
    const activeSlide = document.querySelector('.swiper-slide-active');
    const activeVideo = activeSlide.querySelector('video');
    if (activeVideo) {
        activeVideo.play();
        activeVideo.addEventListener('ended', onVideoEnded);
        swiper.autoplay.stop(); // Stop autoplay while video is playing
    }
});
