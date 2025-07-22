var MenuFilter = {
  state: {
    activeCategory: 'all',
    activeSubcategory: null,
    currentXHR: null
  },

  init: function() {
    this.bindEvents();
    this.loadProducts('all');
  },

  bindEvents: function() {
    var self = this;
    var mainCategories = document.querySelector('.sb-main-categories');
    var subCategories = document.querySelector('.sb-sub-categories');

    if (mainCategories) {
      mainCategories.onclick = function(e) {
        var link = e.target.closest('.sb-filter-link');
        if (link) {
          e.preventDefault();
          var category = link.getAttribute('data-filter');
          self.setActiveCategory(category);
          self.loadProducts(category);
        }
      };
    }
  },

  loadProducts: function(category) {
    var self = this;
    
    if (this.state.currentXHR && this.state.currentXHR.readyState !== 4) {
      this.state.currentXHR.abort();
    }

    this.showLoading();

    var xhr = new XMLHttpRequest();
    this.state.currentXHR = xhr;

    xhr.open('POST', '/api/getProductsByCategory', true);
    xhr.setRequestHeader('Content-Type', 'application/json');

    var data = {
      category: category === '*' ? 'all' : category.replace('.', ''),
      subcategory: this.state.activeSubcategory
    };

    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        self.hideLoading();
        
        if (xhr.status === 200) {
          try {
            var response = JSON.parse(xhr.responseText || '{"products":[]}');
            if (response.products && response.products.length) {
              self.renderProducts(response.products.map(function(product) {
                return product.processProduct ? product.processProduct(product) : product;
              }));
            } else {
              self.showNoResults();
            }
          } catch(e) {
            self.showError();
          }
        } else {
          self.showError();
        }
      }
    };

    xhr.send(JSON.stringify(data));
  }

  renderProducts: function(products) {
    var container = document.querySelector('.sb-masonry-grid');
    if (!container) return;

    // 清空现有内容，保留 grid-sizer
    var sizer = container.querySelector('.sb-grid-sizer');
    container.innerHTML = '';
    if (sizer) container.appendChild(sizer);

    products.forEach(function(product) {
      var html = this.getProductHTML(product);
      var div = document.createElement('div');
      div.innerHTML = html;
      container.appendChild(div.firstChild);
    }.bind(this));
  },

  getProductHTML: function(product) {
    return '\
      <div class="sb-grid-item sb-item-33 ' + (product.categories || []).map(function(cat) { return cat._id; }).join(' ') + '">\
        <a data-fancybox="menu" href="' + (product.imgs && product.imgs[0] || '') + '" class="sb-menu-item sb-mb-30">\
          <div class="sb-cover-frame">\
            <img src="' + (product.imgs && product.imgs[0] || '') + '" alt="' + product.name + '">\
            ' + this.getBadgeHTML(product) + '\
          </div>\
          <div class="sb-card-tp">\
            <h4 class="sb-card-title">' + product.name + '</h4>\
            <div class="sb-price"><sub>¥</sub> ' + (product.startingPrice || 0) + '</div>\
          </div>\
          <div class="sb-description">\
            <p class="sb-text sb-mb-15">' + this.getProductDetails(product) + '</p>\
            ' + this.getProductMeta(product) + '\
          </div>\
        </a>\
      </div>';
  },
  getBadgeHTML: function(product) {
    var badges = [];
    
    // 添加认证标签
    if (product.certifications && product.certifications.length) {
      badges.push('<div class="sb-badge sb-certified"><i class="fas fa-check-circle"></i> 认证产品</div>');
    }
    
    // 添加培训标签
    if (product.trainingProvided) {
      badges.push('<div class="sb-badge sb-training"><i class="fas fa-graduation-cap"></i> 提供培训</div>');
    }

    return badges.join('');
  },
  getProductDetails: function(product) {
    var details = [];
    
    // 添加主要特点
    if (product.therapeuticEffects && product.therapeuticEffects.length) {
      details = details.concat(product.therapeuticEffects.slice(0, 3));
    }
    
    // 添加适用症状
    if (product.symptoms && product.symptoms.length) {
      details = details.concat(product.symptoms.slice(0, 2));
    }

    return details.map(function(detail) {
      return '<span>' + detail + '</span>';
    }).join(', ');
  },
  getProductMeta: function(product) {
    var meta = [];
    
    // 添加品牌信息
    if (product.brand) {
      meta.push('<div class="sb-meta-item"><i class="fas fa-industry"></i> ' + product.brand + '</div>');
    }
    
    // 添加型号信息
    if (product.modelNumber) {
      meta.push('<div class="sb-meta-item"><i class="fas fa-barcode"></i> ' + product.modelNumber + '</div>');
    }

    // 添加保修信息
    if (product.warranty) {
      meta.push('<div class="sb-meta-item"><i class="fas fa-shield-alt"></i> ' + product.warranty + '</div>');
    }

    return '<div class="sb-product-meta">' + meta.join('') + '</div>';
  },

  getIngredientsHTML: function(ingredients) {
    return ingredients.map(function(ing) {
      return '<span>' + ing + '</span>';
    }).join(', ');
  },

  getRatingHTML: function(rating) {
    if (!rating) {
      return '<ul class="sb-stars sb-unrated">\
        <li><i class="fas fa-star"></i></li>\
        <li><i class="fas fa-star"></i></li>\
        <li><i class="fas fa-star"></i></li>\
        <li><i class="fas fa-star"></i></li>\
        <li><i class="fas fa-star"></i></li>\
        <li><span>Unrated</span></li>\
      </ul>';
    }

    var stars = '';
    for (var i = 0; i < 5; i++) {
      stars += '<li><i class="fas fa-star"></i></li>';
    }
    return '<ul class="sb-stars">' + stars + '<li><span>(' + rating + ' ratings)</span></li></ul>';
  },

  showLoading: function() {
    var container = document.querySelector('.sb-masonry-grid');
    if (container) {
      container.classList.add('sb-loading');
    }
  },

  hideLoading: function() {
    var container = document.querySelector('.sb-masonry-grid');
    if (container) {
      container.classList.remove('sb-loading');
    }
  },

  showError: function() {
    var container = document.querySelector('.sb-masonry-grid');
    if (container) {
      container.innerHTML = '<div class="sb-error">加载失败，请稍后重试</div>';
    }
  },

  showNoResults: function() {
    var container = document.querySelector('.sb-masonry-grid');
    if (container) {
      container.innerHTML = '<div class="sb-no-results">暂无相关产品</div>';
    }
  },

  setActiveCategory: function(category) {
    this.state.activeCategory = category;
    this.updateActiveStates();
  }
};

// 初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', function() {
    MenuFilter.init();
  });
} else {
  MenuFilter.init();
}