/**
 * MSSV: BIT240023
 * Project: BIT240023_FoodManager
 * Initial Seed Data:
 * - At least 3 categories (BIT240023_DishCategory)
 * - At least 5 dishes (BIT240023_Dish) with multiple images & thumbnail flags
 */

import { BIT240023_Dish, BIT240023_DishCategory } from '../types';

export const INITIAL_CATEGORIES: BIT240023_DishCategory[] = [
  {
    BIT240023_Id: 'CAT_01',
    BIT240023_Name: 'Appetizers & Starters (Khai vị)',
    BIT240023_Description: 'Fresh rolls, crispy appetizers and light beginnings',
  },
  {
    BIT240023_Id: 'CAT_02',
    BIT240023_Name: 'Main Courses (Món chính)',
    BIT240023_Description: 'Traditional noodles, rice dishes, and signature bowls',
  },
  {
    BIT240023_Id: 'CAT_03',
    BIT240023_Name: 'Desserts & Drinks (Tráng miệng & Đồ uống)',
    BIT240023_Description: 'Vietnamese traditional sweet soups, coffee and refreshers',
  },
  {
    BIT240023_Id: 'CAT_04',
    BIT240023_Name: 'Specialties (Món đặc sắc)',
    BIT240023_Description: 'Chef signature specials and seasonal culinary dishes',
  },
];

export const INITIAL_DISHES: BIT240023_Dish[] = [
  {
    BIT240023_Id: 'DISH_01',
    BIT240023_Name: 'Fresh Spring Rolls (Gỏi Cuốn Tôm Thịt)',
    BIT240023_Price: 45000,
    BIT240023_PreparationTime: 10, // <= 15 -> Quick
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Fresh rice paper rolls with prawns, tender pork belly, fresh herbs and peanut hoisin dipping sauce.',
    BIT240023_DishCategoryId: 'CAT_01',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1594041680534-e8c8cdebd659?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_02',
    BIT240023_Name: 'Crispy Fried Spring Rolls (Nem Rán Giòn)',
    BIT240023_Price: 50000,
    BIT240023_PreparationTime: 15, // <= 15 -> Quick
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Golden crispy fried rolls stuffed with minced pork, wood-ear mushroom, vermicelli, and sweet-sour garlic chili dip.',
    BIT240023_DishCategoryId: 'CAT_01',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_03',
    BIT240023_Name: 'Hanoi Beef Pho (Phở Bò Tái Nạm)',
    BIT240023_Price: 75000,
    BIT240023_PreparationTime: 25, // > 15 -> Regular
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Signature Hanoi style beef noodle soup simmered with bone marrow, star anise, cinnamon, served with fresh herbs.',
    BIT240023_DishCategoryId: 'CAT_02',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1631709497146-a239ef373cf1?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_04',
    BIT240023_Name: 'Grilled Pork Rice Noodles (Bún Chả Hà Nội)',
    BIT240023_Price: 65000,
    BIT240023_PreparationTime: 12, // <= 15 -> Quick
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Charcoal grilled pork patties and marinated sliced pork in seasoned fish sauce broth, served with fresh vermicelli and greens.',
    BIT240023_DishCategoryId: 'CAT_02',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_05',
    BIT240023_Name: 'Special Vietnamese Sandwich (Bánh Mì Đặc Biệt)',
    BIT240023_Price: 40000,
    BIT240023_PreparationTime: 8, // <= 15 -> Quick
    BIT240023_IsAvailable: false, // Stopped selling for filter testing
    BIT240023_Description: 'Crispy baguette layered with chicken liver pate, Vietnamese ham, roasted pork, pickled daikon, carrots and fresh cilantro.',
    BIT240023_DishCategoryId: 'CAT_02',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: false,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_06',
    BIT240023_Name: 'Hanoi Egg Coffee (Cà Phê Trứng)',
    BIT240023_Price: 45000,
    BIT240023_PreparationTime: 10, // <= 15 -> Quick
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Robust Robusta drip coffee topped with creamy whipped egg yolk, condensed milk, and honey custard.',
    BIT240023_DishCategoryId: 'CAT_03',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
    ],
  },
  {
    BIT240023_Id: 'DISH_07',
    BIT240023_Name: 'Lotus Seed & Longan Sweet Soup (Chè Hạt Sen Long Nhãn)',
    BIT240023_Price: 35000,
    BIT240023_PreparationTime: 20, // > 15 -> Regular
    BIT240023_IsAvailable: true,
    BIT240023_Description: 'Fragrant sweet soup made with soft Hue lotus seeds wrapped inside sweet longan pulp and rock sugar broth.',
    BIT240023_DishCategoryId: 'CAT_03',
    BIT240023_DishImage: [
      {
        BIT240023_ImageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
        BIT240023_IsThumbnail: true,
      },
    ],
  },
];
