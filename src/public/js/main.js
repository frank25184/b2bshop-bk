// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initialize all components
  initializeMenuHandlers();
  initializeFAQ();
  //initializeIsotope();
 // initializeClickEffect();
 // initializeQuantityHandlers();
 //initializeContactForm();
  initializeSliders();
});

// Menu Handlers
function initializeMenuHandlers() {
  // Menu button click handler
  const menuBtn = document.querySelector('.sb-menu-btn');
  const infoBtn = document.querySelector('.sb-info-btn');
  const cartBtn = document.querySelector('.sb-btn-cart');

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      menuBtn.classList.toggle('sb-active');
      document.querySelector('.sb-navigation')?.classList.toggle('sb-active');
      removeActiveClass('.sb-info-btn, .sb-info-bar, .sb-minicart');
    });
  }

  if (infoBtn) {
    infoBtn.addEventListener('click', () => {
      infoBtn.classList.toggle('sb-active');
      document.querySelector('.sb-info-bar')?.classList.toggle('sb-active');
      removeActiveClass('.sb-menu-btn, .sb-navigation, .sb-minicart');
    });
  }

  if (cartBtn) {
    cartBtn.addEventListener('click', () => {
      document.querySelector('.sb-minicart')?.classList.toggle('sb-active');
      removeActiveClass('.sb-info-btn, .sb-info-bar, .sb-navigation, .sb-menu-btn');
    });
  }

  // Scroll handler
  window.addEventListener('scroll', () => {
    const scroll = window.pageYOffset || document.documentElement.scrollTop;
    const topBar = document.querySelector('.sb-top-bar-frame');
    const infoElements = document.querySelectorAll('.sb-info-bar, .sb-minicart');
    
    if (scroll >= 10) {
      topBar?.classList.add('sb-scroll');
      infoElements.forEach(el => el.classList.add('sb-scroll'));
    } else {
      topBar?.classList.remove('sb-scroll');
      infoElements.forEach(el => el.classList.remove('sb-scroll'));
    }
  });

  // Document click handler for closing menus
  document.addEventListener('click', (e) => {
    const menuElements = '.sb-minicart, .sb-btn-cart, .sb-menu-btn, .sb-navigation, .sb-info-btn, .sb-info-bar';
    if (!e.target.closest(menuElements)) {
      document.querySelectorAll(menuElements).forEach(el => {
        el.classList.remove('sb-active');
      });
    }
  });

  // Mobile menu handler
  function updateMobileLinks() {
    if (window.innerWidth < 992) {
      document.querySelectorAll('.sb-has-children > a').forEach(link => {
        link.setAttribute('href', '#.');
      });
    }
  }

  updateMobileLinks();
  window.addEventListener('resize', updateMobileLinks);
}

// FAQ Handlers
function initializeFAQ() {
  document.querySelectorAll('.sb-faq li .sb-question').forEach(question => {
    question.addEventListener('click', () => {
      question.querySelector('.sb-plus-minus-toggle')?.classList.toggle('sb-collapsed');
      question.parentElement?.classList.toggle('sb-active');
    });
  });
}

// Isotope Handlers
function initializeIsotope() {
  document.querySelectorAll('.sb-filter a').forEach(filter => {
    filter.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('.sb-filter .sb-active')?.classList.remove('sb-active');
      filter.classList.add('sb-active');
      
      const selector = filter.dataset.filter;
      if (window.Isotope) {
        const grid = document.querySelector('.sb-masonry-grid');
        const iso = new Isotope(grid, {
          itemSelector: '.sb-grid-item',
          percentPosition: true,
          masonry: {
            columnWidth: '.sb-grid-sizer'
          }
        });
        iso.arrange({ filter: selector });
      }
    });
  });
}

// Click Effect
// function initializeClickEffect() {
//   const cursor = document.querySelector('.sb-click-effect');
//   if (cursor) {
//     document.addEventListener('mousemove', (e) => {
//       cursor.style.top = `${e.pageY - 15}px`;
//       cursor.style.left = `${e.pageX - 15}px`;
//     });

//     document.addEventListener('click', () => {
//       cursor.classList.add('sb-click');
//       setTimeout(() => cursor.classList.remove('sb-click'), 600);
//     });
//   }
// }

// Quantity Handlers
// function initializeQuantityHandlers() {
//   document.querySelectorAll('.sb-add').forEach(btn => {
//     btn.addEventListener('click', () => {
//       const input = btn.previousElementSibling;
//       if (input && input.value < 10) {
//         input.value = +input.value + 1;
//       }
//     });
//   });

//   document.querySelectorAll('.sb-sub').forEach(btn => {
//     btn.addEventListener('click', () => {
//       const input = btn.nextElementSibling;
//       if (input && input.value > 1) {
//         input.value = +input.value - 1;
//       }
//     });
//   });
// }

// Contact Form Handler
function initializeContactForm(id, postUrl) {
  var form = document.getElementById(id);
  if (!form) return;

  form.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevent default form submission
      
      var submitBtn = form.querySelector('[type="submit"]');
      if (!submitBtn) return;

      var originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';

      // Create XHR object for older browsers
      var xhr = new XMLHttpRequest();
      var formData = new FormData(form);
      
      xhr.open('POST', postUrl, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      
      xhr.onreadystatechange = function() {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                  // Show success message
                  var successElement = document.querySelector('.sb-success-result');
                  if (successElement) {
                      var textElement = successElement.querySelector('.sb-text');
                      if (textElement) {
                          textElement.textContent = JSON.parse(xhr.responseText).message;
                      }
                      successElement.classList.add('sb-active');
                      // Hide success message after 5 seconds
                      setTimeout(function() {
                          successElement.classList.remove('sb-active');
                      }, 5000);
                  }
                  form.reset(); // Reset form fields
              } else {
                  // Handle error
                  var errorElement = document.querySelector('.sb-error-result');
                  if (errorElement) {
                      var textElement = errorElement.querySelector('.sb-text');
                      if (textElement) {
                          textElement.textContent = 'Failed to send message. Please try again later.';
                      }
                      errorElement.classList.add('sb-active');
                      setTimeout(function() {
                          errorElement.classList.remove('sb-active');
                      }, 5000);
                  }
              }
          }
      };
      
      xhr.onerror = function() {
          // Reset button state
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Show error message
          var errorElement = document.querySelector('.sb-error-result');
          if (errorElement) {
              var textElement = errorElement.querySelector('.sb-text');
              if (textElement) {
                  textElement.textContent = 'Network error. Please try again later.';
              }
              errorElement.classList.add('sb-active');
              setTimeout(function() {
                  errorElement.classList.remove('sb-active');
              }, 5000);
          }
      };
      
      xhr.send(JSON.stringify(Object.fromEntries(formData)));
  });
}
// function initializeContactForm(id, postUrl) {

//   //logger.info('JSON.stringify(formDataObject): ' + JSON.stringify(formDataObject));
//   form.addEventListener('submit', function(e) {
//     var form = document.getElementById(id);
//     if (!form) {
//       console.log('Form with id ' + id + ' not found');
//       return;
//     };
//     var formDataObject = {};
//     if (form) {
//         var elements = form.elements;
//         for (var i = 0; i < elements.length; i++) {
//             var element = elements[i];
//             alert(JSON.stringify(element));
//             if (element.name) {
//                 formDataObject[element.name] = element.value;
//             }
//         }
//     }
//     e.preventDefault();
    
//     // Show loading state
//     var submitBtn = form.querySelector('button[type="submit"]');
//     var originalBtnText = submitBtn.innerHTML;
//     submitBtn.disabled = true;
//     submitBtn.innerHTML = 'Sending...';

//     // Create XHR object for older browsers
//     var xhr = new XMLHttpRequest();
//     var formData = new FormData(form);
    
//     xhr.open('POST', postUrl, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');
//     xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    
//     xhr.onreadystatechange = function() {
//         // Reset button state
//         submitBtn.disabled = false;
//         submitBtn.innerHTML = originalBtnText;
        
//         if (xhr.readyState === 4) {
//           if (xhr.status === 200) {
//             // Show success message
//             var successElement = document.querySelector('.sb-success-result');
//             if (successElement) {
//               var textElement = successElement.querySelector('.sb-text');
//               if (textElement) {
//                 textElement.textContent = JSON.parse(xhr.responseText).message;
//               }
//               successElement.classList.add('sb-active');
//               // Hide success message after 5 seconds
//               //
              
//               setTimeout(function() {
//                 successElement.classList.remove('sb-active');
//               }, 5000);
//             }
//             form.reset(); // Reset form fields
//           }
//         }
//     };
    
//     xhr.onerror = function() {
//       // Reset button state
//       submitBtn.disabled = false;
//       submitBtn.innerHTML = originalBtnText;
      
//       console.error('Form submission error');
//       alert('There was an error submitting the form. Please check your connection and try again.');
//     };
    
//     xhr.send(JSON.stringify(formData));
//   });
// }

// Slider Initialization
function initializeSliders() {
  if (window.Swiper) {
    const swiperConfigs = {
      '.sb-short-menu-slider-3i': { slidesPerView: 3 },
      '.sb-short-menu-slider-2-3i': { slidesPerView: 3 },
      '.sb-short-menu-slider-4i': { slidesPerView: 4 },
      '.sb-short-menu-slider-2-4i': { slidesPerView: 4 },
      '.sb-reviews-slider': { slidesPerView: 2 },
      '.sb-blog-slider-2i': { slidesPerView: 2 },
      '.sb-blog-slider-3i': { slidesPerView: 3 }
    };

    Object.entries(swiperConfigs).forEach(([selector, config]) => {
      new Swiper(selector, {
        ...config,
        spaceBetween: 30,
        parallax: true,
        speed: 1000,
        navigation: {
          prevEl: '.sb-short-menu-prev',
          nextEl: '.sb-short-menu-next',
        },
        breakpoints: {
          992: { slidesPerView: 2 },
          768: { slidesPerView: 1 }
        }
      });
    });
  }
}

// Utility function to remove active class from elements
function removeActiveClass(selectors) {
  document.querySelectorAll(selectors).forEach(el => {
    el.classList.remove('sb-active');
  });
}
