"use strict";
const  User = require('../models/User'),
       AlternativeTo = require('../models/AlternativeTo'),
       SiteStageCategory = require('../models/SiteStageCategory'),
       SiteStageSubcategory = require('../models/SiteStageSubcategory'),
       SiteCategory = require('../models/SiteCategory'),
       SiteSubcategory = require('../models/SiteSubcategory'),
       siteProxy =  require('../db_proxy/site'),
       Site = require('../models/Site'),
       currentNewsProxy = require('../db_proxy/currentNews'),
      logger = require('../libs/logger'),
      utils = require('../libs/utility');


module.exports = {
  getProductsByCategory: async (req,res) => {
    try {
      let user = req.user;
      let isAdmin = false;
      if(user){
          user = user.processUser(user);
          isAdmin = user.admin;
      }

      let { category, subcategory } = req.body;
      console.log(`category, subcategory: ${category}, ${subcategory}; req.body : ${JSON.stringify(req.body)}`);
      
      let query = { hidden: false };
      
      // 处理分类查询
      if (category && category !== 'all') {
        // 如果只有主分类
        if (!subcategory) {
          query.categories = category;
        } 
        // 如果主分类和子分类都存在
        else {
          query = {
            ...query,
            $and: [
              { categories: category },
              { subcategories: subcategory }
            ]
          };
        }
      }

      const page = req.query.page || 1;
      const limit = 10; // 每页显示数量
      const skip = (page - 1) * limit;
      
      const sort = { created_at: -1 };

      // 查询产品并填充分类信息
      const products = await Product
        .find(query)
        .populate('categories')
        .populate('subcategories')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      // 获取总数用于分页
      const total = await Product.countDocuments(query);

      // 处理返回数据
      const data = {
        products: products.map(product => ({
          ...product,
          categories: product.categories.map(cat => cat.name),
          subcategories: product.subcategories.map(subcat => subcat.name)
        })),
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: page * limit < total
        }
      };

      res.json(data);

    } catch (error) {
      console.error('获取产品列表错误:', error);
      res.status(500).json({ error: '服务器内部错误' });
    }

  },

    getTen: async (req,res) => {
      let user = req.user;
      let isAdmin = false;
      if(user){
          user = user.processUser(user);
          isAdmin = user.admin;
      }
      
      const page = req.query.page || 1; // 如果没有提供页码，默认为第一页
      const query = {}; // 您的查询条件
      const sort = { createdAt: -1 }; // 假设您想按创建时间降序排序
      
      try {
      // 调用 getTenAsync 函数获取文章数据
      const data = await getTenAsync(query, sort, page);
      res.json(data); // 将数据以 JSON 格式发送回客户端
      } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
      }
      }

}

