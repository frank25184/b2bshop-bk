const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const Product = require('../models/Product');
require('../libs/mongoose-connect');

const generateFakeProduct = () => {
  const hasVariants = faker.datatype.boolean();
  const pricing = [];
  const variantsCount = hasVariants ? faker.number.int({ min: 2, max: 5 }) : 1;
  
  for (let i = 0; i < variantsCount; i++) {
    pricing.push({
      dimensions: {
        length: faker.number.int({ min: 10, max: 100 }),
        width: faker.number.int({ min: 10, max: 100 }),
        height: faker.number.int({ min: 10, max: 100 })
      },
      price: faker.number.int({ min: 100, max: 10000 }),
      stock: faker.number.int({ min: 0, max: 1000 }),
      sku: faker.string.alphanumeric(8).toUpperCase(),
      weight: faker.number.float({ min: 0.1, max: 20, precision: 0.1 })
    });
  }

  const prices = pricing.map(p => p.price);
  
  return {
    user_id: new mongoose.Types.ObjectId().toString(),
    author: new mongoose.Types.ObjectId(),
    name: faker.commerce.productName(),
    name_changed: faker.commerce.productName(),
    categories: [new mongoose.Types.ObjectId()],
    subcategories: [new mongoose.Types.ObjectId()],
    availability: faker.helpers.arrayElement(['In Stock', 'Pre-order', 'Out of Stock']),
    imgs: Array(faker.number.int({ min: 1, max: 5 }))
      .fill()
      .map(() => faker.image.url()),
    startingPrice: faker.number.int({ min: 100, max: 5000 }),
    pricing,
    priceRange: {
      min: Math.min(...prices),
      max: Math.max(...prices),
      hasVariants
    },
    brand: faker.company.name(),
    content: faker.commerce.productDescription(),
    intro: faker.commerce.productDescription(),
    logo: faker.image.url(),
    pv: faker.number.int({ min: 0, max: 10000 }),
    hidden: faker.datatype.boolean(),
    great: faker.datatype.boolean(),
    
    // Medical device specific fields
    registrationNumber: `MDR${faker.string.alphanumeric(6)}`,
    standardNumber: `ISO/${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    modelNumber: faker.string.alphanumeric(8).toUpperCase(),
    manufacturer: faker.company.name(),
    manufacturingLocation: `${faker.location.city()}`,
    qualityCertifications: Array(faker.number.int({ min: 1, max: 3 }))
      .fill()
      .map(() => faker.helpers.arrayElement(['ISO13485', 'CE', 'FDA', 'GMP'])),
    
    technicalParameters: {
      voltage: '220V/50Hz',
      power: `${faker.number.int({ min: 100, max: 1000 })}W`,
      size: `${faker.number.int({ min: 30, max: 100 })}*${faker.number.int({ min: 30, max: 100 })}*${faker.number.int({ min: 30, max: 100 })}cm`
    },
    powerConsumption: `${faker.number.int({ min: 100, max: 1000 })}W`,
    color: faker.helpers.arrayElements(['White', 'Black', 'Silver', 'Gold'], faker.number.int({ min: 1, max: 4 })),
    
    usageEnvironment: faker.helpers.arrayElement(['Hospital', 'Clinic', 'Rehabilitation Center', 'Home']),
    targetUsers: faker.helpers.arrayElements(['Adults', 'Elderly', 'Children', 'Pregnant Women'], faker.number.int({ min: 1, max: 3 })),
    therapyMethods: faker.helpers.arrayElements(['Heat Therapy', 'Electrotherapy', 'Magnetic Therapy', 'Light Therapy'], faker.number.int({ min: 1, max: 3 })),
    treatmentDuration: `${faker.number.int({ min: 10, max: 60 })} minutes`,
    
    therapeuticEffects: faker.helpers.arrayElements(['Pain Relief', 'Improved Circulation', 'Recovery Promotion', 'Fatigue Relief'], faker.number.int({ min: 2, max: 4 })),
    applicableDiseases: faker.helpers.arrayElements(['Arthritis', 'Muscle Pain', 'Sports Injury', 'Chronic Pain'], faker.number.int({ min: 2, max: 4 })),
    symptoms: faker.helpers.arrayElements(['Pain', 'Swelling', 'Stiffness', 'Numbness'], faker.number.int({ min: 2, max: 4 })),
    contraindications: faker.helpers.arrayElements(['Heart Patients', 'Pregnant Women', 'Metal Implants', 'Acute Inflammation'], faker.number.int({ min: 1, max: 3 })),
    
    warranty: `${faker.number.int({ min: 1, max: 3 })} Year Warranty`,
    valueAddedServices: faker.helpers.arrayElements(['Free Installation', 'Technical Training', 'Maintenance', 'Extended Warranty'], faker.number.int({ min: 2, max: 4 })),
    technicalSupport: '24/7 Technical Support',
    trainingProvided: faker.datatype.boolean(),
    
    safetyStandards: faker.helpers.arrayElements(['GB9706.1', 'IEC60601', 'ISO14971'], faker.number.int({ min: 1, max: 3 })),
    regulatoryCompliance: faker.helpers.arrayElements(['NMPA', 'CE', 'FDA'], faker.number.int({ min: 1, max: 3 })),
    certifications: faker.helpers.arrayElements(['Medical Device Registration', 'ISO13485 Certification', 'CE Certification'], faker.number.int({ min: 1, max: 3 })),
    
    seoTitle: faker.commerce.productName(),
    seoKeyword: faker.helpers.arrayElements(['Medical Device', 'Rehabilitation Equipment', 'Therapy Device', 'Medical Equipment'], 3).join(','),
    seoDescription: faker.commerce.productDescription()
  };
};

const seedProducts = async (count = 20) => {
  try {
    // 生成新数据
    const fakeProducts = Array(count)
      .fill()
      .map(() => generateFakeProduct());
    
    // 清除现有数据
    await Product.deleteMany({});
    
    // 插入数据
    await Product.insertMany(fakeProducts);
    
    console.log(`Successfully seeded ${count} products`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

// 执行数据填充
seedProducts();